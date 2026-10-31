"use client";

import { useState } from "react";
import { createCommentAction } from "../actions/commentActions";
import TiptapEditor from "./TiptapEditor";
import { format } from "date-fns";
import { MessageSquare, CornerDownRight, Send } from "lucide-react";

export default function CommentThread({ issueId, projectId, comments }: { issueId: string, projectId: string, comments: any[] }) {
  const [body, setBody] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!body) return;
    setLoading(true);

    try {
      await createCommentAction(projectId, issueId, { body, parentId });
      setBody(null);
      setReplyTo(null);
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          Comments
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-normal">
            {comments.length}
          </span>
        </h3>
      </div>
      
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <div key={comment.id} className="space-y-3">
            <div className="border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-xl bg-white dark:bg-zinc-900/60 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
                  {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{comment.author?.username || 'Unknown'}</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <TiptapEditor value={comment.body} onChange={() => {}} editable={false} />
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      {replyTo === comment.id ? "Cancel" : "Reply"}
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50">
                      <TiptapEditor value={body} onChange={setBody} />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={loading || !body} 
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          {loading ? "Posting..." : "Reply"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Replies (1 level deep) */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-3 pl-3 border-l-2 border-zinc-200 dark:border-zinc-800">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="border border-zinc-200/80 dark:border-zinc-800/80 p-3 rounded-lg bg-white dark:bg-zinc-900/60 shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
                        {reply.author?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{reply.author?.username || 'Unknown'}</span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                          <TiptapEditor value={reply.body} onChange={() => {}} editable={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-zinc-400 dark:text-zinc-500 text-xs py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No comments yet. Start the conversation below.
          </div>
        )}
      </div>

      <div className="pt-2">
        <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Leave a comment</h4>
        <form onSubmit={(e) => handleSubmit(e)} className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-white dark:bg-zinc-900/60 p-3 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
          <TiptapEditor value={replyTo === null ? body : null} onChange={replyTo === null ? setBody : () => {}} />
          <div className="mt-3 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !body || replyTo !== null} 
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              {loading && replyTo === null ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
