/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io'],
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
