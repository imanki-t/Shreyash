"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  Volume2,
  FileText,
  Paperclip,
  Check,
  Lock,
  Tag,
} from "lucide-react";
import { IPost } from "@/models/Post";
import RedactedText from "./RedactedText";
import { recordRecentPost } from "./RecentPostsWidget";

interface DocketCardProps {
  post: IPost;
  viewMode?: "card" | "compact";
}

const FLAIR_COLORS: Record<string, string> = {
  Discussion: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-900",
  Meme: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900",
  Media: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-900",
  Question: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
  OC: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900",
};

export default function DocketCard({ post, viewMode = "card" }: DocketCardProps) {
  const caseId = post.caseNumber || (post as any)._id;
  const hasVideo = post.attachments?.some((a) => a.mediaType === "video");
  const hasAudio = post.attachments?.some((a) => a.mediaType === "audio");
  const hasImage = post.attachments?.some((a) => a.mediaType === "image");
  const firstImage = post.attachments?.find((a) => a.mediaType === "image");

  const [voteCount, setVoteCount] = useState<number>(
    (post.emojis?.thumbsUp || 0) - (post.emojis?.thumbsDown || 0) + (post.stamps?.verifiedAccurate || 0)
  );
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("reddit_saved_posts");
      if (saved) {
        const list = JSON.parse(saved);
        setIsSaved(list.includes(caseId));
      }
    } catch {}
  }, [caseId]);

  const handleVote = async (delta: 1 | -1, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (userVote === delta) {
      setUserVote(0);
      setVoteCount((prev) => prev - delta);
    } else {
      const diff = userVote === 0 ? delta : delta * 2;
      setUserVote(delta);
      setVoteCount((prev) => prev + diff);
    }

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          type: "emoji",
          field: delta === 1 ? "thumbsUp" : "thumbsDown",
        }),
      });
    } catch {}
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${caseId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("reddit_saved_posts");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(caseId)) {
        list = list.filter((id) => id !== caseId);
        setIsSaved(false);
      } else {
        list.push(caseId);
        setIsSaved(true);
      }
      localStorage.setItem("reddit_saved_posts", JSON.stringify(list));
    } catch {}
  };

  const handlePostClick = () => {
    recordRecentPost({
      id: caseId,
      title: post.title,
      docketSlug: post.docketSlug,
      upvotes: voteCount,
      commentsCount: 0,
      thumbnail: firstImage ? `/api/media/${firstImage.fileId}` : undefined,
      viewedAt: new Date().toISOString(),
    });
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const flairStyle =
    (post.flair && FLAIR_COLORS[post.flair]) ||
    "bg-gray-100 dark:bg-[#272729] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";

  // Compact View Mode (Reddit Classic)
  if (viewMode === "compact") {
    return (
      <article
        onClick={handlePostClick}
        className="reddit-card p-2 sm:px-3 sm:py-2 flex items-center justify-between gap-3 group hover:border-gray-400 dark:hover:border-gray-600 transition"
      >
        {/* Votes */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => handleVote(1, e)}
            className={`p-1 rounded-sm cursor-pointer ${userVote === 1 ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
          >
            <ArrowBigUp className={`w-4 h-4 ${userVote === 1 ? "fill-current" : ""}`} />
          </button>
          <span className="text-xs font-bold min-w-6 text-center">{voteCount}</span>
          <button
            onClick={(e) => handleVote(-1, e)}
            className={`p-1 rounded-sm cursor-pointer ${userVote === -1 ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
          >
            <ArrowBigDown className={`w-4 h-4 ${userVote === -1 ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Thumbnail (if any) */}
        {firstImage && (
          <div className="w-12 h-10 rounded-sm overflow-hidden bg-black/20 shrink-0 border border-gray-200 dark:border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/media/${firstImage.fileId}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and Meta */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Link
              href={`/archive/${post.docketSlug}`}
              className="font-bold text-gray-800 dark:text-gray-200 hover:underline"
            >
              c/{post.docketSlug}
            </Link>
            <span>•</span>
            <span>u/{post.author?.codename || "Anonymous"}</span>

            {post.isPrivate && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                <Lock className="w-2.5 h-2.5" />
                Private
              </span>
            )}

            {post.flair && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium border ${flairStyle}`}>
                {post.flair}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link href={`/post/${caseId}`}>{post.title}</Link>
          </h3>
        </div>

        {/* Action Link */}
        <div className="shrink-0 flex items-center gap-2 text-gray-400">
          <Link
            href={`/post/${caseId}`}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-full"
            title="Open Post"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </article>
    );
  }

  // Card View Mode (Standard Reddit Feed)
  return (
    <article
      onClick={handlePostClick}
      className="reddit-card flex flex-col sm:flex-row overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition"
    >
      {/* Left Vertical Vote Bar (Desktop) */}
      <div className="hidden sm:flex flex-col items-center py-3 px-2 bg-gray-50/50 dark:bg-[#161a1d] border-r border-gray-100 dark:border-[#272729] shrink-0 w-11 select-none">
        <button
          onClick={(e) => handleVote(1, e)}
          className={`p-1 rounded-sm hover:bg-gray-200 dark:hover:bg-[#272729] transition-colors cursor-pointer ${
            userVote === 1 ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
          }`}
          title="Upvote"
        >
          <ArrowBigUp className={`w-5 h-5 ${userVote === 1 ? "fill-current" : ""}`} />
        </button>

        <span
          className={`text-xs font-bold my-0.5 ${
            userVote === 1
              ? "text-orange-500"
              : userVote === -1
              ? "text-blue-500"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {voteCount}
        </span>

        <button
          onClick={(e) => handleVote(-1, e)}
          className={`p-1 rounded-sm hover:bg-gray-200 dark:hover:bg-[#272729] transition-colors cursor-pointer ${
            userVote === -1 ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
          }`}
          title="Downvote"
        >
          <ArrowBigDown className={`w-5 h-5 ${userVote === -1 ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Main Post Card Content */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between space-y-3 min-w-0">
        <div className="space-y-2">
          {/* Post Header Meta */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Link
              href={`/archive/${post.docketSlug}`}
              className="font-bold text-gray-900 dark:text-gray-200 hover:underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              c/{post.docketSlug}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link
              href={`/profile/${encodeURIComponent(post.author?.codename || "User")}`}
              className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              u/{post.author?.codename || "Anonymous"}
            </Link>
            <span>•</span>
            <span className="text-[11px]">{formattedDate}</span>

            {/* Private Indicator */}
            {post.isPrivate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-semibold border border-amber-200 dark:border-amber-800">
                <Lock className="w-2.5 h-2.5" />
                Private Post
              </span>
            )}

            {/* Flair Badge */}
            {post.flair && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${flairStyle}`}>
                {post.flair}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Link href={`/post/${caseId}`}>
              {post.isRedacted ? "[Redacted Content]" : post.title}
            </Link>
          </h3>

          {/* Excerpt with Spoilers */}
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
            <RedactedText content={post.debriefNarrative} />
          </div>

          {/* Media Preview (if attached) */}
          {(firstImage || hasVideo || hasAudio) && (
            <div className="mt-2 rounded-lg overflow-hidden bg-black/90 border border-gray-200 dark:border-gray-800 max-h-80 flex items-center justify-center">
              {firstImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/${firstImage.fileId}`}
                  alt={post.title}
                  className="w-full max-h-80 object-contain hover:scale-101 transition duration-200"
                />
              ) : hasVideo ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-200">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <span className="text-xs font-semibold">Video Media</span>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-200">
                  <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-lg">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold">Audio Recording</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-2 border-t border-gray-100 dark:border-[#272729] flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {/* Mobile Upvote Controls */}
          <div className="flex sm:hidden items-center gap-1 bg-gray-100 dark:bg-[#272729] px-2 py-1 rounded-full">
            <button
              onClick={(e) => handleVote(1, e)}
              className={`p-0.5 ${userVote === 1 ? "text-orange-500" : ""}`}
            >
              <ArrowBigUp className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-1">{voteCount}</span>
            <button
              onClick={(e) => handleVote(-1, e)}
              className={`p-0.5 ${userVote === -1 ? "text-blue-500" : ""}`}
            >
              <ArrowBigDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/post/${caseId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussion</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>

            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors cursor-pointer ${
                isSaved ? "text-blue-600 dark:text-blue-400" : ""
              }`}
              title={isSaved ? "Saved to Bookmarks" : "Save Post"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          {post.attachments?.length > 0 && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              {post.attachments.length} file(s)
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
