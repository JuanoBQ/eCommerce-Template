from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los propietarios editar sus objetos.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para el propietario del objeto
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los administradores editar objetos.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para administradores
        return request.user and request.user.is_staff


class IsVendorOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los vendedores editar sus productos.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para vendedores
        return request.user and request.user.is_vendor


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo al propietario o administradores.
    """
    
    def has_object_permission(self, request, view, obj):
        # Administradores tienen acceso completo
        if request.user and request.user.is_staff:
            return True
        
        # Propietarios pueden acceder a sus objetos
        return obj.user == request.user


class IsCustomerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los clientes realizar ciertas acciones.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para clientes autenticados
        return request.user and request.user.is_authenticated and request.user.is_customer
