"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MessageSquare, ArrowBigUp } from "lucide-react";

export interface RecentPostItem {
  id: string;
  title: string;
  docketSlug: string;
  upvotes: number;
  commentsCount: number;
  thumbnail?: string;
  viewedAt: string;
}

export default function RecentPostsWidget() {
  const [recentPosts, setRecentPosts] = useState<RecentPostItem[]>([]);

  const loadRecentPosts = () => {
    try {
      const stored = localStorage.getItem("reddit_recent_posts");
      if (stored) {
        setRecentPosts(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  };

  useEffect(() => {
    loadRecentPosts();
    window.addEventListener("recent_posts_updated", loadRecentPosts);
    return () => window.removeEventListener("recent_posts_updated", loadRecentPosts);
  }, []);

  const handleClear = () => {
    localStorage.removeItem("reddit_recent_posts");
    setRecentPosts([]);
  };

  if (recentPosts.length === 0) return null;

  return (
    <div className="reddit-card p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          Recent Posts
        </h4>
        <button
          onClick={handleClear}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-[#272729]">
        {recentPosts.map((post) => (
          <div key={post.id} className="py-2.5 first:pt-0 last:pb-0 group">
            <Link href={`/post/${post.id}`} className="flex items-start justify-between gap-2.5">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    c/{post.docketSlug}
                  </span>
                </div>

                <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h5>

                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <ArrowBigUp className="w-3.5 h-3.5" />
                    {post.upvotes} upvotes
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" />
                    {post.commentsCount} comments
                  </span>
                </div>
              </div>

              {post.thumbnail && (
                <div className="w-14 h-14 rounded-md overflow-hidden bg-black/20 shrink-0 border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Utility helper to record a recently viewed post
export function recordRecentPost(post: RecentPostItem) {
  try {
    const raw = localStorage.getItem("reddit_recent_posts");
    let list: RecentPostItem[] = raw ? JSON.parse(raw) : [];
    // Remove if already exists
    list = list.filter((p) => p.id !== post.id);
    list.unshift(post);
    localStorage.setItem("reddit_recent_posts", JSON.stringify(list.slice(0, 8)));
    window.dispatchEvent(new Event("recent_posts_updated"));
  } catch {}
}
