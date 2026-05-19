import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateBody from '../middleware/validateBody.js';

const router = express.Router();

const createSpaceSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['VIRTUAL_OFFICE', 'COWORKING_HOT_DESK', 'DEDICATED_DESK', 'PRIVATE_CABIN', 'MEETING_ROOM']),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  area_sqft: z.number().positive().optional(),
  price_per_month: z.number().positive().optional(),
  price_per_day: z.number().positive().optional(),
  price_per_hour: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  is_active: z.boolean().optional(),
});
const updateSpaceSchema = createSpaceSchema.partial();

function parseDate(date) {
  return date ? new Date(String(date)) : undefined;
}

router.get('/', async (req, res, next) => {
  try {
    const filters = { is_active: true };
    if (req.query.branch_id) filters.branchId = String(req.query.branch_id);
    if (req.query.type) filters.type = String(req.query.type);
    if (req.query.price_min || req.query.price_max) {
      const priceMin = req.query.price_min ? Number(req.query.price_min) : undefined;
      const priceMax = req.query.price_max ? Number(req.query.price_max) : undefined;
      const or = [];
      const month = {};
      const day = {};
      const hour = {};
      if (priceMin !== undefined) {
        month.price_per_month = { gte: priceMin };
        day.price_per_day = { gte: priceMin };
        hour.price_per_hour = { gte: priceMin };
      }
      if (priceMax !== undefined) {
        month.price_per_month = { ...month.price_per_month, lte: priceMax };
        day.price_per_day = { ...day.price_per_day, lte: priceMax };
        hour.price_per_hour = { ...hour.price_per_hour, lte: priceMax };
      }
      if (Object.keys(month).length) or.push(month);
      if (Object.keys(day).length) or.push(day);
      if (Object.keys(hour).length) or.push(hour);
      if (or.length) filters.OR = or;
    }
    const start = parseDate(req.query.start);
    const end = parseDate(req.query.end);
    let spaces = await prisma.space.findMany({ where: filters });
    if (start && end) {
      const bookings = await prisma.booking.findMany({
        where: {
          spaceId: { in: spaces.map((space) => space.id) },
          status: { not: 'CANCELLED' },
          AND: [{ start_date: { lte: end } }, { end_date: { gte: start } }],
        },
      });
      const blocked = new Set(bookings.map((b) => b.spaceId));
      spaces = spaces.filter((space) => !blocked.has(space.id));
    }
    return res.json(spaces);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const space = await prisma.space.findUnique({ where: { id: req.params.id }, include: { bookings: true } });
    if (!space) return res.status(404).json({ error: 'Space not found' });
    const bookedDates = space.bookings.map((booking) => ({ start: booking.start_date, end: booking.end_date, status: booking.status }));
    return res.json({ ...space, availability: bookedDates });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']), validateBody(createSpaceSchema), async (req, res, next) => {
  try {
    const space = await prisma.space.create({ data: req.validatedBody });
    return res.status(201).json(space);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']), validateBody(updateSpaceSchema), async (req, res, next) => {
  try {
    const space = await prisma.space.update({ where: { id: req.params.id }, data: req.validatedBody });
    return res.json(space);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/availability', async (req, res, next) => {
  try {
    const start = parseDate(req.query.start);
    const end = parseDate(req.query.end);
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters are required' });
    }
    const bookings = await prisma.booking.findMany({
      where: {
        spaceId: req.params.id,
        status: { not: 'CANCELLED' },
        AND: [{ start_date: { lte: end } }, { end_date: { gte: start } }],
      },
    });
    return res.json(bookings.map((booking) => ({ start: booking.start_date, end: booking.end_date, status: booking.status })));
  } catch (error) {
    next(error);
  }
});

export default router;
