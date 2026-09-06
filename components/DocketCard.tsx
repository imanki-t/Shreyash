"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  Volume2,
  Check,
  Lock,
  MoreHorizontal,
  Repeat2,
  Compass,
  Smile,
  Gamepad2,
  HelpCircle,
  Music,
  User,
  Flag,
} from "lucide-react";
import { IPost } from "@/models/Post";
import RedactedText from "./RedactedText";
import { recordRecentPost } from "./RecentPostsWidget";

interface DocketCardProps {
  post: IPost;
  viewMode?: "card" | "compact";
}

const getCommunityIcon = (slug: string) => {
  if (slug.includes("meme") || slug.includes("funny")) {
    return <Smile className="w-3.5 h-3.5 text-amber-500" />;
  }
  if (slug.includes("tech") || slug.includes("gaming") || slug.includes("code")) {
    return <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />;
  }
  if (slug.includes("ask") || slug.includes("question")) {
    return <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />;
  }
  if (slug.includes("music") || slug.includes("audio")) {
    return <Music className="w-3.5 h-3.5 text-rose-500" />;
  }
  return <Compass className="w-3.5 h-3.5 text-blue-500" />;
};

const FLAIR_COLORS: Record<string, string> = {
  Discussion: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-900",
  Meme: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900",
  Rant: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border-red-200 dark:border-red-900",
  Media: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-900",
  Question: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
  OC: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900",
};

export default function DocketCard({ post, viewMode = "card" }: DocketCardProps) {
  const { data: session } = useSession();
  const caseId = post.caseNumber || (post as any)._id;
  const hasVideo = post.attachments?.some((a) => a.mediaType === "video");
  const hasAudio = post.attachments?.some((a) => a.mediaType === "audio");
  const firstImage = post.attachments?.find((a) => a.mediaType === "image");

  const [voteCount, setVoteCount] = useState<number>(
    (post.emojis?.thumbsUp || 0) - (post.emojis?.thumbsDown || 0)
  );
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [isJoined, setIsJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSignInAlert, setShowSignInAlert] = useState(false);

  // Check user's previous vote on load
  useEffect(() => {
    if (session?.user && post.userVotes) {
      const myId = session.user.email || (session.user as any).codename;
      const found = post.userVotes.find((v: any) => v.userId === myId);
      if (found) {
        setUserVote(found.vote as 1 | -1);
      }
    }
  }, [session, post.userVotes]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("reddit_saved_posts");
      if (saved) {
        const list = JSON.parse(saved);
        setIsSaved(list.includes(caseId));
      }
      const joined = localStorage.getItem(`joined_${post.docketSlug}`);
      if (joined === "true") setIsJoined(true);
    } catch {}
  }, [caseId, post.docketSlug]);

  const handleVote = async (delta: 1 | -1, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Guests cannot vote!
    if (!session?.user) {
      setShowSignInAlert(true);
      setTimeout(() => setShowSignInAlert(false), 3000);
      return;
    }

    // Optimistic single-vote update
    let nextVote: 1 | -1 | 0 = 0;
    let nextCount = voteCount;

    if (userVote === delta) {
      // Toggle off
      nextVote = 0;
      nextCount = voteCount - delta;
    } else if (userVote === 0) {
      nextVote = delta;
      nextCount = voteCount + delta;
    } else {
      // Switched from +1 to -1 or vice versa
      nextVote = delta;
      nextCount = voteCount + delta * 2;
    }

    setUserVote(nextVote);
    setVoteCount(nextCount);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          type: "vote",
          delta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUserVote(data.userVote);
        setVoteCount(data.totalScore);
      }
    } catch {
      // revert on network error
      setUserVote(userVote);
      setVoteCount(voteCount);
    }
  };

  const handleToggleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isJoined;
    setIsJoined(nextState);
    try {
      localStorage.setItem(`joined_${post.docketSlug}`, String(nextState));
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

  // Compact View Mode
  if (viewMode === "compact") {
    return (
      <article
        onClick={handlePostClick}
        className="reddit-card p-2 sm:px-3 sm:py-2 flex items-center justify-between gap-3 group hover:border-gray-400 dark:hover:border-gray-600 transition"
      >
        {/* Votes Pill */}
        <div className="flex items-center gap-1 shrink-0 bg-gray-100 dark:bg-[#272729] px-2 py-0.5 rounded-full">
          <button
            onClick={(e) => handleVote(1, e)}
            className={`p-0.5 rounded-sm cursor-pointer ${userVote === 1 ? "text-orange-500" : "text-gray-400 hover:text-orange-500"}`}
          >
            <ArrowBigUp className={`w-4 h-4 ${userVote === 1 ? "fill-current" : ""}`} />
          </button>
          <span className="text-xs font-bold min-w-6 text-center">{voteCount}</span>
          <button
            onClick={(e) => handleVote(-1, e)}
            className={`p-0.5 rounded-sm cursor-pointer ${userVote === -1 ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
          >
            <ArrowBigDown className={`w-4 h-4 ${userVote === -1 ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Thumbnail */}
        {firstImage && (
          <div className="w-12 h-10 rounded-sm overflow-hidden bg-black/20 shrink-0 border border-gray-200 dark:border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/media/${firstImage.fileId}`} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title and Meta */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Link href={`/archive/${post.docketSlug}`} className="font-bold text-gray-800 dark:text-gray-200 hover:underline">
              c/{post.docketSlug}
            </Link>
            <span>•</span>
            <span>u/{post.author?.codename || "Anonymous"}</span>
            {post.flair && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-medium border ${flairStyle}`}>
                {post.flair}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
            <Link href={`/post/${caseId}`}>{post.title}</Link>
          </h3>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-gray-400">
          <Link href={`/post/${caseId}`} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-full">
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </article>
    );
  }

  // Card View Mode (Exact Match to Reddit Screenshots)
  return (
    <article
      onClick={handlePostClick}
      className="reddit-card p-3 sm:p-4 space-y-2.5 overflow-hidden group hover:border-gray-300 dark:hover:border-gray-600 transition"
    >
      {/* Top Meta Bar (Matching Reddit Mobile & Desktop Header) */}
      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Community Icon */}
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#272729] flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
            {getCommunityIcon(post.docketSlug)}
          </div>

          <div className="min-w-0 flex items-center gap-1.5 truncate">
            <Link
              href={`/archive/${post.docketSlug}`}
              className="font-bold text-gray-900 dark:text-white hover:underline truncate"
            >
              c/{post.docketSlug}
            </Link>

            <span className="text-gray-400">•</span>

            {/* Author */}
            <Link
              href={`/profile/${encodeURIComponent(post.author?.codename || "User")}`}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium truncate"
            >
              u/{post.author?.codename || "Anonymous"}
            </Link>

            <span className="text-gray-400">•</span>
            <span className="text-gray-400 shrink-0 text-[11px]">{formattedDate}</span>
          </div>
        </div>

        {/* Right Header Actions: Join Pill + 3-dots Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleJoin}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              isJoined
                ? "bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isJoined ? "Joined" : "Join"}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#272729] cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-xl shadow-xl z-30 p-1 text-xs">
                <button
                  onClick={handleToggleSave}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? "Unsave" : "Save Post"}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Title */}
      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-snug hover:text-blue-600 transition-colors">
        <Link href={`/post/${caseId}`}>{post.title}</Link>
      </h3>

      {/* Flair Tag (Screenshot 5 style) */}
      {(post.flair || post.isPrivate) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.isPrivate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-semibold border border-amber-200 dark:border-amber-800">
              <Lock className="w-2.5 h-2.5" />
              Private
            </span>
          )}
          {post.flair && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${flairStyle}`}>
              {post.flair}
            </span>
          )}
        </div>
      )}

      {/* Media Container (Responsive, rounded-2xl, no overflow) */}
      {(firstImage || hasVideo || hasAudio) && (
        <div className="rounded-2xl overflow-hidden bg-black/90 border border-gray-200 dark:border-gray-800 max-h-96 w-full flex items-center justify-center my-2 select-none">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/media/${firstImage.fileId}`}
              alt={post.title}
              className="w-full max-h-96 object-contain"
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

      {/* Post Text Preview */}
      {post.debriefNarrative && (
        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
          <RedactedText content={post.debriefNarrative} />
        </div>
      )}

      {/* Guest Sign-In Alert (When guest tries to vote) */}
      {showSignInAlert && (
        <div className="p-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between animate-in fade-in">
          <span>Guests can only view. Please sign in to vote!</span>
          <Link href="/identity" className="font-bold underline ml-2">
            Sign In
          </Link>
        </div>
      )}

      {/* Bottom Action Bar (Matching Exact Reddit Mobile Pill Styles: Upvote/Downvote, Comments, Repost, Share) */}
      <div className="flex items-center gap-2 pt-1 text-xs select-none">
        {/* Unified Vote Pill */}
        <div className="flex items-center bg-gray-100 hover:bg-gray-200/80 dark:bg-[#272729] dark:hover:bg-[#343536] px-2 py-1 rounded-full transition">
          <button
            onClick={(e) => handleVote(1, e)}
            className={`p-1 rounded-full cursor-pointer transition ${
              userVote === 1 ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
            }`}
            title="Upvote"
          >
            <ArrowBigUp className={`w-4 h-4 ${userVote === 1 ? "fill-current" : ""}`} />
          </button>

          <span
            className={`text-xs font-bold px-1.5 min-w-5 text-center ${
              userVote === 1 ? "text-orange-500" : userVote === -1 ? "text-blue-500" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {voteCount}
          </span>

          <button
            onClick={(e) => handleVote(-1, e)}
            className={`p-1 rounded-full cursor-pointer transition ${
              userVote === -1 ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
            }`}
            title="Downvote"
          >
            <ArrowBigDown className={`w-4 h-4 ${userVote === -1 ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Comment Pill */}
        <Link
          href={`/post/${caseId}`}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200/80 dark:bg-[#272729] dark:hover:bg-[#343536] px-3 py-1.5 rounded-full font-semibold text-gray-700 dark:text-gray-300 transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
          <span>Comments</span>
        </Link>

        {/* Repost / Loop Pill */}
        <button
          onClick={handleShare}
          className="hidden sm:flex items-center gap-1 bg-gray-100 hover:bg-gray-200/80 dark:bg-[#272729] dark:hover:bg-[#343536] px-2.5 py-1.5 rounded-full text-gray-700 dark:text-gray-300 transition cursor-pointer"
          title="Crosspost / Share"
        >
          <Repeat2 className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Share Pill */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200/80 dark:bg-[#272729] dark:hover:bg-[#343536] px-3 py-1.5 rounded-full font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
          title="Share Link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
      </div>
    </article>
  );
}
