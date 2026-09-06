"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import RedactedText from "./RedactedText";

interface SubjectBriefingCardProps {
  identity: any;
}

export default function SubjectBriefingCard({ identity }: SubjectBriefingCardProps) {
  const subjectName = identity?.legalDesignation || "Shreyash";
  const codenames = identity?.operationalCodenames?.join(", ") || "The Architect, Subject Prime";

  return (
    <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-4 rounded-xs shadow-xs relative overflow-hidden font-sans">
      {/* Red Classification Stamp in Corner */}
      <div className="absolute top-3 right-4 rotate-2 pointer-events-none">
        <span className="stamp-classified stamp-red text-xs">
          CLASSIFIED // TIER 2
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Silhouette Mugshot Card */}
        <div className="relative w-20 h-24 bg-[#e5e1d3] dark:bg-slate-800 border border-[#b8b3a5] dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-inner rounded-xs">
          <div className="w-12 h-12 rounded-full bg-[#334155] flex items-center justify-center text-slate-300">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-[#071931] text-[9px] text-[#e6ca85] font-mono text-center py-0.5 uppercase tracking-wider">
            POI #001
          </div>
        </div>

        {/* Details & Redacted Brief */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#b91c1c]" />
            <h3 className="font-serif font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">
              SUBJECT STATUS BRIEFING: PERSON OF INTEREST #001 ({subjectName.toUpperCase()})
            </h3>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div>
              <span className="font-mono text-[11px] font-bold text-slate-500">OPERATIONAL ALIASES: </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{codenames}</span>
            </div>
            <div>
              <span className="font-mono text-[11px] font-bold text-slate-500">CLEARANCE STATUS: </span>
              <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                {identity?.clearanceTier || "LEVEL 4 SURVEILLANCE // RESTRICTED"}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs italic pt-0.5">
              <RedactedText content="Subject exhibits unpredictable tactical decisions during multiplayer simulations. ||Multiple unverified detonations|| recorded across server nodes. ||Total loyalty to the squad confirmed||." />
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">
              DIRECTORATE FILE: #POI-001-DOSSIER
            </span>
            <Link
              href="/identity"
              className="inline-flex items-center gap-1.5 btn-metallic px-2.5 py-1 text-[11px] font-serif font-bold rounded-xs cursor-pointer"
            >
              Access Full Subject Dossier <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
