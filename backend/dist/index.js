"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const url_1 = __importDefault(require("url"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const ws_2 = require("./lib/ws");
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const reports_1 = __importDefault(require("./routes/reports"));
const chat_1 = __importDefault(require("./routes/chat"));
const sprints_1 = __importDefault(require("./routes/sprints"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000',
    process.env.FRONTEND_URL // Production frontend URL (set in .env)
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., curl, mobile apps, Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true
}));
// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // required for OAuth2 form-encoded login
// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/projects', projects_1.default);
app.use('/api/v1/reports', reports_1.default);
app.use('/api/v1/chat', chat_1.default);
app.use('/api/v1/sprints', sprints_1.default);
app.use('/api/v1/tasks', tasks_1.default);
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ status: 'ok', app: 'Pulse Team Dashboard API', version: '1.0.0' });
});
// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ detail: 'Internal server error' });
});
// ─── WebSocket Setup ─────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890';
const wss = new ws_1.WebSocketServer({ server, path: '/api/v1/notifications/ws' });
wss.on('connection', async (ws, req) => {
    try {
        const parsedUrl = url_1.default.parse(req.url, true);
        const token = parsedUrl.query.token;
        if (!token) {
            ws.close(1008, 'Missing token');
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({ where: { email: payload.sub } });
        if (!user) {
            ws.close(1008, 'User not found');
            return;
        }
        const userId = user.id;
        ws_2.wsManager.connect(ws, userId);
        console.log(`WebSocket connected: user ${userId}`);
        ws.on('message', (_message) => {
            // keep-alive ping — no action needed
        });
        ws.on('close', () => {
            ws_2.wsManager.disconnect(ws, userId);
            console.log(`WebSocket disconnected: user ${userId}`);
        });
    }
    catch (err) {
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
exports.default = app;
//# sourceMappingURL=index.js.map