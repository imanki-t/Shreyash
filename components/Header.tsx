"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  Compass,
  User,
  Sparkles,
  Smile,
  Cpu,
  HelpCircle,
  Music,
  Settings,
  Menu,
  MessageSquare,
  Bell,
} from "lucide-react";
import OperativeModal from "./OperativeModal";
import NotificationPopover from "./NotificationPopover";
import ChatDrawer from "./ChatDrawer";

export default function Header() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/home?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggle_reddit_sidebar"));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a1a1b]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#343536] transition-colors">
      {/* Main Reddit-Style Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Hamburger Drawer Toggle + Brand Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-600 dark:text-gray-300 transition cursor-pointer"
            title="Toggle Communities Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/home" className="flex items-center gap-2.5 group">
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
        </div>

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
            placeholder="Search posts, communities, or users..."
            className="w-full bg-gray-100 dark:bg-[#272729] hover:bg-gray-200/70 dark:hover:bg-[#343536] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1a1b] focus:outline-hidden transition-all"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Live Chat Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition cursor-pointer relative ${
              chatOpen ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" : "text-gray-600 dark:text-gray-300"
            }`}
            title="Community Chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500" />
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition cursor-pointer relative ${
                notifOpen ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" : "text-gray-600 dark:text-gray-300"
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPopover
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              onCountUpdate={setUnreadCount}
            />
          </div>

          {/* Create Post Button */}
          <Link
            href="/upload"
            className="btn-primary text-xs py-1.5 px-3 sm:px-4 rounded-full flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </Link>

          {/* Settings Icon */}
          <Link
            href="/settings"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-600 dark:text-gray-300 transition hidden md:flex cursor-pointer"
            title="User & Privacy Settings"
          >
            <Settings className="w-5 h-5" />
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
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 hidden lg:inline max-w-[100px] truncate">
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
            href="/archive/general"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>c/general</span>
          </Link>

          <Link
            href="/archive/memes"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>c/memes</span>
          </Link>

          <Link
            href="/archive/tech"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            <span>c/tech</span>
          </Link>

          <Link
            href="/archive/ask"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
            <span>c/ask</span>
          </Link>

          <Link
            href="/archive/music"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Music className="w-3.5 h-3.5 text-rose-500" />
            <span>c/music</span>
          </Link>

          <Link
            href="/settings"
            className="px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#272729] hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1.5 whitespace-nowrap ml-auto"
          >
            <Settings className="w-3.5 h-3.5 text-gray-500" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      <OperativeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  );
}
