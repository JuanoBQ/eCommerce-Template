from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Report
from .serializers import ReportSerializer
from ecommerce.apps.orders.models import Order
from ecommerce.apps.products.models import Product
from ecommerce.apps.users.models import User


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reportes.
    """
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        """
        Filtra los reportes según el usuario.
        """
        if self.request.user.is_staff:
            return Report.objects.all().select_related('generated_by')
        return Report.objects.filter(generated_by=self.request.user).select_related('generated_by')
    
    def perform_create(self, serializer):
        """
        Asigna el usuario actual al reporte.
        """
        serializer.save(generated_by=self.request.user)


class SalesReportView(APIView):
    """
    Vista para generar reportes de ventas.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        """
        Genera un reporte de ventas.
        """
        # Obtener parámetros de fecha
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()
        
        # Calcular métricas de ventas
        orders = Order.objects.filter(
            created_at__date__range=[start_date, end_date],
            status='completed'
        )
        
        total_sales = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = orders.count()
        average_order_value = orders.aggregate(avg=Avg('total_amount'))['avg'] or 0
        
        # Ventas por día
        daily_sales = orders.extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(
            total=Sum('total_amount'),
            count=Count('id')
        ).order_by('day')
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_sales': total_sales,
                'total_orders': total_orders,
                'average_order_value': average_order_value
            },
            'daily_sales': list(daily_sales)
        })


class ProductReportView(APIView):
    """
    Vista para generar reportes de productos.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        """
        Genera un reporte de productos.
        """
        # Productos más vendidos
        top_products = Product.objects.annotate(
            total_sold=Sum('orderitem__quantity')
        ).order_by('-total_sold')[:10]
        
        # Productos con stock bajo
        low_stock_products = Product.objects.filter(
            inventory_quantity__lte=models.F('low_stock_threshold')
        )
        
        # Productos inactivos
        inactive_products = Product.objects.filter(is_active=False)
        
        return Response({
            'top_products': [
                {
                    'id': product.id,
                    'name': product.name,
                    'total_sold': product.total_sold or 0
                }
                for product in top_products
            ],
            'low_stock_products': [
                {
                    'id': product.id,
                    'name': product.name,
                    'current_stock': product.inventory_quantity,
                    'low_stock_threshold': product.low_stock_threshold
                }
                for product in low_stock_products
            ],
            'inactive_products': [
                {
                    'id': product.id,
                    'name': product.name,
                    'status': product.status
                }
                for product in inactive_products
            ]
        })


class UserReportView(APIView):
    """
    Vista para generar reportes de usuarios.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        """
        Genera un reporte de usuarios.
        """
        # Usuarios más activos
        top_users = User.objects.annotate(
            total_orders=Count('orders'),
            total_spent=Sum('orders__total_amount')
        ).order_by('-total_spent')[:10]
        
        # Nuevos usuarios
        new_users = User.objects.filter(
            date_joined__date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Usuarios inactivos
        inactive_users = User.objects.filter(
            last_login__date__lt=timezone.now().date() - timedelta(days=90)
        ).count()
        
        return Response({
            'top_users': [
                {
                    'id': user.id,
                    'name': user.get_full_name(),
                    'email': user.email,
                    'total_orders': user.total_orders or 0,
                    'total_spent': user.total_spent or 0
                }
                for user in top_users
            ],
            'summary': {
                'new_users': new_users,
                'inactive_users': inactive_users
            }
        })
