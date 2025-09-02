from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Cart, CartItem, Wishlist, WishlistItem


class CartItemInline(admin.TabularInline):
    """
    Inline para items del carrito.
    """
    model = CartItem
    extra = 0
    readonly_fields = ['created_at']
    fields = ['product', 'variant', 'quantity', 'created_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Cart.
    """
    list_display = ['user', 'total_items', 'total_price', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['total_items', 'total_price', 'created_at', 'updated_at']
    inlines = [CartItemInline]
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Totales'), {
            'fields': ('total_items', 'total_price')
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo CartItem.
    """
    list_display = ['cart_user', 'product', 'variant', 'quantity', 'created_at']
    list_filter = ['created_at', 'product__brand', 'product__category']
    search_fields = ['cart__user__email', 'product__name']
    raw_id_fields = ['cart', 'product', 'variant']
    readonly_fields = ['created_at']
    
    fieldsets = (
        (_('Carrito'), {
            'fields': ('cart',)
        }),
        (_('Producto'), {
            'fields': ('product', 'variant')
        }),
        (_('Cantidad'), {
            'fields': ('quantity',)
        }),
        (_('Fechas'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def cart_user(self, obj):
        """
        Muestra el usuario del carrito.
        """
        return obj.cart.user.email if obj.cart.user else 'Sin usuario'
    cart_user.short_description = _('Usuario')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('cart__user', 'product', 'variant')


class WishlistItemInline(admin.TabularInline):
    """
    Inline para items de la lista de deseos.
    """
    model = WishlistItem
    extra = 0
    readonly_fields = ['created_at']
    fields = ['product', 'created_at']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Wishlist.
    """
    list_display = ['user', 'items_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['items_count', 'created_at', 'updated_at']
    inlines = [WishlistItemInline]
    
    fieldsets = (
        (_('Usuario'), {
            'fields': ('user',)
        }),
        (_('Estadísticas'), {
            'fields': ('items_count',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def items_count(self, obj):
        """
        Muestra el número de items en la wishlist.
        """
        return obj.items.count()
    items_count.short_description = _('Items')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items')


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo WishlistItem.
    """
    list_display = ['wishlist_user', 'product', 'created_at']
    list_filter = ['created_at', 'product__brand', 'product__category']
    search_fields = ['wishlist__user__email', 'product__name']
    raw_id_fields = ['wishlist', 'product']
    readonly_fields = ['created_at']
    
    fieldsets = (
        (_('Lista de deseos'), {
            'fields': ('wishlist',)
        }),
        (_('Producto'), {
            'fields': ('product',)
        }),
        (_('Fechas'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def wishlist_user(self, obj):
        """
        Muestra el usuario de la lista de deseos.
        """
        return obj.wishlist.user.email if obj.wishlist.user else 'Sin usuario'
    wishlist_user.short_description = _('Usuario')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('wishlist__user', 'product')
