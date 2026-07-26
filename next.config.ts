import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // The default Image Optimization loader is unsupported under
    // `output: 'export'`. Remote images are emitted as-is, so `remotePatterns`
    // is never consulted and is intentionally omitted.
    unoptimized: true,
  },
};

export default nextConfig;
