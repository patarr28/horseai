import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Festival Whisperer 3.0 | AI Cheltenham Betting Command Centre",
  description:
    "The smartest Cheltenham betting assistant — AI insights, market signals, pundit sentiment, and value bets in one command centre.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Festival Whisperer",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-terminal-bg text-text-primary`}
      >
        <div className="mx-auto min-h-screen max-w-lg pb-20">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
