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
    <div className="space-y-6 pt-6 border-t-2 border-black dark:border-white">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-xs text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 stroke-[2.5]" />
          Comments
          <span className="text-xs px-2 py-0.5 rounded bg-[#FFE600] text-black font-mono font-black border border-black shadow-[1px_1px_0px_0px_#000]">
            {comments.length}
          </span>
        </h3>
      </div>
      
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <div key={comment.id} className="space-y-3">
            <div className="border-2 border-black dark:border-white p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-xs font-mono font-black text-black shrink-0 shadow-[1.5px_1.5px_0px_0px_#000]">
                  {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-black dark:text-white">{comment.author?.username || 'Unknown'}</span>
                    <span className="text-[11px] font-mono font-bold text-zinc-500">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-black dark:text-zinc-200">
                    <TiptapEditor value={comment.body} onChange={() => {}} editable={false} />
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                      className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      {replyTo === comment.id ? "Cancel" : "Reply"}
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 p-3 border-2 border-black dark:border-white rounded-xl bg-amber-50/50 dark:bg-zinc-950 shadow-[2px_2px_0px_0px_#000]">
                      <TiptapEditor value={body} onChange={setBody} />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="px-3 py-1.5 text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={loading || !body} 
                          className="px-3.5 py-1.5 bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black rounded-lg text-xs font-black disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
                        >
                          <Send className="w-3 h-3 stroke-[2.5]" />
                          {loading ? "Posting..." : "Reply"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-3 pl-3 border-l-2 border-black dark:border-white">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="border-2 border-black dark:border-white p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#4ADE80] border-2 border-black flex items-center justify-center text-[10px] font-mono font-black text-black shrink-0 shadow-[1px_1px_0px_0px_#000]">
                        {reply.author?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-black dark:text-white">{reply.author?.username || 'Unknown'}</span>
                          <span className="text-[11px] font-mono font-bold text-zinc-500">
                            {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-medium text-black dark:text-zinc-200">
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
          <div className="text-zinc-500 text-xs font-bold py-6 text-center border-2 border-dashed border-black dark:border-white rounded-xl">
            No comments yet. Start the conversation below.
          </div>
        )}
      </div>

      <div className="pt-2">
        <h4 className="text-xs font-black uppercase text-black dark:text-white mb-2">Leave a comment</h4>
        <form onSubmit={(e) => handleSubmit(e)} className="border-2 border-black dark:border-white rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
          <TiptapEditor value={replyTo === null ? body : null} onChange={replyTo === null ? setBody : () => {}} />
          <div className="mt-3 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !body || replyTo !== null} 
              className="px-5 py-2.5 bg-[#FFE600] hover:bg-[#FFDE59] text-black border-2 border-black rounded-xl text-xs font-black disabled:opacity-50 transition-all flex items-center gap-2 shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              {loading && replyTo === null ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
