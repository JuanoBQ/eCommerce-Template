import django_filters
from django.db.models import Q
from .models import Product
from ecommerce.apps.categories.models import Category


class ProductFilter(django_filters.FilterSet):
    """
    Filtros para productos.
    """
    # Filtros básicos
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.filter(is_active=True))
    
    # Filtros de precio
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    price_range = django_filters.RangeFilter(field_name='price')
    
    # Filtros de estado
    is_featured = django_filters.BooleanFilter()
    status = django_filters.ChoiceFilter(choices=Product.PRODUCT_STATUS)
    
    # Filtros de inventario
    is_in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    
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
