"use client";

import React, { useState } from "react";
import { TrendingDown } from "lucide-react";

export interface BurndownDataPoint {
  day: string | number;
  ideal: number;
  remaining: number;
  completed?: number;
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
  title = "Burndown Velocity",
}: BurndownChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGGElement>, index: number) => {
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

  const padding = { top: 25, right: 25, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxPoints = Math.max(...data.map((d) => Math.max(d.remaining, d.ideal)), 10);
  
  const scaleX = (index: number) => 
    padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    
  const scaleY = (val: number) => 
    padding.top + chartHeight - (val / maxPoints) * chartHeight;

  const idealPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.ideal)}`).join(" ");
  const remainingPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.remaining)}`).join(" ");
  
  const areaPath = `${remainingPath} L ${scaleX(data.length - 1)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;

  const yAxisTicks = Array.from({ length: 5 }).map((_, i) => maxPoints * (i / 4));

  return (
    <div className={`flex flex-col bg-[#0D0E11] border border-white/[0.08] rounded-xl overflow-hidden shadow-linear-card font-sans ${className}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0B0C0E]">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#818CF8]" />
            <span>{title}</span>
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5E6AD2] shadow-[0_0_8px_#5E6AD2]"></span>
              <span>Remaining</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-full bg-white/[0.2] border border-white/[0.3]"></span>
              <span>Guideline</span>
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
            <linearGradient id="linearAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5E6AD2" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#5E6AD2" stopOpacity="0.0" />
            </linearGradient>
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
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fontSize="10"
                  fontFamily="var(--font-geist-mono), monospace"
                  textAnchor="end"
                  fill="#71737F"
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
              y={height - 8}
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
              textAnchor="middle"
              fill="#71737F"
            >
              Day {d.day}
            </text>
          ))}

          {/* Area fill for remaining path */}
          <path d={areaPath} fill="url(#linearAreaGradient)" className="transition-all duration-500" />

          {/* Ideal Path */}
          <path
            d={idealPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Remaining Path */}
          <path
            d={remainingPath}
            fill="none"
            stroke="#5E6AD2"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const cx = scaleX(i);
            const cy = scaleY(d.remaining);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseEnter={(e) => handleMouseMove(e, i)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#5E6AD2"
                  stroke="#08090A"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={20}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && tooltipPos && (
          <div
            className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg bg-[#18191E] border border-white/[0.12] shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
          >
            <div className="font-mono text-[10px] text-zinc-400">
              Day {data[hoveredIndex].day}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white font-mono">{data[hoveredIndex].remaining}p</span>
              <span className="text-zinc-500">remaining</span>
            </div>
            <div className="text-[10px] text-zinc-500">
              Ideal: {Math.round(data[hoveredIndex].ideal)}p
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
