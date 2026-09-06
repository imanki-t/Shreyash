"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Reply,
  MinusCircle,
  PlusCircle,
  Search,
  Flame,
  ChevronDown,
  User,
  LogIn,
} from "lucide-react";
import RedactedText from "./RedactedText";

interface CommentItem {
  _id: string;
  caseId: string;
  parentId?: string;
  authorName: string;
  authorCodename: string;
  authorEmail?: string;
  content: string;
  score: number;
  userVotes?: Array<{ userId: string; vote: number }>;
  createdAt: string;
}

interface CommentsProps {
  caseId: string;
}

export default function InvestigatorFieldLog({ caseId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentSearch, setCommentSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"trending" | "new">("trending");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1 | 0>>({});
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [caseId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?caseId=${caseId}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
        // Map user votes
        if (session?.user) {
          const myId = session.user.email || (session.user as any).codename;
          const votesMap: Record<string, 1 | -1 | 0> = {};
          data.comments.forEach((c: any) => {
            const found = c.userVotes?.find((v: any) => v.userId === myId);
            if (found) votesMap[c._id] = found.vote;
          });
          setUserVotes(votesMap);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e?: React.FormEvent, parentId?: string) => {
    if (e) e.preventDefault();
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    const textToPost = parentId ? replyText.trim() : newContent.trim();
    if (!textToPost) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          parentId,
          content: textToPost,
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        if (parentId) {
          setReplyText("");
          setReplyingTo(null);
        } else {
          setNewContent("");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentVote = async (commentId: string, delta: 1 | -1) => {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          commentId,
          action: "vote",
          delta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUserVotes((prev) => ({ ...prev, [commentId]: data.userVote }));
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, score: data.score } : c))
        );
      }
    } catch {}
  };

  const toggleCollapse = (id: string) => {
    setCollapsedThreads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  const filteredRoots = rootComments.filter((c) => {
    if (!commentSearch) return true;
    return (
      c.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.authorCodename.toLowerCase().includes(commentSearch.toLowerCase())
    );
  });

  return (
    <div className="reddit-card overflow-hidden font-sans space-y-0">
      {/* Header & Search Bar (Screenshot 2) */}
      <div className="p-4 border-b border-gray-200 dark:border-[#343536] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Comments ({comments.length})
            </h3>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">Sort by:</span>
            <button
              onClick={() => setSortOrder(sortOrder === "trending" ? "new" : "trending")}
              className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 hover:text-blue-600 cursor-pointer"
            >
              <span>{sortOrder === "trending" ? "Trending" : "New"}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Comments Pill */}
        <div className="relative">
          <input
            type="text"
            value={commentSearch}
            onChange={(e) => setCommentSearch(e.target.value)}
            placeholder="Search Comments"
            className="w-full bg-gray-100 dark:bg-[#272729] rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-hidden focus:border-blue-500 border border-transparent"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* "Join the conversation" Input Area (Screenshot 2) */}
      <div className="p-4 bg-gray-50/70 dark:bg-[#161a1d] border-b border-gray-200 dark:border-[#343536]">
        {session?.user ? (
          <form onSubmit={(e) => handlePostComment(e)} className="space-y-2.5">
            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Join the conversation..."
              className="w-full p-3 bg-white dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500 transition-colors leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !newContent.trim()}
                className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Posting..." : "Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center space-y-2 bg-white dark:bg-[#1a1a1b]">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Guests can only view content. Log in or sign up to leave a comment.
            </p>
            <Link
              href="/identity"
              className="btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-4"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </Link>
          </div>
        )}
      </div>

      {/* Guest Sign In Modal Alert */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1a1b] p-6 rounded-2xl border border-gray-200 dark:border-[#343536] max-w-sm w-full space-y-4 text-center shadow-2xl">
            <User className="w-10 h-10 text-blue-500 mx-auto" />
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Sign in to participate
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Guests can view all posts and discussions. To vote or comment, please sign in.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/identity" className="btn-primary py-2 text-xs text-center">
                Sign In with Google
              </Link>
              <button
                onClick={() => setShowSignInModal(false)}
                className="btn-secondary py-1.5 text-xs cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threaded Comments Tree (Screenshot 4) */}
      <div className="p-4 sm:p-5 space-y-4">
        {filteredRoots.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No comments yet. Be the first to join the conversation!
          </div>
        ) : (
          filteredRoots.map((comment) => (
            <CommentThreadNode
              key={comment._id}
              comment={comment}
              getReplies={getReplies}
              isCollapsed={Boolean(collapsedThreads[comment._id])}
              onToggleCollapse={() => toggleCollapse(comment._id)}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onReplySubmit={(parentId: string) => handlePostComment(undefined, parentId)}
              onVote={handleCommentVote}
              userVote={userVotes[comment._id] || 0}
              userVotes={userVotes}
              loading={loading}
              session={session}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Recursive Comment Thread Node with vertical nesting guide lines
function CommentThreadNode({
  comment,
  getReplies,
  isCollapsed,
  onToggleCollapse,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onReplySubmit,
  onVote,
  userVote,
  userVotes,
  loading,
  session,
}: any) {
  const replies = getReplies(comment._id);
  const timeFormatted = new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-2 text-xs">
      {/* Comment Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          title={isCollapsed ? "Expand thread" : "Collapse thread"}
        >
          {isCollapsed ? (
            <PlusCircle className="w-3.5 h-3.5" />
          ) : (
            <MinusCircle className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 font-bold text-[9px]">
          {comment.authorCodename.substring(0, 1).toUpperCase()}
        </div>

        <Link
          href={`/profile/${encodeURIComponent(comment.authorCodename)}`}
          className="font-bold text-gray-900 dark:text-gray-100 hover:underline hover:text-blue-500"
        >
          u/{comment.authorCodename}
        </Link>

        <span className="text-gray-400">•</span>
        <span className="text-gray-400 text-[11px]">{timeFormatted}</span>
      </div>

      {!isCollapsed && (
        <div className="pl-6 space-y-2">
          {/* Comment Body */}
          <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            <RedactedText content={comment.content} />
          </div>

          {/* Action bar: Vote pill ( ↑ score ↓ ) + Reply */}
          <div className="flex items-center gap-3 text-gray-500 text-xs">
            {/* Vote pill */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#272729] px-2 py-0.5 rounded-full">
              <button
                onClick={() => onVote(comment._id, 1)}
                className={`p-0.5 hover:text-orange-500 cursor-pointer ${userVote === 1 ? "text-orange-500" : ""}`}
              >
                <ArrowBigUp className={`w-3.5 h-3.5 ${userVote === 1 ? "fill-current" : ""}`} />
              </button>
              <span className={`text-[11px] font-bold min-w-4 text-center ${userVote === 1 ? "text-orange-500" : userVote === -1 ? "text-blue-500" : ""}`}>
                {comment.score || 1}
              </span>
              <button
                onClick={() => onVote(comment._id, -1)}
                className={`p-0.5 hover:text-blue-500 cursor-pointer ${userVote === -1 ? "text-blue-500" : ""}`}
              >
                <ArrowBigDown className={`w-3.5 h-3.5 ${userVote === -1 ? "fill-current" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200 font-semibold cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>

          {/* Inline Reply Input */}
          {replyingTo === comment._id && (
            <div className="pt-2 space-y-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to u/${comment.authorCodename}...`}
                className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onReplySubmit(comment._id)}
                  disabled={loading || !replyText.trim()}
                  className="btn-primary py-1 px-3 text-xs"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies with Continuous Left Vertical Connector Line */}
          {replies.length > 0 && (
            <div className="border-l-2 border-gray-200 dark:border-[#343536] pl-3 sm:pl-4 space-y-3 mt-3">
              {replies.map((child: any) => (
                <CommentThreadNode
                  key={child._id}
                  comment={child}
                  getReplies={getReplies}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReplySubmit={onReplySubmit}
                  onVote={onVote}
                  userVote={userVotes[child._id] || 0}
                  userVotes={userVotes}
                  loading={loading}
                  session={session}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
