from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, SizeViewSet, ColorViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'sizes', SizeViewSet)
router.register(r'colors', ColorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]