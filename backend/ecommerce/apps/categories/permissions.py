from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los administradores editar categorías.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para administradores
        return request.user and request.user.is_staff
