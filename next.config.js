/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Prevents build errors during static export
  }
};

module.exports = nextConfig;
