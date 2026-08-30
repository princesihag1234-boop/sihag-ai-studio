import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.30"],


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
