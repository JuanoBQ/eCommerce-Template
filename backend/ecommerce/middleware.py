"""
Middleware personalizado para autenticación JWT.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Solo procesar requests a la API
        if request.path.startswith('/api/'):
            auth_header = request.headers.get('Authorization', '')
            
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
                
                try:
                    jwt_auth = JWTAuthentication()
                    user_token = jwt_auth.get_validated_token(token)
                    user = jwt_auth.get_user(user_token)
                    
                    if user and not user.is_anonymous:
                        request.user = user
                        request._force_auth_user = user  # Forzar usuario autenticado
                        print(f"✅ JWT Auth - Usuario autenticado: {user} (ID: {user.id})")
                    else:
                        print("⚠️ JWT Auth - Usuario no válido")
                        request.user = AnonymousUser()
                        
                except (InvalidToken, TokenError) as e:
                    print(f"❌ JWT Auth - Error: {e}")
                    request.user = AnonymousUser()
            else:
                # No hay token, mantener usuario anónimo
                request.user = AnonymousUser()

        response = self.get_response(request)
        return response
