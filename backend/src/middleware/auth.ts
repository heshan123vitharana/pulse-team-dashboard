import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ detail: 'Not authenticated' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
    const user = await prisma.user.findUnique({
      where: { email: payload.sub },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({ detail: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ detail: 'Invalid token' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || req.user.role.role_name !== 'Administrator') {
    res.status(403).json({ detail: 'Administrator access required' });
    return;
  }
  next();
};

export const requireProjectManager = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(403).json({ detail: 'Not authenticated' });
    return;
  }

  const role = req.user.role.role_name;
  if (role !== 'Administrator' && role !== 'Project Manager') {
    res.status(403).json({ detail: 'Project Manager access required' });
    return;
  }
  next();
};
