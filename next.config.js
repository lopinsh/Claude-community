/** @type {import('next').NextConfig} */
const nextConfig = {
    // App directory is now stable in Next.js 14, no experimental flag needed
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'placehold.co',
        },
      ],
    },
  }

  module.exports = nextConfig
  