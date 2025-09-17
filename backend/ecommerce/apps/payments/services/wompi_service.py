"""
Servicio de integración con Wompi.
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


class WompiService(BasePaymentService):
    """
    Servicio para integración con Wompi (Colombia).
    """
    
    def __init__(self):
        super().__init__()
        self.base_url = self._get_base_url()
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.private_key}'
        }
        self.integrity_key = getattr(settings, 'WOMPI_INTEGRITY_KEY', '')
    
    def get_environment(self) -> str:
        return getattr(settings, 'WOMPI_ENVIRONMENT', 'sandbox')
    
    def get_public_key(self) -> str:
        return getattr(settings, 'WOMPI_PUBLIC_KEY', '')
    
    def get_private_key(self) -> str:
        return getattr(settings, 'WOMPI_PRIVATE_KEY', '')
    
    def get_webhook_secret(self) -> str:
        return getattr(settings, 'WOMPI_WEBHOOK_SECRET', '')
    
    def _get_base_url(self) -> str:
        """Obtiene la URL base según el entorno."""
        if self.is_sandbox():
            return 'https://sandbox.wompi.co/v1'
        return 'https://production.wompi.co/v1'
    
    def create_payment_intent(self, order, amount: Decimal, currency: str = 'COP') -> Dict[str, Any]:
        """
        Crea una intención de pago en Wompi usando payment links.
        """
        try:
            # Verificar credenciales
            if not self.public_key or not self.private_key or not self.integrity_key:
                return {
                    'success': False,
                    'error': 'Credenciales de Wompi no configuradas completamente',
                    'error_code': 'MISSING_CREDENTIALS'
                }
            
            # Obtener token de aceptación
            acceptance_token = self._get_acceptance_token()
            if not acceptance_token:
                return {
                    'success': False,
                    'error': 'No se pudo obtener el token de aceptación',
                    'error_code': 'ACCEPTANCE_TOKEN_ERROR'
                }
            
            # Formatear monto para Wompi (en centavos)
            amount_cents = self.format_amount(amount, currency)
            
            # Crear payment link
            payment_link_data = {
                'name': f'Pago Orden {order.order_number}',
                'description': f'Compra de {order.items.count()} productos - Total: ${amount}',
                'single_use': True,
                'collect_shipping': False,
                'amount_in_cents': amount_cents,
                'currency': currency,
                'customer_email': order.user.email,
                'reference': order.order_number,
                'customer_data': {
                    'email': order.user.email,
                    'full_name': order.user.get_full_name(),
                    'phone_number': order.user.phone or '',
                },
                'shipping_address': self._get_shipping_address_data(order) if order.shipping_address else None,
                'redirect_url': f"{settings.FRONTEND_URL}/checkout/success?order={order.order_number}",
                'acceptance_token': acceptance_token,
                'expires_at': (timezone.now() + timezone.timedelta(minutes=15)).isoformat()
            }

            # Agregar firma de integridad
            signature_raw = f"{order.order_number}{amount_cents}{currency}{self.integrity_key}"
            signature_hash = hashlib.sha256(signature_raw.encode('utf-8')).hexdigest()
            payment_link_data['signature'] = signature_hash
            
            # Crear payment link en Wompi
            response = requests.post(
                f"{self.base_url}/payment_links",
                headers=self.headers,
                json=payment_link_data,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                transaction_id = data['data']['id']
                
                # Obtener URL de checkout
                payment_url = (
                    data['data'].get('checkout_url') or 
                    data['data'].get('url') or 
                    data['data'].get('link_url') or
                    data['data'].get('payment_url') or
                    f"https://checkout.wompi.co/l/{transaction_id}"
                )
                
                return {
                    'success': True,
                    'transaction_id': transaction_id,
                    'reference': order.order_number,
                    'status': 'PENDING',
                    'payment_url': payment_url,
                    'expires_at': data['data'].get('expires_at'),
                    'raw_response': data
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('error', {}).get('message', 'Error desconocido'),
                    'error_code': error_data.get('error', {}).get('type', 'UNKNOWN_ERROR'),
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
        Procesa un pago en Wompi.
        """
        try:
            return {
                'success': True,
                'message': 'Redirigir al usuario a Wompi para completar el pago',
                'payment_url': payment_method.get('payment_url'),
                'transaction_id': payment_intent_id
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar pago: {str(e)}',
                'error_code': 'PROCESSING_ERROR'
            }
    
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Verifica el estado de un pago en Wompi.
        """
        try:
            # Determinar si es payment link o transacción directa
            if payment_id.startswith('test_') or len(payment_id) < 20:
                # Es un payment link
                response = requests.get(
                    f"{self.base_url}/payment_links/{payment_id}",
                    headers=self.headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    payment_link_data = data.get('data', {})
                    
                    # Intentar obtener transacciones asociadas
                    try:
                        transactions_response = requests.get(
                            f"{self.base_url}/payment_links/{payment_id}/transactions",
                            headers=self.headers,
                            timeout=30
                        )
                        
                        if transactions_response.status_code == 200:
                            transactions_data = transactions_response.json()
                            transactions = transactions_data.get('data', [])
                            
                            if transactions:
                                # Usar la transacción más reciente
                                latest_transaction = transactions[0]
                                status = latest_transaction.get('status', 'PENDING')
                                
                                return {
                                    'success': True,
                                    'status': status,
                                    'amount': self.parse_amount(latest_transaction.get('amount_in_cents', 0), latest_transaction.get('currency', 'COP')),
                                    'currency': latest_transaction.get('currency', 'COP'),
                                    'reference': latest_transaction.get('reference'),
                                    'payment_method': latest_transaction.get('payment_method_type'),
                                    'processed_at': latest_transaction.get('finalized_at'),
                                    'raw_response': data
                                }
                    except Exception:
                        pass
                    
                    # Si no hay transacciones, el pago sigue pendiente
                    return {
                        'success': True,
                        'status': 'PENDING',
                        'amount': self.parse_amount(payment_link_data.get('amount_in_cents', 0), payment_link_data.get('currency', 'COP')),
                        'currency': payment_link_data.get('currency', 'COP'),
                        'reference': payment_link_data.get('reference'),
                        'payment_method': None,
                        'processed_at': None,
                        'raw_response': data
                    }
            else:
                # Es una transacción directa
                response = requests.get(
                    f"{self.base_url}/transactions/{payment_id}",
                    headers=self.headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    transaction = data['data']
                    
                    return {
                        'success': True,
                        'status': transaction['status'],
                        'amount': self.parse_amount(transaction['amount_in_cents'], transaction['currency']),
                        'currency': transaction['currency'],
                        'reference': transaction['reference'],
                        'payment_method': transaction.get('payment_method_type'),
                        'processed_at': transaction.get('finalized_at'),
                        'raw_response': data
                    }
            
            # Error en la respuesta
            error_data = response.json() if response.content else {}
            return {
                'success': False,
                'error': error_data.get('error', {}).get('message', 'Error al verificar pago'),
                'error_code': error_data.get('error', {}).get('type', 'VERIFICATION_ERROR'),
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
        Reembolsa un pago en Wompi.
        """
        try:
            # Verificar la transacción
            verify_result = self.verify_payment(payment_id)
            if not verify_result['success']:
                return verify_result
            
            # Determinar monto del reembolso
            if amount is None:
                amount = verify_result['amount']
            
            amount_cents = self.format_amount(amount, verify_result['currency'])
            
            # Crear reembolso
            refund_data = {
                'amount_in_cents': amount_cents,
                'reason': 'requested_by_customer'
            }
            
            response = requests.post(
                f"{self.base_url}/transactions/{payment_id}/refund",
                headers=self.headers,
                json=refund_data,
                timeout=30
            )
            
            if response.status_code == 201:
                data = response.json()
                return {
                    'success': True,
                    'refund_id': data['data']['id'],
                    'amount': self.parse_amount(data['data']['amount_in_cents'], data['data']['currency']),
                    'status': data['data']['status'],
                    'raw_response': data
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('error', {}).get('message', 'Error al procesar reembolso'),
                    'error_code': error_data.get('error', {}).get('type', 'REFUND_ERROR'),
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
        Verifica la autenticidad de un webhook de Wompi.
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
        Procesa un webhook de Wompi.
        """
        try:
            event = payload.get('event', {})
            transaction = event.get('data', {})
            
            # Buscar el pago por referencia
            reference = transaction.get('reference')
            if not reference:
                return {
                    'success': False,
                    'error': 'No se encontró referencia en el webhook'
                }
            
            try:
                payment = Payment.objects.get(provider_payment_id=transaction['id'])
            except Payment.DoesNotExist:
                return {
                    'success': False,
                    'error': f'No se encontró pago con ID {transaction["id"]}'
                }
            
            # Actualizar estado del pago
            wompi_status = transaction.get('status')
            payment_status = self._map_wompi_status(wompi_status)
            
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
    
    def _map_wompi_status(self, wompi_status: str) -> str:
        """
        Mapea el estado de Wompi al estado interno del sistema.
        """
        status_mapping = {
            'PENDING': 'pending',
            'APPROVED': 'completed',
            'DECLINED': 'failed',
            'VOIDED': 'cancelled',
            'REFUNDED': 'refunded',
        }
        return status_mapping.get(wompi_status, 'pending')
    
    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Obtiene los métodos de pago disponibles en Wompi.
        """
        try:
            response = requests.get(
                f"{self.base_url}/merchants/{self.public_key}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'payment_methods': data['data'].get('presigned_acceptance', {}).get('acceptance_token'),
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
    
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Verifica el estado de un pago en Wompi.
        """
        try:
            response = requests.get(
                f"{self.base_url}/transactions/{payment_id}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                transaction = data.get('data', {})
                
                return {
                    'success': True,
                    'status': transaction.get('status', 'PENDING'),
                    'transaction_id': transaction.get('id'),
                    'amount': transaction.get('amount_in_cents', 0),
                    'currency': transaction.get('currency', 'COP'),
                    'raw_response': data
                }
            else:
                return {
                    'success': False,
                    'error': 'Error al verificar pago',
                    'raw_response': response.json()
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al verificar pago: {str(e)}'
            }
    
    def get_supported_countries(self) -> list:
        """Obtiene los países soportados por Wompi."""
        return ['CO']
    
    def get_supported_currencies(self) -> list:
        """Obtiene las monedas soportadas por Wompi."""
        return ['COP']
    
    def get_provider_config(self) -> Dict[str, Any]:
        """Obtiene la configuración del proveedor Wompi."""
        return {
            'name': 'Wompi',
            'display_name': 'Wompi',
            'description': 'Pasarela de pago líder en Colombia',
            'supported_currencies': self.get_supported_currencies(),
            'supported_countries': self.get_supported_countries(),
            'payment_methods': ['credit_card', 'debit_card', 'nequi', 'bancolombia_transfer'],
            'environment': self.environment,
            'website': 'https://wompi.co',
            'logo_url': '/static/images/payment-logos/wompi.png'
        }
    
    def _get_acceptance_token(self):
        """
        Obtiene el token de aceptación de Wompi.
        """
        try:
            response = requests.get(
                f"{self.base_url}/merchants/{self.public_key}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data['data'].get('presigned_acceptance', {}).get('acceptance_token')
            return None
                
        except Exception:
            return None
    
    def _get_shipping_address_data(self, order):
        """
        Obtiene los datos de la dirección de envío desde la orden.
        """
        try:
            return {
                'address_line_1': order.shipping_address or 'Dirección no especificada',
                'city': order.shipping_city or 'Ciudad no especificada',
                'region': order.shipping_state or 'Departamento no especificado',
                'country': order.shipping_country or 'CO',
                'postal_code': order.shipping_postal_code or '000000',
                'phone_number': order.phone or order.user.phone or '3001234567',
            }
        except Exception:
            return {
                'address_line_1': 'Dirección no especificada',
                'city': 'Ciudad no especificada',
                'region': 'Departamento no especificado',
                'country': 'CO',
                'postal_code': '000000',
                'phone_number': '3001234567',
            }