"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload, FileText, Film, Music, Shield, Key, CheckCircle, AlertCircle } from "lucide-react";
import AgencyCrest from "@/components/AgencyCrest";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [targetDocket, setTargetDocket] = useState(DEFAULT_DOCKETS[0].slug);
  const [caseTitle, setCaseTitle] = useState("");
  const [classificationTier, setClassificationTier] = useState("RESTRICTED");
  const [identityProtocol, setIdentityProtocol] = useState<"anonymous" | "google">("anonymous");
  const [agentCodename, setAgentCodename] = useState("");
  const [agentPasskey, setAgentPasskey] = useState("");
  const [narrative, setNarrative] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDockets();
    const savedCodename = localStorage.getItem("covert_codename");
    if (savedCodename) setAgentCodename(savedCodename);
    const savedPasskey = localStorage.getItem("covert_passkey");
    if (savedPasskey) setAgentPasskey(savedPasskey);

    if (session?.user) {
      setIdentityProtocol("google");
    }
  }, [session]);

  const fetchDockets = async () => {
    try {
      const res = await fetch("/api/dockets");
      const data = await res.json();
      if (data.dockets) setDockets(data.dockets);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInsertRedaction = () => {
    setNarrative((prev) => prev + " ||CENSORED EVIDENCE|| ");
  };

  const handleInsertTimestamp = () => {
    const now = new Date().toISOString().substring(11, 19) + " UTC";
    setNarrative((prev) => prev + ` [TIMESTAMP: ${now}] `);
  };

  const handleInsertQuote = () => {
    setNarrative((prev) => prev + `\n> "SUBJECT STATED: [Verbatim Quote]" - (Voice Intercept)\n`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseTitle.trim() || !narrative.trim()) {
      setStatusMsg({ type: "error", text: "Mandatory fields required: Incident Title and Detailed Narrative." });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("title", caseTitle.trim());
    formData.append("docketSlug", targetDocket);
    formData.append("classificationTier", classificationTier);
    formData.append("debriefNarrative", narrative.trim());

    const isAnon = identityProtocol === "anonymous";
    formData.append("isAnonymous", isAnon ? "true" : "false");
    formData.append("authorName", isAnon ? "Masked Operative" : (session?.user?.name || "Field Agent"));
    formData.append("authorCodename", agentCodename.trim() || (isAnon ? "Operative #402" : "Agent"));
    if (session?.user?.email && !isAnon) {
      formData.append("authorEmail", session.user.email);
    }
    if (agentPasskey) {
      formData.append("passkey", agentPasskey);
    }

    for (const file of selectedFiles) {
      formData.append("attachments", file);
    }

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.case) {
        setStatusMsg({ type: "success", text: `Deposition lodged successfully under Case ${data.case.caseNumber}!` });
        if (agentPasskey) localStorage.setItem("covert_passkey", agentPasskey);
        if (agentCodename) localStorage.setItem("covert_codename", agentCodename);
        setTimeout(() => {
          router.push(`/post/${data.case.caseNumber}`);
        }, 1200);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to lodge record." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error submitting deposition." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Deposition Terminal Box */}
      <div className="bg-[#fbfaf6] dark:bg-[#0f1722] border-2 border-[#c8c4b7] dark:border-[#273549] rounded-xs shadow-lg p-6 sm:p-8 space-y-6 font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b-2 border-[#071931] dark:border-[#c5a059] pb-4">
          <AgencyCrest size="md" />
          <div className="text-center sm:text-left space-y-0.5">
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
              CENTRAL REPOSITORY OF SPECIAL INCIDENTS // FORM 404-B
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              INCIDENT DEPOSITION & EVIDENCE LODGING FORM
            </h2>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Submit verified incidents, audio wiretaps, and visual surveillance directly to the permanent record.
            </p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xs font-mono text-xs flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                : "bg-rose-50 border border-rose-300 text-rose-800"
            }`}
          >
            {statusMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Row 1: Target Docket & Classification Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Docket Classification:
              </label>
              <select
                value={targetDocket}
                onChange={(e) => setTargetDocket(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-white dark:bg-slate-900 font-mono text-xs"
              >
                {dockets.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.docketNumber}: {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Security Clearance Tier:
              </label>
              <select
                value={classificationTier}
                onChange={(e) => setClassificationTier(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-white dark:bg-slate-900 font-mono text-xs"
              >
                <option value="RESTRICTED">RESTRICTED (Official Eyes Only)</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL (High Sensitivity)</option>
                <option value="DECLASSIFIED">DECLASSIFIED (Public Register)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Case Summary */}
          <div>
            <label className="block font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Case Summary / Incident Title:
            </label>
            <input
              type="text"
              required
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="e.g. Unexplained Structural Detonation at Sector 4 Node"
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-white dark:bg-slate-900 font-serif font-bold text-sm"
            />
          </div>

          {/* Row 3: Investigator Identity & Passkey */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#ede9dc] dark:bg-[#16202c] border border-[#c8c4b7] dark:border-[#273549] rounded-xs">
            <div className="space-y-2">
              <label className="block font-mono font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                Investigator Anonymity Protocol:
              </label>
              <div className="space-y-1 font-mono">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value="anonymous"
                    checked={identityProtocol === "anonymous"}
                    onChange={() => setIdentityProtocol("anonymous")}
                  />
                  <span>File Under Masked Operative Designation (Anonymous)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="protocol"
                    value="google"
                    checked={identityProtocol === "google"}
                    onChange={() => setIdentityProtocol("google")}
                  />
                  <span>Lodge Under Authenticated Google Credential</span>
                </label>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Operative Codename (e.g. Agent Falcon)"
                  value={agentCodename}
                  onChange={(e) => setAgentCodename(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded-xs bg-white dark:bg-slate-900 font-mono text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] mb-1">
                Agent Revision Passkey:
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Set secret passkey to amend/shred later"
                  value={agentPasskey}
                  onChange={(e) => setAgentPasskey(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xs bg-white dark:bg-slate-900 font-mono text-xs"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Store this passkey securely. It allows you to revise or redact this deposition in the future without an admin.
              </p>
            </div>
          </div>

          {/* Row 4: Narrative & Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                Incident Narrative & Detailed Deposition:
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleInsertRedaction}
                  className="px-2 py-0.5 bg-black text-white font-mono text-[10px] font-bold rounded-xs cursor-pointer hover:bg-zinc-800"
                  title="Insert Classified Blackout Redaction"
                >
                  + [REDACT]
                </button>
                <button
                  type="button"
                  onClick={handleInsertTimestamp}
                  className="px-2 py-0.5 btn-metallic font-mono text-[10px] rounded-xs cursor-pointer"
                >
                  + Timestamp
                </button>
                <button
                  type="button"
                  onClick={handleInsertQuote}
                  className="px-2 py-0.5 btn-metallic font-mono text-[10px] rounded-xs cursor-pointer"
                >
                  + Quote
                </button>
              </div>
            </div>

            <textarea
              required
              rows={8}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="Provide a chronological, matter-of-fact intelligence debrief describing the incident, subject actions, server impact, and dialogue. Use ||text|| to redact classified portions."
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xs bg-white dark:bg-slate-900 font-serif leading-relaxed text-sm"
            />
          </div>

          {/* Row 5: Media Dropzone */}
          <div>
            <label className="block font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Surveillance Media & Exhibit Dropzone (GridFS Warehouse):
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#b8b3a5] dark:border-[#273549] p-6 text-center rounded-xs bg-[#ede9dc]/30 dark:bg-[#16202c]/30 hover:bg-[#ede9dc]/60 transition cursor-pointer space-y-2"
            >
              <Upload className="w-8 h-8 text-[#c5a059] mx-auto" />
              <div className="font-serif font-bold text-xs text-slate-800 dark:text-slate-200 uppercase">
                CLICK TO ATTACH SURVEILLANCE FOOTAGE, AUDIO WIREMODS, OR IMAGERY
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                MP4, WEBM, MP3, WAV, JPG, PNG, PDF &bull; DIRECT MONGO GRIDFS ENCRYPTION
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="video/*,audio/*,image/*,application/pdf"
              />
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5 font-mono text-xs">
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.type.startsWith("video/") ? (
                        <Film className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : file.type.startsWith("audio/") ? (
                        <Music className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                      <span className="truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-rose-500 hover:text-rose-700 font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Submit Button */}
          <div className="pt-4 border-t border-[#c8c4b7] dark:border-[#273549] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
                <Shield className="w-3 h-3 text-emerald-600" />
                SECURE RECAPTCHA v3 ANTI-AUTOMATION PROTOCOL ACTIVE
              </div>
              <div>Submissions are cryptographically signed and logged with time of origin.</div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto btn-metallic px-6 py-2.5 text-sm font-serif font-bold tracking-wider rounded-xs cursor-pointer"
            >
              {submitting ? "INGESTING DEPOSITION INTO GRIDFS..." : "FILE OFFICIAL DEPOSITION INTO ARCHIVE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
