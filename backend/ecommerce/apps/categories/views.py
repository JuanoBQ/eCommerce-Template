from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Category, Brand, Size, Color
from .serializers import (
    CategorySerializer, BrandSerializer, SizeSerializer, ColorSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías.
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


class BrandViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar marcas.
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