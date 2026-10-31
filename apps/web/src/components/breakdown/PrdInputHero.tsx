"use client";

import { useState } from "react";
import { Sparkles, FileText, ArrowRight, Loader2, BookOpen } from "lucide-react";

interface PrdInputHeroProps {
  onAnalyze: (payload: { prdText: string }) => void;
  isLoading: boolean;
  initialText?: string;
}

const DEMO_PRESETS = [
  {
    title: "Stripe Billing & Webhooks",
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
    title: "Real-Time Canvas Engine",
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
    title: "Zero-Downtime Migration",
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Hero Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Stage 01 · Requirements Decomposition</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white">
          PRD to Project Breakdown
        </h1>
        <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 leading-relaxed">
          Paste any product brief, user stories, or architecture notes. Pillar breaks it down into structured modules, estimated issues, and dependencies.
        </p>
      </div>

      {/* Demo Presets Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-black dark:text-white" />
            Quick Presets
          </span>
          {activePresetBadge && (
            <span className="text-xs font-mono font-bold text-black/70 dark:text-white/70">
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
              className="text-left p-4 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white group-hover:text-black">
                  {preset.title}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#4ADE80] text-black border border-black">
                  {preset.badge}
                </span>
              </div>
              <p className="text-xs font-medium text-black/60 dark:text-white/60 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container Window */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo overflow-hidden">
        {/* Form Window Header */}
        <div className="flex items-center justify-between border-b-3 border-black dark:border-white bg-[#FFE600] px-5 py-3 text-black">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <FileText className="w-4 h-4 text-black" />
            <span>PRD / Markdown Specification</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold">
              {prdText.length} CHARS
            </span>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
              <span className="w-3 h-3 rounded-full border border-black bg-white" />
              <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
            </div>
          </div>
        </div>

        {/* Textarea Content */}
        <div className="p-5 md:p-6 space-y-4">
          <div className="space-y-1.5">
            <textarea
              id="prdText"
              rows={12}
              value={prdText}
              onChange={(e) => {
                setPrdText(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Paste requirements here... e.g. # Authentication System&#10;- Support GitHub OAuth and email magic links&#10;- Session tokens must expire in 7 days&#10;- Organization RBAC roles: Owner, Admin, Member"
              className={`w-full p-4 border-2 ${
                inputError ? "border-[#FF6B6B] bg-[#FF6B6B]/10" : "border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a]"
              } focus:outline-none focus:ring-2 focus:ring-[#FFE600] text-xs font-mono font-medium leading-relaxed resize-y text-black dark:text-white`}
            />
            {inputError && (
              <p className="text-xs font-bold text-[#DC2626] dark:text-[#FF6B6B]">
                {inputError}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Analyzing Requirements...</span>
                </>
              ) : (
                <>
                  <span>Analyze PRD Now</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
