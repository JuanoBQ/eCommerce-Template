from django.urls import path
from . import views

urlpatterns = [
    # Productos
    path('', views.ProductListView.as_view(), name='product-list'),
    path('search/', views.ProductSearchView.as_view(), name='product-search'),
    path('featured/', views.featured_products, name='featured-products'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<int:product_id>/related/', views.related_products, name='related-products'),
    path('<int:product_id>/stats/', views.product_stats, name='product-stats'),
    path('<int:product_id>/upload-image/', views.upload_product_image, name='upload-product-image'),
    
    # Imágenes de productos
    path('<int:product_id>/images/', views.ProductImageView.as_view(), name='product-image-list'),
    path('<int:product_id>/images/<int:pk>/', views.ProductImageDetailView.as_view(), name='product-image-detail'),
    
    # Variantes de productos
    path('<int:product_id>/variants/', views.ProductVariantView.as_view(), name='product-variant-list'),
    path('<int:product_id>/variants/<int:pk>/', views.ProductVariantDetailView.as_view(), name='product-variant-detail'),
    
    # Reseñas de productos
    path('<int:product_id>/reviews/', views.ProductReviewView.as_view(), name='product-review-list'),
    path('<int:product_id>/reviews/<int:pk>/', views.ProductReviewDetailView.as_view(), name='product-review-detail'),
]
