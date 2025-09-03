from django.urls import path
from . import views

urlpatterns = [
    # Perfil de usuario
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
]
