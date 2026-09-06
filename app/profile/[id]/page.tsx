"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ThumbsUp,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Flame,
  Zap,
  Clock,
  MessageSquare,
  Share2,
} from "lucide-react";
import DocketCard from "@/components/DocketCard";

export default function UserProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const decodedId = decodeURIComponent(rawId);

  const [profile, setProfile] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [sort, setSort] = useState<"trending" | "new" | "old">("trending");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);

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

  const joinedFormatted = profile?.firstActive
    ? new Date(profile.firstActive).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/home" className="hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> All Feeds
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">u/{decodedId}</span>
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

          {/* Profile Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-[#272729]">
            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Posts Created
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {profile?.totalPosts ?? cases.length}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Verifications
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {profile?.totalVerifiedStamps ?? 0}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                Reactions
              </div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {profile?.totalReactions ?? 0}
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
              <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                Post Views
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                {profile?.totalViews ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section Bar with Sort Controls */}
      <div className="reddit-card p-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Posts by u/{decodedId} ({cases.length})
        </h2>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSort("trending")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              sort === "trending"
                ? "bg-gray-100 dark:bg-[#272729] text-orange-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Hot</span>
          </button>
          <button
            onClick={() => setSort("new")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              sort === "old"
                ? "bg-gray-100 dark:bg-[#272729] text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>

      {/* User Posts Feed */}
      {loadingCases ? (
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
      )}
    </div>
  );
}
