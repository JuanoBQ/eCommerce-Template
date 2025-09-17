from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.products.models import Product
from ecommerce.apps.users.models import User
from ecommerce.apps.products.models import ProductReview
from .models import Claim, ClaimMessage


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_report(request):
    """
    Vista para obtener reporte completo del dashboard.
    """
    try:
        # Obtener parámetros de fecha
        days = int(request.GET.get('days', 30))
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Estadísticas generales
        total_orders = Order.objects.count()  # Total de órdenes (todos los estados)
        total_revenue = Order.objects.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        total_customers = User.objects.filter(is_active=True).count()
        total_products = Order.objects.filter(payment_status='paid').count()  # Órdenes con pago aprobado/confirmado
        
        # Estadísticas del período seleccionado (solo pedidos con pago completado)
        period_orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            payment_status='paid'
        ).count()
        
        period_revenue = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            payment_status='paid'
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        period_customers = User.objects.filter(
            date_joined__gte=start_date,
            date_joined__lte=end_date
        ).count()
        
        # Calcular crecimiento (comparar con período anterior, solo pedidos con pago completado)
        prev_start_date = start_date - timedelta(days=days)
        prev_orders = Order.objects.filter(
            created_at__gte=prev_start_date,
            created_at__lt=start_date,
            payment_status='paid'
        ).count()
        
        prev_revenue = Order.objects.filter(
            created_at__gte=prev_start_date,
            created_at__lt=start_date,
            payment_status='paid'
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0.00')
        
        prev_customers = User.objects.filter(
            date_joined__gte=prev_start_date,
            date_joined__lt=start_date
        ).count()
        
        # Calcular porcentajes de crecimiento
        revenue_growth = calculate_growth(period_revenue, prev_revenue)
        orders_growth = calculate_growth(period_orders, prev_orders)
        customers_growth = calculate_growth(period_customers, prev_customers)
        
        # Datos mensuales para gráficos
        monthly_data = get_monthly_data(days)
        
        # Productos más vendidos
        top_products = get_top_products(start_date, end_date)
        
        # Mejores clientes
        top_customers = get_top_customers(start_date, end_date)
        
        return Response({
            'summary': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'total_customers': total_customers,
                'total_products': total_products,
                'revenue_growth': revenue_growth,
                'orders_growth': orders_growth,
                'customers_growth': customers_growth,
                'products_growth': 0  # No calculamos crecimiento de productos por ahora
            },
            'monthly_data': monthly_data,
            'top_products': top_products,
            'top_customers': top_customers
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        # Error en dashboard_report
        # Traceback details
        return Response(
            {'error': f'Error al generar reporte: {str(e)}', 'details': error_details},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def reviews_report(request):
    """
    Vista para obtener reporte de reviews.
    """
    try:
        # Estadísticas de reviews
        total_reviews = ProductReview.objects.count()
        approved_reviews = ProductReview.objects.filter(is_approved=True).count()
        pending_reviews = ProductReview.objects.filter(is_approved=False).count()
        
        # Rating promedio
        average_rating = ProductReview.objects.filter(
            is_approved=True
        ).aggregate(
            avg_rating=Avg('rating')
        )['avg_rating'] or 0
        
        # Distribución de ratings
        rating_distribution = get_rating_distribution()
        
        # Reviews por mes
        monthly_reviews = get_monthly_reviews()
        
        # Productos más revisados
        top_reviewed_products = get_top_reviewed_products()
        
        return Response({
            'summary': {
                'total_reviews': total_reviews,
                'approved_reviews': approved_reviews,
                'pending_reviews': pending_reviews,
                'average_rating': float(average_rating)
            },
            'rating_distribution': rating_distribution,
            'monthly_reviews': monthly_reviews,
            'top_reviewed_products': top_reviewed_products
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error al generar reporte de reviews: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def calculate_growth(current, previous):
    """Calcular porcentaje de crecimiento."""
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100, 1)


def get_monthly_data(days):
    """Obtener datos mensuales para gráficos."""
    from django.db.models.functions import TruncMonth
    
    # Obtener datos de los últimos meses
    months_ago = timezone.now() - timedelta(days=days)
    
    monthly_data = Order.objects.filter(
        created_at__gte=months_ago,
        payment_status='paid'  # Solo pedidos con pago completado
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        revenue=Sum('total_amount'),
        orders=Count('id')
    ).order_by('month')
    
    # Crear datos con nombres de meses
    months_es = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    result = []
    
    for data in monthly_data:
        month_date = data['month']
        month_name = months_es[month_date.month - 1]
        result.append({
            'period': month_name,
            'revenue': float(data['revenue'] or 0),
            'orders': data['orders'],
            'customers': 0,  # No calculamos clientes por mes por ahora
            'products': 0    # No calculamos productos por mes por ahora
        })
    
    return result


def get_top_products(start_date, end_date):
    """Obtener productos más vendidos (solo pedidos con pago completado)."""
    top_products = OrderItem.objects.filter(
        order__created_at__gte=start_date,
        order__created_at__lte=end_date,
        order__payment_status='paid'  # Solo pedidos con pago completado
    ).values(
        'product__id',
        'product__name'
    ).annotate(
        sales=Sum('quantity'),
        revenue=Sum(F('quantity') * F('unit_price'))
    ).order_by('-sales')[:10]
    
    result = []
    for item in top_products:
        result.append({
            'id': item['product__id'],
            'name': item['product__name'],
            'sales': item['sales'],
            'revenue': float(item['revenue'] or 0)
        })
    
    return result


def get_top_customers(start_date, end_date):
    """Obtener mejores clientes (solo pedidos con pago completado)."""
    top_customers = Order.objects.filter(
        created_at__gte=start_date,
        created_at__lte=end_date,
        payment_status='paid'  # Solo pedidos con pago completado
    ).values(
        'user',
        'first_name',
        'last_name',
        'email'
    ).annotate(
        orders=Count('id'),
        total_spent=Sum('total_amount')
    ).order_by('-total_spent')[:10]
    
    result = []
    for customer in top_customers:
        result.append({
            'id': customer['user'],
            'name': f"{customer['first_name']} {customer['last_name']}",
            'email': customer['email'],
            'orders': customer['orders'],
            'totalSpent': float(customer['total_spent'] or 0)
        })
    
    return result


def get_rating_distribution():
    """Obtener distribución de ratings."""
    distribution = ProductReview.objects.filter(
        is_approved=True
    ).values('rating').annotate(
        count=Count('id')
    ).order_by('rating')
    
    result = []
    for item in distribution:
        result.append({
            'rating': item['rating'],
            'count': item['count']
        })
    
    return result


def get_monthly_reviews():
    """Obtener reviews por mes."""
    from django.db.models.functions import TruncMonth
    
    monthly_reviews = ProductReview.objects.annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    months_es = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    result = []
    
    for data in monthly_reviews:
        month_date = data['month']
        month_name = months_es[month_date.month - 1]
        result.append({
            'month': month_name,
            'count': data['count']
        })
    
    return result


def get_top_reviewed_products():
    """Obtener productos más revisados."""
    top_products = ProductReview.objects.filter(
        is_approved=True
    ).values(
        'product__id',
        'product__name'
    ).annotate(
        review_count=Count('id'),
        average_rating=Avg('rating')
    ).order_by('-review_count')[:10]
    
    result = []
    for product in top_products:
        result.append({
            'id': product['product__id'],
            'name': product['product__name'],
            'review_count': product['review_count'],
            'average_rating': float(product['average_rating'] or 0)
        })
    
    return result


# Claims endpoints
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def claims_list(request):
    """Listar todos los reclamos."""
    try:
        claims = Claim.objects.select_related('user', 'order', 'product', 'resolved_by').all()
        
        # Filtrar por estado si se proporciona
        status_filter = request.GET.get('status')
        if status_filter:
            claims = claims.filter(status=status_filter)
        
        # Filtrar por prioridad si se proporciona
        priority = request.GET.get('priority')
        if priority:
            claims = claims.filter(priority=priority)
        
        # Ordenar por fecha de creación (más recientes primero)
        claims = claims.order_by('-created_at')
        
        result = []
        for claim in claims:
            result.append({
                'id': claim.id,
                'user': claim.user.id,
                'user_name': f"{claim.user.first_name} {claim.user.last_name}",
                'user_email': claim.user.email,
                'user_phone': getattr(claim.user, 'phone', ''),
                'claim_type': claim.claim_type,
                'title': claim.title,
                'description': claim.description,
                'status': claim.status,
                'priority': claim.priority,
                'order': claim.order.id if claim.order else None,
                'order_number': claim.order.order_number if claim.order else None,
                'product': claim.product.id if claim.product else None,
                'product_name': claim.product.name if claim.product else None,
                'product_sku': claim.product.sku if claim.product else None,
                'admin_response': claim.admin_response,
                'resolved_by': claim.resolved_by.id if claim.resolved_by else None,
                'resolved_by_name': f"{claim.resolved_by.first_name} {claim.resolved_by.last_name}" if claim.resolved_by else None,
                'resolved_at': claim.resolved_at.isoformat() if claim.resolved_at else None,
                'created_at': claim.created_at.isoformat(),
                'updated_at': claim.updated_at.isoformat()
            })
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener reclamos: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def claim_detail(request, claim_id):
    """Obtener detalles de un reclamo específico."""
    try:
        claim = Claim.objects.select_related('user', 'order', 'product', 'resolved_by').get(id=claim_id)
        messages = ClaimMessage.objects.filter(claim=claim).order_by('created_at')
        
        claim_data = {
            'id': claim.id,
            'user': claim.user.id,
            'user_name': f"{claim.user.first_name} {claim.user.last_name}",
            'user_email': claim.user.email,
            'user_phone': getattr(claim.user, 'phone', ''),
            'claim_type': claim.claim_type,
            'title': claim.title,
            'description': claim.description,
            'status': claim.status,
            'priority': claim.priority,
            'order': claim.order.id if claim.order else None,
            'order_number': claim.order.order_number if claim.order else None,
            'product': claim.product.id if claim.product else None,
            'product_name': claim.product.name if claim.product else None,
            'product_sku': claim.product.sku if claim.product else None,
            'admin_response': claim.admin_response,
            'resolved_by': claim.resolved_by.id if claim.resolved_by else None,
            'resolved_by_name': f"{claim.resolved_by.first_name} {claim.resolved_by.last_name}" if claim.resolved_by else None,
            'resolved_at': claim.resolved_at.isoformat() if claim.resolved_at else None,
            'created_at': claim.created_at.isoformat(),
            'updated_at': claim.updated_at.isoformat(),
            'messages': []
        }
        
        for message in messages:
            claim_data['messages'].append({
                'id': message.id,
                'claim': message.claim.id,
                'message_type': message.message_type,
                'content': message.content,
                'author': message.author.id,
                'author_name': message.author_name,
                'author_email': message.author_email,
                'created_at': message.created_at.isoformat(),
                'updated_at': message.updated_at.isoformat()
            })
        
        return Response(claim_data, status=status.HTTP_200_OK)
        
    except Claim.DoesNotExist:
        return Response(
            {'error': 'Reclamo no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al obtener reclamo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_claim(request):
    """Crear un nuevo reclamo."""
    try:
        data = request.data
        data['user'] = request.user.id
        
        claim = Claim.objects.create(
            user_id=data['user'],
            claim_type=data.get('claim_type'),
            title=data.get('title'),
            description=data.get('description'),
            order_id=data.get('order'),
            product_id=data.get('product')
        )
        
        return Response({
            'id': claim.id,
            'message': 'Reclamo creado exitosamente'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Error al crear reclamo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_claim(request, claim_id):
    """Actualizar un reclamo."""
    try:
        claim = Claim.objects.get(id=claim_id)
        data = request.data
        
        # Solo permitir actualizar ciertos campos
        if 'status' in data:
            claim.status = data['status']
        if 'priority' in data:
            claim.priority = data['priority']
        if 'admin_response' in data:
            claim.admin_response = data['admin_response']
        if 'resolved_by' in data:
            claim.resolved_by_id = data['resolved_by']
            claim.resolved_at = timezone.now()
        
        claim.save()
        
        return Response({
            'id': claim.id,
            'message': 'Reclamo actualizado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Claim.DoesNotExist:
        return Response(
            {'error': 'Reclamo no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al actualizar reclamo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_claim(request, claim_id):
    """Eliminar un reclamo."""
    try:
        claim = Claim.objects.get(id=claim_id)
        claim.delete()
        
        return Response({
            'message': 'Reclamo eliminado exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Claim.DoesNotExist:
        return Response(
            {'error': 'Reclamo no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al eliminar reclamo: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_claim_message(request, claim_id):
    """Agregar un mensaje a un reclamo."""
    try:
        claim = Claim.objects.get(id=claim_id)
        data = request.data
        
        message = ClaimMessage.objects.create(
            claim=claim,
            message_type=data.get('message_type', 'user_message'),
            content=data.get('content'),
            author_id=request.user.id,
            author_name=f"{request.user.first_name} {request.user.last_name}",
            author_email=request.user.email
        )
        
        return Response({
            'id': message.id,
            'message': 'Mensaje agregado exitosamente'
        }, status=status.HTTP_201_CREATED)
        
    except Claim.DoesNotExist:
        return Response(
            {'error': 'Reclamo no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al agregar mensaje: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )