from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q, Count, Sum
from decimal import Decimal
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'total_amount', 'status', 'payment_status']
    ordering = ['-created_at']
    filterset_fields = ['status', 'payment_status']
    
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
            # Devolver stock si la orden estaba confirmada
            if order.status == 'confirmed':
                order.cancel_stock()
            
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
            
            # Procesar stock al confirmar la orden
            order.process_stock()
            
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def order_stats(request):
    """
    Vista para obtener estadísticas de órdenes.
    """
    try:
        # Estadísticas generales
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        confirmed_orders = Order.objects.filter(status='confirmed').count()
        processing_orders = Order.objects.filter(status='processing').count()
        shipped_orders = Order.objects.filter(status='shipped').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()
        
        # Estadísticas de pago
        paid_orders = Order.objects.filter(payment_status='paid').count()
        pending_payment = Order.objects.filter(payment_status='pending').count()
        failed_payment = Order.objects.filter(payment_status='failed').count()
        refunded_orders = Order.objects.filter(payment_status='refunded').count()
        
        # Ingresos (solo órdenes con pago completado)
        total_revenue = Order.objects.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        # Ingresos por estado (solo órdenes con pago completado)
        delivered_revenue = Order.objects.filter(
            status='delivered', 
            payment_status='paid'
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        # Órdenes con pago completado (solo payment_status='paid')
        paid_orders_completed = Order.objects.filter(
            payment_status='paid'
        ).count()
        
        # Órdenes completadas (delivered + payment completed)
        completed_orders = Order.objects.filter(
            status='delivered',
            payment_status='paid'
        ).count()
        
        # Órdenes por mes (últimos 6 meses)
        from django.utils import timezone
        from datetime import timedelta
        six_months_ago = timezone.now() - timedelta(days=180)
        orders_last_6_months = Order.objects.filter(
            created_at__gte=six_months_ago
        ).count()
        
        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'confirmed_orders': confirmed_orders,
            'processing_orders': processing_orders,
            'shipped_orders': shipped_orders,
            'delivered_orders': delivered_orders,
            'paid_orders_completed': paid_orders_completed,  # solo payment_status='completed'
            'completed_orders': completed_orders,  # delivered + payment completed
            'cancelled_orders': cancelled_orders,
            'paid_orders': paid_orders,
            'pending_payment': pending_payment,
            'failed_payment': failed_payment,
            'refunded_orders': refunded_orders,
            'total_revenue': float(total_revenue),
            'delivered_revenue': float(delivered_revenue),
            'orders_last_6_months': orders_last_6_months,
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener estadísticas: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def monthly_stats(request):
    """
    Vista para obtener estadísticas mensuales de órdenes e ingresos.
    """
    try:
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models.functions import TruncMonth
        from django.db.models import Sum, Count
        
        # Obtener datos de los últimos 7 meses
        seven_months_ago = timezone.now() - timedelta(days=210)
        
        # Agrupar órdenes por mes
        monthly_data = Order.objects.filter(
            created_at__gte=seven_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total_amount'),
            orders=Count('id')
        ).order_by('month')
        
        # Crear datos mensuales con nombres de meses en español
        months_es = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        result = []
        
        for data in monthly_data:
            month_date = data['month']
            month_name = months_es[month_date.month - 1]
            result.append({
                'month': month_name,
                'revenue': float(data['revenue'] or 0),
                'orders': data['orders']
            })
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener estadísticas mensuales: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activity(request):
    """
    Vista para obtener actividad reciente del sistema.
    """
    try:
        from django.utils import timezone
        from datetime import timedelta
        from ecommerce.apps.products.models import Product
        from ecommerce.apps.users.models import User
        
        # Obtener actividad de los últimos 7 días
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        activities = []
        
        # Actividad de órdenes recientes
        recent_orders = Order.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:5]
        
        for order in recent_orders:
            activities.append({
                'id': f'order-{order.id}',
                'action': 'Nuevo pedido',
                'user': f"{order.first_name} {order.last_name}",
                'time': order.created_at.isoformat(),
                'amount': f"${order.total_amount:,.2f}",
                'type': 'order'
            })
        
        # Actividad de productos recientes
        recent_products = Product.objects.filter(
            updated_at__gte=seven_days_ago
        ).order_by('-updated_at')[:3]
        
        for product in recent_products:
            activities.append({
                'id': f'product-{product.id}',
                'action': 'Producto actualizado',
                'user': 'Admin',
                'time': product.updated_at.isoformat(),
                'amount': product.name,
                'type': 'product'
            })
        
        # Actividad de usuarios recientes
        recent_users = User.objects.filter(
            date_joined__gte=seven_days_ago
        ).order_by('-date_joined')[:2]
        
        for user in recent_users:
            activities.append({
                'id': f'user-{user.id}',
                'action': 'Usuario registrado',
                'user': f"{user.first_name} {user.last_name}",
                'time': user.date_joined.isoformat(),
                'amount': user.email,
                'type': 'user'
            })
        
        # Ordenar por fecha (más reciente primero)
        activities.sort(key=lambda x: x['time'], reverse=True)
        
        return Response(activities[:10], status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener actividad reciente: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )