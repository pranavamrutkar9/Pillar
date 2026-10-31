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
      <div className="flex items-center justify-center p-12 text-xs font-bold text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin mr-2 stroke-[2.5]" />
        <span>Loading daily standups...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto">
      
      {/* Draft Section */}
      {draft ? (
        <div className="border-3 border-black dark:border-white bg-[#FFE600] text-black rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                <h2 className="text-lg font-black uppercase tracking-wider">Today's Standup Draft</h2>
              </div>
              <p className="text-xs font-bold text-black/80">Edit or refine your AI-compiled summary before sharing with the team.</p>
            </div>
            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000]">
              AI COMPILED
            </span>
          </div>
          
          <div className="flex flex-col gap-6">
            <EditableSection title="Accomplished Yesterday" items={draft.yesterday || []} onChange={(v) => updateDraft("yesterday", v)} />
            <EditableSection title="Priorities for Today" items={draft.today || []} onChange={(v) => updateDraft("today", v)} />
            
            {(draft.attention || []).length > 0 && (
              <div className="flex flex-col gap-2 p-4 border-2 border-black bg-[#FF6B6B] rounded-xl shadow-[3px_3px_0px_0px_#000]">
                <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  <span>Blockers & Attention Required</span>
                </h3>
                <ul className="list-disc pl-5 text-xs font-bold text-black space-y-1">
                  {draft.attention.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-black">
            <button 
              onClick={handlePost}
              className="inline-flex items-center gap-2 bg-black text-white hover:bg-zinc-800 font-black px-5 py-2.5 rounded-xl text-xs shadow-[3px_3px_0px_0px_#fff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Publish Standup</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 text-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <Sparkles className="w-8 h-8 text-black dark:text-white mb-2 stroke-[2.5]" />
          <h3 className="text-base font-black text-black dark:text-white mb-1 uppercase">Generate Today's Standup</h3>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 max-w-sm mb-4">Pillar aggregates your recent ticket updates, PR reviews, and comments into an automated draft.</p>
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 text-xs font-black bg-[#FFE600] text-black hover:bg-[#FFDE59] border-2 border-black px-5 py-2.5 rounded-xl shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Aggregating commits & tickets...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Compile Standup</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Team Feed */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
          <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Team Updates ({standups.length})</span>
          </h2>
          <span className="text-xs font-mono font-bold bg-[#FFE600] text-black px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            {format(new Date(), "EEEE, MMM d")}
          </span>
        </div>

        {standups.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000]">
            No updates posted yet for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {standups.map(s => (
              <div key={s.id} className="p-5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-2xl shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-black dark:border-white">
                  {s.user?.avatarUrl ? (
                    <img src={s.user.avatarUrl} className="w-8 h-8 rounded-lg border-2 border-black" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-xs font-mono font-black text-black shadow-[1.5px_1.5px_0px_0px_#000]">
                      {s.user?.username?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-xs text-black dark:text-white">{s.user?.username || 'Team Member'}</h3>
                    <p className="text-[10px] font-mono font-bold text-zinc-500">{new Date(s.postedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 text-xs leading-relaxed font-medium">
                  {s.yesterday?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-zinc-500 block mb-1">Yesterday</span>
                      <ul className="list-disc pl-4 text-black dark:text-zinc-200 space-y-0.5">
                        {s.yesterday.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.today?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-zinc-500 block mb-1">Today</span>
                      <ul className="list-disc pl-4 text-black dark:text-zinc-200 space-y-0.5">
                        {s.today.map((item: string, i: number) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.attention?.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-[#FF6B6B]/20 border-2 border-[#FF6B6B]">
                      <span className="text-[10px] font-mono font-black uppercase text-red-700 dark:text-red-400 block mb-1">Blockers</span>
                      <ul className="list-disc pl-4 text-black dark:text-white space-y-0.5 font-bold">
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
      <h3 className="text-xs font-mono font-black uppercase text-black">{title}</h3>
      <div className="flex flex-col gap-2 pl-3 border-l-2 border-black">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <span className="text-black font-black text-xs">•</span>
            <input 
              value={item} 
              onChange={(e) => handleChange(idx, e.target.value)}
              className="flex-1 bg-white border-2 border-black rounded px-2 py-0.5 text-xs font-bold text-black outline-none focus:shadow-[2px_2px_0px_0px_#000] transition-all"
            />
            <button 
              onClick={() => handleRemove(idx)} 
              className="p-1 text-black hover:text-red-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ))}
        <button 
          onClick={handleAdd} 
          className="text-xs font-black text-black hover:underline w-fit mt-1 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add bullet point</span>
        </button>
      </div>
    </div>
  );
}
