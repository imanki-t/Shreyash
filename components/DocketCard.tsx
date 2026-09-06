"use client";

import React from "react";
import Link from "next/link";
import { Play, FileText, Film, Volume2, ShieldCheck, AlertTriangle } from "lucide-react";
import { IPost } from "@/models/Post";
import RedactedText from "./RedactedText";

interface DocketCardProps {
  post: IPost;
}

export default function DocketCard({ post }: DocketCardProps) {
  const caseId = post.caseNumber || (post as any)._id;
  const hasVideo = post.attachments?.some((a) => a.mediaType === "video");
  const hasAudio = post.attachments?.some((a) => a.mediaType === "audio");
  const hasImage = post.attachments?.some((a) => a.mediaType === "image");
  const firstImage = post.attachments?.find((a) => a.mediaType === "image");

  return (
    <div className="relative bg-[#f5f1e3] dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] rounded-xs shadow-md p-4 flex flex-col justify-between font-sans hover:border-[#7c8798] transition-all group">
      {/* Folder Tab at Top */}
      <div className="absolute -top-3.5 left-3 bg-[#e2dcce] dark:bg-[#1a2332] border-t-2 border-x-2 border-[#b8b3a5] dark:border-[#273549] px-2.5 py-0.5 rounded-t-xs text-[10px] font-mono font-bold text-[#071931] dark:text-[#dfb76c] tracking-wider uppercase">
        FILE: {post.caseNumber}
      </div>

      {/* Rubber Stamp in Corner */}
      <div className="absolute top-2 right-3 rotate-2 pointer-events-none">
        {post.isRedacted ? (
          <span className="stamp-classified stamp-red text-[9px]">
            CENSORED
          </span>
        ) : post.stamps?.verifiedAccurate > 0 ? (
          <span className="stamp-classified stamp-green text-[9px]">
            VERIFIED
          </span>
        ) : (
          <span className="stamp-classified stamp-amber text-[9px]">
            UNDER REVIEW
          </span>
        )}
      </div>

      <div>
        {/* Media Thumbnail Container */}
        <div className="mt-2 relative aspect-video bg-black/80 rounded-xs overflow-hidden border border-[#b8b3a5] dark:border-slate-700 flex items-center justify-center">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/media/${firstImage.fileId}`}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : hasVideo ? (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
              <div className="w-10 h-10 rounded-full bg-[#071931]/80 border border-[#c5a059] flex items-center justify-center">
                <Play className="w-4 h-4 text-[#dfb76c] ml-0.5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400">SURVEILLANCE VIDEO</span>
            </div>
          ) : hasAudio ? (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
              <Volume2 className="w-8 h-8 text-[#dfb76c]" />
              <span className="text-[10px] font-mono text-amber-300">AUDIO INTERCEPT REEL</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <FileText className="w-8 h-8 text-[#c5a059]" />
              <span className="text-[10px] font-mono">OFFICIAL DEPOSITION</span>
            </div>
          )}

          {/* Media Badges */}
          <div className="absolute bottom-1 left-1.5 flex gap-1 font-mono text-[9px] text-white bg-black/70 px-1 rounded-xs">
            {hasVideo && <span>VIDEO</span>}
            {hasAudio && <span>AUDIO</span>}
            {hasImage && <span>PHOTO</span>}
          </div>
        </div>

        {/* Title and Excerpt */}
        <div className="mt-3 space-y-1">
          <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white leading-tight line-clamp-2">
            <Link href={`/post/${caseId}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>
          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 italic pt-1">
            <RedactedText content={post.debriefNarrative} />
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-2 border-t border-[#c8c4b7] dark:border-[#273549] flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div>
          BY:{" "}
          <Link
            href={`/profile/${encodeURIComponent(post.author?.codename || "Operative")}`}
            className="text-slate-800 dark:text-slate-200 font-bold hover:underline hover:text-[#071931] dark:hover:text-[#dfb76c] transition-colors"
            title="View Operative Profile"
          >
            {post.author?.codename || "Operative"}
          </Link>
        </div>
        <Link
          href={`/post/${caseId}`}
          className="btn-metallic px-2 py-0.5 text-[10px] font-serif font-bold rounded-xs cursor-pointer"
        >
          Examine Case →
        </Link>
      </div>
    </div>
  );
}
