"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  Flag,
  Edit3,
  Bookmark,
  Check,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Layers,
  X,
} from "lucide-react";
import MediaPlayer from "@/components/MediaPlayer";
import ReactionConsole from "@/components/ReactionConsole";
import InvestigatorFieldLog from "@/components/InvestigatorFieldLog";
import RedactedText from "@/components/RedactedText";

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: session } = useSession();

  const [caseFile, setCaseFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Amend Modal
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [newNarrative, setNewNarrative] = useState("");
  const [amendSummary, setAmendSummary] = useState("");
  const [passkey, setPasskey] = useState("");
  const [amendError, setAmendError] = useState<string | null>(null);

  // Flag / Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCategory, setReportCategory] = useState("inappropriate");
  const [reportNotes, setReportNotes] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  // Engagement tracking
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    if (!id) return;
    fetchCaseFile();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.round((scrollY / docHeight) * 100);
        if (pct > maxScrollRef.current) {
          maxScrollRef.current = Math.min(100, pct);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      const dwellSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (dwellSeconds > 1 && id) {
        const payload = JSON.stringify({
          dwellSeconds,
          maxScrollPercent: maxScrollRef.current,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `/api/files/${encodeURIComponent(id)}/engagement`,
            new Blob([payload], { type: "application/json" })
          );
        }
      }
    };
  }, [id]);

  const fetchCaseFile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.case) {
        setCaseFile(data.case);
        setNewNarrative(data.case.debriefNarrative || "");
      } else {
        setError(data.error || "Post not found.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load post.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmendError(null);
    const enteredPasskey = passkey || localStorage.getItem("covert_passkey") || "";

    try {
      const res = await fetch(`/api/files/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "amend",
          newNarrative,
          summary: amendSummary || "Content revised",
          passkey: enteredPasskey,
          userEmail: session?.user?.email,
          amendedBy: session?.user?.name || "Author",
        }),
      });
      const data = await res.json();
      if (data.success && data.case) {
        setCaseFile(data.case);
        setAmendModalOpen(false);
      } else {
        setAmendError(data.error || "Failed to update post.");
      }
    } catch (err: any) {
      setAmendError(err.message || "Failed to update post.");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      setReportError("Please specify a reason for reporting.");
      return;
    }
    setReporting(true);
    setReportError(null);

    try {
      const res = await fetch(`/api/files/${encodeURIComponent(id)}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: reportCategory,
          reason: reportReason.trim(),
          notes: reportNotes.trim(),
          reporterCodename: session?.user?.name || "Community Member",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReportSuccess(false);
          setReportReason("");
          setReportNotes("");
        }, 1500);
      } else {
        setReportError(data.error || "Failed to submit report.");
      }
    } catch (err: any) {
      setReportError(err.message || "Network error submitting report.");
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
        <div>Loading post...</div>
      </div>
    );
  }

  if (error || !caseFile) {
    return (
      <div className="max-w-md mx-auto reddit-card p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="font-bold text-base text-gray-900 dark:text-white">Post Not Found</h2>
        <p className="text-xs text-gray-500">{error || "This post may have been removed."}</p>
        <Link href="/home" className="btn-primary text-xs inline-block">
          Return to Feed
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(caseFile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4 font-sans">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/home" className="hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> All Feeds
        </Link>
        <span>/</span>
        <Link href={`/archive/${caseFile.docketSlug}`} className="hover:underline font-semibold text-gray-900 dark:text-gray-100">
          c/{caseFile.docketSlug}
        </Link>
      </div>

      {/* Main Post Container */}
      <article className="reddit-card p-5 sm:p-6 space-y-4">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-[#272729]">
          <div className="flex items-center gap-2">
            <Link
              href={`/archive/${caseFile.docketSlug}`}
              className="font-bold text-gray-900 dark:text-white hover:underline"
            >
              c/{caseFile.docketSlug}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link
              href={`/profile/${encodeURIComponent(caseFile.author.codename || "User")}`}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              u/{caseFile.author.codename}
            </Link>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-[#272729] text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
            {caseFile.docketName}
          </span>
        </div>

        {/* Post Title */}
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
          {caseFile.isRedacted ? "[Redacted Post]" : caseFile.title}
        </h1>

        {/* Media Player / Attachments */}
        {caseFile.attachments?.length > 0 && (
          <div className="rounded-xl overflow-hidden bg-black/90 border border-gray-200 dark:border-gray-800">
            <MediaPlayer
              attachments={caseFile.attachments}
              caseNumber={caseFile.caseNumber}
            />
          </div>
        )}

        {/* Post Narrative Text */}
        <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap pt-2">
          <RedactedText content={caseFile.debriefNarrative} />
        </div>

        {/* Bottom Actions Ribbon */}
        <div className="pt-4 border-t border-gray-100 dark:border-[#272729] flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? "Link Copied" : "Share"}</span>
            </button>

            <button
              onClick={() => setAmendModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729] hover:text-red-500 transition-colors cursor-pointer"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </article>

      {/* Community Reactions Bar */}
      <ReactionConsole
        caseId={caseFile.caseNumber || (caseFile as any)._id}
        initialStamps={caseFile.stamps}
        initialEmojis={caseFile.emojis}
        initialRatings={caseFile.ratings}
      />

      {/* Threaded Comments Section */}
      <InvestigatorFieldLog caseId={caseFile.caseNumber || (caseFile as any)._id} />

      {/* Edit Modal (Clean, No prefilled clutter) */}
      {amendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] p-5 max-w-lg w-full rounded-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#343536]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Edit Post Content
              </h3>
              <button
                onClick={() => setAmendModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAmendSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Updated Content:
                </label>
                <textarea
                  rows={6}
                  value={newNarrative}
                  onChange={(e) => setNewNarrative(e.target.value)}
                  placeholder="Enter updated content..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Edit:
                </label>
                <input
                  type="text"
                  placeholder="Brief note on what was updated"
                  value={amendSummary}
                  onChange={(e) => setAmendSummary(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {amendError && <div className="text-red-500">{amendError}</div>}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#272729]">
                <button
                  type="button"
                  onClick={() => setAmendModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-1.5 px-4 cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal (Clean, No prefilled clutter) */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] p-5 max-w-md w-full rounded-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#343536]">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-red-500" />
                Report Post
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#272729]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Reporting:
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="spam">Spam or advertising</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Details / Explanation:
                </label>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Explain why this post should be reviewed..."
                  required
                  className="w-full p-2 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {reportError && <div className="text-red-500">{reportError}</div>}
              {reportSuccess && (
                <div className="text-emerald-500 font-semibold">
                  Report submitted. Thank you for keeping the community safe.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[#272729]">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="btn-primary py-1.5 px-4 cursor-pointer bg-red-600 hover:bg-red-700"
                >
                  {reporting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
