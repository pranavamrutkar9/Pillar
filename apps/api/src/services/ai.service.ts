import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  PrdClarificationsOutput,
  ProjectBreakdownOutput,
  prdClarificationSchema,
  validateAndRepairBreakdown,
} from "../validators/prdBreakdown.schema.js";

export interface AIProvider {
  generateStandup(payload: any): Promise<{ yesterday: string[]; today: string[]; attention: string[] }>;
  analyzePrdClarifications(prdText: string): Promise<PrdClarificationsOutput>;
  generateProjectBreakdown(prdText: string, answers?: Record<string, string>): Promise<ProjectBreakdownOutput>;
}

const standupSchema = z.object({
  yesterday: z.array(z.string()),
  today: z.array(z.string()),
  attention: z.array(z.string()),
});

// ==========================================
// SHARED RESILIENT HELPERS
// ==========================================
function cleanJsonText(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1).trim();
  }
  return text;
}

function sanitizeClarifications(raw: any, prdText: string): PrdClarificationsOutput {
  if (!raw || typeof raw !== "object") {
    throw new Error("Clarifications output is not an object");
  }

  const firstLine = prdText.split("\n")[0]?.replace(/^#+\s*/, "").trim() || "";
  let detectedProjectTitle =
    typeof raw.detectedProjectTitle === "string" && raw.detectedProjectTitle.trim()
      ? raw.detectedProjectTitle.trim()
      : firstLine || "New Engineering Project";

  if (detectedProjectTitle.length > 95) {
    detectedProjectTitle = detectedProjectTitle.substring(0, 95);
  }
  if (detectedProjectTitle.length < 2) {
    detectedProjectTitle = "Engineering Project";
  }

  const summary =
    typeof raw.summary === "string" && raw.summary.trim()
      ? raw.summary.trim()
      : `Technical architecture decomposition for ${detectedProjectTitle}.`;

  let rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];
  if (rawQuestions.length === 0) {
    throw new Error("No questions returned by AI");
  }

  const questions = rawQuestions.slice(0, 4).map((q: any, idx: number) => {
    const id = q.id ? String(q.id) : `q${idx + 1}`;
    const question =
      typeof q.question === "string" && q.question.trim()
        ? q.question.trim()
        : `Key architectural trade-off for ${detectedProjectTitle}`;
    const context =
      typeof q.context === "string" && q.context.trim()
        ? q.context.trim()
        : "Determines engineering complexity, system boundaries, and foundational design.";

    let rawOptions = Array.isArray(q.options)
      ? q.options.filter((o: any) => typeof o === "string" && o.trim().length > 0)
      : [];

    if (rawOptions.length < 2) {
      rawOptions = [
        rawOptions[0] || "Standard industry best-practice pattern (Recommended)",
        "Custom lightweight modular implementation",
      ];
    } else if (rawOptions.length > 4) {
      rawOptions = rawOptions.slice(0, 4);
    }

    let recommendedOption =
      typeof q.recommendedOption === "string" && q.recommendedOption.trim()
        ? q.recommendedOption.trim()
        : rawOptions[0];

    return {
      id,
      question,
      context,
      options: rawOptions,
      recommendedOption,
    };
  });

  return prdClarificationSchema.parse({
    detectedProjectTitle,
    summary,
    questions,
  });
}

