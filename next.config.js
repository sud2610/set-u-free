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
    // Cache images for 1 hour (faster repeat loads)
    minimumCacheTTL: 3600,
    // Use modern image formats
    formats: ['image/avif', 'image/webp'],
  },

  // ==================== PERFORMANCE ====================
  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Remove powered by header
  poweredByHeader: false,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
