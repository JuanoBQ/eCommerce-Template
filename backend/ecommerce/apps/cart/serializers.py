from rest_framework import serializers
from .models import Cart, CartItem, Wishlist, WishlistItem
from ecommerce.apps.products.serializers import ProductListSerializer, ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items del carrito.
    """
    product_details = ProductListSerializer(source='product', read_only=True)
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    unit_price = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'variant', 'quantity', 'created_at', 'updated_at',
            'product_details', 'variant_details', 'unit_price', 'total_price'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer para el carrito.
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    is_empty = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = [
            'id', 'user', 'created_at', 'updated_at',
            'items', 'total_items', 'total_price', 'is_empty'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class WishlistItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items de la lista de deseos.
    """
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'created_at', 'product_details']
        read_only_fields = ['id', 'created_at']


class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializer para la lista de deseos.
    """
    items = WishlistItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
