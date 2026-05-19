import express from 'express';
import path from 'path';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { htmlToPdfFile } from '../lib/pdf.js';

const router = express.Router();
const uploadDir = path.resolve('./uploads');

const requestSchema = z.object({
  booking_id: z.string().min(1),
  company_name: z.string().optional(),
  director_name: z.string().optional(),
  director_din: z.string().optional(),
  purpose: z.string().optional(),
});

router.post('/request', authenticate, async (req, res, next) => {
  try {
    const data = requestSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({ where: { id: data.booking_id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const request = await prisma.nOCRequest.create({
      data: {
        bookingId: data.booking_id,
        company_name: data.company_name,
        director_name: data.director_name,
        director_din: data.director_din,
        purpose: data.purpose,
      },
    });
    return res.status(201).json(request);
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
    const request = await prisma.nOCRequest.findFirst({ where: { bookingId: req.params.booking_id } });
    return res.json(request || {});
  } catch (error) {
    next(error);
  }
});

router.post('/:id/generate', authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']), async (req, res, next) => {
  try {
    const request = await prisma.nOCRequest.findUnique({ where: { id: req.params.id }, include: { booking: true } });
    if (!request) return res.status(404).json({ error: 'NOC request not found' });
    const html = `<html><body><h1>NOC Document</h1><p>Company: ${request.company_name || ''}</p><p>Director: ${request.director_name || ''}</p><p>DIN: ${request.director_din || ''}</p><p>Purpose: ${request.purpose || ''}</p></body></html>`;
    const filename = `noc-${request.id}.pdf`;
    const outgoing = path.join(uploadDir, filename);
    await htmlToPdfFile(html, outgoing);
    const updated = await prisma.nOCRequest.update({ where: { id: request.id }, data: { generated_pdf_url: `/uploads/${filename}`, status: 'GENERATED' } });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/download', authenticate, async (req, res, next) => {
  try {
    const request = await prisma.nOCRequest.findUnique({ where: { id: req.params.id } });
    if (!request || !request.generated_pdf_url) return res.status(404).json({ error: 'PDF not available' });
    const filePath = path.resolve(`.${request.generated_pdf_url}`);
    return res.download(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;
