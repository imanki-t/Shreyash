import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database, CheckCircle2, UserCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | The Shreyash Files",
  description: "Privacy Policy and Data Protection standards for The Shreyash Files.",
};

export default function PrivacyPolicyPage() {
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

      {/* Main Reddit Privacy Card */}
      <div className="bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#343536] shadow-sm rounded-2xl overflow-hidden">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-[#343536] bg-gradient-to-r from-blue-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">
                The Shreyash Files Privacy Policy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                We believe privacy is a fundamental right. Learn how we handle and protect your information.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2>Information We Collect</h2>
            </div>
            <p>
              We prioritize data minimization. We only collect the minimal information necessary to provide an authentic, fast, and community-driven experience:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 bg-gray-50 dark:bg-[#272729] rounded-xl border border-gray-200 dark:border-[#343536] space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Account Profile
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  When you authenticate via Google OAuth, we receive your name, email address, and avatar image. We never request your Google password.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-[#272729] rounded-xl border border-gray-200 dark:border-[#343536] space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Content Submissions
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Titles, text, media links, and comments you post to public communities or chat channels, stored securely in encrypted databases.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2>How We Use Your Information</h2>
            </div>
            <p>
              We utilize collected data solely to deliver the platform features:
            </p>
            <ul className="space-y-2 text-xs pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Enforcing Fair Voting:</strong> Your authenticated user ID is recorded to ensure one vote per user and prevent manipulation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Community Moderation:</strong> Authenticating authors to prevent spam and maintain safe communities.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Zero Commercial Sale:</strong> We do NOT sell, rent, monetize, or broker your personal data to third parties or advertising brokers.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2>Data Security & Encryption</h2>
            </div>
            <p>
              All traffic between your browser and our servers is secured with TLS/HTTPS encryption. Session tokens are signed using cryptographic JWTs, and all deletion passkeys are one-way hashed with bcrypt. Content and database operations are isolated and protected against unauthorized injection.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2>Your Control & Data Deletion Rights</h2>
            </div>
            <p>
              You have complete control over your content. You may delete individual posts or comments at any time. If you wish to delete your entire presence, you can initiate a complete purge via the <Link href="/settings" className="text-[#ff4500] hover:underline font-semibold">Settings Page</Link>, which immediately deletes your files, comments, and interactions from MongoDB.
            </p>
          </section>
        </div>

        {/* Footer info box */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#121213] border-t border-gray-200 dark:border-[#343536] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-500" />
            <span>Zero trackers • Zero third-party ad brokers</span>
          </div>
          <Link href="/terms" className="text-[#ff4500] hover:underline font-semibold">
            Read User Agreement →
          </Link>
        </div>
      </div>
    </div>
  );
}
