from rest_framework import permissions


class IsVendorOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los vendedores editar productos.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para vendedores autenticados
        return request.user and request.user.is_authenticated and request.user.is_vendor


class IsProductOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo al propietario del producto editarlo.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para el propietario del producto
        return obj.vendor == request.user


class IsReviewOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo al autor de la reseña editarla.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para el autor de la reseña
        return obj.user == request.user


class CanCreateReview(permissions.BasePermission):
    """
    Permiso personalizado para crear reseñas.
    """
    
    def has_permission(self, request, view):
        # Solo usuarios autenticados pueden crear reseñas
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar si el usuario ya tiene una reseña para este producto
        if request.method == 'POST':
            product_id = view.kwargs.get('product_id')
            if product_id:
                from .models import ProductReview
                existing_review = ProductReview.objects.filter(
                    product_id=product_id,
                    user=request.user
                ).exists()
                if existing_review:
                    return False
        
        return True


class CanUploadProductImages(permissions.BasePermission):
    """
    Permiso personalizado para subir imágenes de productos.
    """
    
    def has_permission(self, request, view):
        # Solo vendedores autenticados pueden subir imágenes
        return request.user and request.user.is_authenticated and request.user.is_vendor


class CanManageProductVariants(permissions.BasePermission):
    """
    Permiso personalizado para gestionar variantes de productos.
    """
    
    def has_permission(self, request, view):
        # Solo vendedores autenticados pueden gestionar variantes
        return request.user and request.user.is_authenticated and request.user.is_vendor
