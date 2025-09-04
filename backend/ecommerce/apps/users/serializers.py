from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User, UserAddress

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



        return user



    
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


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar el perfil del usuario.
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'birth_date', 'avatar',
            'default_address', 'default_city', 'default_state', 'default_country',
            'default_postal_code', 'email_notifications', 'sms_notifications'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone': {'required': False, 'allow_null': True},
            'birth_date': {'required': False, 'allow_null': True},
            'avatar': {'required': False, 'allow_null': True},
            'default_address': {'required': False, 'allow_null': True},
            'default_city': {'required': False, 'allow_null': True},
            'default_state': {'required': False, 'allow_null': True},
            'default_country': {'required': False, 'allow_null': True},
            'default_postal_code': {'required': False, 'allow_null': True},
            'email_notifications': {'required': False},
            'sms_notifications': {'required': False},
        }

    def validate_first_name(self, value):
        if not value or (isinstance(value, str) and len(value.strip()) < 1):
            raise serializers.ValidationError("El nombre es requerido.")
        return value.strip() if value else value

    def validate_last_name(self, value):
        if not value or (isinstance(value, str) and len(value.strip()) < 1):
            raise serializers.ValidationError("Los apellidos son requeridos.")
        return value.strip() if value else value

    def validate_phone(self, value):
        if value and value.strip() == '':
            return None
        return value.strip() if value else None

    def validate_birth_date(self, value):
        if value and str(value).strip() == '':
            return None
        return value

    def validate_default_postal_code(self, value):
        if value and value.strip() == '':
            return None
        return value.strip() if value else None

    def update(self, instance, validated_data):
        print(f"🔄 Actualizando usuario: {instance}")
        print(f"📊 Datos validados: {validated_data}")
        
        # Actualizar solo los campos permitidos
        for attr, value in validated_data.items():
            print(f"🔧 Actualizando campo {attr}: {value} (tipo: {type(value)})")
            if value is not None:
                setattr(instance, attr, value)
            else:
                print(f"⚠️ Saltando campo {attr} porque es None")
        
        print("💾 Guardando instancia...")
        instance.save()
        print("✅ Instancia guardada exitosamente")
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de usuarios (admin).
    """
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'is_staff', 'is_active', 'date_joined', 'last_login'
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear usuarios (admin).
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'is_staff', 'is_active', 'phone'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'password': {'required': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar usuarios (admin).
    """
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'is_staff', 
            'is_active', 'phone'
        ]
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }


class UserAddressSerializer(serializers.ModelSerializer):
    """
    Serializer para direcciones de usuario.
    """
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = UserAddress
        fields = [
            'id', 'title', 'first_name', 'last_name',
            'address_line_1', 'address_line_2', 'city', 'state',
            'postal_code', 'country', 'is_default',
            'is_billing', 'is_shipping', 'full_address',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_address']
        extra_kwargs = {
            'title': {'required': True},
            'first_name': {'required': False},  # No requerido, se toma del perfil
            'last_name': {'required': False},   # No requerido, se toma del perfil
            'address_line_1': {'required': True},
            'city': {'required': True},
            'state': {'required': True},
            'postal_code': {'required': True},
            'country': {'required': True},
        }
    
    def validate(self, attrs):
        # Validar que no se excedan las 2 direcciones por usuario
        user = self.context['request'].user
        if not self.instance:  # Solo para creación, no para actualización
            existing_addresses = UserAddress.objects.filter(user=user).count()
            if existing_addresses >= 2:
                raise serializers.ValidationError("No puedes tener más de 2 direcciones.")
        
        return attrs


class UserAddressCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear direcciones de usuario.
    """
    class Meta:
        model = UserAddress
        fields = [
            'title', 'address_line_1', 'address_line_2', 'city', 'state',
            'postal_code', 'country', 'is_default',
            'is_billing', 'is_shipping'
        ]
        extra_kwargs = {
            'title': {'required': True},
            'address_line_1': {'required': True},
            'city': {'required': True},
            'state': {'required': True},
            'postal_code': {'required': True},
            'country': {'required': True},
        }
    
    def validate(self, attrs):
        # Validar que no se excedan las 2 direcciones por usuario
        user = self.context['request'].user
        existing_addresses = UserAddress.objects.filter(user=user).count()
        if existing_addresses >= 2:
            raise serializers.ValidationError("No puedes tener más de 2 direcciones.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Asignar nombres del perfil del usuario
        validated_data['first_name'] = self.context['request'].user.first_name
        validated_data['last_name'] = self.context['request'].user.last_name
        return super().create(validated_data)
