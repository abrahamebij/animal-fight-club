import type { Metadata } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

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
  title: "Animal Fight Club | AI Combat & Market Pulse Arena",
  description: "Create AI-agent beasts, battle in LLM-reasoned combat, and wager with live DreamDEX Event Contract market odds on Somnia Shannon testnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#0A0A0B] font-sans selection:bg-[#0A0A0B] selection:text-[#FAFAF8]">
        <Navbar />
        <div className="flex-1 pt-16 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
