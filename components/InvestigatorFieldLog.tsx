"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, Shield, User, Clock } from "lucide-react";
import RedactedText from "./RedactedText";

interface CommentItem {
  _id: string;
  authorName: string;
  authorCodename: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
}

interface InvestigatorFieldLogProps {
  caseId: string;
}

export default function InvestigatorFieldLog({ caseId }: InvestigatorFieldLogProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [authorCodename, setAuthorCodename] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCodename = localStorage.getItem("covert_codename");
    if (savedCodename) setAuthorCodename(savedCodename);
    else if (session?.user?.name) setAuthorCodename(session.user.name);
    else setAuthorCodename("Investigator");

    fetchComments();
  }, [caseId, session]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?caseId=${caseId}`);
      const data = await res.json();
      if (data.comments) setComments(data.comments);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          authorName: session?.user?.name || "Operative",
          authorCodename: isAnonymous ? "Masked Operative" : (authorCodename || "Special Agent"),
          authorEmail: session?.user?.email,
          isAnonymous,
          content: newContent.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments([...comments, data.comment]);
        setNewContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f8f5] dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] shadow-xs rounded-xs overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-[#071931] text-white px-4 py-2.5 border-b-2 border-[#c5a059] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#c5a059]" />
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#d8c396]">
            INVESTIGATOR FIELD LOG & WITNESS CORROBORATION
          </h3>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          {comments.length} ENTRIES LOGGED
        </span>
      </div>

      {/* Log Feed */}
      <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
        {comments.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-slate-500">
            [NO FIELD ENTRIES RECORDED FOR THIS INCIDENT YET]
          </div>
        ) : (
          comments.map((entry) => {
            const timeFormatted = new Date(entry.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={entry._id} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                    <User className="w-3 h-3 text-[#c5a059]" />
                    <span>{entry.authorCodename}</span>
                    {entry.isAnonymous && (
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1 text-slate-600 dark:text-slate-400 rounded-xs font-normal">
                        MASKED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{timeFormatted}</span>
                  </div>
                </div>

                <div className="font-serif text-xs text-slate-800 dark:text-slate-200 leading-relaxed pl-4 border-l-2 border-slate-300 dark:border-slate-700">
                  <RedactedText text={entry.content} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Intake Form */}
      <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800">
        <form onSubmit={handlePostComment} className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">Agent Designation:</span>
              <input
                type="text"
                value={authorCodename}
                onChange={(e) => setAuthorCodename(e.target.value)}
                disabled={isAnonymous}
                placeholder="Agent Codename"
                className="px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs font-mono text-xs w-36"
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded-xs"
              />
              <span>Mask Identity (File Anonymously)</span>
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Record field notes, corroborate statements, or add timestamps (use ||text|| to redact)..."
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs text-xs font-serif focus:outline-hidden focus:border-[#071931]"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-metallic px-4 py-1.5 font-serif font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3 text-[#071931]" />
              <span>Log Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
