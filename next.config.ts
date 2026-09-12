import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // small Docker image for Dokploy
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
};

export default nextConfig;
