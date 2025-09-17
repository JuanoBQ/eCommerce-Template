const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,
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
