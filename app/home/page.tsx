"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DocketSidebar from "@/components/DocketSidebar";
import DocketCard from "@/components/DocketCard";
import SubjectBriefingCard from "@/components/SubjectBriefingCard";
import RecentPostsWidget from "@/components/RecentPostsWidget";
import CommunityAboutWidget from "@/components/CommunityAboutWidget";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";
import {
  Flame,
  Zap,
  Clock,
  Search,
  RotateCcw,
  Image as ImageIcon,
  Plus,
  Compass,
  LayoutGrid,
  List,
  ArrowUp,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [cases, setCases] = useState<any[]>([]);
  const [identity, setIdentity] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"trending" | "new" | "old">("trending");
  const [viewMode, setViewMode] = useState<"card" | "compact">("card");
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [sort]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const docketsRes = await fetch("/api/dockets");
      const docketsData = await docketsRes.json();
      if (docketsData.dockets) setDockets(docketsData.dockets);

      const identityRes = await fetch("/api/identity");
      const identityData = await identityRes.json();
      if (identityData.identity) setIdentity(identityData.identity);

      const casesRes = await fetch(`/api/files?sort=${sort}&limit=30`);
      const casesData = await casesRes.json();
      if (casesData.cases) setCases(casesData.cases);
    } catch (e) {
      console.error("Failed to load feed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = search
        ? `/api/files?search=${encodeURIComponent(search)}&sort=${sort}&limit=30`
        : `/api/files?sort=${sort}&limit=30`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.cases) setCases(data.cases);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearch("");
    fetchInitialData();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 3-Column Reddit-Style Responsive Layout */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left: Collapsible Communities Navigation Drawer */}
        <DocketSidebar
          dockets={dockets}
          currentSlug="all"
          onDocketCreated={(newD: DocketItem) => setDockets((prev) => [...prev, newD])}
        />

        {/* Center: Main Feed Stream */}
        <div className="flex-1 w-full space-y-4 min-w-0">
          {/* Quick Create Post Box (Reddit style) */}
          <div className="reddit-card p-3 flex items-center gap-3">
            <Link href="/upload" className="shrink-0">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </Link>

            <Link
              href="/upload"
              className="flex-1 bg-gray-100 hover:bg-gray-200/80 dark:bg-[#272729] dark:hover:bg-[#343536] text-gray-500 dark:text-gray-400 text-xs px-4 py-2.5 rounded-lg transition-colors text-left"
            >
              Create Post...
            </Link>

            <Link
              href="/upload"
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#272729] rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
              title="Upload Image/Media"
            >
              <ImageIcon className="w-5 h-5" />
            </Link>
          </div>

          {/* Sort Controls & View Mode Bar (Reddit Feed Toolbar) */}
          <div className="reddit-card p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSort("trending")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  sort === "trending"
                    ? "bg-gray-100 dark:bg-[#272729] text-orange-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4 text-orange-500" />
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
                <Zap className="w-4 h-4 text-blue-500" />
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
                <Clock className="w-4 h-4" />
                <span>Top</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle: Card vs Compact */}
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-[#272729] p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewMode === "card"
                      ? "bg-white dark:bg-[#1a1a1b] text-blue-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    viewMode === "compact"
                      ? "bg-white dark:bg-[#1a1a1b] text-blue-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title="Compact View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* In-feed Search Filter */}
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search feed..."
                    className="w-32 sm:w-44 text-xs bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-gray-700 rounded-lg pl-7 pr-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
                </div>
                {search && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Clear filter"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Posts Feed Stream */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="reddit-card p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-16 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <div className="reddit-card p-12 text-center space-y-3">
              <Compass className="w-10 h-10 mx-auto text-gray-400" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                No posts found in this feed
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Be the first to share an incident, inside meme, or commentary.
              </p>
              <Link href="/upload" className="btn-primary inline-flex py-1.5 px-4 text-xs">
                Create First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((post) => (
                <DocketCard key={post.caseNumber || post._id} post={post} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Posts & Community Widgets (Matching Reddit Screenshot) */}
        <div className="hidden lg:block w-76 shrink-0 space-y-4">
          {/* Recent Posts Widget (From User Screenshot) */}
          <RecentPostsWidget />

          {/* Community Info & Rules Widget */}
          <CommunityAboutWidget />

          {/* About Shreyash Subject Profile Briefing */}
          <SubjectBriefingCard identity={identity} />
        </div>
      </div>

      {/* Floating Back to Top Pill Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-in fade-in"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to Top</span>
        </button>
      )}
    </div>
  );
}
