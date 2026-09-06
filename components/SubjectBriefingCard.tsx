"use client";

import React from "react";
import Link from "next/link";
import { User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface SubjectBriefingCardProps {
  identity: any;
}

export default function SubjectBriefingCard({ identity }: SubjectBriefingCardProps) {
  const subjectName = identity?.legalDesignation || "Shreyash";

  return (
    <div className="reddit-card p-4 space-y-3">
      {/* Banner / Header */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/seal_logo.jpg"
          alt="Shreyash Mascot"
          className="w-12 h-12 rounded-full object-cover border border-blue-500 shadow-sm"
        />
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            About {subjectName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Archive Subject • POI #001
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
        The official digital archive documenting funny incidents, multi-game voice calls, chaotic simulations, and legendary squad memories of {subjectName}.
      </p>

      <div className="pt-2 border-t border-gray-100 dark:border-[#272729] flex items-center justify-between">
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Active Community
        </span>

        <Link
          href="/identity"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <span>Full Dossier</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
