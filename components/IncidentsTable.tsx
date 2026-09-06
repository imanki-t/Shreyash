"use client";

import React from "react";
import Link from "next/link";
import { Shield, Eye, Paperclip, FileText, Cpu, Sparkles } from "lucide-react";

export interface CaseItem {
  _id: string;
  caseNumber: string;
  title: string;
  docketSlug: string;
  docketName: string;
  classificationTier: string;
  debriefNarrative: string;
  author: {
    name: string;
    codename: string;
  };
  attachments: Array<{
    fileId: string;
    filename: string;
    mediaType: string;
  }>;
  stamps: {
    verifiedAccurate: number;
    corroborated: number;
    flaggedAnomaly: number;
    discrepancyDetected: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  isRedacted: boolean;
  createdAt: string;
  aiRank?: number;
  aiScore?: number;
}

interface IncidentsTableProps {
  cases: CaseItem[];
  loading?: boolean;
}

export default function IncidentsTable({ cases, loading = false }: IncidentsTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] p-8 text-center text-xs font-mono text-slate-500">
        <div className="animate-spin inline-block w-5 h-5 border-2 border-[#071931] border-t-transparent rounded-full mb-2" />
        <div>DECRYPTING REPOSITORY INDEX RECORDS...</div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] p-8 text-center text-xs text-slate-600 dark:text-slate-400 font-serif">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <div className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-1">
          No Incident Records Lodged Under This Query
        </div>
        <p className="max-w-md mx-auto text-xs text-slate-500 font-sans mb-4">
          All case folders are currently sealed or no reports have been filed yet into the central repository.
        </p>
        <Link
          href="/upload"
          className="inline-block btn-metallic px-4 py-2 font-bold font-serif text-xs uppercase tracking-wider"
        >
          Lodge First Incident Deposition →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] shadow-xs rounded-xs overflow-hidden font-sans">
      {/* Table Header Ribbon */}
      <div className="bg-[#071931] text-white px-3 py-2 border-b-2 border-[#c5a059] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#d8c396]">
            RECENTLY FILED INCIDENT EXHIBITS
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#0d274d] border border-[#273549] text-[9px] font-mono text-cyan-300">
            <Cpu className="w-2.5 h-2.5 text-cyan-400" />
            AI RANKING ACTIVE
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          {cases.length} RECORDS CATALOGED
        </span>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase">
              <th className="py-2.5 px-3 font-semibold">Case File ID</th>
              <th className="py-2.5 px-3 font-semibold">Filing Date</th>
              <th className="py-2.5 px-3 font-semibold">Incident Title & Category</th>
              <th className="py-2.5 px-3 font-semibold">AI Priority</th>
              <th className="py-2.5 px-3 font-semibold">Clearance</th>
              <th className="py-2.5 px-3 font-semibold">Investigator</th>
              <th className="py-2.5 px-3 font-semibold text-right">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-slate-800 dark:text-slate-200 text-xs">
            {cases.map((c) => {
              const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              });

              return (
                <tr
                  key={c._id}
                  className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    <Link
                      href={`/post/${c.caseNumber || c._id}`}
                      className="text-[#071931] dark:text-[#d8c396] hover:underline"
                    >
                      {c.caseNumber}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {formattedDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-serif font-bold text-slate-900 dark:text-white line-clamp-1">
                      <Link
                        href={`/post/${c.caseNumber || c._id}`}
                        className="hover:text-[#b91c1c] dark:hover:text-[#e6ca85]"
                      >
                        {c.isRedacted ? "[REDACTED BY ORDER OF THE BUREAU]" : c.title}
                      </Link>
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {c.docketName}
                      </span>
                      {c.attachments && c.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-slate-400 text-[10px]">
                          <Paperclip className="w-2.5 h-2.5" />
                          {c.attachments.length} Exhibit(s)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {c.aiScore !== undefined ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 rounded-xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        <span>{c.aiScore}%</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`stamp-classified text-[9px] ${
                        c.isRedacted
                          ? "stamp-red"
                          : c.classificationTier === "CONFIDENTIAL"
                          ? "stamp-blue"
                          : "stamp-amber"
                      }`}
                    >
                      {c.isRedacted ? "CENSORED" : c.classificationTier || "RESTRICTED"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                    {c.author.codename || "Operative"}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={`/post/${c.caseNumber || c._id}`}
                      className="btn-metallic px-2.5 py-1 text-[10px] font-serif font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Dossier</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
