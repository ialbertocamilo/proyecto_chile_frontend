const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = withBundleAnalyzer({
...nextConfig,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  output: 'standalone',
  experimental: {
    optimizeCss: true, 
    scrollRestoration: true, 
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
});