import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireProjectManager, AuthRequest } from '../middleware/auth';
import { wsManager } from '../lib/ws';

const router = Router();

/** Returns true if the user is a privileged role (Admin or Project Manager) */
function isPrivilegedUser(req: AuthRequest): boolean {
  const roleName: string = req.user?.role?.role_name ?? '';
  return roleName === 'Administrator' || roleName === 'Project Manager';
}

function parseId(param: string | string[] | undefined): number {
  return parseInt(Array.isArray(param) ? param[0] : (param ?? ''), 10);
}

// GET /api/v1/projects/ — list projects (all for privileged, own for members)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (isPrivilegedUser(req)) {
    const projects = await prisma.project.findMany({ include: { users: true } });
    res.json(projects);
  } else {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { projects: { include: { users: true } } }
    });
    res.json(user?.projects || []);
  }
});

// POST /api/v1/projects/ — create project (Project Manager+)
router.post('/', authenticate, requireProjectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_name, description } = req.body;
  if (!project_name) {
    res.status(400).json({ detail: 'project_name is required' });
    return;
  }
  const project = await prisma.project.create({
    data: { project_name, description }
  });
  res.status(201).json(project);
});

// GET /api/v1/projects/:project_id — get single project
router.get('/:project_id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const project_id = parseId(req.params.project_id);
  if (isNaN(project_id)) {
    res.status(400).json({ detail: 'Invalid project ID' });
    return;
  }
  const project = await prisma.project.findUnique({ where: { id: project_id } });
  if (!project) {
    res.status(404).json({ detail: 'Project not found' });
    return;
  }
  res.json(project);
});

// PUT /api/v1/projects/:project_id — update project (Project Manager+)
router.put('/:project_id', authenticate, requireProjectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const project_id = parseId(req.params.project_id);
  const existing = await prisma.project.findUnique({ where: { id: project_id } });
  if (!existing) {
    res.status(404).json({ detail: 'Project not found' });
    return;
  }

  const { project_name, description } = req.body;
  const project = await prisma.project.update({
    where: { id: project_id },
    data: { project_name, description }
  });
  res.json(project);
});

// DELETE /api/v1/projects/:project_id — delete project (Project Manager+)
router.delete('/:project_id', authenticate, requireProjectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const project_id = parseId(req.params.project_id);
  const existing = await prisma.project.findUnique({ where: { id: project_id } });
  if (!existing) {
    res.status(404).json({ detail: 'Project not found' });
    return;
  }
  await prisma.project.delete({ where: { id: project_id } });
  res.status(204).send();
});

// POST /api/v1/projects/:project_id/assign/:user_id — assign user to project
router.post('/:project_id/assign/:user_id', authenticate, requireProjectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const project_id = parseId(req.params.project_id);
  const user_id = parseId(req.params.user_id);

  const project = await prisma.project.findUnique({ where: { id: project_id } });
  if (!project) {
    res.status(404).json({ detail: 'Project not found' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) {
    res.status(404).json({ detail: 'User not found' });
    return;
  }

  await prisma.project.update({
    where: { id: project_id },
    data: { users: { connect: { id: user_id } } }
  });

  wsManager.sendPersonalMessage({
    type: 'PROJECT_ASSIGNED',
    message: `You were assigned to project: ${project.project_name}`,
    project_id: project.id,
    project_name: project.project_name
  }, user_id);

  res.json({ message: 'User assigned to project' });
});

// DELETE /api/v1/projects/:project_id/assign/:user_id — remove user from project
router.delete('/:project_id/assign/:user_id', authenticate, requireProjectManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const project_id = parseId(req.params.project_id);
  const user_id = parseId(req.params.user_id);

  const project = await prisma.project.findUnique({ where: { id: project_id } });
  if (!project) {
    res.status(404).json({ detail: 'Project not found' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) {
    res.status(404).json({ detail: 'User not found' });
    return;
  }

  await prisma.project.update({
    where: { id: project_id },
    data: { users: { disconnect: { id: user_id } } }
  });

  wsManager.sendPersonalMessage({
    type: 'PROJECT_UNASSIGNED',
    message: `You were removed from project: ${project.project_name}`,
    project_id: project.id,
    project_name: project.project_name
  }, user_id);

  res.json({ message: 'User removed from project' });
});

export default router;
