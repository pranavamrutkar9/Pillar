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
    <div className="space-y-5 pt-6 border-t border-white/[0.08]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-[#EDEDED] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#8A8F98]" />
          Comments
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8A8F98] font-normal">
            {comments.length}
          </span>
        </h3>
      </div>
      
      <div className="space-y-3">
        {comments.map((comment: any) => (
          <div key={comment.id} className="space-y-3">
            <div className="border border-white/[0.08] p-4 rounded-xl bg-[#141519] shadow-md transition-all hover:border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1F2027] border border-white/10 flex items-center justify-center text-xs font-semibold text-[#5E6AD2] shrink-0">
                  {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#EDEDED]">{comment.author?.username || 'Unknown'}</span>
                    <span className="text-[11px] text-[#626773]">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-[#CCCCCC]">
                    <TiptapEditor value={comment.body} onChange={() => {}} editable={false} />
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} 
                      className="text-xs text-[#8A8F98] hover:text-[#EDEDED] flex items-center gap-1 transition-colors"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      {replyTo === comment.id ? "Cancel" : "Reply"}
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 p-3 border border-white/[0.08] rounded-lg bg-[#0B0C0E]">
                      <TiptapEditor value={body} onChange={setBody} />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="px-3 py-1.5 text-xs text-[#8A8F98] hover:bg-white/[0.06] rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={loading || !body} 
                          className="px-3 py-1.5 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(94,106,210,0.4)]"
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
              <div className="pl-6 space-y-2 border-l border-white/[0.08]">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="border border-white/[0.06] p-3 rounded-lg bg-[#111215]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#1F2027] border border-white/10 flex items-center justify-center text-[10px] font-semibold text-[#8A8F98] shrink-0">
                        {reply.author?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#EDEDED]">{reply.author?.username || 'Unknown'}</span>
                          <span className="text-[10px] text-[#626773]">
                            {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="mt-1.5 text-xs text-[#CCCCCC]">
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

        {/* Root Comment Box */}
        <form onSubmit={(e) => handleSubmit(e, null)} className="border border-white/[0.08] p-4 rounded-xl bg-[#141519]">
          <div className="mb-3">
            <TiptapEditor value={body} onChange={setBody} />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !body} 
              className="px-4 py-1.5 bg-[#5E6AD2] hover:bg-[#525ec2] text-white rounded-md text-xs font-medium disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(94,106,210,0.4)]"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
