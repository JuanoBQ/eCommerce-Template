from rest_framework import serializers
from .models import Order, OrderItem
from ecommerce.apps.products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items de órdenes.
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'price', 
            'size', 'color', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer para órdenes.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_email', 'user_name', 'total_amount', 
            'status', 'shipping_address', 'billing_address', 
            'payment_method', 'transaction_id', 'notes', 
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """
        Crea una nueva orden.
        """
        items_data = self.context.get('items', [])
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order
