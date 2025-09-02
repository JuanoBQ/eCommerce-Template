from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from .models import Category, Brand, Size, Color


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Category.
    """
    list_display = ['name', 'slug', 'parent', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'product_count']
    
    fieldsets = (
        (_('Información básica'), {
            'fields': ('name', 'slug', 'description', 'parent')
        }),
        (_('Imagen'), {
            'fields': ('image',)
        }),
        (_('SEO'), {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        (_('Estado'), {
            'fields': ('is_active',)
        }),
        (_('Estadísticas'), {
            'fields': ('product_count',),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """
        Muestra el número de productos en esta categoría.
        """
        count = obj.products.count()
        return count
    product_count.short_description = _('Productos')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent')
    
    class Media:
        css = {
            'all': ('admin/css/category_admin.css',)
        }


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Brand.
    """
    list_display = ['name', 'slug', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'product_count']
    
    fieldsets = (
        (_('Información básica'), {
            'fields': ('name', 'slug', 'description', 'website')
        }),
        (_('Logo'), {
            'fields': ('logo',)
        }),
        (_('SEO'), {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        (_('Configuración'), {
            'fields': ('is_active', 'sort_order')
        }),
        (_('Estadísticas'), {
            'fields': ('product_count',),
            'classes': ('collapse',)
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def product_count(self, obj):
        """
        Muestra el número de productos de esta marca.
        """
        count = obj.products.count()
        return count
    product_count.short_description = _('Productos')


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Size.
    """
    list_display = ['name', 'type', 'sort_order', 'is_active', 'created_at']
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Información básica'), {
            'fields': ('name', 'type')
        }),
        (_('Configuración'), {
            'fields': ('sort_order', 'is_active')
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Color.
    """
    list_display = ['name', 'hex_code', 'color_preview', 'sort_order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'hex_code']
    readonly_fields = ['created_at', 'updated_at', 'color_preview']
    
    fieldsets = (
        (_('Información básica'), {
            'fields': ('name', 'hex_code', 'color_preview')
        }),
        (_('Configuración'), {
            'fields': ('sort_order', 'is_active')
        }),
        (_('Fechas'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def color_preview(self, obj):
        """
        Muestra una vista previa del color.
        """
        if obj.hex_code:
            return format_html(
                '<div style="width: 30px; height: 30px; background-color: {}; border: 1px solid #ccc; border-radius: 3px;"></div>',
                obj.hex_code
            )
        return "Sin color"
    color_preview.short_description = _('Vista previa')
