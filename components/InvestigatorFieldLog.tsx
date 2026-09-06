"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Send, User, MessageSquare, Clock, EyeOff } from "lucide-react";
import RedactedText from "./RedactedText";

interface CommentItem {
  _id: string;
  authorName: string;
  authorCodename: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
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
            className="w-full p-3 bg-white dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500 transition-colors"
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
            No comments yet. Be the first to share your reaction!
          </div>
        ) : (
          comments.map((entry) => {
            const timeFormatted = new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={entry._id} className="pt-3.5 first:pt-0 space-y-1.5">
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
