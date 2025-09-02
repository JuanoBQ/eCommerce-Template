from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import User, UserProfile, Address
from .serializers import (
    UserSerializer, UserProfileSerializer, AddressSerializer,
    ChangePasswordSerializer, UserListSerializer
)
from .permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar el perfil del usuario autenticado.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar el perfil extendido del usuario.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class AddressListView(generics.ListCreateAPIView):
    """
    Vista para listar y crear direcciones del usuario.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['type', 'is_default']
    ordering_fields = ['created_at', 'is_default']
    ordering = ['-is_default', '-created_at']
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar una dirección específica.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class ChangePasswordView(APIView):
    """
    Vista para cambiar la contraseña del usuario.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Contraseña actualizada exitosamente.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """
    Vista para listar usuarios (solo para administradores).
    """
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_vendor', 'is_customer', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'email']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return User.objects.all()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar un usuario específico (solo para administradores).
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        return User.objects.all()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """
    Vista para obtener estadísticas del usuario.
    """
    user = request.user
    
    # Estadísticas de pedidos
    total_orders = user.orders.count()
    completed_orders = user.orders.filter(status='delivered').count()
    pending_orders = user.orders.filter(status__in=['pending', 'confirmed', 'processing']).count()
    
    # Estadísticas de gastos
    from django.db.models import Sum
    total_spent = user.orders.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Estadísticas del carrito
    cart_items = user.cart.items.count() if hasattr(user, 'cart') else 0
    wishlist_items = user.wishlist.items.count() if hasattr(user, 'wishlist') else 0
    
    return Response({
        'orders': {
            'total': total_orders,
            'completed': completed_orders,
            'pending': pending_orders,
        },
        'spending': {
            'total': total_spent,
        },
        'cart': {
            'items': cart_items,
        },
        'wishlist': {
            'items': wishlist_items,
        },
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_avatar(request):
    """
    Vista para subir avatar del usuario.
    """
    if 'avatar' not in request.FILES:
        return Response({'error': 'No se proporcionó archivo de avatar'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    avatar = request.FILES['avatar']
    
    # Validar tamaño del archivo (máximo 5MB)
    if avatar.size > 5 * 1024 * 1024:
        return Response({'error': 'El archivo es demasiado grande. Máximo 5MB.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Validar tipo de archivo
    allowed_types = ['image/jpeg', 'image/png', 'image/gif']
    if avatar.content_type not in allowed_types:
        return Response({'error': 'Tipo de archivo no válido. Solo se permiten JPG, PNG y GIF.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    user.avatar = avatar
    user.save()
    
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_avatar(request):
    """
    Vista para eliminar avatar del usuario.
    """
    user = request.user
    if user.avatar:
        user.avatar.delete()
        user.avatar = None
        user.save()
    
    serializer = UserSerializer(user)
    return Response(serializer.data)
