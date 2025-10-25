/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 👈 enables static export
  images: {
    unoptimized: true, // 👈 needed because GitHub Pages doesn’t support Next.js image optimization
  },
  basePath: '/pos-app', // 👈 your repo name
  assetPrefix: '/pos-app/', // 👈 so assets resolve correctly
};

export default nextConfig;