/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure redirects or rewrites if needed for routing to other apps
  async rewrites() {
    return [
      // Example: If deploying all apps under same domain
      // {
      //   source: '/documind/:path*',
      //   destination: 'https://documind.banorte.com/:path*',
      // },
      // {
      //   source: '/sentiment-analysis/:path*',
      //   destination: 'https://sentiment.banorte.com/:path*',
      // },
    ];
  },
}

module.exports = nextConfig
