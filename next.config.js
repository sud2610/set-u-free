/** @type {import('next').NextConfig} */
const nextConfig = {
  // ==================== IMAGE OPTIMIZATION ====================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },

  // ==================== PERFORMANCE ====================
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Remove powered by header
  poweredByHeader: false,
};

module.exports = nextConfig;
