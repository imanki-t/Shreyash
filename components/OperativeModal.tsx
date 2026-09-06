"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  Shield,
  Moon,
  Sun,
  Monitor,
  LogOut,
  ExternalLink,
  Settings,
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

  if (!isOpen) return null;

  const isMasterAdmin =
    (session?.user as any)?.role === "admin" || (session?.user as any)?.isAdmin === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] shadow-2xl rounded-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 dark:border-[#343536] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              User Account
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Authenticated User Info */}
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#272729] rounded-xl">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-11 h-11 rounded-full border border-blue-500 object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold">
                    {session.user.name?.substring(0, 1) || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {session.user.name}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-medium">
                    {isMasterAdmin ? "Administrator" : "Member"}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="space-y-1.5 pt-1">
                <Link
                  href={`/profile/${encodeURIComponent(session.user.name || session.user.email || "User")}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-800 dark:text-gray-200 font-semibold transition"
                >
                  <span>View My Profile & Posts</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                {isMasterAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272729] text-blue-600 dark:text-blue-400 font-semibold transition"
                  >
                    <span>Admin Oversight Console</span>
                    <Shield className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <button
                onClick={() => signOut()}
                className="w-full py-2 px-3 flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 font-semibold rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400">
                Sign in with Google to post into communities, vote, and interact with the archive.
              </p>
              <button
                onClick={() => signIn("google")}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#272729] hover:bg-gray-50 dark:hover:bg-[#343536] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </div>
          )}

          {/* Theme Selector */}
          <div className="pt-3 border-t border-gray-100 dark:border-[#272729]">
            <div className="text-[11px] font-semibold text-gray-500 mb-2">
              Appearance
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-[#272729] rounded-lg">
              <button
                type="button"
                onClick={() => applyTheme("light")}
                className={`py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                  theme === "light"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => applyTheme("dark")}
                className={`py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#1a1a1b] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => applyTheme("system")}
                className={`py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                  theme === "system"
                    ? "bg-white dark:bg-[#1a1a1b] text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
