"""
Middleware para limpieza automática de reservas expiradas.
"""
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from .services import InventoryService


class InventoryMiddleware(MiddlewareMixin):
    """
    Middleware que limpia las reservas expiradas en cada request.
    """
    
    def process_request(self, request):
        """
        Limpia las reservas expiradas en cada request.
        """
        try:
            # Limpiar reservas expiradas (solo una vez por sesión)
            if not hasattr(request, '_inventory_cleaned'):
                InventoryService.cleanup_expired_reservations()
                request._inventory_cleaned = True
        except Exception:
            # Si hay algún error, no interrumpir el request
            pass
