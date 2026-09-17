import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // small Docker image for Dokploy
  allowedDevOrigins: ["*.trycloudflare.com"], // cloudflared quick tunnel for testing on other devices
  images:{ loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
};

export default nextConfig;
