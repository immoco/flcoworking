import express from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateBody from '../middleware/validateBody.js';

const router = express.Router();
const uploadDir = path.resolve('./uploads');

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await import('fs').then(({ promises: fs }) => fs.mkdir(uploadDir, { recursive: true }));
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only pdf, jpg, and png files are allowed')); 
    }
    cb(null, true);
  },
});

const uploadSchema = z.object({
  booking_id: z.string().min(1),
  doc_type: z.enum(['AADHAR', 'PAN', 'GST_CERTIFICATE', 'COMPANY_PAN', 'MOA', 'AOA', 'BOARD_RESOLUTION', 'NOC_ISSUED', 'RENT_AGREEMENT', 'OTHER']),
});

router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const body = uploadSchema.parse(req.body);
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const booking = await prisma.booking.findUnique({ where: { id: body.booking_id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const document = await prisma.document.create({
      data: {
        bookingId: body.booking_id,
        userId: req.user.id,
        doc_type: body.doc_type,
        file_url: `/uploads/${req.file.filename}`,
        file_name: req.file.originalname,
      },
    });
    return res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

router.get('/booking/:booking_id', authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.booking_id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const documents = await prisma.document.findMany({ where: { bookingId: req.params.booking_id } });
    return res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/verify', authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']), async (req, res, next) => {
  try {
    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        verified: true,
        verified_by: req.user.id,
        verified_at: new Date(),
      },
    });
    return res.json(document);
  } catch (error) {
    next(error);
  }
});

export default router;
