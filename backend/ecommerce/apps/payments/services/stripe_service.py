"""
Servicio de integración con Stripe.
"""
import stripe
import json
import hmac
import hashlib
from typing import Dict, Any, Optional
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from ..models import Payment
from .base import BasePaymentService


class StripeService(BasePaymentService):
    """
    Servicio para integración con Stripe.
    """
    
    def __init__(self):
        super().__init__()
        stripe.api_key = self.private_key
        self.webhook_secret = self.get_webhook_secret()
    
    def get_environment(self) -> str:
        return getattr(settings, 'STRIPE_ENVIRONMENT', 'test')
    
    def get_public_key(self) -> str:
        key = getattr(settings, 'STRIPE_PUBLIC_KEY', '')
        if not key:
            # Clave de prueba para test
            return 'pk_test_1234567890abcdef'
        return key
    
    def get_private_key(self) -> str:
        key = getattr(settings, 'STRIPE_SECRET_KEY', '')
        if not key:
            # Clave de prueba para test
            return 'sk_test_1234567890abcdef'
        return key
    
    def get_webhook_secret(self) -> str:
        return getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
    
    def create_payment_intent(self, order, amount: Decimal, currency: str = 'usd') -> Dict[str, Any]:
        """
        Crea una intención de pago en Stripe.
        """
        try:
            # Formatear monto para Stripe (en centavos)
            amount_cents = self.format_amount(amount, currency)
            
            # Crear el PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                metadata={
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'user_id': str(order.user.id),
                    'user_email': order.user.email
                },
                automatic_payment_methods={
                    'enabled': True,
                },
                shipping={
                    'name': order.user.get_full_name(),
                    'address': self._get_shipping_address_data(order) if order.shipping_address else None,
                },
                receipt_email=order.user.email,
            )
            
            return {
                'success': True,
                'payment_intent_id': intent.id,
                'client_secret': intent.client_secret,
                'reference': order.order_number,
                'status': intent.status,
                'raw_response': intent
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.code if hasattr(e, 'code') else 'STRIPE_ERROR',
                'raw_response': e.json_body if hasattr(e, 'json_body') else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def process_payment(self, payment_intent_id: str, payment_method: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa un pago en Stripe.
        """
        try:
            # Confirmar el PaymentIntent
            intent = stripe.PaymentIntent.confirm(
                payment_intent_id,
                payment_method=payment_method.get('payment_method_id'),
                return_url=f"{settings.FRONTEND_URL}/checkout/success"
            )
            
            return {
                'success': True,
                'payment_intent_id': intent.id,
                'status': intent.status,
                'client_secret': intent.client_secret,
                'raw_response': intent
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.code if hasattr(e, 'code') else 'STRIPE_ERROR',
                'raw_response': e.json_body if hasattr(e, 'json_body') else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar pago: {str(e)}',
                'error_code': 'PROCESSING_ERROR'
            }
    
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Verifica el estado de un pago en Stripe.
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_id)
            
            return {
                'success': True,
                'status': intent.status,
                'amount': self.parse_amount(intent.amount, intent.currency),
                'currency': intent.currency.upper(),
                'reference': intent.metadata.get('order_number'),
                'payment_method': intent.payment_method,
                'processed_at': intent.created,
                'raw_response': intent
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.code if hasattr(e, 'code') else 'STRIPE_ERROR',
                'raw_response': e.json_body if hasattr(e, 'json_body') else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def refund_payment(self, payment_id: str, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Reembolsa un pago en Stripe.
        """
        try:
            # Primero obtener el PaymentIntent
            intent = stripe.PaymentIntent.retrieve(payment_id)
            
            # Determinar el monto del reembolso
            if amount is None:
                amount = self.parse_amount(intent.amount, intent.currency)
            
            # Formatear monto para Stripe
            amount_cents = self.format_amount(amount, intent.currency)
            
            # Crear el reembolso
            refund = stripe.Refund.create(
                payment_intent=payment_id,
                amount=amount_cents,
                reason='requested_by_customer'
            )
            
            return {
                'success': True,
                'refund_id': refund.id,
                'amount': self.parse_amount(refund.amount, refund.currency),
                'status': refund.status,
                'raw_response': refund
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.code if hasattr(e, 'code') else 'STRIPE_ERROR',
                'raw_response': e.json_body if hasattr(e, 'json_body') else None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def verify_webhook(self, payload: str, signature: str) -> bool:
        """
        Verifica la autenticidad de un webhook de Stripe.
        """
        try:
            # Stripe usa HMAC SHA256 para verificar webhooks
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            return True
        except ValueError:
            return False
        except stripe.error.SignatureVerificationError:
            return False
    
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa un webhook de Stripe.
        """
        try:
            event = payload
            
            # Procesar diferentes tipos de eventos
            if event['type'] == 'payment_intent.succeeded':
                return self._handle_payment_succeeded(event)
            elif event['type'] == 'payment_intent.payment_failed':
                return self._handle_payment_failed(event)
            elif event['type'] == 'charge.dispute.created':
                return self._handle_dispute_created(event)
            else:
                return {
                    'success': True,
                    'message': f'Evento {event["type"]} procesado pero no requiere acción'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar webhook: {str(e)}'
            }
    
    def _handle_payment_succeeded(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maneja el evento de pago exitoso.
        """
        try:
            payment_intent = event['data']['object']
            order_number = payment_intent['metadata'].get('order_number')
            
            if not order_number:
                return {
                    'success': False,
                    'error': 'No se encontró número de orden en el metadata'
                }
            
            # Buscar el pago
            try:
                payment = Payment.objects.get(provider_payment_id=payment_intent['id'])
            except Payment.DoesNotExist:
                # Crear el pago si no existe
                from ecommerce.apps.orders.models import Order
                try:
                    order = Order.objects.get(order_number=order_number)
                    payment = Payment.objects.create(
                        order=order,
                        user=order.user,
                        amount=self.parse_amount(payment_intent['amount'], payment_intent['currency']),
                        currency=payment_intent['currency'].upper(),
                        method='credit_card',
                        provider='stripe',
                        provider_payment_id=payment_intent['id'],
                        status='completed'
                    )
                except Order.DoesNotExist:
                    return {
                        'success': False,
                        'error': f'No se encontró orden con número {order_number}'
                    }
            
            # Actualizar el estado del pago
            payment.status = 'completed'
            payment.provider_response = event
            payment.processed_at = timezone.now()
            payment.save()
            
            # Actualizar la orden
            order = payment.order
            order.status = 'confirmed'
            order.save()
            
            return {
                'success': True,
                'payment_id': payment.id,
                'status': 'completed',
                'message': f'Pago {payment.payment_id} completado exitosamente'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar pago exitoso: {str(e)}'
            }
    
    def _handle_payment_failed(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maneja el evento de pago fallido.
        """
        try:
            payment_intent = event['data']['object']
            order_number = payment_intent['metadata'].get('order_number')
            
            if not order_number:
                return {
                    'success': False,
                    'error': 'No se encontró número de orden en el metadata'
                }
            
            # Buscar el pago
            try:
                payment = Payment.objects.get(provider_payment_id=payment_intent['id'])
                payment.status = 'failed'
                payment.failure_reason = payment_intent.get('last_payment_error', {}).get('message', 'Pago fallido')
                payment.provider_response = event
                payment.save()
                
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'status': 'failed',
                    'message': f'Pago {payment.payment_id} marcado como fallido'
                }
            except Payment.DoesNotExist:
                return {
                    'success': False,
                    'error': f'No se encontró pago con ID {payment_intent["id"]}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar pago fallido: {str(e)}'
            }
    
    def _handle_dispute_created(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maneja el evento de disputa creada.
        """
        try:
            dispute = event['data']['object']
            charge_id = dispute['charge']
            
            # Buscar el pago por charge_id
            try:
                payment = Payment.objects.get(provider_transaction_id=charge_id)
                payment.notes = f"Disputa creada: {dispute['reason']}"
                payment.save()
                
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'message': f'Disputa registrada para pago {payment.payment_id}'
                }
            except Payment.DoesNotExist:
                return {
                    'success': False,
                    'error': f'No se encontró pago con charge_id {charge_id}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al procesar disputa: {str(e)}'
            }
    
    def _map_stripe_status(self, stripe_status: str) -> str:
        """
        Mapea el estado de Stripe al estado interno del sistema.
        """
        status_mapping = {
            'requires_payment_method': 'pending',
            'requires_confirmation': 'pending',
            'requires_action': 'pending',
            'processing': 'processing',
            'succeeded': 'completed',
            'canceled': 'cancelled',
        }
        return status_mapping.get(stripe_status, 'pending')
    
    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Obtiene los métodos de pago disponibles en Stripe.
        """
        try:
            # Stripe no tiene un endpoint específico para obtener métodos de pago
            # Los métodos se configuran en el dashboard de Stripe
            return {
                'success': True,
                'payment_methods': [
                    'card', 'ideal', 'sepa_debit', 'sofort', 'bancontact',
                    'eps', 'giropay', 'p24', 'alipay', 'wechat_pay'
                ],
                'message': 'Métodos de pago configurados en el dashboard de Stripe'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error al obtener métodos de pago: {str(e)}'
            }
    
    def create_customer(self, user) -> Dict[str, Any]:
        """
        Crea un cliente en Stripe.
        """
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.get_full_name(),
                metadata={
                    'user_id': str(user.id),
                    'phone': user.phone or ''
                }
            )
            
            return {
                'success': True,
                'customer_id': customer.id,
                'raw_response': customer
            }
            
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.code if hasattr(e, 'code') else 'STRIPE_ERROR'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Error interno: {str(e)}',
                'error_code': 'INTERNAL_ERROR'
            }
    
    def get_supported_countries(self) -> list:
        """Obtiene los países soportados por Stripe."""
        return ['US', 'CA', 'GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'LU', 'MT', 'CY', 'EE', 'LV', 'LT', 'SI', 'SK', 'HU', 'PL', 'CZ', 'RO', 'BG', 'HR', 'GR']
    
    def get_supported_currencies(self) -> list:
        """Obtiene las monedas soportadas por Stripe."""
        return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK']
    
    def get_provider_config(self) -> Dict[str, Any]:
        """Obtiene la configuración del proveedor Stripe."""
        return {
            'name': 'Stripe',
            'display_name': 'Stripe',
            'description': 'Pasarela de pago global',
            'supported_currencies': self.get_supported_currencies(),
            'supported_countries': self.get_supported_countries(),
            'payment_methods': ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'],
            'environment': self.environment,
            'website': 'https://stripe.com',
            'logo_url': '/static/images/payment-logos/stripe.png'
        }
    
    def _get_shipping_address_data(self, order):
        """
        Obtiene los datos de la dirección de envío para Stripe.
        """
        try:
            from ecommerce.apps.users.models import UserAddress
            address = UserAddress.objects.get(id=order.shipping_address)
            return {
                'line1': address.address_line_1,
                'line2': address.address_line_2 or '',
                'city': address.city,
                'state': address.state,
                'postal_code': address.postal_code,
                'country': 'CO',
            }
        except Exception as e:
            print(f'🔍 StripeService - Error obteniendo dirección: {e}')
            return None
