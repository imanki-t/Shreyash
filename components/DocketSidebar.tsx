"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, FolderOpen, Plus } from "lucide-react";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";

export interface DocketSidebarProps {
  dockets?: DocketItem[];
  currentSlug?: string;
  onDocketCreated?: (newDocket: DocketItem) => void;
}

export default function DocketSidebar({
  dockets: initialDockets,
  currentSlug,
  onDocketCreated,
}: DocketSidebarProps = {}) {
  const pathname = usePathname();
  const [dockets, setDockets] = useState<DocketItem[]>(initialDockets || DEFAULT_DOCKETS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDocketName, setNewDocketName] = useState("");
  const [newDocketDesc, setNewDocketDesc] = useState("");

  useEffect(() => {
    if (initialDockets && initialDockets.length > 0) {
      setDockets(initialDockets);
    } else {
      fetch("/api/dockets")
        .then((res) => res.json())
        .then((data) => {
          if (data.dockets) setDockets(data.dockets);
        })
        .catch(() => {});
    }
  }, [initialDockets]);

  const handleCreateDocket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocketName) return;

    try {
      const res = await fetch("/api/dockets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDocketName,
          description: newDocketDesc,
        }),
      });
      const data = await res.json();
      if (data.success && data.docket) {
        const updated = [...dockets, data.docket];
        setDockets(updated);
        if (onDocketCreated) onDocketCreated(data.docket);
        setNewDocketName("");
        setNewDocketDesc("");
        setShowNewModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-full md:w-64 shrink-0 font-sans select-none">
      <div className="bg-[#f9f8f5] dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] shadow-sm rounded-xs overflow-hidden">
        {/* Sidebar Header */}
        <div className="bg-[#071931] text-white px-3 py-2 border-b-2 border-[#c5a059] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#c5a059]" />
            <h2 className="font-serif font-bold text-xs uppercase tracking-wider text-[#d8c396]">
              OFFICIAL DOCKETS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {dockets.length} DOCKETS
          </span>
        </div>

        {/* Folder Tree List */}
        <nav className="p-2 space-y-1 text-xs">
          <Link
            href="/home"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition ${
              (!currentSlug && (pathname === "/home" || pathname === "/")) || currentSlug === "all"
                ? "bg-[#071931] text-[#e6ca85] font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="font-serif tracking-tight">Master Repository Index</span>
          </Link>

          <div className="my-1 border-t border-slate-300 dark:border-slate-800" />

          {dockets.map((docket) => {
            const isActive = currentSlug === docket.slug || pathname === `/archive/${docket.slug}`;
            return (
              <Link
                key={docket.slug}
                href={`/archive/${docket.slug}`}
                className={`flex items-start gap-2 px-2.5 py-2 rounded-xs transition ${
                  isActive
                    ? "bg-[#071931] text-[#e6ca85] font-bold border-l-2 border-[#c5a059]"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Folder className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? "text-[#c5a059]" : "text-slate-500"}`} />
                <div>
                  <div className="font-mono text-[10px] uppercase text-slate-500 tracking-wider">
                    {docket.docketNumber}
                  </div>
                  <div className="font-serif text-xs leading-tight text-slate-900 dark:text-slate-100">
                    {docket.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Action: Open New Docket */}
        <div className="p-2 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setShowNewModal(true)}
            className="w-full py-1.5 px-2 btn-metallic text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#071931]" />
            <span>Open New Investigation Docket</span>
          </button>
        </div>
      </div>

      {/* Modal to Create New Docket */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm bg-[#fdfbf7] dark:bg-[#111822] border-2 border-[#7c8798] shadow-xl p-4 rounded-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-300 dark:border-slate-700">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Authorize New Docket
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-500 hover:text-slate-900 text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateDocket} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                  Docket Name:
                </label>
                <input
                  type="text"
                  value={newDocketName}
                  onChange={(e) => setNewDocketName(e.target.value)}
                  placeholder="e.g. Tactical Miscalculations"
                  required
                  className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs font-serif"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                  Official Scope / Description:
                </label>
                <textarea
                  value={newDocketDesc}
                  onChange={(e) => setNewDocketDesc(e.target.value)}
                  placeholder="Details of incidents cataloged under this file..."
                  rows={2}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs font-sans text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1 border border-slate-300 text-slate-600 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-metallic px-3 py-1 font-bold font-serif"
                >
                  Confirm & Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
