"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function ClientStandupFeed({ workspaceId, sessionToken }: { workspaceId: string; sessionToken: string }) {
  const [standups, setStandups] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const dateStr = format(new Date(), "yyyy-MM-dd");

  const fetchStandups = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const [feedRes, todayRes] = await Promise.all([
        fetch(`${apiUrl}/api/workspaces/${workspaceId}/standups?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }),
        fetch(`${apiUrl}/api/workspaces/${workspaceId}/standups/today?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        })
      ]);

      if (feedRes.ok) {
        const json = await feedRes.json();
        setStandups(json.data || []);
      }
      if (todayRes.ok) {
        const json = await todayRes.json();
        if (json.data && json.data.status === "DRAFT") {
          setDraft(json.data);
        } else {
          setDraft(null); // It's posted or doesn't exist
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandups();
  }, [workspaceId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/standups/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      if (res.ok) {
        await fetchStandups();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!draft) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/workspaces/${workspaceId}/standups/${draft.id}/post`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      await fetchStandups();
    } catch (e) {
      console.error(e);
    }
  };

  const updateDraft = async (field: string, value: string[]) => {
    if (!draft) return;
    const newDraft = { ...draft, [field]: value };
    setDraft(newDraft);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/api/workspaces/${workspaceId}/standups/${draft.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ [field]: value })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-zinc-500">Loading standups...</div>;

  return (
    <div className="flex flex-col gap-12">
      {/* Draft Section */}
      {draft ? (
        <div className="border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
              AI Draft
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">Your Standup Draft</h2>
            <p className="text-sm text-zinc-500 mt-1">Review your AI-generated draft before posting to the team.</p>
          </div>
          
          <div className="flex flex-col gap-6">
            <EditableSection title="Yesterday" items={draft.yesterday || []} onChange={(v) => updateDraft("yesterday", v)} />
            <EditableSection title="Today" items={draft.today || []} onChange={(v) => updateDraft("today", v)} />
            
            {(draft.attention || []).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 rounded-lg">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Attention Required</h3>
                <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-300">
                  {draft.attention.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-blue-200/50 dark:border-blue-900/30">
            <button 
              onClick={handlePost}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              Post to Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="text-sm font-medium bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Today's Standup"}
          </button>
        </div>
      )}

      {/* Team Feed */}
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-black dark:text-white">Team Updates ({standups.length})</h2>
        {standups.length === 0 ? (
          <p className="text-zinc-500 text-sm p-8 text-center bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
            No updates posted yet today.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {standups.map(s => (
              <div key={s.id} className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  {s.user?.avatarUrl ? (
                    <img src={s.user.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-medium text-black">
                      {s.user?.username?.[0] || 'T'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm text-black dark:text-white">{s.user?.username || 'Team Member'}</h3>
                    <p className="text-xs text-zinc-500">{new Date(s.postedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 text-sm">
                  {s.yesterday?.length > 0 && (
                    <div>
                      <strong className="text-zinc-700 dark:text-zinc-300 block mb-1">Yesterday</strong>
                      <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-400 space-y-1">
                        {s.yesterday.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.today?.length > 0 && (
                    <div>
                      <strong className="text-zinc-700 dark:text-zinc-300 block mb-1">Today</strong>
                      <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-400 space-y-1">
                        {s.today.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.attention?.length > 0 && (
                    <div>
                      <strong className="text-red-700 dark:text-red-400 block mb-1">Attention</strong>
                      <ul className="list-disc pl-5 text-red-600 dark:text-red-300 space-y-1">
                        {s.attention.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditableSection({ title, items, onChange }: { title: string, items: string[], onChange: (v: string[]) => void }) {
  const handleChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    onChange(newItems);
  };
  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  const handleAdd = () => {
    onChange([...items, ""]);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-black dark:text-white">{title}</h3>
      <div className="flex flex-col gap-2 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <span className="text-zinc-400 mt-1.5">•</span>
            <input 
              value={item} 
              onChange={(e) => handleChange(idx, e.target.value)}
              className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 outline-none border-b border-transparent focus:border-blue-300 dark:focus:border-blue-700 py-1 transition-colors"
            />
            <button onClick={() => handleRemove(idx)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-opacity">
              ×
            </button>
          </div>
        ))}
        <button onClick={handleAdd} className="text-xs text-zinc-500 hover:text-black w-fit mt-1 flex items-center gap-1">
          <span>+ Add item</span>
        </button>
      </div>
    </div>
  );
}
