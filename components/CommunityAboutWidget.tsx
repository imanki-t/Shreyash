"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Eye,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
} from "lucide-react";

interface CommunityAboutWidgetProps {
  communityName?: string;
  slug?: string;
  description?: string;
}

const DEFAULT_RULES = [
  {
    num: 1,
    title: "Remember the human",
    detail: "Treat fellow community members with respect and follow authentic discussion guidelines.",
  },
  {
    num: 2,
    title: "Tag spoilers & sensitive media",
    detail: "Use the spoiler markup when sharing surprises, secret lore, or punchlines.",
  },
  {
    num: 3,
    title: "No spam or unauthorized bots",
    detail: "Automated scripts without API clearance are strictly prohibited.",
  },
];

export default function CommunityAboutWidget({
  communityName = "The Shreyash Files",
  slug = "all",
  description = "A modern decentralized Reddit-inspired archive of legendary campus incidents, inside lore, memes, and community field logs.",
}: CommunityAboutWidgetProps) {
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* About Card */}
      <div className="reddit-card p-4 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#272729]">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            About Community
          </h4>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            c/{slug}
          </span>
        </div>

        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-[#272729] text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              1.4k
            </div>
            <div className="text-[10px] text-gray-500">Members</div>
          </div>

          <div className="space-y-0.5">
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              184
            </div>
            <div className="text-[10px] text-gray-500">Online</div>
          </div>
        </div>

        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Created Sep 2026</span>
        </div>

        <Link
          href={`/upload?docket=${slug === "all" ? "" : slug}`}
          className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-xs text-center"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Post
        </Link>
      </div>

      {/* Rules Card */}
      <div className="reddit-card p-4 space-y-3">
        <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-[#272729]">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            c/{slug} Rules
          </h4>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-[#272729] text-xs">
          {DEFAULT_RULES.map((rule) => {
            const isOpen = expandedRule === rule.num;
            return (
              <div key={rule.num} className="py-2 first:pt-0 last:pb-0">
                <button
                  onClick={() => setExpandedRule(isOpen ? null : rule.num)}
                  className="w-full flex items-center justify-between text-left font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  <span>
                    {rule.num}. {rule.title}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-1.5 text-[11px] text-gray-600 dark:text-gray-400 pl-3 leading-relaxed">
                    {rule.detail}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
