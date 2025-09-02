from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer, 
    OrderItemSerializer
)
from ecommerce.apps.users.permissions import IsOwnerOrAdmin


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar órdenes.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción.
        """
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        else:
            return OrderDetailSerializer
    
    def get_queryset(self):
        """
        Filtra las órdenes según el usuario.
        """
        queryset = Order.objects.select_related('user').prefetch_related('items__product')
        
        if self.request.user.is_staff:
            return queryset.all()
        return queryset.filter(user=self.request.user)
    
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
        if order.status in ['pending', 'confirmed']:
            order.status = 'cancelled'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Order cannot be cancelled'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirma una orden.
        """
        order = self.get_object()
        if order.status == 'pending':
            order.status = 'confirmed'
            order.save()
            return Response({'status': 'Order confirmed'})
        return Response(
            {'error': 'Order cannot be confirmed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Marca una orden como en proceso.
        """
        order = self.get_object()
        if order.status == 'confirmed':
            order.status = 'processing'
            order.save()
            return Response({'status': 'Order processing'})
        return Response(
            {'error': 'Order cannot be processed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """
        Marca una orden como enviada.
        """
        order = self.get_object()
        if order.status == 'processing':
            order.status = 'shipped'
            order.save()
            return Response({'status': 'Order shipped'})
        return Response(
            {'error': 'Order cannot be shipped'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """
        Marca una orden como entregada.
        """
        order = self.get_object()
        if order.status == 'shipped':
            order.status = 'delivered'
            order.save()
            return Response({'status': 'Order delivered'})
        return Response(
            {'error': 'Order cannot be delivered'}, 
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
