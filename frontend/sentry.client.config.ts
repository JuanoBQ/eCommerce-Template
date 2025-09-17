import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Configuración de performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración de errores
  debug: process.env.NODE_ENV === 'development',
  attachStacktrace: true,
  
  // Filtros de errores
  beforeSend(event, hint) {
    // Filtrar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event:', event)
    }
    
    // Filtrar datos sensibles
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
      
      // Filtrar query parameters sensibles
      if (event.request?.query_string) {
        const queryString = event.request.query_string
        if (typeof queryString === 'string') {
          const sensitiveParams = ['password', 'token', 'key', 'secret']
          sensitiveParams.forEach(param => {
            if (queryString.includes(param)) {
              if (event.request) {
                event.request.query_string = queryString.replace(
                  new RegExp(`${param}=[^&]*`, 'g'),
                  `${param}=[FILTERED]`
                )
              }
            }
          })
        }
      }
    }
    
    return event
  },
  
  // Configuración de integraciones
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Configurar replay de sesiones
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Configuración de release
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Configuración de contexto
  initialScope: {
    tags: {
      component: 'frontend',
      framework: 'nextjs',
    },
  },
})
