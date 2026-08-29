import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteLinks from "@/components/SiteLinks";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SIHAG AI STUDIO — Browser Image Editor",
    template: "%s | SIHAG AI STUDIO",
  },
  description:
    "A modern browser-based image editor with layers, masks, selections, color adjustments, retouching, project recovery, and flexible export tools.",
  applicationName: "SIHAG AI STUDIO",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-7076692916715736"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <SiteLinks />
      </body>
    </html>
  );
}
