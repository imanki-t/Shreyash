"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ThumbsUp,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Flame,
  Clock,
  History,
  Paperclip,
} from "lucide-react";
import RedactedText from "@/components/RedactedText";

export default function OperativeProfilePage() {
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

    const fetchOperativeCases = async () => {
      setLoadingCases(true);
      try {
        const res = await fetch(
          `/api/files?author=${encodeURIComponent(decodedId)}&sort=${sort}&limit=50`
        );
        const data = await res.json();
        if (data.cases) setCases(data.cases);
      } catch (err) {
        console.error("Failed to load operative cases", err);
      } finally {
        setLoadingCases(false);
      }
    };

    fetchOperativeCases();
  }, [decodedId, sort]);

  const joinedFormatted = profile?.firstActive
    ? new Date(profile.firstActive).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "CLASSIFIED";

  return (
    <div className="max-w-6xl mx-auto space-y-5 font-sans">
      {/* Top Breadcrumb Ribbon */}
      <div className="bg-[#ede9dc] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-2.5 rounded-xs flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Link
            href="/home"
            className="hover:underline flex items-center gap-1 text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Central Registry
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">Operative Personnel Dossier</span>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-[#071931] dark:text-[#dfb76c]">{decodedId}</span>
        </div>
        <span className="stamp-classified stamp-amber text-[9px]">
          PERSONNEL ARCHIVE // FOIA SECTION 07
        </span>
      </div>

      {/* Operative Federal Dossier Card */}
      <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs shadow-md p-6 relative overflow-hidden">
        {/* Clearance Stamp in Top Right Corner */}
        <div className="absolute top-4 right-6 rotate-2 pointer-events-none">
          <span
            className={`stamp-classified text-xs ${
              profile?.isMasterAdmin ? "stamp-amber" : "stamp-green"
            }`}
          >
            {profile?.isMasterAdmin ? "DIRECTORATE OVERSEER" : "ACTIVE OPERATIVE"}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Avatar / Shield Badge */}
          <div className="w-20 h-20 rounded-full bg-[#071931] border-2 border-[#c5a059] flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-10 h-10 text-[#d8c396]" />
          </div>

          {/* Identity Details */}
          <div className="space-y-1.5 flex-1">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              FIELD INVESTIGATIVE CODENAME
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-slate-900 dark:text-white uppercase">
              {profile?.codename || decodedId}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="stamp-classified stamp-blue text-[10px]">
                {profile?.clearanceTier || "FIELD OPERATIVE // LEVEL 2"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <Calendar className="w-3 h-3 text-[#c5a059]" />
                COMMISSIONED: {joinedFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#c8c4b7] dark:border-[#273549]">
          <div className="bg-[#ede9dc] dark:bg-[#152130] p-3 rounded-xs border border-[#c8c4b7] dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#c5a059]" />
              Dossiers Filed
            </div>
            <div className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
              {profile?.totalPosts ?? cases.length}
            </div>
          </div>

          <div className="bg-[#ede9dc] dark:bg-[#152130] p-3 rounded-xs border border-[#c8c4b7] dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verifications
            </div>
            <div className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {profile?.totalVerifiedStamps ?? 0}
            </div>
          </div>

          <div className="bg-[#ede9dc] dark:bg-[#152130] p-3 rounded-xs border border-[#c8c4b7] dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-amber-500" />
              Reactions
            </div>
            <div className="text-xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1">
              {profile?.totalReactions ?? 0}
            </div>
          </div>

          <div className="bg-[#ede9dc] dark:bg-[#152130] p-3 rounded-xs border border-[#c8c4b7] dark:border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-500" />
              Exhibits Viewed
            </div>
            <div className="text-xl font-serif font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {profile?.totalViews ?? 0}
            </div>
          </div>
        </div>

        {/* Contributing Dockets Badges */}
        {profile?.dockets && profile.dockets.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500 text-[10px] uppercase mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#c5a059]" />
              DOCKET ASSIGNMENTS:
            </span>
            {profile.dockets.map((dock: string) => (
              <span
                key={dock}
                className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xs text-[10px]"
              >
                {dock}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Posts Section Header & Sorting Bar */}
      <div className="bg-[#ede9dc] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-3 rounded-xs shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c5a059]" />
            INCIDENT DOSSIERS LODGED BY THIS OPERATIVE ({cases.length})
          </h2>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Classified incident filings authored or corroborated under this callsign
          </p>
        </div>

        {/* Sorting Tabs: Trending / New / Old */}
        <div className="flex items-center gap-1 bg-[#ded9cb] dark:bg-[#1a2636] p-1 rounded-xs border border-[#c8c4b7] dark:border-slate-700">
          <button
            onClick={() => setSort("trending")}
            className={`px-3 py-1 text-xs font-mono rounded-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              sort === "trending"
                ? "bg-[#071931] text-amber-300 font-bold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            Trending
          </button>
          <button
            onClick={() => setSort("new")}
            className={`px-3 py-1 text-xs font-mono rounded-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              sort === "new"
                ? "bg-[#071931] text-cyan-300 font-bold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
            }`}
          >
            <Clock className="w-3 h-3 text-cyan-400" />
            Newest
          </button>
          <button
            onClick={() => setSort("old")}
            className={`px-3 py-1 text-xs font-mono rounded-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              sort === "old"
                ? "bg-[#071931] text-slate-200 font-bold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
            }`}
          >
            <History className="w-3 h-3 text-slate-400" />
            Oldest
          </button>
        </div>
      </div>

      {/* Cases List */}
      {loadingCases ? (
        <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-12 text-center text-xs font-mono text-slate-500">
          <div className="animate-spin inline-block w-5 h-5 border-2 border-[#071931] border-t-transparent rounded-full mb-2" />
          <div>SCANNING OPERATIVE FILING ARCHIVES...</div>
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-10 text-center rounded-xs space-y-3 font-mono text-xs">
          <FileText className="w-8 h-8 mx-auto text-slate-400" />
          <div className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200 uppercase">
            NO DECLASSIFIED EXHIBITS FILED BY THIS CALLSIGN
          </div>
          <p className="text-slate-500 max-w-md mx-auto">
            This operative has not yet lodged any public incident dossiers into the central repository.
          </p>
          <div className="pt-2">
            <Link
              href="/upload"
              className="btn-metallic px-4 py-1.5 text-xs font-serif font-bold rounded-xs inline-block cursor-pointer"
            >
              + Lodge Deposition Under Your Name
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            });

            return (
              <div
                key={c._id}
                className="bg-[#fbfaf6] dark:bg-[#111822] border-2 border-[#c8c4b7] dark:border-[#273549] p-4 rounded-xs shadow-xs hover:border-[#7c8798] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className="font-bold text-[#071931] dark:text-[#dfb76c]">
                      {c.caseNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{formattedDate}</span>
                    <span className="text-slate-400">•</span>
                    <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xs">
                      {c.docketName}
                    </span>
                    {c.aiScore !== undefined && (
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        {c.aiScore}% Priority
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white hover:text-[#b91c1c] dark:hover:text-[#e6ca85]">
                    <Link href={`/post/${c.caseNumber || c._id}`}>
                      {c.isRedacted ? "[REDACTED UNDER DIRECTIVE 4-B]" : c.title}
                    </Link>
                  </h3>

                  <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic font-serif">
                    <RedactedText content={c.debriefNarrative} />
                  </div>

                  {c.attachments && c.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 pt-1">
                      <Paperclip className="w-2.5 h-2.5" />
                      <span>{c.attachments.length} Exhibit(s) attached</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/post/${c.caseNumber || c._id}`}
                    className="btn-metallic px-3 py-1.5 text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect Dossier
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
