from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer
from ecommerce.apps.users.permissions import IsOwnerOrAdmin


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar pagos.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Filtra los pagos según el usuario.
        """
        if self.request.user.is_staff:
            return Payment.objects.all().select_related('user', 'order')
        return Payment.objects.filter(user=self.request.user).select_related('user', 'order')
    
    def perform_create(self, serializer):
        """
        Asigna el usuario actual al pago.
        """
        serializer.save(user=self.request.user)


class WompiPaymentView(APIView):
    """
    Vista para procesar pagos con Wompi.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Procesa un pago con Wompi.
        """
        # Aquí iría la lógica de integración con Wompi
        return Response({'message': 'Wompi payment processed'}, status=status.HTTP_200_OK)


class MercadoPagoPaymentView(APIView):
    """
    Vista para procesar pagos con MercadoPago.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Procesa un pago con MercadoPago.
        """
        # Aquí iría la lógica de integración con MercadoPago
        return Response({'message': 'MercadoPago payment processed'}, status=status.HTTP_200_OK)
