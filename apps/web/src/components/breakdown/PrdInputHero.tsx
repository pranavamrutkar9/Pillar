"use client";

import { useState } from "react";
import { Sparkles, FileText, ArrowRight, Loader2, BookOpen, Info } from "lucide-react";

interface PrdInputHeroProps {
  onAnalyze: (payload: { prdText: string }) => void;
  isLoading: boolean;
  initialText?: string;
}

const DEMO_PRESETS = [
  {
    title: "Stripe Billing & Webhook Engine",
    badge: "Payments & SaaS",
    description: "Multi-tier subscription billing with customer portal, webhook idempotent handler, and proration calculations.",
    text: `# Stripe Billing & Webhook Engine (PRD)

## Objective
Build an enterprise-ready subscription billing infrastructure supporting self-service checkout, usage-based metering, and reliable webhook ingestion.

## Key Modules & Requirements
1. Customer & Plan Catalog
- Tier management (Starter, Pro, Enterprise) with monthly and annual billing intervals.
- Currency support (USD, EUR, GBP) and automatic tax calculation via Stripe Tax.

2. Checkout & Customer Portal
- Hosted checkout session generation with metadata linking to Pillar workspace ID.
- Embedded customer billing portal for payment method updates and invoice downloads.

3. Resilient Webhook Processing
- Idempotent event ingestion worker listening for invoice.payment_succeeded, customer.subscription.updated, and customer.subscription.deleted.
- Signature verification with Stripe secret and Redis deduplication cache.
- Automatic retry queue for transient database connection drops.

4. Entitlement & Usage Guard
- Middleware checking active subscription status before API access.
- Grace period banner when payment fails (past_due state) with email warning notification.
`
  },
  {
    title: "Real-Time Collaboration Canvas",
    badge: "WebSockets & CRDT",
    description: "Multiplayer whiteboarding canvas with optimistic local updates, conflict resolution, and live cursor presence.",
    text: `# Real-Time Collaboration Canvas (PRD)

## Objective
Deliver a fluid, 60fps multiplayer whiteboard canvas allowing multiple engineers to diagram architectures simultaneously with zero data loss.

## Functional Requirements
1. Infinite Vector Canvas Engine
- Pan, zoom, and transform matrix controller with hardware-accelerated SVG/HTML5 canvas.
- Sticky notes, shape tools (rectangles, diamonds, arrows), text boxes, and connectors with snap-to-grid.

2. State Sync & Conflict Resolution
- State synchronization over WebSockets with room partitioning per project.
- CRDT-based state reconciliation ensuring convergence across disconnected clients.
- Offline buffering: local IndexedDB cache that syncs changes when network reconnects.

3. Multiplayer Presence & Awareness
- Broadcast live cursor coordinates (x, y) with user avatars and localized name tags.
- Ephemeral selection highlights showing which component another user is currently dragging.

4. Export & Snapshot System
- One-click export to PNG, SVG, and structured JSON.
- Version history snapshotting allowing rollback to any past milestone state.
`
  },
  {
    title: "DevOps CI/CD Incident Pipeline",
    badge: "Automation & GitHub",
    description: "Autonomous canary deployment runner with rollback triggers, health checks, and Slack alerts.",
    text: `# DevOps CI/CD Incident Pipeline (PRD)

## Objective
Automate post-merge deployment validation with automated rollback triggers based on Prometheus metrics and incident alert triage.

## Core Scope
1. Deployment Orchestrator
- Webhook trigger on GitHub pull request merge to main.
- Step executor: Build container -> Push to registry -> Deploy canary pod to Kubernetes cluster.

2. Automated Health Analyzer
- 10-minute canary evaluation listening to error rate spikes (HTTP 5xx > 1%) and p99 latency regressions.
- Automated rollback engine that restores previous replica set if SLO thresholds are violated.

3. Incident Communication & Notification
- Instant Slack and Discord dispatch with diff summary, commit author, and rollback reason.
- Automatic creation of Pillar incident ticket with severity: URGENT and assignees.
`
  }
];

export default function PrdInputHero({
  onAnalyze,
  isLoading,
  initialText = ""
}: PrdInputHeroProps) {
  const [prdText, setPrdText] = useState(initialText);
  const [activePresetBadge, setActivePresetBadge] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prdText.trim()) return;
    onAnalyze({ prdText: prdText.trim() });
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setPrdText(preset.text);
    setActivePresetBadge(preset.title);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Feature 2 · The 90-Second Demo</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          PRD to Project Breakdown
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Paste any product spec, user stories, or unstructured notes. Pillar&apos;s Gemini engine decomposes it into modules, issues, estimates, and dependencies in seconds.
        </p>
      </div>

      {/* Demo Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            1-Click Demo Presets (Instant 90s Presentation)
          </span>
          {activePresetBadge && (
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              Loaded: {activePresetBadge}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {preset.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {preset.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 px-6 py-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>PRD / Markdown Specification</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {prdText.length} / 25,000 characters
          </span>
        </div>

        {/* Textarea Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <textarea
              id="prdText"
              rows={12}
              value={prdText}
              onChange={(e) => setPrdText(e.target.value)}
              placeholder="Paste requirements here... e.g. # Authentication System&#10;- Support GitHub OAuth and email magic links&#10;- Session tokens must expire in 7 days&#10;- Organization RBAC roles: Owner, Admin, Member"
              className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono leading-relaxed resize-y"
              required
            />
          </div>

          {/* V2 Notion OAuth Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            <Info className="w-4 h-4 flex-shrink-0 text-violet-500 mt-0.5" />
            <div>
              <strong>Working in Notion?</strong> Copy and paste your Notion document content or Markdown directly into the field above. Direct Notion workspace OAuth integration is scheduled for V2.
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !prdText.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium text-sm shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Requirements...
                </>
              ) : (
                <>
                  <span>Analyze with Gemini</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
