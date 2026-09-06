"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  Plus,
  Compass,
  Gamepad2,
  Mic,
  Camera,
  Layers,
  Award,
  Users,
  Image as ImageIcon,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  Flame,
  Globe,
} from "lucide-react";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";

export interface DocketSidebarProps {
  dockets?: DocketItem[];
  currentSlug?: string;
  onDocketCreated?: (newDocket: DocketItem) => void;
}

const getCommunityIcon = (slug: string) => {
  if (slug.includes("simulation") || slug.includes("gaming")) {
    return <Gamepad2 className="w-4 h-4 text-purple-500" />;
  }
  if (slug.includes("verbal") || slug.includes("audio")) {
    return <Mic className="w-4 h-4 text-amber-500" />;
  }
  if (slug.includes("photo") || slug.includes("visual")) {
    return <Camera className="w-4 h-4 text-rose-500" />;
  }
  if (slug.includes("commend")) {
    return <Award className="w-4 h-4 text-yellow-500" />;
  }
  return <Layers className="w-4 h-4 text-blue-500" />;
};

export default function DocketSidebar({
  dockets: initialDockets,
  currentSlug,
  onDocketCreated,
}: DocketSidebarProps = {}) {
  const pathname = usePathname();
  const [dockets, setDockets] = useState<DocketItem[]>(initialDockets || DEFAULT_DOCKETS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");
  const [isPrivateSub, setIsPrivateSub] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState("");

  // Toggles
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [communitiesExpanded, setCommunitiesExpanded] = useState(true);
  const [feedsExpanded, setFeedsExpanded] = useState(true);

  useEffect(() => {
    const handleToggle = () => {
      setIsSidebarVisible((prev) => !prev);
    };
    window.addEventListener("toggle_reddit_sidebar", handleToggle);
    return () => window.removeEventListener("toggle_reddit_sidebar", handleToggle);
  }, []);

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

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    try {
      const res = await fetch("/api/dockets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCommunityName.trim(),
          description: newCommunityDesc.trim(),
          isPrivate: isPrivateSub,
          iconUrl: customIconUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.docket) {
        const updated = [...dockets, data.docket];
        setDockets(updated);
        if (onDocketCreated) onDocketCreated(data.docket);
        setNewCommunityName("");
        setNewCommunityDesc("");
        setIsPrivateSub(false);
        setCustomIconUrl("");
        setShowNewModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isSidebarVisible) {
    return null;
  }

  return (
    <aside className="w-full md:w-64 shrink-0 font-sans select-none space-y-3">
      {/* Feeds Card */}
      <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-xl shadow-xs overflow-hidden">
        <button
          onClick={() => setFeedsExpanded(!feedsExpanded)}
          className="w-full px-4 py-2.5 border-b border-gray-200 dark:border-[#343536] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#272729] cursor-pointer"
        >
          <span className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Feeds
          </span>
          {feedsExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>

        {feedsExpanded && (
          <nav className="p-2 space-y-0.5 text-xs">
            <Link
              href="/home"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                (!currentSlug && (pathname === "/home" || pathname === "/")) || currentSlug === "all"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
              }`}
            >
              <Compass className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="truncate font-medium">Home Feed</span>
            </Link>

            <Link
              href="/home?sort=trending"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
            >
              <Flame className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="truncate font-medium">Popular</span>
            </Link>

            <Link
              href="/identity"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate font-medium">Explore Lore</span>
            </Link>
          </nav>
        )}
      </div>

      {/* Communities Accordion Card */}
      <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-xl shadow-xs overflow-hidden">
        <button
          onClick={() => setCommunitiesExpanded(!communitiesExpanded)}
          className="w-full px-4 py-3 border-b border-gray-200 dark:border-[#343536] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#272729] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100">
              Communities
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-500">
              {dockets.length}
            </span>
            {communitiesExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </button>

        {communitiesExpanded && (
          <>
            {/* Community Links List */}
            <nav className="p-2 space-y-0.5 text-xs max-h-72 overflow-y-auto">
              {dockets.map((docket: any) => {
                const isActive = currentSlug === docket.slug || pathname === `/archive/${docket.slug}`;
                const isPrivate = docket.isPrivate;
                return (
                  <Link
                    key={docket.slug}
                    href={`/archive/${docket.slug}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272729]"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-[#272729] flex items-center justify-center shrink-0">
                      {docket.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={docket.iconUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getCommunityIcon(docket.slug)
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900 dark:text-gray-100 text-xs">
                          {docket.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          c/{docket.slug}
                        </div>
                      </div>
                      {isPrivate && (
                        <span title="Private Community">
                          <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Action: Create Sub-group / Community */}
            <div className="p-3 border-t border-gray-100 dark:border-[#272729]">
              <button
                onClick={() => setShowNewModal(true)}
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-[#272729] dark:hover:bg-[#343536] text-gray-800 dark:text-gray-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Community</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal to Create Community */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] shadow-xl p-5 rounded-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-[#343536]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Create a Community
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCommunity} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  placeholder="Community name"
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  placeholder="What is this community about?"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Private Community Toggle */}
              <div className="p-2.5 bg-gray-50 dark:bg-[#272729] rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    Private Community
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Only authorized members can view posts
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivateSub}
                  onChange={(e) => setIsPrivateSub(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon or Avatar URL (Optional)
                </label>
                <input
                  type="url"
                  value={customIconUrl}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#272729]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-[#272729] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-1.5 px-4 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
