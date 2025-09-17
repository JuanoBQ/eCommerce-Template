"""
URLs para el sistema de inventario y stock.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import stock_views

app_name = 'inventory'

# Router para las vistas de stock
router = DefaultRouter()
router.register(r'movements', stock_views.StockMovementViewSet, basename='stock-movements')
router.register(r'reservations', stock_views.StockReservationViewSet, basename='stock-reservations')
router.register(r'alerts', stock_views.StockAlertViewSet, basename='stock-alerts')
router.register(r'validation', stock_views.StockValidationViewSet, basename='stock-validation')
router.register(r'management', stock_views.StockManagementViewSet, basename='stock-management')

urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]
