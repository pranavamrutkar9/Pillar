"use client";

import React from "react";
import { TrendingDown, Activity, CheckCircle2, AlertCircle, PlusCircle, MinusCircle } from "lucide-react";

export default function CycleAnalytics({ summary, burndown }: { summary: any, burndown: any[] }) {
  if (!summary || !burndown || burndown.length === 0) return null;

  // For SVG Burndown Chart
  const padding = 20;
  const width = 800;
  const height = 250;
  
  // Find max value for Y axis scaling
  const maxPoints = Math.max(
    ...burndown.map(d => Math.max(d.remaining, d.ideal)),
    10 // Ensure it doesn't break if all values are 0
  );

  const scaleX = (x: number) => padding + (x / (burndown.length - 1 || 1)) * (width - 2 * padding);
  const scaleY = (y: number) => (height - padding) - (y / maxPoints) * (height - 2 * padding);

  const idealPath = burndown.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.ideal)}`).join(' ');
  const remainingPath = burndown.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.remaining)}`).join(' ');

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
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Burndown Chart</span>
            <div className="flex items-center gap-4 text-xs font-normal">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Actual Remaining
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600"></span> Ideal Burn
              </span>
            </div>
          </div>
          
          <div className="relative w-full h-[250px] overflow-x-auto bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <svg width={width} height={height} className="min-w-[600px] w-full h-full">
              {/* Y Axis Guides */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = scaleY(maxPoints * ratio);
                return (
                  <g key={ratio}>
                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="4 4" />
                    <text x={padding - 5} y={y + 4} fontSize="10" textAnchor="end" className="fill-zinc-400 dark:fill-zinc-500">
                      {Math.round(maxPoints * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Guides (Days) */}
              {burndown.map((d, i) => (
                <text key={i} x={scaleX(i)} y={height - 2} fontSize="10" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500">
                  D{d.day}
                </text>
              ))}

              {/* Ideal Path */}
              <path d={idealPath} fill="none" stroke="currentColor" className="text-zinc-300 dark:text-zinc-600" strokeWidth="2" strokeDasharray="6 4" />
              
              {/* Actual Remaining Path */}
              <path d={remainingPath} fill="none" stroke="currentColor" className="text-blue-500" strokeWidth="3" />
              
              {/* Actual Remaining Points */}
              {burndown.map((d, i) => (
                <circle 
                  key={i} 
                  cx={scaleX(i)} 
                  cy={scaleY(d.remaining)} 
                  r="4" 
                  className="fill-white dark:fill-zinc-900 stroke-blue-500" 
                  strokeWidth="2" 
                />
              ))}
            </svg>
          </div>
        </div>
        
      </div>
    </div>
  );
}
