"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, Download, Video, Music, FileText, Image as ImageIcon } from "lucide-react";

interface Attachment {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  mediaType: "video" | "audio" | "image" | "document";
}

interface MediaPlayerProps {
  attachments: Attachment[];
  caseNumber?: string;
}

export default function MediaPlayer({ attachments, caseNumber }: MediaPlayerProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(
    attachments && attachments.length > 0 ? attachments[0] : null
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!attachments || attachments.length === 0) {
    return (
      <div className="bg-[#0b121e] border-2 border-slate-700 p-6 text-center text-slate-400 font-mono text-xs rounded-xs">
        <div className="text-slate-500 mb-1">[NO DIGITAL SURVEILLANCE FEED ATTACHED]</div>
        <div className="text-[10px] text-slate-600">Documentary evidence lodged as verbatim narrative affidavit only.</div>
      </div>
    );
  }

  const current = selectedAttachment || attachments[0];
  const streamUrl = `/api/media/${current.fileId}`;

  return (
    <div className="space-y-3 font-sans">
      {/* Exhibit Selector Tabs if multiple attachments */}
      {attachments.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-300 dark:border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 uppercase px-1">Exhibits:</span>
          {attachments.map((att, idx) => (
            <button
              key={att.fileId}
              onClick={() => setSelectedAttachment(att)}
              className={`px-2.5 py-1 rounded-xs border cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                current.fileId === att.fileId
                  ? "bg-[#071931] text-[#e6ca85] border-[#c5a059] font-bold"
                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span>Ex. 0{idx + 1}:</span>
              <span className="truncate max-w-[120px]">{att.filename}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Surveillance Player Box */}
      <div className="bg-[#080f1a] border-2 border-[#546274] shadow-md rounded-xs overflow-hidden relative">
        {/* Top Metallic Surveillance Bar */}
        <div className="bg-[#121c2b] px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
            <span className="text-rose-400 font-bold tracking-widest text-[10px]">
              REC SURVEILLANCE FEED
            </span>
          </div>
          <div className="text-emerald-400 font-bold tracking-wider text-[10px]">
            EVIDENCE IDENTIFIER: {current.filename}
          </div>
        </div>

        {/* Player Canvas */}
        <div className="relative min-h-[220px] sm:min-h-[280px] flex items-center justify-center bg-black/90">
          {current.mediaType === "video" && (
            <video
              src={streamUrl}
              controls
              playsInline
              className="w-full max-h-[380px] object-contain"
            >
              Your browser does not support surveillance video playback.
            </video>
          )}

          {current.mediaType === "audio" && (
            <div className="p-6 w-full max-w-md text-center space-y-4 font-mono">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#071931] border-2 border-[#c5a059] flex items-center justify-center shadow-inner">
                <Music className="w-8 h-8 text-[#e6ca85]" />
              </div>
              <div className="text-xs text-slate-300 font-bold tracking-widest uppercase">
                AUDIO INTERCEPT WIRE REEL
              </div>
              <audio
                src={streamUrl}
                controls
                className="w-full h-10 filter invert contrast-125"
              >
                Audio stream not supported.
              </audio>
            </div>
          )}

          {current.mediaType === "image" && (
            <div className="relative p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={streamUrl}
                alt={current.filename}
                className="max-h-[360px] w-auto object-contain border border-slate-700 shadow-lg"
              />
              <div className="absolute top-4 right-4 pointer-events-none rotate-12">
                <span className="stamp-classified stamp-red text-xs">
                  OFFICIAL EVIDENCE
                </span>
              </div>
            </div>
          )}

          {current.mediaType === "document" && (
            <div className="p-8 text-center space-y-3 font-mono text-slate-300">
              <FileText className="w-12 h-12 text-[#c5a059] mx-auto" />
              <div className="font-bold text-xs">{current.filename}</div>
              <div className="text-[11px] text-slate-500">
                {(current.size / 1024).toFixed(1)} KB • Classified Document Archive
              </div>
            </div>
          )}
        </div>

        {/* Bottom Utility Bar */}
        <div className="bg-[#0e1724] px-3 py-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400 text-[10px]">
            SHA-256 VERIFIED RECORD • {current.contentType}
          </div>
          <a
            href={streamUrl}
            download={current.filename}
            className="btn-metallic px-3 py-1 text-[11px] flex items-center gap-1.5 cursor-pointer font-serif"
          >
            <Download className="w-3.5 h-3.5 text-[#071931]" />
            <span>Download Evidence File</span>
          </a>
        </div>
      </div>
    </div>
  );
}
