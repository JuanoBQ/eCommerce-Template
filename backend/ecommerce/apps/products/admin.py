from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Product, ProductVariant, ProductImage, ProductReview
from ecommerce.apps.categories.models import Brand


class ProductImageInline(admin.TabularInline):
    """
    Inline para imágenes del producto.
    """
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = _('Preview')


class ProductVariantInline(admin.TabularInline):
    """
    Inline para variantes del producto.
    """
    model = ProductVariant
    extra = 1
    fields = ['size', 'color', 'sku', 'price', 'inventory_quantity', 'is_active']



@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Product.
    """
    list_display = ['name', 'brand', 'category', 'price', 'inventory_quantity', 'status', 'is_featured', 'created_at']
    list_filter = ['status', 'is_featured', 'brand', 'category', 'created_at']
    search_fields = ['name', 'description', 'sku']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'published_at']
    inlines = [ProductImageInline, ProductVariantInline]
    
    fieldsets = (
        (_('Información básica'), {
            'fields': ('name', 'slug', 'description', 'short_description', 'brand', 'category', 'gender')
        }),
        (_('Precios e inventario'), {
            'fields': ('price', 'compare_price', 'cost_price', 'sku', 'inventory_quantity', 'track_inventory', 'low_stock_threshold', 'allow_backorder')
        }),
        (_('Configuración'), {
            'fields': ('status', 'is_featured', 'is_digital', 'requires_shipping', 'weight')
        }),
        (_('SEO'), {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('brand', 'category')


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo ProductVariant.
    """
    list_display = ['product', 'size', 'color', 'sku', 'price', 'inventory_quantity', 'is_active']
    list_filter = ['size', 'color', 'is_active', 'product__brand']
    search_fields = ['product__name', 'sku', 'size', 'color']
    raw_id_fields = ['product']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Producto'), {
            'fields': ('product',)
        }),
        (_('Variante'), {
            'fields': ('size', 'color', 'sku', 'barcode')
        }),
        (_('Precios e inventario'), {
            'fields': ('price', 'cost_price', 'inventory_quantity', 'track_inventory')
        }),
        (_('Estado'), {
            'fields': ('is_active',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo ProductImage.
    """
    list_display = ['product', 'alt_text', 'is_primary', 'image_preview']
    list_filter = ['is_primary', 'product__brand']
    search_fields = ['product__name', 'alt_text']
    raw_id_fields = ['product']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = _('Preview')


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo ProductReview.
    """
    list_display = ['product', 'user', 'rating', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__email', 'title', 'comment']
    raw_id_fields = ['product', 'user']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Reseña'), {
            'fields': ('product', 'user', 'title', 'comment', 'rating')
        }),
        (_('Estado'), {
            'fields': ('is_approved',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} reseñas aprobadas.")
    approve_reviews.short_description = _("Aprobar reseñas seleccionadas")
    
    def disapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f"{queryset.count()} reseñas desaprobadas.")
    disapprove_reviews.short_description = _("Desaprobar reseñas seleccionadas")
