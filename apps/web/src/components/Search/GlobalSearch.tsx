"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Layers, CheckSquare, MessageSquare, Loader2 } from "lucide-react";

interface SearchResult {
  projects: any[];
  issues: any[];
  comments: any[];
}

const extractTextFromTipTap = (content: any): string => {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(extractTextFromTipTap).join(" ");
  }
  if (typeof content === "object") {
    if (content.text) return content.text;
    if (content.content) return extractTextFromTipTap(content.content);
  }
  return "";
};

export default function GlobalSearch({ workspaceId, sessionToken }: { workspaceId: string, sessionToken?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query.trim()) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/workspaces/${workspaceId}/search?q=${encodeURIComponent(query)}&limit=5`, {
          headers: {
            ...(sessionToken && { Authorization: `Bearer ${sessionToken}` })
          }
        });
        
        if (res.ok) {
          const json = await res.json();
          setResults(json.data);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSearch, 250);
    return () => clearTimeout(debounce);
  }, [query, workspaceId, sessionToken]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const hasResults = results && (results.projects.length > 0 || results.issues.length > 0 || results.comments.length > 0);

  return (
    <div className="relative w-48 sm:w-64" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-xs text-zinc-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto py-2 divide-y divide-zinc-100 dark:divide-zinc-900">
              
              {results.projects.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Projects
                  </div>
                  <ul className="flex flex-col">
                    {results.projects.map((p) => (
                      <li key={p.id}>
                        <button 
                          onClick={() => handleResultClick(`/projects/${p.id}/issues`)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium truncate">{p.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400">{p.slug}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.issues.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3 h-3" /> Issues
                  </div>
                  <ul className="flex flex-col">
                    {results.issues.map((i) => (
                      <li key={i.id}>
                        <button 
                          onClick={() => handleResultClick(`/projects/${i.project.id}/issues/${i.sequenceId}`)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{i.title}</span>
                            <span className="text-[10px] font-mono text-zinc-400">{i.project?.slug}-{i.sequenceId}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.comments.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> Comments
                  </div>
                  <ul className="flex flex-col">
                    {results.comments.map((c) => {
                      const bodyText = extractTextFromTipTap(c.body).trim();
                      return (
                        <li key={c.id}>
                          <button 
                            onClick={() => handleResultClick(`/projects/${c.project.id}/issues/${c.project.sequenceId}`)}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-zinc-700 dark:text-zinc-300 truncate">
                                {bodyText ? bodyText.substring(0, 60) : 'Comment on issue'}...
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">In {c.project?.slug}-{c.project?.sequenceId}</span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
