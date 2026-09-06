"use client";

import React, { useState } from "react";
import {
  CheckCheck,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Skull,
  Heart
} from "lucide-react";

interface ReactionConsoleProps {
  caseId: string;
  initialStamps: {
    verifiedAccurate: number;
    corroborated: number;
    flaggedAnomaly: number;
    discrepancyDetected: number;
  };
  initialEmojis: {
    thumbsUp: number;
    thumbsDown: number;
    laugh: number;
    skull: number;
    heart: number;
  };
  initialRatings: {
    totalScore: number;
    count: number;
    average: number;
  };
}

export default function ReactionConsole({
  caseId,
  initialStamps,
  initialEmojis,
  initialRatings,
}: ReactionConsoleProps) {
  const [stamps, setStamps] = useState(initialStamps);
  const [emojis, setEmojis] = useState(initialEmojis);
  const [ratings, setRatings] = useState(initialRatings);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleStamp = async (key: keyof typeof stamps) => {
    if (submitting) return;
    setSubmitting(true);
    setStamps((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "stamp", key }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (key: keyof typeof emojis) => {
    if (submitting) return;
    setSubmitting(true);
    setEmojis((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "emoji", key }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (score: number) => {
    if (userRating) return;
    setUserRating(score);

    const newTotal = (ratings.totalScore || 0) + score;
    const newCount = (ratings.count || 0) + 1;
    const newAvg = Number((newTotal / newCount).toFixed(1));
    setRatings({ totalScore: newTotal, count: newCount, average: newAvg });

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "rating", score }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white dark:bg-[#081426] border border-slate-200 dark:border-[#152744] p-5 rounded-xs shadow-sm space-y-4 font-sans">
      <div className="border-b border-slate-100 dark:border-[#152744] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#071931] dark:text-[#c5a059]" />
          OFFICIAL CORROBORATION & VERIFICATION CONSOLE
        </h4>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          EVIDENCE ENDORSEMENT PROTOCOL
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        {/* Rubber Stamp Reactions */}
        <div>
          <span className="block text-[10px] font-mono uppercase text-slate-500 mb-2 font-bold tracking-wider">
            Field Officer Endorsement Stamps:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStamp("verifiedAccurate")}
              className="stamp-classified stamp-green text-xs flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
              title="Endorse as fully verified"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              VERIFIED [{stamps.verifiedAccurate || 0}]
            </button>

            <button
              onClick={() => handleStamp("corroborated")}
              className="stamp-classified stamp-blue text-xs flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
              title="Corroborate with secondary witness"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              CORROBORATED [{stamps.corroborated || 0}]
            </button>

            <button
              onClick={() => handleStamp("flaggedAnomaly")}
              className="stamp-classified stamp-red text-xs flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
              title="Flag critical tactical failure"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              FLAGGED [{stamps.flaggedAnomaly || 0}]
            </button>

            <button
              onClick={() => handleStamp("discrepancyDetected")}
              className="stamp-classified stamp-amber text-xs flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
              title="Requires further investigation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              DISCREPANCY [{stamps.discrepancyDetected || 0}]
            </button>
          </div>
        </div>

        {/* Severity Rating Gauge */}
        <div className="lg:border-l lg:border-slate-200 lg:dark:border-[#152744] lg:pl-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
              Incident Severity Gauge:
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {ratings.average > 0 ? `${ratings.average} / 5.0` : "UNRATED"} ({ratings.count} evaluations)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || userRating || ratings.average) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => handleRate(star)}
                  className="p-1 cursor-pointer hover:scale-110 transition"
                  title={`Grade Severity ${star}/5`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      active
                        ? "fill-amber-400 text-amber-500"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              );
            })}
            {userRating && (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 ml-2">
                ✓ Recorded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SVG-Powered Operative Reactions Bar (Zero Raw Emojis!) */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#152744] flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
          Field Endorsements:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReaction("thumbsUp")}
            className="px-2.5 py-1 bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-[#1e3a63] hover:border-[#c5a059] rounded-xs text-xs font-mono flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 transition"
            title="Concur / Endorse"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{emojis.thumbsUp || 0}</span>
          </button>

          <button
            onClick={() => handleReaction("thumbsDown")}
            className="px-2.5 py-1 bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-[#1e3a63] hover:border-[#c5a059] rounded-xs text-xs font-mono flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 transition"
            title="Dispute / Contradict"
          >
            <ThumbsDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{emojis.thumbsDown || 0}</span>
          </button>

          <button
            onClick={() => handleReaction("laugh")}
            className="px-2.5 py-1 bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-[#1e3a63] hover:border-[#c5a059] rounded-xs text-xs font-mono flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 transition"
            title="Humorous Occurrence"
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>{emojis.laugh || 0}</span>
          </button>

          <button
            onClick={() => handleReaction("skull")}
            className="px-2.5 py-1 bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-[#1e3a63] hover:border-[#c5a059] rounded-xs text-xs font-mono flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 transition"
            title="Critical Mission Demise"
          >
            <Skull className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            <span>{emojis.skull || 0}</span>
          </button>

          <button
            onClick={() => handleReaction("heart")}
            className="px-2.5 py-1 bg-slate-50 dark:bg-[#0c1c33] border border-slate-200 dark:border-[#1e3a63] hover:border-[#c5a059] rounded-xs text-xs font-mono flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200 transition"
            title="Wholesome Camaraderie"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>{emojis.heart || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
