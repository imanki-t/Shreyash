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
  Heart,
  Sparkles,
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
        body: JSON.stringify({ caseId, type: "stamp", field: key }),
      });
    } catch {} finally {
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
        body: JSON.stringify({ caseId, type: "emoji", field: key }),
      });
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (score: number) => {
    if (submitting) return;
    setUserRating(score);
    const newCount = ratings.count + 1;
    const newTotal = ratings.totalScore + score;
    const newAvg = parseFloat((newTotal / newCount).toFixed(1));
    setRatings({ count: newCount, totalScore: newTotal, average: newAvg });

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "rating", score }),
      });
    } catch {}
  };

  return (
    <div className="reddit-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#272729] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-100">
            Community Reactions & Ratings
          </h4>
        </div>
        <span className="text-[11px] text-gray-400">
          {ratings.count} reviews recorded
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        {/* Verification Status Badges */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Community Verification:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStamp("verifiedAccurate")}
              className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:scale-102 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified ({stamps.verifiedAccurate || 0})</span>
            </button>

            <button
              onClick={() => handleStamp("corroborated")}
              className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:scale-102 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Confirmed ({stamps.corroborated || 0})</span>
            </button>

            <button
              onClick={() => handleStamp("flaggedAnomaly")}
              className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:scale-102 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Anomaly ({stamps.flaggedAnomaly || 0})</span>
            </button>
          </div>
        </div>

        {/* Star Rating Gauge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400">
            <span>Rating Score:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {ratings.average > 0 ? `${ratings.average} / 5.0` : "Not rated yet"}
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
                  title={`Rate ${star}/5`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      active
                        ? "fill-amber-400 text-amber-500"
                        : "text-gray-300 dark:text-gray-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SVG Emoji Reaction Bar */}
      <div className="pt-3 border-t border-gray-100 dark:border-[#272729] flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mr-1">
          Reactions:
        </span>
        <button
          onClick={() => handleReaction("thumbsUp")}
          className="px-2.5 py-1 bg-gray-50 dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] border border-gray-200 dark:border-gray-700 rounded-full text-xs flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 transition"
          title="Thumbs Up"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
          <span>{emojis.thumbsUp || 0}</span>
        </button>

        <button
          onClick={() => handleReaction("laugh")}
          className="px-2.5 py-1 bg-gray-50 dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] border border-gray-200 dark:border-gray-700 rounded-full text-xs flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 transition"
          title="Laugh"
        >
          <Smile className="w-3.5 h-3.5 text-amber-500" />
          <span>{emojis.laugh || 0}</span>
        </button>

        <button
          onClick={() => handleReaction("heart")}
          className="px-2.5 py-1 bg-gray-50 dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] border border-gray-200 dark:border-gray-700 rounded-full text-xs flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 transition"
          title="Heart"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span>{emojis.heart || 0}</span>
        </button>

        <button
          onClick={() => handleReaction("skull")}
          className="px-2.5 py-1 bg-gray-50 dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] border border-gray-200 dark:border-gray-700 rounded-full text-xs flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 transition"
          title="Dead"
        >
          <Skull className="w-3.5 h-3.5 text-purple-500" />
          <span>{emojis.skull || 0}</span>
        </button>

        <button
          onClick={() => handleReaction("thumbsDown")}
          className="px-2.5 py-1 bg-gray-50 dark:bg-[#272729] hover:bg-gray-100 dark:hover:bg-[#343536] border border-gray-200 dark:border-gray-700 rounded-full text-xs flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-gray-300 transition"
          title="Thumbs Down"
        >
          <ThumbsDown className="w-3.5 h-3.5 text-gray-400" />
          <span>{emojis.thumbsDown || 0}</span>
        </button>
      </div>
    </div>
  );
}
