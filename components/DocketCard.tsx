"use client";

import React, { useState } from "react";
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
  Sparkles,
  Paperclip,
  Check,
} from "lucide-react";
import { IPost } from "@/models/Post";
import RedactedText from "./RedactedText";

interface DocketCardProps {
  post: IPost;
}

export default function DocketCard({ post }: DocketCardProps) {
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

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="reddit-card flex flex-col sm:flex-row overflow-hidden group">
      {/* Left Vertical Vote Bar (Desktop) */}
      <div className="hidden sm:flex flex-col items-center py-3 px-2 bg-gray-50/50 dark:bg-[#161a1d] border-r border-gray-100 dark:border-[#272729] shrink-0 w-11">
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

            {/* Flair Badge */}
            <span className="ml-auto px-2 py-0.5 bg-gray-100 dark:bg-[#272729] text-gray-700 dark:text-gray-300 rounded-full text-[10px] font-medium border border-gray-200 dark:border-gray-700">
              {post.docketName}
            </span>
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
