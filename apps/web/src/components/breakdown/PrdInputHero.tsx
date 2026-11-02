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
    <div className="space-y-6 max-w-4xl mx-auto text-[#EDEDED]">
      {/* Hero Header */}
      <div className="text-center max-w-xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#8B96FF] bg-[#5E6AD2]/10 border border-[#5E6AD2]/30 shadow-[0_0_12px_rgba(94,106,210,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2]" />
          <span>Requirements Decomposition Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDEDED]">
          PRD to Project Breakdown
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed">
          Paste any product brief, user stories, or architecture notes. Pillar breaks it down into structured modules, estimated issues, and dependencies.
        </p>
      </div>

      {/* Demo Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-[#626773] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#5E6AD2]" />
            Quick Presets
          </span>
          {activePresetBadge && (
            <span className="text-xs text-[#8B96FF] font-mono">
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
              className="text-left p-4 rounded-xl border border-white/[0.08] bg-[#141519] hover:bg-white/[0.03] hover:border-white/20 transition-all group cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors">
                  {preset.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8A8F98]">
                  {preset.badge}
                </span>
              </div>
              <p className="text-xs text-[#8A8F98] line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#141519] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0B0C0E] px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#EDEDED]">
            <FileText className="w-3.5 h-3.5 text-[#5E6AD2]" />
            <span>PRD / Markdown Specification</span>
          </div>
          <span className="text-[11px] text-[#626773] font-mono">
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
              className={`w-full p-4 rounded-lg border ${
                inputError ? "border-[#F43F5E]/50 bg-[#F43F5E]/5 text-[#F43F5E]" : "border-white/10 bg-[#0B0C0E] text-[#EDEDED]"
              } focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 text-xs font-mono leading-relaxed resize-y placeholder:text-[#626773]`}
            />
            {inputError && (
              <p className="text-xs text-[#F43F5E] font-medium">
                {inputError}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#5E6AD2] hover:bg-[#525ec2] disabled:opacity-50 text-white font-medium text-xs shadow-[0_0_16px_rgba(94,106,210,0.4)] transition-all cursor-pointer"
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
