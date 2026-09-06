"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, Trash2, RotateCcw, AlertTriangle, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
 

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const isMasterAdmin =
    (session?.user as any)?.role === "admin" || (session?.user as any)?.isAdmin === true;

  useEffect(() => {
    if (session?.user?.email) {
      fetchAdminStats();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?userEmail=${encodeURIComponent(session?.user?.email || "")}`);
      const resData = await res.json();
      if (resData.error) {
        setMsg(resData.error);
      } else {
        setData(resData);
      }
    } catch (e: any) {
      setMsg(e.message || "Failed to load administration console.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          userEmail: session?.user?.email,
          amendedBy: "Director Ankit",
          summary: "Restored to active record by Lead Directorate",
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        fetchAdminStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShred = async (id: string) => {
    if (!confirm("EXPUNGE: Permanently shred this record from the repository?")) return;
    try {
      const res = await fetch(`/api/files/${id}?userEmail=${encodeURIComponent(session?.user?.email || "")}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        fetchAdminStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-slate-500">
        VALIDATING DIRECTORATE CLEARANCE CREDENTIALS...
      </div>
    );
  }

  if (!isMasterAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-rose-600 rounded-xs text-center space-y-3 font-sans">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="font-serif font-bold text-base uppercase text-slate-900 dark:text-white">
          UNAUTHORIZED CLEARANCE TIER
        </h2>
        <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
          This oversight terminal is strictly restricted to Lead Directorate authority:{" "}
          <strong className="text-rose-600"> </strong>.
        </p>
        <p className="text-[11px] text-slate-500 font-mono">
          Authenticate using your registered Google account via the top-right clearance menu.
        </p>
        <Link href="/home" className="btn-metallic px-4 py-1.5 inline-block text-xs font-serif font-bold rounded-xs">
          Return to Public Archives
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Directorate Header */}
      <div className="bg-[#071931] text-white p-5 border-2 border-[#c5a059] rounded-xs shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#e6ca85] uppercase">
            DIRECTORATE OF SPECIAL INVESTIGATIONS // EXECUTIVE SUITE
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-white uppercase">
            LEAD DIRECTORATE OVERSIGHT TERMINAL
          </h2>
          <div className="text-xs font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>AUTHENTICATED AS LEAD DIRECTOR:  </span>
          </div>
        </div>

        <Link
          href="/identity"
          className="btn-metallic px-3 py-1.5 text-xs font-serif font-bold rounded-xs flex items-center gap-1.5 shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Amend Subject Dossier
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#ede9dc] dark:bg-[#16202c] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">
            TOTAL ACTIVE DEPOSITIONS
          </span>
          <span className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
            {data?.totalCases || 0}
          </span>
        </div>

        <div className="p-4 bg-[#ede9dc] dark:bg-[#16202c] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">
            CENSORED / REDACTED FILES
          </span>
          <span className="font-serif font-bold text-2xl text-[#b91c1c]">
            {data?.redactedCases?.length || 0}
          </span>
        </div>

        <div className="p-4 bg-[#ede9dc] dark:bg-[#16202c] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">
            CLEARANCE AUTHORITY
          </span>
          <span className="font-serif font-bold text-sm text-[#071931] dark:text-[#dfb76c] block mt-1">
            LEVEL 5 DIRECTORATE
          </span>
        </div>
      </div>

      {/* Redacted & Censored Files Oversight */}
      <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs shadow-xs p-5 space-y-4">
        <div className="border-b border-[#c8c4b7] dark:border-[#273549] pb-2 flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#b91c1c]" />
            CENSORED & SOFT-REDACTED CASE FILES ({data?.redactedCases?.length || 0})
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            CONFIDENTIAL TOMBSTONE AUDIT
          </span>
        </div>

        {data?.redactedCases?.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xs">
            NO CASES ARE CURRENTLY UNDER CENSORSHIP OR REDACTION.
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {data?.redactedCases?.map((c: any) => (
              <div
                key={c.caseNumber || c._id}
                className="p-3 bg-[#ede9dc]/60 dark:bg-[#16202c]/60 border border-[#c8c4b7] dark:border-[#273549] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="stamp-classified stamp-red text-[9px]">
                      CENSORED
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.caseNumber}: {c.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    LODGED IN: {c.docketName} &bull; BY: {c.author?.codename}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/post/${c.caseNumber || c._id}`}
                    className="btn-metallic px-2.5 py-1 text-[10px] rounded-xs"
                  >
                    Inspect File
                  </Link>
                  <button
                    onClick={() => handleRestore(c.caseNumber || c._id)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> De-Censor
                  </button>
                  <button
                    onClick={() => handleShred(c.caseNumber || c._id)}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Expunge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Depositions Stream */}
      <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs shadow-xs p-5 space-y-3">
        <h3 className="font-serif font-bold text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2 border-b border-[#c8c4b7] dark:border-[#273549] pb-2">
          <FileText className="w-4 h-4 text-[#071931] dark:text-[#c5a059]" />
          ALL RECENT REPOSITORY FILINGS (GLOBAL OVERSIGHT)
        </h3>

        <div className="divide-y divide-[#c8c4b7]/50 dark:divide-[#273549]/50 font-mono text-xs">
          {data?.allRecentCases?.map((c: any) => (
            <div
              key={c.caseNumber || c._id}
              className="py-2 flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <span className="font-bold text-[#071931] dark:text-[#dfb76c] mr-2">
                  {c.caseNumber}
                </span>
                <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">
                  {c.title}
                </span>
                <span className="text-[10px] text-slate-500 ml-2">
                  ({c.docketName})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/post/${c.caseNumber || c._id}`}
                  className="btn-metallic px-2 py-0.5 text-[10px] rounded-xs"
                >
                  View
                </Link>
                <button
                  onClick={() => handleShred(c.caseNumber || c._id)}
                  className="text-rose-600 hover:text-rose-800 p-1"
                  title="Expunge Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
