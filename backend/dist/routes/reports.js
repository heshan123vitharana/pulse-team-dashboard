"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function parseId(param) {
    return parseInt(Array.isArray(param) ? param[0] : (param ?? ''), 10);
}
function getWeekBoundaries() {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const start = new Date(today);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Sunday
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
// ─── IMPORTANT: Named/specific routes MUST come before /:report_id ───────────
// GET /api/v1/reports/my-reports — logged-in user's own reports
router.get('/my-reports', auth_1.authenticate, async (req, res) => {
    const reports = await prisma_1.default.weeklyReport.findMany({
        where: { user_id: req.user.id },
        include: { user: true, project: true },
        orderBy: { submitted_at: 'desc' }
    });
    res.json(reports);
});
// GET /api/v1/reports/dashboard-metrics — summary metrics (Project Manager+)
router.get('/dashboard-metrics', auth_1.authenticate, auth_1.requireProjectManager, async (_req, res) => {
    const { start, end } = getWeekBoundaries();
    const [total_reports, open_blockers, active_projects, all_users] = await Promise.all([
        prisma_1.default.weeklyReport.count(),
        prisma_1.default.weeklyReport.count({
            where: {
                blockers: {
                    notIn: ['', 'none', 'None', 'NONE']
                }
            }
        }),
        prisma_1.default.project.count(),
        prisma_1.default.user.findMany()
    ]);
    const team_members_count = all_users.length;
    const reports_this_week = await prisma_1.default.weeklyReport.findMany({
        where: {
            week_start_date: { gte: start },
            week_end_date: { lte: end }
        }
    });
    const submitted_user_ids = new Set(reports_this_week.map(r => r.user_id));
    const compliance_rate = team_members_count > 0
        ? Math.round((submitted_user_ids.size / team_members_count) * 100)
        : 0;
    const today = new Date();
    const isLate = today.getDay() === 0 || today.getDay() >= 5; // Friday, Saturday, Sunday
    const member_status = all_users.map(user => ({
        user_id: user.id,
        name: user.name,
        status: submitted_user_ids.has(user.id) ? 'submitted' : (isLate ? 'late' : 'pending')
    }));
    const status_groups = await prisma_1.default.weeklyReport.groupBy({
        by: ['submission_status'],
        _count: { id: true }
    });
    const compliance_chart = status_groups.map(g => ({ status: g.submission_status, count: g._count.id }));
    const project_reports = await prisma_1.default.weeklyReport.findMany({ include: { project: true } });
    const project_counts = {};
    for (const r of project_reports) {
        const name = r.project.project_name;
        project_counts[name] = (project_counts[name] || 0) + 1;
    }
    const project_workload = Object.keys(project_counts).map(k => ({ project: k, count: project_counts[k] }));
    // Trend: last 8 weeks
    const trend = [];
    for (let i = 7; i >= 0; i--) {
        const d = new Date(start);
        d.setDate(d.getDate() - i * 7);
        const week_start = new Date(d);
        week_start.setHours(0, 0, 0, 0);
        const week_end = new Date(week_start);
        week_end.setDate(week_start.getDate() + 6);
        week_end.setHours(23, 59, 59, 999);
        const week_reports = await prisma_1.default.weeklyReport.findMany({
            where: {
                week_start_date: { gte: week_start },
                week_end_date: { lte: week_end }
            }
        });
        trend.push({
            week: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            reports: week_reports.length,
            blockers: week_reports.filter(r => r.blockers && r.blockers.toLowerCase() !== 'none').length
        });
    }
    res.json({
        summary: {
            total_reports,
            open_blockers,
            active_projects,
            team_members: team_members_count,
            compliance_rate,
            submitted_this_week: submitted_user_ids.size
        },
        charts: {
            compliance: compliance_chart,
            project_workload,
            trend,
            member_status
        }
    });
});
// GET /api/v1/reports/auto-generate/:sprint_id — generate report from sprint tasks
router.get('/auto-generate/:sprint_id', auth_1.authenticate, async (req, res) => {
    const sprint_id = parseId(req.params.sprint_id);
    if (isNaN(sprint_id)) {
        res.status(400).json({ detail: 'Invalid sprint ID' });
        return;
    }
    const sprint = await prisma_1.default.sprint.findUnique({ where: { id: sprint_id } });
    if (!sprint) {
        res.status(404).json({ detail: 'Sprint not found' });
        return;
    }
    const tasks = await prisma_1.default.task.findMany({
        where: { sprint_id, assignee_id: req.user.id }
    });
    const completed = tasks.filter(t => t.status === 'DONE');
    const planned = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
    const tasks_completed = completed.length > 0 ? completed.map(t => `- ${t.title}`).join('\n') : 'None';
    const tasks_planned = planned.length > 0 ? planned.map(t => `- ${t.title}`).join('\n') : 'None';
    res.json({ tasks_completed, tasks_planned });
});
// ─── Generic CRUD routes (must be AFTER named routes above) ──────────────────
// POST /api/v1/reports/ — submit a new report
router.post('/', auth_1.authenticate, async (req, res) => {
    const { project_id, week_start_date, week_end_date, submission_status, tasks_completed, tasks_planned, blockers, hours_worked, notes } = req.body;
    if (!project_id || !week_start_date || !week_end_date) {
        res.status(400).json({ detail: 'project_id, week_start_date, and week_end_date are required' });
        return;
    }
    const project = await prisma_1.default.project.findUnique({ where: { id: project_id } });
    if (!project) {
        res.status(404).json({ detail: 'Project not found' });
        return;
    }
    const report = await prisma_1.default.weeklyReport.create({
        data: {
            project_id,
            user_id: req.user.id,
            week_start_date: new Date(week_start_date),
            week_end_date: new Date(week_end_date),
            submission_status: submission_status ?? 'Submitted',
            tasks_completed: tasks_completed ?? '',
            tasks_planned: tasks_planned ?? '',
            blockers: blockers ?? '',
            hours_worked,
            notes
        },
        include: { user: true, project: true }
    });
    res.status(201).json(report);
});
// GET /api/v1/reports/ — all reports (Project Manager+), with optional filters
router.get('/', auth_1.authenticate, auth_1.requireProjectManager, async (req, res) => {
    const { user_id, project_id, start_date, end_date } = req.query;
    const where = {};
    if (user_id)
        where.user_id = parseInt(user_id);
    if (project_id)
        where.project_id = parseInt(project_id);
    if (start_date)
        where.week_start_date = { gte: new Date(start_date) };
    if (end_date)
        where.week_end_date = { lte: new Date(end_date) };
    const reports = await prisma_1.default.weeklyReport.findMany({
        where,
        include: { user: true, project: true },
        orderBy: { submitted_at: 'desc' }
    });
    res.json(reports);
});
// GET /api/v1/reports/:report_id — get a single report
router.get('/:report_id', auth_1.authenticate, async (req, res) => {
    const report_id = parseId(req.params.report_id);
    if (isNaN(report_id)) {
        res.status(400).json({ detail: 'Invalid report ID' });
        return;
    }
    const report = await prisma_1.default.weeklyReport.findUnique({
        where: { id: report_id },
        include: { user: true, project: true }
    });
    if (!report) {
        res.status(404).json({ detail: 'Report not found' });
        return;
    }
    const roleName = req.user?.role?.role_name ?? '';
    const isPrivileged = roleName === 'Administrator' || roleName === 'Project Manager';
    if (!isPrivileged && report.user_id !== req.user.id) {
        res.status(403).json({ detail: 'Access denied. You can only view your own reports.' });
        return;
    }
    res.json(report);
});
// PUT /api/v1/reports/:report_id — update a report (own report only)
router.put('/:report_id', auth_1.authenticate, async (req, res) => {
    const report_id = parseId(req.params.report_id);
    if (isNaN(report_id)) {
        res.status(400).json({ detail: 'Invalid report ID' });
        return;
    }
    const report = await prisma_1.default.weeklyReport.findUnique({ where: { id: report_id } });
    if (!report) {
        res.status(404).json({ detail: 'Report not found' });
        return;
    }
    if (report.user_id !== req.user.id) {
        res.status(403).json({ detail: 'Access denied. You can only update your own reports.' });
        return;
    }
    const updateData = { ...req.body };
    if (updateData.project_id) {
        const proj = await prisma_1.default.project.findUnique({ where: { id: updateData.project_id } });
        if (!proj) {
            res.status(400).json({ detail: 'Project not found' });
            return;
        }
    }
    // Convert date strings to Date objects if provided
    if (updateData.week_start_date)
        updateData.week_start_date = new Date(updateData.week_start_date);
    if (updateData.week_end_date)
        updateData.week_end_date = new Date(updateData.week_end_date);
    const updatedReport = await prisma_1.default.weeklyReport.update({
        where: { id: report_id },
        data: updateData,
        include: { user: true, project: true }
    });
    res.json(updatedReport);
});
// DELETE /api/v1/reports/:report_id — delete a report (own report only)
router.delete('/:report_id', auth_1.authenticate, async (req, res) => {
    const report_id = parseId(req.params.report_id);
    if (isNaN(report_id)) {
        res.status(400).json({ detail: 'Invalid report ID' });
        return;
    }
    const report = await prisma_1.default.weeklyReport.findUnique({ where: { id: report_id } });
    if (!report) {
        res.status(404).json({ detail: 'Report not found' });
        return;
    }
    if (report.user_id !== req.user.id) {
        res.status(403).json({ detail: 'Access denied. You can only delete your own reports.' });
        return;
    }
    await prisma_1.default.weeklyReport.delete({ where: { id: report_id } });
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=reports.js.map