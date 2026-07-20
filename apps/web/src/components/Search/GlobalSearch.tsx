"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

    const debounce = setTimeout(fetchSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, workspaceId, sessionToken]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const hasResults = results && (results.projects.length > 0 || results.issues.length > 0 || results.comments.length > 0);

  return (
    <div className="relative w-64 md:w-80" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Search projects, issues..."
        className="w-full px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-[350px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 flex flex-col">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-zinc-500">No results found for "{query}"</div>
          ) : (
            <div className="overflow-y-auto py-2">
              {results.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Projects</div>
                  <ul className="flex flex-col">
                    {results.projects.map((p) => (
                      <li key={p.id}>
                        <button 
                          onClick={() => handleResultClick(`/projects/${p.id}/issues`)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 text-black dark:text-white"
                        >
                          <span className="font-medium">{p.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.issues.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Issues</div>
                  <ul className="flex flex-col">
                    {results.issues.map((i) => (
                      <li key={i.id}>
                        <button 
                          onClick={() => handleResultClick(`/projects/${i.project.id}/issues/${i.sequenceId}`)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-black dark:text-white">{i.title}</span>
                            <span className="text-xs text-zinc-500">{i.project.slug}-{i.sequenceId}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.comments.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Comments</div>
                  <ul className="flex flex-col">
                    {results.comments.map((c) => {
                      const bodyText = extractTextFromTipTap(c.body).trim();
                      return (
                        <li key={c.id}>
                          <button 
                            onClick={() => handleResultClick(`/projects/${c.project.id}/issues/${c.project.sequenceId}`)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-black dark:text-white truncate">
                                {bodyText ? bodyText.substring(0, 60) : 'Comment on issue'}...
                              </span>
                              <span className="text-xs text-zinc-500">In {c.project.slug}-{c.project.sequenceId}: {c.issueTitle}</span>
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
