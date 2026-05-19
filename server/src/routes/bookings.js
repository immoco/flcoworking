import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateBody from '../middleware/validateBody.js';
import { sendMail } from '../utils/email.js';
import { htmlToPdfBuffer } from '../lib/pdf.js';

const router = express.Router();

const createBookingSchema = z.object({
  spaceId: z.string().min(1),
  booking_type: z.enum(['VIRTUAL_OFFICE', 'COWORKING', 'MEETING_ROOM']),
  plan_type: z.enum(['HOURLY', 'DAILY', 'MONTHLY', 'ANNUAL']),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  total_amount: z.number().positive().optional(),
  purpose_of_use: z.string().optional(),
  company_name_for_noc: z.string().optional(),
  director_name: z.string().optional(),
  director_din: z.string().optional(),
});

const statusSchema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'EXPIRED', 'CANCELLED']) });

function parseDate(value) {
  return value ? new Date(value) : undefined;
}

async function generateBookingNumber() {
  const count = await prisma.booking.count();
  const year = new Date().getFullYear();
  return `FLS-${year}-${String(count + 1).padStart(5, '0')}`;
}

async function spaceHasConflict(spaceId, startDate, endDate) {
  if (!startDate || !endDate) return false;
  const conflict = await prisma.booking.findFirst({
    where: {
      spaceId,
      status: { not: 'CANCELLED' },
      AND: [{ start_date: { lte: endDate } }, { end_date: { gte: startDate } }],
    },
  });
  return !!conflict;
}

router.post('/', authenticate, validateBody(createBookingSchema), async (req, res, next) => {
  try {
    if (req.user.role !== 'CUSTOMER') return res.status(403).json({ error: 'Only customers can create bookings' });
    const data = req.validatedBody;
    const start = parseDate(data.start_date);
    const end = parseDate(data.end_date);
    if (!start || !end) return res.status(400).json({ error: 'start_date and end_date are required' });
    if (start > end) return res.status(400).json({ error: 'Invalid date range' });
    const conflict = await spaceHasConflict(data.spaceId, start, end);
    if (conflict) return res.status(409).json({ error: 'Space is already booked for this time period' });
    const booking_number = await generateBookingNumber();
    const booking = await prisma.booking.create({
      data: {
        booking_number,
        userId: req.user.id,
        spaceId: data.spaceId,
        branchId: (await prisma.space.findUnique({ where: { id: data.spaceId } })).branchId,
        booking_type: data.booking_type,
        plan_type: data.plan_type,
        start_date: start,
        end_date: end,
        status: 'PENDING',
        total_amount: data.total_amount,
        paid_amount: 0,
        balance_amount: data.total_amount || 0,
        purpose_of_use: data.purpose_of_use,
        company_name_for_noc: data.company_name_for_noc,
        director_name: data.director_name,
        director_din: data.director_din,
      },
    });
    try {
      await sendMail({
        to: req.user.email,
        subject: 'Booking confirmed',
        html: `<p>Your booking ${booking.booking_number} is created.</p>`,
      });
    } catch (mailError) {
      console.warn('Email send failed', mailError);
    }
    return res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role === 'CUSTOMER') {
      filters.userId = req.user.id;
    } else {
      if (req.query.branch_id) filters.branchId = String(req.query.branch_id);
      if (req.query.status) filters.status = String(req.query.status);
      if (req.query.booking_type) filters.booking_type = String(req.query.booking_type);
      if (req.query.start && req.query.end) {
        const start = new Date(String(req.query.start));
        const end = new Date(String(req.query.end));
        filters.AND = [{ start_date: { gte: start } }, { end_date: { lte: end } }];
      }
    }
    const bookings = await prisma.booking.findMany({ where: filters, include: { space: true, branch: true } });
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { space: true, branch: true, payments: true, documents: true, noc_requests: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']), validateBody(statusSchema), async (req, res, next) => {
  try {
    const booking = await prisma.booking.update({ where: { id: req.params.id }, data: { status: req.validatedBody.status } });
    return res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!booking.start_date) return res.status(400).json({ error: 'Booking start date is required for cancellation' });
    const now = new Date();
    const noticeDeadline = new Date(booking.start_date);
    noticeDeadline.setMonth(noticeDeadline.getMonth() - 2);
    if (now > noticeDeadline) {
      return res.status(400).json({ error: 'Cancellations require at least 2 months notice' });
    }
    const cancelled = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
    return res.json(cancelled);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/agreement-pdf', authenticate, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { user: true, space: true, branch: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user.role === 'CUSTOMER' && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const html = `
      <html>
        <body>
          <h1>Rent Agreement</h1>
          <p>Booking Number: ${booking.booking_number}</p>
          <p>Customer: ${booking.user.name || booking.user.email}</p>
          <p>Space: ${booking.space.name}</p>
          <p>Branch: ${booking.branch.name}</p>
          <p>Start: ${booking.start_date?.toISOString().split('T')[0]}</p>
          <p>End: ${booking.end_date?.toISOString().split('T')[0]}</p>
          <p>Total: ${booking.total_amount || 0}</p>
        </body>
      </html>`;
    const buffer = await htmlToPdfBuffer(html);
    res.type('application/pdf');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
});

export default router;
