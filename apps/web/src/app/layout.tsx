import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Pillar // Bauhaus Edition — Form Follows Function",
  description: "Constructivist project tracking and engineering orchestration based on classical Bauhaus principles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-[#FAF6EE] text-[#121212] selection:bg-[#FBC02D] selection:text-[#121212]">
        {/* Signature Bauhaus Primary Triad Accent Bar */}
        <div className="fixed top-0 left-0 right-0 h-1.5 z-50 grid grid-cols-3">
          <div className="bg-[#D32F2F]" />
          <div className="bg-[#1976D2]" />
          <div className="bg-[#FBC02D]" />
        </div>
        <Providers>
          <div className="flex-1 flex flex-col pt-1.5">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
