import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pillar — Engineering Intelligence & Issue Tracking",
  description: "The purpose-built, high-velocity project management platform for focused software engineering teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#08090A] text-[#F4F4F6] selection:bg-[#5E6AD2]/35 selection:text-white relative">
        {/* Signature Linear Top Ambient Glow Mesh */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[340px] bg-gradient-to-b from-[#5E6AD2]/12 via-[#5E6AD2]/[0.02] to-transparent blur-[120px] pointer-events-none z-0" />
        
        <Providers>
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
