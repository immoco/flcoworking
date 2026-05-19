import express from 'express';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']));

router.get('/dashboard', async (req, res, next) => {
  try {
    const totalBookings = await prisma.booking.count();
    const revenueThisMonth = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED', payment_date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    });
    const activeSpaces = await prisma.space.count({ where: { is_active: true } });
    const pendingVerifications = await prisma.document.count({ where: { verified: false } });
    return res.json({ totalBookings, revenueThisMonth: revenueThisMonth._sum.amount || 0, activeSpaces, pendingVerifications });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.branch_id) where.branchId = String(req.query.branch_id);
    if (req.query.booking_type) where.booking_type = String(req.query.booking_type);
    if (req.query.start && req.query.end) {
      const start = new Date(String(req.query.start));
      const end = new Date(String(req.query.end));
      where.AND = [{ start_date: { gte: start } }, { end_date: { lte: end } }];
    }
    const bookings = await prisma.booking.findMany({ where, include: { user: true, space: true, branch: true } });
    return res.json(bookings);
  } catch (error) {
    next(error);
  }
});

router.get('/customers', async (req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { bookings: true },
    });
    const result = customers.map((customer) => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      bookingCount: customer.bookings.length,
      balance: customer.bookings.reduce((sum, booking) => sum + (booking.balance_amount || 0), 0),
    }));
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({ where: { status: 'COMPLETED' }, include: { booking: { include: { space: true, branch: true } } } });
    const monthly = {};
    const byType = {};
    const byBranch = {};
    payments.forEach((payment) => {
      const month = payment.payment_date.toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + payment.amount;
      const type = payment.booking.space?.type || 'UNKNOWN';
      byType[type] = (byType[type] || 0) + payment.amount;
      const branch = payment.booking.branch?.name || 'Unknown Branch';
      byBranch[branch] = (byBranch[branch] || 0) + payment.amount;
    });
    return res.json({ monthly, byType, byBranch });
  } catch (error) {
    next(error);
  }
});

export default router;
