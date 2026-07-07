"use client";

import { format } from "date-fns";

export default function ActivityLog({ activities, statuses }: { activities: any[], statuses: any[] }) {
  if (!activities || activities.length === 0) {
    return <div className="text-gray-500 text-sm italic">No activity yet.</div>;
  }

  const renderChanges = (action: string, oldVal: any, newVal: any) => {
    if (action === "created") {
      return <span>created this issue</span>;
    }
    if (action === "updated") {
      const keys = Object.keys(newVal || {});
      return (
        <span className="space-y-1 block">
          updated <span className="font-semibold">{keys.join(", ")}</span>
          {keys.map(k => {
            if (k === 'statusId') {
              const oldS = statuses.find(s => s.id === oldVal[k])?.name || 'Unknown';
              const newS = statuses.find(s => s.id === newVal[k])?.name || 'Unknown';
              return <div key={k} className="text-xs text-gray-500 block">Status: {oldS} &rarr; {newS}</div>;
            }
            if (k === 'priority') {
              return <div key={k} className="text-xs text-gray-500 block">Priority: {oldVal[k]} &rarr; {newVal[k]}</div>;
            }
            if (k === 'title') {
              return <div key={k} className="text-xs text-gray-500 block">Title changed</div>;
            }
            if (k === 'description') {
              return <div key={k} className="text-xs text-gray-500 block">Description modified</div>;
            }
            return null;
          })}
        </span>
      );
    }
    return <span>{action}</span>;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Activity</h3>
      <ul className="space-y-4">
        {activities.map((activity: any) => (
          <li key={activity.id} className="flex gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold shrink-0">
              {activity.actor?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div>
                <span className="font-semibold">{activity.actor?.username || 'Unknown User'}</span>{' '}
                {renderChanges(activity.action, activity.oldValue, activity.newValue)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
