import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialAI Manager – AI-Powered Social Media Management",
  description:
    "Generate viral content, schedule posts, track analytics, and grow your social media with AI.",
  keywords: ["social media", "AI", "content creation", "scheduling", "analytics"],
  openGraph: {
    title: "SocialAI Manager",
    description: "AI-Powered Social Media Management Platform",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