function generateFallbackClarifications(prdText: string): PrdClarificationsOutput {
  const lines = prdText.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstHeader = lines.find((l) => l.startsWith("#"))?.replace(/^#+\s*/, "").replace(/\(.*?\)/g, "").trim();
  const firstLine = lines[0]?.replace(/^#+\s*/, "").replace(/\(.*?\)/g, "").trim() || "New Project";
  const detectedProjectTitle = (firstHeader || firstLine).substring(0, 50) || "Engineering Project";
  const lower = prdText.toLowerCase();

  const questions: PrdClarificationsOutput["questions"] = [];

  // Domain 1: Payments & Subscriptions
  if (lower.includes("stripe") || lower.includes("payment") || lower.includes("billing") || lower.includes("subscription") || lower.includes("invoice")) {
    questions.push({
      id: "q1",
      question: `How should webhook event ingestion and state deduplication be architected for ${detectedProjectTitle}?`,
      context: "Crucial for preventing double charges and ensuring reliable subscription status updates during network partitions.",
      options: [
        "Idempotent worker queue with Redis event key cache (Recommended)",
        "Synchronous controller route with direct DB transactions",
        "Scheduled polling worker querying the payment API",
      ],
      recommendedOption: "Idempotent worker queue with Redis event key cache (Recommended)",
    });
    questions.push({
      id: "q2",
      question: `How should entitlement guards enforce feature access when customer invoices enter past_due status?`,
      context: "Determines grace period behavior and whether user experience is locked immediately or displays an alert banner.",
      options: [
        "Grace period banner (7 days) before API lockout (Recommended)",
        "Immediate hard-lock of paid endpoints and UI views",
        "Degraded read-only mode allowing historical data export",
      ],
      recommendedOption: "Grace period banner (7 days) before API lockout (Recommended)",
    });
  }
  // Domain 2: Collaborative Canvas / WebSockets / CRDT
  else if (lower.includes("canvas") || lower.includes("whiteboard") || lower.includes("crdt") || lower.includes("yjs") || lower.includes("collaborat")) {
    questions.push({
      id: "q1",
      question: `Which real-time synchronization strategy should be adopted for ${detectedProjectTitle}?`,
      context: "Affects state conflict resolution, offline capability, and WebSocket server memory overhead.",
      options: [
        "CRDT document synchronization with WebSocket pub/sub (Recommended)",
        "Operational Transformation (OT) with centralized coordinator",
        "Optimistic HTTP polling with server-side last-write-wins locking",
      ],
      recommendedOption: "CRDT document synchronization with WebSocket pub/sub (Recommended)",
    });
    questions.push({
      id: "q2",
      question: `How should ephemeral awareness (live multiplayer cursors & selection states) be routed?`,
      context: "High-frequency cursor movements require low-latency transport without overloading persistent database transactions.",
      options: [
        "Redis Pub/Sub channel bypassing the persistent DB (Recommended)",
        "Direct peer-to-peer WebRTC data channels with STUN/TURN fallback",
        "Volatile in-memory room maps on the application node",
      ],
      recommendedOption: "Redis Pub/Sub channel bypassing the persistent DB (Recommended)",
    });
  }
  // Domain 3: DevOps / CI-CD / Deployment / Canary
  else if (lower.includes("deploy") || lower.includes("canary") || lower.includes("pipeline") || lower.includes("kubernetes") || lower.includes("docker")) {
    questions.push({
      id: "q1",
      question: `What rollout orchestration pattern should drive releases for ${detectedProjectTitle}?`,
      context: "Balances automated error rollback guarantees against deployment velocity and infrastructure footprint.",
      options: [
        "Progressive traffic shifting (Canary 10% -> 50% -> 100%) with automated rollbacks (Recommended)",
        "Blue/Green instant traffic cutover via load balancer",
        "Rolling in-place replica replacement",
      ],
      recommendedOption: "Progressive traffic shifting (Canary 10% -> 50% -> 100%) with automated rollbacks (Recommended)",
    });
    questions.push({
      id: "q2",
      question: `What observability telemetry signal should trigger automated release abortion?`,
      context: "Prevents runaway customer-facing regressions from propagating into production.",
      options: [
        "Elevated HTTP 5xx error rate (>1%) and p99 latency spikes (Recommended)",
        "Failed synthetic healthcheck probes over 3 consecutive cycles",
        "Manual SRE / Engineering approval gate before 100% rollout",
      ],
      recommendedOption: "Elevated HTTP 5xx error rate (>1%) and p99 latency spikes (Recommended)",
    });
  }
  // Domain 4: Real-Time Messaging / Chat / Notifications
  else if (lower.includes("chat") || lower.includes("message") || lower.includes("inbox") || lower.includes("feed") || lower.includes("notification")) {
    questions.push({
      id: "q1",
      question: `How should unread counters and message delivery receipts be tracked at scale?`,
      context: "Heavy write-throughput operations can saturate primary relational databases if unindexed or un-cached.",
      options: [
        "Redis sorted sets with batched Postgres persistence (Recommended)",
        "Direct SQL counter increment with database row locking",
        "Client-side local storage timestamp diff against last read checkpoint",
      ],
      recommendedOption: "Redis sorted sets with batched Postgres persistence (Recommended)",
    });
    questions.push({
      id: "q2",
      question: `What delivery semantics are required for external push and email notifications?`,
      context: "Prevents duplicate alerts from hitting customer devices during worker crashes or queue retries.",
      options: [
        "At-least-once delivery with message deduplication IDs (Recommended)",
        "Best-effort fire-and-forget asynchronous dispatch",
        "Strict synchronous delivery before acknowledging the chat API",
      ],
      recommendedOption: "At-least-once delivery with message deduplication IDs (Recommended)",
    });
  }
  // Domain 5: AI / LLM Integration / Agents
  else if (lower.includes("ai") || lower.includes("agent") || lower.includes("llm") || lower.includes("gemini") || lower.includes("openai") || lower.includes("gpt")) {
    questions.push({
      id: "q1",
      question: `How should streaming LLM token responses and execution timeouts be handled?`,
      context: "Long generative completions require real-time user feedback and resilient cancellation when users navigate away.",
      options: [
        "Server-Sent Events (SSE) stream with AbortController cancellation (Recommended)",
        "WebSocket bidirectional streaming frame pipeline",
        "Polling on a background task execution ID",
      ],
      recommendedOption: "Server-Sent Events (SSE) stream with AbortController cancellation (Recommended)",
    });
    questions.push({
      id: "q2",
      question: `What fallback strategy should trigger when primary AI model quotas are exhausted?`,
      context: "Ensures high availability during free-tier rate limits, API outages, or provider degradation.",
      options: [
        "Multi-model cascade (Primary model with fast-tier fallback) (Recommended)",
        "Queue-based rate limiting with exponential backoff retries",
        "Strict client-side throttling with retry countdown timer",
      ],
      recommendedOption: "Multi-model cascade (Primary model with fast-tier fallback) (Recommended)",
    });
  }
  // Domain 6: Healthcare / Medical / HIPAA
  else if (lower.includes("medical") || lower.includes("doctor") || lower.includes("patient") || lower.includes("hipaa") || lower.includes("health")) {
    questions.push({
      id: "q1",
      question: `What compliance and data encryption architecture is required for patient data and notes?`,
      context: "Ensures compliance with HIPAA/HITECH regulations and secures protected health information (PHI).",
      options: [
        "End-to-end encrypted storage with audit-logged access controls (Recommended)",
        "Database-level column encryption with KMS managed keys",
        "Anonymized tokenized records with separate secure enclave for PHI",
      ],
      recommendedOption: "End-to-end encrypted storage with audit-logged access controls (Recommended)",
    });
    questions.push({
      id: "q2",
      question: `How should automated medical code generation interact with clinical validation workflows?`,
      context: "Determines whether AI coding is fully autonomous or requires physician sign-off before submission.",
      options: [
        "Assisted recommendation system with physician review & sign-off (Recommended)",
        "Fully autonomous batch generation with confidence score threshold",
        "Hybrid queue: high-confidence codes auto-approved, edge cases sent to human coders",
      ],
      recommendedOption: "Assisted recommendation system with physician review & sign-off (Recommended)",
    });
  }
  // Generic Domain: Tailored directly to the PRD title
  else {
    questions.push({
      id: "q1",
      question: `What primary architecture pattern should be prioritized for ${detectedProjectTitle} data persistence?`,
      context: `Determines foundational schema models, relationship integrity, and scalability for ${detectedProjectTitle}.`,
      options: [
        `Relational PostgreSQL with Prisma ORM for ${detectedProjectTitle} (Recommended)`,
        "Document-based JSON store with caching layer",
        "Event-driven append-only event stream",
      ],
      recommendedOption: `Relational PostgreSQL with Prisma ORM for ${detectedProjectTitle} (Recommended)`,
    });
    questions.push({
      id: "q2",
      question: `How should authentication, authorization, and multi-tenant scoping be structured?`,
      context: `Affects workspace isolation, permission boundaries, and session lifecycles across ${detectedProjectTitle}.`,
      options: [
        "Workspace-scoped role-based access control (RBAC) (Recommended)",
        "Project-level permissions with granular API token scopes",
        "Session token with decentralized claims validation",
      ],
      recommendedOption: "Workspace-scoped role-based access control (RBAC) (Recommended)",
    });
  }

  return {
    detectedProjectTitle,
    summary: `Analyzed technical requirements for ${detectedProjectTitle}.`,
    questions,
  };
}

function generateFallbackBreakdown(
  prdText: string,
  _answers: Record<string, string>
): ProjectBreakdownOutput {
  const firstLine = prdText.split("\n")[0]?.replace(/^#+\s*/, "").trim() || "Pillar System";
  const name = firstLine.substring(0, 30);
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4) || "PRJ";

  return validateAndRepairBreakdown({
    projectName: name,
    projectSlug: slug,
    description: "Structured project decomposed from product requirements.",
    isHackathonMode: false,
    deadline: null,
    modules: [
      { tempId: "mod-1", name: "Core Architecture", description: "Database models, schemas, and API foundation" },
      { tempId: "mod-2", name: "Feature Implementation", description: "Core domain logic and service layer" },
      { tempId: "mod-3", name: "User Interface & Experience", description: "Frontend components, views, and state" },
    ],
    labels: [
      { tempId: "lbl-1", name: "backend", color: "#10b981" },
      { tempId: "lbl-2", name: "frontend", color: "#3b82f6" },
      { tempId: "lbl-3", name: "database", color: "#8b5cf6" },
    ],
    issues: [
      {
        tempId: "iss-1",
        moduleTempId: "mod-1",
        title: "Define database schema and Prisma migrations",
        description: "Establish core models, indexes, and relations according to specifications.",
        priority: "HIGH",
        estimate: 3,
        labelTempIds: ["lbl-1", "lbl-3"],
        blockedByTempIds: [],
      },
      {
        tempId: "iss-2",
        moduleTempId: "mod-1",
        title: "Setup API service layer and validation schemas",
        description: "Implement input validators and business logic services.",
        priority: "HIGH",
        estimate: 5,
        labelTempIds: ["lbl-1"],
        blockedByTempIds: ["iss-1"],
      },
      {
        tempId: "iss-3",
        moduleTempId: "mod-2",
        title: "Implement primary domain endpoints and business workflows",
        description: "Build out Express routes and controllers with authentication checks.",
        priority: "MEDIUM",
        estimate: 5,
        labelTempIds: ["lbl-1"],
        blockedByTempIds: ["iss-2"],
      },
      {
        tempId: "iss-4",
        moduleTempId: "mod-3",
        title: "Develop frontend layout and component hierarchy",
        description: "Build responsive pages, studio views, and interactive controls.",
        priority: "MEDIUM",
        estimate: 3,
        labelTempIds: ["lbl-2"],
        blockedByTempIds: ["iss-3"],
      },
    ],
  });
}

// ==========================================
// GROQ PROVIDER (High-Speed & Generous Quota)
// ==========================================
export class GroqProvider implements AIProvider {
  private getModelsToTry(): string[] {
    const primary = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    const candidates = [primary, "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
    return Array.from(new Set(candidates));
  }

  private async callGroq(
    systemPrompt: string,
    userPrompt: string,
    modelName?: string
  ): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured in process.env");
    }

    const model = modelName || process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response returned from Groq API");
    }
    return content;
  }

  async generateStandup(payload: any) {
    const systemPrompt = `You are an AI assistant generating a daily standup draft.
Extract achievements for 'yesterday', relevant items for 'today', and items needing attention for 'attention'.
Format the output EXACTLY as this JSON object:
{ "yesterday": string[], "today": string[], "attention": string[] }
Return ONLY valid JSON. No markdown code blocks, no surrounding commentary.`;

    const userPrompt = `Strict constraints:
- Do not hallucinate.
- Every statement must be directly supported by the supplied facts.
- Do not infer completion, intent, causality, blockers, or future plans not present.
- Attention signals are signals, NOT confirmed blockers.
- Return only the required JSON structure.

Facts:
${JSON.stringify(payload, null, 2)}`;

    for (const model of this.getModelsToTry()) {
      try {
        const text = await this.callGroq(systemPrompt, userPrompt, model);
        const cleaned = cleanJsonText(text);
        return standupSchema.parse(JSON.parse(cleaned));
      } catch (err: any) {
        console.warn(`[GroqProvider] Standup generation with ${model} failed:`, err?.message || err);
      }
    }
    throw new Error("All Groq models failed for standup generation");
  }

  async analyzePrdClarifications(prdText: string): Promise<PrdClarificationsOutput> {
    const systemPrompt = `You are a Staff Technical Product Manager analyzing an unstructured PRD or feature specification.
Analyze the requirements and identify 2 to 3 critical technical ambiguities, architecture trade-offs, or scope boundaries that require developer clarification before breaking down the project.

For each ambiguity, provide:
1. id (e.g. "q1", "q2")
2. question: A concise, direct question
3. context: Why this decision matters technically
4. options: 2 to 4 concrete engineering options
5. recommendedOption: The recommended standard engineering best practice

Format the output EXACTLY as this JSON object:
{
  "detectedProjectTitle": string,
  "summary": string,
  "questions": [
    {
      "id": string,
      "question": string,
      "context": string,
      "options": string[],
      "recommendedOption": string
    }
  ]
}
Return ONLY the raw JSON object. No markdown code blocks. No surrounding text.`;

    const userPrompt = `Input Requirements:
${prdText.substring(0, 15000)}`;

    for (const model of this.getModelsToTry()) {
      try {
        const text = await this.callGroq(systemPrompt, userPrompt, model);
        const cleaned = cleanJsonText(text);
        const rawJson = JSON.parse(cleaned);
        return sanitizeClarifications(rawJson, prdText);
      } catch (err: any) {
        console.warn(`[GroqProvider] Clarification analysis with ${model} failed:`, err?.message || err);
      }
    }
    throw new Error("All Groq models failed for clarification analysis");
  }

  async generateProjectBreakdown(
    prdText: string,
    answers: Record<string, string> = {}
  ): Promise<ProjectBreakdownOutput> {
    const systemPrompt = `You are a Principal Engineering Lead decomposing a Product Requirement Document (PRD) into an engineering backlog matching Pillar's database schema.

Requirements:
- Project Slug: 2-4 uppercase characters representing the project acronym (e.g. "AUTH", "CART", "API").
- Modules: Group work into 2-6 logical engineering modules (e.g., "Core API", "UI Components", "Database & Migrations", "Integration"). Each with tempId ("mod-1", "mod-2").
- Labels: Provide 3-8 relevant technical labels with hex colors (e.g., {"tempId": "lbl-1", "name": "frontend", "color": "#3b82f6"}).
- Issues: Create 8-25 granular, actionable issues.
  - title: Specific and engineering-focused (e.g., "Implement JWT refresh token rotation").
  - description: Markdown bullet points outlining implementation steps and acceptance criteria.
  - moduleTempId: MUST be one of the declared module tempIds.
  - priority: MUST strictly be one of: "NONE", "LOW", "MEDIUM", "HIGH", "URGENT". (Use "MEDIUM", not "MED").
  - estimate: Fibonacci story points (1, 2, 3, 5, 8).
  - labelTempIds: Array of label tempIds.
  - blockedByTempIds: Array of issue tempIds that must be completed BEFORE this issue can start (technical prerequisites). Create a realistic dependency graph without circular references.

Format the output EXACTLY as this JSON object:
{
  "projectName": string,
  "projectSlug": string,
  "description": string,
  "isHackathonMode": boolean,
  "deadline": null,
  "modules": [
    { "tempId": string, "name": string, "description": string }
  ],
  "labels": [
    { "tempId": string, "name": string, "color": string }
  ],
  "issues": [
    {
      "tempId": string,
      "moduleTempId": string,
      "title": string,
      "description": string,
      "priority": "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "estimate": number,
      "labelTempIds": string[],
      "blockedByTempIds": string[]
    }
  ]
}
Return ONLY the raw JSON object. No markdown code blocks.`;

    const userPrompt = `Clarifications resolved by team:
${JSON.stringify(answers, null, 2)}

PRD Requirements:
${prdText.substring(0, 20000)}`;

    for (const model of this.getModelsToTry()) {
      try {
        const text = await this.callGroq(systemPrompt, userPrompt, model);
        const cleaned = cleanJsonText(text);
        const rawJson = JSON.parse(cleaned);
        return validateAndRepairBreakdown(rawJson);
      } catch (err: any) {
        console.warn(`[GroqProvider] Project breakdown with ${model} failed:`, err?.message || err);
      }
    }
    throw new Error("All Groq models failed for project breakdown");
  }
}

