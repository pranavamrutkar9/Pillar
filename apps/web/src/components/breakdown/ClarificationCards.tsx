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
    <div className="space-y-6 max-w-3xl mx-auto text-[#EDEDED]">
      {/* Title & Context Banner */}
      <div className="p-6 rounded-xl border border-white/[0.08] bg-[#141519] space-y-2 shadow-xl">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#5E6AD2]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>STAGE 02 · ARCHITECTURAL CLARIFICATIONS</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#EDEDED]">
          {projectTitle}
        </h2>
        <p className="text-xs text-[#8A8F98] leading-relaxed">
          {summary} Confirm these technical decisions to produce well-scoped issues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-5 rounded-xl border border-white/[0.08] bg-[#141519] shadow-md space-y-3"
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-[#626773]">Question {idx + 1} of {questions.length}</span>
              <h3 className="text-sm font-semibold text-[#EDEDED] mt-0.5">
                {q.question}
              </h3>
            </div>

            <p className="text-xs text-[#8A8F98]">
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
                    className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-[#5E6AD2] bg-[#5E6AD2]/10 text-[#EDEDED] font-medium"
                        : "border-white/[0.06] bg-[#0B0C0E] text-[#8A8F98] hover:border-white/20 hover:text-[#EDEDED]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[#5E6AD2] bg-[#5E6AD2]"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                      </div>
                      <span>{option}</span>
                    </div>
                    {isRecommended && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#5E6AD2]/10 text-[#8B96FF] border border-[#5E6AD2]/30 flex items-center gap-1">
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
                  className="w-full px-3 py-2 rounded-md border border-white/10 bg-[#0B0C0E] text-xs text-[#EDEDED] placeholder:text-[#626773] focus:outline-none focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 transition-colors"
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
            className="inline-flex items-center gap-1.5 text-xs text-[#8A8F98] hover:text-[#EDEDED] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to PRD</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleProceedWithDefaults}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md border border-white/10 bg-[#141519] hover:bg-white/[0.04] text-xs font-medium text-[#EDEDED] transition-colors shadow-sm"
            >
              <FastForward className="w-3 h-3 text-[#5E6AD2]" />
              <span>Use Recommendations</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#5E6AD2] hover:bg-[#525ec2] text-white font-medium text-xs shadow-[0_0_16px_rgba(94,106,210,0.4)] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Breakdown...</span>
                </>
              ) : (
                <>
                  <span>Review Project Plan</span>
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
