from django.db import models
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import uuid


class Payment(models.Model):
    """
    Modelo para pagos de pedidos.
    """
    PAYMENT_METHODS = [
        ('credit_card', _('Credit Card')),
        ('debit_card', _('Debit Card')),
        ('bank_transfer', _('Bank Transfer')),
        ('cash_on_delivery', _('Cash on Delivery')),
        ('digital_wallet', _('Digital Wallet')),
        ('cryptocurrency', _('Cryptocurrency')),
    ]
    
    PAYMENT_STATUS = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
        ('partially_refunded', _('Partially Refunded')),
    ]
    
    PAYMENT_PROVIDERS = [
        ('wompi', _('Wompi')),
        ('mercadopago', _('MercadoPago')),
        ('stripe', _('Stripe')),
        ('paypal', _('PayPal')),
        ('manual', _('Manual')),
    ]
    
    # Identificación
    payment_id = models.CharField(_('payment ID'), max_length=100, unique=True)
    uuid = models.UUIDField(_('UUID'), default=uuid.uuid4, unique=True)
    
    # Relaciones
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('order')
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('user')
    )
    
    # Información del pago
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='COP')
    method = models.CharField(_('method'), max_length=20, choices=PAYMENT_METHODS)
    provider = models.CharField(_('provider'), max_length=20, choices=PAYMENT_PROVIDERS)
    status = models.CharField(_('status'), max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Información del proveedor
    provider_payment_id = models.CharField(_('provider payment ID'), max_length=200, blank=True)
    provider_transaction_id = models.CharField(_('provider transaction ID'), max_length=200, blank=True)
    provider_response = models.JSONField(_('provider response'), blank=True, null=True)
    
    # Información de la tarjeta (encriptada)
    card_last_four = models.CharField(_('card last four'), max_length=4, blank=True)
    card_brand = models.CharField(_('card brand'), max_length=20, blank=True)
    card_exp_month = models.CharField(_('card exp month'), max_length=2, blank=True)
    card_exp_year = models.CharField(_('card exp year'), max_length=4, blank=True)
    
    # Información adicional
    failure_reason = models.TextField(_('failure reason'), blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    processed_at = models.DateTimeField(_('processed at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'provider']),
            models.Index(fields=['order', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.order.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.payment_id:
            self.payment_id = self.generate_payment_id()
        super().save(*args, **kwargs)
    
    def generate_payment_id(self):
        """Genera un ID único para el pago."""
        import random
        import string
        from django.utils import timezone
        
        # Formato: PAY-YYYYMMDD-XXXXXX
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"PAY-{date_str}-{random_str}"
    
    @property
    def is_successful(self):
        """Verifica si el pago fue exitoso."""
        return self.status == 'completed'
    
    @property
    def is_failed(self):
        """Verifica si el pago falló."""
        return self.status == 'failed'
    
    @property
    def can_be_refunded(self):
        """Verifica si el pago puede ser reembolsado."""
        return self.status == 'completed'


class Refund(models.Model):
    """
    Modelo para reembolsos.
    """
    REFUND_STATUS = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('cancelled', _('Cancelled')),
    ]
    
    REFUND_TYPES = [
        ('full', _('Full Refund')),
        ('partial', _('Partial Refund')),
    ]
    
    # Identificación
    refund_id = models.CharField(_('refund ID'), max_length=100, unique=True)
    uuid = models.UUIDField(_('UUID'), default=uuid.uuid4, unique=True)
    
    # Relaciones
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='refunds',
        verbose_name=_('payment')
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='refunds',
        verbose_name=_('order')
    )
    
    # Información del reembolso
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    type = models.CharField(_('type'), max_length=10, choices=REFUND_TYPES)
    status = models.CharField(_('status'), max_length=20, choices=REFUND_STATUS, default='pending')
    reason = models.TextField(_('reason'))
    
    # Información del proveedor
    provider_refund_id = models.CharField(_('provider refund ID'), max_length=200, blank=True)
    provider_response = models.JSONField(_('provider response'), blank=True, null=True)
    
    # Información adicional
    notes = models.TextField(_('notes'), blank=True)
    processed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_refunds',
        verbose_name=_('processed by')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    processed_at = models.DateTimeField(_('processed at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Refund')
        verbose_name_plural = _('Refunds')
        db_table = 'refunds'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Refund {self.refund_id} - {self.payment.payment_id}"
    
    def save(self, *args, **kwargs):
        if not self.refund_id:
            self.refund_id = self.generate_refund_id()
        super().save(*args, **kwargs)
    
    def generate_refund_id(self):
        """Genera un ID único para el reembolso."""
        import random
        import string
        from django.utils import timezone
        
        # Formato: REF-YYYYMMDD-XXXXXX
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"REF-{date_str}-{random_str}"


class PaymentMethod(models.Model):
    """
    Métodos de pago guardados del usuario.
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='payment_methods',
        verbose_name=_('user')
    )
    
    # Información del método de pago
    type = models.CharField(_('type'), max_length=20, choices=Payment.PAYMENT_METHODS)
    provider = models.CharField(_('provider'), max_length=20, choices=Payment.PAYMENT_PROVIDERS)
    is_default = models.BooleanField(_('is default'), default=False)
    
    # Información de la tarjeta (encriptada)
    card_last_four = models.CharField(_('card last four'), max_length=4)
    card_brand = models.CharField(_('card brand'), max_length=20)
    card_exp_month = models.CharField(_('card exp month'), max_length=2)
    card_exp_year = models.CharField(_('card exp year'), max_length=4)
    card_holder_name = models.CharField(_('card holder name'), max_length=150)
    
    # Información del proveedor
    provider_payment_method_id = models.CharField(_('provider payment method ID'), max_length=200)
    
    # Configuración
    is_active = models.BooleanField(_('is active'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Payment Method')
        verbose_name_plural = _('Payment Methods')
        db_table = 'payment_methods'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.card_brand} ****{self.card_last_four} - {self.user.full_name}"
    
    def save(self, *args, **kwargs):
        # Si se marca como default, desmarcar otros
        if self.is_default:
            PaymentMethod.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
