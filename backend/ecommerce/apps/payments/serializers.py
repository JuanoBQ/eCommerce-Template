from rest_framework import serializers
from .models import Payment, Refund, PaymentMethod


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer para pagos.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'uuid', 'user', 'user_email', 'user_name', 
            'order', 'order_number', 'amount', 'currency', 'method', 'provider',
            'status', 'provider_payment_id', 'provider_transaction_id', 
            'card_last_four', 'card_brand', 'failure_reason', 'notes',
            'created_at', 'updated_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'payment_id', 'uuid', 'user', 'created_at', 'updated_at'
        ]


class RefundSerializer(serializers.ModelSerializer):
    """
    Serializer para reembolsos.
    """
    payment_id = serializers.CharField(source='payment.payment_id', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    processed_by_name = serializers.CharField(source='processed_by.get_full_name', read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'refund_id', 'uuid', 'payment', 'payment_id', 'order', 'order_number',
            'amount', 'type', 'status', 'reason', 'provider_refund_id', 'notes',
            'processed_by', 'processed_by_name', 'created_at', 'updated_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'refund_id', 'uuid', 'created_at', 'updated_at'
        ]


class PaymentMethodSerializer(serializers.ModelSerializer):
    """
    Serializer para métodos de pago guardados.
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'user', 'user_name', 'type', 'provider', 'is_default',
            'card_last_four', 'card_brand', 'card_exp_month', 'card_exp_year',
            'card_holder_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        write_only_fields = ['provider_payment_method_id']
