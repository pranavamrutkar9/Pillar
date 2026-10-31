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
        <Search className="w-4 h-4 text-black dark:text-white absolute left-2.5 pointer-events-none stroke-[2.5]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-lg focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] dark:focus:shadow-[2px_2px_0px_0px_#fff] transition-all text-black dark:text-white placeholder:text-zinc-500 shadow-[1.5px_1.5px_0px_0px_#000] dark:shadow-[1.5px_1.5px_0px_0px_#fff]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border-3 border-black dark:border-white rounded-xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden z-50 max-h-96 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {isLoading ? (
            <div className="p-4 text-center text-xs font-bold text-black dark:text-white flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Searching...</span>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-xs font-bold text-zinc-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto py-2 divide-y-2 divide-black dark:divide-white">
              
              {results.projects.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5 bg-[#FFE600] border-y border-black">
                    <Layers className="w-3 h-3 stroke-[2.5]" /> Projects
                  </div>
                  <ul className="flex flex-col">
                    {results.projects.map((p) => (
                      <li key={p.id}>
                        <button 
                          onClick={() => handleResultClick(`/projects/${p.id}/issues`)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#FEF08A] text-black dark:text-white dark:hover:text-black transition-colors flex items-center justify-between font-bold"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] font-mono font-black bg-white px-1.5 py-0.5 rounded border border-black text-black">{p.slug}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.issues.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5 bg-[#38BDF8] border-y border-black">
                    <CheckSquare className="w-3 h-3 stroke-[2.5]" /> Issues
                  </div>
                  <ul className="flex flex-col">
                    {results.issues.map((i) => (
                      <li key={i.id}>
                        <button 
                          onClick={() => handleResultClick(`/projects/${i.projectId}/issues/${i.sequenceId}`)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#BAE6FD] text-black dark:text-white dark:hover:text-black transition-colors flex items-center justify-between font-bold"
                        >
                          <span className="truncate max-w-[170px]">{i.title}</span>
                          <span className="text-[10px] font-mono font-black bg-white px-1.5 py-0.5 rounded border border-black text-black">#{i.sequenceId}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.comments.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5 bg-[#BBF7D0] border-y border-black">
                    <MessageSquare className="w-3 h-3 stroke-[2.5]" /> Comments
                  </div>
                  <ul className="flex flex-col">
                    {results.comments.map((c) => {
                      const plainText = extractTextFromTipTap(c.content);
                      return (
                        <li key={c.id}>
                          <button 
                            onClick={() => handleResultClick(`/projects/${c.issue.projectId}/issues/${c.issue.sequenceId}`)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#DCFCE7] text-black dark:text-white dark:hover:text-black transition-colors flex flex-col font-medium"
                          >
                            <span className="truncate text-xs font-bold max-w-[240px]">
                              {plainText || "Rich comment content"}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 font-bold">
                              on #{c.issue.sequenceId}
                            </span>
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
