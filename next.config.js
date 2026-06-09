/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { cpus: 1 },
  images: {
    unoptimized: true,
  },
  outputFileTracing: false,
  // REMOVED output: 'export' to fully allow Vercel dynamic ISR layers to function
};

module.exports = nextConfig;
