import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.30",
    "192.168.165.228",
  ],

  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;