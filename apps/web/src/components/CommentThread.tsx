"use client";

import { useState } from "react";
import { createCommentAction } from "../actions/commentActions";
import TiptapEditor from "./TiptapEditor";
import { format } from "date-fns";

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
    <div className="space-y-6 mt-8">
      <h3 className="font-semibold text-lg border-b pb-2">Comments</h3>
      
      <div className="space-y-6">
        {comments.map((comment: any) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex gap-3 text-sm border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-800 dark:text-blue-300 font-bold shrink-0">
                {comment.author?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="w-full">
                <div className="flex justify-between">
                  <span className="font-semibold">{comment.author?.username || 'Unknown'}</span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="mt-2">
                  <TiptapEditor value={comment.body} onChange={() => {}} editable={false} />
                </div>
                
                <div className="mt-2 text-right">
                  <button 
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {replyTo === comment.id ? "Cancel Reply" : "Reply"}
                  </button>
                </div>

                {/* Reply Form */}
                {replyTo === comment.id && (
                  <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
                    <TiptapEditor value={body} onChange={setBody} />
                    <div className="mt-2 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={loading || !body} 
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                      >
                        {loading ? "Posting..." : "Post Reply"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Replies (1 level deep) */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-12 space-y-4">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="flex gap-3 text-sm border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg bg-white dark:bg-zinc-950">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-800 dark:text-blue-300 font-bold shrink-0">
                      {reply.author?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between">
                        <span className="font-semibold">{reply.author?.username || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(reply.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <TiptapEditor value={reply.body} onChange={() => {}} editable={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-gray-500 text-sm italic">No comments yet.</div>
        )}
      </div>

      <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <h4 className="font-semibold mb-2">Leave a comment</h4>
        <form onSubmit={(e) => handleSubmit(e)} className="border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 p-4">
          <TiptapEditor value={replyTo === null ? body : null} onChange={replyTo === null ? setBody : () => {}} />
          <div className="mt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !body || replyTo !== null} 
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {loading && replyTo === null ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
