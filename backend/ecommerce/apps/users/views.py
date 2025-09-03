from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from dj_rest_auth.registration.views import RegisterView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from .serializers import CustomRegisterSerializer, UserSerializer, UserProfileUpdateSerializer
from .models import User


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