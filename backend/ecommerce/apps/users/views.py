from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from dj_rest_auth.registration.views import RegisterView
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializers import CustomRegisterSerializer, UserSerializer
from .models import User


@method_decorator(csrf_exempt, name='dispatch')
class CustomRegisterView(RegisterView):
    """
    Vista personalizada de registro que extiende RegisterView de dj-rest-auth
    con protección CSRF desactivada para permitir peticiones desde el frontend.
    """
    serializer_class = CustomRegisterSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Vista para obtener el perfil del usuario autenticado.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)