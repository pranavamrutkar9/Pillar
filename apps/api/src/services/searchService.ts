import { prisma } from '../db/client.js';

export const searchService = {
  async searchWorkspace(workspaceId: string, userId: string, query: string, limit: number = 10) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });
    
    if (!member) {
      throw Object.assign(new Error('Forbidden'), { name: 'ForbiddenError' });
    }

    if (!query || query.trim() === '') {
      return { projects: [], issues: [], comments: [] };
    }

    const lowerQuery = query.toLowerCase();

    // Search Projects
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
        name: { contains: lowerQuery, mode: 'insensitive' }
      },
      take: limit,
      select: { id: true, name: true, slug: true }
    });

    // Search Issues
    const issues = await prisma.issue.findMany({
      where: {
        project: { workspaceId },
        title: { contains: lowerQuery, mode: 'insensitive' }
      },
      take: limit,
      select: { 
        id: true, 
        title: true, 
        sequenceId: true, 
        project: { select: { id: true, slug: true, name: true } } 
      }
    });

    // Search Comments (using raw query to cast JSON to text for ILIKE)
    const searchPattern = `%${lowerQuery}%`;
    const commentsRaw = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id, 
        c.body, 
        c."issueId", 
        i.title as "issueTitle", 
        p.id as "projectId", 
        p.name as "projectName", 
        p.slug as "projectSlug", 
        i."sequenceId"
      FROM comments c
      JOIN issues i ON c."issueId" = i.id
      JOIN projects p ON i."projectId" = p.id
      WHERE p."workspaceId" = ${workspaceId}
      AND c.body::text ILIKE ${searchPattern}
      LIMIT ${limit}
    `;

    // Map raw comments back to a friendly object
    const comments = commentsRaw.map(c => ({
      id: c.id,
      issueId: c.issueId,
      issueTitle: c.issueTitle,
      body: c.body,
      project: {
        id: c.projectId,
        name: c.projectName,
        slug: c.projectSlug,
        sequenceId: c.sequenceId
      }
    }));

    return {
      projects,
      issues,
      comments
    };
  }
};
