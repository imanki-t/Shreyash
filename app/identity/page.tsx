"use client";

import React, { useState, useEffect } from "react";
import { Printer, Edit3, Shield, Check, X, User, MapPin, Sparkles, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import RedactedText from "@/components/RedactedText";

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
      <div className="p-12 text-center text-xs text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
        <div>Loading archive dossier...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans">
      {/* Top Utility Bar */}
      <div className="reddit-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100">
            About Shreyash • Archive Dossier
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs py-1 px-3 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="btn-primary text-xs py-1 px-3 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Bio</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Card */}
      <div className="reddit-card p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-[#272729] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Subject Profile #001
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white capitalize">
              {identity?.legalDesignation || "Shreyash"}
            </h1>
          </div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-900">
            {identity?.clearanceTier || "Central Archive Focus"}
          </span>
        </div>

        {/* Mugshot + Vital Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Mugshot Card */}
          <div className="reddit-card p-3 flex flex-col items-center bg-gray-50 dark:bg-[#161a1d]">
            <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-black">
              {/* Ruler Tick Marks */}
              <div className="absolute left-2 inset-y-0 flex flex-col justify-between text-[9px] font-mono text-white/50 pointer-events-none select-none z-10">
                <span>6&apos;2&quot;</span>
                <span>6&apos;0&quot;</span>
                <span>5&apos;10&quot;</span>
                <span>5&apos;8&quot;</span>
                <span>5&apos;6&quot;</span>
                <span>5&apos;4&quot;</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/seal_logo.jpg"
                alt="Shreyash Mascot Mugshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 inset-x-2 bg-black/80 text-white text-[10px] text-center py-1 rounded-md font-semibold">
                Official Archive Photo
              </div>
            </div>
            <span className="text-[11px] text-gray-400 mt-2 font-medium">
              Identifier: {identity?.subjectId || "POI-001"}
            </span>
          </div>

          {/* Vital Statistics Table */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
              Profile Summary & Traits
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl flex justify-between items-center">
                <span className="text-gray-500 font-medium">Full Name:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {identity?.legalDesignation}
                </span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl flex justify-between items-center">
                <span className="text-gray-500 font-medium">Known Aliases:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {identity?.operationalCodenames?.join(", ") || "The Architect"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl flex justify-between items-center">
                <span className="text-gray-500 font-medium">Primary Location:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {identity?.activeCoordinates || "Squad Discord Voice Channel"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#272729] rounded-xl flex justify-between items-center">
                <span className="text-gray-500 font-medium">Squad Affiliation:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {identity?.assignedInvestigators?.map((inv: any) => inv.codename).join(", ") || "Founding Squad"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Psychological Profile / Bio Narrative */}
        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-[#272729]">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
            Archive Biography & Behavioral Profile
          </h3>
          <div className="p-4 bg-gray-50 dark:bg-[#272729] rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            <RedactedText
              content={
                identity?.psychProfile ||
                "Shreyash is the chaotic core of the group. Known for sudden tactical moves in multiplayer games, unforgettable voice calls, and spontaneous gaming decisions. ||Always clutch when it matters the most||. Loyalty to the squad is legendary."
              }
            />
          </div>
        </div>
      </div>

      {/* Edit Bio Modal (Clean, No prefilled clutter) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] p-5 max-w-lg w-full rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#343536]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Update Shreyash&apos;s Profile
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name / Title:
                </label>
                <input
                  type="text"
                  value={editForm.legalDesignation || ""}
                  onChange={(e) => setEditForm({ ...editForm, legalDesignation: e.target.value })}
                  placeholder="Shreyash"
                  className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aliases (comma separated):
                </label>
                <input
                  type="text"
                  value={Array.isArray(editForm.operationalCodenames) ? editForm.operationalCodenames.join(", ") : editForm.operationalCodenames || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      operationalCodenames: e.target.value.split(",").map((s: string) => s.trim()),
                    })
                  }
                  placeholder="The Architect, MVP"
                  className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio / Behavioral Notes:
                </label>
                <textarea
                  rows={4}
                  value={editForm.psychProfile || ""}
                  onChange={(e) => setEditForm({ ...editForm, psychProfile: e.target.value })}
                  placeholder="Enter biography or memorable facts..."
                  className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {saveStatus && <div className="text-xs text-blue-600 font-semibold">{saveStatus}</div>}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#272729]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-1.5 px-4 cursor-pointer">
                  Save Bio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
