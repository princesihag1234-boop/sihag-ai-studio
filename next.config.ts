import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // Generate a fully static site for Cloudflare Pages.
  output: "export",

  // Produce folder-based routes such as /about/index.html.
  trailingSlash: true,

  // Required if Next/Image is used in a static export.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
