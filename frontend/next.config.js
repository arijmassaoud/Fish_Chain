// file: frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing proxy configuration for the backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },

  // --- THIS IS THE CORRECTED CONFIGURATION ---
  images: {
    remotePatterns: [
      // Entry 1: For Cloudinary (if you use it for product images)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Allows any path on this hostname
      },
      // Entry 2: For the Dicebear user avatars
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/8.x/initials/svg/**', // Allows avatars from this specific path
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment', // Recommended for security
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;