import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://departmentofjustice.onrender.com"),
  title: {
    default: "Shreyash Files",
    template: "%s | Shreyash Files",
  },
  description: "Official federal classified intelligence repository documenting incidents, multi-game virtual simulations, audio intercepts, and subject dossiers.",
  keywords: [
    "Shreyash Files",
    "Shreyash",
    "Department of Justice",
    "Central Repository",
    "Incident Dossiers",
    "Intelligence Vault",
    "Federal Parody Archive",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "Fl7he5CTM-WfEmkaxKGSP_kO1Zv4c50Y572CWl7GnTU",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Shreyash Files - Central Intelligence Archive",
    description: "Official federal classified intelligence repository documenting incidents, audio wiretaps, and subject dossiers.",
    url: "https://departmentofjustice.onrender.com",
    siteName: "The Shreyash Files",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyash Files",
    description: "Official federal classified intelligence repository.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased bg-[#f6f7f8] dark:bg-[#0e1113] text-[#111827] dark:text-[#d7dadc] transition-colors duration-200">
        <SessionProviderWrapper>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">{children}</main>
          <footer className="w-full bg-white dark:bg-[#1a1a1b] text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-[#343536] py-5 px-6 text-xs select-none">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-gray-900 dark:text-white">The Shreyash Files</span>
                <span>• Modern Memory Archive</span>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
                <span>•</span>
                <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </div>
              <div className="text-[11px] text-gray-400">
                © 2026 The Shreyash Files
              </div>
            </div>
          </footer>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
