"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DocketSidebar from "@/components/DocketSidebar";
import SubjectBriefingCard from "@/components/SubjectBriefingCard";
import IncidentsTable from "@/components/IncidentsTable";
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
  FileText,
  Shield,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [cases, setCases] = useState<any[]>([]);
  const [identity, setIdentity] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"trending" | "new" | "old">("trending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [sort]);

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

  return (
    <div className="space-y-4 font-sans">
      {/* 3-Column Reddit-Style Responsive Layout */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left: Communities Navigation (Collapsible on mobile) */}
        <DocketSidebar
          dockets={dockets}
          currentSlug="all"
          onDocketCreated={(newD: DocketItem) => setDockets((prev) => [...prev, newD])}
        />

        {/* Center: Main Feed */}
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

          {/* Sort Controls Bar */}
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
                <span>Top / Oldest</span>
              </button>
            </div>

            {/* In-feed Search Filter */}
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter posts..."
                  className="w-36 sm:w-48 text-xs bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-gray-700 rounded-lg pl-7 pr-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
              </div>
              {search && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Clear filter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Posts Feed */}
          <IncidentsTable cases={cases} loading={loading} />
        </div>

        {/* Right: Sidebar Widgets (About Shreyash & Guidelines) */}
        <div className="hidden lg:block w-72 shrink-0 space-y-4">
          <SubjectBriefingCard identity={identity} />

          {/* Community Guidelines Widget */}
          <div className="reddit-card p-4 space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              Archive Rules
            </h4>
            <ol className="space-y-1.5 list-decimal pl-4">
              <li>Keep posts fun, friendly, and respectful of the squad.</li>
              <li>Tag audio wiretaps and video clips in the correct sub-group.</li>
              <li>Use spoiler tags for surprising or sensitive punchlines.</li>
            </ol>
            <div className="pt-2 border-t border-gray-100 dark:border-[#272729]">
              <Link
                href="/upload"
                className="w-full btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Post</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
