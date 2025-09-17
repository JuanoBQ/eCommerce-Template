"""
Servicio para confirmar pagos y procesar stock.
Maneja la transición de órdenes de pending a confirmed cuando el pago es exitoso.
"""

from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from ecommerce.apps.orders.models import Order
from ecommerce.apps.inventory.autostock_service import AutoStockService
from ecommerce.apps.inventory.models import StockReservation
import logging

logger = logging.getLogger('ecommerce.payments')


class PaymentConfirmationService:
    """
    Servicio para confirmar pagos y procesar el stock correspondiente.
    """
    
    @staticmethod
    def confirm_payment(order_number: str, payment_provider: str, provider_payment_id: str = None) -> dict:
        """
        Confirma un pago exitoso y procesa el stock.
        
        Args:
            order_number: Número de orden
            payment_provider: Proveedor de pago (wompi, mercadopago, stripe)
            provider_payment_id: ID del pago en el proveedor
            
        Returns:
            dict: Resultado de la confirmación
        """
        try:
            with transaction.atomic():
                # Buscar la orden
                try:
                    order = Order.objects.select_for_update().get(order_number=order_number)
                except Order.DoesNotExist:
                    return {
                        'success': False,
                        'error': f'Orden {order_number} no encontrada'
                    }
                
                # Verificar que la orden esté en estado pending
                if order.status != 'pending':
                    return {
                        'success': False,
                        'error': f'La orden {order_number} no está en estado pending (actual: {order.status})'
                    }
                
                # Verificar que el pago esté pendiente
                if order.payment_status != 'pending':
                    return {
                        'success': False,
                        'error': f'El pago de la orden {order_number} no está pendiente (actual: {order.payment_status})'
                    }
                
                # Validar stock antes de confirmar
                from ecommerce.apps.inventory.stock_validator import StockValidator
                stock_validation = StockValidator.validate_order_stock(order)
                if not stock_validation['valid']:
                    return {
                        'success': False,
                        'error': 'No hay stock suficiente para confirmar la orden',
                        'details': stock_validation['errors']
                    }
                
                # Procesar stock de la orden
                stock_result = AutoStockService.process_order_stock(order)
                if not stock_result['success']:
                    return {
                        'success': False,
                        'error': 'Error procesando stock de la orden',
                        'details': stock_result['errors']
                    }
                
                # Actualizar estado de la orden
                order.status = 'confirmed'
                order.payment_status = 'paid'
                # Nota: Los campos payment_provider, payment_reference y confirmed_at
                # no existen en el modelo Order actual, pero se pueden agregar si es necesario
                order.save()
                
                # Liberar reservas de stock si existen
                PaymentConfirmationService._release_stock_reservations(order)
                
                logger.info(f"Pago confirmado exitosamente para orden {order_number}")
                
                return {
                    'success': True,
                    'order_number': order_number,
                    'status': 'confirmed',
                    'payment_status': 'paid',
                    'stock_processed': stock_result['processed_items'],
                    'message': 'Pago confirmado y stock procesado exitosamente'
                }
                
        except Exception as e:
            logger.error(f"Error confirmando pago para orden {order_number}: {str(e)}")
            return {
                'success': False,
                'error': f'Error interno: {str(e)}'
            }
    
    @staticmethod
    def fail_payment(order_number: str, reason: str = None) -> dict:
        """
        Marca un pago como fallido y libera el stock reservado.
        
        Args:
            order_number: Número de orden
            reason: Razón del fallo
            
        Returns:
            dict: Resultado de la operación
        """
        try:
            with transaction.atomic():
                # Buscar la orden
                try:
                    order = Order.objects.select_for_update().get(order_number=order_number)
                except Order.DoesNotExist:
                    return {
                        'success': False,
                        'error': f'Orden {order_number} no encontrada'
                    }
                
                # Solo procesar si está en pending
                if order.status != 'pending':
                    return {
                        'success': False,
                        'error': f'La orden {order_number} no está en estado pending (actual: {order.status})'
                    }
                
                # Actualizar estado de la orden
                order.status = 'cancelled'
                order.payment_status = 'failed'
                # Nota: Los campos cancelled_at y notes no existen en el modelo Order actual
                order.save()
                
                # Liberar reservas de stock
                PaymentConfirmationService._release_stock_reservations(order)
                
                logger.info(f"Pago marcado como fallido para orden {order_number}: {reason}")
                
                return {
                    'success': True,
                    'order_number': order_number,
                    'status': 'cancelled',
                    'payment_status': 'failed',
                    'message': 'Pago marcado como fallido y stock liberado'
                }
                
        except Exception as e:
            logger.error(f"Error marcando pago como fallido para orden {order_number}: {str(e)}")
            return {
                'success': False,
                'error': f'Error interno: {str(e)}'
            }
    
    @staticmethod
    def _release_stock_reservations(order: Order) -> None:
        """
        Libera las reservas de stock para una orden.
        
        Args:
            order: Orden a procesar
        """
        try:
            # Buscar reservas activas para esta orden
            reservations = StockReservation.objects.filter(
                order=order,
                status='active'
            )
            
            for reservation in reservations:
                AutoStockService.release_stock_reservation(reservation)
                logger.info(f"Reserva de stock liberada para orden {order.order_number}")
                
        except Exception as e:
            logger.error(f"Error liberando reservas de stock para orden {order.order_number}: {str(e)}")
    
    @staticmethod
    def get_payment_status(order_number: str) -> dict:
        """
        Obtiene el estado actual del pago de una orden.
        
        Args:
            order_number: Número de orden
            
        Returns:
            dict: Estado del pago
        """
        try:
            order = Order.objects.get(order_number=order_number)
            return {
                'success': True,
                'order_number': order_number,
                'status': order.status,
                'payment_status': order.payment_status,
                'payment_provider': getattr(order, 'payment_provider', 'N/A'),
                'payment_reference': getattr(order, 'payment_reference', 'N/A'),
                'created_at': order.created_at,
                'confirmed_at': getattr(order, 'confirmed_at', 'N/A'),
                'cancelled_at': getattr(order, 'cancelled_at', 'N/A')
            }
        except Order.DoesNotExist:
            return {
                'success': False,
                'error': f'Orden {order_number} no encontrada'
            }
        except Exception as e:
            logger.error(f"Error obteniendo estado de pago para orden {order_number}: {str(e)}")
            return {
                'success': False,
                'error': f'Error interno: {str(e)}'
            }
