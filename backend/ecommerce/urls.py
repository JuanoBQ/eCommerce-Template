"""
URL configuration for ecommerce project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Ecommerce API",
        default_version='v1',
        description="API para ecommerce de ropa",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@ecommerce.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Ecommerce API",
        "version": "1.0.0",
        "documentation": {
            "swagger": request.build_absolute_uri('/swagger/'),
            "redoc": request.build_absolute_uri('/redoc/')
        },
        "endpoints": {
            "products": request.build_absolute_uri('/api/products/'),
            "categories": request.build_absolute_uri('/api/categories/'),
            "users": request.build_absolute_uri('/api/users/'),
            "cart": request.build_absolute_uri('/api/cart/'),
            "orders": request.build_absolute_uri('/api/orders/'),
            "payments": request.build_absolute_uri('/api/payments/'),
            "auth": request.build_absolute_uri('/api/auth/')
        }
    })

urlpatterns = [
    # Root API
    path('', api_root, name='api-root'),

    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Authentication
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    
    # Apps
    path('api/products/', include('ecommerce.apps.products.urls')),
    path('api/categories/', include('ecommerce.apps.categories.urls')),
    path('api/users/', include('ecommerce.apps.users.urls')),
    path('api/cart/', include('ecommerce.apps.cart.urls')),
    path('api/orders/', include('ecommerce.apps.orders.urls')),
    path('api/payments/', include('ecommerce.apps.payments.urls')),
    path('api/reports/', include('ecommerce.apps.reports.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
