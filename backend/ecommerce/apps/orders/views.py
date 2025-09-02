from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from ecommerce.apps.users.permissions import IsOwnerOrAdmin


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar órdenes.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Filtra las órdenes según el usuario.
        """
        if self.request.user.is_staff:
            return Order.objects.all().select_related('user')
        return Order.objects.filter(user=self.request.user).select_related('user')
    
    def perform_create(self, serializer):
        """
        Asigna el usuario actual a la orden.
        """
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancela una orden.
        """
        order = self.get_object()
        if order.status in ['pending', 'processing']:
            order.status = 'cancelled'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Order cannot be cancelled'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Marca una orden como completada.
        """
        order = self.get_object()
        if order.status == 'processing':
            order.status = 'completed'
            order.save()
            return Response({'status': 'Order completed'})
        return Response(
            {'error': 'Order cannot be completed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar items de órdenes.
    """
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Filtra los items según el usuario.
        """
        if self.request.user.is_staff:
            return OrderItem.objects.all().select_related('order', 'product')
        return OrderItem.objects.filter(
            order__user=self.request.user
        ).select_related('order', 'product')
