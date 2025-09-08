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
    
    # Campos opcionales para dirección de envío detallada
    shipping_city = serializers.CharField(required=False, allow_blank=True)
    shipping_state = serializers.CharField(required=False, allow_blank=True)
    shipping_country = serializers.CharField(required=False, allow_blank=True)
    shipping_postal_code = serializers.CharField(required=False, allow_blank=True)
    
    # Campos opcionales para dirección de facturación detallada
    billing_city = serializers.CharField(required=False, allow_blank=True)
    billing_state = serializers.CharField(required=False, allow_blank=True)
    billing_country = serializers.CharField(required=False, allow_blank=True)
    billing_postal_code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'first_name', 'last_name', 'document_id',
            'email', 'phone', 'shipping_address', 'billing_address',
            'shipping_city', 'shipping_state', 'shipping_country', 'shipping_postal_code',
            'billing_city', 'billing_state', 'billing_country', 'billing_postal_code',
            'shipping_amount', 'total_amount', 'notes', 'items', 'status'
        ]
        read_only_fields = ['id', 'order_number', 'total_amount', 'status']
        extra_kwargs = {
            'shipping_address': {'required': True},
            'billing_address': {'required': False},
            'shipping_amount': {'required': False},
            'notes': {'required': False},
        }
    

    
    def _parse_address_info(self, address_string):
        """
        Intenta extraer información de ciudad, estado y código postal de una dirección.
        Formato esperado: "Dirección, Ciudad, Estado Código_postal, País"
        """
        if not address_string:
            return {}, {}, {}, {}
            
        try:
            # Intentar parsear formato: "Dirección, Ciudad, Estado Código_postal, País"
            parts = [part.strip() for part in address_string.split(',')]
            
            if len(parts) >= 3:
                # Último elemento podría ser país
                country = parts[-1] if len(parts) >= 4 else 'Colombia'
                
                # Penúltimo elemento podría contener estado y código postal
                state_postal = parts[-2] if len(parts) >= 3 else ''
                state_parts = state_postal.split()
                
                if len(state_parts) >= 2:
                    state = ' '.join(state_parts[:-1])
                    postal_code = state_parts[-1]
                else:
                    state = state_postal
                    postal_code = ''
                
                # Antepenúltimo elemento sería la ciudad
                city = parts[-3] if len(parts) >= 3 else ''
                
                return city, state, country, postal_code
        except Exception:
            pass
            
        return '', '', '', ''

    def create(self, validated_data):
        """
        Crea una nueva orden con sus items.
        """
        items_data = validated_data.pop('items', [])
        
        # Extraer campos de dirección de envío
        shipping_city = validated_data.pop('shipping_city', '')
        shipping_state = validated_data.pop('shipping_state', '')
        shipping_country = validated_data.pop('shipping_country', '')
        shipping_postal_code = validated_data.pop('shipping_postal_code', '')
        
        # Extraer campos de dirección de facturación
        billing_city = validated_data.pop('billing_city', '')
        billing_state = validated_data.pop('billing_state', '')
        billing_country = validated_data.pop('billing_country', '')
        billing_postal_code = validated_data.pop('billing_postal_code', '')
        
        # Si no se proporcionaron campos individuales, intentar parsear desde la dirección
        if not shipping_city and not shipping_state:
            parsed_city, parsed_state, parsed_country, parsed_postal = self._parse_address_info(
                validated_data.get('shipping_address', '')
            )
            shipping_city = shipping_city or parsed_city
            shipping_state = shipping_state or parsed_state
            shipping_country = shipping_country or parsed_country
            shipping_postal_code = shipping_postal_code or parsed_postal
        
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
            billing_address=validated_data.get('billing_address', validated_data['shipping_address']),
            notes=validated_data.get('notes', ''),
            subtotal=total_amount,
            shipping_amount=validated_data.get('shipping_amount', 0),
            total_amount=total_amount + validated_data.get('shipping_amount', 0),
            
            # Campos de dirección de envío - usar los enviados o valores por defecto
            shipping_first_name=validated_data['first_name'],
            shipping_last_name=validated_data['last_name'],
            shipping_city=shipping_city or 'Bogotá',
            shipping_state=shipping_state or 'Cundinamarca',
            shipping_country=shipping_country or 'Colombia',
            shipping_postal_code=shipping_postal_code or '110111',
            
            # Campos de dirección de facturación
            billing_first_name=validated_data['first_name'],
            billing_last_name=validated_data['last_name'],
            billing_city=billing_city or shipping_city or 'Bogotá',
            billing_state=billing_state or shipping_state or 'Cundinamarca',
            billing_country=billing_country or shipping_country or 'Colombia',
            billing_postal_code=billing_postal_code or shipping_postal_code or '110111',
            
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
    
    def to_representation(self, instance):
        """
        Personaliza la representación después de crear la orden.
        Incluye todos los campos necesarios para el frontend.
        """
        return {
            'id': instance.id,
            'order_number': instance.order_number,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'document_id': instance.document_id,
            'email': instance.email,
            'phone': instance.phone,
            'shipping_address': instance.shipping_address,
            'billing_address': instance.billing_address,
            'shipping_amount': str(instance.shipping_amount),
            'total_amount': str(instance.total_amount),
            'notes': instance.notes,
            'status': instance.status,
            'created_at': instance.created_at.isoformat() if instance.created_at else None,
        }
