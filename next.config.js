/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // REMOVED output: 'export' to fully allow Vercel dynamic ISR layers to function
};

module.exports = nextConfig;
