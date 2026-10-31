"use client";

import { format } from "date-fns";
import { History, ArrowRight } from "lucide-react";

export default function ActivityLog({ activities, statuses }: { activities: any[], statuses: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="space-y-4 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" />
          Activity
        </h3>
        <div className="text-zinc-400 dark:text-zinc-500 text-xs py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          No activity recorded yet.
        </div>
      </div>
    );
  }

  const renderChanges = (action: string, oldVal: any, newVal: any) => {
    if (action === "created") {
      return <span className="text-zinc-600 dark:text-zinc-400">created this issue</span>;
    }
    if (action === "updated") {
      const keys = Object.keys(newVal || {});
      return (
        <span className="space-y-1.5 block mt-0.5">
          <span className="text-zinc-600 dark:text-zinc-400">
            updated <span className="font-medium text-zinc-800 dark:text-zinc-200">{keys.join(", ")}</span>
          </span>
          {keys.map(k => {
            if (k === 'statusId') {
              const oldS = statuses.find(s => s.id === oldVal[k])?.name || 'Unknown';
              const newS = statuses.find(s => s.id === newVal[k])?.name || 'Unknown';
              return (
                <div key={k} className="inline-flex items-center gap-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                  <span>Status:</span>
                  <span className="font-medium">{oldS}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                  <span className="font-medium text-zinc-900 dark:text-white">{newS}</span>
                </div>
              );
            }
            if (k === 'priority') {
              return (
                <div key={k} className="inline-flex items-center gap-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                  <span>Priority:</span>
                  <span className="font-medium">{oldVal[k]}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                  <span className="font-medium text-zinc-900 dark:text-white">{newVal[k]}</span>
                </div>
              );
            }
            if (k === 'title') {
              return <div key={k} className="text-xs text-zinc-500">Title updated</div>;
            }
            if (k === 'description') {
              return <div key={k} className="text-xs text-zinc-500">Description updated</div>;
            }
            return null;
          })}
        </span>
      );
    }
    return <span className="text-zinc-600 dark:text-zinc-400">{action}</span>;
  };

  return (
    <div className="space-y-4 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" />
          Activity Log
        </h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
        {activities.map((activity: any) => (
          <div key={activity.id} className="relative flex items-start gap-3 text-xs">
            {/* Timeline dot */}
            <div className="absolute -left-6 mt-1 w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 ring-4 ring-white dark:ring-zinc-950" />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {activity.actor?.username || 'Unknown User'}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="mt-0.5">
                {renderChanges(activity.action, activity.oldValue, activity.newValue)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
