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
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {/* Title & Context Window */}
      <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#FFE600] text-black">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-black" />
            <span>Stage 02 · Architectural Clarifications</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full border border-black bg-[#FF6B6B]" />
            <span className="w-3 h-3 rounded-full border border-black bg-white" />
            <span className="w-3 h-3 rounded-full border border-black bg-[#4ADE80]" />
          </div>
        </div>

        <div className="p-6 space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
            {projectTitle}
          </h2>
          <p className="text-xs font-medium text-black/70 dark:text-white/70 leading-relaxed">
            {summary} Confirm these technical decisions to produce well-scoped issues and clean module boundaries.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 border-3 border-black dark:border-white bg-white dark:bg-[#181920] shadow-neo space-y-3"
          >
            <div>
              <span className="inline-block px-2 py-0.5 mb-1.5 bg-[#38BDF8] text-black border border-black text-[10px] font-black uppercase tracking-wider">
                Question {idx + 1} of {questions.length}
              </span>
              <h3 className="text-base font-black text-black dark:text-white uppercase tracking-tight">
                {q.question}
              </h3>
            </div>

            <p className="text-xs font-medium text-black/70 dark:text-white/70">
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
                    className={`w-full text-left p-3.5 border-2 text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-black dark:border-white bg-[#FFE600] text-black font-black shadow-neo-sm"
                        : "border-black/30 dark:border-white/30 bg-[#FFFDF8] dark:bg-[#20222a] text-black dark:text-white hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 border-2 border-black flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-black" : "bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-[#FFE600]" />}
                      </div>
                      <span className="font-bold">{option}</span>
                    </div>
                    {isRecommended && (
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 bg-[#4ADE80] text-black border border-black flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-black" />
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom Write-in */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Or enter a custom technical choice..."
                  value={customAnswers[q.id] || ""}
                  onChange={(e) => handleCustomChange(q.id, e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a] text-xs font-medium text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#181920] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to PRD</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleProceedWithDefaults}
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-black bg-white dark:bg-[#20222a] text-xs font-black uppercase tracking-wider text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Use Defaults</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Generating Breakdown...</span>
                </>
              ) : (
                <>
                  <span>Generate Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
