"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Folder, Search, Plus, Filter, AlertCircle, ArrowLeft } from "lucide-react";
import DocketCard from "@/components/DocketCard";
import DocketSidebar from "@/components/DocketSidebar";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";

export default function DocketArchivePage() {
  const params = useParams();
  const docketSlug = params?.docket as string;

  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [currentDocket, setCurrentDocket] = useState<DocketItem | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocketsAndCases();
  }, [docketSlug]);

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
          docketNumber: "Docket",
          name: docketSlug?.replace(/-/g, " ").toUpperCase(),
          slug: docketSlug,
          description: "Special intelligence investigation category docket.",
          classificationDefault: "RESTRICTED",
        }
      );

      const casesRes = await fetch(`/api/files?docket=${docketSlug}`);
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
    <div className="flex flex-col md:flex-row gap-4 items-start font-sans">
      {/* Sidebar on Left */}
      <DocketSidebar
        dockets={dockets}
        currentSlug={docketSlug}
        onDocketCreated={(newD: DocketItem) => setDockets((prev) => [...prev, newD])}
      />

      {/* Main Docket Content Area */}
      <div className="flex-1 w-full space-y-4">
        {/* Docket Header Banner */}
        <div className="bg-[#ede9dc] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-4 rounded-xs shadow-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Link href="/home" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Registry
              </Link>
              <span>/</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {currentDocket?.docketNumber}
              </span>
            </div>
            <Link
              href="/upload"
              className="btn-metallic px-3 py-1 text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Lodge Case in this Docket
            </Link>
          </div>

          <div className="border-t border-[#c8c4b7] dark:border-[#273549] pt-2">
            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              DOCKET ARCHIVE: {currentDocket?.name}
            </h2>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
              {currentDocket?.description}
            </p>
          </div>

          {/* Search Filter Box */}
          <div className="pt-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter files within this docket by title, case ID, or keywords..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[#b8b3a5] dark:border-slate-700 font-mono rounded-xs focus:outline-hidden focus:border-[#071931]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            </div>
          </div>
        </div>

        {/* Docket Files Grid */}
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-slate-500 bg-[#fbfaf6] dark:bg-[#0f1722] border border-[#c8c4b7] dark:border-[#273549] rounded-xs">
            SCANNING DOCKET REGISTRY...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-8 text-center rounded-xs space-y-3 font-sans">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200 uppercase">
              NO ACTIVE FILES REGISTERED UNDER THIS DOCKET
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-mono">
              There are currently no declassified case exhibits cataloged in {currentDocket?.name}. You can be the first operative to submit evidence.
            </p>
            <div className="pt-2">
              <Link
                href="/upload"
                className="btn-metallic px-4 py-1.5 text-xs font-serif font-bold rounded-xs inline-block cursor-pointer"
              >
                + Lodge Case File Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((post) => (
              <DocketCard key={post.caseNumber || post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
