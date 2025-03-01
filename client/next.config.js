/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',  // Removing this line
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
