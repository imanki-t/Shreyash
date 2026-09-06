"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  Shirt,
  FileText,
  Trophy,
  Settings,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";

interface OperativeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OperativeModal({ isOpen, onClose }: OperativeModalProps) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("site_theme") as any) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme: "system" | "light" | "dark") => {
    localStorage.setItem("site_theme", selectedTheme);
    setTheme(selectedTheme);
    const root = document.documentElement;

    if (selectedTheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (selectedTheme === "light") {
      root.removeAttribute("data-theme");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
    }
  };

  const toggleDisplayMode = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  };

  if (!isOpen) return null;

  const isMasterAdmin =
    (session?.user as any)?.role === "admin" || (session?.user as any)?.isAdmin === true;

  const username =
    session?.user?.name?.toLowerCase().replace(/\s+/g, "_") ||
    session?.user?.email?.split("@")[0] ||
    "user";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 bg-black/60 backdrop-blur-xs font-sans transition-opacity">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Reddit-Style Drawer Sheet */}
      <div className="relative w-full max-w-md sm:max-w-sm bg-[#121213] text-gray-100 border-t sm:border border-[#343536] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
        {/* Mobile Drag Pill */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Close Button Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Account
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#272729] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {session?.user ? (
          <div className="py-2">
            {/* User Profile Summary Header */}
            <Link
              href={`/profile/${encodeURIComponent(session.user.name || session.user.email || "user")}`}
              onClick={onClose}
              className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#1f1f21] transition group cursor-pointer"
            >
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-12 h-12 rounded-full border border-[#343536] group-hover:border-[#ff4500] object-cover transition"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-white group-hover:text-[#ff4500] transition">
                  View Profile
                </div>
                <div className="text-xs text-gray-400 truncate">
                  u/{username}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition" />
            </Link>

            {/* Reddit Action Items List */}
            <div className="mt-2 space-y-0.5">
              <Link
                href={`/profile/${encodeURIComponent(session.user.name || session.user.email || "user")}`}
                onClick={onClose}
                className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#1f1f21] transition text-sm text-gray-200 cursor-pointer"
              >
                <Shirt className="w-5 h-5 text-gray-400" />
                <span>Edit Avatar</span>
              </Link>

              <Link
                href="/upload"
                onClick={onClose}
                className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#1f1f21] transition text-sm text-gray-200 cursor-pointer"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <span>Drafts & Create Post</span>
              </Link>

              <div className="flex items-center justify-between px-5 py-3 hover:bg-[#1f1f21] transition text-sm text-gray-200 cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <div>
                    <div>Achievements</div>
                    <div className="text-xs text-gray-400">Karma unlocked</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Top Member
                </span>
              </div>

              <Link
                href="/settings"
                onClick={onClose}
                className="flex items-center gap-3.5 px-5 py-3 hover:bg-[#1f1f21] transition text-sm text-gray-200 cursor-pointer"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Settings</span>
              </Link>

              {/* Display Mode Toggle */}
              <button
                type="button"
                onClick={toggleDisplayMode}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#1f1f21] transition text-sm text-gray-200 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-400" />
                  )}
                  <span>Display Mode</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="capitalize">{theme}</span>
                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition ${theme === "dark" ? "bg-[#ff4500] justify-end" : "bg-gray-600 justify-start"} flex items-center`}>
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              </button>

              {/* Log Out */}
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-[#1f1f21] transition text-sm text-red-400 cursor-pointer text-left"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Admin console link if applicable */}
            {isMasterAdmin && (
              <div className="border-t border-[#343536] mt-2 pt-2">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 hover:bg-[#1f1f21] text-xs font-semibold text-blue-400 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Admin Oversight Panel
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#1a1a1b] rounded-xl border border-[#343536]">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Guest User</div>
                <div className="text-xs text-gray-400">Sign in to join communities and post</div>
              </div>
            </div>

            <button
              onClick={() => signIn("google")}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-full flex items-center justify-center gap-3 shadow-md transition cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Display Mode Toggle for guest */}
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleDisplayMode}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#1f1f21] transition text-sm text-gray-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Display Mode</span>
                </div>
                <span className="text-xs text-gray-400 capitalize">{theme}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Policy Links */}
        <div className="border-t border-[#343536] px-5 py-3 bg-[#0d0d0e] flex items-center justify-between text-xs text-gray-500">
          <Link href="/terms" onClick={onClose} className="hover:text-gray-300 transition">
            User Agreement
          </Link>
          <span>•</span>
          <Link href="/privacy" onClick={onClose} className="hover:text-gray-300 transition">
            Privacy Policy
          </Link>
          <span>•</span>
          <span>v2.0 Reddit UI</span>
        </div>
      </div>
    </div>
  );
}
