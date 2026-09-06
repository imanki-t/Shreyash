"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Upload,
  Image as ImageIcon,
  FileText,
  EyeOff,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Film,
  Music,
  User,
  Shield,
  Lock,
  Tag,
} from "lucide-react";
import { DEFAULT_DOCKETS, DocketItem } from "@/lib/defaultDockets";

const POST_FLAIRS = ["Discussion", "Meme", "Media", "Question", "OC"];

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dockets, setDockets] = useState<DocketItem[]>(DEFAULT_DOCKETS);
  const [targetDocket, setTargetDocket] = useState(DEFAULT_DOCKETS[0].slug);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedFlair, setSelectedFlair] = useState("Discussion");
  const [isPrivatePost, setIsPrivatePost] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDockets();
    const savedUsername = localStorage.getItem("covert_codename");
    if (savedUsername) setUsername(savedUsername);
    else if (session?.user?.name) setUsername(session.user.name);

    const defaultPriv = localStorage.getItem("default_post_private") === "true";
    setIsPrivatePost(defaultPriv);
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

  const handleInsertSpoiler = () => {
    setPostContent((prev) => prev + " </ spoiler text \\> ");
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
    if (!postTitle.trim() || !postContent.trim()) {
      setStatusMsg({ type: "error", text: "Please provide both a post title and content." });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("title", postTitle.trim());
    formData.append("docketSlug", targetDocket);
    formData.append("classificationTier", "COMMUNITY");
    formData.append("debriefNarrative", postContent.trim());
    formData.append("flair", selectedFlair);
    formData.append("isPrivate", isPrivatePost ? "true" : "false");
    formData.append("isAnonymous", isAnonymous ? "true" : "false");
    formData.append("authorName", isAnonymous ? "Anonymous User" : (session?.user?.name || username || "Community Member"));
    formData.append("authorCodename", isAnonymous ? "Anonymous" : (username.trim() || session?.user?.name || "User"));

    if (session?.user?.email && !isAnonymous) {
      formData.append("authorEmail", session.user.email);
    }

    selectedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.case) {
        setStatusMsg({ type: "success", text: "Post published successfully! Redirecting..." });
        setTimeout(() => {
          router.push(`/post/${data.case.caseNumber || data.case._id}`);
        }, 1000);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to publish post." });
        setSubmitting(false);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error submitting post." });
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#343536]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Create a Post
        </h1>
      </div>

      {/* Community Selector */}
      <div className="reddit-card p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Choose a Community / Sub-group
          </label>
          <select
            value={targetDocket}
            onChange={(e) => setTargetDocket(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-sm bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium focus:outline-hidden focus:border-blue-500"
          >
            {dockets.map((d: any) => (
              <option key={d.slug} value={d.slug}>
                c/{d.slug} — {d.name} {d.isPrivate ? "(Private)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Private Post Option */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#272729] rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivatePost}
              onChange={(e) => setIsPrivatePost(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Private Post
            </span>
          </label>
        </div>
      </div>

      {/* Main Post Form */}
      <form onSubmit={handleSubmit} className="reddit-card p-5 space-y-4">
        {/* Post Title */}
        <div>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Title"
            required
            maxLength={300}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500 transition-colors font-medium"
          />
        </div>

        {/* Flairs & Spoilers Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Post Flair Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Flair:
            </span>
            {POST_FLAIRS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFlair(f)}
                className={`px-2.5 py-0.8 rounded-full text-xs font-medium transition cursor-pointer border ${
                  selectedFlair === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 dark:bg-[#272729] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleInsertSpoiler}
            className="btn-secondary text-xs py-1 px-3"
            title="Add spoiler tag"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Add Spoiler</span>
          </button>
        </div>

        {/* Post Body */}
        <div>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Text / Post content..."
            required
            rows={8}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Media Upload Area */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-[#272729]">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Upload Photos, Audio, or Videos (Optional)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-[#22272b]/50"
          >
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Drag and drop or <span className="text-blue-600 dark:text-blue-400">browse files</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Supports JPG, PNG, MP4, WebM, MP3, WAV
            </div>
          </div>

          {/* Uploaded File Previews */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-[#272729] px-3 py-1.5 rounded-lg text-xs text-gray-800 dark:text-gray-200"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span className="max-w-xs truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Identity Toggle */}
        <div className="pt-3 border-t border-gray-100 dark:border-[#272729] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Post Anonymously</span>
            </label>

            {!isAnonymous && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Display Name / Username"
                className="px-2.5 py-1 text-xs bg-gray-50 dark:bg-[#272729] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-hidden"
              />
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary py-2 px-6 text-sm cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}
