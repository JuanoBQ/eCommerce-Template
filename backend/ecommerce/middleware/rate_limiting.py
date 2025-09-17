"""
Middleware para rate limiting y protección contra ataques.
"""
import time
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
# TooManyRequests no existe en Django, usaremos una excepción personalizada


class RateLimitMiddleware(MiddlewareMixin):
    """
    Middleware para implementar rate limiting básico.
    """
    
    def process_request(self, request):
        """
        Verifica el rate limit antes de procesar la request.
        """
        # Solo aplicar rate limiting a la API
        if not request.path.startswith('/api/'):
            return None
        
        # Obtener IP del cliente
        client_ip = self._get_client_ip(request)
        
        # Configuración de rate limiting
        rate_limit_config = {
            '/api/auth/login/': {'requests': 5, 'window': 300},  # 5 intentos por 5 minutos
            '/api/auth/register/': {'requests': 3, 'window': 300},  # 3 registros por 5 minutos
            '/api/payments/': {'requests': 10, 'window': 60},  # 10 pagos por minuto
            'default': {'requests': 100, 'window': 60},  # 100 requests por minuto por defecto
        }
        
        # Determinar la configuración a usar
        config = None
        for path_pattern, config in rate_limit_config.items():
            if request.path.startswith(path_pattern):
                break
        else:
            config = rate_limit_config['default']
        
        # Verificar rate limit
        if not self._check_rate_limit(client_ip, request.path, config):
            return JsonResponse({
                'error': True,
                'message': 'Rate limit exceeded. Please try again later.',
                'code': 'rate_limit_exceeded',
                'retry_after': config['window']
            }, status=429)
        
        return None
    
    def _get_client_ip(self, request):
        """
        Obtiene la IP real del cliente considerando proxies.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _check_rate_limit(self, client_ip, path, config):
        """
        Verifica si el cliente ha excedido el rate limit.
        """
        # Crear clave única para esta combinación IP + path
        cache_key = f"rate_limit:{client_ip}:{path}"
        
        # Obtener el número actual de requests
        current_requests = cache.get(cache_key, 0)
        
        # Si excede el límite, denegar
        if current_requests >= config['requests']:
            return False
        
        # Incrementar contador
        if current_requests == 0:
            # Primera request en la ventana de tiempo
            cache.set(cache_key, 1, config['window'])
        else:
            # Incrementar contador existente
            cache.incr(cache_key)
        
        return True


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para agregar headers de seguridad.
    """
    
    def process_response(self, request, response):
        """
        Agrega headers de seguridad a la response.
        """
        # Headers de seguridad básicos
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # HSTS solo en HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Content Security Policy básico
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp
        
        return response


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware para logging de requests (opcional, para debugging).
    """
    
    def process_request(self, request):
        """
        Log de request entrante.
        """
        if settings.DEBUG and request.path.startswith('/api/'):
            print(f"API Request: {request.method} {request.path} from {self._get_client_ip(request)}")
    
    def process_response(self, request, response):
        """
        Log de response saliente.
        """
        if settings.DEBUG and request.path.startswith('/api/'):
            print(f"API Response: {response.status_code} for {request.method} {request.path}")
        return response
    
    def _get_client_ip(self, request):
        """
        Obtiene la IP del cliente.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
