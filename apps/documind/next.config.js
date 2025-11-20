/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@banorte/landing-page'],
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    // Configurar optimización de imágenes para logos
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache de 1 año para logos
    minimumCacheTTL: 31536000,
  },
};

module.exports = nextConfig;
