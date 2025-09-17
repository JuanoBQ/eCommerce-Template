"""
Middleware personalizado para integración con Sentry.
"""

import logging
import time
from django.http import JsonResponse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

try:
    import sentry_sdk
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

logger = logging.getLogger(__name__)


class SentryMiddleware(MiddlewareMixin):
    """
    Middleware para capturar errores y métricas con Sentry.
    """
    
    def process_request(self, request):
        """Procesar request y agregar contexto a Sentry."""
        # Agregar información de la request a Sentry
        if SENTRY_AVAILABLE and hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
            with sentry_sdk.push_scope() as scope:
                scope.set_context("request", {
                    "url": request.build_absolute_uri(),
                    "method": request.method,
                    "headers": dict(request.headers),
                    "user_agent": request.META.get('HTTP_USER_AGENT'),
                    "remote_addr": request.META.get('REMOTE_ADDR'),
                })
                
                # Agregar información del usuario si está autenticado
                if hasattr(request, 'user') and request.user.is_authenticated:
                    scope.set_user({
                        "id": request.user.id,
                        "email": request.user.email,
                        "username": request.user.username,
                    })
        
        return None
    
    def process_response(self, request, response):
        """Procesar response y capturar métricas."""
        # Capturar métricas de performance
        if SENTRY_AVAILABLE and hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
            # Capturar métricas de response time
            if hasattr(request, '_start_time'):
                duration = (time.time() - request._start_time) * 1000  # en ms
                sentry_sdk.set_measurement("response_time", duration, "millisecond")
            
            # Capturar información de la response
            sentry_sdk.set_context("response", {
                "status_code": response.status_code,
                "content_type": response.get('Content-Type', ''),
                "content_length": response.get('Content-Length', 0),
            })
        
        return response
    
    def process_exception(self, request, exception):
        """Capturar excepciones con contexto adicional."""
        # Log del error
        logger.error(f"Exception in {request.path}: {str(exception)}", 
                    exc_info=True, extra={'request': request})
        
        # Capturar en Sentry si está configurado
        if SENTRY_AVAILABLE and hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
            sentry_sdk.capture_exception(exception)
        
        # Para APIs, devolver JSON en lugar de HTML
        if request.path.startswith('/api/'):
            return JsonResponse({
                'error': True,
                'message': 'Error interno del servidor',
                'code': 'internal_server_error',
                'details': {}
            }, status=500)
        
        return None


class PerformanceMiddleware(MiddlewareMixin):
    """
    Middleware para medir performance de requests.
    """
    
    def process_request(self, request):
        """Iniciar medición de tiempo."""
        import time
        request._start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Finalizar medición y log de performance."""
        if hasattr(request, '_start_time'):
            import time
            duration = time.time() - request._start_time
            
            # Log de requests lentos (>1 segundo)
            if duration > 1.0:
                logger.warning(f"Slow request: {request.path} took {duration:.2f}s")
            
            # Capturar métrica en Sentry
            if hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
                import sentry_sdk
                sentry_sdk.set_measurement("request_duration", duration, "second")
        
        return response


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para agregar headers de seguridad.
    """
    
    def process_response(self, request, response):
        """Agregar headers de seguridad."""
        # Headers de seguridad
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # HSTS solo en HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # CSP básico
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        
        return response
