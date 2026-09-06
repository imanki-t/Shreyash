"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  User,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ThumbsUp,
  Eye,
  Calendar,
  Layers,
  Flame,
  Zap,
  Clock,
  Bookmark,
  Settings,
} from "lucide-react";
import DocketCard from "@/components/DocketCard";

export default function UserProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const decodedId = decodeURIComponent(rawId);
  const { data: session } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [savedCases, setSavedCases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [sort, setSort] = useState<"trending" | "new" | "old">("trending");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);

  const isOwnProfile =
    session?.user &&
    ((session.user as any).codename === decodedId ||
      session.user.name === decodedId ||
      session.user.email === decodedId);

  useEffect(() => {
    if (!decodedId) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(decodedId)}`);
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [decodedId]);

  useEffect(() => {
    if (!decodedId) return;

    const fetchUserPosts = async () => {
      setLoadingCases(true);
      try {
        const res = await fetch(
          `/api/files?author=${encodeURIComponent(decodedId)}&sort=${sort}&limit=50`
        );
        const data = await res.json();
        if (data.cases) setCases(data.cases);
      } catch (err) {
        console.error("Failed to load user posts", err);
      } finally {
        setLoadingCases(false);
      }
    };

    fetchUserPosts();
  }, [decodedId, sort]);

  useEffect(() => {
    if (activeTab === "saved") {
      try {
        const savedIds = JSON.parse(localStorage.getItem("reddit_saved_posts") || "[]");
        if (savedIds.length > 0) {
          fetch("/api/files?limit=50")
            .then((r) => r.json())
            .then((d) => {
              if (d.cases) {
                setSavedCases(
                  d.cases.filter((c: any) =>
                    savedIds.includes(c.caseNumber || c._id)
                  )
                );
              }
            })
            .catch(() => {});
        } else {
          setSavedCases([]);
        }
      } catch {}
    }
  }, [activeTab]);

  const joinedFormatted = profile?.firstActive
    ? new Date(profile.firstActive).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  // Karma calculation
  const postKarma = (profile?.totalPosts || cases.length) * 10 + (profile?.totalVerifiedStamps || 0) * 5;
  const reactionKarma = profile?.totalReactions || 0;
  const totalKarma = postKarma + reactionKarma;

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Link href="/home" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Feeds
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">u/{decodedId}</span>
        </div>

        {isOwnProfile && (
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#272729] hover:bg-gray-200 dark:hover:bg-[#343536] text-gray-800 dark:text-gray-200 rounded-full font-medium transition"
          >
            <Settings className="w-3.5 h-3.5 text-gray-500" />
            <span>Profile Settings</span>
          </Link>
        )}
      </div>

      {/* Reddit-Style User Profile Header */}
      <div className="reddit-card overflow-hidden">
        {/* Profile Banner */}
        <div className="h-24 sm:h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500" />

        <div className="p-5 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 -mt-10 sm:-mt-12">
            <div className="flex items-end gap-3.5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-[#1a1a1b] border-4 border-white dark:border-[#1a1a1b] shadow-md flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  u/{profile?.codename || decodedId}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-medium text-[11px]">
                    {profile?.isMasterAdmin ? "Administrator" : "Community Member"}
                  </span>
                  <span>•</span>
                  <span>Joined {joinedFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Karma & Stats Bar (Reddit Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-[#272729]">
            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Total Karma
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {totalKarma}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Post Karma
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {postKarma}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                Reaction Karma
              </div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {reactionKarma}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                Total Views
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                {profile?.totalViews ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Sort Controls Bar */}
      <div className="reddit-card p-2 sm:p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs: Posts vs Saved */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "posts"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Posts ({cases.length})</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "saved"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Posts</span>
            </button>
          )}
        </div>

        {/* Sort Controls (when on Posts tab) */}
        {activeTab === "posts" && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSort("trending")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sort === "trending"
                  ? "bg-gray-100 dark:bg-[#272729] text-orange-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setSort("new")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sort === "new"
                  ? "bg-gray-100 dark:bg-[#272729] text-blue-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span>New</span>
            </button>
            <button
              onClick={() => setSort("old")}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sort === "old"
                  ? "bg-gray-100 dark:bg-[#272729] text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>
        )}
      </div>

      {/* Feed Content */}
      {activeTab === "posts" ? (
        loadingCases ? (
          <div className="reddit-card p-10 text-center text-xs text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
            <div>Loading user posts...</div>
          </div>
        ) : cases.length === 0 ? (
          <div className="reddit-card p-10 text-center space-y-2 text-xs text-gray-500">
            <FileText className="w-8 h-8 mx-auto text-gray-400" />
            <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
              No posts published by this user yet
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((post) => (
              <DocketCard key={post.caseNumber || post._id} post={post} />
            ))}
          </div>
        )
      ) : savedCases.length === 0 ? (
        <div className="reddit-card p-10 text-center space-y-2 text-xs text-gray-500">
          <Bookmark className="w-8 h-8 mx-auto text-gray-400" />
          <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
            You haven't saved any posts yet
          </div>
          <p className="text-[11px] text-gray-400">
            Click the "Save" bookmark button on any post to keep it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedCases.map((post) => (
            <DocketCard key={post.caseNumber || post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