// ==========================================
// GEMINI PROVIDER (Google AI Studio)
// ==========================================
export class GeminiProvider implements AIProvider {
  private getModelsToTry(): string[] {
    const primary = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const candidates = [primary, "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-flash-lite-latest"];
    return Array.from(new Set(candidates));
  }

  private getModel(modelName?: string) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("[AI Service] GEMINI_API_KEY is not configured in process.env");
    }
    const client = new GoogleGenerativeAI(apiKey);
    return client.getGenerativeModel({
      model: modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
  }

  private async executeWithTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const msg = error?.message || "";
      const isTransient =
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("503") ||
        msg.includes("UNAVAILABLE");

      if (isTransient) {
        console.warn("Transient Gemini rate limit or 503 encountered. Retrying in 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return await fn();
      }
      throw error;
    }
  }

  async generateStandup(payload: any) {
    const model = this.getModel();

    const prompt = `
You are an AI assistant generating a daily standup draft.
Here are the factual activity summaries for the user.
Extract the achievements into a concise bulleted list for 'yesterday'.
Select and rewrite the most relevant items from today's candidates for 'today'. Do not list every assigned issue if there are many.
Identify items needing attention (stale issues, aging PRs, review workloads) without definitively calling them "blockers" unless explicitly factual.

Format the output EXACTLY as this JSON object: 
{ "yesterday": string[], "today": string[], "attention": string[] }

Return ONLY the raw JSON object. No markdown. No code blocks. No explanation. Start your response with { and end with }.

Strict constraints:
- Do not hallucinate.
- Every statement must be directly supported by the supplied facts.
- Do not infer completion, intent, causality, blockers, or future plans that are not present in the input.
- Attention signals are signals, NOT confirmed blockers.
- Do not invent information missing from the payload.
- Return only the required JSON structure.

Facts:
${JSON.stringify(payload, null, 2)}
`;

    try {
      let parsed;
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = cleanJsonText(response.text());
        parsed = standupSchema.parse(JSON.parse(text));
      } catch (parseError) {
        console.warn("First parse failed, retrying with stricter prompt...", parseError);
        const retryPrompt =
          prompt +
          "\n\nCRITICAL: Your previous response was invalid. Return ONLY valid JSON, no markdown, no code blocks, no explanation.";
        const retryResult = await model.generateContent(retryPrompt);
        const retryResponse = await retryResult.response;
        let retryText = cleanJsonText(retryResponse.text());
        parsed = standupSchema.parse(JSON.parse(retryText));
      }
      return parsed;
    } catch (e) {
      console.warn("Gemini API failed, falling back to mock generation:", e);

      const mockYesterday =
        payload.yesterday?.events?.length > 0
          ? ["Made progress on assigned tasks and moved issues on the board."]
          : ["No events logged yesterday."];

      const mockToday =
        payload.today?.assignedIssues?.length > 0
          ? payload.today.assignedIssues.map((i: any) => `Will work on: ${i.title}`)
          : ["No open issues assigned for today."];

      const mockAttention =
        payload.attention?.staleIssues?.length > 0
          ? ["Need to follow up on stale issues."]
          : ["No immediate blockers or stale issues."];

      return {
        yesterday: mockYesterday,
        today: mockToday,
        attention: mockAttention,
      };
    }
  }

  async analyzePrdClarifications(prdText: string): Promise<PrdClarificationsOutput> {
    const prompt = `
You are a Staff Technical Product Manager analyzing an unstructured PRD or feature specification.
Analyze the requirements and identify 2 to 3 critical technical ambiguities, architecture trade-offs, or scope boundaries that require developer clarification before breaking down the project.

For each ambiguity, provide:
1. id (e.g. "q1", "q2")
2. question: A concise, direct question
3. context: Why this decision matters technically
4. options: 2 to 4 concrete engineering options
5. recommendedOption: The recommended standard engineering best practice

Format the output EXACTLY as this JSON object:
{
  "detectedProjectTitle": string,
  "summary": string,
  "questions": [
    {
      "id": string,
      "question": string,
      "context": string,
      "options": string[],
      "recommendedOption": string
    }
  ]
}

Return ONLY the raw JSON object. No markdown code blocks. No surrounding text.

Input Requirements:
${prdText.substring(0, 15000)}
`;

    const modelsToTry = this.getModelsToTry();
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.getModel(modelName);
        const result = await this.executeWithTransientRetry(() => model.generateContent(prompt));
        const response = await result.response;
        const text = cleanJsonText(response.text());
        const rawJson = JSON.parse(text);
        return sanitizeClarifications(rawJson, prdText);
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Service] Clarification analysis with ${modelName} failed:`, err?.message || err);
      }
    }

    console.warn("All Gemini models failed or quota reached, generating dynamic contextual clarification:", lastError?.message);
    return generateFallbackClarifications(prdText);
  }

  async generateProjectBreakdown(
    prdText: string,
    answers: Record<string, string> = {}
  ): Promise<ProjectBreakdownOutput> {
    const model = this.getModel();

    const prompt = `
