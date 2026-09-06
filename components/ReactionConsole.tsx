"use client";

import React, { useState } from "react";
import { Star, CheckCircle, ShieldAlert, AlertTriangle, HelpCircle } from "lucide-react";

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
    average: number;
    count: number;
    totalScore: number;
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
  const [userVotedRating, setUserVotedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [activeStamp, setActiveStamp] = useState<string | null>(null);

  const handleStamp = async (key: string) => {
    try {
      setActiveStamp(key);
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "stamp", key }),
      });
      const data = await res.json();
      if (data.success && data.stamps) {
        setStamps(data.stamps);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmoji = async (key: string) => {
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "emoji", key }),
      });
      const data = await res.json();
      if (data.success && data.emojis) {
        setEmojis(data.emojis);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (score: number) => {
    try {
      setUserVotedRating(score);
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, type: "rating", score }),
      });
      const data = await res.json();
      if (data.success && data.ratings) {
        setRatings(data.ratings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#f9f8f5] dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] p-4 rounded-xs shadow-xs font-sans select-none">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Corroboration Stamps */}
        <div className="space-y-2">
          <div className="font-serif font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>OFFICIAL CORROBORATION CONSOLE</span>
            <span className="text-[10px] font-mono text-slate-500 font-normal">
              (Click to Stamp Document)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStamp("verifiedAccurate")}
              className={`stamp-classified stamp-green cursor-pointer hover:scale-105 transition-transform text-[11px] ${
                activeStamp === "verifiedAccurate" ? "ring-2 ring-emerald-600" : ""
              }`}
              title="Endorse as verified evidence"
            >
              ✓ VERIFIED ACCURATE ({stamps.verifiedAccurate || 0})
            </button>

            <button
              onClick={() => handleStamp("corroborated")}
              className={`stamp-classified stamp-blue cursor-pointer hover:scale-105 transition-transform text-[11px] ${
                activeStamp === "corroborated" ? "ring-2 ring-blue-600" : ""
              }`}
              title="Corroborated by eyewitness operatives"
            >
              📋 CORROBORATED ({stamps.corroborated || 0})
            </button>

            <button
              onClick={() => handleStamp("flaggedAnomaly")}
              className={`stamp-classified stamp-red cursor-pointer hover:scale-105 transition-transform text-[11px] ${
                activeStamp === "flaggedAnomaly" ? "ring-2 ring-rose-600" : ""
              }`}
              title="Flag as extreme behavioral anomaly"
            >
              ⚠ FLAGGED ANOMALY ({stamps.flaggedAnomaly || 0})
            </button>

            <button
              onClick={() => handleStamp("discrepancyDetected")}
              className={`stamp-classified stamp-amber cursor-pointer hover:scale-105 transition-transform text-[11px] ${
                activeStamp === "discrepancyDetected" ? "ring-2 ring-amber-600" : ""
              }`}
              title="Discrepancy detected in subject's statement"
            >
              🔍 UNDER INVESTIGATION ({stamps.discrepancyDetected || 0})
            </button>
          </div>
        </div>

        {/* Right: Incident Severity Gauge (5 Stars) */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-300 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-6 space-y-1 shrink-0">
          <div className="font-serif font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
            INCIDENT SEVERITY GAUGE
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = (hoverRating || userVotedRating || Math.round(ratings.average || 0)) >= star;
              return (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 cursor-pointer transition hover:scale-110"
                  title={`Rate Severity Tier ${star}`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      filled
                        ? "fill-amber-500 text-amber-500"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  />
                </button>
              );
            })}
            <span className="font-mono font-bold text-xs ml-2 text-slate-800 dark:text-slate-200">
              {ratings.average ? `${ratings.average} / 5` : "Unrated"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({ratings.count || 0} evals)
            </span>
          </div>
        </div>
      </div>

      {/* Fast Reactions Deck (Emojis) */}
      <div className="mt-4 pt-3 border-t border-slate-300 dark:border-slate-800 flex items-center gap-2 flex-wrap text-xs">
        <span className="font-mono text-[10px] uppercase text-slate-500 mr-2">
          Field Endorsements:
        </span>
        <button
          onClick={() => handleEmoji("thumbsUp")}
          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-xs font-mono text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>👍</span> <span>{emojis.thumbsUp || 0}</span>
        </button>
        <button
          onClick={() => handleEmoji("thumbsDown")}
          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-xs font-mono text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>👎</span> <span>{emojis.thumbsDown || 0}</span>
        </button>
        <button
          onClick={() => handleEmoji("laugh")}
          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-xs font-mono text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>😆</span> <span>{emojis.laugh || 0}</span>
        </button>
        <button
          onClick={() => handleEmoji("skull")}
          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-xs font-mono text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>💀</span> <span>{emojis.skull || 0}</span>
        </button>
        <button
          onClick={() => handleEmoji("heart")}
          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 rounded-xs font-mono text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>❤️</span> <span>{emojis.heart || 0}</span>
        </button>
      </div>
    </div>
  );
}
