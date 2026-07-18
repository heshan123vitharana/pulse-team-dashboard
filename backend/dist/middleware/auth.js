"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProjectManager = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_FOR_SISENCO_ASSIGNMENT_1234567890';
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ detail: 'Not authenticated' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { email: payload.sub },
            include: { role: true }
        });
        if (!user) {
            res.status(401).json({ detail: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).json({ detail: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const requireAdmin = async (req, res, next) => {
    if (!req.user || req.user.role.role_name !== 'Administrator') {
        res.status(403).json({ detail: 'Administrator access required' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireProjectManager = async (req, res, next) => {
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
exports.requireProjectManager = requireProjectManager;
//# sourceMappingURL=auth.js.map