You are a Principal Engineering Lead decomposing a Product Requirement Document (PRD) into an engineering backlog matching Pillar's database schema.

Requirements:
- Project Slug: 2-4 uppercase characters representing the project acronym (e.g. "AUTH", "CART", "API").
- Modules: Group work into 2-6 logical engineering modules (e.g., "Core API", "UI Components", "Database & Migrations", "Integration"). Each with tempId ("mod-1", "mod-2").
- Labels: Provide 3-8 relevant technical labels with hex colors (e.g., {"tempId": "lbl-1", "name": "frontend", "color": "#3b82f6"}).
- Issues: Create 8-25 granular, actionable issues.
  - title: Specific and engineering-focused (e.g., "Implement JWT refresh token rotation").
  - description: Markdown bullet points outlining implementation steps and acceptance criteria.
  - moduleTempId: MUST be one of the declared module tempIds.
  - priority: MUST strictly be one of: "NONE", "LOW", "MEDIUM", "HIGH", "URGENT". Note: use "MEDIUM", do not use "MED".
  - estimate: Fibonacci story points (1, 2, 3, 5, 8).
  - labelTempIds: Array of label tempIds.
  - blockedByTempIds: Array of issue tempIds that must be completed BEFORE this issue can start (technical prerequisites). Create a realistic dependency graph without circular references.

