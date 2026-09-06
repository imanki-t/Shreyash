"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Shield, Key, Moon, Sun, Monitor, LogOut, CheckCircle2 } from "lucide-react";

interface OperativeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OperativeModal({ isOpen, onClose }: OperativeModalProps) {
  const { data: session } = useSession();
  const [codename, setCodename] = useState("");
  const [passkey, setPasskey] = useState("");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [covertSuccess, setCovertSuccess] = useState(false);

  useEffect(() => {
    const savedCodename = localStorage.getItem("covert_codename");
    if (savedCodename) setCodename(savedCodename);

    const savedTheme = (localStorage.getItem("site_theme") as any) || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme: "system" | "light" | "dark") => {
    localStorage.setItem("site_theme", selectedTheme);
    setTheme(selectedTheme);
    const root = document.documentElement;

    if (selectedTheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (selectedTheme === "light") {
      root.removeAttribute("data-theme");
    } else {
      // System default
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
    }
  };

  const handleSaveCovert = (e: React.FormEvent) => {
    e.preventDefault();
    if (codename) {
      localStorage.setItem("covert_codename", codename.trim());
      if (passkey) localStorage.setItem("covert_passkey", passkey);
      setCovertSuccess(true);
      setTimeout(() => {
        setCovertSuccess(false);
        onClose();
        window.location.reload();
      }, 800);
    }
  };

  const handleClearCovert = () => {
    localStorage.removeItem("covert_codename");
    localStorage.removeItem("covert_passkey");
    setCodename("");
    setPasskey("");
    window.location.reload();
  };

  if (!isOpen) return null;

  const isMasterAdmin =
    (session?.user as any)?.role === "admin" ||
    (session?.user as any)?.isAdmin === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#0a182d] border-2 border-[#1e3a63] text-white shadow-2xl rounded-xs overflow-hidden z-10 font-sans">
        {/* Header */}
        <div className="bg-[#051224] text-white px-4 py-3 border-b-2 border-[#c5a059] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c5a059]" />
            <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-[#f3e6c8]">
              OFFICIAL CLEARANCE TERMINAL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-mono text-sm px-1.5 py-0.5 border border-slate-600 hover:border-slate-400 rounded-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-200">
          {/* Section 1: Active Session or Google Sign In */}
          {session?.user ? (
            <div className="p-3 bg-[#0c2242] border border-[#1e3a63] rounded-xs">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Operative"}
                    className="w-10 h-10 rounded-full border border-[#c5a059]"
                  />
                )}
                <div>
                  <div className="font-bold text-sm text-white">
                    {session.user.name}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {session.user.email}
                  </div>
                  <div className="mt-1 inline-block">
                    {isMasterAdmin ? (
                      <span className="stamp-classified stamp-amber text-[10px]">
                        ★ LEAD DIRECTORATE CLEARANCE
                      </span>
                    ) : (
                      <span className="stamp-classified stamp-green text-[10px]">
                        AUTHENTICATED OPERATIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isMasterAdmin && (
                <div className="mt-3 pt-2 border-t border-[#1e3a63]">
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="block text-center py-1.5 px-3 bg-[#071931] hover:bg-[#0c2242] text-[#e6ca85] border border-[#c5a059] font-bold text-xs uppercase tracking-wider rounded-xs transition"
                  >
                    Open Directorate Oversight Console →
                  </Link>
                </div>
              )}

              <button
                onClick={() => signOut()}
                className="mt-3 w-full py-1.5 px-3 flex items-center justify-center gap-2 border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 font-bold uppercase tracking-wider rounded-xs transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminate Authenticated Session
              </button>
            </div>
          ) : (
            <div>
              <label className="block font-serif font-bold text-slate-200 uppercase tracking-wider mb-1.5 text-[11px]">
                AUTHENTICATE AGENT SESSION
              </label>
              <button
                onClick={() => signIn("google")}
                className="w-full py-2 px-3 btn-metallic flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-serif text-slate-800 text-xs">
                  Sign In with Google Account
                </span>
              </button>
            </div>
          )}

          {/* Section 2: Covert Clearance / Anonymous Codename */}
          <div className="pt-3 border-t border-[#1e3a63]">
            <label className="block font-serif font-bold text-slate-200 uppercase tracking-wider mb-1.5 text-[11px]">
              OR MAINTAIN COVERT CLEARANCE
            </label>
            <form onSubmit={handleSaveCovert} className="space-y-2.5">
              <div>
                <span className="block text-[11px] text-slate-400 font-mono mb-1">
                  Operative Codename (Public Alias):
                </span>
                <input
                  type="text"
                  value={codename}
                  onChange={(e) => setCodename(e.target.value)}
                  placeholder="e.g. Agent Phoenix-09"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#071324] border border-[#1e3a63] font-mono rounded-xs focus:outline-hidden focus:border-[#c5a059] text-white"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-400 font-mono mb-1">
                  Clearance Passkey (For Editing/Redacting Your Submissions):
                </span>
                <div className="relative">
                  <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter secret passphrase"
                    className="w-full px-2.5 py-1.5 text-xs bg-[#071324] border border-[#1e3a63] font-mono rounded-xs focus:outline-hidden focus:border-[#c5a059] text-white"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 btn-metallic text-xs font-serif font-bold cursor-pointer"
                >
                  Engage Covert Session
                </button>
                {codename && (
                  <button
                    type="button"
                    onClick={handleClearCovert}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-rose-400 border border-[#1e3a63] rounded-xs cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {covertSuccess && (
                <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Covert operative profile updated.
                </div>
              )}
            </form>
          </div>

          {/* Section 3: Interface Luminescence */}
          <div className="pt-3 border-t border-[#1e3a63]">
            <span className="block font-serif font-bold text-slate-200 uppercase tracking-wider mb-1.5 text-[11px]">
              SYSTEM PREFERENCES
            </span>
            <div className="flex items-center justify-between p-2 bg-[#071324] border border-[#1e3a63] rounded-xs">
              <span className="text-[11px] font-mono text-slate-400">
                Interface Luminescence:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => applyTheme("system")}
                  className={`p-1 rounded-xs border text-[11px] flex items-center gap-1 cursor-pointer ${
                    theme === "system"
                      ? "bg-[#071931] text-[#e6ca85] border-[#c5a059]"
                      : "bg-[#0c2242] text-slate-300 border-[#1e3a63]"
                  }`}
                  title="Follow OS Setting"
                >
                  <Monitor className="w-3 h-3" /> Auto
                </button>
                <button
                  type="button"
                  onClick={() => applyTheme("light")}
                  className={`p-1 rounded-xs border text-[11px] flex items-center gap-1 cursor-pointer ${
                    theme === "light"
                      ? "bg-[#071931] text-[#e6ca85] border-[#c5a059]"
                      : "bg-[#0c2242] text-slate-300 border-[#1e3a63]"
                  }`}
                  title="Federal Navy Light Mode"
                >
                  <Sun className="w-3 h-3" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => applyTheme("dark")}
                  className={`p-1 rounded-xs border text-[11px] flex items-center gap-1 cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#071931] text-[#e6ca85] border-[#c5a059]"
                      : "bg-[#0c2242] text-slate-300 border-[#1e3a63]"
                  }`}
                  title="Surveillance Dark Mode"
                >
                  <Moon className="w-3 h-3" /> Dark
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Administrative Recognition Badge (Safe, No Email Exposed!) */}
          <div className="p-2.5 bg-[#0c2242] border border-[#c5a059]/40 rounded-xs flex items-start gap-2 text-[11px]">
            <Shield className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white font-serif">
                DIRECTORATE RECOGNITION:
              </strong>{" "}
              Authenticated Lead Directorate credentials automatically grant Master Oversight clearance across all dockets and incident records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
