from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, Address

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo User.
    """
    full_name = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'birth_date', 'avatar', 'is_vendor', 'is_customer',
            'default_address', 'default_city', 'default_state', 'default_country',
            'default_postal_code', 'email_notifications', 'sms_notifications',
            'is_admin', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer personalizado para registro de usuarios.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'phone',
            'password', 'password_confirm', 'terms_accepted'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'terms_accepted': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs
    
    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("Debes aceptar los términos y condiciones.")
        return value
    
    def save(self, request=None):
        # Obtener los datos validados
        validated_data = self.validated_data.copy()
        
        password_confirm = validated_data.pop('password_confirm')
        terms_accepted = validated_data.pop('terms_accepted')
        password = validated_data.pop('password')

        # Crear usuario con create_user (ya establece la contraseña)
        user = User.objects.create_user(
            **validated_data, 
            password=password
        )
        
        # Establecer términos aceptados después de crear el usuario
        user.terms_accepted = terms_accepted
        user.save()

        # Crear perfil de usuario (solo con campos básicos)
        # UserProfile.objects.create(
        #     user=user,
        #     show_email=False,
        #     show_phone=False
        # )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil de usuario.
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'website', 'favorite_categories',
            'preferred_size', 'preferred_brand', 'show_email', 'show_phone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer para direcciones de usuario.
    """
    class Meta:
        model = Address
        fields = [
            'id', 'user', 'type', 'is_default', 'street_address', 'apartment',
            'city', 'state', 'country', 'postal_code', 'contact_name',
            'contact_phone', 'delivery_instructions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para cambio de contraseña.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Las nuevas contraseñas no coinciden.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de usuarios (admin).
    """
    full_name = serializers.ReadOnlyField()
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'is_vendor', 'is_customer',
            'is_active', 'total_orders', 'total_spent', 'created_at'
        ]
    
    def get_total_orders(self, obj):
        return obj.orders.count()
    
    def get_total_spent(self, obj):
        from django.db.models import Sum
        return obj.orders.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
