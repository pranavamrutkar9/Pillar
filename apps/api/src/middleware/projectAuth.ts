import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client.js';

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
const ROLE_WEIGHT = {
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

async function resolveProjectId(req: Request): Promise<string | undefined> {
  let projectId = req.params.projectId || req.body?.projectId;
  if (!projectId && req.params.issueId) {
    const issueIdStr = req.params.issueId as string;
    const issue = await prisma.issue.findUnique({
      where: { id: issueIdStr },
      select: { projectId: true }
    });
    if (issue) projectId = issue.projectId;
  }
  return projectId;
}

async function getEffectiveRole(projectId: string, userId: string): Promise<number> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId } },
      workspace: {
        include: {
          members: { where: { userId } }
        }
      }
    }
  });

  if (!project) throw new Error('Project not found');

  const pRole = project.members[0]?.role;
  const wRole = project.workspace.members[0]?.role;

  const pWeight = pRole ? ROLE_WEIGHT[pRole] : 0;
  const wWeight = wRole ? ROLE_WEIGHT[wRole] : 0;

  return Math.max(pWeight, wWeight);
}

export const requireProjectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const projectId = await resolveProjectId(req);

    if (!userId) throw new UnauthorizedError('Missing user');
    if (!projectId) throw new Error('Bad Request: Missing projectId parameter');

    const role = await getEffectiveRole(projectId, userId);
    
    if (role < ROLE_WEIGHT.ADMIN) {
      throw new ForbiddenError('Requires project admin role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const projectId = await resolveProjectId(req);

    if (!userId) throw new UnauthorizedError('Missing user');
    if (!projectId) throw new Error('Bad Request: Missing projectId parameter');

    const role = await getEffectiveRole(projectId, userId);
    
    if (role < ROLE_WEIGHT.MEMBER) {
      throw new ForbiddenError('Requires project member role or higher');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireProjectViewer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = await resolveProjectId(req);
    if (!projectId) throw new Error('Bad Request: Missing projectId parameter');

    if (req.viewer && req.viewer.projectId === projectId) {
      return next();
    }

    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Missing user');

    const role = await getEffectiveRole(projectId, userId);
    
    if (role < ROLE_WEIGHT.VIEWER) {
      throw new ForbiddenError('Requires at least project viewer role');
    }

    next();
  } catch (error) {
    next(error);
  }
};

