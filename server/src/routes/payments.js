import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateBody from '../middleware/validateBody.js';
import { htmlToPdfBuffer } from '../lib/pdf.js';

const router = express.Router();

const createPaymentSchema = z.object({
  booking_id: z.string().min(1),
  amount: z.number().positive(),
  payment_mode: z.enum(['CASH', 'NEFT', 'UPI', 'CHEQUE', 'CARD']),
  transaction_reference: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional().default('COMPLETED'),
  receipt_number: z.string().optional(),
  notes: z.string().optional(),
});

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']), validateBody(createPaymentSchema), async (req, res, next) => {
  try {
    const data = req.validatedBody;
    const booking = await prisma.booking.findUnique({ where: { id: data.booking_id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const receipt = data.receipt_number || `RCPT-${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        bookingId: data.booking_id,
        userId: booking.userId,
        amount: data.amount,
        payment_mode: data.payment_mode,
        transaction_reference: data.transaction_reference,
        status: data.status,
        receipt_number: receipt,
        notes: data.notes,
      },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paid_amount: (booking.paid_amount || 0) + data.amount,
        balance_amount: (booking.balance_amount || 0) - data.amount,
      },
    });
    return res.status(201).json(payment);
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
    const payments = await prisma.payment.findMany({ where: { bookingId: req.params.booking_id } });
    return res.json(payments);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/receipt', authenticate, async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id }, include: { booking: true } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (req.user.role === 'CUSTOMER' && payment.booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const html = `
      <html>
        <body>
          <h1>Payment Receipt</h1>
          <p>Receipt: ${payment.receipt_number}</p>
          <p>Amount: ${payment.amount}</p>
          <p>Mode: ${payment.payment_mode}</p>
          <p>Status: ${payment.status}</p>
          <p>Date: ${payment.payment_date.toISOString().split('T')[0]}</p>
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
