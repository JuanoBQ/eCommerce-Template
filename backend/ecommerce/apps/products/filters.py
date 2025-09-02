import django_filters
from django.db.models import Q
from .models import Product
from ecommerce.apps.categories.models import Category, Brand, Size, Color


class ProductFilter(django_filters.FilterSet):
    """
    Filtros para productos.
    """
    # Filtros básicos
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.filter(is_active=True))
    brand = django_filters.ModelChoiceFilter(queryset=Brand.objects.filter(is_active=True))
    
    # Filtros de precio
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    price_range = django_filters.RangeFilter(field_name='price')
    
    # Filtros de estado
    status = django_filters.ChoiceFilter(choices=Product.PRODUCT_STATUS)
    is_featured = django_filters.BooleanFilter()
    is_digital = django_filters.BooleanFilter()
    requires_shipping = django_filters.BooleanFilter()
    
    # Filtros de inventario
    is_in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    is_low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    
    # Filtros de variantes
    size = django_filters.ModelChoiceFilter(
        queryset=Size.objects.filter(is_active=True),
        method='filter_by_size'
    )
    color = django_filters.ModelChoiceFilter(
        queryset=Color.objects.filter(is_active=True),
        method='filter_by_color'
    )
    
    # Filtros de búsqueda
    search = django_filters.CharFilter(method='filter_search')
    
    # Filtros de fecha
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    published_after = django_filters.DateFilter(field_name='published_at', lookup_expr='gte')
    published_before = django_filters.DateFilter(field_name='published_at', lookup_expr='lte')
    
    # Filtros de peso
    min_weight = django_filters.NumberFilter(field_name='weight', lookup_expr='gte')
    max_weight = django_filters.NumberFilter(field_name='weight', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = {
            'name': ['icontains', 'exact'],
            'sku': ['icontains', 'exact'],
            'description': ['icontains'],
            'short_description': ['icontains'],
        }
    
    def filter_in_stock(self, queryset, name, value):
        """
        Filtrar productos en stock.
        """
        if value:
            return queryset.filter(
                Q(track_inventory=False) | Q(inventory_quantity__gt=0)
            )
        else:
            return queryset.filter(
                track_inventory=True,
                inventory_quantity=0
            )
    
    def filter_low_stock(self, queryset, name, value):
        """
        Filtrar productos con stock bajo.
        """
        if value:
            return queryset.filter(
                track_inventory=True,
                inventory_quantity__lte=django_filters.F('low_stock_threshold')
            )
        else:
            return queryset.filter(
                Q(track_inventory=False) | Q(inventory_quantity__gt=django_filters.F('low_stock_threshold'))
            )
    
    def filter_by_size(self, queryset, name, value):
        """
        Filtrar productos por talla.
        """
        return queryset.filter(variants__size=value).distinct()
    
    def filter_by_color(self, queryset, name, value):
        """
        Filtrar productos por color.
        """
        return queryset.filter(variants__color=value).distinct()
    
    def filter_search(self, queryset, name, value):
        """
        Búsqueda en múltiples campos.
        """
        if value:
            return queryset.filter(
                Q(name__icontains=value) |
                Q(description__icontains=value) |
                Q(short_description__icontains=value) |
                Q(sku__icontains=value) |
                Q(category__name__icontains=value) |
                Q(brand__name__icontains=value)
            ).distinct()
        return queryset


class ProductVariantFilter(django_filters.FilterSet):
    """
    Filtros para variantes de productos.
    """
    size = django_filters.ModelChoiceFilter(queryset=Size.objects.filter(is_active=True))
    color = django_filters.ModelChoiceFilter(queryset=Color.objects.filter(is_active=True))
    is_active = django_filters.BooleanFilter()
    is_in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    
    class Meta:
        model = ProductVariant
        fields = ['size', 'color', 'is_active']
    
    def filter_in_stock(self, queryset, name, value):
        """
        Filtrar variantes en stock.
        """
        if value:
            return queryset.filter(inventory_quantity__gt=0)
        else:
            return queryset.filter(inventory_quantity=0)


class ProductReviewFilter(django_filters.FilterSet):
    """
    Filtros para reseñas de productos.
    """
    rating = django_filters.NumberFilter()
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    max_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')
    is_verified_purchase = django_filters.BooleanFilter()
    is_approved = django_filters.BooleanFilter()
    
    class Meta:
        model = ProductReview
        fields = ['rating', 'is_verified_purchase', 'is_approved']
