from rest_framework import serializers
from .models import Report, Claim, ClaimMessage


class ClaimMessageSerializer(serializers.ModelSerializer):
    """
    Serializer para mensajes de reclamos.
    """
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    
    class Meta:
        model = ClaimMessage
        fields = [
            'id', 'claim', 'message_type', 'content', 'author', 
            'author_name', 'author_email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class ClaimSerializer(serializers.ModelSerializer):
    """
    Serializer para reclamos.
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    messages = ClaimMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Claim
        fields = [
            'id', 'user', 'user_name', 'user_email', 'claim_type', 'title', 
            'description', 'status', 'priority', 'order', 'order_number',
            'product', 'product_name', 'product_sku', 'admin_response', 'resolved_by', 
            'resolved_by_name', 'resolved_at', 'created_at', 'updated_at', 'messages'
        ]
        read_only_fields = ['id', 'user', 'resolved_by', 'resolved_at', 'created_at', 'updated_at']


class ClaimCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear reclamos (solo campos necesarios).
    """
    class Meta:
        model = Claim
        fields = [
            'claim_type', 'title', 'description', 'order', 'product'
        ]


class ClaimUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar reclamos (admin).
    """
    class Meta:
        model = Claim
        fields = [
            'status', 'priority', 'admin_response'
        ]


class ClaimMessageCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear mensajes de reclamos.
    """
    class Meta:
        model = ClaimMessage
        fields = [
            'content'
        ]


class ReportSerializer(serializers.ModelSerializer):
    """
    Serializer para reportes.
    """
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    generated_by_email = serializers.EmailField(source='generated_by.email', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'name', 'report_type', 'generated_by', 'generated_by_name', 
            'generated_by_email', 'data', 'filters', 'is_scheduled', 
            'schedule_frequency', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'generated_by', 'created_at', 'updated_at']
