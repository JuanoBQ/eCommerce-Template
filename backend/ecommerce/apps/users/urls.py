from django.urls import path
from . import views

urlpatterns = [
    # Perfil de usuario
    path('profile/', views.user_profile, name='user-profile'),
]
