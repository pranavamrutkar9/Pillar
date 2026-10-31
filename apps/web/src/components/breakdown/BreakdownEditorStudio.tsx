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
  NONE: { label: "None", color: "text-black", bg: "bg-white dark:bg-zinc-800" },
  LOW: { label: "Low", color: "text-black", bg: "bg-[#38BDF8]" },
  MEDIUM: { label: "Medium", color: "text-black", bg: "bg-[#FFE600]" },
  HIGH: { label: "High", color: "text-black", bg: "bg-[#FB923C]" },
  URGENT: { label: "Urgent", color: "text-black", bg: "bg-[#FF6B6B]" },
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

  // Cycle detection warning in preview
  const cycleWarning = useMemo(() => {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const issue of data.issues) {
      inDegree.set(issue.tempId, 0);
      adj.set(issue.tempId, []);
    }

    for (const issue of data.issues) {
      for (const blockerId of issue.blockedByTempIds) {
        if (!adj.has(blockerId)) adj.set(blockerId, []);
        adj.get(blockerId)!.push(issue.tempId);
        inDegree.set(issue.tempId, (inDegree.get(issue.tempId) || 0) + 1);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20 font-sans">
      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm">
          <div className="p-2.5 bg-[#C084FC] border-2 border-black text-black">
            <Layers className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xl font-black text-black dark:text-white">{data.modules.length}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60">Modules</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm">
          <div className="p-2.5 bg-[#38BDF8] border-2 border-black text-black">
            <CheckSquare className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xl font-black text-black dark:text-white">{data.issues.length}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60">Issues</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm">
          <div className="p-2.5 bg-[#FFE600] border-2 border-black text-black">
            <Clock className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xl font-black text-black dark:text-white">{totalPoints}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60">Story Points</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white dark:bg-[#181920] border-2 border-black dark:border-white shadow-neo-sm">
          <div className="p-2.5 bg-[#4ADE80] border-2 border-black text-black">
            <GitBranch className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-xl font-black text-black dark:text-white">{totalDependencies}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60">Dependencies</div>
          </div>
        </div>
      </div>

      {/* Repaired Changes Banner */}
      {data.repairedChanges && data.repairedChanges.length > 0 && (
        <div className="p-4 border-2 border-black bg-[#38BDF8] text-black text-xs font-bold space-y-1.5 shadow-neo-sm">
          <div className="font-black uppercase tracking-wider flex items-center gap-2">
            <span>⚡ Automated Graph & Cycle Repairs ({data.repairedChanges.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-1 font-medium">
            {data.repairedChanges.map((change, idx) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cycle Warning Banner */}
      {cycleWarning && (
        <div className="p-4 border-2 border-black bg-[#FF6B6B] text-black text-xs font-bold flex items-center gap-3 shadow-neo-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-black" />
          <div>
            <span className="font-black uppercase tracking-wider">Circular dependency detected.</span> Pillar will automatically prune circular dependency loops upon creation to ensure a clean acyclic workflow graph.
          </div>
        </div>
      )}

      {/* Project Meta Editor Window */}
      <div className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#FFE600] text-black">
          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            Stage 3 · Editable Project Preview
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="hackathonToggle" className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Flame className="w-4 h-4 text-black" />
              Crunch Mode
            </label>
            <input
              type="checkbox"
              id="hackathonToggle"
              checked={data.isHackathonMode}
              onChange={(e) => handleUpdateProjectMeta("isHackathonMode", e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer"
            />
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Project Name</label>
              <input
                type="text"
                value={data.projectName}
                onChange={(e) => handleUpdateProjectMeta("projectName", e.target.value)}
                className="w-full px-3.5 py-2.5 border-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a] text-sm font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Prefix Slug</label>
              <input
                type="text"
                value={data.projectSlug}
                onChange={(e) => handleUpdateProjectMeta("projectSlug", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 border-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a] text-sm font-mono font-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFE600] uppercase"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Description</label>
            <textarea
              rows={2}
              value={data.description}
              onChange={(e) => handleUpdateProjectMeta("description", e.target.value)}
              className="w-full px-3.5 py-2.5 border-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a] text-xs font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            />
          </div>
        </div>
      </div>

      {/* Modules and Issues Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
              Modules & Issues Structure
            </h3>
            <span className="text-[11px] font-medium text-black/60 dark:text-white/60">
              All issues will be created in default &apos;Todo&apos; status
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddModule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4ADE80] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-black" />
            Add Module
          </button>
        </div>

        {data.modules.map((mod, modIdx) => {
          const moduleIssues = data.issues.filter((i) => i.moduleTempId === mod.tempId);
          const isCollapsed = collapsedModules[mod.tempId];

          return (
            <div
              key={mod.tempId}
              className="border-3 border-black dark:border-white bg-white dark:bg-[#181920] shadow-neo overflow-hidden"
            >
              {/* Module Accordion Header */}
              <div className="flex items-center justify-between p-3.5 bg-[#FFFDF8] dark:bg-[#20222a] border-b-2 border-black dark:border-white">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <button
                    type="button"
                    onClick={() => toggleModuleCollapse(mod.tempId)}
                    className="p-1 border border-black bg-white dark:bg-black text-black dark:text-white cursor-pointer"
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
                    className="font-black text-sm text-black dark:text-white bg-transparent border-b-2 border-transparent hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black px-1 outline-none w-full max-w-sm uppercase tracking-wide"
                  />
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-[#FFE600] text-black border border-black shrink-0">
                    {moduleIssues.length} issues
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddIssue(mod.tempId)}
                    className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black dark:text-white px-2 py-1 border border-black dark:border-white bg-white dark:bg-black hover:bg-[#FFE600] hover:text-black transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Issue
                  </button>
                  {data.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.tempId)}
                      className="p-1 text-black dark:text-white hover:bg-[#FF6B6B] hover:text-black border border-transparent hover:border-black transition-colors cursor-pointer"
                      title="Delete module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Module Issues List */}
              {!isCollapsed && (
                <div className="divide-y-2 divide-black/20 dark:divide-white/20">
                  {moduleIssues.length === 0 ? (
                    <div className="p-6 text-center text-xs font-bold text-black/50 dark:text-white/50">
                      No issues in this module. Click &quot;Add Issue&quot; above to add one.
                    </div>
                  ) : (
                    moduleIssues.map((issue, issueIdx) => {
                      const priorityCfg = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;
                      const otherIssues = data.issues.filter((i) => i.tempId !== issue.tempId);

                      return (
                        <div
                          key={issue.tempId}
                          className="p-3 bg-white dark:bg-[#181920] hover:bg-[#FFFDF8] dark:hover:bg-[#20222a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
                        >
                          {/* Issue Sequence and Title */}
                          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                            <span className="font-mono font-bold text-black/50 dark:text-white/50 text-xs w-8 shrink-0">
                              #{modIdx + 1}.{issueIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={issue.title}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, { title: e.target.value })
                              }
                              className="font-bold text-black dark:text-white bg-transparent border-b border-transparent hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black px-1 outline-none w-full text-xs"
                              required
                            />
                          </div>

                          {/* Control Pills Strip */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Priority Dropdown */}
                            <select
                              value={issue.priority}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, {
                                  priority: e.target.value as PriorityType,
                                })
                              }
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 border-2 border-black cursor-pointer outline-none ${priorityCfg.bg} ${priorityCfg.color}`}
                            >
                              <option value="NONE">None</option>
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>

                            {/* Estimate Points */}
                            <select
                              value={issue.estimate || 2}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, {
                                  estimate: parseInt(e.target.value, 10),
                                })
                              }
                              className="text-[10px] px-2 py-1 bg-white dark:bg-[#20222a] text-black dark:text-white font-mono font-black border-2 border-black dark:border-white cursor-pointer outline-none"
                            >
                              {ESTIMATE_OPTIONS.map((pt) => (
                                <option key={pt} value={pt}>
                                  {pt} pt
                                </option>
                              ))}
                            </select>

                            {/* Dependency Selector */}
                            <select
                              value={issue.blockedByTempIds[0] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateIssue(issue.tempId, {
                                  blockedByTempIds: val ? [val] : [],
                                });
                              }}
                              className={`text-[10px] px-2 py-1 font-bold border-2 border-black cursor-pointer outline-none ${
                                issue.blockedByTempIds.length > 0
                                  ? "bg-[#4ADE80] text-black"
                                  : "bg-white dark:bg-[#20222a] text-black/70 dark:text-white/70"
                              }`}
                            >
                              <option value="">No blocker</option>
                              {otherIssues.map((other) => (
                                <option key={other.tempId} value={other.tempId}>
                                  Blocked by: {other.title.substring(0, 22)}...
                                </option>
                              ))}
                            </select>

                            {/* Delete Issue */}
                            <button
                              type="button"
                              onClick={() => handleDeleteIssue(issue.tempId)}
                              className="p-1 text-black/50 hover:text-black hover:bg-[#FF6B6B] border border-transparent hover:border-black cursor-pointer transition-colors"
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
      <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo">
        <button
          type="button"
          onClick={onBack}
          disabled={isCommitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#20222a] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Clarifications
        </button>

        <button
          type="submit"
          disabled={isCommitting || data.issues.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isCommitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Creating Project...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Commit Project & Issues</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
