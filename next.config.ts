import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export'
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
