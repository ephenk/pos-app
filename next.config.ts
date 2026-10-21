import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Receipt photos are resized client-side to ~300 KB each; Netlify caps
    // function payloads at ~4.5 MB of binary anyway.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
