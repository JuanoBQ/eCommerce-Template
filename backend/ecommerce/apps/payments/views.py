from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Payment
from .serializers import PaymentSerializer
from .services.payment_factory import PaymentServiceFactory
from ecommerce.apps.users.permissions import IsOwnerOrAdmin
from ecommerce.apps.orders.models import Order


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
    
    @action(detail=False, methods=['post'])
    def create_payment_intent(self, request):
        """
        Crea una intención de pago.
        """
        try:
            # Obtener datos de la solicitud
            order_id = request.data.get('order_id')
            provider = request.data.get('provider')
            
            if not order_id or not provider:
                return Response(
                    {'success': False, 'error': 'order_id y provider son requeridos'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener la orden
            try:
                order = Order.objects.get(id=order_id, user=request.user)
            except Order.DoesNotExist:
                return Response(
                    {'success': False, 'error': 'Orden no encontrada'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verificar que el proveedor esté disponible
            if not PaymentServiceFactory.is_provider_available(provider):
                return Response(
                    {'success': False, 'error': f'Proveedor {provider} no disponible'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear servicio de pago
            payment_service = PaymentServiceFactory.create_service(provider)
            if not payment_service:
                return Response(
                    {'success': False, 'error': 'Error creando servicio de pago'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Calcular el monto total de la orden
            total_amount = order.total_amount
            
            # Crear intención de pago en la pasarela
            result = payment_service.create_payment_intent(order, total_amount, 'COP')
            
            if result['success']:
                # Crear registro de pago en la base de datos
                payment = Payment.objects.create(
                    order=order,
                    user=request.user,
                    amount=total_amount,
                    currency='COP',
                    method='credit_card',  # Se actualizará según el método elegido
                    provider=provider,
                    provider_payment_id=result.get('transaction_id', result.get('preference_id', '')),
                    status='pending',
                    provider_response=result
                )
                
                return Response({
                    'success': True,
                    'payment_id': payment.id,
                    'payment_url': result.get('payment_url'),
                    'client_secret': result.get('client_secret'),
                    'expires_at': result.get('expires_at'),
                    'provider': provider
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Error desconocido'),
                    'error_code': result.get('error_code', 'UNKNOWN_ERROR')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response(
                {'success': False, 'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        """
        Verifica el estado de un pago.
        """
        try:
            payment = self.get_object()
            
            # Crear servicio de pago
            payment_service = PaymentServiceFactory.create_service(payment.provider)
            if not payment_service:
                return Response(
                    {'success': False, 'error': 'Error creando servicio de pago'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Verificar pago en la pasarela
            result = payment_service.verify_payment(payment.provider_payment_id)
            
            if result['success']:
                # Actualizar el estado del pago si es necesario
                mapped_status = self._map_provider_status(payment.provider, result['status'])
                if payment.status != mapped_status:
                    payment.status = mapped_status
                    payment.save()
                    
                    # Actualizar el estado de pago de la orden
                    if mapped_status == 'completed':
                        order = payment.order
                        order.payment_status = 'paid'
                        order.save()
                
                return Response({
                    'success': True,
                    'status': mapped_status,
                    'amount': float(result.get('amount', payment.amount)),
                    'currency': result.get('currency', payment.currency),
                    'processed_at': result.get('processed_at')
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Error verificando pago'),
                    'error_code': result.get('error_code', 'VERIFICATION_ERROR')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response(
                {'success': False, 'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def refund_payment(self, request, pk=None):
        """
        Procesa un reembolso de pago.
        """
        try:
            payment = self.get_object()
            
            # Verificar que el pago pueda ser reembolsado
            if not payment.can_be_refunded:
                return Response(
                    {'success': False, 'error': 'El pago no puede ser reembolsado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener el monto del reembolso (opcional)
            amount = request.data.get('amount')
            if amount:
                amount = Decimal(str(amount))
            
            # Crear servicio de pago
            payment_service = PaymentServiceFactory.create_service(payment.provider)
            if not payment_service:
                return Response(
                    {'success': False, 'error': 'Error creando servicio de pago'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Procesar reembolso en la pasarela
            result = payment_service.refund_payment(payment.provider_payment_id, amount)
            
            if result['success']:
                # Actualizar el estado del pago
                payment.status = 'refunded' if amount is None or amount == payment.amount else 'partially_refunded'
                payment.save()
                
                # Actualizar el estado de pago de la orden
                order = payment.order
                order.payment_status = 'refunded' if amount is None or amount == payment.amount else 'partially_refunded'
                order.save()
                
                return Response({
                    'success': True,
                    'refund_id': result.get('refund_id'),
                    'amount': float(result.get('amount', amount or payment.amount)),
                    'status': result.get('status')
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Error procesando reembolso'),
                    'error_code': result.get('error_code', 'REFUND_ERROR')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response(
                {'success': False, 'error': f'Error interno: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _map_provider_status(self, provider, provider_status):
        """
        Mapea el estado del proveedor al estado interno.
        """
        if provider == 'wompi':
            mapping = {
                'PENDING': 'pending',
                'APPROVED': 'completed',
                'DECLINED': 'failed',
                'VOIDED': 'cancelled',
                'REFUNDED': 'refunded',
            }
        elif provider == 'mercadopago':
            mapping = {
                'pending': 'pending',
                'approved': 'completed',
                'authorized': 'completed',
                'in_process': 'processing',
                'in_mediation': 'processing',
                'rejected': 'failed',
                'cancelled': 'cancelled',
                'refunded': 'refunded',
                'charged_back': 'refunded',
            }
        else:
            return 'pending'
        
        return mapping.get(provider_status, 'pending')


class PaymentProvidersView(APIView):
    """
    Vista para obtener proveedores de pago disponibles.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Obtiene los proveedores de pago disponibles.
        """
        try:
            country = request.GET.get('country', 'CO')
            currency = request.GET.get('currency', 'COP')
            
            # Obtener todos los proveedores y sus configuraciones
            all_configs = PaymentServiceFactory.get_all_configs()
            
            # Filtrar proveedores que soportan el país y moneda
            available_providers = []
            filtered_configs = {}
            
            for provider, config in all_configs.items():
                if (country.upper() in config.get('supported_countries', []) and 
                    currency.upper() in config.get('supported_currencies', [])):
                    available_providers.append(provider)
                    filtered_configs[provider] = config
            
            # Si no hay proveedores específicos, usar el por defecto
            if not available_providers:
                default_provider = PaymentServiceFactory.get_default_provider()
                available_providers = [default_provider]
                filtered_configs = {default_provider: all_configs[default_provider]}
            
            # Obtener proveedor por defecto
            default_provider = PaymentServiceFactory.get_provider_for_country(country)
            
            return Response({
                'providers': available_providers,
                'configs': filtered_configs,
                'default_provider': default_provider
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error obteniendo proveedores: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WompiWebhookView(APIView):
    """
    Vista para manejar webhooks de Wompi.
    """
    permission_classes = []  # Los webhooks no requieren autenticación de usuario
    
    def post(self, request):
        """
        Procesa un webhook de Wompi.
        """
        try:
            # Verificar la firma del webhook (si está configurada)
            signature = request.META.get('HTTP_SIGNATURE', '')
            payload = request.body.decode('utf-8')
            
            # Crear servicio de Wompi
            wompi_service = PaymentServiceFactory.create_service('wompi')
            if not wompi_service:
                return Response({'error': 'Error creando servicio'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Verificar la firma si está configurada
            if wompi_service.webhook_secret and signature:
                if not wompi_service.verify_webhook(payload, signature):
                    return Response({'error': 'Firma inválida'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Procesar el webhook
            result = wompi_service.process_webhook(request.data)
            
            if result['success']:
                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': f'Error procesando webhook: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MercadoPagoWebhookView(APIView):
    """
    Vista para manejar webhooks de MercadoPago.
    """
    permission_classes = []  # Los webhooks no requieren autenticación de usuario
    
    def post(self, request):
        """
        Procesa un webhook de MercadoPago.
        """
        try:
            # Verificar la firma del webhook (si está configurada)
            signature = request.META.get('HTTP_SIGNATURE', '')
            payload = request.body.decode('utf-8')
            
            # Crear servicio de MercadoPago
            mercadopago_service = PaymentServiceFactory.create_service('mercadopago')
            if not mercadopago_service:
                return Response({'error': 'Error creando servicio'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Verificar la firma si está configurada
            if mercadopago_service.webhook_secret and signature:
                if not mercadopago_service.verify_webhook(payload, signature):
                    return Response({'error': 'Firma inválida'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Procesar el webhook
            result = mercadopago_service.process_webhook(request.data)
            
            if result['success']:
                return Response({'status': 'success'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': f'Error procesando webhook: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
