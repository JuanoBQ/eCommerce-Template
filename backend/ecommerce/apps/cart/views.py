from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Wishlist, WishlistItem
from .serializers import CartSerializer, CartItemSerializer, WishlistSerializer, WishlistItemSerializer
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.users.permissions import IsCustomerOrReadOnly


class CartView(generics.RetrieveAPIView):
    """
    Vista para obtener el carrito del usuario.
    """
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartItemListView(generics.ListCreateAPIView):
    """
    Vista para listar y crear items del carrito.
    """
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrReadOnly]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart).select_related('product', 'variant')
    
    def perform_create(self, serializer):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)


class CartItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar un item específico del carrito.
    """
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrReadOnly]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart).select_related('product', 'variant')


class ClearCartView(APIView):
    """
    Vista para vaciar el carrito.
    """
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrReadOnly]
    
    def delete(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Carrito vaciado exitosamente'})


class WishlistView(generics.RetrieveAPIView):
    """
    Vista para obtener la lista de deseos del usuario.
    """
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist


class WishlistItemListView(generics.ListCreateAPIView):
    """
    Vista para listar y crear items de la lista de deseos.
    """
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrReadOnly]
    
    def get_queryset(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return WishlistItem.objects.filter(wishlist=wishlist).select_related('product')
    
    def perform_create(self, serializer):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        serializer.save(wishlist=wishlist)


class WishlistItemDetailView(generics.RetrieveDestroyAPIView):
    """
    Vista para obtener y eliminar un item específico de la lista de deseos.
    """
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsCustomerOrReadOnly]
    
    def get_queryset(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return WishlistItem.objects.filter(wishlist=wishlist).select_related('product')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsCustomerOrReadOnly])
def add_to_cart(request):
    """
    Vista para agregar un producto al carrito.
    """
    product_id = request.data.get('product')
    quantity = request.data.get('quantity', 1)
    variant_id = request.data.get('variant')
    
    if not product_id:
        return Response({'error': 'Producto requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar variante si se proporciona
    variant = None
    if variant_id:
        try:
            variant = ProductVariant.objects.get(id=variant_id, product=product)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variante no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener o crear carrito
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    # Verificar si el item ya existe
    existing_item = CartItem.objects.filter(
        cart=cart,
        product=product,
        variant=variant
    ).first()
    
    if existing_item:
        existing_item.quantity += quantity
        existing_item.save()
        serializer = CartItemSerializer(existing_item)
    else:
        # Crear nuevo item
        cart_item = CartItem.objects.create(
            cart=cart,
            product=product,
            variant=variant,
            quantity=quantity
        )
        serializer = CartItemSerializer(cart_item)
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsCustomerOrReadOnly])
def add_to_wishlist(request):
    """
    Vista para agregar un producto a la lista de deseos.
    """
    product_id = request.data.get('product')
    
    if not product_id:
        return Response({'error': 'Producto requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener o crear wishlist
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    # Verificar si el item ya existe
    existing_item = WishlistItem.objects.filter(
        wishlist=wishlist,
        product=product
    ).first()
    
    if existing_item:
        return Response({'error': 'Producto ya está en la lista de deseos'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Crear nuevo item
    wishlist_item = WishlistItem.objects.create(
        wishlist=wishlist,
        product=product
    )
    serializer = WishlistItemSerializer(wishlist_item)
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsCustomerOrReadOnly])
def move_to_cart(request, item_id):
    """
    Vista para mover un item de la lista de deseos al carrito.
    """
    try:
        wishlist_item = WishlistItem.objects.get(
            id=item_id,
            wishlist__user=request.user
        )
    except WishlistItem.DoesNotExist:
        return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Obtener o crear carrito
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    # Verificar si el item ya existe en el carrito
    existing_cart_item = CartItem.objects.filter(
        cart=cart,
        product=wishlist_item.product
    ).first()
    
    if existing_cart_item:
        existing_cart_item.quantity += 1
        existing_cart_item.save()
    else:
        CartItem.objects.create(
            cart=cart,
            product=wishlist_item.product,
            quantity=1
        )
    
    # Eliminar de la lista de deseos
    wishlist_item.delete()
    
    return Response({'message': 'Producto movido al carrito exitosamente'})
