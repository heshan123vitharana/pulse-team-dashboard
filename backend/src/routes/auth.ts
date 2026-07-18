import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890';

/** Strip password_hash before sending user objects to the client */
function safeUser(user: any) {
  const { password_hash, ...rest } = user;
  return rest;
}

// GET /api/v1/auth/roles — public, used by register form
router.get('/roles', async (_req: Request, res: Response): Promise<void> => {
  const roles = await prisma.role.findMany();
  res.json(roles);
});

// GET /api/v1/auth/users — Admin only
router.get('/users', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({ include: { role: true } });
  res.json(users.map(safeUser));
});

// POST /api/v1/auth/register — Admin only
router.post('/register', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role_id } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ detail: 'Email already registered' });
    return;
  }

  const role = await prisma.role.findUnique({ where: { id: role_id } });
  if (!role) {
    res.status(400).json({ detail: 'Invalid role ID provided' });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password_hash, role_id }
  });
  res.status(201).json(safeUser(user));
});

// GET /api/v1/auth/me — current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(safeUser(req.user));
});

// PUT /api/v1/auth/me — update current user's name/email
router.put('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email } = req.body;
  const current_user = req.user;

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== current_user.id) {
      res.status(400).json({ detail: 'Email already registered' });
      return;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: current_user.id },
    data: {
      name: name ?? current_user.name,
      email: email ?? current_user.email
    }
  });

  res.json(safeUser(updatedUser));
});

// POST /api/v1/auth/login
// Frontend sends application/x-www-form-urlencoded with `username` + `password`
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(422).json({ detail: 'username and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: username },
    include: { role: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ detail: 'Incorrect email or password' });
    return;
  }

  const role_name = user.role.role_name;
  const access_token = jwt.sign(
    { sub: user.email, role: role_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ access_token, token_type: 'bearer', role: role_name });
});

export default router;
