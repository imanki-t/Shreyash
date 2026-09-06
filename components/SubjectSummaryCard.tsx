"use client";

import React from "react";
import Link from "next/link";
import RedactedText from "./RedactedText";

export default function SubjectSummaryCard() {
  return (
    <div className="bg-[#fdfbf7] dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] p-4 rounded-xs shadow-xs relative overflow-hidden font-sans">
      {/* Background Watermark Stamp */}
      <div className="absolute top-2 right-4 rotate-12 pointer-events-none opacity-85">
        <span className="stamp-classified stamp-red text-xs sm:text-sm">
          CLASSIFIED // TIER 4
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Silhouette Mugshot Card */}
        <div className="w-20 h-24 sm:w-24 sm:h-28 bg-slate-200 dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 flex flex-col items-center justify-between p-1.5 shrink-0 select-none shadow-inner">
          <div className="w-full text-center border-b border-slate-300 dark:border-slate-800 text-[9px] font-mono text-slate-500 uppercase">
            POI #001
          </div>
          {/* Silhouette icon */}
          <div className="relative my-auto">
            <svg
              className="w-12 h-12 text-slate-400 dark:text-slate-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="w-full text-center bg-slate-300 dark:bg-slate-800 text-[8px] font-mono font-bold tracking-widest text-slate-700 dark:text-slate-300">
            SHREYASH
          </div>
        </div>

        {/* Narrative Briefing */}
        <div className="flex-1 space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              OFFICIAL SUBJECT BRIEFING:
            </span>
            <span className="font-serif font-black text-sm uppercase text-slate-900 dark:text-white">
              PERSON OF INTEREST #001 (SHREYASH)
            </span>
          </div>

          <p className="font-serif leading-relaxed text-slate-700 dark:text-slate-300 text-xs">
            Subject exhibits anomalous tactical variance across multi-environment virtual operations.
            Intelligence intercepts corroborate <RedactedText text="||chronic claims that 'the controller disconnected'||" /> precisely preceding catastrophic mission failure.
            Despite multiple unauthorized explosive detonations, Subject is evaluated as an indispensable core asset of the friend group Directorate.
          </p>

          <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span>LEGAL STATUS: ACTIVE</span>
              <span>•</span>
              <span>SURVEILLANCE: CONTINUOUS</span>
            </div>
            <Link
              href="/identity"
              className="font-serif font-bold text-xs text-[#071931] dark:text-[#e6ca85] hover:underline flex items-center gap-1"
            >
              Access Complete Subject Dossier & Vital Statistics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
