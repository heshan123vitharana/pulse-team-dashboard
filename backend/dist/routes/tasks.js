"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/** Returns true if the user is a privileged role (Admin or Project Manager) */
function isPrivilegedUser(req) {
    const roleName = req.user?.role?.role_name ?? '';
    return roleName === 'Administrator' || roleName === 'Project Manager';
}
function parseId(param) {
    return parseInt(Array.isArray(param) ? param[0] : (param ?? ''), 10);
}
// NOTE: Specific path routes must come before parameterized routes to avoid conflicts.
// GET /api/v1/tasks/sprint/:sprint_id — tasks for a sprint
router.get('/sprint/:sprint_id', auth_1.authenticate, async (req, res) => {
    const sprint_id = parseId(req.params.sprint_id);
    if (isNaN(sprint_id)) {
        res.status(400).json({ detail: 'Invalid sprint ID' });
        return;
    }
    const sprint = await prisma_1.default.sprint.findUnique({
        where: { id: sprint_id },
        include: { project: { include: { users: true } } }
    });
    if (!sprint) {
        res.status(404).json({ detail: 'Sprint not found' });
        return;
    }
    const privileged = isPrivilegedUser(req);
    const isMember = sprint.project.users.some(u => u.id === req.user.id);
    if (!privileged && !isMember) {
        res.status(403).json({ detail: 'Not authorized to view tasks for this sprint' });
        return;
    }
    const tasks = await prisma_1.default.task.findMany({
        where: { sprint_id },
        include: {
            comments: { include: { author: true } },
            subtasks: true
        }
    });
    res.json(tasks);
});
// GET /api/v1/tasks/backlog/:project_id — backlog tasks (no sprint)
router.get('/backlog/:project_id', auth_1.authenticate, async (req, res) => {
    const project_id = parseId(req.params.project_id);
    if (isNaN(project_id)) {
        res.status(400).json({ detail: 'Invalid project ID' });
        return;
    }
    const project = await prisma_1.default.project.findUnique({
        where: { id: project_id },
        include: { users: true }
    });
    if (!project) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    const privileged = isPrivilegedUser(req);
    const isMember = project.users.some(u => u.id === req.user.id);
    if (!privileged && !isMember) {
        res.status(403).json({ detail: 'Not authorized to view tasks for this project' });
        return;
    }
    const tasks = await prisma_1.default.task.findMany({
        where: { project_id, sprint_id: null },
        include: {
            comments: { include: { author: true } },
            subtasks: true
        }
    });
    res.json(tasks);
});
// PUT /api/v1/tasks/subtasks/:subtask_id — update subtask
router.put('/subtasks/:subtask_id', auth_1.authenticate, async (req, res) => {
    const subtask_id = parseId(req.params.subtask_id);
    if (isNaN(subtask_id)) {
        res.status(400).json({ detail: 'Invalid subtask ID' });
        return;
    }
    const subtask = await prisma_1.default.subtask.findUnique({ where: { id: subtask_id } });
    if (!subtask) {
        res.status(404).json({ detail: 'Subtask not found' });
        return;
    }
    const updatedSubtask = await prisma_1.default.subtask.update({
        where: { id: subtask_id },
        data: req.body
    });
    res.json(updatedSubtask);
});
// DELETE /api/v1/tasks/subtasks/:subtask_id — delete subtask
router.delete('/subtasks/:subtask_id', auth_1.authenticate, async (req, res) => {
    const subtask_id = parseId(req.params.subtask_id);
    if (isNaN(subtask_id)) {
        res.status(400).json({ detail: 'Invalid subtask ID' });
        return;
    }
    const subtask = await prisma_1.default.subtask.findUnique({ where: { id: subtask_id } });
    if (!subtask) {
        res.status(404).json({ detail: 'Subtask not found' });
        return;
    }
    await prisma_1.default.subtask.delete({ where: { id: subtask_id } });
    res.status(204).send();
});
// POST /api/v1/tasks/ — create task
router.post('/', auth_1.authenticate, async (req, res) => {
    const { title, description, status, project_id, sprint_id, assignee_id, story_points, attachment_url } = req.body;
    if (!title || !project_id) {
        res.status(400).json({ detail: 'title and project_id are required' });
        return;
    }
    const project = await prisma_1.default.project.findUnique({
        where: { id: project_id },
        include: { users: true }
    });
    if (!project) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    const privileged = isPrivilegedUser(req);
    const isMember = project.users.some(u => u.id === req.user.id);
    if (!privileged && !isMember) {
        res.status(403).json({ detail: 'Not authorized to create tasks for this project' });
        return;
    }
    const new_task = await prisma_1.default.task.create({
        data: { title, description, status, project_id, sprint_id, assignee_id, story_points, attachment_url }
    });
    res.status(201).json(new_task);
});
// PUT /api/v1/tasks/:task_id/status — update task status only
router.put('/:task_id/status', auth_1.authenticate, async (req, res) => {
    const task_id = parseId(req.params.task_id);
    if (isNaN(task_id)) {
        res.status(400).json({ detail: 'Invalid task ID' });
        return;
    }
    const { status } = req.body;
    const task = await prisma_1.default.task.findUnique({
        where: { id: task_id },
        include: { project: { include: { users: true } } }
    });
    if (!task) {
        res.status(404).json({ detail: 'Task not found' });
        return;
    }
    const privileged = isPrivilegedUser(req);
    const isMember = task.project.users.some(u => u.id === req.user.id);
    if (!privileged && !isMember) {
        res.status(403).json({ detail: 'Not authorized to update tasks for this project' });
        return;
    }
    const updatedTask = await prisma_1.default.task.update({
        where: { id: task_id },
        data: { status }
    });
    res.json(updatedTask);
});
// PUT /api/v1/tasks/:task_id — full task update
router.put('/:task_id', auth_1.authenticate, async (req, res) => {
    const task_id = parseId(req.params.task_id);
    if (isNaN(task_id)) {
        res.status(400).json({ detail: 'Invalid task ID' });
        return;
    }
    const task = await prisma_1.default.task.findUnique({
        where: { id: task_id },
        include: { project: { include: { users: true } } }
    });
    if (!task) {
        res.status(404).json({ detail: 'Task not found' });
        return;
    }
    const privileged = isPrivilegedUser(req);
    const isMember = task.project.users.some(u => u.id === req.user.id);
    if (!privileged && !isMember) {
        res.status(403).json({ detail: 'Not authorized to update tasks for this project' });
        return;
    }
    const updatedTask = await prisma_1.default.task.update({
        where: { id: task_id },
        data: req.body
    });
    res.json(updatedTask);
});
// DELETE /api/v1/tasks/:task_id — delete task
router.delete('/:task_id', auth_1.authenticate, async (req, res) => {
    const task_id = parseId(req.params.task_id);
    if (isNaN(task_id)) {
        res.status(400).json({ detail: 'Invalid task ID' });
        return;
    }
    const task = await prisma_1.default.task.findUnique({
        where: { id: task_id },
        include: { project: { include: { users: true } } }
    });
    if (!task) {
        res.status(404).json({ detail: 'Task not found' });
        return;
    }
    const privileged = isPrivilegedUser(req);
    const isMember = task.project.users.some(u => u.id === req.user.id);
    if (!privileged && !isMember) {
        res.status(403).json({ detail: 'Not authorized to delete tasks for this project' });
        return;
    }
    await prisma_1.default.task.delete({ where: { id: task_id } });
    res.status(204).send();
});
// POST /api/v1/tasks/:task_id/comments — add comment to task
router.post('/:task_id/comments', auth_1.authenticate, async (req, res) => {
    const task_id = parseId(req.params.task_id);
    const { content } = req.body;
    const task = await prisma_1.default.task.findUnique({ where: { id: task_id } });
    if (!task) {
        res.status(404).json({ detail: 'Task not found' });
        return;
    }
    const comment = await prisma_1.default.comment.create({
        data: { content, task_id, author_id: req.user.id },
        include: { author: true }
    });
    res.status(201).json(comment);
});
// POST /api/v1/tasks/:task_id/subtasks — add subtask to task
router.post('/:task_id/subtasks', auth_1.authenticate, async (req, res) => {
    const task_id = parseId(req.params.task_id);
    const { title, is_completed } = req.body;
    const task = await prisma_1.default.task.findUnique({ where: { id: task_id } });
    if (!task) {
        res.status(404).json({ detail: 'Task not found' });
        return;
    }
    const subtask = await prisma_1.default.subtask.create({
        data: { title, is_completed: is_completed ?? false, task_id }
    });
    res.status(201).json(subtask);
});
exports.default = router;
//# sourceMappingURL=tasks.js.map