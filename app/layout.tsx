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
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { Web3Provider } from "@/components/providers/Web3Provider";
import { WalletGateProvider } from "@/components/wallet/useWalletGate";
import { Toaster } from "sonner";

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
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-background">
        <Web3Provider>
          <WalletGateProvider>
            <Navbar />
            <div className="flex-1 pt-16 flex flex-col">
              {children}
            </div>
            <Footer />
            <Toaster 
              richColors 
              position="top-right" 
              // theme="dark"
              // toastOptions={{
              //   className: 'font-mono text-xs border border-divider bg-background text-foreground shadow-2xl',
              // }}
            />
          </WalletGateProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
