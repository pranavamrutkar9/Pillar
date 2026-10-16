"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PrdInputHero from "./PrdInputHero";
import ClarificationCards from "./ClarificationCards";
import BreakdownEditorStudio, { ProjectBreakdownData } from "./BreakdownEditorStudio";
import {
  analyzePrdAction,
  generateBreakdownAction,
  commitBreakdownAction,
} from "../../actions/prdBreakdownActions";

interface ClientBreakdownFlowProps {
  workspaceId: string;
}

export default function ClientBreakdownFlow({ workspaceId }: ClientBreakdownFlowProps) {
  const router = useRouter();

  // Step state (1: Input, 2: Clarify, 3: Studio)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Ingestion data
  const [prdText, setPrdText] = useState("");
  const [normalizedText, setNormalizedText] = useState("");

  // Clarification data
  const [analysis, setAnalysis] = useState<{
    detectedProjectTitle: string;
    summary: string;
    questions: any[];
  } | null>(null);

  // Breakdown preview data
  const [breakdown, setBreakdown] = useState<ProjectBreakdownData | null>(null);

  // Loading & error handling
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side Idempotency Key (persisted across retries)
  const [idempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  // ==========================================
  // HANDLERS
  // ==========================================

  // Step 1 -> Step 2: Analyze requirements
  const handleAnalyze = async (payload: { prdText: string }) => {
    setLoading(true);
    setError(null);
    try {
      setPrdText(payload.prdText);

      const result = await analyzePrdAction(workspaceId, payload);
      setNormalizedText(result.normalizedPrdText || payload.prdText || "");
      setAnalysis({
        detectedProjectTitle: result.detectedProjectTitle,
        summary: result.summary,
        questions: result.questions,
      });
      setStep(2);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze requirements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Generate breakdown JSON
  const handleGenerate = async (answers: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBreakdownAction(workspaceId, {
        prdText: normalizedText || prdText,
        answers,
      });
      setBreakdown(result);
      setStep(3);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate project breakdown. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Commit to Database (Single atomic transaction)
  const handleCommit = async (finalData: ProjectBreakdownData) => {
    setCommitting(true);
    setError(null);
    try {
      const result = await commitBreakdownAction(workspaceId, {
        breakdown: finalData,
        idempotencyKey,
      });

      // Instantly navigate directly to the new project's board!
      router.push(`/projects/${result.projectId}/issues`);
    } catch (err: any) {
      console.error("Commit error:", err);
      setError(err.message || "Failed to create project in database. Please review edits and retry.");
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href={`/workspaces/${workspaceId}/projects`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        {/* 3-Step Wizard Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${
              step === 1
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <span>1</span>
            <span>Input PRD</span>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${
              step === 2
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <span>2</span>
            <span>Clarifications</span>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${
              step === 3
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <span>3</span>
            <span>Breakdown Studio</span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-xs mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Step Views */}
      {step === 1 && (
        <PrdInputHero
          onAnalyze={handleAnalyze}
          isLoading={loading}
          initialText={prdText}
        />
      )}

      {step === 2 && analysis && (
        <ClarificationCards
          key={`${analysis.detectedProjectTitle}-${analysis.questions.length}`}
          projectTitle={analysis.detectedProjectTitle}
          summary={analysis.summary}
          questions={analysis.questions}
          onGenerate={handleGenerate}
          onBack={() => setStep(1)}
          isLoading={loading}
        />
      )}

      {step === 3 && breakdown && (
        <BreakdownEditorStudio
          initialData={breakdown}
          onCommit={handleCommit}
          onBack={() => setStep(2)}
          isCommitting={committing}
        />
      )}
    </div>
  );
}
