"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowLeft,
  Flame,
  Zap,
  Clock,
  Layers,
  FileText,
  Gamepad2,
  Mic,
  Camera,
  Award,
  Users,
} from "lucide-react";
import DocketCard from "@/components/DocketCard";
import DocketSidebar from "@/components/DocketSidebar";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";

const getCommunityIcon = (slug: string) => {
  if (slug.includes("simulation") || slug.includes("gaming")) {
    return <Gamepad2 className="w-6 h-6 text-purple-500" />;
  }
  if (slug.includes("verbal") || slug.includes("audio")) {
    return <Mic className="w-6 h-6 text-amber-500" />;
  }
  if (slug.includes("photo") || slug.includes("visual")) {
    return <Camera className="w-6 h-6 text-rose-500" />;
  }
  if (slug.includes("commend")) {
    return <Award className="w-6 h-6 text-yellow-500" />;
  }
  return <Layers className="w-6 h-6 text-blue-500" />;
};

export default function CommunityArchivePage() {
  const params = useParams();
  const docketSlug = params?.docket as string;

  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [currentDocket, setCurrentDocket] = useState<DocketItem | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"trending" | "new" | "old">("trending");

  useEffect(() => {
    fetchDocketsAndCases();
  }, [docketSlug, sort]);

  const fetchDocketsAndCases = async () => {
    setLoading(true);
    try {
      const docketsRes = await fetch("/api/dockets");
      const docketsData = await docketsRes.json();
      const list = docketsData.dockets || DEFAULT_DOCKETS;
      setDockets(list);

      const found = list.find((d: DocketItem) => d.slug === docketSlug);
      setCurrentDocket(
        found || {
          docketNumber: "c/" + docketSlug,
          name: docketSlug?.replace(/-/g, " "),
          slug: docketSlug,
          description: "Community sub-group feed.",
          classificationDefault: "PUBLIC",
        }
      );

      const casesRes = await fetch(`/api/files?docket=${docketSlug}&sort=${sort}`);
      const casesData = await casesRes.json();
      if (casesData.cases) setCases(casesData.cases);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(query) ||
      c.caseNumber?.toLowerCase().includes(query) ||
      c.debriefNarrative?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start font-sans">
      {/* Sidebar on Left */}
      <DocketSidebar
        dockets={dockets}
        currentSlug={docketSlug}
        onDocketCreated={(newD: DocketItem) => setDockets((prev) => [...prev, newD])}
      />

      {/* Main Community Area */}
      <div className="flex-1 w-full space-y-4 min-w-0">
        {/* Community Header Banner (Reddit Style) */}
        <div className="reddit-card overflow-hidden">
          <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <div className="p-4 sm:p-5 relative pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 -mt-8 sm:-mt-10">
              <div className="flex items-end gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-[#1a1a1b] border-4 border-white dark:border-[#1a1a1b] shadow-md flex items-center justify-center shrink-0">
                  {getCommunityIcon(docketSlug)}
                </div>
                <div className="pb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {currentDocket?.name}
                  </h1>
                  <span className="text-xs text-gray-500 font-medium">
                    c/{docketSlug} • {cases.length} posts
                  </span>
                </div>
              </div>

              <Link
                href="/upload"
                className="btn-primary text-xs py-2 px-4 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </Link>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-100 dark:border-[#272729]">
              {currentDocket?.description}
            </p>
          </div>
        </div>

        {/* Sort & Filter Controls */}
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

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in this community..."
              className="w-40 sm:w-52 text-xs bg-gray-50 dark:bg-[#272729] border border-gray-200 dark:border-gray-700 rounded-lg pl-7 pr-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="reddit-card p-10 text-center text-xs text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
            <div>Loading community posts...</div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="reddit-card p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              No posts in c/{docketSlug} yet
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Be the first to share an incident, memory, or screenshot in this community!
            </p>
            <Link href="/upload" className="btn-primary text-xs inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((post) => (
              <DocketCard key={post.caseNumber || post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
