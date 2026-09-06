"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  Compass,
  User,
  Gamepad2,
  Mic,
  Camera,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Shield,
  FileText,
} from "lucide-react";
import OperativeModal from "./OperativeModal";

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/home?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isMasterAdmin =
    (session?.user as any)?.role === "admin" || (session?.user as any)?.isAdmin === true;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a1a1b]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#343536] transition-colors">
      {/* Main Reddit-Style Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <Link href="/home" className="flex items-center gap-2.5 shrink-0 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/seal_logo.jpg"
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white leading-none">
              The Shreyash Files
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium tracking-wide">
              Community Archive
            </span>
          </div>
        </Link>

        {/* Center: Modern Search Pill Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-xl relative hidden sm:block"
        >
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, communities, or transcripts..."
            className="w-full bg-gray-100 dark:bg-[#272729] hover:bg-gray-200/70 dark:hover:bg-[#343536] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1a1b] focus:outline-hidden transition-all"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Create Post Button */}
          <Link
            href="/upload"
            className="btn-primary text-xs py-1.5 px-3 sm:px-4 rounded-full"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Post</span>
          </Link>

          {/* User Profile / Menu Pill */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full border border-gray-200 dark:border-[#343536] hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors cursor-pointer"
            title="User Profile & Settings"
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-6 h-6 rounded-full border border-blue-500"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </div>
            )}
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 hidden md:inline max-w-[100px] truncate">
              {session?.user?.name || "Sign In"}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Categories Bar (Clean SVGs, Zero Emojis) */}
      <div className="border-t border-gray-200 dark:border-[#272729] bg-gray-50/80 dark:bg-[#161a1d] px-3 sm:px-6 overflow-x-auto">
        <nav className="max-w-7xl mx-auto flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 py-1.5">
          <Link
            href="/home"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Feed</span>
          </Link>

          <Link
            href="/identity"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span>About Shreyash</span>
          </Link>

          <Link
            href="/archive/simulation-operations"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Gaming & Sims</span>
          </Link>

          <Link
            href="/archive/verbal-intercepts"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Mic className="w-3.5 h-3.5 text-amber-500" />
            <span>Voice & Audio</span>
          </Link>

          <Link
            href="/archive/photographic-evidence"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>Photos & Clips</span>
          </Link>
        </nav>
      </div>

      <OperativeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
