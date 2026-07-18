import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/** Returns true if the user is a privileged role (Admin or Project Manager) */
function isPrivilegedUser(req: AuthRequest): boolean {
  const roleName: string = req.user?.role?.role_name ?? '';
  return roleName === 'Administrator' || roleName === 'Project Manager';
}

function parseId(param: string | string[] | undefined): number {
  return parseInt(Array.isArray(param) ? param[0] : (param ?? ''), 10);
}

// GET /api/v1/sprints/active?project_id=X — get active sprint for a project
router.get('/active', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const project_id = parseInt(req.query.project_id as string);
  if (isNaN(project_id)) {
    res.status(400).json({ detail: 'project_id query param is required and must be a number' });
    return;
  }

  const project = await prisma.project.findUnique({
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
    res.status(403).json({ detail: "Not authorized to view this project's sprints" });
    return;
  }

  const sprint = await prisma.sprint.findFirst({
    where: { project_id, is_active: true }
  });

  if (!sprint) {
    res.status(404).json({ detail: 'No active sprint found for this project' });
    return;
  }

  res.json(sprint);
});

// POST /api/v1/sprints/ — create a sprint
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, start_date, end_date, goal, project_id, is_active } = req.body;

  if (!name || !start_date || !end_date || !project_id) {
    res.status(400).json({ detail: 'name, start_date, end_date, and project_id are required' });
    return;
  }

  const project = await prisma.project.findUnique({
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
    res.status(403).json({ detail: 'Not authorized to create sprints for this project' });
    return;
  }

  // Deactivate any currently active sprint if the new one should be active
  if (is_active) {
    await prisma.sprint.updateMany({
      where: { project_id, is_active: true },
      data: { is_active: false }
    });
  }

  const new_sprint = await prisma.sprint.create({
    data: {
      name,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      goal,
      project_id,
      is_active: is_active ?? true
    }
  });

  res.status(201).json(new_sprint);
});

// POST /api/v1/sprints/:sprint_id/complete — complete (deactivate) a sprint
router.post('/:sprint_id/complete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const sprint_id = parseId(req.params.sprint_id);
  if (isNaN(sprint_id)) {
    res.status(400).json({ detail: 'Invalid sprint ID' });
    return;
  }

  const sprint = await prisma.sprint.findUnique({
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
    res.status(403).json({ detail: 'Not authorized to complete sprints for this project' });
    return;
  }

  const updatedSprint = await prisma.sprint.update({
    where: { id: sprint_id },
    data: { is_active: false }
  });

  // Move incomplete tasks back to the backlog
  await prisma.task.updateMany({
    where: { sprint_id, status: { not: 'DONE' } },
    data: { sprint_id: null }
  });

  res.json(updatedSprint);
});

export default router;
