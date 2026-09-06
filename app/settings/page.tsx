"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Settings,
  User,
  Shield,
  Eye,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertTriangle,
  Lock,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"account" | "privacy" | "preferences" | "danger">("account");

  // Preferences
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [defaultPrivate, setDefaultPrivate] = useState(false);
  const [enableChat, setEnableChat] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Danger Zone confirmation
  const [confirmDeletePosts, setConfirmDeletePosts] = useState(false);
  const [confirmPurgeAccount, setConfirmPurgeAccount] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("site_theme") as any) || "system";
    setTheme(savedTheme);
    const savedPrivate = localStorage.getItem("default_post_private") === "true";
    setDefaultPrivate(savedPrivate);
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem("site_theme", theme);
    localStorage.setItem("default_post_private", String(defaultPrivate));

    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAllPosts = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all_posts" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || "All posts purged successfully.");
        setConfirmDeletePosts(false);
      } else {
        setActionMessage(data.error || "Failed to purge posts.");
      }
    } catch (err: any) {
      setActionMessage(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurgeAccount = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge_account" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("Account data purged. Signing out...");
        setTimeout(() => signOut({ callbackUrl: "/home" }), 1500);
      } else {
        setActionMessage(data.error || "Failed to purge account.");
      }
    } catch (err: any) {
      setActionMessage(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#343536]">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              User Settings
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage your profile, privacy, themes, and account data
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
            <Check className="w-4 h-4" /> Preferences saved
          </span>
        )}
      </div>

      {/* Main Grid: Tabs + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav Tabs */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
              activeTab === "account"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
            }`}
          >
            <User className="w-4 h-4" />
            Account
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
              activeTab === "privacy"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
            }`}
          >
            <Shield className="w-4 h-4" />
            Privacy & Safety
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
              activeTab === "preferences"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
            }`}
          >
            <Monitor className="w-4 h-4" />
            Preferences
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
              activeTab === "danger"
                ? "bg-red-600 text-white"
                : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="md:col-span-3 space-y-6">
          {actionMessage && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              {actionMessage}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="reddit-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Profile Information
              </h3>

              {session?.user ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={session.user.image || "/images/reddit_avatar.jpg"}
                      alt=""
                      className="w-16 h-16 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">
                        {session.user.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        u/{(session.user as any).codename || "User"}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {session.user.email}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-[#272729] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        View Public Profile
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        See how your profile and post archive appears to other community members.
                      </div>
                    </div>
                    <Link
                      href={`/profile/${encodeURIComponent((session.user as any).codename || session.user.name || "User")}`}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 space-y-3">
                  <p>You are currently browsing as a guest.</p>
                  <Link href="/identity" className="btn-primary py-1.5 px-4 inline-block text-xs">
                    Sign In with Google
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Safety Tab */}
          {activeTab === "privacy" && (
            <div className="reddit-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Privacy & Safety
              </h3>

              <div className="space-y-4 text-xs divide-y divide-gray-100 dark:divide-[#272729]">
                {/* Default Post Privacy */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Default to Private Posts
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      When toggled on, new posts you create will be private by default.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defaultPrivate}
                      onChange={(e) => setDefaultPrivate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Enable Chat */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      Allow Community & Direct Chat
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      Participate in live chat channels and receive messages from members.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableChat}
                      onChange={(e) => setEnableChat(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSavePreferences}
                  className="btn-primary py-2 px-5 text-xs cursor-pointer"
                >
                  Save Privacy Settings
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="reddit-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Appearance & Theme
              </h3>

              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Interface Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-3 rounded-lg border text-center font-medium cursor-pointer transition ${
                      theme === "system"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Monitor className="w-4 h-4 mx-auto mb-1" />
                    System
                  </button>

                  <button
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-lg border text-center font-medium cursor-pointer transition ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Sun className="w-4 h-4 mx-auto mb-1" />
                    Light
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-lg border text-center font-medium cursor-pointer transition ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                        : "border-gray-200 dark:border-[#343536] hover:bg-gray-50 dark:hover:bg-[#272729] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Moon className="w-4 h-4 mx-auto mb-1" />
                    Dark
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSavePreferences}
                  className="btn-primary py-2 px-5 text-xs cursor-pointer"
                >
                  Apply Theme
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="reddit-card p-5 space-y-5 border-red-200 dark:border-red-950/50">
              <div className="flex items-center gap-2 pb-2 border-b border-red-100 dark:border-red-950/50 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-bold text-sm">Danger Zone</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Delete All My Posts */}
                <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      Delete All My Posts
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-[11px]">
                      Permanently wipe all posts, narratives, and uploaded media authored by your account.
                    </div>
                  </div>

                  {confirmDeletePosts ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAllPosts}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? "Deleting..." : "Yes, Delete All"}
                      </button>
                      <button
                        onClick={() => setConfirmDeletePosts(false)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeletePosts(true)}
                      className="px-3.5 py-1.5 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      Delete Everything
                    </button>
                  )}
                </div>

                {/* Purge Account Data */}
                <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      Purge Complete Account History
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-[11px]">
                      Deletes all posts, comments, field logs, notifications, and chat records.
                    </div>
                  </div>

                  {confirmPurgeAccount ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePurgeAccount}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? "Purging..." : "Confirm Purge"}
                      </button>
                      <button
                        onClick={() => setConfirmPurgeAccount(false)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmPurgeAccount(true)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      Purge Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
