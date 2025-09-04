from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user')
router.register(r'addresses', views.UserAddressViewSet, basename='user-address')

urlpatterns = [
    # Perfil de usuario
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    # Cambio de contraseña
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    # Endpoint de direcciones
    path('simple-addresses/', views.simple_addresses_endpoint, name='simple-addresses'),
    # API de usuarios (admin)
    path('', include(router.urls)),
]
