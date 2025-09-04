from rest_framework import serializers
from .models import AdminSettings


class AdminSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer para configuraciones del sistema de administración.
    """
    
    class Meta:
        model = AdminSettings
        fields = [
            # Configuración general
            'site_name', 'site_description', 'site_url', 'admin_email',
            
            # Configuración de email
            'email_host', 'email_port', 'email_username', 'email_password', 'email_use_tls',
            
            # Configuración de seguridad
            'session_timeout', 'max_login_attempts', 'password_min_length', 'require_2fa',
            
            # Configuración de productos
            'max_products_per_page', 'enable_reviews', 'enable_wishlist', 'enable_notifications',
            
            # Configuración de órdenes
            'order_auto_confirm', 'order_auto_cancel_hours', 'enable_tracking',
            
            # Configuración de pagos
            'payment_gateway', 'payment_test_mode', 'currency',
            
            # Configuración de notificaciones
            'email_notifications', 'sms_notifications', 'push_notifications',
            
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_email_port(self, value):
        """Validar que el puerto de email esté en un rango válido."""
        if not (1 <= value <= 65535):
            raise serializers.ValidationError("El puerto debe estar entre 1 y 65535")
        return value
    
    def validate_session_timeout(self, value):
        """Validar que el tiempo de sesión sea razonable."""
        if not (5 <= value <= 480):  # Entre 5 minutos y 8 horas
            raise serializers.ValidationError("El tiempo de sesión debe estar entre 5 y 480 minutos")
        return value
    
    def validate_max_login_attempts(self, value):
        """Validar que los intentos de login sean razonables."""
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Los intentos de login deben estar entre 1 y 10")
        return value
    
    def validate_password_min_length(self, value):
        """Validar que la longitud mínima de contraseña sea segura."""
        if not (6 <= value <= 50):
            raise serializers.ValidationError("La longitud mínima de contraseña debe estar entre 6 y 50 caracteres")
        return value
    
    def validate_max_products_per_page(self, value):
        """Validar que los productos por página sean razonables."""
        if not (5 <= value <= 100):
            raise serializers.ValidationError("Los productos por página deben estar entre 5 y 100")
        return value
    
    def validate_order_auto_cancel_hours(self, value):
        """Validar que las horas de cancelación automática sean razonables."""
        if not (1 <= value <= 168):  # Entre 1 hora y 1 semana
            raise serializers.ValidationError("Las horas de cancelación automática deben estar entre 1 y 168")
        return value
    
    def validate_payment_gateway(self, value):
        """Validar que la pasarela de pago sea válida."""
        valid_gateways = ['wompi', 'mercadopago', 'paypal', 'stripe']
        if value not in valid_gateways:
            raise serializers.ValidationError(f"La pasarela de pago debe ser una de: {', '.join(valid_gateways)}")
        return value
    
    def validate_currency(self, value):
        """Validar que la moneda sea válida."""
        valid_currencies = ['COP', 'USD', 'EUR']
        if value not in valid_currencies:
            raise serializers.ValidationError(f"La moneda debe ser una de: {', '.join(valid_currencies)}")
        return value
