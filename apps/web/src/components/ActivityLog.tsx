"use client";

import { format } from "date-fns";
import { History, ArrowRight } from "lucide-react";

export default function ActivityLog({ activities, statuses }: { activities: any[], statuses: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="space-y-4 pt-6 border-t-2 border-black dark:border-white">
        <h3 className="font-black text-xs text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 stroke-[2.5]" />
          Activity
        </h3>
        <div className="text-zinc-500 text-xs font-bold py-6 text-center border-2 border-dashed border-black dark:border-white rounded-xl">
          No activity recorded yet.
        </div>
      </div>
    );
  }

  const renderChanges = (action: string, oldVal: any, newVal: any) => {
    if (action === "created") {
      return <span className="text-black dark:text-white font-bold">created this issue</span>;
    }
    if (action === "updated") {
      const keys = Object.keys(newVal || {});
      return (
        <span className="space-y-1.5 block mt-0.5">
          <span className="text-zinc-600 dark:text-zinc-400 font-bold">
            updated <span className="font-black text-black dark:text-white">{keys.join(", ")}</span>
          </span>
          {keys.map(k => {
            if (k === 'statusId') {
              const oldS = statuses.find(s => s.id === oldVal[k])?.name || 'Unknown';
              const newS = statuses.find(s => s.id === newVal[k])?.name || 'Unknown';
              return (
                <div key={k} className="inline-flex items-center gap-1.5 text-xs bg-[#FFE600] border border-black px-2 py-0.5 rounded text-black font-bold shadow-[1px_1px_0px_0px_#000]">
                  <span>Status:</span>
                  <span className="line-through">{oldS}</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  <span className="font-black">{newS}</span>
                </div>
              );
            }
            if (k === 'priority') {
              return (
                <div key={k} className="inline-flex items-center gap-1.5 text-xs bg-[#BAE6FD] border border-black px-2 py-0.5 rounded text-black font-bold shadow-[1px_1px_0px_0px_#000]">
                  <span>Priority:</span>
                  <span className="line-through">{oldVal[k]}</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  <span className="font-black">{newVal[k]}</span>
                </div>
              );
            }
            if (k === 'title') {
              return <div key={k} className="text-xs font-bold text-zinc-500">Title updated</div>;
            }
            if (k === 'description') {
              return <div key={k} className="text-xs font-bold text-zinc-500">Description updated</div>;
            }
            return null;
          })}
        </span>
      );
    }
    return <span className="text-black dark:text-white font-bold">{action}</span>;
  };

  return (
    <div className="space-y-4 pt-6 border-t-2 border-black dark:border-white">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-xs text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 stroke-[2.5]" />
          Activity Log
        </h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-black dark:before:bg-white">
        {activities.map((activity: any) => (
          <div key={activity.id} className="relative flex items-start gap-3 text-xs">
            {/* Timeline dot */}
            <div className="absolute -left-6 mt-1 w-3 h-3 rounded-full bg-[#FFE600] border-2 border-black" />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-black dark:text-white">
                  {activity.actor?.username || 'Unknown User'}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-500">
                  {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="mt-1">
                {renderChanges(activity.action, activity.oldValue, activity.newValue)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
