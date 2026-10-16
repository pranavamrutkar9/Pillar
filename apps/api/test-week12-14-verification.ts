import "dotenv/config";
import { prisma } from "./src/db/client.js";
import { aiService } from "./src/services/ai.service.js";
import { prdParserService } from "./src/services/prdParser.service.js";
import { prdProjectBreakdownService } from "./src/services/prdProjectBreakdown.service.js";
import { validateAndRepairBreakdown } from "./src/validators/prdBreakdown.schema.js";

const SAMPLE_PRD = `Build a task management app for small teams. Users should be able 
to create projects, assign tasks to team members, set due dates, 
and track progress. The app needs user authentication, email 
notifications when tasks are assigned, and a dashboard showing 
team workload. Mobile-friendly UI is required.`;

async function runVerification() {
  console.log("=================================================");
  console.log("STARTING WEEKS 12-14 VERIFICATION RUN");
  console.log("=================================================\n");

  const results: Record<string, { status: "PASS" | "FAIL"; details: string }> = {};

  // Find a valid workspace & user
  const member = await prisma.workspaceMember.findFirst({
    include: { workspace: true, user: true },
  });

  if (!member) {
    throw new Error("No workspace member found in database to run tests against.");
  }

  const workspaceId = member.workspaceId;
  const userId = member.userId;
  console.log(`Using Workspace: ${member.workspace.name} (${workspaceId})`);
  console.log(`Using User: ${member.user.name || member.user.email} (${userId})\n`);

  let clarificationQuestions: any[] = [];
  let generatedBreakdown: any = null;
  let committedProject: any = null;
  const testIdempotencyKey = `verify-${Date.now()}`;

  // -----------------------------------------------------------------
  // STEP 1 — Analyze endpoint
  // -----------------------------------------------------------------
  console.log("--- STEP 1: Analyze Endpoint ---");
  try {
    const normalized = prdParserService.normalizeText(SAMPLE_PRD);
    const analysis = await aiService.analyzePrdClarifications(normalized);
    clarificationQuestions = analysis.questions;

    console.log(`Detected Title: ${analysis.detectedProjectTitle}`);
    console.log(`Summary: ${analysis.summary}`);
    console.log(`Questions returned: ${clarificationQuestions.length}`);
    clarificationQuestions.forEach((q, idx) => {
      console.log(`  Q${idx + 1}: ${q.question} (${q.options.length} options)`);
    });

    if (clarificationQuestions.length >= 2 && analysis.detectedProjectTitle) {
      results["Step 1: Analyze endpoint"] = {
        status: "PASS",
        details: `Returned ${clarificationQuestions.length} clarifying questions with multiple options.`,
      };
    } else {
      results["Step 1: Analyze endpoint"] = {
        status: "FAIL",
        details: `Expected at least 2 questions, received ${clarificationQuestions.length}`,
      };
    }
  } catch (err: any) {
    results["Step 1: Analyze endpoint"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // STEP 2 — Generate endpoint
  // -----------------------------------------------------------------
  console.log("\n--- STEP 2: Generate Endpoint ---");
  try {
    const answers: Record<string, string> = {};
    if (clarificationQuestions.length > 0) {
      answers[clarificationQuestions[0].id] = clarificationQuestions[0].options[0];
    }

    const normalized = prdParserService.normalizeText(SAMPLE_PRD);
    generatedBreakdown = await aiService.generateProjectBreakdown(normalized, answers);

    console.log(`Project Name: ${generatedBreakdown.projectName}`);
    console.log(`Project Slug: ${generatedBreakdown.projectSlug}`);
    console.log(`Modules count: ${generatedBreakdown.modules?.length}`);
    console.log(`Issues count: ${generatedBreakdown.issues?.length}`);

    // Verify Zod schema
    const validated = validateAndRepairBreakdown(generatedBreakdown);

    const hasModules = validated.modules.length >= 2;
    const hasIssues = validated.issues.length >= 3;
    const issuesHavePriority = validated.issues.every((i) => ["LOW", "MEDIUM", "HIGH", "URGENT", "NONE"].includes(i.priority));

    if (hasModules && hasIssues && issuesHavePriority && validated.projectName) {
      results["Step 2: Generate endpoint"] = {
        status: "PASS",
        details: `Generated valid breakdown matching Zod schema with ${validated.modules.length} modules, ${validated.issues.length} issues, and priorities.`,
      };
    } else {
      results["Step 2: Generate endpoint"] = {
        status: "FAIL",
        details: `Validation failed: modules=${validated.modules.length}, issues=${validated.issues.length}`,
      };
    }
  } catch (err: any) {
    results["Step 2: Generate endpoint"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // STEP 3 — Edit the preview
  // -----------------------------------------------------------------
  console.log("\n--- STEP 3: Edit Preview State ---");
  let editedBreakdown: any = null;
  try {
    editedBreakdown = JSON.parse(JSON.stringify(generatedBreakdown));

    // 1. Change one module name
    const originalModName = editedBreakdown.modules[0].name;
    editedBreakdown.modules[0].name = `${originalModName} (Edited)`;

    // 2. Change one issue title
    const originalIssueTitle = editedBreakdown.issues[0].title;
    editedBreakdown.issues[0].title = `${originalIssueTitle} - Custom Edit`;

    // 3. Change one issue priority
    editedBreakdown.issues[0].priority = "URGENT";

    // 4. Add a new issue manually
    const newIssueTempId = `manual-iss-${Date.now()}`;
    editedBreakdown.issues.push({
      tempId: newIssueTempId,
      moduleTempId: editedBreakdown.modules[0].tempId,
      title: "Manual Verification Task: Deploy to Production",
      description: "Verify production deployment pipeline and observability alerts.",
      priority: "HIGH",
      estimate: 3,
      labelTempIds: editedBreakdown.labels[0] ? [editedBreakdown.labels[0].tempId] : [],
      blockedByTempIds: [editedBreakdown.issues[0].tempId],
    });

    // Validate edited preview through schema
    const repaired = validateAndRepairBreakdown(editedBreakdown);
    const modEdited = repaired.modules.some((m) => m.name.includes("(Edited)"));
    const titleEdited = repaired.issues.some((i) => i.title.includes("Custom Edit"));
    const priorityEdited = repaired.issues.some((i) => i.priority === "URGENT");
    const manualAdded = repaired.issues.some((i) => i.tempId === newIssueTempId);

    console.log(`Module edited: ${modEdited}`);
    console.log(`Issue title edited: ${titleEdited}`);
    console.log(`Issue priority edited: ${priorityEdited}`);
    console.log(`Manual issue added: ${manualAdded}`);

    if (modEdited && titleEdited && priorityEdited && manualAdded) {
      results["Step 3: Edit the preview"] = {
        status: "PASS",
        details: "Module name, issue title, issue priority edits, and manual issue addition all persisted cleanly.",
      };
      editedBreakdown = repaired;
    } else {
      results["Step 3: Edit the preview"] = {
        status: "FAIL",
        details: "One or more edits were lost during schema validation.",
      };
    }
  } catch (err: any) {
    results["Step 3: Edit the preview"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // STEP 4 — Commit
  // -----------------------------------------------------------------
  console.log("\n--- STEP 4: Commit ---");
  try {
    committedProject = await prdProjectBreakdownService.commitBreakdown(
      workspaceId,
      userId,
      editedBreakdown,
      testIdempotencyKey
    );

    console.log(`Committed Project ID: ${committedProject.id}`);
    console.log(`Committed Project Name: ${committedProject.name}`);
    console.log(`Committed Project Slug: ${committedProject.slug}`);

    if (committedProject.id && committedProject.name === editedBreakdown.projectName) {
      results["Step 4: Commit"] = {
        status: "PASS",
        details: `Successfully committed project "${committedProject.name}" (ID: ${committedProject.id}) and generated redirect target.`,
      };
    } else {
      results["Step 4: Commit"] = {
        status: "FAIL",
        details: `Project name mismatch: expected "${editedBreakdown.projectName}", got "${committedProject.name}"`,
      };
    }
  } catch (err: any) {
    results["Step 4: Commit"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // STEP 5 — Database Verification
  // -----------------------------------------------------------------
  console.log("\n--- STEP 5: Database Verification ---");
  try {
    const projId = committedProject.id;

    // 1. Projects table
    const dbProject = await prisma.project.findUnique({ where: { id: projId } });

    // 2. Modules table
    const dbModules = await prisma.module.findMany({ where: { projectId: projId } });

    // 3. Issues table
    const dbIssues = await prisma.issue.findMany({
      where: { projectId: projId },
      orderBy: { sequenceId: "asc" },
    });

    // 4. Events table
    const dbEvent = await prisma.event.findFirst({
      where: {
        projectId: projId,
        eventType: "project.created_from_prd",
      },
    });

    // 5. Issue Statuses
    const dbStatuses = await prisma.issueStatus.findMany({ where: { projectId: projId } });

    // 6. Project Members
    const dbMember = await prisma.projectMember.findFirst({
      where: { projectId: projId, userId, role: "ADMIN" },
    });

    // Checks
    const projectValid = !!dbProject && dbProject.workspaceId === workspaceId && dbProject.createdBy === userId;
    const modulesValid = dbModules.length === editedBreakdown.modules.length;
    const issuesValid = dbIssues.length === editedBreakdown.issues.length && dbIssues[0].sequenceId === 1;
    const allIssuesHaveModule = dbIssues.every((i) => !!i.moduleId);
    const eventValid = !!dbEvent;
    const statusesValid = dbStatuses.length >= 3 && dbStatuses.some((s) => s.name === "Todo");
    const memberValid = !!dbMember;

    console.log(`DB Project check: ${projectValid}`);
    console.log(`DB Modules count: ${dbModules.length} (expected: ${editedBreakdown.modules.length}) -> ${modulesValid}`);
    console.log(`DB Issues count: ${dbIssues.length} (expected: ${editedBreakdown.issues.length}) -> ${issuesValid}`);
    console.log(`DB Issues sequential (1..N): ${dbIssues.map((i) => i.sequenceId).join(", ")}`);
    console.log(`DB Event (project.created_from_prd): ${eventValid}`);
    console.log(`DB Default statuses seeded: ${dbStatuses.map((s) => s.name).join(", ")}`);
    console.log(`DB Creator ADMIN member: ${memberValid}`);

    if (projectValid && modulesValid && issuesValid && allIssuesHaveModule && eventValid && statusesValid && memberValid) {
      results["Step 5: Database verification"] = {
        status: "PASS",
        details: `Verified rows in projects, modules (${dbModules.length}), issues (${dbIssues.length}), events (project.created_from_prd), issue_statuses (3), and project_members (ADMIN).`,
      };
    } else {
      results["Step 5: Database verification"] = {
        status: "FAIL",
        details: `Check failed: project=${projectValid}, modules=${modulesValid}, issues=${issuesValid}, event=${eventValid}, member=${memberValid}`,
      };
    }
  } catch (err: any) {
    results["Step 5: Database verification"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // STEP 6 — Idempotency
  // -----------------------------------------------------------------
  console.log("\n--- STEP 6: Idempotency ---");
  try {
    const initialProjectCount = await prisma.project.count({ where: { workspaceId } });

    // Submit the same breakdown again with the exact same idempotency key
    const secondAttempt = await prdProjectBreakdownService.commitBreakdown(
      workspaceId,
      userId,
      editedBreakdown,
      testIdempotencyKey
    );

    const afterProjectCount = await prisma.project.count({ where: { workspaceId } });

    console.log(`First project ID: ${committedProject.id}`);
    console.log(`Second project ID: ${secondAttempt.id}`);
    console.log(`Project count before: ${initialProjectCount}, after: ${afterProjectCount}`);

    const isSameProject = secondAttempt.id === committedProject.id;
    const noDuplicateCreated = initialProjectCount === afterProjectCount;

    if (isSameProject && noDuplicateCreated) {
      results["Step 6: Idempotency"] = {
        status: "PASS",
        details: `Idempotency key correctly prevented duplicate creation. Returned existing project ${secondAttempt.id}.`,
      };
    } else {
      results["Step 6: Idempotency"] = {
        status: "FAIL",
        details: `Duplicate project created! IDs: ${committedProject.id} vs ${secondAttempt.id}`,
      };
    }
  } catch (err: any) {
    results["Step 6: Idempotency"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // STEP 7 — Error Handling
  // -----------------------------------------------------------------
  console.log("\n--- STEP 7: Error Handling ---");
  try {
    // 1. Submit empty PRD text
    let emptyCaught = false;
    try {
      const normalized = prdParserService.normalizeText("");
      if (!normalized) {
        emptyCaught = true;
      }
    } catch {
      emptyCaught = true;
    }

    // 2. Submit random gibberish
    const gibberish = "asdf qwer zxcv poiulkjh mnbv 123456 !!! ???";
    console.log("Testing with gibberish input...");
    const gibberishAnalysis = await aiService.analyzePrdClarifications(gibberish);
    const gibberishBreakdown = await aiService.generateProjectBreakdown(gibberish, {});

    console.log(`Gibberish Project Name: "${gibberishBreakdown.projectName}"`);
    console.log(`Gibberish Modules: ${gibberishBreakdown.modules?.length}`);
    console.log(`Gibberish Issues: ${gibberishBreakdown.issues?.length}`);

    const gibberishHandled =
      gibberishAnalysis.questions &&
      gibberishAnalysis.questions.length > 0 &&
      gibberishBreakdown.modules &&
      gibberishBreakdown.modules.length > 0;

    if (emptyCaught && gibberishHandled) {
      results["Step 7: Error handling"] = {
        status: "PASS",
        details: "Empty textarea caught cleanly. Gibberish handled gracefully by AI returning valid structured fallback without crashing.",
      };
    } else {
      results["Step 7: Error handling"] = {
        status: "FAIL",
        details: `emptyCaught=${emptyCaught}, gibberishHandled=${gibberishHandled}`,
      };
    }
  } catch (err: any) {
    results["Step 7: Error handling"] = {
      status: "FAIL",
      details: `Exception: ${err.message}`,
    };
  }

  // -----------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------
  console.log("\n=================================================");
  console.log("VERIFICATION RESULTS SUMMARY");
  console.log("=================================================");
  for (const [stepName, res] of Object.entries(results)) {
    const symbol = res.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    console.log(`${symbol} | ${stepName}`);
    console.log(`        ↳ ${res.details}`);
  }
}

runVerification()
  .catch((err) => {
    console.error("FATAL ERROR in test runner:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
