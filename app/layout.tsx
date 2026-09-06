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
      <body className="min-h-screen flex flex-col antialiased bg-[#f5f3ec] dark:bg-[#0a0f16] text-[#1c2430] dark:text-[#e2e8f0]">
        <SessionProviderWrapper>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</main>
          <footer className="w-full bg-[#071931] text-[#d6c49e] border-t-2 border-[#c5a059] py-4 px-6 text-center text-xs font-serif select-none">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-white">THE SHREYASH FILES</span>
                <span>• DIVISION OF DIGITAL INTEGRITY</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
                <a href="/privacy" className="hover:text-white hover:underline transition-colors">
                  Privacy Policy
                </a>
                <span>|</span>
                <a href="/terms" className="hover:text-white hover:underline transition-colors">
                  Terms of Service
                </a>
              </div>
              <div className="text-[10px] text-[#dfb76c] font-mono">
                EST. 2006 • TRUTH OBSERVES ALL
              </div>
            </div>
          </footer>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
