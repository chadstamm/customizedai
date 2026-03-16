import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CustomizedAI | Custom Instructions for Every AI",
  description: "Create perfect custom instructions for ChatGPT, Claude, Gemini, and Perplexity — tailored to each platform's exact settings. Answer a few questions, get copy-paste ready instructions.",
  keywords: ["custom instructions", "AI settings", "ChatGPT", "Claude", "Gemini", "Perplexity", "AI personalization", "AI customization"],
  authors: [{ name: "CustomizedAI" }],
  creator: "CustomizedAI",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  metadataBase: new URL("https://customizedai.app"),
  openGraph: {
    title: "CustomizedAI | Custom Instructions for Every AI",
    description: "Answer a few questions, get copy-paste ready instructions for ChatGPT, Claude, Gemini, and Perplexity — tailored to each platform's exact fields.",
    type: "website",
    url: "https://customizedai.app",
    siteName: "CustomizedAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CustomizedAI | Custom Instructions for Every AI",
    description: "Set up your custom instructions for every AI. Free, no sign-up required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