Clarifications resolved by team:
${JSON.stringify(answers, null, 2)}

Format the output EXACTLY as this JSON object:
{
  "projectName": string,
  "projectSlug": string,
  "description": string,
  "isHackathonMode": boolean,
  "deadline": null,
  "modules": [
    { "tempId": string, "name": string, "description": string }
  ],
  "labels": [
    { "tempId": string, "name": string, "color": string }
  ],
  "issues": [
    {
      "tempId": string,
      "moduleTempId": string,
      "title": string,
      "description": string,
      "priority": "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "estimate": number,
      "labelTempIds": string[],
      "blockedByTempIds": string[]
    }
  ]
}

Return ONLY the raw JSON object. No markdown code blocks. No surrounding text.

PRD Requirements:
${prdText.substring(0, 20000)}
`;

    let currentPrompt = prompt;
    let attempts = 0;
    const maxRetries = 2;

    while (attempts <= maxRetries) {
      try {
        const result = await this.executeWithTransientRetry(() => model.generateContent(currentPrompt));
        const response = await result.response;
        const text = cleanJsonText(response.text());
        const rawJson = JSON.parse(text);
        return validateAndRepairBreakdown(rawJson);
      } catch (err: any) {
        attempts++;
        console.warn(`Breakdown validation failed on attempt ${attempts}:`, err.message);

        if (attempts > maxRetries) {
          console.warn("Max retries exhausted for AI breakdown. Falling back to structured deterministic breakdown.");
          return generateFallbackBreakdown(prdText, answers);
        }

        currentPrompt = `${prompt}\n\nCRITICAL FIX REQUIRED (Attempt ${attempts} failed):
