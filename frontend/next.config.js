const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      '@tanstack/react-query'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Optimización de imágenes
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compresión
  compress: true,
  
  // Optimización de bundle
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizar imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }
    
    // Optimizar chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,
      },
    ];
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// Configuración de Sentry
const sentryWebpackPluginOptions = {
  // Configuración del plugin de webpack
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Configuración de source maps
  silent: true,
  widenClientFileUpload: true,
  
  // Configuración de release
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Configuración de debugging
  debug: process.env.NODE_ENV === 'development',
  
  // Configuración de archivos
  include: ['./src'],
  ignore: ['node_modules'],
  
  // Configuración de source maps
  sourcemaps: {
    disable: true,
  },
}

// Configuración de Sentry para runtime
const sentryOptions = {
  // Configuración de performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración de debugging
  debug: process.env.NODE_ENV === 'development',
  
  // Configuración de release
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Configuración de environment
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions, sentryOptions);
