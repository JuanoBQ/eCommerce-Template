from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import AdminSettings
from .serializers import AdminSettingsSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_settings_view(request):
    """
    Vista para obtener y actualizar configuraciones del sistema.
    """
    if request.method == 'GET':
        try:
            settings = AdminSettings.get_settings()
            serializer = AdminSettingsSerializer(settings)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Error al obtener configuraciones: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'POST':
        try:
            settings = AdminSettings.get_settings()
            serializer = AdminSettingsSerializer(settings, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Configuraciones actualizadas exitosamente',
                    'data': serializer.data
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response(
                {'error': f'Error al actualizar configuraciones: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reset_admin_settings_view(request):
    """
    Vista para restablecer configuraciones a valores por defecto.
    """
    try:
        settings = AdminSettings.get_settings()
        
        # Restablecer a valores por defecto
        settings.site_name = 'eCommerce Admin'
        settings.site_description = 'Panel de administración del eCommerce'
        settings.site_url = 'http://localhost:3000'
        settings.admin_email = 'admin@admin.com'
        
        settings.email_host = 'smtp.gmail.com'
        settings.email_port = 587
        settings.email_username = ''
        settings.email_password = ''
        settings.email_use_tls = True
        
        settings.session_timeout = 30
        settings.max_login_attempts = 5
        settings.password_min_length = 8
        settings.require_2fa = False
        
        settings.max_products_per_page = 20
        settings.enable_reviews = True
        settings.enable_wishlist = True
        settings.enable_notifications = True
        
        settings.order_auto_confirm = False
        settings.order_auto_cancel_hours = 24
        settings.enable_tracking = True
        
        settings.payment_gateway = 'wompi'
        settings.payment_test_mode = True
        settings.currency = 'COP'
        
        settings.email_notifications = True
        settings.sms_notifications = False
        settings.push_notifications = True
        
        settings.save()
        
        serializer = AdminSettingsSerializer(settings)
        return Response({
            'message': 'Configuraciones restablecidas exitosamente',
            'data': serializer.data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error al restablecer configuraciones: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats_view(request):
    """
    Vista para obtener estadísticas del sistema.
    """
    try:
        from django.contrib.auth import get_user_model
        from ecommerce.apps.products.models import Product
        from ecommerce.apps.orders.models import Order
        from ecommerce.apps.users.models import UserAddress
        
        User = get_user_model()
        
        stats = {
            'users': {
                'total': User.objects.count(),
                'active': User.objects.filter(is_active=True).count(),
                'staff': User.objects.filter(is_staff=True).count(),
                'customers': User.objects.filter(is_customer=True).count(),
            },
            'products': {
                'total': Product.objects.count(),
                'active': Product.objects.filter(is_active=True).count(),
                'with_variants': Product.objects.filter(variants__isnull=False).distinct().count(),
            },
            'orders': {
                'total': Order.objects.count(),
                'pending': Order.objects.filter(status='pending').count(),
                'confirmed': Order.objects.filter(status='confirmed').count(),
                'shipped': Order.objects.filter(status='shipped').count(),
                'delivered': Order.objects.filter(status='delivered').count(),
                'cancelled': Order.objects.filter(status='cancelled').count(),
            },
            'addresses': {
                'total': UserAddress.objects.count(),
                'default': UserAddress.objects.filter(is_default=True).count(),
            }
        }
        
        return Response(stats)
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener estadísticas: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
