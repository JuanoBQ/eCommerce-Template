from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('providers/', views.PaymentProvidersView.as_view(), name='payment-providers'),
    path('webhooks/wompi/', views.WompiWebhookView.as_view(), name='wompi-webhook'),
    path('webhooks/mercadopago/', views.MercadoPagoWebhookView.as_view(), name='mercadopago-webhook'),
]
