import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/**',
      },
    ],
  },
}

export default nextConfig;
