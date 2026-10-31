"use client";

import { useState, useEffect } from "react";
import { HelpCircle, ArrowRight, ArrowLeft, FastForward, Loader2, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  context: string;
  options: string[];
  recommendedOption?: string;
}

interface ClarificationCardsProps {
  projectTitle: string;
  summary: string;
  questions: Question[];
  onGenerate: (answers: Record<string, string>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function ClarificationCards({
  projectTitle,
  summary,
  questions,
  onGenerate,
  onBack,
  isLoading,
}: ClarificationCardsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const q of questions) {
      if (q.recommendedOption) {
        initial[q.id] = q.recommendedOption;
      } else if (q.options?.length > 0) {
        initial[q.id] = q.options[0];
      }
    }
    return initial;
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const q of questions) {
      if (q.recommendedOption) {
        initial[q.id] = q.recommendedOption;
      } else if (q.options?.length > 0) {
        initial[q.id] = q.options[0];
      }
    }
    setAnswers(initial);
    setCustomAnswers({});
  }, [questions]);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setCustomAnswers((prev) => ({ ...prev, [questionId]: "" }));
  };

  const handleCustomChange = (questionId: string, text: string) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: text }));
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(answers);
  };

  const handleProceedWithDefaults = () => {
    const defaultAnswers: Record<string, string> = {};
    for (const q of questions) {
      defaultAnswers[q.id] = q.recommendedOption || q.options[0] || "Standard best practice";
    }
    onGenerate(defaultAnswers);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Title & Context Banner */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 space-y-1.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>STAGE 02 · ARCHITECTURAL CLARIFICATIONS</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {projectTitle}
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {summary} Confirm these technical decisions to produce well-scoped issues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xs space-y-2.5"
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400">Question {idx + 1} of {questions.length}</span>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {q.question}
              </h3>
            </div>

            <p className="text-xs text-zinc-500">
              {q.context}
            </p>

            {/* Options List */}
            <div className="space-y-1.5 pt-1">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                const isRecommended = q.recommendedOption === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(q.id, option)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                        : "border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {isSelected && <div className="w-1 h-1 bg-white dark:bg-zinc-900 rounded-full" />}
                      </div>
                      <span>{option}</span>
                    </div>
                    {isRecommended && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom Write-in */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Or provide a custom technical choice..."
                  value={customAnswers[q.id] || ""}
                  onChange={(e) => handleCustomChange(q.id, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to PRD</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleProceedWithDefaults}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
            >
              <FastForward className="w-3 h-3" />
              <span>Use Recommendations</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-medium text-xs shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Breakdown...</span>
                </>
              ) : (
                <>
                  <span>Generate Breakdown</span>
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
