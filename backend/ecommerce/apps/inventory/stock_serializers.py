"""
Serializers para el sistema de stock en tiempo real.
"""

from rest_framework import serializers
from .models import StockMovement, StockReservation, StockAlert
from ecommerce.apps.products.models import Product, ProductVariant


class StockMovementSerializer(serializers.ModelSerializer):
    """
    Serializer para movimientos de stock.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_name = serializers.SerializerMethodField()
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'variant', 'product_name', 'variant_name',
            'movement_type', 'movement_type_display', 'reason', 'reason_display',
            'quantity', 'reference', 'notes', 'user', 'user_name',
            'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_variant_name(self, obj):
        """Obtiene el nombre de la variante."""
        if obj.variant:
            return str(obj.variant)
        return None
    
    def get_user_name(self, obj):
        """Obtiene el nombre del usuario."""
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return None


class StockReservationSerializer(serializers.ModelSerializer):
    """
    Serializer para reservas de stock.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_expired = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = StockReservation
        fields = [
            'id', 'product', 'variant', 'product_name', 'variant_name',
            'quantity', 'status', 'status_display', 'is_expired', 'time_remaining',
            'order', 'created_at', 'expires_at', 'consumed_at'
        ]
        read_only_fields = ['id', 'created_at', 'consumed_at']
    
    def get_variant_name(self, obj):
        """Obtiene el nombre de la variante."""
        if obj.variant:
            return str(obj.variant)
        return None
    
    def get_is_expired(self, obj):
        """Verifica si la reserva está expirada."""
        from django.utils import timezone
        return obj.expires_at < timezone.now()
    
    def get_time_remaining(self, obj):
        """Obtiene el tiempo restante hasta la expiración."""
        from django.utils import timezone
        if obj.status == 'active':
            remaining = obj.expires_at - timezone.now()
            if remaining.total_seconds() > 0:
                return int(remaining.total_seconds() / 60)  # Minutos
        return 0


class StockAlertSerializer(serializers.ModelSerializer):
    """
    Serializer para alertas de stock.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_name = serializers.SerializerMethodField()
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    resolved_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StockAlert
        fields = [
            'id', 'product', 'variant', 'product_name', 'variant_name',
            'title', 'description', 'alert_type', 'alert_type_display',
            'level', 'level_display', 'current_stock', 'threshold',
            'is_resolved', 'resolved_at', 'resolved_by', 'resolved_by_name',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_variant_name(self, obj):
        """Obtiene el nombre de la variante."""
        if obj.variant:
            return str(obj.variant)
        return None
    
    def get_resolved_by_name(self, obj):
        """Obtiene el nombre del usuario que resolvió la alerta."""
        if obj.resolved_by:
            return f"{obj.resolved_by.first_name} {obj.resolved_by.last_name}".strip() or obj.resolved_by.username
        return None


class StockSummarySerializer(serializers.Serializer):
    """
    Serializer para resumen de stock.
    """
    total_products = serializers.IntegerField()
    in_stock = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    out_of_stock = serializers.IntegerField()
    products = serializers.ListField(child=serializers.DictField())


class StockValidationSerializer(serializers.Serializer):
    """
    Serializer para validación de stock.
    """
    valid = serializers.BooleanField()
    items = serializers.ListField(child=serializers.DictField())
    errors = serializers.ListField(child=serializers.CharField())
    warnings = serializers.ListField(child=serializers.CharField())


class StockAvailabilitySerializer(serializers.Serializer):
    """
    Serializer para disponibilidad de stock.
    """
    is_available = serializers.BooleanField()
    available_stock = serializers.IntegerField()
    message = serializers.CharField()
    warnings = serializers.ListField(child=serializers.CharField(), required=False)


class StockReservationRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar reserva de stock.
    """
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)
    expires_in_minutes = serializers.IntegerField(min_value=1, max_value=1440, default=30)
    
    def validate_product_id(self, value):
        """Valida que el producto exista."""
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado")
        return value
    
    def validate_variant_id(self, value):
        """Valida que la variante exista y pertenezca al producto."""
        if value:
            product_id = self.initial_data.get('product_id')
            if product_id:
                try:
                    ProductVariant.objects.get(id=value, product_id=product_id)
                except ProductVariant.DoesNotExist:
                    raise serializers.ValidationError("Variante no encontrada o no pertenece al producto")
        return value


class StockItemValidationSerializer(serializers.Serializer):
    """
    Serializer para validar items de stock.
    """
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)
    
    def validate_product_id(self, value):
        """Valida que el producto exista."""
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado")
        return value
    
    def validate_variant_id(self, value):
        """Valida que la variante exista y pertenezca al producto."""
        if value:
            product_id = self.initial_data.get('product_id')
            if product_id:
                try:
                    ProductVariant.objects.get(id=value, product_id=product_id)
                except ProductVariant.DoesNotExist:
                    raise serializers.ValidationError("Variante no encontrada o no pertenece al producto")
        return value
