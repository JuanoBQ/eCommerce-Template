from django.urls import path
from . import views

urlpatterns = [
    # Perfil de usuario
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/detail/', views.UserProfileDetailView.as_view(), name='user-profile-detail'),
    path('profile/avatar/', views.upload_avatar, name='upload-avatar'),
    path('profile/avatar/delete/', views.delete_avatar, name='delete-avatar'),
    path('profile/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('profile/stats/', views.user_stats, name='user-stats'),
    
    # Direcciones
    path('addresses/', views.AddressListView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
    
    # Gestión de usuarios (admin)
    path('', views.UserListView.as_view(), name='user-list'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
