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
  Tag,
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
  NONE: { label: "None", color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800" },
  LOW: { label: "Low", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  MEDIUM: { label: "Medium", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  HIGH: { label: "High", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
  URGENT: { label: "Urgent", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{data.modules.length}</div>
            <div className="text-xs text-zinc-500">Modules</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{data.issues.length}</div>
            <div className="text-xs text-zinc-500">Issues</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{totalPoints}</div>
            <div className="text-xs text-zinc-500">Story Points</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{totalDependencies}</div>
            <div className="text-xs text-zinc-500">Dependencies</div>
          </div>
        </div>
      </div>

      {/* Repaired Changes Banner */}
      {data.repairedChanges && data.repairedChanges.length > 0 && (
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 text-xs space-y-1.5 shadow-sm">
          <div className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <span>⚡ Automated Graph & Cycle Repairs ({data.repairedChanges.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
            {data.repairedChanges.map((change, idx) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cycle Warning Banner */}
      {cycleWarning && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <strong>Circular dependency detected in issue links.</strong> Pillar will automatically prune circular dependency loops upon 1-click creation to ensure a clean acyclic workflow graph.
          </div>
        </div>
      )}

      {/* Project Meta Editor */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Stage 3 · Editable Project Preview
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="hackathonToggle" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 cursor-pointer">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Hackathon Mode
            </label>
            <input
              type="checkbox"
              id="hackathonToggle"
              checked={data.isHackathonMode}
              onChange={(e) => handleUpdateProjectMeta("isHackathonMode", e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Project Name</label>
            <input
              type="text"
              value={data.projectName}
              onChange={(e) => handleUpdateProjectMeta("projectName", e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Project Slug (Prefix)</label>
            <input
              type="text"
              value={data.projectSlug}
              onChange={(e) => handleUpdateProjectMeta("projectSlug", e.target.value.toUpperCase())}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono font-bold text-violet-600 dark:text-violet-400 focus:ring-2 focus:ring-violet-500 outline-none uppercase"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea
            rows={2}
            value={data.description}
            onChange={(e) => handleUpdateProjectMeta("description", e.target.value)}
            className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
      </div>

      {/* Modules and Issues Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Modules & Issues Structure</span>
            <span className="text-xs font-normal text-zinc-500">
              (All issues will be created in default &apos;Todo&apos; status)
            </span>
          </h3>
          <button
            type="button"
            onClick={handleAddModule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Module
          </button>
        </div>

        {data.modules.map((mod, modIdx) => {
          const moduleIssues = data.issues.filter((i) => i.moduleTempId === mod.tempId);
          const isCollapsed = collapsedModules[mod.tempId];

          return (
            <div
              key={mod.tempId}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
            >
              {/* Module Accordion Header */}
              <div className="flex items-center justify-between p-4 bg-zinc-50/80 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <button
                    type="button"
                    onClick={() => toggleModuleCollapse(mod.tempId)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
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
                    className="font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-500 outline-none w-full max-w-sm"
                  />
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {moduleIssues.length} issues
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddIssue(mod.tempId)}
                    className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline px-2 py-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Issue
                  </button>
                  {data.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.tempId)}
                      className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Delete module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Module Issues List */}
              {!isCollapsed && (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {moduleIssues.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      No issues in this module. Click &quot;Add Issue&quot; above to add one.
                    </div>
                  ) : (
                    moduleIssues.map((issue, issueIdx) => {
                      const priorityCfg = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;
                      const otherIssues = data.issues.filter((i) => i.tempId !== issue.tempId);

                      return (
                        <div
                          key={issue.tempId}
                          className="p-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
                        >
                          {/* Issue Sequence and Title */}
                          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                            <span className="font-mono text-zinc-400 text-[11px] w-6 flex-shrink-0">
                              #{modIdx + 1}.{issueIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={issue.title}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, { title: e.target.value })
                              }
                              className="font-medium text-zinc-800 dark:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-500 outline-none w-full"
                              required
                            />
                          </div>

                          {/* Control Pills Strip */}
                          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            {/* Priority Dropdown (Explicitly MEDIUM, never MED) */}
                            <select
                              value={issue.priority}
                              onChange={(e) =>
                                handleUpdateIssue(issue.tempId, {
                                  priority: e.target.value as PriorityType,
                                })
                              }
                              className={`text-[11px] font-semibold px-2 py-1 rounded-md border border-transparent cursor-pointer outline-none ${priorityCfg.bg} ${priorityCfg.color}`}
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
                              className="text-[11px] px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono cursor-pointer outline-none border border-transparent"
                            >
                              {ESTIMATE_OPTIONS.map((pt) => (
                                <option key={pt} value={pt}>
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
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent"
                                }`}
                              >
                                <option value="">No blocker</option>
                                {otherIssues.map((other) => (
                                  <option key={other.tempId} value={other.tempId}>
                                    Blocked by: {other.title.substring(0, 25)}...
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Delete Issue */}
                            <button
                              type="button"
                              onClick={() => handleDeleteIssue(issue.tempId)}
                              className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
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
      <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <button
          type="button"
          onClick={onBack}
          disabled={isCommitting}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clarifications
        </button>

        <button
          type="submit"
          disabled={isCommitting || data.issues.length === 0}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg hover:shadow-violet-500/25 transition-all cursor-pointer"
        >
          {isCommitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Project in 1 Transaction...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Project in Pillar (1-Click)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
