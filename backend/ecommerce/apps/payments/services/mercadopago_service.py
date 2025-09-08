"""
Servicio de integración con MercadoPago.
"""
import requests
import hmac
import hashlib
from typing import Dict, Any, Optional
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from ..models import Payment
from .base import BasePaymentService


class MercadoPagoService(BasePaymentService):
    """
    Servicio para integración con MercadoPago.
    """
    
    def __init__(self):
        super().__init__()
        self.base_url = self._get_base_url()
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.private_key}'
        }
    
    def get_environment(self) -> str:
        return getattr(settings, 'MERCADOPAGO_ENVIRONMENT', 'sandbox')
    
    def get_public_key(self) -> str:
        return getattr(settings, 'MERCADOPAGO_PUBLIC_KEY', '')
    
    def get_private_key(self) -> str:
        return getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', '')
    
    def get_webhook_secret(self) -> str:
        return getattr(settings, 'MERCADOPAGO_WEBHOOK_SECRET', '')
    
    def _get_base_url(self) -> str:
        """Obtiene la URL base según el entorno."""
        return 'https://api.mercadopago.com'
    
    def create_payment_intent(self, order, amount: Decimal, currency: str = 'COP') -> Dict[str, Any]:
        """
        Crea una intención de pago en MercadoPago.
        """
        try:
            # Verificar credenciales
            if not self.public_key or not self.private_key:
                return {
                    'success': False,
                    'error': 'Credenciales de MercadoPago no configuradas',
                    'error_code': 'MISSING_CREDENTIALS'
                }

            # Formatear monto para MercadoPago
            amount_cents = int(amount)
            
            # Crear preferencia de pago
            preference_data = {
                'items': [
                    {
                        'id': str(order.id),
                        'title': f'Orden {order.order_number}',
                        'description': f'Compra de {order.items.count()} productos',
                        'quantity': 1,
                        'unit_price': amount_cents,
                        'currency_id': currency
                    }
                ],
                'payer': {
                    'name': order.user.first_name,
                    'surname': order.user.last_name,
                    'email': order.user.email,
                    'phone': {
                        'number': order.user.phone or ''
                    }
                },
                'back_urls': {
                    'success': f"{settings.FRONTEND_URL}/checkout/success?order={order.order_number}",
                    'failure': f"{settings.FRONTEND_URL}/checkout/failure?order={order.order_number}",
                    'pending': f"{settings.FRONTEND_URL}/checkout/pending?order={order.order_number}"
                },
                'external_reference': order.order_number,
                'notification_url': f"{settings.BACKEND_URL}/api/payments/webhooks/mercadopago/",
                'auto_return': 'approved',
                'payment_methods': {
                    'excluded_payment_methods': [],
                    'excluded_payment_types': [],
                    'installments': 12
                }
            }
            
            # Agregar información de envío si existe
            if order.shipping_address:
                preference_data['shipments'] = {
                    'receiver_address': self._get_shipping_address_data(order)
                }
            
            # Crear la preferencia en MercadoPago
            response = requests.post(
                f"{self.base_url}/checkout/preferences",
                headers=self.headers,
                json=preference_data,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                payment_url = data.get('sandbox_init_point') if self.is_sandbox() else data.get('init_point')
                
                return {
                    'success': True,
                    'transaction_id': data['id'],
                    'reference': order.order_number,
                    'status': 'PENDING',
                    'payment_url': payment_url,
                    'raw_response': data
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('message', 'Error desconocido'),
                    'error_code': error_data.get('error', 'UNKNOWN_ERROR'),
                    'raw_response': error_data
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Error de conexión: {str(e)}',
                'error_code': 'CONNECTION_ERROR'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def process_payment(self, payment_intent_id: str, payment_method: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa un pago en MercadoPago.
        """
        try:
            return {
                'success': True,
                'message': 'Redirigir al usuario a MercadoPago para completar el pago',
                'payment_url': payment_method.get('payment_url'),
                'preference_id': payment_intent_id
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar pago: {str(e)}',
                'error_code': 'PROCESSING_ERROR'
            }
    
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Verifica el estado de un pago en MercadoPago.
        """
        try:
            response = requests.get(
                f"{self.base_url}/v1/payments/{payment_id}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    'success': True,
                    'status': data['status'],
                    'amount': self.parse_amount(data['transaction_amount'], data['currency_id']),
                    'currency': data['currency_id'],
                    'reference': data.get('external_reference'),
                    'payment_method': data.get('payment_method_id'),
                    'processed_at': data.get('date_approved'),
                    'raw_response': data
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('message', 'Error al verificar pago'),
                    'error_code': error_data.get('error', 'VERIFICATION_ERROR'),
                    'raw_response': error_data
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Error de conexión: {str(e)}',
                'error_code': 'CONNECTION_ERROR'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def refund_payment(self, payment_id: str, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Reembolsa un pago en MercadoPago.
        """
        try:
            # Verificar el pago
            verify_result = self.verify_payment(payment_id)
            if not verify_result['success']:
                return verify_result
            
            # Determinar monto del reembolso
            if amount is None:
                amount = verify_result['amount']
            
            amount_cents = int(amount)
            
            # Crear reembolso
            refund_data = {
                'amount': amount_cents
            }
            
            response = requests.post(
                f"{self.base_url}/v1/payments/{payment_id}/refunds",
                headers=self.headers,
                json=refund_data,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                return {
                    'success': True,
                    'refund_id': data['id'],
                    'amount': self.parse_amount(data['amount'], data['currency_id']),
                    'status': data['status'],
                    'raw_response': data
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('message', 'Error al procesar reembolso'),
                    'error_code': error_data.get('error', 'REFUND_ERROR'),
                    'raw_response': error_data
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Error de conexión: {str(e)}',
                'error_code': 'CONNECTION_ERROR'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def verify_webhook(self, payload: str, signature: str) -> bool:
        """
        Verifica la autenticidad de un webhook de MercadoPago.
        """
        try:
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
        except Exception:
            return False
    
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa un webhook de MercadoPago.
        """
        try:
            # Obtener ID del pago del webhook
            payment_id = payload.get('data', {}).get('id')
            if not payment_id:
                return {
                    'success': False,
                    'error': 'No se encontró ID de pago en el webhook'
                }
            
            # Verificar información del pago
            verify_result = self.verify_payment(payment_id)
            if not verify_result['success']:
                return verify_result
            
            # Buscar el pago por referencia
            reference = verify_result['reference']
            if not reference:
                return {
                    'success': False,
                    'error': 'No se encontró referencia en el pago'
                }
            
            try:
                payment = Payment.objects.get(provider_payment_id=payment_id)
            except Payment.DoesNotExist:
                # Crear pago si no existe
                try:
                    from ecommerce.apps.orders.models import Order
                    order = Order.objects.get(order_number=reference)
                    payment = Payment.objects.create(
                        order=order,
                        user=order.user,
                        amount=verify_result['amount'],
                        currency=verify_result['currency'],
                        method='credit_card',
                        provider='mercadopago',
                        provider_payment_id=payment_id,
                        status=self._map_mercadopago_status(verify_result['status'])
                    )
                except Order.DoesNotExist:
                    return {
                        'success': False,
                        'error': f'No se encontró orden con referencia {reference}'
                    }
            
            # Actualizar estado del pago
            mercadopago_status = verify_result['status']
            payment_status = self._map_mercadopago_status(mercadopago_status)
            
            payment.status = payment_status
            payment.provider_response = payload
            payment.processed_at = timezone.now()
            payment.save()
            
            # Actualizar orden si el pago fue exitoso
            if payment_status == 'completed':
                order = payment.order
                order.status = 'confirmed'
                order.payment_status = 'paid'
                order.save()
            
            return {
                'success': True,
                'payment_id': payment.id,
                'status': payment_status,
                'message': f'Pago {payment.payment_id} actualizado a {payment_status}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar webhook: {str(e)}'
            }
    
    def _map_mercadopago_status(self, mercadopago_status: str) -> str:
        """
        Mapea el estado de MercadoPago al estado interno del sistema.
        """
        status_mapping = {
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
        return status_mapping.get(mercadopago_status, 'pending')
    
    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Obtiene los métodos de pago disponibles en MercadoPago.
        """
        try:
            response = requests.get(
                f"{self.base_url}/v1/payment_methods",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'payment_methods': data,
                    'raw_response': data
                }
            else:
                return {
                    'success': False,
                    'error': 'Error al obtener métodos de pago',
                    'raw_response': response.json()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al obtener métodos de pago: {str(e)}'
            }
    
    def get_supported_countries(self) -> list:
        """Obtiene los países soportados por MercadoPago."""
        return ['CO', 'AR', 'MX', 'BR', 'CL', 'UY', 'PE']
    
    def get_supported_currencies(self) -> list:
        """Obtiene las monedas soportadas por MercadoPago."""
        return ['COP', 'USD', 'ARS', 'MXN', 'BRL', 'CLP', 'UYU', 'PEN']
    
    def get_provider_config(self) -> Dict[str, Any]:
        """Obtiene la configuración del proveedor MercadoPago."""
        return {
            'name': 'MercadoPago',
            'display_name': 'MercadoPago',
            'description': 'Pasarela de pago líder en Latinoamérica',
            'supported_currencies': self.get_supported_currencies(),
            'supported_countries': self.get_supported_countries(),
            'payment_methods': ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'],
            'environment': self.environment,
            'website': 'https://mercadopago.com',
            'logo_url': '/static/images/payment-logos/mercadopago.png'
        }
    
    def _get_shipping_address_data(self, order):
        """
        Obtiene los datos de la dirección de envío para MercadoPago desde la orden.
        """
        try:
            return {
                'zip_code': order.shipping_postal_code or '000000',
                'state_name': order.shipping_state or 'Departamento no especificado',
                'city_name': order.shipping_city or 'Ciudad no especificada',
                'address_line_1': order.shipping_address or 'Dirección no especificada',
                'address_line_2': ''
            }
        except Exception:
            return {
                'zip_code': '000000',
                'state_name': 'Departamento no especificado',
                'city_name': 'Ciudad no especificada',
                'address_line_1': 'Dirección no especificada',
                'address_line_2': ''
            }