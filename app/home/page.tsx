"use client";

import React, { useState, useEffect } from "react";
import DocketSidebar from "@/components/DocketSidebar";
import SubjectBriefingCard from "@/components/SubjectBriefingCard";
import IncidentsTable from "@/components/IncidentsTable";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";
import { Search, RotateCcw } from "lucide-react";

export default function HomePage() {
  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [cases, setCases] = useState<any[]>([]);
  const [identity, setIdentity] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("trending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [sort]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Dockets
      const docketsRes = await fetch("/api/dockets");
      const docketsData = await docketsRes.json();
      if (docketsData.dockets) setDockets(docketsData.dockets);

      // 2. Fetch Identity
      const identityRes = await fetch("/api/identity");
      const identityData = await identityRes.json();
      if (identityData.identity) setIdentity(identityData.identity);

      // 3. Fetch Cases with AI ranking
      const casesRes = await fetch(`/api/files?sort=${sort}&limit=25`);
      const casesData = await casesRes.json();
      if (casesData.cases) setCases(casesData.cases);
    } catch (e) {
      console.error("Failed to load repository index", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = search
        ? `/api/files?search=${encodeURIComponent(search)}&sort=${sort}&limit=25`
        : `/api/files?sort=${sort}&limit=25`;
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
    <div className="space-y-4">
      {/* Search Console Bar */}
      <div className="bg-[#ede9dc] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-2.5 rounded-xs shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword search console by Incident ID, Title, or Transcript..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[#b8b3a5] dark:border-slate-700 font-mono rounded-xs focus:outline-hidden focus:border-[#071931]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
          </div>
          <div className="flex gap-1.5">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-[#b8b3a5] dark:border-slate-700 font-mono rounded-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
              title="Algorithm Ranking Order"
            >
              <option value="trending">🔥 Trending (AI Priority)</option>
              <option value="new">⚡ Newest First</option>
              <option value="old">⏳ Oldest First</option>
            </select>
            <button
              type="submit"
              className="btn-metallic px-4 py-1.5 text-xs font-serif font-bold rounded-xs cursor-pointer"
            >
              EXECUTE QUERY
            </button>
            {search && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-2 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-500 rounded-xs hover:bg-slate-200"
                title="Reset Query"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Grid: Dockets Tree (Left) + Briefing & Register Table (Right) */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <DocketSidebar
          dockets={dockets}
          currentSlug="all"
          onDocketCreated={(newD: DocketItem) => setDockets((prev) => [...prev, newD])}
        />

        <div className="flex-1 w-full space-y-4">
          <SubjectBriefingCard identity={identity} />
          <IncidentsTable cases={cases} loading={loading} />
        </div>
      </div>
    </div>
  );
}
