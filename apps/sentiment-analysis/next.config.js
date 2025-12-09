/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments
  // This creates a minimal .next/standalone folder with only required files
  output: 'standalone',

  // Disable static page generation errors
  staticPageGenerationTimeout: 1000,

  // Skip build-time static generation for problematic routes
  skipTrailingSlashRedirect: true,

  // Disable automatic static optimization
  // This prevents Next.js from trying to pre-render pages during build
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Transpile Material-UI packages to fix pre-rendering errors
  transpilePackages: [
    '@mui/material',
    '@mui/system',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    '@emotion/cache',
    '@banorte/landing-page',
    'recharts'
  ],

  // Optimize for production builds
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
