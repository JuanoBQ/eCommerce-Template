"""
Middleware para Content Security Policy (CSP) con nonces dinámicos.
Implementa CSP estricto para prevenir ataques XSS.
"""

from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from .key_generator import generate_csp_nonce


class CSPMiddleware(MiddlewareMixin):
    """
    Middleware para Content Security Policy con nonces dinámicos.
    Genera un nonce único por request para scripts y estilos inline.
    """
    
    def process_request(self, request):
        """Genera nonce único para el request."""
        # Generar nonce único para este request
        request.csp_nonce = generate_csp_nonce()
        return None
    
    def process_response(self, request, response):
        """Añade headers CSP al response."""
        if not hasattr(request, 'csp_nonce'):
            request.csp_nonce = generate_csp_nonce()
        
        # Configuración CSP estricta
        csp_directives = [
            f"default-src 'self'",
            f"script-src 'self' 'nonce-{request.csp_nonce}' 'unsafe-inline' https://js.stripe.com https://sdk.mercadopago.com https://checkout.wompi.co",
            f"style-src 'self' 'nonce-{request.csp_nonce}' 'unsafe-inline' https://fonts.googleapis.com",
            f"font-src 'self' https://fonts.gstatic.com",
            f"img-src 'self' data: https: blob:",
            f"connect-src 'self' https://api.stripe.com https://api.mercadopago.com https://production.wompi.co https://sandbox.wompi.co",
            f"frame-src 'self' https://js.stripe.com https://checkout.wompi.co https://www.mercadopago.com",
            f"object-src 'none'",
            f"base-uri 'self'",
            f"form-action 'self'",
            f"frame-ancestors 'none'",
            f"upgrade-insecure-requests",
        ]
        
        # Añadir header CSP
        response['Content-Security-Policy'] = '; '.join(csp_directives)
        
        # Headers de seguridad adicionales
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        return response


def get_csp_nonce(request):
    """
    Función helper para obtener el nonce CSP del request.
    Útil en templates y vistas.
    """
    return getattr(request, 'csp_nonce', '')
