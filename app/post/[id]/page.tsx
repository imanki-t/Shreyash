"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, ShieldAlert, ArrowLeft, Edit3, Trash2, History } from "lucide-react";
import { useSession } from "next-auth/react";
import MediaPlayer from "@/components/MediaPlayer";
import ReactionConsole from "@/components/ReactionConsole";
import InvestigatorFieldLog from "@/components/InvestigatorFieldLog";
import RedactedText from "@/components/RedactedText";
import { IPost } from "@/models/Post";
import { ADMIN_EMAIL } from "@/lib/auth";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;

  const [caseFile, setCaseFile] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [newNarrative, setNewNarrative] = useState("");
  const [amendSummary, setAmendSummary] = useState("");
  const [passkey, setPasskey] = useState("");
  const [amendError, setAmendError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const res = await fetch(`/api/files/${id}`);
      const data = await res.json();
      if (data.case) {
        setCaseFile(data.case);
        setNewNarrative(data.case.debriefNarrative);
      } else {
        setError(data.error || "Case file not found.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to retrieve case file.");
    } finally {
      setLoading(false);
    }
  };

  const isMasterAdmin =
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handlePrint = () => {
    window.print();
  };

  const handleRedactToggle = async () => {
    if (!caseFile) return;
    const action = caseFile.isRedacted ? "restore" : "redact";
    const enteredPasskey = passkey || localStorage.getItem("covert_passkey") || "";

    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          passkey: enteredPasskey,
          userEmail: session?.user?.email,
          amendedBy: session?.user?.name || "Lead Directorate",
          summary: action === "redact" ? "Redacted under Section 4-B Directive" : "Restored to active index",
        }),
      });
      const data = await res.json();
      if (data.success && data.case) {
        setCaseFile(data.case);
      } else {
        alert(data.error || "Failed to alter classification.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAmendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmendError(null);
    const enteredPasskey = passkey || localStorage.getItem("covert_passkey") || "";

    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "amend",
          newNarrative,
          summary: amendSummary || "Deposition details revised",
          passkey: enteredPasskey,
          userEmail: session?.user?.email,
          amendedBy: session?.user?.name || "Operative",
        }),
      });
      const data = await res.json();
      if (data.success && data.case) {
        setCaseFile(data.case);
        setAmendModalOpen(false);
      } else {
        setAmendError(data.error || "Amendment rejected.");
      }
    } catch (e: any) {
      setAmendError(e.message || "Failed to commit amendment.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("EXPUNGE CASE: Are you sure you wish to permanently shred this record from view?")) return;
    const enteredPasskey = passkey || localStorage.getItem("covert_passkey") || "";

    try {
      const res = await fetch(`/api/files/${id}?userEmail=${encodeURIComponent(session?.user?.email || "")}&passkey=${encodeURIComponent(enteredPasskey)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/home");
      } else {
        alert(data.error || "Failed to shred record.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-slate-500">
        RETRIEVING CASE FILE EVIDENCE FROM WAREHOUSE...
      </div>
    );
  }

  if (error || !caseFile) {
    return (
      <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-8 text-center rounded-xs space-y-3 font-mono text-xs">
        <ShieldAlert className="w-8 h-8 mx-auto text-rose-600" />
        <div className="font-serif font-bold text-sm text-slate-800 dark:text-slate-200">
          CASE FILE NOT FOUND OR ARCHIVED
        </div>
        <p className="text-slate-500">{error}</p>
        <Link href="/home" className="btn-metallic px-3 py-1.5 inline-block rounded-xs">
          Return to Central Repository
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 print:space-y-2">
      {/* Top Utility / Breadcrumb Bar */}
      <div className="no-print bg-[#ede9dc] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-2.5 rounded-xs flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Link href="/home" className="hover:underline flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <ArrowLeft className="w-3.5 h-3.5" /> Registry
          </Link>
          <span className="text-slate-400">/</span>
          <Link href={`/archive/${caseFile.docketSlug}`} className="hover:underline text-slate-700 dark:text-slate-300">
            {caseFile.docketName}
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-[#071931] dark:text-[#dfb76c]">{caseFile.caseNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-metallic px-3 py-1 text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Official Deposition
          </button>

          <button
            onClick={() => setAmendModalOpen(true)}
            className="btn-metallic px-2.5 py-1 text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Amend
          </button>

          <button
            onClick={handleRedactToggle}
            className="btn-metallic px-2.5 py-1 text-xs font-serif font-bold rounded-xs flex items-center gap-1 cursor-pointer text-amber-700"
          >
            {caseFile.isRedacted ? "De-Censor" : "Censor (Redact)"}
          </button>

          {isMasterAdmin && (
            <button
              onClick={handleDelete}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer"
              title="Shred Record (Directorate Access)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Deposition Card */}
      <div className="print-document bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs shadow-lg p-5 sm:p-7 space-y-6 font-sans">
        {/* Document Classification Banner */}
        <div className="border-b-2 border-[#071931] dark:border-[#c5a059] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
              OFFICIAL INCIDENT DEPOSITION // CASE RECORD
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              {caseFile.caseNumber}: {caseFile.title}
            </h2>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
              LODGED IN: <span className="font-bold">{caseFile.docketName}</span> &bull; DATE:{" "}
              <span>{new Date(caseFile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {caseFile.isRedacted && (
              <span className="stamp-classified stamp-red text-xs">
                CENSORED UNDER DIRECTIVE 4-B
              </span>
            )}
            <span
              className={`stamp-classified text-xs ${
                caseFile.classificationTier === "RESTRICTED"
                  ? "stamp-red"
                  : "stamp-amber"
              }`}
            >
              {caseFile.classificationTier}
            </span>
          </div>
        </div>

        {/* Two-Column Grid: Evidence Media Player (Left) + Official Deposition Narrative (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Media Surveillance Player (5 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <MediaPlayer
              attachments={caseFile.attachments}
              caseNumber={caseFile.caseNumber}
            />
          </div>

          {/* Right: Deposition Narrative & Investigator Record (7 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#ede9dc] dark:bg-[#16202c] px-3 py-1.5 border border-[#c8c4b7] dark:border-[#273549] font-serif font-bold text-xs uppercase flex items-center justify-between">
              <span className="text-slate-800 dark:text-slate-100">
                OFFICIAL DEPOSITION NARRATIVE
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                BY: {caseFile.author.codename}
              </span>
            </div>

            {/* Formatted Long Narrative */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-[#c8c4b7] dark:border-[#273549] rounded-xs font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              <RedactedText content={caseFile.debriefNarrative} />
            </div>

            {/* Amendment History Log */}
            {caseFile.amendments?.length > 0 && (
              <div className="p-3 bg-[#ede9dc]/50 dark:bg-[#16202c]/50 border border-[#c8c4b7] dark:border-[#273549] rounded-xs space-y-2 text-xs font-mono">
                <div className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <History className="w-3.5 h-3.5 text-[#c5a059]" />
                  REVISION AUDIT TRAIL ({caseFile.amendments.length} AMENDMENTS LOGGED)
                </div>
                <div className="space-y-1.5 divide-y divide-slate-300/60 dark:divide-slate-700">
                  {caseFile.amendments.map((amend, idx) => (
                    <div key={idx} className="pt-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(amend.timestamp).toLocaleDateString()}:
                      </span>{" "}
                      {amend.summary} &mdash; <em>filed by {amend.amendedBy}</em>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Corroboration Console */}
        <ReactionConsole
          caseId={caseFile.caseNumber || (caseFile as any)._id}
          initialStamps={caseFile.stamps}
          initialEmojis={caseFile.emojis}
          initialRatings={caseFile.ratings}
        />

        {/* Investigator Field Notes Log Stream */}
        <InvestigatorFieldLog caseId={caseFile.caseNumber || (caseFile as any)._id} />
      </div>

      {/* Amend Modal */}
      {amendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
          <div className="bg-white dark:bg-[#111822] border-2 border-[#7c8798] p-5 max-w-lg w-full rounded-xs shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-sm uppercase text-slate-900 dark:text-white">
              LODGE FORMAL DEPOSITION AMENDMENT
            </h3>
            <form onSubmit={handleAmendSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-mono mb-1">
                  Amended Narrative Content:
                </label>
                <textarea
                  rows={6}
                  value={newNarrative}
                  onChange={(e) => setNewNarrative(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-slate-50 dark:bg-slate-900 font-serif"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-mono mb-1">
                  Summary of Changes / Justification:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corrected timestamp and added tactical context"
                  value={amendSummary}
                  onChange={(e) => setAmendSummary(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-mono mb-1">
                  Clearance Passkey (if not logged in as Lead Directorate):
                </label>
                <input
                  type="password"
                  placeholder="Enter secret passkey"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>

              {amendError && (
                <div className="text-rose-600 font-mono text-xs">{amendError}</div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAmendModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-metallic px-4 py-1.5 font-serif font-bold rounded-xs cursor-pointer"
                >
                  File Amendment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
