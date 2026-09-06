"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AgencyCrest from "./AgencyCrest";
import OperativeModal from "./OperativeModal";
import { ADMIN_EMAIL } from "@/lib/auth";

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMasterAdmin =
    session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const clearanceLabel = isMasterAdmin
    ? "DIRECTOR"
    : session?.user
    ? "OPERATIVE"
    : "GUEST";

  const accessSubtext = isMasterAdmin
    ? "Master Oversight Clear"
    : session?.user
    ? "Level 2 Authorized"
    : "Limited Access / Unclassified Portal";

  return (
    <header className="bg-[#071931] text-white border-b-2 border-[#c5a059] shadow-lg select-none relative font-sans">
      {/* Top Thin Federal Archive Ribbon */}
      <div className="border-b border-[#c5a059]/40 bg-[#040e1d] px-4 py-1 flex items-center justify-between text-[11px] tracking-widest uppercase font-serif text-[#d8c396]">
        <div className="flex items-center gap-2">
          <span>UNITED STATES FEDERAL ARCHIVE</span>
          <span className="text-slate-600 dark:text-slate-500">•</span>
          <span className="text-[#a1b2cb] text-[10px] hidden sm:inline">
            SYSTEM IDENTIFIER: SF-FOIA-2006
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] tracking-widest text-[#94a3b8]">
          <span>OBSERVE</span>
          <span>|</span>
          <span>DOCUMENT</span>
          <span>|</span>
          <span>PRESERVE</span>
          <span>|</span>
          <span className="text-[#d8c396]">FOR A SAFER TOMORROW</span>
        </div>
      </div>

      {/* Main Panoramic Header Content */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Agency Crest + Title Block */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
          <Link href="/home" className="flex items-center gap-3 group">
            <AgencyCrest size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="font-serif text-[11px] sm:text-xs text-[#d8c396] tracking-widest uppercase">
                DIRECTORATE OF SPECIAL INVESTIGATIVE RECORDS
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-wider text-white drop-shadow-md">
                THE SHREYASH FILES
              </h1>
              <div className="font-serif text-[10px] sm:text-xs text-slate-300 tracking-widest uppercase">
                CENTRAL ARCHIVE OF SPECIAL INCIDENTS
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] text-emerald-400 tracking-widest font-bold">
                  NETWORK STATUS: SECURE
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Operative Clearance Badge & Authenticate Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="border border-slate-700 bg-[#0c2242]/85 px-3 py-2 rounded-xs flex items-center gap-3 shadow-inner">
            {/* Detective Hat & Glasses Silhouette Icon */}
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-[#c5a059]/60 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#d8c396]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a4 4 0 00-4 4v1H3v2h18V7h-5V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v1h-4V6a2 2 0 012-2zM4 11v2a4 4 0 004 4h1a4 4 0 003-1.35A4 4 0 0015 17h1a4 4 0 004-4v-2H4zm4 4a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>

            <div className="text-left font-mono">
              <div className="text-xs font-bold text-[#e6ca85] tracking-wider flex items-center gap-1">
                CLEARANCE:{" "}
                <span
                  className={
                    isMasterAdmin
                      ? "text-amber-400 font-black animate-pulse"
                      : "text-amber-300"
                  }
                >
                  {clearanceLabel}
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-sans tracking-tight">
                {accessSubtext}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-metallic px-3 py-1.5 text-xs font-bold font-serif cursor-pointer hover:brightness-105"
            >
              {session?.user ? "OPERATIVE MENU" : "AUTHENTICATE"}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Header Official Motto Quote Bar */}
      <div className="bg-[#051122] px-4 py-1 border-t border-slate-800 text-right text-[11px] font-serif italic text-slate-400">
        &ldquo;Some incidents are too important to be forgotten.&rdquo; —{" "}
        <span className="uppercase text-[#d8c396] font-normal not-italic tracking-wider text-[10px]">
          OFFICE OF SPECIAL INCIDENT OVERSIGHT
        </span>
      </div>

      {/* Navigation Folder Tabs */}
      <nav className="bg-[#081b36] border-t border-[#c5a059]/40 px-4 flex items-center gap-1 overflow-x-auto text-xs font-serif uppercase tracking-wider text-slate-300">
        <Link
          href="/home"
          className="px-4 py-2 border-b-2 border-transparent hover:border-[#c5a059] hover:text-white transition whitespace-nowrap"
        >
          📂 Repository Index
        </Link>
        <Link
          href="/identity"
          className="px-4 py-2 border-b-2 border-transparent hover:border-[#c5a059] hover:text-white transition whitespace-nowrap"
        >
          👤 Subject Dossier (POI #001)
        </Link>
        <Link
          href="/archive/simulation-operations"
          className="px-4 py-2 border-b-2 border-transparent hover:border-[#c5a059] hover:text-white transition whitespace-nowrap"
        >
          🎮 Simulation Operations
        </Link>
        <Link
          href="/archive/verbal-intercepts"
          className="px-4 py-2 border-b-2 border-transparent hover:border-[#c5a059] hover:text-white transition whitespace-nowrap"
        >
          🎙️ Audio Intercepts
        </Link>
        <Link
          href="/archive/photographic-evidence"
          className="px-4 py-2 border-b-2 border-transparent hover:border-[#c5a059] hover:text-white transition whitespace-nowrap"
        >
          📸 Visual Exhibits
        </Link>
        <Link
          href="/upload"
          className="px-4 py-2 ml-auto bg-[#b91c1c] text-white hover:bg-[#dc2626] font-bold border-l border-r border-rose-950 transition whitespace-nowrap flex items-center gap-1.5"
        >
          <span>+</span> Lodge Incident Deposition
        </Link>
      </nav>

      {/* Operative Modal Pop-over */}
      <OperativeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
