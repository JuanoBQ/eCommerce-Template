"""
Servicios para gestión de inventario y reservas de stock.
"""
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import StockMovement, StockAlert, StockReservation
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.cart.models import CartItem


class InventoryService:
    """
    Servicio principal para gestión de inventario.
    """
    
    @staticmethod
    def update_stock(product, variant=None, quantity_change=0, movement_type='adjustment', 
                     reason='adjustment', user=None, order=None, order_item=None, 
                     reservation=None, reference='', notes=''):
        """
        Actualiza el stock de un producto o variante.
        
        Args:
            product: Producto a actualizar
            variant: Variante específica (opcional)
            quantity_change: Cambio en la cantidad (positivo para entradas, negativo para salidas)
            movement_type: Tipo de movimiento
            reason: Razón del movimiento
            user: Usuario que realiza el movimiento
            order: Orden asociada (opcional)
            order_item: Item de orden asociado (opcional)
            reservation: Reserva asociada (opcional)
            reference: Referencia del movimiento
            notes: Notas adicionales
        """
        with transaction.atomic():
            # Crear movimiento de inventario
            movement = StockMovement.objects.create(
                product=product,
                variant=variant,
                movement_type=movement_type,
                reason=reason,
                quantity=quantity_change,
                order=order,
                order_item=order_item,
                reservation=reservation,
                reference=reference,
                notes=notes,
                user=user
            )
            
            # Actualizar stock
            if variant:
                variant.inventory_quantity += quantity_change
                variant.save()
                
                # Verificar alertas de stock
                InventoryService.check_stock_alerts(variant.product, variant)
            else:
                product.inventory_quantity += quantity_change
                product.save()
                
                # Verificar alertas de stock
                InventoryService.check_stock_alerts(product)
            
            return movement
    
    @staticmethod
    def check_stock_alerts(product, variant=None):
        """
        Verifica y crea alertas de stock si es necesario.
        """
        if not product.track_inventory:
            return
        
        current_quantity = variant.inventory_quantity if variant else product.inventory_quantity
        threshold = variant.low_stock_threshold if variant else product.low_stock_threshold
        
        # Verificar si ya existe una alerta activa
        existing_alert = StockAlert.objects.filter(
            product=product,
            variant=variant,
            status='active'
        ).first()
        
        # Determinar tipo de alerta
        alert_type = None
        if current_quantity == 0:
            alert_type = 'out_of_stock'
        elif current_quantity <= threshold:
            alert_type = 'low_stock'
        
        if alert_type:
            if existing_alert:
                # Actualizar alerta existente
                existing_alert.alert_type = alert_type
                existing_alert.current_quantity = current_quantity
                existing_alert.threshold_quantity = threshold
                existing_alert.save()
            else:
                # Crear nueva alerta
                StockAlert.objects.create(
                    product=product,
                    variant=variant,
                    alert_type=alert_type,
                    current_quantity=current_quantity,
                    threshold_quantity=threshold,
                    message=f'Stock {alert_type} para {product.name}'
                )
        else:
            # Resolver alerta existente si el stock se recuperó
            if existing_alert:
                existing_alert.resolve()
    
    @staticmethod
    def reserve_stock(product, variant=None, quantity=1, user=None, expires_in_minutes=30):
        """
        Reserva stock para un usuario (carrito de compras).
        
        Args:
            product: Producto a reservar
            variant: Variante específica (opcional)
            quantity: Cantidad a reservar
            user: Usuario que reserva
            expires_in_minutes: Minutos hasta que expire la reserva
        """
        # Verificar disponibilidad
        if not InventoryService.is_available(product, variant, quantity):
            return None
        
        # Crear reserva
        reservation = StockReservation.objects.create(
            product=product,
            variant=variant,
            user=user,
            quantity=quantity,
            expires_at=timezone.now() + timedelta(minutes=expires_in_minutes)
        )
        
        # Crear movimiento de reserva
        InventoryService.update_stock(
            product=product,
            variant=variant,
            quantity_change=-quantity,
            movement_type='reservation',
            reason='reservation',
            user=user,
            reservation=reservation,
            reference=f"RES-{reservation.id}",
            notes=f"Reserva de carrito para {user.full_name}"
        )
        
        return reservation
    
    @staticmethod
    def unreserve_stock(reservation):
        """
        Libera una reserva de stock.
        
        Args:
            reservation: Reserva a liberar
        """
        if reservation.status != 'active':
            return False
        
        # Crear movimiento de liberación
        InventoryService.update_stock(
            product=reservation.product,
            variant=reservation.variant,
            quantity_change=reservation.quantity,
            movement_type='unreservation',
            reason='unreservation',
            user=reservation.user,
            reservation=reservation,
            reference=f"UNRES-{reservation.id}",
            notes=f"Liberación de reserva para {reservation.user.full_name}"
        )
        
        # Marcar reserva como cancelada
        reservation.cancel()
        
        return True
    
    @staticmethod
    def is_available(product, variant=None, quantity=1):
        """
        Verifica si hay stock disponible (considerando reservas).
        """
        if not product.track_inventory:
            return True
        
        current_stock = variant.inventory_quantity if variant else product.inventory_quantity
        return current_stock >= quantity
    
    @staticmethod
    def get_available_quantity(product, variant=None):
        """
        Obtiene la cantidad disponible en stock (considerando reservas).
        """
        if not product.track_inventory:
            return float('inf')
        
        return variant.inventory_quantity if variant else product.inventory_quantity
    
    @staticmethod
    def process_order_stock(order):
        """
        Procesa el stock cuando se confirma una orden.
        """
        with transaction.atomic():
            for item in order.items.all():
                # Determinar si usar variante o producto
                variant = None
                if hasattr(item, 'variant') and item.variant:
                    variant = item.variant
                
                # Reducir stock
                InventoryService.update_stock(
                    product=item.product,
                    variant=variant,
                    quantity_change=-item.quantity,
                    movement_type='out',
                    reason='sale',
                    user=order.user,
                    order=order,
                    order_item=item,
                    reference=order.order_number,
                    notes=f'Venta - {order.order_number}'
                )
    
    @staticmethod
    def process_order_cancellation(order):
        """
        Procesa la devolución de stock cuando se cancela una orden.
        """
        with transaction.atomic():
            for item in order.items.all():
                # Determinar si usar variante o producto
                variant = None
                if hasattr(item, 'variant') and item.variant:
                    variant = item.variant
                
                # Devolver stock
                InventoryService.update_stock(
                    product=item.product,
                    variant=variant,
                    quantity_change=item.quantity,
                    movement_type='in',
                    reason='return',
                    user=order.user,
                    order=order,
                    order_item=item,
                    reference=order.order_number,
                    notes=f'Cancelación - {order.order_number}'
                )
    
    @staticmethod
    def cleanup_expired_reservations():
        """
        Limpia las reservas expiradas.
        """
        expired_reservations = StockReservation.objects.filter(
            status='active',
            expires_at__lt=timezone.now()
        )
        
        for reservation in expired_reservations:
            # Liberar el stock reservado
            InventoryService.unreserve_stock(reservation)
        
        return expired_reservations.count()
    
    @staticmethod
    def sync_cart_reservations(user):
        """
        Sincroniza las reservas de stock con el carrito del usuario.
        """
        try:
            cart = user.cart
        except:
            return
        
        # Obtener reservas activas del usuario
        active_reservations = StockReservation.objects.filter(
            user=user,
            status='active'
        )
        
        # Obtener items del carrito
        cart_items = cart.items.all()
        
        # Crear un mapa de reservas por producto/variante
        reservation_map = {}
        for reservation in active_reservations:
            key = (reservation.product.id, reservation.variant.id if reservation.variant else None)
            reservation_map[key] = reservation
        
        # Procesar items del carrito
        for cart_item in cart_items:
            key = (cart_item.product.id, cart_item.variant.id if cart_item.variant else None)
            
            if key in reservation_map:
                # Actualizar reserva existente si la cantidad cambió
                reservation = reservation_map[key]
                if reservation.quantity != cart_item.quantity:
                    # Liberar reserva anterior
                    InventoryService.unreserve_stock(reservation)
                    
                    # Crear nueva reserva con la cantidad correcta
                    InventoryService.reserve_stock(
                        product=cart_item.product,
                        variant=cart_item.variant,
                        quantity=cart_item.quantity,
                        user=user
                    )
            else:
                # Crear nueva reserva
                InventoryService.reserve_stock(
                    product=cart_item.product,
                    variant=cart_item.variant,
                    quantity=cart_item.quantity,
                    user=user
                )
        
        # Liberar reservas que ya no están en el carrito
        cart_keys = set()
        for cart_item in cart_items:
            key = (cart_item.product.id, cart_item.variant.id if cart_item.variant else None)
            cart_keys.add(key)
        
        for reservation in active_reservations:
            key = (reservation.product.id, reservation.variant.id if reservation.variant else None)
            if key not in cart_keys:
                InventoryService.unreserve_stock(reservation)
    
    @staticmethod
    def get_stock_summary(product, variant=None):
        """
        Obtiene un resumen del stock de un producto o variante.
        """
        current_stock = variant.inventory_quantity if variant else product.inventory_quantity
        threshold = variant.low_stock_threshold if variant else product.low_stock_threshold
        
        # Obtener movimientos recientes
        recent_movements = StockMovement.objects.filter(
            product=product,
            variant=variant
        ).order_by('-created_at')[:10]
        
        # Obtener alertas activas
        active_alerts = StockAlert.objects.filter(
            product=product,
            variant=variant,
            status='active'
        )
        
        # Obtener reservas activas
        active_reservations = StockReservation.objects.filter(
            product=product,
            variant=variant,
            status='active'
        )
        
        total_reserved = sum(res.quantity for res in active_reservations)
        
        return {
            'current_stock': current_stock,
            'threshold': threshold,
            'is_low_stock': current_stock <= threshold,
            'is_out_of_stock': current_stock == 0,
            'total_reserved': total_reserved,
            'available_for_sale': max(0, current_stock - total_reserved),
            'recent_movements': recent_movements,
            'active_alerts': active_alerts,
            'active_reservations': active_reservations
        }
