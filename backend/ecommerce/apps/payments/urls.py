from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('wompi/', views.WompiPaymentView.as_view(), name='wompi-payment'),
    path('mercadopago/', views.MercadoPagoPaymentView.as_view(), name='mercadopago-payment'),
]
