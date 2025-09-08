from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import StockMovement, StockAlert, StockReservation


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product_link', 'variant_display', 'movement_type', 
        'quantity', 'reason', 'user_display', 'created_at'
    ]
    list_filter = ['movement_type', 'reason', 'created_at']
    search_fields = ['product__name', 'variant__sku', 'reference', 'notes']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def product_link(self, obj):
        url = reverse('admin:products_product_change', args=[obj.product.id])
        return format_html('<a href="{}">{}</a>', url, obj.product.name)
    product_link.short_description = 'Producto'
    
    def variant_display(self, obj):
        if obj.variant:
            return str(obj.variant)
        return '-'
    variant_display.short_description = 'Variante'
    
    def user_display(self, obj):
        if obj.user:
            return obj.user.full_name
        return '-'
    user_display.short_description = 'Usuario'


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product_link', 'variant_display', 'alert_type', 
        'status', 'current_quantity', 'threshold_quantity', 'created_at'
    ]
    list_filter = ['alert_type', 'status', 'created_at']
    search_fields = ['product__name', 'variant__sku', 'message']
    readonly_fields = ['created_at', 'acknowledged_at']
    ordering = ['-created_at']
    
    actions = ['acknowledge_alerts', 'resolve_alerts']
    
    def product_link(self, obj):
        url = reverse('admin:products_product_change', args=[obj.product.id])
        return format_html('<a href="{}">{}</a>', url, obj.product.name)
    product_link.short_description = 'Producto'
    
    def variant_display(self, obj):
        if obj.variant:
            return str(obj.variant)
        return '-'
    variant_display.short_description = 'Variante'
    
    def acknowledge_alerts(self, request, queryset):
        for alert in queryset:
            alert.acknowledge(request.user)
        self.message_user(request, f'{queryset.count()} alertas reconocidas.')
    acknowledge_alerts.short_description = 'Reconocer alertas seleccionadas'
    
    def resolve_alerts(self, request, queryset):
        for alert in queryset:
            alert.resolve()
        self.message_user(request, f'{queryset.count()} alertas resueltas.')
    resolve_alerts.short_description = 'Resolver alertas seleccionadas'


@admin.register(StockReservation)
class StockReservationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'product_link', 'variant_display', 'user_display', 
        'quantity', 'status', 'is_expired_display', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'expires_at']
    search_fields = ['product__name', 'variant__sku', 'user__email']
    readonly_fields = ['created_at', 'consumed_at']
    ordering = ['-created_at']
    
    actions = ['consume_reservations', 'cancel_reservations']
    
    def product_link(self, obj):
        url = reverse('admin:products_product_change', args=[obj.product.id])
        return format_html('<a href="{}">{}</a>', url, obj.product.name)
    product_link.short_description = 'Producto'
    
    def variant_display(self, obj):
        if obj.variant:
            return str(obj.variant)
        return '-'
    variant_display.short_description = 'Variante'
    
    def user_display(self, obj):
        return obj.user.full_name
    user_display.short_description = 'Usuario'
    
    def is_expired_display(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">Expirada</span>')
        return format_html('<span style="color: green;">Activa</span>')
    is_expired_display.short_description = 'Estado'
    
    def consume_reservations(self, request, queryset):
        for reservation in queryset:
            reservation.consume()
        self.message_user(request, f'{queryset.count()} reservas consumidas.')
    consume_reservations.short_description = 'Consumir reservas seleccionadas'
    
    def cancel_reservations(self, request, queryset):
        for reservation in queryset:
            reservation.cancel()
        self.message_user(request, f'{queryset.count()} reservas canceladas.')
    cancel_reservations.short_description = 'Cancelar reservas seleccionadas'
