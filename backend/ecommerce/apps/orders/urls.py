from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.OrderViewSet, basename='order')
router.register(r'items', views.OrderItemViewSet, basename='orderitem')

urlpatterns = [
    # Estadísticas de órdenes
    path('stats/', views.order_stats, name='order-stats'),
    path('monthly-stats/', views.monthly_stats, name='monthly-stats'),
    path('recent-activity/', views.recent_activity, name='recent-activity'),
    path('', include(router.urls)),
]
