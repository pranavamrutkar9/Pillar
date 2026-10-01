"use client";

import React from "react";
import { TrendingDown, Activity, CheckCircle2, AlertCircle, PlusCircle, MinusCircle } from "lucide-react";
import BurndownChart from "./BurndownChart";

export default function CycleAnalytics({ summary, burndown }: { summary: any, burndown: any[] }) {
  if (!summary || !burndown || burndown.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Cycle Analytics
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Summary Metrics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 font-medium uppercase mb-1">Velocity</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.velocity} pts</div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 font-medium uppercase mb-1">Completion</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.completionRate}%</div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-3 border border-zinc-100 dark:border-zinc-800">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">Scope Changes</div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-zinc-600 dark:text-zinc-400">
                <AlertCircle className="w-3.5 h-3.5 mr-2" /> Initial Scope
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{summary.initialScopePoints} pts</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-red-500 dark:text-red-400">
                <PlusCircle className="w-3.5 h-3.5 mr-2" /> Added Scope
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">+{summary.addedScopePoints} pts</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-green-500 dark:text-green-400">
                <MinusCircle className="w-3.5 h-3.5 mr-2" /> Removed Scope
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">-{summary.removedScopePoints} pts</span>
            </div>
            
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-sm font-semibold">
              <span className="text-zinc-900 dark:text-zinc-100">Final Scope</span>
              <span className="text-zinc-900 dark:text-zinc-100">{summary.finalScopePoints} pts</span>
            </div>
          </div>
        </div>

        {/* Right: Burndown Chart */}
        <div className="lg:col-span-2">
          <BurndownChart data={burndown} width={800} height={250} title="" />
        </div>
        
      </div>
    </div>
  );
}
