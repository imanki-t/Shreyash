import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, CheckCircle2, AlertCircle, FileText, UserCheck } from "lucide-react";

export const metadata = {
  title: "User Agreement | The Shreyash Files",
  description: "Terms of Service and Community Guidelines for The Shreyash Files.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans py-4">
      {/* Back to Feed Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#ff4500] dark:hover:text-[#ff4500] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last updated: September 2026
        </span>
      </div>

      {/* Main Reddit Policy Card */}
      <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] shadow-sm rounded-2xl overflow-hidden">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-[#343536] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff4500] text-white flex items-center justify-center shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">
                The Shreyash Files User Agreement
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please review the terms and rules that govern our community platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#ff4500] flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2>Acceptance of Terms</h2>
            </div>
            <p>
              Welcome to <strong>The Shreyash Files</strong>. By accessing our platform, viewing posts, participating in communities, or creating content, you agree to comply with this User Agreement and our Community Guidelines. If you do not agree to these terms, you should not access or use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#ff4500] flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2>Account Authentication & Guest Access</h2>
            </div>
            <p>
              Browsing public communities and viewing posts is open to guests. However, creating posts, voting, commenting, and using real-time community chat strictly requires authenticating via Google OAuth 2.0.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-[#272729] rounded-xl border border-gray-200 dark:border-[#343536] space-y-2 text-xs">
              <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                Fair Engagement & One User = One Vote Rule
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                To guarantee organic discussion and prevent vote tampering, each authenticated user is strictly limited to one vote per post and comment. Automated vote manipulation, bots, or multiple account abuses are strictly prohibited.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#ff4500] flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2>Community Guidelines & Content Moderation</h2>
            </div>
            <p>
              The Shreyash Files was founded as a shared space for memorable events, discussions, gaming clips, and inside humor among friends. When participating, you must adhere to the following community standards:
            </p>
            <ul className="space-y-2 text-xs pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Harassment or Bullying:</strong> Content must remain consensual, positive, and lighthearted. Malicious targeted attacks are banned.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No Malicious Payloads:</strong> Uploading malware, phishing scripts, or exploits will result in immediate permanent suspension.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Respect Privacy:</strong> Never post unauthorized personal identifiers (such as home addresses, phone numbers, or credentials).</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#ff4500] flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2>Content Ownership & License</h2>
            </div>
            <p>
              You retain all ownership rights to the photos, text, and videos you submit. By posting to public communities, you grant The Shreyash Files a non-exclusive license to host, display, and format your content for other users within the platform.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#ff4500] flex items-center justify-center text-xs font-bold">
                5
              </div>
              <h2>Account Termination & Content Removal</h2>
            </div>
            <p>
              Users can remove their uploaded posts at any time using their deletion passkey or profile settings. If you wish to purge all personal data, you can do so directly from your <Link href="/settings" className="text-[#ff4500] hover:underline font-semibold">Settings Page</Link>.
            </p>
          </section>
        </div>

        {/* Footer info box */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#121213] border-t border-gray-200 dark:border-[#343536] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted sessions powered by Google OAuth 2.0</span>
          </div>
          <Link href="/privacy" className="text-[#ff4500] hover:underline font-semibold">
            Read Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
