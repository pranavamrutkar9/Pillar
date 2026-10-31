"use client";

import React from "react";
import { TrendingDown, Activity, CheckCircle2, AlertCircle, PlusCircle, MinusCircle } from "lucide-react";
import BurndownChart from "./BurndownChart";

export default function CycleAnalytics({ summary, burndown }: { summary: any, burndown: any[] }) {
  if (!summary || !burndown || burndown.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl overflow-hidden mb-8 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
      <div className="border-b-2 border-black dark:border-white bg-[#FFE600] text-black p-4">
        <h3 className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 stroke-[2.5]" />
          Cycle Velocity & Analytics
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Summary Metrics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FEF08A] text-black p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-xs font-mono font-black uppercase mb-1">Velocity</div>
              <div className="text-2xl font-black">{summary.velocity} pts</div>
            </div>
            <div className="bg-[#BAE6FD] text-black p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-xs font-mono font-black uppercase mb-1">Completion</div>
              <div className="text-2xl font-black">{summary.completionRate}%</div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 space-y-3 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000]">
            <div className="text-xs font-black uppercase text-black dark:text-white mb-2 border-b-2 border-black dark:border-white pb-2">Scope Changes</div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center text-zinc-700 dark:text-zinc-300">
                <AlertCircle className="w-3.5 h-3.5 mr-2 stroke-[2.5]" /> Initial Scope
              </span>
              <span className="font-mono font-black text-black dark:text-white">{summary.initialScopePoints} pts</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center text-red-600">
                <PlusCircle className="w-3.5 h-3.5 mr-2 stroke-[2.5]" /> Added Scope
              </span>
              <span className="font-mono font-black text-red-600">+{summary.addedScopePoints} pts</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center text-emerald-600">
                <MinusCircle className="w-3.5 h-3.5 mr-2 stroke-[2.5]" /> Removed Scope
              </span>
              <span className="font-mono font-black text-emerald-600">-{summary.removedScopePoints} pts</span>
            </div>
            
            <div className="pt-2 border-t-2 border-black dark:border-white flex justify-between items-center text-xs font-black">
              <span className="text-black dark:text-white">Final Scope</span>
              <span className="font-mono text-black dark:text-white">{summary.finalScopePoints} pts</span>
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
