"use client";

import { useState, useMemo } from "react";
import {
  Layers,
  CheckSquare,
  GitBranch,
  Flame,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export type PriorityType = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ModuleItem {
  tempId: string;
  name: string;
  description?: string;
}

export interface LabelItem {
  tempId: string;
  name: string;
  color: string;
}

export interface IssueItem {
  tempId: string;
  moduleTempId: string;
  title: string;
  description: string;
  priority: PriorityType;
  estimate?: number;
  labelTempIds: string[];
  blockedByTempIds: string[];
}

export interface ProjectBreakdownData {
  projectName: string;
  projectSlug: string;
  description: string;
  isHackathonMode: boolean;
  deadline?: string | null;
  modules: ModuleItem[];
  labels: LabelItem[];
  issues: IssueItem[];
  repairedChanges?: string[];
}

interface BreakdownEditorStudioProps {
  initialData: ProjectBreakdownData;
  onCommit: (data: ProjectBreakdownData) => void;
  onBack: () => void;
  isCommitting: boolean;
}

const PRIORITY_CONFIG: Record<PriorityType, { label: string; color: string; bg: string }> = {
  NONE: { label: "None", color: "text-[#626773]", bg: "bg-white/[0.04]" },
  LOW: { label: "Low", color: "text-[#38BDF8]", bg: "bg-[#38BDF8]/10" },
  MEDIUM: { label: "Medium", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" },
  HIGH: { label: "High", color: "text-[#FB923C]", bg: "bg-[#FB923C]/10" },
  URGENT: { label: "Urgent", color: "text-[#F43F5E]", bg: "bg-[#F43F5E]/10" },
};

const ESTIMATE_OPTIONS = [1, 2, 3, 5, 8, 13];

export default function BreakdownEditorStudio({
  initialData,
  onCommit,
  onBack,
  isCommitting,
}: BreakdownEditorStudioProps) {
  const [data, setData] = useState<ProjectBreakdownData>(initialData);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Cycle Detection
  const cycleWarning = useMemo(() => {
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const iss of data.issues) {
      adj.set(iss.tempId, []);
      inDegree.set(iss.tempId, 0);
    }

    for (const iss of data.issues) {
      for (const blocker of iss.blockedByTempIds || []) {
        if (adj.has(blocker)) {
          adj.get(blocker)!.push(iss.tempId);
          inDegree.set(iss.tempId, (inDegree.get(iss.tempId) || 0) + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    let visitedCount = 0;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      visitedCount++;
      for (const neighbor of adj.get(curr) || []) {
        const nextDeg = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, nextDeg);
        if (nextDeg === 0) queue.push(neighbor);
      }
    }

    return visitedCount < data.issues.length;
  }, [data.issues]);

  // Derived Metrics
  const totalPoints = useMemo(
    () => data.issues.reduce((acc, iss) => acc + (iss.estimate || 0), 0),
    [data.issues]
  );

  const totalDependencies = useMemo(
    () => data.issues.reduce((acc, iss) => acc + (iss.blockedByTempIds?.length || 0), 0),
    [data.issues]
  );

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleUpdateProjectMeta = (key: keyof ProjectBreakdownData, val: any) => {
    setData((prev) => ({ ...prev, [key]: val }));
  };

  const handleUpdateIssue = (tempId: string, updates: Partial<IssueItem>) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues.map((i) => (i.tempId === tempId ? { ...i, ...updates } : i)),
    }));
  };

  const handleDeleteIssue = (tempId: string) => {
    setData((prev) => ({
      ...prev,
      issues: prev.issues
        .filter((i) => i.tempId !== tempId)
        .map((i) => ({
          ...i,
          blockedByTempIds: (i.blockedByTempIds || []).filter((b) => b !== tempId),
        })),
    }));
  };

  const handleAddIssue = (moduleTempId: string) => {
    const nextIdx = data.issues.length + 1;
    const newIssue: IssueItem = {
      tempId: `iss-new-${Date.now()}`,
      moduleTempId,
      title: `New task ${nextIdx}`,
      description: "Implementation details...",
      priority: "MEDIUM",
      estimate: 2,
      labelTempIds: [],
      blockedByTempIds: [],
    };
    setData((prev) => ({ ...prev, issues: [...prev.issues, newIssue] }));
  };

  const handleAddModule = () => {
    const nextIdx = data.modules.length + 1;
    const newModule: ModuleItem = {
      tempId: `mod-new-${Date.now()}`,
      name: `Module ${nextIdx}`,
      description: "Description of module responsibilities",
    };
    setData((prev) => ({ ...prev, modules: [...prev.modules, newModule] }));
  };

  const handleDeleteModule = (moduleTempId: string) => {
    if (data.modules.length <= 1) {
      alert("A project must have at least one module.");
      return;
    }
    const remainingModules = data.modules.filter((m) => m.tempId !== moduleTempId);
    const fallbackModuleId = remainingModules[0].tempId;

    setData((prev) => ({
      ...prev,
      modules: remainingModules,
      issues: prev.issues.map((i) =>
        i.moduleTempId === moduleTempId ? { ...i, moduleTempId: fallbackModuleId } : i
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCommit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20 text-[#EDEDED]">
      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#141519] border border-white/[0.08] shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#5E6AD2]/10 text-[#8B96FF] border border-[#5E6AD2]/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#EDEDED]">{data.modules.length}</div>
            <div className="text-xs text-[#8A8F98]">Modules</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#EDEDED]">{data.issues.length}</div>
            <div className="text-xs text-[#8A8F98]">Issues</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#EDEDED]">{totalPoints}</div>
            <div className="text-xs text-[#8A8F98]">Story Points</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#EDEDED]">{totalDependencies}</div>
            <div className="text-xs text-[#8A8F98]">Dependencies</div>
          </div>
        </div>
      </div>

      {/* Repaired Changes Banner */}
      {data.repairedChanges && data.repairedChanges.length > 0 && (
        <div className="p-4 rounded-xl border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 text-[#EDEDED] text-xs space-y-1.5 shadow-md">
          <div className="font-semibold flex items-center gap-2 text-[#8B96FF]">
            <span>⚡ Automated Graph & Cycle Repairs ({data.repairedChanges.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#8A8F98]">
            {data.repairedChanges.map((change, idx) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cycle Warning Banner */}
      {cycleWarning && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <div>
            <strong>Circular dependency detected in issue links.</strong> Pillar will automatically prune circular dependency loops upon 1-click creation to ensure a clean acyclic workflow graph.
          </div>
        </div>
      )}

      {/* Project Meta Editor */}
      <div className="p-5 rounded-xl bg-[#141519] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B96FF] flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2]" />
            Stage 3 · Editable Project Preview
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="hackathonToggle" className="text-xs font-medium text-[#8A8F98] flex items-center gap-1.5 cursor-pointer">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Hackathon Mode
            </label>
            <input
              type="checkbox"
              id="hackathonToggle"
              checked={data.isHackathonMode}
              onChange={(e) => handleUpdateProjectMeta("isHackathonMode", e.target.checked)}
              className="rounded text-[#5E6AD2] focus:ring-[#5E6AD2] cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-medium text-[#8A8F98]">Project Name</label>
            <input
              type="text"
              value={data.projectName}
              onChange={(e) => handleUpdateProjectMeta("projectName", e.target.value)}
              className="w-full p-2.5 rounded-md border border-white/10 bg-[#0B0C0E] text-sm font-semibold text-[#EDEDED] focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#8A8F98]">Project Slug (Prefix)</label>
            <input
              type="text"
              value={data.projectSlug}
              onChange={(e) => handleUpdateProjectMeta("projectSlug", e.target.value.toUpperCase())}
              className="w-full p-2.5 rounded-md border border-white/10 bg-[#0B0C0E] text-sm font-mono font-bold text-[#8B96FF] focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 outline-none uppercase transition-colors"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8A8F98]">Description</label>
          <textarea
            rows={2}
            value={data.description}
            onChange={(e) => handleUpdateProjectMeta("description", e.target.value)}
            className="w-full p-2.5 rounded-md border border-white/10 bg-[#0B0C0E] text-xs text-[#EDEDED] focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2]/50 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Modules and Issues Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-[#EDEDED] flex items-center gap-2">
            <span>Modules & Issues Structure</span>
            <span className="text-xs font-normal text-[#626773]">
              (All issues will be created in default &apos;Todo&apos; status)
            </span>
          </h3>
          <button
            type="button"
            onClick={handleAddModule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-[#141519] text-xs font-medium text-[#EDEDED] hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#5E6AD2]" />
            Add Module
          </button>
        </div>

        {data.modules.map((mod, modIdx) => {
          const moduleIssues = data.issues.filter((i) => i.moduleTempId === mod.tempId);
          const isCollapsed = collapsedModules[mod.tempId];

          return (
            <div
              key={mod.tempId}
              className="rounded-xl border border-white/[0.08] bg-[#141519] overflow-hidden shadow-md"
            >
              {/* Module Accordion Header */}
              <div className="flex items-center justify-between p-4 bg-[#0B0C0E] border-b border-white/[0.06]">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <button
                    type="button"
                    onClick={() => toggleModuleCollapse(mod.tempId)}
                    className="text-[#8A8F98] hover:text-[#EDEDED] cursor-pointer"
                  >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <input
                    type="text"
                    value={mod.name}
                    onChange={(e) => {
                      const updated = data.modules.map((m) =>
                        m.tempId === mod.tempId ? { ...m, name: e.target.value } : m
                      );
                      setData((prev) => ({ ...prev, modules: updated }));
                    }}
                    className="font-semibold text-sm text-[#EDEDED] bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#5E6AD2] outline-none w-full max-w-sm transition-colors"
                  />
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8A8F98]">
                    {moduleIssues.length} issues
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddIssue(mod.tempId)}
                    className="flex items-center gap-1 text-xs text-[#8B96FF] hover:underline px-2 py-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Issue
                  </button>
                  {data.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.tempId)}
                      className="text-[#626773] hover:text-[#F43F5E] p-1 cursor-pointer transition-colors"
                      title="Delete module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Module Issues List */}
              {!isCollapsed && (
                <div className="divide-y divide-white/[0.04]">
                  {moduleIssues.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#626773]">
                      No issues in this module. Click &quot;Add Issue&quot; above to add one.
                    </div>
                  ) : (
                    moduleIssues.map((issue, issueIdx) => {
                      const priorityCfg = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;
                      const otherIssues = data.issues.filter((i) => i.tempId !== issue.tempId);

                      return (
                        <div
                          key={issue.tempId}
                          className="p-3.5 hover:bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
                        >
                          {/* Issue Sequence and Title */}
                          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                            <span className="font-mono text-[#626773] text-[11px] w-6 flex-shrink-0">
                              #{modIdx + 1}.{issueIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={issue.title}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, { title: e.target.value })
                              }
                              className="font-medium text-[#EDEDED] bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#5E6AD2] outline-none w-full transition-colors"
                              required
                            />
                          </div>

                          {/* Control Pills Strip */}
                          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            {/* Priority Dropdown */}
                            <select
                              value={issue.priority}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, {
                                  priority: e.target.value as PriorityType,
                                })
                              }
                              className={`text-[11px] font-semibold px-2 py-1 rounded-md border border-transparent cursor-pointer outline-none ${priorityCfg.bg} ${priorityCfg.color}`}
                            >
                              <option value="NONE" className="bg-[#141519] text-[#EDEDED]">None</option>
                              <option value="LOW" className="bg-[#141519] text-[#EDEDED]">Low</option>
                              <option value="MEDIUM" className="bg-[#141519] text-[#EDEDED]">Medium</option>
                              <option value="HIGH" className="bg-[#141519] text-[#EDEDED]">High</option>
                              <option value="URGENT" className="bg-[#141519] text-[#EDEDED]">Urgent</option>
                            </select>

                            {/* Estimate Points */}
                            <select
                              value={issue.estimate || 2}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, {
                                  estimate: parseInt(e.target.value, 10),
                                })
                              }
                              className="text-[11px] px-2 py-1 rounded-md bg-[#0B0C0E] border border-white/10 text-[#EDEDED] font-mono cursor-pointer outline-none"
                            >
                              {ESTIMATE_OPTIONS.map((pt) => (
                                <option key={pt} value={pt} className="bg-[#141519]">
                                  {pt} pt
                                </option>
                              ))}
                            </select>

                            {/* Dependency Selector ("Blocked by") */}
                            <div className="relative">
                              <select
                                value={issue.blockedByTempIds[0] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateIssue(issue.tempId, {
                                    blockedByTempIds: val ? [val] : [],
                                  });
                                }}
                                className={`text-[11px] px-2 py-1 rounded-md cursor-pointer outline-none border ${
                                  issue.blockedByTempIds.length > 0
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium"
                                    : "bg-[#0B0C0E] border-white/10 text-[#8A8F98]"
                                }`}
                              >
                                <option value="" className="bg-[#141519]">No blocker</option>
                                {otherIssues.map((other) => (
                                  <option key={other.tempId} value={other.tempId} className="bg-[#141519]">
                                    Blocked by: {other.title.substring(0, 25)}...
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Delete Issue */}
                            <button
                              type="button"
                              onClick={() => handleDeleteIssue(issue.tempId)}
                              className="text-[#626773] hover:text-[#F43F5E] p-1 cursor-pointer transition-colors"
                              title="Delete issue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 rounded-xl bg-[#141519]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button
          type="button"
          onClick={onBack}
          disabled={isCommitting}
          className="flex items-center gap-2 text-xs text-[#8A8F98] hover:text-[#EDEDED] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clarifications
        </button>

        <button
          type="submit"
          disabled={isCommitting || data.issues.length === 0}
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#5E6AD2] text-white hover:bg-[#525ec2] disabled:opacity-50 font-medium text-xs shadow-[0_0_16px_rgba(94,106,210,0.4)] transition-all cursor-pointer"
        >
          {isCommitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating Project...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Commit Project & Issues</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
