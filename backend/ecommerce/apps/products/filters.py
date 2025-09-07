import django_filters
from django.db.models import Q, F
from .models import Product
from ecommerce.apps.categories.models import Category, Brand


class ProductFilter(django_filters.FilterSet):
    """
    Filtros para productos.
    """
    # Filtros básicos - soporte para múltiples valores
    category = django_filters.BaseInFilter(field_name='category', lookup_expr='in')
    brand = django_filters.BaseInFilter(field_name='brand', lookup_expr='in')
    gender = django_filters.BaseInFilter(field_name='gender', lookup_expr='in')
    
    # Filtros de precio
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    price_range = django_filters.RangeFilter(field_name='price')
    
    # Filtros de estado
    is_featured = django_filters.BooleanFilter()
    status = django_filters.ChoiceFilter(choices=Product.PRODUCT_STATUS)
    
    # Filtros de inventario
    is_in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    
    # Filtro de ofertas
    sale = django_filters.BooleanFilter(method='filter_sale')
    
    # Filtros de búsqueda
    search = django_filters.CharFilter(method='filter_search')
    
    # Filtros de fecha
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = {
            'name': ['icontains', 'exact'],
            'sku': ['icontains', 'exact'],
            'description': ['icontains'],
        }
    
    def filter_in_stock(self, queryset, name, value):
        """
        Filtrar productos en stock.
        """
        if value:
            return queryset.filter(inventory_quantity__gt=0)
        else:
            return queryset.filter(inventory_quantity=0)
    
    def filter_sale(self, queryset, name, value):
        """
        Filtrar productos en oferta (con precio de comparación).
        """
        if value:
            return queryset.filter(compare_price__isnull=False, compare_price__gt=F('price'))
        return queryset
    
    def filter_search(self, queryset, name, value):
        """
        Búsqueda en múltiples campos.
        """
        if value:
            return queryset.filter(
                Q(name__icontains=value) |
                Q(description__icontains=value) |
                Q(sku__icontains=value) |
                Q(category__name__icontains=value) |
                Q(brand__name__icontains=value)
            ).distinct()
        return queryset
