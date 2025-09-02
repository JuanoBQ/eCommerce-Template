from django.urls import path
from . import views

urlpatterns = [
    # Carrito
    path('', views.CartView.as_view(), name='cart'),
    path('items/', views.CartItemListView.as_view(), name='cart-item-list'),
    path('items/<int:pk>/', views.CartItemDetailView.as_view(), name='cart-item-detail'),
    path('clear/', views.ClearCartView.as_view(), name='clear-cart'),
    
    # Lista de deseos
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/items/', views.WishlistItemListView.as_view(), name='wishlist-item-list'),
    path('wishlist/items/<int:pk>/', views.WishlistItemDetailView.as_view(), name='wishlist-item-detail'),
]
