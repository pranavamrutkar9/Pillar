import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const query = 'hi';
  const lowerQuery = query.toLowerCase();
  const searchPattern = `%${lowerQuery}%`;
  // I need to use an actual workspaceId. Let's get the first one.
  const p = await prisma.project.findFirst();
  const workspaceId = p?.workspaceId;
  
  if (!workspaceId) {
    console.log("No workspaceId found");
    return;
  }

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
    LIMIT 10
  `;
  console.log('workspaceId', workspaceId);
  console.log(commentsRaw);
}
main().catch(console.error).finally(() => prisma.$disconnect());
