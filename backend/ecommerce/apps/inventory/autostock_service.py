"""
Servicio de Autostock Dinámico para eCommerce.
Implementa gestión automática de stock con validaciones en tiempo real.
"""

from django.db import transaction, models
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
import logging

from .models import StockMovement, StockReservation, StockAlert
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.cart.models import CartItem

logger = logging.getLogger(__name__)


class AutoStockService:
    """
    Servicio principal para gestión automática de stock.
    """
    
    @staticmethod
    def get_available_stock(product: Product, variant: Optional[ProductVariant] = None) -> int:
        """
        Obtiene el stock disponible real considerando reservas activas.
        
        Args:
            product: Producto a consultar
            variant: Variante específica (opcional)
            
        Returns:
            int: Cantidad disponible en stock
        """
        if not product.track_inventory:
            return 999999  # Stock ilimitado
        
        # Obtener stock base
        if variant:
            base_stock = variant.inventory_quantity
        else:
            base_stock = product.inventory_quantity
        
        # Calcular reservas activas
        from django.db import models
        active_reservations = StockReservation.objects.filter(
            product=product,
            variant=variant,
            status='active',
            expires_at__gt=timezone.now()
        ).aggregate(total_reserved=models.Sum('quantity'))['total_reserved'] or 0
        
        # Stock disponible = Stock base - Reservas activas
        available_stock = max(0, base_stock - active_reservations)
        
        return available_stock
    
    @staticmethod
    def validate_stock_availability(product: Product, variant: Optional[ProductVariant], 
                                  requested_quantity: int) -> Tuple[bool, str]:
        """
        Valida si hay stock suficiente para la cantidad solicitada.
        
        Args:
            product: Producto a validar
            variant: Variante específica (opcional)
            requested_quantity: Cantidad solicitada
            
        Returns:
            Tuple[bool, str]: (es_disponible, mensaje)
        """
        if not product.track_inventory:
            return True, "Stock ilimitado"
        
        available_stock = AutoStockService.get_available_stock(product, variant)
        
        if available_stock >= requested_quantity:
            return True, f"Stock disponible: {available_stock}"
        
        # Verificar si permite backorder
        if product.allow_backorder:
            return True, f"Stock insuficiente, pero permite backorder. Disponible: {available_stock}"
        
        return False, f"Stock insuficiente. Disponible: {available_stock}, Solicitado: {requested_quantity}"
    
    @staticmethod
    def reserve_stock(product: Product, variant: Optional[ProductVariant], 
                     quantity: int, user, order: Optional[Order] = None, 
                     expires_in_minutes: int = 30) -> StockReservation:
        """
        Reserva stock para un usuario por un tiempo determinado.
        
        Args:
            product: Producto a reservar
            variant: Variante específica (opcional)
            quantity: Cantidad a reservar
            user: Usuario que solicita la reserva
            order: Orden asociada (opcional)
            expires_in_minutes: Minutos hasta que expire la reserva
            
        Returns:
            StockReservation: Reserva creada
            
        Raises:
            ValidationError: Si no hay stock suficiente
        """
        # Validar disponibilidad
        is_available, message = AutoStockService.validate_stock_availability(
            product, variant, quantity
        )
        
        if not is_available and not product.allow_backorder:
            raise ValidationError(f"No hay stock suficiente: {message}")
        
        with transaction.atomic():
            # Crear reserva
            reservation = StockReservation.objects.create(
                product=product,
                variant=variant,
                user=user,
                quantity=quantity,
                order=order,
                expires_at=timezone.now() + timezone.timedelta(minutes=expires_in_minutes)
            )
            
            # Registrar movimiento
            AutoStockService._create_stock_movement(
                product=product,
                variant=variant,
                quantity=quantity,
                movement_type='reservation',
                reason='reservation',
                user=user,
                order=order,
                reference=f"Reserva-{reservation.id}",
                notes=f"Reserva de stock para usuario {user.id}"
            )
            
            logger.info(f"Stock reservado: {product.name} - {quantity} unidades para usuario {user.id}")
            
            return reservation
    
    @staticmethod
    def release_stock_reservation(reservation: StockReservation) -> None:
        """
        Libera una reserva de stock.
        
        Args:
            reservation: Reserva a liberar
        """
        with transaction.atomic():
            reservation.status = 'cancelled'
            reservation.save()
            
            # Registrar movimiento de liberación
            AutoStockService._create_stock_movement(
                product=reservation.product,
                variant=reservation.variant,
                quantity=reservation.quantity,
                movement_type='unreservation',
                reason='unreservation',
                user=reservation.user,
                order=reservation.order,
                reference=f"Liberación-{reservation.id}",
                notes=f"Liberación de reserva de stock"
            )
            
            logger.info(f"Reserva liberada: {reservation.product.name} - {reservation.quantity} unidades")
    
    @staticmethod
    def consume_stock_reservation(reservation: StockReservation, order: Order) -> None:
        """
        Consume una reserva de stock al confirmar una orden.
        
        Args:
            reservation: Reserva a consumir
            order: Orden que consume la reserva
        """
        with transaction.atomic():
            # Marcar reserva como consumida
            reservation.status = 'consumed'
            reservation.consumed_at = timezone.now()
            reservation.order = order
            reservation.save()
            
            # Actualizar stock real
            AutoStockService._update_physical_stock(
                product=reservation.product,
                variant=reservation.variant,
                quantity_change=-reservation.quantity,
                reason='sale',
                order=order,
                reference=order.order_number
            )
            
            logger.info(f"Stock consumido: {reservation.product.name} - {reservation.quantity} unidades")
    
    @staticmethod
    def process_order_stock(order: Order) -> Dict[str, any]:
        """
        Procesa el stock al confirmar una orden (solo cuando el pago está confirmado).
        
        Args:
            order: Orden a procesar
            
        Returns:
            Dict: Resultado del procesamiento
        """
        results = {
            'success': True,
            'processed_items': 0,
            'errors': [],
            'warnings': []
        }
        
        try:
            with transaction.atomic():
                for item in order.items.all():
                    try:
                        # Verificar si hay reserva activa para este item
                        reservation = StockReservation.objects.filter(
                            product=item.product,
                            variant=item.variant,
                            user=order.user,
                            status='active',
                            expires_at__gt=timezone.now()
                        ).first()
                        
                        if reservation and reservation.quantity >= item.quantity:
                            # Consumir reserva existente
                            AutoStockService.consume_stock_reservation(reservation, order)
                        else:
                            # Procesar directamente (sin reserva previa)
                            AutoStockService._update_physical_stock(
                                product=item.product,
                                variant=item.variant,
                                quantity_change=-item.quantity,
                                reason='sale',
                                order=order,
                                reference=order.order_number
                            )
                        
                        results['processed_items'] += 1
                        
                        # Verificar alertas de stock bajo
                        AutoStockService._check_low_stock_alerts(item.product, item.variant)
                        
                        # Sincronizar stock total del producto
                        AutoStockService.sync_product_stock(item.product)
                        
                    except Exception as e:
                        error_msg = f"Error procesando item {item.product.name}: {str(e)}"
                        results['errors'].append(error_msg)
                        logger.error(error_msg)
                
                if results['errors']:
                    results['success'] = False
                    raise ValidationError(f"Errores en el procesamiento: {', '.join(results['errors'])}")
                
                logger.info(f"Stock procesado exitosamente para orden {order.order_number}")
                
        except Exception as e:
            results['success'] = False
            results['errors'].append(str(e))
            logger.error(f"Error procesando stock para orden {order.order_number}: {str(e)}")
        
        return results
    
    @staticmethod
    def reserve_order_stock(order: Order) -> Dict[str, any]:
        """
        Reserva stock para una orden pendiente (sin descontar).
        
        Args:
            order: Orden a procesar
            
        Returns:
            Dict: Resultado del procesamiento
        """
        results = {
            'success': True,
            'reserved_items': 0,
            'errors': [],
            'warnings': []
        }
        
        try:
            with transaction.atomic():
                for item in order.items.all():
                    try:
                        # Crear reserva de stock
                        reservation = AutoStockService.reserve_stock(
                            product=item.product,
                            variant=item.variant,
                            quantity=item.quantity,
                            user=order.user,
                            order=order,
                            expires_in_minutes=30  # 30 minutos para completar el pago
                        )
                        
                        results['reserved_items'] += 1
                        logger.info(f"Stock reservado para orden {order.order_number}: {item.product.name} - {item.quantity} unidades")
                        
                    except Exception as e:
                        error_msg = f"Error reservando stock para {item.product.name}: {str(e)}"
                        results['errors'].append(error_msg)
                        logger.error(error_msg)
                
                if results['errors']:
                    results['success'] = False
                    raise ValidationError(f"Errores en la reserva: {', '.join(results['errors'])}")
                
                logger.info(f"Stock reservado exitosamente para orden {order.order_number}")
                
        except Exception as e:
            results['success'] = False
            results['errors'].append(str(e))
            logger.error(f"Error reservando stock para orden {order.order_number}: {str(e)}")
        
        return results
    
    @staticmethod
    def sync_product_stock(product: Product) -> None:
        """
        Sincroniza el stock total del producto con la suma de sus variantes.
        
        Args:
            product: Producto a sincronizar
        """
        try:
            if not product.track_inventory:
                return
            
            # Calcular stock total de todas las variantes activas
            total_variant_stock = product.variants.filter(
                is_active=True
            ).aggregate(
                total=models.Sum('inventory_quantity')
            )['total'] or 0
            
            # Actualizar stock del producto principal
            old_stock = product.inventory_quantity
            product.inventory_quantity = total_variant_stock
            product.save(update_fields=['inventory_quantity'])
            
            logger.info(f"Stock sincronizado para {product.name}: {old_stock} -> {total_variant_stock}")
            
        except Exception as e:
            logger.error(f"Error sincronizando stock para {product.name}: {str(e)}")
    
    @staticmethod
    def sync_cart_reservations(user) -> None:
        """
        Sincroniza las reservas de stock con el carrito del usuario.
        
        Args:
            user: Usuario a sincronizar
        """
        try:
            # Obtener items del carrito
            cart_items = CartItem.objects.filter(cart__user=user)
            
            # Obtener reservas activas
            active_reservations = StockReservation.objects.filter(
                user=user,
                status='active',
                expires_at__gt=timezone.now()
            )
            
            # Crear/actualizar reservas para items del carrito
            for cart_item in cart_items:
                reservation = active_reservations.filter(
                    product=cart_item.product,
                    variant=cart_item.variant
                ).first()
                
                if reservation:
                    # Actualizar cantidad si es diferente
                    if reservation.quantity != cart_item.quantity:
                        reservation.quantity = cart_item.quantity
                        reservation.save()
                else:
                    # Crear nueva reserva
                    try:
                        AutoStockService.reserve_stock(
                            product=cart_item.product,
                            variant=cart_item.variant,
                            quantity=cart_item.quantity,
                            user=user
                        )
                    except ValidationError as e:
                        logger.warning(f"No se pudo reservar stock para {cart_item.product.name}: {str(e)}")
            
            # Liberar reservas que ya no están en el carrito
            cart_product_variants = set()
            for cart_item in cart_items:
                cart_product_variants.add((cart_item.product.id, cart_item.variant.id if cart_item.variant else None))
            
            for reservation in active_reservations:
                key = (reservation.product.id, reservation.variant.id if reservation.variant else None)
                if key not in cart_product_variants:
                    AutoStockService.release_stock_reservation(reservation)
            
            logger.info(f"Reservas sincronizadas para usuario {user.id}")
            
        except Exception as e:
            logger.error(f"Error sincronizando reservas para usuario {user.id}: {str(e)}")
    
    @staticmethod
    def _update_physical_stock(product: Product, variant: Optional[ProductVariant], 
                              quantity_change: int, reason: str, order: Optional[Order] = None,
                              reference: str = '') -> None:
        """
        Actualiza el stock físico del producto o variante.
        
        Args:
            product: Producto a actualizar
            variant: Variante específica (opcional)
            quantity_change: Cambio en la cantidad (negativo para salidas)
            reason: Razón del movimiento
            order: Orden asociada (opcional)
            reference: Referencia del movimiento
        """
        with transaction.atomic():
            # Actualizar stock
            if variant:
                variant.inventory_quantity = max(0, variant.inventory_quantity + quantity_change)
                variant.save(update_fields=['inventory_quantity'])
            else:
                product.inventory_quantity = max(0, product.inventory_quantity + quantity_change)
                product.save(update_fields=['inventory_quantity'])
            
            # Registrar movimiento
            AutoStockService._create_stock_movement(
                product=product,
                variant=variant,
                quantity=quantity_change,
                movement_type='out' if quantity_change < 0 else 'in',
                reason=reason,
                order=order,
                reference=reference,
                notes=f"Actualización automática de stock"
            )
    
    @staticmethod
    def _create_stock_movement(product: Product, variant: Optional[ProductVariant], 
                              quantity: int, movement_type: str, reason: str,
                              user=None, order: Optional[Order] = None, 
                              reference: str = '', notes: str = '') -> StockMovement:
        """
        Crea un movimiento de stock.
        
        Args:
            product: Producto del movimiento
            variant: Variante específica (opcional)
            quantity: Cantidad del movimiento
            movement_type: Tipo de movimiento
            reason: Razón del movimiento
            user: Usuario que realiza el movimiento
            order: Orden asociada (opcional)
            reference: Referencia del movimiento
            notes: Notas adicionales
            
        Returns:
            StockMovement: Movimiento creado
        """
        return StockMovement.objects.create(
            product=product,
            variant=variant,
            movement_type=movement_type,
            reason=reason,
            quantity=quantity,
            order=order,
            reference=reference,
            notes=notes
        )
    
    @staticmethod
    def _check_low_stock_alerts(product: Product, variant: Optional[ProductVariant] = None) -> None:
        """
        Verifica y crea alertas de stock bajo.
        
        Args:
            product: Producto a verificar
            variant: Variante específica (opcional)
        """
        if not product.track_inventory:
            return
        
        # Determinar umbral de stock bajo
        if variant:
            current_stock = variant.inventory_quantity
            threshold = variant.low_stock_threshold
        else:
            current_stock = product.inventory_quantity
            threshold = product.low_stock_threshold
        
        # Verificar si está en stock bajo
        if current_stock <= threshold:
            # Verificar si ya existe una alerta activa
            existing_alert = StockAlert.objects.filter(
                product=product,
                variant=variant,
                status='active'
            ).first()
            
            if not existing_alert:
                # Crear nueva alerta
                StockAlert.objects.create(
                    product=product,
                    variant=variant,
                    current_quantity=current_stock,
                    threshold_quantity=threshold,
                    alert_type='low_stock',
                    message=f"El producto {product.name} tiene stock bajo. Actual: {current_stock}, Umbral: {threshold}"
                )
                
                logger.warning(f"Alerta de stock bajo creada: {product.name} - Stock: {current_stock}")
    
    @staticmethod
    def cleanup_expired_reservations() -> int:
        """
        Limpia las reservas expiradas.
        
        Returns:
            int: Número de reservas limpiadas
        """
        expired_reservations = StockReservation.objects.filter(
            status='active',
            expires_at__lt=timezone.now()
        )
        
        count = expired_reservations.count()
        
        for reservation in expired_reservations:
            AutoStockService.release_stock_reservation(reservation)
        
        logger.info(f"Limpieza de reservas expiradas: {count} reservas liberadas")
        return count
