from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from .models import Order, OrderItem, OrderNote


class OrderItemInline(admin.TabularInline):
    """
    Inline para items de la orden.
    """
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price', 'product_name', 'product_sku']
    fields = ['product', 'variant', 'quantity', 'unit_price', 'total_price', 'product_name', 'product_sku']
    
    def has_add_permission(self, request, obj=None):
        # No permitir agregar items desde el admin una vez creada la orden
        return False


class OrderNoteInline(admin.TabularInline):
    """
    Inline para notas de la orden.
    """
    model = OrderNote
    extra = 1
    fields = ['note', 'is_public', 'created_by']
    readonly_fields = ['created_by', 'created_at']
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Order.
    """
    list_display = [
        'order_number', 'user_email', 'status', 'payment_status', 
        'total_amount', 'total_items', 'created_at'
    ]
    list_filter = [
        'status', 'payment_status', 'created_at', 'updated_at'
    ]
    search_fields = [
        'order_number', 'uuid', 'user__email', 'email', 
        'shipping_first_name', 'shipping_last_name'
    ]
    readonly_fields = [
        'order_number', 'uuid', 'user', 'subtotal', 'tax_amount', 
        'shipping_amount', 'discount_amount', 'total_amount', 
        'total_items', 'created_at', 'updated_at', 'is_paid', 
        'can_be_cancelled'
    ]
    inlines = [OrderItemInline, OrderNoteInline]
    
    fieldsets = (
        (_('Información de la orden'), {
            'fields': ('order_number', 'uuid', 'user', 'email', 'phone')
        }),
        (_('Estado'), {
            'fields': ('status', 'payment_status', 'tracking_number')
        }),
        (_('Dirección de envío'), {
            'fields': (
                'shipping_first_name', 'shipping_last_name', 'shipping_address',
                'shipping_city', 'shipping_state', 'shipping_country', 'shipping_postal_code'
            ),
            'classes': ('collapse',)
        }),
        (_('Dirección de facturación'), {
            'fields': (
                'billing_first_name', 'billing_last_name', 'billing_address',
                'billing_city', 'billing_state', 'billing_country', 'billing_postal_code'
            ),
            'classes': ('collapse',)
        }),
        (_('Totales'), {
            'fields': ('subtotal', 'tax_amount', 'shipping_amount', 'discount_amount', 'total_amount')
        }),
        (_('Notas y seguimiento'), {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        (_('Fechas importantes'), {
            'fields': ('created_at', 'updated_at', 'shipped_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
        (_('Estado calculado'), {
            'fields': ('total_items', 'is_paid', 'can_be_cancelled'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        """
        Muestra el email del usuario o el email de la orden.
        """
        if obj.user:
            return obj.user.email
        return obj.email
    user_email.short_description = _('Email')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items')
    
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']
    
    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
        self.message_user(request, f"{queryset.count()} órdenes marcadas como 'En proceso'.")
    mark_as_processing.short_description = _("Marcar como 'En proceso'")
    
    def mark_as_shipped(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='shipped', shipped_at=timezone.now())
        self.message_user(request, f"{queryset.count()} órdenes marcadas como 'Enviado'.")
    mark_as_shipped.short_description = _("Marcar como 'Enviado'")
    
    def mark_as_delivered(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='delivered', delivered_at=timezone.now())
        self.message_user(request, f"{queryset.count()} órdenes marcadas como 'Entregado'.")
    mark_as_delivered.short_description = _("Marcar como 'Entregado'")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo OrderItem.
    """
    list_display = ['order', 'product', 'variant', 'quantity', 'unit_price', 'total_price']
    list_filter = ['order__status', 'order__created_at']
    search_fields = ['order__order_number', 'product__name', 'product_name']
    raw_id_fields = ['order', 'product', 'variant']
    readonly_fields = ['total_price', 'product_name', 'product_sku', 'variant_info']
    
    fieldsets = (
        (_('Orden'), {
            'fields': ('order',)
        }),
        (_('Producto'), {
            'fields': ('product', 'variant', 'product_name', 'product_sku', 'variant_info')
        }),
        (_('Cantidad y precios'), {
            'fields': ('quantity', 'unit_price', 'total_price')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('order', 'product', 'variant')


@admin.register(OrderNote)
class OrderNoteAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo OrderNote.
    """
    list_display = ['order', 'note_preview', 'is_public', 'created_by', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['order__order_number', 'note']
    raw_id_fields = ['order', 'created_by']
    readonly_fields = ['created_at']
    
    def note_preview(self, obj):
        """
        Muestra una vista previa de la nota.
        """
        return obj.note[:50] + "..." if len(obj.note) > 50 else obj.note
    note_preview.short_description = _('Nota')
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
