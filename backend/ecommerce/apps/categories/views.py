from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.db.models import Count, Q
from ecommerce.apps.products.models import Product

from .models import Category, Brand, Size, Color
from .serializers import (
    CategorySerializer, BrandSerializer, SizeSerializer, ColorSerializer
)


# @method_decorator(cache_page(60 * 30), name='dispatch')  # Cache por 30 minutos - TEMPORALMENTE DESHABILITADO
class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías.
    Optimizado con caché y select_related.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'created_at']
    ordering = ['sort_order', 'name']
    
    def get_queryset(self):
        """
        Retorna categorías activas, opcionalmente filtradas por padre.
        """
        queryset = Category.objects.filter(is_active=True)
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_gender(self, request):
        """
        Obtener categorías filtradas por género con conteo de productos.
        """
        gender = request.query_params.get('gender', 'unisex')
        
        # Mapear géneros del frontend al backend
        gender_mapping = {
            'men': 'masculino',
            'women': 'femenino',
            'unisex': 'unisex'
        }
        
        backend_gender = gender_mapping.get(gender, 'unisex')
        
        # Obtener categorías que tienen productos del género especificado
        categories = Category.objects.filter(
            is_active=True,
            products__gender__in=[backend_gender, 'unisex'],  # Incluir unisex en todos
            products__status='published'  # Solo productos publicados
        ).annotate(
            product_count=Count('products', filter=Q(
                products__gender__in=[backend_gender, 'unisex'],
                products__status='published'
            ))
        ).filter(
            product_count__gt=0  # Solo categorías con productos
        ).distinct().order_by('sort_order', 'name')
        
        # Serializar con conteo de productos
        serializer = self.get_serializer(categories, many=True)
        data = serializer.data
        
        # Agregar conteo de productos a cada categoría
        for i, category in enumerate(categories):
            data[i]['product_count'] = category.product_count
        
        return Response(data)


# @method_decorator(cache_page(60 * 30), name='dispatch')  # Cache por 30 minutos - TEMPORALMENTE DESHABILITADO
class BrandViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar marcas.
    Optimizado con caché.
    """
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class SizeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar tallas.
    """
    queryset = Size.objects.filter(is_active=True)
    serializer_class = SizeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type']
    ordering_fields = ['sort_order', 'name']
    ordering = ['type', 'sort_order', 'name']
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Obtener tallas por tipo (clothing, shoes, accessories).
        """
        size_type = request.query_params.get('type', 'clothing')
        sizes = self.get_queryset().filter(type=size_type)
        serializer = self.get_serializer(sizes, many=True)
        return Response(serializer.data)


class ColorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar colores.
    """
    queryset = Color.objects.filter(is_active=True)
    serializer_class = ColorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['sort_order', 'name']
    ordering = ['sort_order', 'name']