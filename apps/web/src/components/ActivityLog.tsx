"use client";

import { format } from "date-fns";
import { History, ArrowRight } from "lucide-react";

export default function ActivityLog({ activities, statuses }: { activities: any[], statuses: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <h3 className="font-semibold text-sm text-[#EDEDED] flex items-center gap-2">
          <History className="w-4 h-4 text-[#8A8F98]" />
          Activity
        </h3>
        <div className="text-[#626773] text-xs py-5 text-center border border-dashed border-white/10 rounded-xl">
          No activity recorded yet.
        </div>
      </div>
    );
  }

  const renderChanges = (action: string, oldVal: any, newVal: any) => {
    if (action === "created") {
      return <span className="text-[#8A8F98]">created this issue</span>;
    }
    if (action === "updated") {
      const keys = Object.keys(newVal || {});
      return (
        <span className="space-y-1.5 block mt-0.5">
          <span className="text-[#8A8F98]">
            updated <span className="font-medium text-[#EDEDED]">{keys.join(", ")}</span>
          </span>
          {keys.map(k => {
            if (k === 'statusId') {
              const oldS = statuses.find(s => s.id === oldVal[k])?.name || 'Unknown';
              const newS = statuses.find(s => s.id === newVal[k])?.name || 'Unknown';
              return (
                <div key={k} className="inline-flex items-center gap-1.5 text-xs bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded text-[#EDEDED]">
                  <span className="text-[#8A8F98]">Status:</span>
                  <span className="font-medium text-[#8A8F98]">{oldS}</span>
                  <ArrowRight className="w-3 h-3 text-[#626773]" />
                  <span className="font-medium text-[#5E6AD2]">{newS}</span>
                </div>
              );
            }
            if (k === 'priority') {
              return (
                <div key={k} className="inline-flex items-center gap-1.5 text-xs bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded text-[#EDEDED]">
                  <span className="text-[#8A8F98]">Priority:</span>
                  <span className="font-medium text-[#8A8F98]">{oldVal[k]}</span>
                  <ArrowRight className="w-3 h-3 text-[#626773]" />
                  <span className="font-medium text-[#EDEDED]">{newVal[k]}</span>
                </div>
              );
            }
            if (k === 'title') {
              return <div key={k} className="text-xs text-[#8A8F98]">Title updated</div>;
            }
            if (k === 'description') {
              return <div key={k} className="text-xs text-[#8A8F98]">Description updated</div>;
            }
            return null;
          })}
        </span>
      );
    }
    return <span className="text-[#8A8F98]">{action}</span>;
  };

  return (
    <div className="space-y-4 pt-6 border-t border-white/[0.08]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-[#EDEDED] flex items-center gap-2">
          <History className="w-4 h-4 text-[#8A8F98]" />
          Activity Log
        </h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.08]">
        {activities.map((activity: any) => (
          <div key={activity.id} className="relative flex items-start gap-3 text-xs">
            <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-[#5E6AD2] ring-4 ring-[#08090A]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-[#EDEDED]">{activity.user?.username || 'System'}</span>
                <span className="text-[10px] text-[#626773] font-mono">
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
