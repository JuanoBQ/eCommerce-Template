from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal


class StockReservation(models.Model):
    """
    Modelo para reservas de stock (carrito de compras).
    """
    RESERVATION_STATUS = [
        ('active', _('Activa')),
        ('expired', _('Expirada')),
        ('consumed', _('Consumida')),
        ('cancelled', _('Cancelada')),
    ]
    
    # Referencias
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='stock_reservations',
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='stock_reservations',
        verbose_name=_('variant')
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='stock_reservations',
        verbose_name=_('user')
    )
    
    # Reserva
    quantity = models.PositiveIntegerField(_('quantity'))
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=RESERVATION_STATUS,
        default='active'
    )
    
    # Referencias externas
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_reservations',
        verbose_name=_('order')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    expires_at = models.DateTimeField(_('expires at'))
    consumed_at = models.DateTimeField(_('consumed at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Stock Reservation')
        verbose_name_plural = _('Stock Reservations')
        db_table = 'stock_reservations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['expires_at', 'status']),
        ]
    
    def __str__(self):
        return f"Reserva - {self.product.name} ({self.quantity})"
    
    @property
    def is_expired(self):
        """Verifica si la reserva ha expirado."""
        return timezone.now() > self.expires_at
    
    def consume(self, order=None):
        """Consume la reserva (convierte en venta)."""
        self.status = 'consumed'
        self.order = order
        self.consumed_at = timezone.now()
        self.save()
    
    def cancel(self):
        """Cancela la reserva."""
        self.status = 'cancelled'
        self.save()


class StockMovement(models.Model):
    """
    Modelo para registrar movimientos de inventario.
    """
    MOVEMENT_TYPES = [
        ('in', _('Entrada')),
        ('out', _('Salida')),
        ('adjustment', _('Ajuste')),
        ('reservation', _('Reserva')),
        ('unreservation', _('Liberación de Reserva')),
        ('return', _('Devolución')),
    ]
    
    REASONS = [
        ('purchase', _('Compra')),
        ('sale', _('Venta')),
        ('return', _('Devolución')),
        ('adjustment', _('Ajuste manual')),
        ('reservation', _('Reserva de carrito')),
        ('unreservation', _('Liberación de reserva')),
        ('damage', _('Daño')),
        ('expired', _('Vencido')),
        ('other', _('Otro')),
    ]
    
    # Referencias
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='stock_movements',
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='stock_movements',
        verbose_name=_('variant')
    )
    
    # Movimiento
    movement_type = models.CharField(
        _('movement type'),
        max_length=20,
        choices=MOVEMENT_TYPES
    )
    reason = models.CharField(
        _('reason'),
        max_length=20,
        choices=REASONS
    )
    quantity = models.IntegerField(_('quantity'))  # Positivo para entradas, negativo para salidas
    
    # Referencias externas
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements',
        verbose_name=_('order')
    )
    order_item = models.ForeignKey(
        'orders.OrderItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements',
        verbose_name=_('order item')
    )
    reservation = models.ForeignKey(
        StockReservation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements',
        verbose_name=_('reservation')
    )
    
    # Información adicional
    reference = models.CharField(_('reference'), max_length=100, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Usuario que realizó el movimiento
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements',
        verbose_name=_('user')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Stock Movement')
        verbose_name_plural = _('Stock Movements')
        db_table = 'stock_movements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'created_at']),
            models.Index(fields=['variant', 'created_at']),
            models.Index(fields=['movement_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"


class StockAlert(models.Model):
    """
    Modelo para alertas de stock.
    """
    ALERT_TYPES = [
        ('low_stock', _('Stock Bajo')),
        ('out_of_stock', _('Sin Stock')),
        ('overstock', _('Sobrestock')),
    ]
    
    ALERT_STATUS = [
        ('active', _('Activa')),
        ('acknowledged', _('Reconocida')),
        ('resolved', _('Resuelta')),
    ]
    
    # Referencias
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='stock_alerts',
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='stock_alerts',
        verbose_name=_('variant')
    )
    
    # Alerta
    alert_type = models.CharField(
        _('alert type'),
        max_length=20,
        choices=ALERT_TYPES
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=ALERT_STATUS,
        default='active'
    )
    
    # Valores
    current_quantity = models.PositiveIntegerField(_('current quantity'))
    threshold_quantity = models.PositiveIntegerField(_('threshold quantity'))
    
    # Información adicional
    message = models.TextField(_('message'), blank=True)
    acknowledged_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts',
        verbose_name=_('acknowledged by')
    )
    acknowledged_at = models.DateTimeField(_('acknowledged at'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Stock Alert')
        verbose_name_plural = _('Stock Alerts')
        db_table = 'stock_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['alert_type', 'status']),
        ]
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.product.name}"
    
    def acknowledge(self, user):
        """Marca la alerta como reconocida."""
        self.status = 'acknowledged'
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save()
    
    def resolve(self):
        """Marca la alerta como resuelta."""
        self.status = 'resolved'
        self.save()
