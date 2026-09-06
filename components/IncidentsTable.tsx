"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  Paperclip,
  Flame,
  ArrowUpRight,
  FileText,
} from "lucide-react";

export interface CaseItem {
  _id: string;
  caseNumber: string;
  title: string;
  docketSlug: string;
  docketName: string;
  classificationTier: string;
  debriefNarrative: string;
  author: {
    name: string;
    codename: string;
  };
  attachments: Array<{
    fileId: string;
    filename: string;
    mediaType: string;
  }>;
  stamps: {
    verifiedAccurate: number;
    corroborated: number;
    flaggedAnomaly: number;
    discrepancyDetected: number;
  };
  emojis?: {
    thumbsUp?: number;
    thumbsDown?: number;
    laugh?: number;
    skull?: number;
    heart?: number;
  };
  ratings?: {
    average: number;
    count: number;
  };
  isRedacted: boolean;
  createdAt: string;
  aiRank?: number;
  aiScore?: number;
}

interface IncidentsTableProps {
  cases: CaseItem[];
  loading?: boolean;
}

export default function IncidentsTable({ cases, loading = false }: IncidentsTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-xl p-10 text-center text-xs text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
        <div>Loading feed posts...</div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] rounded-xl p-10 text-center">
        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
          No Posts Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
          There are no posts matching your current filter. Be the first to share a post!
        </p>
        <Link href="/upload" className="btn-primary text-xs">
          Create the First Post →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cases.map((c) => {
        const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const totalVotes =
          (c.emojis?.thumbsUp || 0) - (c.emojis?.thumbsDown || 0) + (c.stamps?.verifiedAccurate || 0);

        return (
          <article
            key={c._id}
            className="reddit-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Community & Author info */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Link
                  href={`/archive/${c.docketSlug}`}
                  className="font-bold text-gray-900 dark:text-gray-200 hover:underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  c/{c.docketSlug}
                </Link>
                <span>•</span>
                <span>Posted by</span>
                <Link
                  href={`/profile/${encodeURIComponent(c.author?.codename || "User")}`}
                  className="font-medium hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
                >
                  u/{c.author?.codename || "Anonymous"}
                </Link>
                <span>•</span>
                <span className="text-[11px]">{formattedDate}</span>

                {c.aiScore !== undefined && (
                  <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-medium border border-blue-200 dark:border-blue-900">
                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                    {c.aiScore}% Match
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Link href={`/post/${c.caseNumber || c._id}`}>
                  {c.isRedacted ? "[Redacted Content]" : c.title}
                </Link>
              </h3>

              {/* Narrative Snippet */}
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {c.debriefNarrative}
              </p>

              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#272729] text-gray-600 dark:text-gray-300 rounded-md text-[11px] font-medium">
                  {c.docketName}
                </span>

                {c.attachments && c.attachments.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                    <Paperclip className="w-3 h-3" />
                    {c.attachments.length} attachment(s)
                  </span>
                )}
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Link
                href={`/post/${c.caseNumber || c._id}`}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <span>View Post</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
