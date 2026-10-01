"use client";

import React, { useState, useMemo } from "react";
import { TrendingDown } from "lucide-react";

export interface BurndownDataPoint {
  day: string | number;
  ideal: number;
  remaining: number;
  completed?: number; // Optional completed points/tasks
}

interface BurndownChartProps {
  data: BurndownDataPoint[];
  width?: number;
  height?: number;
  className?: string;
  title?: string;
}

export default function BurndownChart({
  data,
  width = 800,
  height = 300,
  className = "",
  title = "Burndown Chart",
}: BurndownChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGGElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // we want position relative to the nearest positioned ancestor (the div wrapping the SVG)
    // we can get the bounding box of the parent div
    const parentRect = e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      setTooltipPos({
        x: e.clientX - parentRect.left,
        y: e.clientY - parentRect.top
      });
    }
    setHoveredIndex(index);
  };
  if (!data || data.length === 0) return null;

  // Chart layout configuration
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxPoints = Math.max(...data.map((d) => Math.max(d.remaining, d.ideal)), 10);
  
  const scaleX = (index: number) => 
    padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    
  const scaleY = (val: number) => 
    padding.top + chartHeight - (val / maxPoints) * chartHeight;

  // Generate paths
  const idealPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.ideal)}`).join(" ");
  const remainingPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.remaining)}`).join(" ");
  
  // Area under the remaining path
  const areaPath = `${remainingPath} L ${scaleX(data.length - 1)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;

  // Generate Y-axis grid lines (4 intervals)
  const yAxisTicks = Array.from({ length: 5 }).map((_, i) => maxPoints * (i / 4));

  return (
    <div className={`flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-violet-500" />
            {title}
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
              Remaining
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600 border border-zinc-400 dark:border-zinc-500"></span>
              Ideal
            </span>
          </div>
        </div>
      )}

      {/* Chart Area */}
      <div className="relative w-full overflow-x-auto p-4 group">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px] transition-opacity duration-300"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yAxisTicks.map((val, i) => {
            const y = scaleY(val);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800/60"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-500"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={scaleX(i)}
              y={height - 5}
              fontSize="11"
              fontWeight="500"
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-500"
            >
              Day {d.day}
            </text>
          ))}

          {/* Area fill for remaining path */}
          <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-500" />

          {/* Ideal Path */}
          <path
            d={idealPath}
            fill="none"
            stroke="currentColor"
            className="text-zinc-300 dark:text-zinc-600"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* Remaining Path */}
          <path
            d={remainingPath}
            fill="none"
            stroke="currentColor"
            className="text-violet-500"
            strokeWidth="3"
            filter="url(#glow)"
            style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
          />

          {/* Interactive Layer & Points */}
          {data.map((d, i) => {
            const x = scaleX(i);
            const yRemaining = scaleY(d.remaining);
            const yIdeal = scaleY(d.ideal);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setTooltipPos(null);
                }}
                className="cursor-crosshair outline-none"
              >
                {/* Hover Guide Line */}
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="currentColor"
                  className={`text-zinc-300 dark:text-zinc-700 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Invisible wider area for easier hovering */}
                <rect
                  x={x - (chartWidth / data.length) / 2}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Ideal Point */}
                <circle
                  cx={x}
                  cy={yIdeal}
                  r="4"
                  className="fill-white dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-500 transition-all duration-200"
                  strokeWidth="2"
                />

                {/* Remaining Point */}
                <circle
                  cx={x}
                  cy={yRemaining}
                  r={isHovered ? "6" : "4.5"}
                  className="fill-white dark:fill-zinc-900 stroke-violet-500 transition-all duration-200"
                  strokeWidth={isHovered ? "3" : "2"}
                  filter={isHovered ? "url(#glow)" : ""}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && tooltipPos && (
          <div
            className="absolute z-10 pointer-events-none transition-all duration-75 ease-out flex flex-col bg-zinc-900/95 dark:bg-zinc-100/95 backdrop-blur-md text-zinc-50 dark:text-zinc-900 px-3 py-2 rounded-lg shadow-xl text-sm border border-zinc-800 dark:border-zinc-200/50"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: `translate(-50%, calc(-100% - 16px))`,
            }}
          >
            <div className="font-semibold mb-1 opacity-90 border-b border-zinc-700 dark:border-zinc-300 pb-1">
              Day {data[hoveredIndex].day}
            </div>
            <div className="flex justify-between gap-4">
              <span className="opacity-70">Remaining:</span>
              <span className="font-bold text-violet-400 dark:text-violet-600">{data[hoveredIndex].remaining} pts</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="opacity-70">Ideal:</span>
              <span className="font-bold">{Math.round(data[hoveredIndex].ideal)} pts</span>
            </div>
            {/* Tooltip caret */}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-900/95 dark:bg-zinc-100/95 border-r border-b border-zinc-800 dark:border-zinc-200/50"></div>
          </div>
        )}
      </div>
    </div>
  );
}