Your previous response failed validation with the following error:
${err.message}
Ensure:
1. All moduleTempId values in issues match declared modules.
2. All labelTempIds match declared labels.
3. Priority is strictly "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT".
4. Output valid JSON only.`;
      }
    }

    return generateFallbackBreakdown(prdText, answers);
  }
}

// ==========================================
// UNIVERSAL COMPOSITE PROVIDER (Groq -> Gemini -> Fallback)
// ==========================================
export class UniversalAIProvider implements AIProvider {
  private groqProvider = new GroqProvider();
  private geminiProvider = new GeminiProvider();

  private isGroqConfigured(): boolean {
    const key = process.env.GROQ_API_KEY;
    return typeof key === "string" && key.trim().length > 0;
  }

  async generateStandup(payload: any) {
    if (this.isGroqConfigured()) {
      try {
        return await this.groqProvider.generateStandup(payload);
      } catch (err: any) {
        console.warn("[AI Service] Groq standup generation failed, falling back to Gemini:", err?.message || err);
      }
    }
    return this.geminiProvider.generateStandup(payload);
  }

  async analyzePrdClarifications(prdText: string): Promise<PrdClarificationsOutput> {
    if (this.isGroqConfigured()) {
      try {
        console.log("[AI Service] Analyzing PRD Clarifications via Groq...");
        return await this.groqProvider.analyzePrdClarifications(prdText);
      } catch (err: any) {
        console.warn("[AI Service] Groq clarification failed, falling back to Gemini:", err?.message || err);
      }
    }
    return this.geminiProvider.analyzePrdClarifications(prdText);
  }

  async generateProjectBreakdown(
    prdText: string,
    answers: Record<string, string> = {}
  ): Promise<ProjectBreakdownOutput> {
    if (this.isGroqConfigured()) {
      try {
        console.log("[AI Service] Generating Project Breakdown via Groq...");
        return await this.groqProvider.generateProjectBreakdown(prdText, answers);
      } catch (err: any) {
        console.warn("[AI Service] Groq breakdown generation failed, falling back to Gemini:", err?.message || err);
      }
    }
    return this.geminiProvider.generateProjectBreakdown(prdText, answers);
  }
}

export const aiService = new UniversalAIProvider();
