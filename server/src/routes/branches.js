import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import validateBody from '../middleware/validateBody.js';

const router = express.Router();

const branchCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(3),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  google_maps_url: z.string().url().optional(),
});

const branchUpdateSchema = branchCreateSchema.partial();

router.get('/', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.city) filters.city = String(req.query.city);
    if (req.query.state) filters.state = String(req.query.state);
    const branches = await prisma.branch.findMany({ where: filters });
    return res.json(branches);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize(['SUPER_ADMIN']), validateBody(branchCreateSchema), async (req, res, next) => {
  try {
    const branch = await prisma.branch.create({ data: req.validatedBody });
    return res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize(['SUPER_ADMIN']), validateBody(branchUpdateSchema), async (req, res, next) => {
  try {
    const branch = await prisma.branch.update({ where: { id: req.params.id }, data: req.validatedBody });
    return res.json(branch);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), async (req, res, next) => {
  try {
    const branch = await prisma.branch.update({ where: { id: req.params.id }, data: { is_active: false } });
    return res.json(branch);
  } catch (error) {
    next(error);
  }
});

export default router;
