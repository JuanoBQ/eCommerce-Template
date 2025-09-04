from rest_framework import serializers
from .models import Order, OrderItem
from ecommerce.apps.products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer para items de órdenes.
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'quantity', 'price', 
            'unit_price', 'total_price', 'product_name', 'product_sku', 'variant_info'
        ]
        read_only_fields = ['id', 'unit_price', 'total_price', 'product_name', 'product_sku', 'variant_info']


class OrderListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar órdenes (versión simplificada).
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user_email', 'user_name', 'total_amount', 
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'items_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        """Cuenta el número de items en la orden."""
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalles de órdenes.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'uuid', 'user', 'user_email', 'user_name', 
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'first_name', 'last_name', 'document_id', 'email', 'phone', 
            'shipping_address', 'shipping_first_name', 'shipping_last_name',
            'shipping_city', 'shipping_state', 'shipping_country', 'shipping_postal_code',
            'billing_address', 'billing_first_name', 'billing_last_name',
            'billing_city', 'billing_state', 'billing_country', 'billing_postal_code',
            'subtotal', 'tax_amount', 'shipping_amount', 'discount_amount', 'total_amount',
            'notes', 'tracking_number', 'shipped_at', 'delivered_at',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'uuid', 'user', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear órdenes.
    """
    items = OrderItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'first_name', 'last_name', 'document_id',
            'email', 'phone', 'shipping_address', 'billing_address',
            'shipping_amount', 'notes', 'items'
        ]
        extra_kwargs = {
            'shipping_address': {'required': True},
            'billing_address': {'required': False},
            'shipping_amount': {'required': False},
            'notes': {'required': False},
        }
    

    
    def create(self, validated_data):
        """
        Crea una nueva orden con sus items.
        """
        items_data = validated_data.pop('items', [])
        
        # Calcular totales
        total_amount = sum(item['quantity'] * item['price'] for item in items_data)
        
        # Crear la orden con campos requeridos
        order = Order.objects.create(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            document_id=validated_data['document_id'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            shipping_address=validated_data['shipping_address'],
            billing_address=validated_data.get('billing_address', validated_data['shipping_address']),  # Usar billing_address si existe, sino shipping_address
            notes=validated_data.get('notes', ''),
            subtotal=total_amount,
            shipping_amount=validated_data.get('shipping_amount', 0),
            total_amount=total_amount + validated_data.get('shipping_amount', 0),
            shipping_first_name=validated_data['first_name'],
            shipping_last_name=validated_data['last_name'],
            shipping_city='Bogotá',
            shipping_state='Cundinamarca',
            shipping_country='Colombia',
            shipping_postal_code='110111',
            user=self.context['request'].user
        )
        
        # Crear los items de la orden
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                unit_price=item_data['price'],
                total_price=item_data['quantity'] * item_data['price']
            )
        
        return order
