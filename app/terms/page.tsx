import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Shreyash Files",
  description: "Official Terms of Service and Operational Directives for The Shreyash Files repository.",
};

export default function TermsOfServicePage() {
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
          DOC REF: DIR-TOS-2026-B
        </span>
      </div>

      {/* Main Dossier Container */}
      <div className="bg-white dark:bg-[#111822] border-2 border-[#b8b3a5] dark:border-[#273549] shadow-md rounded-xs overflow-hidden">
        {/* Top Federal Ribbon */}
        <div className="bg-[#071931] text-white px-5 py-4 border-b-2 border-[#c5a059] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0d274d] border border-[#c5a059] flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base uppercase tracking-wider text-[#d8c396]">
                TERMS OF SERVICE & OPERATIONAL DIRECTIVES
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
              Acceptance of Operational Terms
            </h2>
            <p>
              By accessing, browsing, or depositing files into The Shreyash Files 
              (<code className="font-mono text-[#071931] dark:text-[#d8c396]">https://departmentofjustice.onrender.com/</code>), 
              you agree to be legally bound by these Terms of Service. If you do not agree with any provision stated herein, you are 
              directed to terminate your session immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">02.</span>
              Nature and Character of the Archive
            </h2>
            <p>
              The Shreyash Files is a parody and consensual camaraderie repository styled as an authentic 2006 federal intelligence database. 
              The terminology ("Classified", "Special Investigation", "Surveillance Exhibits", "Directorate") is utilized solely for theatrical, 
              humorous, and stylistic narrative effect. All entries memorialize shared multiplayer gaming events (e.g., Minecraft, virtual simulations), 
              memorable moments, and inside banter among friends. It is not affiliated with any actual government agency or law enforcement department.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">03.</span>
              Authentication, Credentials & Passkeys
            </h2>
            <p>
              Access to authenticated filing consoles is facilitated through Google OAuth 2.0. Operatives are responsible for maintaining the confidentiality 
              of their account sessions and any deposition passkeys created during filing. The archive employs cryptographic one-way hashing (bcrypt) 
              for case modification passkeys.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">04.</span>
              Prohibited Content & Filing Standards
            </h2>
            <p>
              All operatives and visitors must adhere strictly to respectful conduct. Prohibited conduct includes, without limitation:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <li>Lodge of malicious software, scripts, unauthorized tracking payloads, or exploits.</li>
              <li>Filing harmful, non-consensual personal information (doxxing), explicit private credentials, or defamatory falsehoods.</li>
              <li>Executing automated bot submissions or attempting to circumvent Google reCAPTCHA v3 verification.</li>
              <li>Any activity violating applicable municipal, national, or international communications laws.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">05.</span>
              Content Ownership & Expungement Directives
            </h2>
            <p>
              Operatives retain ownership of their contributed exhibits, while granting The Shreyash Files a non-exclusive license to index, display, 
              and rank the material within the archive interface. <strong>Right to Immediate Redaction:</strong> Any subject featured in any incident dossier 
              reserves the absolute right to have their exhibits redacted or purged upon request without condition.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">06.</span>
              Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xs border border-slate-200 dark:border-slate-800 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
              UNDER NO CIRCUMSTANCES SHALL THE DIRECTORS OR OPERATORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES 
              RESULTING FROM ACCESS TO OR INABILITY TO ACCESS THE REPOSITORY.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-[#071931] dark:text-white uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <span className="font-mono text-xs text-[#c5a059]">07.</span>
              Contact & Grievance Directorate
            </h2>
            <p>
              To report policy violations, request immediate exhibit expungement, or inquire about these Terms, reach the Directorate at:
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xs border border-slate-300 dark:border-slate-800 font-mono text-[11px] space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white">Central Repository Directorate</div>
              <div>Direct Inquiries: <span className="text-cyan-600 dark:text-cyan-400">ankittsu2@gmail.com</span></div>
              <div>Canonical URI: <span className="text-slate-600 dark:text-slate-400">https://departmentofjustice.onrender.com/</span></div>
            </div>
          </section>
        </div>

        {/* Footer Ribbon */}
        <div className="bg-slate-100 dark:bg-slate-900/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>OPERATIONAL TERMS RATIFIED</span>
          </div>
          <Link href="/privacy" className="hover:underline text-[#071931] dark:text-[#d8c396]">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
