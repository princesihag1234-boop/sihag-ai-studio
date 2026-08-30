import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://sihag-ai-studio.pages.dev"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about/`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help/`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy/`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms/`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
