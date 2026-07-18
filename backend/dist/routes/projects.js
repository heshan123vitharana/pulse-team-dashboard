"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const ws_1 = require("../lib/ws");
const router = (0, express_1.Router)();
/** Returns true if the user is a privileged role (Admin or Project Manager) */
function isPrivilegedUser(req) {
    const roleName = req.user?.role?.role_name ?? '';
    return roleName === 'Administrator' || roleName === 'Project Manager';
}
function parseId(param) {
    return parseInt(Array.isArray(param) ? param[0] : (param ?? ''), 10);
}
// GET /api/v1/projects/ — list projects (all for privileged, own for members)
router.get('/', auth_1.authenticate, async (req, res) => {
    if (isPrivilegedUser(req)) {
        const projects = await prisma_1.default.project.findMany({ include: { users: true } });
        res.json(projects);
    }
    else {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { projects: { include: { users: true } } }
        });
        res.json(user?.projects || []);
    }
});
// POST /api/v1/projects/ — create project (Project Manager+)
router.post('/', auth_1.authenticate, auth_1.requireProjectManager, async (req, res) => {
    const { project_name, description } = req.body;
    if (!project_name) {
        res.status(400).json({ detail: 'project_name is required' });
        return;
    }
    const project = await prisma_1.default.project.create({
        data: { project_name, description }
    });
    res.status(201).json(project);
});
// GET /api/v1/projects/:project_id — get single project
router.get('/:project_id', auth_1.authenticate, async (req, res) => {
    const project_id = parseId(req.params.project_id);
    if (isNaN(project_id)) {
        res.status(400).json({ detail: 'Invalid project ID' });
        return;
    }
    const project = await prisma_1.default.project.findUnique({ where: { id: project_id } });
    if (!project) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    res.json(project);
});
// PUT /api/v1/projects/:project_id — update project (Project Manager+)
router.put('/:project_id', auth_1.authenticate, auth_1.requireProjectManager, async (req, res) => {
    const project_id = parseId(req.params.project_id);
    const existing = await prisma_1.default.project.findUnique({ where: { id: project_id } });
    if (!existing) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    const { project_name, description } = req.body;
    const project = await prisma_1.default.project.update({
        where: { id: project_id },
        data: { project_name, description }
    });
    res.json(project);
});
// DELETE /api/v1/projects/:project_id — delete project (Project Manager+)
router.delete('/:project_id', auth_1.authenticate, auth_1.requireProjectManager, async (req, res) => {
    const project_id = parseId(req.params.project_id);
    const existing = await prisma_1.default.project.findUnique({ where: { id: project_id } });
    if (!existing) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    await prisma_1.default.project.delete({ where: { id: project_id } });
    res.status(204).send();
});
// POST /api/v1/projects/:project_id/assign/:user_id — assign user to project
router.post('/:project_id/assign/:user_id', auth_1.authenticate, auth_1.requireProjectManager, async (req, res) => {
    const project_id = parseId(req.params.project_id);
    const user_id = parseId(req.params.user_id);
    const project = await prisma_1.default.project.findUnique({ where: { id: project_id } });
    if (!project) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: user_id } });
    if (!user) {
        res.status(404).json({ detail: 'User not found' });
        return;
    }
    await prisma_1.default.project.update({
        where: { id: project_id },
        data: { users: { connect: { id: user_id } } }
    });
    ws_1.wsManager.sendPersonalMessage({
        type: 'PROJECT_ASSIGNED',
        message: `You were assigned to project: ${project.project_name}`,
        project_id: project.id,
        project_name: project.project_name
    }, user_id);
    res.json({ message: 'User assigned to project' });
});
// DELETE /api/v1/projects/:project_id/assign/:user_id — remove user from project
router.delete('/:project_id/assign/:user_id', auth_1.authenticate, auth_1.requireProjectManager, async (req, res) => {
    const project_id = parseId(req.params.project_id);
    const user_id = parseId(req.params.user_id);
    const project = await prisma_1.default.project.findUnique({ where: { id: project_id } });
    if (!project) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: user_id } });
    if (!user) {
        res.status(404).json({ detail: 'User not found' });
        return;
    }
    await prisma_1.default.project.update({
        where: { id: project_id },
        data: { users: { disconnect: { id: user_id } } }
    });
    ws_1.wsManager.sendPersonalMessage({
        type: 'PROJECT_UNASSIGNED',
        message: `You were removed from project: ${project.project_name}`,
        project_id: project.id,
        project_name: project.project_name
    }, user_id);
    res.json({ message: 'User removed from project' });
});
exports.default = router;
//# sourceMappingURL=projects.js.map