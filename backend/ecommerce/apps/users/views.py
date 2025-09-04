from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from dj_rest_auth.registration.views import RegisterView
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.db import models
from .serializers import (
    CustomRegisterSerializer, 
    UserSerializer, 
    UserProfileUpdateSerializer,
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserAddressSerializer,
    UserAddressCreateSerializer,
    ChangePasswordSerializer
)
from .models import User, UserAddress


@method_decorator(csrf_exempt, name='dispatch')
class CustomRegisterView(RegisterView):
    """
    Vista personalizada de registro que extiende RegisterView de dj-rest-auth
    con protección CSRF desactivada para permitir peticiones desde el frontend.
    """
    serializer_class = CustomRegisterSerializer


class UserProfileView(APIView):
    """
    Vista para obtener y actualizar el perfil del usuario autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Obtener el perfil del usuario autenticado.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """
        Actualizar el perfil del usuario autenticado.
        """
        try:
            print(f"🔍 Datos recibidos: {request.data}")
            print(f"👤 Usuario: {request.user}")
            
            serializer = UserProfileUpdateSerializer(
                request.user,
                data=request.data,
                partial=True
            )

            print(f"✅ Serializer creado exitosamente")

            if serializer.is_valid():
                print("✅ Datos válidos, guardando...")
                updated_user = serializer.save()
                print(f"✅ Usuario actualizado: {updated_user}")
                
                # Devolver el perfil completo actualizado
                user_serializer = UserSerializer(updated_user)
                print(f"✅ Respuesta preparada: {user_serializer.data}")
                return Response(user_serializer.data)
            else:
                print(f"❌ Errores de validación: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"❌ Error en patch: {str(e)}")
            print(f"❌ Tipo de error: {type(e)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            return Response(
                {'detail': f'Error interno del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangePasswordView(APIView):
    """
    Vista para cambiar la contraseña del usuario autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Cambiar la contraseña del usuario autenticado.
        """
        try:
            print(f"🔍 Cambio de contraseña - Usuario: {request.user}")
            print(f"📊 Datos recibidos: {request.data}")
            
            serializer = ChangePasswordSerializer(
                data=request.data,
                context={'request': request}
            )

            if serializer.is_valid():
                print("✅ Datos de contraseña válidos")
                
                # Obtener el usuario y cambiar la contraseña
                user = request.user
                new_password = serializer.validated_data['new_password']
                user.set_password(new_password)
                user.save()
                
                print("✅ Contraseña actualizada exitosamente")
                return Response(
                    {'message': 'Contraseña actualizada exitosamente'},
                    status=status.HTTP_200_OK
                )
            else:
                print(f"❌ Errores de validación: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"❌ Error en cambio de contraseña: {str(e)}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de usuarios (solo para administradores).
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Filtrar usuarios según parámetros de búsqueda.
        """
        queryset = User.objects.all()
        
        # Filtrar por estado activo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filtrar por rol de staff
        is_staff = self.request.query_params.get('is_staff', None)
        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == 'true')
        
        # Búsqueda por nombre o email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        return queryset.order_by('-date_joined')
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """
        Activar/desactivar usuario.
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_role(self, request, pk=None):
        """
        Cambiar rol de usuario (staff/regular).
        """
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar usuario (eliminación real).
        """
        user = self.get_object()
        
        # No permitir eliminar el usuario actual
        if user == request.user:
            return Response(
                {'detail': 'No puedes eliminar tu propia cuenta.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Eliminación real del usuario
        user.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserAddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar direcciones de usuario.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        print(f"🔍 UserAddressViewSet.get_permissions - Action: {self.action}")
        print(f"🔍 UserAddressViewSet.get_permissions - Usuario: {self.request.user}")
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Retorna solo las direcciones del usuario autenticado."""
        print(f"🔍 UserAddressViewSet - Usuario autenticado: {self.request.user}")
        print(f"🔍 UserAddressViewSet - Es anónimo: {self.request.user.is_anonymous}")
        print(f"🔍 UserAddressViewSet - Headers: {dict(self.request.headers)}")
        
        # Temporalmente retornar todas las direcciones para debug
        if self.request.user.is_anonymous:
            print("⚠️ Usuario anónimo, retornando lista vacía")
            return UserAddress.objects.none()
        
        return UserAddress.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción."""
        if self.action == 'create':
            return UserAddressCreateSerializer
        return UserAddressSerializer
    
    def list(self, request, *args, **kwargs):
        """Lista las direcciones del usuario autenticado."""
        print(f"🔍 UserAddressViewSet.list - Usuario: {request.user}")
        print(f"🔍 UserAddressViewSet.list - Es anónimo: {request.user.is_anonymous}")
        return super().list(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        """Asigna el usuario actual a la dirección y completa los datos del perfil."""
        # Si no se proporcionan nombres, usar los del perfil del usuario
        if not serializer.validated_data.get('first_name'):
            serializer.validated_data['first_name'] = self.request.user.first_name
        if not serializer.validated_data.get('last_name'):
            serializer.validated_data['last_name'] = self.request.user.last_name
        
        serializer.save(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar dirección con lógica de dirección predeterminada obligatoria.
        """
        address = self.get_object()
        user = request.user
        
        # Verificar si es la dirección predeterminada
        is_default = address.is_default
        
        # Eliminar la dirección
        address.delete()
        
        # Si se eliminó la dirección predeterminada y quedan direcciones, marcar la primera como predeterminada
        if is_default:
            remaining_addresses = UserAddress.objects.filter(user=user).order_by('created_at')
            if remaining_addresses.exists():
                first_address = remaining_addresses.first()
                first_address.is_default = True
                first_address.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """
        Marcar una dirección como predeterminada.
        """
        address = self.get_object()
        
        # Desmarcar otras direcciones como default
        UserAddress.objects.filter(user=request.user, is_default=True).update(is_default=False)
        
        # Marcar esta dirección como default
        address.is_default = True
        address.save()
        
        serializer = self.get_serializer(address)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """
        Obtener la dirección predeterminada del usuario.
        """
        try:
            default_address = UserAddress.objects.get(user=request.user, is_default=True)
            serializer = self.get_serializer(default_address)
            return Response(serializer.data)
        except UserAddress.DoesNotExist:
            return Response(
                {'detail': 'No hay dirección predeterminada.'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def simple_addresses_endpoint(request):
    """
    Endpoint para direcciones que funciona con autenticación JWT.
    """
    if request.method == 'GET':
        # Obtener direcciones del usuario autenticado
        addresses = UserAddress.objects.filter(user=request.user)
        serializer = UserAddressSerializer(addresses, many=True)
        return Response({
            'message': 'Direcciones obtenidas correctamente',
            'user': str(request.user),
            'is_anonymous': request.user.is_anonymous,
            'addresses': serializer.data
        })
    elif request.method == 'POST':
        # Filtrar solo los campos necesarios
        filtered_data = {
            'title': request.data.get('title'),
            'address_line_1': request.data.get('address_line_1'),
            'address_line_2': request.data.get('address_line_2', ''),
            'city': request.data.get('city'),
            'state': request.data.get('state'),
            'postal_code': request.data.get('postal_code'),
            'country': request.data.get('country'),
            'is_default': request.data.get('is_default', False),
            'is_billing': request.data.get('is_billing', False),
            'is_shipping': request.data.get('is_shipping', True),
        }
        
        # Crear dirección con el usuario autenticado
        serializer = UserAddressCreateSerializer(data=filtered_data, context={'request': request})
        if serializer.is_valid():
            # Asignar el usuario autenticado
            address = serializer.save()
            return Response({
                'message': 'Dirección creada correctamente',
                'user': str(request.user),
                'is_anonymous': request.user.is_anonymous,
                'address': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)