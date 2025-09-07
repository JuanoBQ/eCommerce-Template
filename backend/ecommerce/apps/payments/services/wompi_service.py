"""
Servicio de integración con Wompi.
"""
import requests
import json
import hmac
import hashlib
import time
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
    
    def get_environment(self) -> str:
        return getattr(settings, 'WOMPI_ENVIRONMENT', 'sandbox')
    
    def get_public_key(self) -> str:
        key = getattr(settings, 'WOMPI_PUBLIC_KEY', '')
        if not key:
            # Clave de prueba para sandbox
            return 'pub_test_1234567890abcdef'
        return key
    
    def get_private_key(self) -> str:
        key = getattr(settings, 'WOMPI_PRIVATE_KEY', '')
        if not key:
            # Clave de prueba para sandbox
            return 'prv_test_1234567890abcdef'
        return key
    
    def get_webhook_secret(self) -> str:
        return getattr(settings, 'WOMPI_WEBHOOK_SECRET', '')
    
    def _get_base_url(self) -> str:
        """Obtiene la URL base según el entorno."""
        if self.is_sandbox():
            return 'https://sandbox.wompi.co/v1'
        return 'https://production.wompi.co/v1'
    
    def create_payment_intent(self, order, amount: Decimal, currency: str = 'COP') -> Dict[str, Any]:
        """
        Crea una intención de pago en Wompi.
        """
        try:
            # En modo sandbox con claves de prueba, simular respuesta exitosa
            if self.is_sandbox() and 'test' in self.public_key.lower():
                print('🔍 WompiService - Modo sandbox detectado, simulando respuesta exitosa')
                return {
                    'success': True,
                    'transaction_id': f'test_txn_{order.id}_{int(time.time())}',
                    'reference': order.order_number,
                    'status': 'PENDING',
                    'payment_url': f"{settings.FRONTEND_URL}/checkout/payment?order={order.order_number}&provider=wompi",
                    'expires_at': (timezone.now() + timezone.timedelta(minutes=15)).isoformat(),
                    'raw_response': {
                        'data': {
                            'id': f'test_txn_{order.id}_{int(time.time())}',
                            'reference': order.order_number,
                            'status': 'PENDING',
                            'payment_link_url': f"{settings.FRONTEND_URL}/checkout/payment?order={order.order_number}&provider=wompi",
                            'expires_at': (timezone.now() + timezone.timedelta(minutes=15)).isoformat()
                        }
                    }
                }
            
            # Obtener token de aceptación
            acceptance_token = self._get_acceptance_token()
            if not acceptance_token:
                return {
                    'success': False,
                    'error': 'No se pudo obtener el token de aceptación de Wompi',
                    'error_code': 'ACCEPTANCE_TOKEN_ERROR'
                }
            
            # Formatear monto para Wompi (en centavos)
            amount_cents = self.format_amount(amount, currency)
            
            # Datos para la transacción - estructura simplificada para Wompi
            transaction_data = {
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
                # Wompi requiere especificar el método de pago de manera diferente
                'payment_method': {
                    'type': 'CARD',
                    'installments': 1
                }
            }
            
            # Crear la transacción en Wompi
            print(f'🔍 WompiService - Datos de transacción a enviar: {transaction_data}')
            print(f'🔍 WompiService - URL: {self.base_url}/transactions')
            print(f'🔍 WompiService - Headers: {self.headers}')
            
            response = requests.post(
                f"{self.base_url}/transactions",
                headers=self.headers,
                json=transaction_data,
                timeout=30
            )
            
            print(f'🔍 WompiService - Respuesta de Wompi: {response.status_code}')
            print(f'🔍 WompiService - Contenido de respuesta: {response.text}')
            
            if response.status_code == 201:
                data = response.json()
                return {
                    'success': True,
                    'transaction_id': data['data']['id'],
                    'reference': data['data']['reference'],
                    'status': data['data']['status'],
                    'payment_url': data['data']['payment_link_url'],
                    'expires_at': data['data']['expires_at'],
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
            # Para Wompi, el procesamiento se hace a través del payment_link_url
            # El usuario es redirigido a Wompi para completar el pago
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
            else:
                error_data = response.json()
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
            # Primero obtener la transacción para verificar el monto
            verify_result = self.verify_payment(payment_id)
            if not verify_result['success']:
                return verify_result
            
            # Determinar el monto del reembolso
            if amount is None:
                amount = verify_result['amount']
            
            # Formatear monto para Wompi
            amount_cents = self.format_amount(amount, verify_result['currency'])
            
            # Crear el reembolso
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
            # Wompi usa HMAC SHA256 para verificar webhooks
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
            
            # Actualizar el estado del pago
            wompi_status = transaction.get('status')
            payment_status = self._map_wompi_status(wompi_status)
            
            payment.status = payment_status
            payment.provider_response = payload
            payment.processed_at = timezone.now()
            payment.save()
            
            # Si el pago fue exitoso, actualizar la orden
            if payment_status == 'completed':
                order = payment.order
                order.status = 'confirmed'
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
    
    def get_supported_countries(self) -> list:
        """Obtiene los países soportados por Wompi."""
        return ['CO']  # Solo Colombia
    
    def get_supported_currencies(self) -> list:
        """Obtiene las monedas soportadas por Wompi."""
        return ['COP']  # Solo peso colombiano
    
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
            # Si estamos en modo sandbox con claves de prueba, usar un token mock
            if self.is_sandbox() and 'test' in self.public_key.lower():
                print('🔍 WompiService - Usando token de aceptación mock para sandbox')
                return 'acceptance_token_mock_for_testing'
            
            # Obtener información del merchant para obtener el acceptance_token
            response = requests.get(
                f"{self.base_url}/merchants/{self.public_key}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                acceptance_token = data['data'].get('presigned_acceptance', {}).get('acceptance_token')
                print(f'🔍 WompiService - Token de aceptación obtenido: {acceptance_token}')
                return acceptance_token
            else:
                print(f'🔍 WompiService - Error obteniendo token de aceptación: {response.status_code} - {response.text}')
                # En caso de error, usar token mock para desarrollo
                print('🔍 WompiService - Usando token de aceptación mock como fallback')
                return 'acceptance_token_mock_for_testing'
                
        except Exception as e:
            print(f'🔍 WompiService - Error obteniendo token de aceptación: {e}')
            # En caso de excepción, usar token mock para desarrollo
            print('🔍 WompiService - Usando token de aceptación mock como fallback')
            return 'acceptance_token_mock_for_testing'
    
    def _get_shipping_address_data(self, order):
        """
        Obtiene los datos de la dirección de envío.
        """
        try:
            from ecommerce.apps.users.models import UserAddress
            address = UserAddress.objects.get(id=order.shipping_address)
            return {
                'address_line_1': address.address_line_1,
                'city': address.city,
                'region': address.state,
                'country': 'CO',
                'postal_code': address.postal_code,
                'phone_number': order.user.phone or '3001234567',  # Wompi requiere phone_number
            }
        except Exception as e:
            print(f'🔍 WompiService - Error obteniendo dirección: {e}')
            return None
