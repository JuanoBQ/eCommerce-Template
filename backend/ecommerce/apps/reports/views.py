from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, F, Q
from django.utils import timezone
from datetime import timedelta
from .models import Report, Claim, ClaimMessage
from .serializers import ReportSerializer, ClaimSerializer, ClaimCreateSerializer, ClaimUpdateSerializer, ClaimMessageSerializer, ClaimMessageCreateSerializer
from ecommerce.apps.orders.models import Order
from ecommerce.apps.products.models import Product, ProductReview
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


class ClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reclamos.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ClaimCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClaimUpdateSerializer
        return ClaimSerializer
    
    def get_queryset(self):
        """
        Filtra los reclamos según el usuario.
        """
        if self.request.user.is_staff:
            return Claim.objects.all().select_related('user', 'order', 'product', 'resolved_by')
        return Claim.objects.filter(user=self.request.user).select_related('user', 'order', 'product', 'resolved_by')
    
    def perform_create(self, serializer):
        """
        Asigna el usuario actual al reclamo.
        """
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        """
        Actualiza el reclamo y marca como resuelto si es necesario.
        """
        instance = serializer.save()
        
        # Si se marca como resuelto, actualizar campos de resolución
        if instance.status == 'resolved' and not instance.resolved_at:
            instance.resolved_by = self.request.user
            instance.resolved_at = timezone.now()
            instance.save()
    
    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """
        Agrega un mensaje al reclamo.
        """
        claim = self.get_object()
        serializer = ClaimMessageCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Determinar el tipo de mensaje basado en el usuario
            if request.user.is_staff:
                message_type = 'admin_response'
            else:
                message_type = 'user_message'
            
            message = serializer.save(
                claim=claim,
                author=request.user,
                message_type=message_type
            )
            
            return Response(ClaimMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewsReportView(APIView):
    """
    Vista para generar reportes de reviews.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        """
        Genera un reporte de reviews.
        """
        # Estadísticas generales de reviews
        total_reviews = ProductReview.objects.count()
        approved_reviews = ProductReview.objects.filter(is_approved=True).count()
        pending_reviews = ProductReview.objects.filter(is_approved=False).count()
        average_rating = ProductReview.objects.filter(is_approved=True).aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Distribución de ratings
        rating_distribution = ProductReview.objects.filter(is_approved=True).values('rating').annotate(
            count=Count('id')
        ).order_by('rating')
        
        # Productos con más reviews
        top_reviewed_products = Product.objects.annotate(
            review_count=Count('reviews', filter=Q(reviews__is_approved=True))
        ).filter(review_count__gt=0).order_by('-review_count')[:10]
        
        # Reviews recientes
        recent_reviews = ProductReview.objects.filter(
            is_approved=True
        ).select_related('user', 'product').order_by('-created_at')[:10]
        
        # Reviews por mes
        monthly_reviews = ProductReview.objects.filter(
            is_approved=True,
            created_at__date__gte=timezone.now().date() - timedelta(days=365)
        ).extra(
            select={'month': 'strftime("%%Y-%%m", created_at)'}
        ).values('month').annotate(
            count=Count('id'),
            avg_rating=Avg('rating')
        ).order_by('month')
        
        return Response({
            'summary': {
                'total_reviews': total_reviews,
                'approved_reviews': approved_reviews,
                'pending_reviews': pending_reviews,
                'average_rating': round(average_rating, 2)
            },
            'rating_distribution': list(rating_distribution),
            'top_reviewed_products': [
                {
                    'id': product.id,
                    'name': product.name,
                    'review_count': product.review_count,
                    'average_rating': product.reviews.filter(is_approved=True).aggregate(avg=Avg('rating'))['avg'] or 0
                }
                for product in top_reviewed_products
            ],
            'recent_reviews': [
                {
                    'id': review.id,
                    'user_name': review.user.get_full_name(),
                    'product_name': review.product.name,
                    'rating': review.rating,
                    'title': review.title,
                    'created_at': review.created_at
                }
                for review in recent_reviews
            ],
            'monthly_reviews': list(monthly_reviews)
        })


class ClaimsReportView(APIView):
    """
    Vista para generar reportes de reclamos.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        """
        Genera un reporte de reclamos.
        """
        # Estadísticas generales de reclamos
        total_claims = Claim.objects.count()
        pending_claims = Claim.objects.filter(status='pending').count()
        in_review_claims = Claim.objects.filter(status='in_review').count()
        resolved_claims = Claim.objects.filter(status='resolved').count()
        rejected_claims = Claim.objects.filter(status='rejected').count()
        
        # Reclamos por tipo
        claims_by_type = Claim.objects.values('claim_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Reclamos por prioridad
        claims_by_priority = Claim.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Reclamos recientes
        recent_claims = Claim.objects.select_related('user', 'order', 'product').order_by('-created_at')[:10]
        
        # Tiempo promedio de resolución
        resolved_claims_with_time = Claim.objects.filter(
            status='resolved',
            resolved_at__isnull=False
        ).annotate(
            resolution_time=F('resolved_at') - F('created_at')
        )
        
        avg_resolution_time = None
        if resolved_claims_with_time.exists():
            total_seconds = sum(
                (claim.resolution_time.total_seconds() for claim in resolved_claims_with_time)
            )
            avg_resolution_time = total_seconds / resolved_claims_with_time.count()
        
        # Reclamos por mes
        monthly_claims = Claim.objects.filter(
            created_at__date__gte=timezone.now().date() - timedelta(days=365)
        ).extra(
            select={'month': 'strftime("%%Y-%%m", created_at)'}
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return Response({
            'summary': {
                'total_claims': total_claims,
                'pending_claims': pending_claims,
                'in_review_claims': in_review_claims,
                'resolved_claims': resolved_claims,
                'rejected_claims': rejected_claims,
                'avg_resolution_time_hours': round(avg_resolution_time / 3600, 2) if avg_resolution_time else None
            },
            'claims_by_type': list(claims_by_type),
            'claims_by_priority': list(claims_by_priority),
            'recent_claims': [
                {
                    'id': claim.id,
                    'user_name': claim.user.get_full_name(),
                    'title': claim.title,
                    'claim_type': claim.get_claim_type_display(),
                    'status': claim.get_status_display(),
                    'priority': claim.get_priority_display(),
                    'created_at': claim.created_at
                }
                for claim in recent_claims
            ],
            'monthly_claims': list(monthly_claims)
        })


class DashboardReportView(APIView):
    """
    Vista para generar reportes del dashboard principal.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get(self, request):
        """
        Genera un reporte del dashboard.
        """
        # Obtener parámetros de fecha
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Si no se proporcionan fechas, usar los últimos 30 días
        if not start_date or not end_date:
            end_date = timezone.now()
            start_date = end_date - timedelta(days=30)
        else:
            start_date = timezone.datetime.strptime(start_date, '%Y-%m-%d')
            end_date = timezone.datetime.strptime(end_date, '%Y-%m-%d')
        
        # Período anterior para comparación
        period_length = (end_date - start_date).days
        previous_start = start_date - timedelta(days=period_length)
        previous_end = start_date
        
        # Resumen actual
        current_orders = Order.objects.filter(created_at__range=[start_date, end_date])
        current_revenue = current_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        current_orders_count = current_orders.count()
        current_customers = User.objects.filter(date_joined__range=[start_date, end_date]).count()
        current_products = Product.objects.filter(created_at__range=[start_date, end_date]).count()
        
        # Resumen anterior
        previous_orders = Order.objects.filter(created_at__range=[previous_start, previous_end])
        previous_revenue = previous_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        previous_orders_count = previous_orders.count()
        previous_customers = User.objects.filter(date_joined__range=[previous_start, previous_end]).count()
        previous_products = Product.objects.filter(created_at__range=[previous_start, previous_end]).count()
        
        # Calcular crecimiento
        revenue_growth = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
        orders_growth = ((current_orders_count - previous_orders_count) / previous_orders_count * 100) if previous_orders_count > 0 else 0
        customers_growth = ((current_customers - previous_customers) / previous_customers * 100) if previous_customers > 0 else 0
        products_growth = ((current_products - previous_products) / previous_products * 100) if previous_products > 0 else 0
        
        # Datos mensuales
        monthly_data = []
        for i in range(6):  # Últimos 6 meses
            month_start = end_date - timedelta(days=30 * (i + 1))
            month_end = end_date - timedelta(days=30 * i)
            
            month_orders = Order.objects.filter(created_at__range=[month_start, month_end])
            month_revenue = month_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            month_orders_count = month_orders.count()
            month_customers = User.objects.filter(date_joined__range=[month_start, month_end]).count()
            month_products = Product.objects.filter(created_at__range=[month_start, month_end]).count()
            
            monthly_data.append({
                'period': month_start.strftime('%b'),
                'revenue': float(month_revenue),
                'orders': month_orders_count,
                'customers': month_customers,
                'products': month_products
            })
        
        monthly_data.reverse()
        
        # Top productos
        top_products = Product.objects.filter(
            orderitem__order__created_at__range=[start_date, end_date]
        ).annotate(
            sales=Count('orderitem'),
            revenue=Sum('orderitem__total_price')
        ).order_by('-sales')[:5]
        
        top_products_data = []
        for product in top_products:
            top_products_data.append({
                'id': product.id,
                'name': product.name,
                'sales': product.sales,
                'revenue': float(product.revenue or 0)
            })
        
        # Top clientes
        top_customers = User.objects.filter(
            orders__created_at__range=[start_date, end_date]
        ).annotate(
            orders_count=Count('orders'),
            total_spent=Sum('orders__total_amount')
        ).order_by('-total_spent')[:5]
        
        top_customers_data = []
        for customer in top_customers:
            top_customers_data.append({
                'id': customer.id,
                'name': customer.get_full_name(),
                'email': customer.email,
                'orders': customer.orders_count,
                'totalSpent': float(customer.total_spent or 0)
            })
        
        return Response({
            'summary': {
                'total_revenue': float(current_revenue),
                'total_orders': current_orders_count,
                'total_customers': current_customers,
                'total_products': current_products,
                'revenue_growth': revenue_growth,
                'orders_growth': orders_growth,
                'customers_growth': customers_growth,
                'products_growth': products_growth
            },
            'monthly_data': monthly_data,
            'top_products': top_products_data,
            'top_customers': top_customers_data
        })
