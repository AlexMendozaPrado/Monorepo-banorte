/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar salida standalone para despliegues Docker
  // Esto crea una carpeta .next/standalone mínima con solo los archivos requeridos
  output: 'standalone',

  // Deshabilitar errores de generación de páginas estáticas
  staticPageGenerationTimeout: 1000,

  // Omitir generación estática en tiempo de compilación para rutas problemáticas
  skipTrailingSlashRedirect: true,

  // Deshabilitar optimización estática automática
  // Esto previene que Next.js intente pre-renderizar páginas durante la compilación
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  typescript: {
    // !! ADVERTENCIA !!
    // Permitir peligrosamente que las compilaciones de producción se completen exitosamente incluso si
    // tu proyecto tiene errores de tipos.
    // !! ADVERTENCIA !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Advertencia: Esto permite que las compilaciones de producción se completen exitosamente incluso si
    // tu proyecto tiene errores de ESLint.
    ignoreDuringBuilds: true,
  },

  // Transpilar paquetes de Material-UI para corregir errores de pre-renderizado
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

  // Optimizar para compilaciones de producción
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
