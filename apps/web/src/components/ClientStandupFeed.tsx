"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Sparkles, Send, Plus, Trash2, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

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
          setDraft(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-xs text-zinc-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span>Loading daily standups...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
      
      {/* Draft Section */}
      {draft ? (
        <div className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Today's Standup Draft</h2>
              </div>
              <p className="text-xs text-zinc-500">Edit or refine your AI-compiled summary before sharing with the team.</p>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-zinc-50 dark:bg-zinc-900">
              AI Draft
            </span>
          </div>
          
          <div className="flex flex-col gap-6">
            <EditableSection title="Accomplished Yesterday" items={draft.yesterday || []} onChange={(v) => updateDraft("yesterday", v)} />
            <EditableSection title="Priorities for Today" items={draft.today || []} onChange={(v) => updateDraft("today", v)} />
            
            {(draft.attention || []).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl">
                <h3 className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Blockers & Attention Required</span>
                </h3>
                <ul className="list-disc pl-5 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  {draft.attention.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button 
              onClick={handlePost}
              className="inline-flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium px-4 py-2 rounded-lg text-xs shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Standup</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-950/50 text-center">
          <Sparkles className="w-6 h-6 text-zinc-400 mb-2" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Generate Today's Standup</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-4">Pillar aggregates your recent ticket updates, PR reviews, and comments into an automated draft.</p>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Aggregating commits & tickets...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compile Standup</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Team Feed */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>Team Updates ({standups.length})</span>
          </h2>
          <span className="text-xs font-mono text-zinc-400">{format(new Date(), "EEEE, MMM d")}</span>
        </div>

        {standups.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
            No updates posted yet for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standups.map(s => (
              <div key={s.id} className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                  {s.user?.avatarUrl ? (
                    <img src={s.user.avatarUrl} className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/60">
                      {s.user?.username?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-xs text-zinc-900 dark:text-zinc-100">{s.user?.username || 'Team Member'}</h3>
                    <p className="text-[10px] font-mono text-zinc-400">{new Date(s.postedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 text-xs leading-relaxed">
                  {s.yesterday?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Yesterday</span>
                      <ul className="list-disc pl-4 text-zinc-700 dark:text-zinc-300 space-y-0.5">
                        {s.yesterday.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.today?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Today</span>
                      <ul className="list-disc pl-4 text-zinc-700 dark:text-zinc-300 space-y-0.5">
                        {s.today.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.attention?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40">
                      <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 block mb-1">Blockers</span>
                      <ul className="list-disc pl-4 text-amber-800 dark:text-amber-300 space-y-0.5">
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
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-mono font-medium uppercase text-zinc-500">{title}</h3>
      <div className="flex flex-col gap-1.5 pl-3 border-l border-zinc-200 dark:border-zinc-800">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <span className="text-zinc-300 dark:text-zinc-700 text-xs">•</span>
            <input 
              value={item} 
              onChange={(e) => handleChange(idx, e.target.value)}
              className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 outline-none border-b border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 py-0.5 transition-colors"
            />
            <button 
              onClick={() => handleRemove(idx)} 
              className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-red-500 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button 
          onClick={handleAdd} 
          className="text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 w-fit mt-1 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add bullet point</span>
        </button>
      </div>
    </div>
  );
}
