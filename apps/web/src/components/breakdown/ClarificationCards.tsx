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
  // Pre-seed answers with recommended options
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

  // Reset/sync answers whenever questions change
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
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          <HelpCircle className="w-4 h-4" />
          <span>Stage 2 · Clarify Technical Ambiguities</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {projectTitle}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {summary} Gemini spotted these key architectural decisions before constructing the issue graph.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400">Question {idx + 1} of {questions.length}</span>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {q.question}
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {q.context}
            </p>

            {/* Options List */}
            <div className="space-y-2 pt-1">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                const isRecommended = q.recommendedOption === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(q.id, option)}
                    className={`w-full text-left p-3 rounded-xl border text-sm flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/30 text-violet-900 dark:text-violet-200 font-medium"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span>{option}</span>
                    </div>
                    {isRecommended && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
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
                  placeholder="Or write a custom answer..."
                  value={customAnswers[q.id] || ""}
                  onChange={(e) => handleCustomChange(q.id, e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
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
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PRD
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleProceedWithDefaults}
              disabled={isLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              Proceed with Defaults (Speedrun)
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Breakdown...
                </>
              ) : (
                <>
                  <span>Generate Breakdown</span>
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
