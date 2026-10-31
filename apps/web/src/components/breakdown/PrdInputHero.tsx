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
    badge: "Payments",
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
    badge: "CRDT & Sync",
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
- Broadcast live cursor positions at 30Hz throttled intervals.
- Ephemeral selection boxes indicating what element another collaborator is modifying.
`
  },
  {
    title: "Zero-Downtime Migration Pipeline",
    badge: "Infra & DB",
    description: "Phased schema migration runner with dual-writing, verification backfill, and automatic rollback guardrails.",
    text: `# Zero-Downtime Migration Pipeline (PRD)

## Objective
Enable continuous schema evolution on multi-gigabyte production databases without taking API endpoints offline or locking tables.

## Requirements
1. Expand and Contract Lifecycle
- Tooling to enforce non-destructive backward-compatible migrations (nullable columns, default values).
- Dual-write application triggers supporting old and new column representations concurrently.

2. Verification & Historical Backfill
- Background worker chunking historical table records in 500-row batches.
- Checksum comparison validator verifying consistency between old and new columns.

3. Cutover & Cleanup
- Automated blue-green connection switcher pointing queries to new column definitions once backfill passes 100%.
- Safe deferred cleanup migration to prune deprecated database artifacts.
`
  }
];

export default function PrdInputHero({ onAnalyze, isLoading, initialText = "" }: PrdInputHeroProps) {
  const [prdText, setPrdText] = useState(initialText);
  const [inputError, setInputError] = useState<string | null>(null);
  const [activePresetBadge, setActivePresetBadge] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prdText.trim()) {
      setInputError("Please provide product requirements or select a preset below.");
      return;
    }
    if (prdText.trim().length < 40) {
      setInputError("Please enter a slightly more detailed specification (at least 40 characters).");
      return;
    }
    setInputError(null);
    onAnalyze({ prdText });
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setPrdText(preset.text);
    setActivePresetBadge(preset.title);
    setInputError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          <span>Requirements Decomposition</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          PRD to Project Breakdown
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Paste any product brief, user stories, or architecture notes. Pillar breaks it down into structured modules, estimated issues, and dependencies.
        </p>
      </div>

      {/* Demo Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Quick Presets
          </span>
          {activePresetBadge && (
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
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
              className="text-left p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xs transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white">
                  {preset.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                  {preset.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/60 dark:bg-zinc-900/40 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>PRD / Markdown Specification</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {prdText.length} characters
          </span>
        </div>

        {/* Textarea Content */}
        <div className="p-5 space-y-3.5">
          <div className="space-y-1.5">
            <textarea
              id="prdText"
              rows={10}
              value={prdText}
              onChange={(e) => {
                setPrdText(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Paste requirements here... e.g. # Authentication System&#10;- Support GitHub OAuth and email magic links&#10;- Session tokens must expire in 7 days&#10;- Organization RBAC roles: Owner, Admin, Member"
              className={`w-full p-3.5 rounded-xl border ${
                inputError ? "border-red-300 dark:border-red-800 bg-red-50/20" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40"
              } focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-xs font-mono leading-relaxed resize-y`}
            />
            {inputError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {inputError}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Requirements...</span>
                </>
              ) : (
                <>
                  <span>Analyze PRD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
