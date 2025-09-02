from django.urls import path
from . import views

urlpatterns = [
    # Categorías
    path('', views.CategoryListView.as_view(), name='category-list'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Marcas
    path('brands/', views.BrandListView.as_view(), name='brand-list'),
    path('brands/<int:pk>/', views.BrandDetailView.as_view(), name='brand-detail'),
    
    # Tallas
    path('sizes/', views.SizeListView.as_view(), name='size-list'),
    path('sizes/<int:pk>/', views.SizeDetailView.as_view(), name='size-detail'),
    
    # Colores
    path('colors/', views.ColorListView.as_view(), name='color-list'),
    path('colors/<int:pk>/', views.ColorDetailView.as_view(), name='color-detail'),
]
