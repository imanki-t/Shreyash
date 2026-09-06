"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Send,
  User,
  MessageSquare,
  Clock,
  ArrowBigUp,
  ArrowBigDown,
  Reply,
  Share2,
  Check,
} from "lucide-react";
import RedactedText from "./RedactedText";

interface CommentItem {
  _id: string;
  authorName: string;
  authorCodename: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
  votes?: number;
}

interface InvestigatorFieldLogProps {
  caseId: string;
}

export default function InvestigatorFieldLog({ caseId }: InvestigatorFieldLogProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [authorCodename, setAuthorCodename] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentVotes, setCommentVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedCodename = localStorage.getItem("covert_codename");
    if (savedCodename) setAuthorCodename(savedCodename);
    else if (session?.user?.name) setAuthorCodename(session.user.name);
    else setAuthorCodename("User");

    fetchComments();
  }, [caseId, session]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?caseId=${caseId}`);
      const data = await res.json();
      if (data.comments) setComments(data.comments);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          authorName: session?.user?.name || authorCodename || "User",
          authorCodename: isAnonymous ? "Anonymous" : (authorCodename || "User"),
          authorEmail: session?.user?.email,
          isAnonymous,
          content: newContent.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments([...comments, data.comment]);
        setNewContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (targetAuthor: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const fullContent = `@${targetAuthor} ${replyText.trim()}`;
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          authorName: session?.user?.name || authorCodename || "User",
          authorCodename: isAnonymous ? "Anonymous" : (authorCodename || "User"),
          authorEmail: session?.user?.email,
          isAnonymous,
          content: fullContent,
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments([...comments, data.comment]);
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentVote = (commentId: string, delta: number) => {
    setCommentVotes((prev) => {
      const current = prev[commentId] || 0;
      return { ...prev, [commentId]: current + delta };
    });
  };

  return (
    <div className="reddit-card overflow-hidden font-sans space-y-0">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-200 dark:border-[#343536] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
            Comments & Discussion ({comments.length})
          </h3>
        </div>
      </div>

      {/* Intake Comment Form */}
      <div className="p-4 sm:p-5 bg-gray-50/50 dark:bg-[#161a1d] border-b border-gray-200 dark:border-[#343536]">
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full p-3 bg-white dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500 transition-colors leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded-sm text-blue-600 focus:ring-blue-500"
                />
                <span>Comment Anonymously</span>
              </label>

              {!isAnonymous && (
                <input
                  type="text"
                  value={authorCodename}
                  onChange={(e) => setAuthorCodename(e.target.value)}
                  placeholder="Your Name"
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newContent.trim()}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>
      </div>

      {/* Comment List */}
      <div className="p-4 sm:p-5 space-y-4 divide-y divide-gray-100 dark:divide-[#272729]">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map((entry) => {
            const timeFormatted = new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const voteScore = (commentVotes[entry._id] || 0) + 1;
            const isReplying = replyingTo === entry._id;

            return (
              <div key={entry._id} className="pt-3.5 first:pt-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                      {entry.authorCodename.substring(0, 1).toUpperCase()}
                    </div>
                    {entry.isAnonymous ? (
                      <span className="font-semibold text-gray-500">Anonymous</span>
                    ) : (
                      <Link
                        href={`/profile/${encodeURIComponent(entry.authorCodename || "User")}`}
                        className="font-semibold text-gray-900 dark:text-gray-100 hover:underline hover:text-blue-500 transition-colors"
                      >
                        u/{entry.authorCodename}
                      </Link>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">{timeFormatted}</span>
                </div>

                <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed pl-8">
                  <RedactedText text={entry.content} />
                </div>

                {/* Comment Action Bar: Voting & Reply */}
                <div className="pl-8 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {/* Vote Pill */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#272729] px-2 py-0.5 rounded-full">
                    <button
                      onClick={() => handleCommentVote(entry._id, 1)}
                      className="p-0.5 hover:text-orange-500 cursor-pointer"
                      title="Upvote"
                    >
                      <ArrowBigUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold min-w-4 text-center">
                      {voteScore}
                    </span>
                    <button
                      onClick={() => handleCommentVote(entry._id, -1)}
                      className="p-0.5 hover:text-blue-500 cursor-pointer"
                      title="Downvote"
                    >
                      <ArrowBigDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setReplyingTo(isReplying ? null : entry._id)}
                    className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer text-xs"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline Reply Form */}
                {isReplying && (
                  <form
                    onSubmit={(e) => handleReplySubmit(entry.authorCodename, e)}
                    className="pl-8 pt-2 space-y-2"
                  >
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Replying to u/${entry.authorCodename}...`}
                      className="w-full p-2.5 bg-white dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !replyText.trim()}
                        className="btn-primary py-1 px-3 text-xs cursor-pointer disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
