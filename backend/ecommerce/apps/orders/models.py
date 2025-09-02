from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class Order(models.Model):
    """
    Modelo principal para pedidos.
    """
    ORDER_STATUS = [
        ('pending', _('Pending')),
        ('confirmed', _('Confirmed')),
        ('processing', _('Processing')),
        ('shipped', _('Shipped')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    ]
    
    PAYMENT_STATUS = [
        ('pending', _('Pending')),
        ('paid', _('Paid')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
        ('partially_refunded', _('Partially Refunded')),
    ]
    
    # Identificación
    order_number = models.CharField(_('order number'), max_length=20, unique=True)
    uuid = models.UUIDField(_('UUID'), default=uuid.uuid4, unique=True)
    
    # Usuario
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name=_('user')
    )
    
    # Estado del pedido
    status = models.CharField(_('status'), max_length=20, choices=ORDER_STATUS, default='pending')
    payment_status = models.CharField(_('payment status'), max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Información de contacto
    email = models.EmailField(_('email'))
    phone = models.CharField(_('phone'), max_length=20)
    
    # Dirección de envío
    shipping_first_name = models.CharField(_('shipping first name'), max_length=150)
    shipping_last_name = models.CharField(_('shipping last name'), max_length=150)
    shipping_address = models.TextField(_('shipping address'))
    shipping_city = models.CharField(_('shipping city'), max_length=100)
    shipping_state = models.CharField(_('shipping state'), max_length=100)
    shipping_country = models.CharField(_('shipping country'), max_length=100)
    shipping_postal_code = models.CharField(_('shipping postal code'), max_length=20)
    
    # Dirección de facturación (opcional, por defecto igual a envío)
    billing_first_name = models.CharField(_('billing first name'), max_length=150, blank=True)
    billing_last_name = models.CharField(_('billing last name'), max_length=150, blank=True)
    billing_address = models.TextField(_('billing address'), blank=True)
    billing_city = models.CharField(_('billing city'), max_length=100, blank=True)
    billing_state = models.CharField(_('billing state'), max_length=100, blank=True)
    billing_country = models.CharField(_('billing country'), max_length=100, blank=True)
    billing_postal_code = models.CharField(_('billing postal code'), max_length=20, blank=True)
    
    # Precios
    subtotal = models.DecimalField(_('subtotal'), max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(_('tax amount'), max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(_('shipping amount'), max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(_('discount amount'), max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(_('total amount'), max_digits=10, decimal_places=2)
    
    # Información adicional
    notes = models.TextField(_('notes'), blank=True)
    tracking_number = models.CharField(_('tracking number'), max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    shipped_at = models.DateTimeField(_('shipped at'), null=True, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'payment_status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['order_number']),
        ]
    
    def __str__(self):
        return f"Order #{self.order_number} - {self.user.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        
        # Si no hay dirección de facturación, usar la de envío
        if not self.billing_first_name:
            self.billing_first_name = self.shipping_first_name
            self.billing_last_name = self.shipping_last_name
            self.billing_address = self.shipping_address
            self.billing_city = self.shipping_city
            self.billing_state = self.shipping_state
            self.billing_country = self.shipping_country
            self.billing_postal_code = self.shipping_postal_code
        
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        """Genera un número de pedido único."""
        import random
        import string
        from django.utils import timezone
        
        # Formato: YYYYMMDD-XXXXXX
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"{date_str}-{random_str}"
    
    @property
    def is_paid(self):
        """Verifica si el pedido está pagado."""
        return self.payment_status == 'paid'
    
    @property
    def can_be_cancelled(self):
        """Verifica si el pedido puede ser cancelado."""
        return self.status in ['pending', 'confirmed', 'processing']
    
    @property
    def total_items(self):
        """Retorna el total de items en el pedido."""
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    """
    Items individuales en un pedido.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('order')
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('variant')
    )
    quantity = models.PositiveIntegerField(
        _('quantity'),
        validators=[MinValueValidator(1)]
    )
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_('total price'), max_digits=10, decimal_places=2)
    
    # Información del producto al momento de la compra (snapshot)
    product_name = models.CharField(_('product name'), max_length=200)
    product_sku = models.CharField(_('product SKU'), max_length=100)
    variant_info = models.CharField(_('variant info'), max_length=200, blank=True)
    
    class Meta:
        verbose_name = _('Order Item')
        verbose_name_plural = _('Order Items')
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity} - {self.order.order_number}"
    
    def save(self, *args, **kwargs):
        # Guardar información del producto al momento de la compra
        if not self.product_name:
            self.product_name = self.product.name
        if not self.product_sku:
            self.product_sku = self.product.sku
        if self.variant and not self.variant_info:
            variant_parts = []
            if self.variant.size:
                variant_parts.append(self.variant.size.name)
            if self.variant.color:
                variant_parts.append(self.variant.color.name)
            self.variant_info = ' - '.join(variant_parts)
        
        # Calcular precio total
        self.total_price = self.unit_price * self.quantity
        
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    """
    Historial de cambios de estado de pedidos.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history',
        verbose_name=_('order')
    )
    status = models.CharField(_('status'), max_length=20, choices=Order.ORDER_STATUS)
    notes = models.TextField(_('notes'), blank=True)
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Order Status History')
        verbose_name_plural = _('Order Status Histories')
        db_table = 'order_status_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.get_status_display()}"


class OrderNote(models.Model):
    """
    Notas internas para pedidos.
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='order_notes',
        verbose_name=_('order')
    )
    note = models.TextField(_('note'))
    is_public = models.BooleanField(_('is public'), default=False)
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('created by')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Order Note')
        verbose_name_plural = _('Order Notes')
        db_table = 'order_notes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.order.order_number}"
