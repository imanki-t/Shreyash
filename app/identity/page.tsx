"use client";

import React, { useState, useEffect } from "react";
import { Printer, Edit3, ShieldAlert, Check, X, Quote } from "lucide-react";
import { useSession } from "next-auth/react";
import RedactedText from "@/components/RedactedText";
import { ADMIN_EMAIL } from "@/lib/auth";

export default function IdentityPage() {
  const { data: session } = useSession();
  const [identity, setIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchIdentity();
  }, []);

  const fetchIdentity = async () => {
    try {
      const res = await fetch("/api/identity");
      const data = await res.json();
      if (data.identity) {
        setIdentity(data.identity);
        setEditForm(data.identity);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isMasterAdmin =
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handlePrint = () => {
    window.print();
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("SAVING...");
    try {
      const res = await fetch("/api/identity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session?.user?.email,
          identityData: editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIdentity(editForm);
        setSaveStatus("SUCCESS");
        setTimeout(() => {
          setSaveStatus(null);
          setEditModalOpen(false);
        }, 800);
      } else {
        setSaveStatus(data.error || "PERMISSION DENIED");
      }
    } catch (err: any) {
      setSaveStatus(err.message || "FAILED");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-slate-500">
        DECRYPTING SUBJECT DOSSIER FROM ARCHIVAL VAULT...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 print:space-y-2">
      {/* Action Bar (Hidden in Print) */}
      <div className="flex items-center justify-between no-print bg-[#ede9dc] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] p-2.5 rounded-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="stamp-classified stamp-red text-xs">
            RESTRICTED DOSSIER // DECLASSIFIED UNDER FOIA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-metallic px-3 py-1 text-xs font-serif font-bold rounded-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Download / Print PDF
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="btn-metallic px-3 py-1 text-xs font-serif font-bold rounded-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Amend Dossier
          </button>
        </div>
      </div>

      {/* Main Dossier Paper Document */}
      <div className="print-document bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs shadow-lg p-6 md:p-8 space-y-6 relative overflow-hidden font-sans">
        {/* Distressed Stamp in Top Right Corner */}
        <div className="absolute top-4 right-6 rotate-2 pointer-events-none">
          <span className="stamp-classified stamp-red text-xs sm:text-sm">
            TOP SECRET // FOR OFFICIAL USE ONLY
          </span>
        </div>

        {/* Official Header */}
        <div className="border-b-2 border-[#071931] dark:border-[#c5a059] pb-3 space-y-1">
          <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
            DEPARTMENT OF INVESTIGATIVE RECORDS // DIVISION 04
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-slate-900 dark:text-white uppercase">
            SUBJECT DOSSIER: PERSON OF INTEREST #001 ({identity?.legalDesignation?.toUpperCase() || "SHREYASH"})
          </h2>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            RECORD IDENTIFIER: <span className="font-bold text-[#b91c1c]">{identity?.subjectId || "POI-001-SHREYASH"}</span>
          </div>
        </div>

        {/* Top Profile Grid: Mugshot + Vital Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Mugshot with Height Measurement Grid */}
          <div className="relative border-2 border-[#c8c4b7] dark:border-[#273549] bg-[#eae6d8] dark:bg-slate-900 p-2 rounded-xs flex flex-col items-center">
            {/* Height Ruler Lines on Background */}
            <div className="relative w-full aspect-3/4 bg-black rounded-xs overflow-hidden border border-slate-700 flex items-center justify-center">
              {/* Ruler Tick Marks */}
              <div className="absolute left-1.5 inset-y-0 flex flex-col justify-between text-[8px] font-mono text-white/50 pointer-events-none select-none z-10">
                <span>6&apos;2&quot;</span>
                <span>6&apos;0&quot;</span>
                <span>5&apos;10&quot;</span>
                <span>5&apos;8&quot;</span>
                <span>5&apos;6&quot;</span>
                <span>5&apos;4&quot;</span>
              </div>
              {/* Seal Mascot Official Mugshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/seal_logo.jpg"
                alt="Subject Surveillance Mugshot"
                className="w-full h-full object-cover filter contrast-110"
              />
              <div className="absolute bottom-2 inset-x-2 bg-black/75 border border-white/30 text-white font-mono text-[9px] text-center py-0.5 uppercase tracking-wider">
                SURVEILLANCE PHOTO // PRIMARY CAPTURE
              </div>
            </div>
            <div className="w-full text-center mt-2 font-mono text-[10px] text-slate-500">
              EXHIBIT A-1: FACIAL RECOGNITION
            </div>
          </div>

          {/* Vital Statistics Table */}
          <div className="md:col-span-2 space-y-2 font-mono text-xs">
            <div className="bg-[#ede9dc] dark:bg-[#16202c] px-3 py-1.5 border border-[#c8c4b7] dark:border-[#273549] font-serif font-bold text-xs uppercase text-slate-800 dark:text-slate-100">
              VITAL STATISTICS & CLEARANCE INDEX
            </div>
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-[#c8c4b7]/50 dark:divide-[#273549]/60">
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-bold w-1/3">LEGAL DESIGNATION:</td>
                  <td className="py-2 px-3 text-slate-900 dark:text-white font-bold">{identity?.legalDesignation}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-bold">OPERATIONAL CODENAMES:</td>
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    {identity?.operationalCodenames?.join(" • ") || "None"}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-bold">CLEARANCE TIER:</td>
                  <td className="py-2 px-3">
                    <span className="stamp-classified stamp-red text-[10px]">
                      {identity?.clearanceTier}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-bold">ACTIVE COORDINATES:</td>
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">{identity?.activeCoordinates}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-bold">ASSIGNED INVESTIGATORS:</td>
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                    {identity?.assignedInvestigators?.map((inv: any) => inv.codename).join(", ")}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-bold">THREAT VARIANCE RATING:</td>
                  <td className="py-2 px-3 font-bold text-amber-700 dark:text-amber-400">
                    {identity?.vitalStatistics?.threatLevel || "CRITICALLY CHAOTIC"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Verbatim Verbal Disclosures */}
        <div className="space-y-2">
          <div className="bg-[#071931] text-white px-3 py-1.5 border-b-2 border-[#c5a059] font-serif font-bold text-xs uppercase flex items-center justify-between">
            <span className="text-[#f3e6c8]">VERBATIM VERBAL DISCLOSURES & OUT-OF-CONTEXT INTERCEPTS</span>
            <span className="text-[10px] font-mono text-slate-300">VOICE RELAY RECORDINGS</span>
          </div>

          <div className="border border-[#c8c4b7] dark:border-[#273549] divide-y divide-[#c8c4b7]/50 dark:divide-[#273549]/50 bg-[#ede9dc]/40 dark:bg-[#16202c]/40 rounded-xs">
            {identity?.verbatimVerbalDisclosures?.map((disclosure: any, idx: number) => (
              <div key={idx} className="p-3 space-y-1 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 border-b border-slate-300/40 pb-1">
                  <span>[TIMESTAMP: {disclosure.timestamp}] // CONTEXT: {disclosure.context}</span>
                  <span className="stamp-classified stamp-amber text-[9px] py-0 px-1">
                    {disclosure.classification}
                  </span>
                </div>
                <div className="font-serif italic text-slate-900 dark:text-slate-100 pt-1 text-sm flex gap-2">
                  <Quote className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                  <span>&ldquo;{disclosure.statement}&rdquo;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Observed Behavioral Anomalies & Known Accomplice Network */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Behavioral Anomalies */}
          <div className="space-y-2">
            <div className="bg-[#ede9dc] dark:bg-[#16202c] px-3 py-1.5 border border-[#c8c4b7] dark:border-[#273549] font-serif font-bold text-xs uppercase text-slate-800 dark:text-slate-100">
              OBSERVED BEHAVIORAL ANOMALIES
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono list-disc list-inside p-2 bg-[#fdfbf7] dark:bg-slate-900 border border-[#c8c4b7] dark:border-slate-800 rounded-xs">
              {identity?.observedBehavioralAnomalies?.map((anomaly: string, i: number) => (
                <li key={i} className="leading-relaxed">
                  <RedactedText content={anomaly} />
                </li>
              ))}
            </ul>
          </div>

          {/* Known Accomplice Network */}
          <div className="space-y-2">
            <div className="bg-[#ede9dc] dark:bg-[#16202c] px-3 py-1.5 border border-[#c8c4b7] dark:border-[#273549] font-serif font-bold text-xs uppercase text-slate-800 dark:text-slate-100">
              KNOWN ACCOMPLICE NETWORK (FIELD INVESTIGATORS)
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {identity?.knownAccompliceNetwork?.map((acc: any, i: number) => (
                <div
                  key={i}
                  className="p-2 bg-[#fdfbf7] dark:bg-slate-900 border border-[#c8c4b7] dark:border-slate-800 rounded-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {acc.designation}
                    </div>
                    <div className="text-[10px] text-slate-500">{acc.clearance}</div>
                  </div>
                  <span className="stamp-classified stamp-green text-[9px]">
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Directorate Assessment (The Wholesome Core) */}
        <div className="p-4 bg-[#f4ecd8] dark:bg-[#1a2433] border-2 border-[#c5a059] rounded-xs space-y-1.5">
          <div className="font-serif font-bold text-xs uppercase text-[#071931] dark:text-[#dfb76c] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#c5a059]" />
            OFFICIAL DIRECTORATE CONCLUDING EVALUATION
          </div>
          <p className="font-serif text-sm italic text-slate-800 dark:text-slate-200 leading-relaxed">
            &ldquo;{identity?.directorateAssessment}&rdquo;
          </p>
          <div className="text-right text-[10px] font-mono text-slate-500">
            RATIFIED BY THE COUNCIL OF SPECIAL INVESTIGATIONS
          </div>
        </div>
      </div>

      {/* Edit Dossier Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
          <div className="bg-white dark:bg-[#111822] border-2 border-[#7c8798] p-5 max-w-lg w-full rounded-xs shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                AMEND CLASSIFIED DOSSIER
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {!isMasterAdmin && (
              <div className="p-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xs">
                Notice: Permanent modifications to the master dossier require Lead Directorate clearance ({ADMIN_EMAIL}). Authenticate via the top right clearance terminal.
              </div>
            )}

            <form onSubmit={handleSaveIdentity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-mono mb-1">
                  Subject Legal Designation:
                </label>
                <input
                  type="text"
                  value={editForm.legalDesignation || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, legalDesignation: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-mono mb-1">
                  Directorate Concluding Evaluation (Wholesome Assessment):
                </label>
                <textarea
                  rows={4}
                  value={editForm.directorateAssessment || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, directorateAssessment: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-slate-50 dark:bg-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs border border-slate-300 text-slate-600 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-metallic px-4 py-1.5 text-xs font-serif font-bold rounded-xs cursor-pointer"
                >
                  Commit Amendment
                </button>
              </div>

              {saveStatus && (
                <div className="text-center font-mono text-xs font-bold text-amber-700 pt-1">
                  {saveStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
