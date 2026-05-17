import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

const createAccessToken = (user) =>
  jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
const createRefreshToken = (user) =>
  jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'User creation failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  res.cookie('jid', refreshToken, { httpOnly: true, path: '/api/auth/refresh' });
  res.json({ accessToken });
});

router.post('/refresh', (req, res) => {
  const token = req.cookies && req.cookies.jid;
  if (!token) return res.status(401).json({ ok: false });
  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ userId: payload.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ ok: false });
  }
});

export default router;
