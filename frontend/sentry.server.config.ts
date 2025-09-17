import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Configuración de performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración de errores
  debug: process.env.NODE_ENV === 'development',
  attachStacktrace: true,
  
  // Filtros de errores
  beforeSend(event, hint) {
    // Filtrar datos sensibles del servidor
    if (event.request) {
        // Filtrar headers sensibles
        if (event.request?.headers) {
          const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
          sensitiveHeaders.forEach(header => {
            if (event.request?.headers?.[header]) {
              event.request.headers[header] = '[FILTERED]'
            }
          })
        }
    }
    
    return event
  },
  
  // Configuración de integraciones
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  
  // Configuración de release
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Configuración de contexto
  initialScope: {
    tags: {
      component: 'frontend-server',
      framework: 'nextjs',
    },
  },
})
