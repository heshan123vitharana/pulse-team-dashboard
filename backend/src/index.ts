import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';

import prisma from './lib/prisma';
import { wsManager } from './lib/ws';

import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import reportsRouter from './routes/reports';
import chatRouter from './routes/chat';
import sprintsRouter from './routes/sprints';
import tasksRouter from './routes/tasks';

const app = express();
const server = http.createServer(app);

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',
  'https://cyphlab.vercel.app',
  process.env.FRONTEND_URL  // Production frontend URL (set in .env)
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // Instead of throwing an error that becomes a 500, we pass false to reject CORS gracefully
      callback(null, false);
    },
    credentials: true
  })
);

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // required for OAuth2 form-encoded login

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/sprints', sprintsRouter);
app.use('/api/v1/tasks', tasksRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', app: 'Pulse Team Dashboard API', version: '1.0.0' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ detail: 'Internal server error' });
});

// ─── WebSocket Setup ─────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890';
const wss = new WebSocketServer({ server, path: '/api/v1/notifications/ws' });

wss.on('connection', async (ws, req) => {
  try {
    const parsedUrl = url.parse(req.url!, true);
    const token = parsedUrl.query.token as string;

    if (!token) {
      ws.close(1008, 'Missing token');
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { email: payload.sub } });

    if (!user) {
      ws.close(1008, 'User not found');
      return;
    }

    const userId = user.id;
    wsManager.connect(ws, userId);
    console.log(`WebSocket connected: user ${userId}`);

    ws.on('message', (_message) => {
      // keep-alive ping — no action needed
    });

    ws.on('close', () => {
      wsManager.disconnect(ws, userId);
      console.log(`WebSocket disconnected: user ${userId}`);
    });
  } catch (err) {
    console.error('WebSocket auth error:', err);
    ws.close(1008, 'Invalid token');
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8000', 10);
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`🔗 WebSocket on ws://localhost:${PORT}/api/v1/notifications/ws`);
});

export default app;
