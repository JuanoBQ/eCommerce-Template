from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Payment.
    """
    list_display = [
        'payment_id', 'order_number', 'user_email', 'method', 
        'status', 'amount', 'currency', 'created_at'
    ]
    list_filter = [
        'method', 'status', 'currency', 'created_at', 'updated_at'
    ]
    search_fields = [
        'payment_id', 'order__order_number', 'user__email', 
        'provider_transaction_id', 'reference_id'
    ]
    readonly_fields = [
        'payment_id', 'uuid', 'user', 'order', 'amount', 'currency', 
        'created_at', 'updated_at', 'provider_response', 'is_successful'
    ]
    
    fieldsets = (
        (_('Información del pago'), {
            'fields': ('payment_id', 'uuid', 'user', 'order', 'method')
        }),
        (_('Montos'), {
            'fields': ('amount', 'currency', 'fee_amount')
        }),
        (_('Estado'), {
            'fields': ('status', 'is_successful')
        }),
        (_('Proveedor de pago'), {
            'fields': ('provider', 'provider_transaction_id', 'reference_id'),
            'classes': ('collapse',)
        }),
        (_('Respuesta del proveedor'), {
            'fields': ('provider_response',),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def order_number(self, obj):
        """
        Muestra el número de orden.
        """
        if obj.order:
            return obj.order.order_number
        return '-'
    order_number.short_description = _('Número de orden')
    
    def user_email(self, obj):
        """
        Muestra el email del usuario.
        """
        if obj.user:
            return obj.user.email
        elif obj.order and obj.order.user:
            return obj.order.user.email
        elif obj.order:
            return obj.order.email
        return '-'
    user_email.short_description = _('Email')
    
    def is_successful(self, obj):
        """
        Indica si el pago fue exitoso.
        """
        is_success = obj.status in ['completed', 'approved']
        if is_success:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Exitoso</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Fallido</span>'
            )
    is_successful.short_description = _('Estado del pago')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'order')
    
    actions = ['mark_as_completed', 'mark_as_failed', 'mark_as_refunded']
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
        self.message_user(request, f"{queryset.count()} pagos marcados como 'Completado'.")
    mark_as_completed.short_description = _("Marcar como 'Completado'")
    
    def mark_as_failed(self, request, queryset):
        queryset.update(status='failed')
        self.message_user(request, f"{queryset.count()} pagos marcados como 'Fallido'.")
    mark_as_failed.short_description = _("Marcar como 'Fallido'")
    
    def mark_as_refunded(self, request, queryset):
        queryset.update(status='refunded')
        self.message_user(request, f"{queryset.count()} pagos marcados como 'Reembolsado'.")
    mark_as_refunded.short_description = _("Marcar como 'Reembolsado'")
    
    def has_add_permission(self, request):
        # Los pagos normalmente se crean automáticamente, no manualmente
        return False
