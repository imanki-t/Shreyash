import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Shreyash Files",
  description: "Official Privacy Policy and Data Handling Directive for The Shreyash Files digital repository.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Back to Archive Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#071931] dark:text-[#d8c396] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO CENTRAL REPOSITORY</span>
        </Link>
        <span className="font-mono text-[11px] text-slate-500">
          DOC REF: DIR-PRIV-2026-A
        </span>
      </div>

      {/* Main Dossier Container */}
      <div className="bg-white dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] shadow-md rounded-xs overflow-hidden">
        {/* Top Federal Ribbon */}
        <div className="bg-[#071931] text-white px-5 py-4 border-b-2 border-[#c5a059] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0d274d] border border-[#c5a059] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base uppercase tracking-wider text-[#d8c396]">
                PUBLIC PRIVACY POLICY & DATA HANDLING DIRECTIVE
              </h1>
              <p className="font-mono text-[10px] text-slate-400">
                THE SHREYASH FILES CENTRAL ARCHIVE // JURISDICTION: DIGITAL REPOSITORY
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            <div>EFFECTIVE DATE: SEPTEMBER 2026</div>
            <div className="text-emerald-400 font-semibold">STATUS: RATIFIED & ACTIVE</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">01.</span>
              Scope & Purpose of the Archive
            </h2>
            <p>
              The Shreyash Files (<code className="font-mono text-[#071931] dark:text-[#d8c396]">https://departmentofjustice.onrender.com/</code>) 
              operates as a private, collaborative memory archival database and lighthearted digital surveillance exhibit 
              documenting shared milestones, gaming logs, voice intercepts, and multimedia exhibits among friends and approved operatives. 
              We take the privacy and confidentiality of visitors, operatives, and subjects seriously. This Privacy Policy details the strict protocols 
              governing data collection, user authentication, and data retention.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">02.</span>
              Information Collected via Google Authentication
            </h2>
            <p>
              When an operative initiates Google Sign-In through our OAuth 2.0 authorization pipeline, we request only the minimal, basic profile information:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <li><strong>Email Address:</strong> Used solely to identify authorized operatives and verify administrative clearance tiers.</li>
              <li><strong>Display Name:</strong> Used to generate your operative identity or codename alias.</li>
              <li><strong>Profile Avatar:</strong> Used strictly for local session display within the operative console ribbon.</li>
            </ul>
            <p className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xs border border-slate-200 dark:border-slate-800 text-[11px]">
              <Lock className="w-3.5 h-3.5 inline mr-1 text-[#c5a059]" />
              <strong>Google User Data Commitment:</strong> We do NOT access, inspect, or share Google Contacts, Drive files, Calendar events, 
              or any personal Google account data beyond standard OAuth authentication tokens. We do not sell or monetize personal data under any circumstance.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">03.</span>
              User Submissions & Depositions
            </h2>
            <p>
              Operatives contributing case reports, incident debriefings, or multimedia files (audio recordings, video exhibits, screenshots) 
              may choose to submit depositions either attributed to their operative credentials or completely anonymously:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <li><strong>Anonymous Depositions:</strong> If the "Lodge as Anonymous Operative" switch is toggled, all author email links are omitted from the public index.</li>
              <li><strong>Passkeys:</strong> Operatives may set a voluntary deletion passkey upon filing, which is irreversibly hashed using standard cryptographic algorithms (bcrypt) and never stored in plain text.</li>
              <li><strong>GridFS Media Isolation:</strong> Uploaded digital assets are stored securely in dedicated MongoDB GridFS buckets with MIME-type sanitization.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">04.</span>
              Bot Mitigation & Google reCAPTCHA v3
            </h2>
            <p>
              To protect the repository against brute-force intrusion, automated spamming, and malicious bots, our deposition portal implements 
              <strong>Google reCAPTCHA v3</strong>. Interaction metrics are evaluated in the background to verify human authenticity without disrupting 
              the operative workflow. Use of reCAPTCHA is subject to Google's standard Privacy Policy and Terms of Service.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">05.</span>
              AI Ranking Algorithm & Feature Extraction
            </h2>
            <p>
              The repository utilizes an in-house, multi-stage algorithmic ranking engine (Wilson Bayesian confidence, PageRank network centrality, 
              and lexical verification) to prioritize exhibits on the central docket. The ranking engine operates strictly on public post attributes 
              (verification stamps, exhibit corroboration, recency) and does NOT profile individual visitors or harvest behavioral tracking cookies.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">06.</span>
              Data Deletion & Redaction Requests
            </h2>
            <p>
              Any subject or operative wishing to redact, expunge, or delete any record, deposition, or media exhibit lodged in The Shreyash Files 
              may do so immediately:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <li>Directly via the incident dossier page using the case passkey set at creation time.</li>
              <li>By contacting the repository administrator at <code className="font-mono text-[#071931] dark:text-[#d8c396]">ankittsu2@gmail.com</code> with the Incident Docket Number for prompt expungement.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">07.</span>
              Administrative Inquiries
            </h2>
            <p>
              For legal notifications, compliance reviews, or inquiries regarding this Privacy Policy, contact:
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xs border border-slate-300 dark:border-slate-800 font-mono text-[11px] space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white">Central Repository Directorate</div>
              <div>Entity: The Shreyash Files Digital Intelligence Vault</div>
              <div>Direct Inquiries: <span className="text-cyan-600 dark:text-cyan-400">ankittsu2@gmail.com</span></div>
              <div>Platform Host: Render.com Cloud Infrastructure</div>
            </div>
          </section>
        </div>

        {/* Footer Ribbon */}
        <div className="bg-slate-100 dark:bg-slate-900/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>GDPR & CCPA COMPLIANCE ACKNOWLEDGED</span>
          </div>
          <Link href="/terms" className="hover:underline text-[#071931] dark:text-[#d8c396]">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
