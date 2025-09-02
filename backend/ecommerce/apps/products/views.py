from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from django.db import transaction
from .models import Product, ProductImage, ProductVariant, ProductReview, ProductTag
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ProductImageSerializer, ProductVariantSerializer, ProductReviewSerializer,
    ProductSearchSerializer
)
from .filters import ProductFilter
from .permissions import IsVendorOrReadOnly, IsOwnerOrAdmin
from ecommerce.apps.categories.models import Category, Brand, Size, Color


class ProductListView(generics.ListCreateAPIView):
    """
    Vista para listar y crear productos.
    """
    queryset = Product.objects.filter(status='published').select_related('category', 'brand').prefetch_related('images')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'short_description', 'sku']
    ordering_fields = ['name', 'price', 'created_at', 'is_featured']
    ordering = ['-is_featured', '-created_at']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsVendorOrReadOnly()]
        return [permissions.AllowAny()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar un producto específico.
    """
    queryset = Product.objects.select_related('category', 'brand').prefetch_related(
        'images', 'variants', 'reviews', 'tags'
    )
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVendorOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer


class ProductSearchView(generics.ListAPIView):
    """
    Vista para búsqueda avanzada de productos.
    """
    serializer_class = ProductSearchSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'short_description', 'sku']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Product.objects.filter(status='published').select_related('category', 'brand').prefetch_related('images')
        
        # Filtros adicionales
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__slug=brand)
        
        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        is_featured = self.request.query_params.get('is_featured')
        if is_featured and is_featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        is_in_stock = self.request.query_params.get('is_in_stock')
        if is_in_stock and is_in_stock.lower() == 'true':
            queryset = queryset.filter(
                Q(track_inventory=False) | Q(inventory_quantity__gt=0)
            )
        
        return queryset


class ProductImageView(generics.ListCreateAPIView):
    """
    Vista para listar y crear imágenes de productos.
    """
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendorOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductImage.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = Product.objects.get(id=product_id)
        serializer.save(product=product)


class ProductImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una imagen específica.
    """
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendorOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductImage.objects.filter(product_id=product_id)


class ProductVariantView(generics.ListCreateAPIView):
    """
    Vista para listar y crear variantes de productos.
    """
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendorOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductVariant.objects.filter(product_id=product_id).select_related('size', 'color')
    
    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = Product.objects.get(id=product_id)
        serializer.save(product=product)


class ProductVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una variante específica.
    """
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendorOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductVariant.objects.filter(product_id=product_id).select_related('size', 'color')


class ProductReviewView(generics.ListCreateAPIView):
    """
    Vista para listar y crear reseñas de productos.
    """
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductReview.objects.filter(
            product_id=product_id, is_approved=True
        ).select_related('user')
    
    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = Product.objects.get(id=product_id)
        serializer.save(product=product, user=self.request.user)


class ProductReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una reseña específica.
    """
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductReview.objects.filter(product_id=product_id).select_related('user')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_products(request):
    """
    Vista para obtener productos destacados.
    """
    products = Product.objects.filter(
        status='published', is_featured=True
    ).select_related('category', 'brand').prefetch_related('images')[:8]
    
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def related_products(request, product_id):
    """
    Vista para obtener productos relacionados.
    """
    try:
        product = Product.objects.get(id=product_id)
        related_products = Product.objects.filter(
            category=product.category,
            status='published'
        ).exclude(id=product_id).select_related('category', 'brand').prefetch_related('images')[:4]
        
        serializer = ProductListSerializer(related_products, many=True)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_product_image(request, product_id):
    """
    Vista para subir imagen de producto.
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No se proporcionó archivo de imagen'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    image = request.FILES['image']
    
    # Validar tamaño del archivo (máximo 10MB)
    if image.size > 10 * 1024 * 1024:
        return Response({'error': 'El archivo es demasiado grande. Máximo 10MB.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Validar tipo de archivo
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if image.content_type not in allowed_types:
        return Response({'error': 'Tipo de archivo no válido. Solo se permiten JPG, PNG, GIF y WebP.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Crear imagen del producto
    product_image = ProductImage.objects.create(
        product=product,
        image=image,
        alt_text=request.data.get('alt_text', ''),
        sort_order=request.data.get('sort_order', 0),
        is_primary=request.data.get('is_primary', False)
    )
    
    serializer = ProductImageSerializer(product_image)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def product_stats(request, product_id):
    """
    Vista para obtener estadísticas de un producto.
    """
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Estadísticas de reseñas
    reviews = product.reviews.filter(is_approved=True)
    total_reviews = reviews.count()
    average_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    # Estadísticas de ventas (si tienes un modelo de OrderItem)
    # total_sold = OrderItem.objects.filter(product=product).aggregate(
    #     total=Sum('quantity')
    # )['total'] or 0
    
    # Estadísticas de variantes
    total_variants = product.variants.count()
    active_variants = product.variants.filter(is_active=True).count()
    
    return Response({
        'reviews': {
            'total': total_reviews,
            'average_rating': round(average_rating, 1),
        },
        'variants': {
            'total': total_variants,
            'active': active_variants,
        },
        'inventory': {
            'quantity': product.inventory_quantity,
            'low_stock': product.is_low_stock,
            'in_stock': product.is_in_stock,
        },
    })
