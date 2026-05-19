import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { sendMail } from '../utils/email.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  gst_number: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

const createAccessToken = (user) =>
  jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
const createRefreshToken = (user) =>
  jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
const createResetToken = (userId) =>
  jwt.sign({ userId }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '1h' });

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password,
        name: data.name,
        phone: data.phone,
        company_name: data.company_name,
        gst_number: data.gst_number,
        role: 'CUSTOMER',
        is_verified: false,
      },
    });
    return res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    res.cookie('jid', refreshToken, { httpOnly: true, path: '/api/auth/refresh' });
    return res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', (req, res) => {
  try {
    const token = req.cookies?.jid;
    if (!token) return res.status(401).json({ error: 'Refresh token missing' });
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ userId: payload.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('jid', { path: '/api/auth/refresh' });
  return res.json({ ok: true });
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ ok: true });
    const token = createResetToken(user.id);
    const resetUrl = `${process.env.FRONTEND_URL || 'https://example.com'}/reset-password/${token}`;
    await sendMail({
      to: user.email,
      subject: 'Password reset request',
      html: `<p>Reset your password by visiting <a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    return res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const payload = jwt.verify(req.params.token, process.env.RESET_PASSWORD_SECRET);
    const password = await bcrypt.hash(data.password, 10);
    await prisma.user.update({ where: { id: payload.userId }, data: { password } });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
});

export default router;
