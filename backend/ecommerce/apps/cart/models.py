from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal


class Cart(models.Model):
    """
    Carrito de compras del usuario.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name=_('user')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Cart')
        verbose_name_plural = _('Carts')
        db_table = 'carts'
    
    def __str__(self):
        return f"Cart of {self.user.full_name}"
    
    @property
    def total_items(self):
        """Retorna el total de items en el carrito."""
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_price(self):
        """Retorna el precio total del carrito."""
        return sum(item.total_price for item in self.items.all())
    
    @property
    def is_empty(self):
        """Verifica si el carrito está vacío."""
        return self.items.count() == 0


class CartItem(models.Model):
    """
    Items individuales en el carrito.
    """
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('cart')
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_('variant')
    )
    quantity = models.PositiveIntegerField(
        _('quantity'),
        validators=[MinValueValidator(1)],
        default=1
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Cart Item')
        verbose_name_plural = _('Cart Items')
        db_table = 'cart_items'
        unique_together = ['cart', 'product', 'variant']
    
    def __str__(self):
        variant_info = f" - {self.variant}" if self.variant else ""
        return f"{self.product.name}{variant_info} x{self.quantity}"
    
    @property
    def unit_price(self):
        """Retorna el precio unitario del item."""
        if self.variant:
            return self.variant.final_price
        return self.product.price
    
    @property
    def total_price(self):
        """Retorna el precio total del item."""
        return self.unit_price * self.quantity
    
    def clean(self):
        """Validaciones del modelo."""
        from django.core.exceptions import ValidationError
        
        # Verificar que la variante pertenece al producto
        if self.variant and self.variant.product != self.product:
            raise ValidationError(_('La variante debe pertenecer al producto seleccionado.'))
        
        # Verificar stock disponible
        if self.product.track_inventory:
            available_quantity = self.variant.inventory_quantity if self.variant else self.product.inventory_quantity
            if self.quantity > available_quantity and not self.product.allow_backorder:
                raise ValidationError(_('No hay suficiente stock disponible.'))
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    """
    Lista de deseos del usuario.
    """
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='wishlist',
        verbose_name=_('user')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Wishlist')
        verbose_name_plural = _('Wishlists')
        db_table = 'wishlists'
    
    def __str__(self):
        return f"Wishlist of {self.user.full_name}"


class WishlistItem(models.Model):
    """
    Items en la lista de deseos.
    """
    wishlist = models.ForeignKey(
        Wishlist,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('wishlist')
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        verbose_name=_('product')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Wishlist Item')
        verbose_name_plural = _('Wishlist Items')
        db_table = 'wishlist_items'
        unique_together = ['wishlist', 'product']
    
    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.full_name}'s wishlist"
