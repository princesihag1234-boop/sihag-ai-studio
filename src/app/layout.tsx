import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteLinks from "@/components/SiteLinks";
import "./globals.css";

const SITE_URL = "https://sihag-ai-studio.pages.dev";
const SITE_NAME = "SIHAG AI STUDIO";
const SITE_TITLE = "SIHAG AI STUDIO — Free Online Photo Editor";
const SITE_DESCRIPTION =
  "Edit photos online with SIHAG AI STUDIO. Use layers, text, brush tools, masks, selections, color adjustments, retouching, transforms, and flexible image export tools.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_TITLE,
    template: "%s | SIHAG AI STUDIO",
  },

  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "photo editing",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SIHAG AI STUDIO — Free Online Photo Editor",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ["SIHAG AI", "sihag-ai-studio.pages.dev"],
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og-image.png`,
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#app`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern web browser.",
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og-image.png`,
    featureList: [
      "Online photo editing",
      "Layers",
      "Text tools",
      "Brush tools",
      "Masks and selections",
      "Color adjustments",
      "Retouching",
      "Image export",
    ],
  },
];

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

        <meta
          name="google-site-verification"
          content="bvYv3JJqVrP-M6SGUMReVGO310gr10u2SWA5vA8f1FE"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        {children}
        <SiteLinks />
      </body>
    </html>
  );
}
