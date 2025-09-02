from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Product(models.Model):
    """
    Modelo principal para productos.
    """
    PRODUCT_STATUS = [
        ('draft', _('Draft')),
        ('published', _('Published')),
        ('archived', _('Archived')),
    ]
    
    # Información básica
    name = models.CharField(_('name'), max_length=200)
    slug = models.SlugField(_('slug'), max_length=250, unique=True, blank=True)
    description = models.TextField(_('description'))
    short_description = models.TextField(_('short description'), max_length=500, blank=True)
    sku = models.CharField(_('SKU'), max_length=100, unique=True)
    
    # Categorización
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('category')
    )
    brand = models.ForeignKey(
        'categories.Brand',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_('brand')
    )
    
    # Género
    GENDER_CHOICES = [
        ('masculino', _('Masculino')),
        ('femenino', _('Femenino')),
        ('unisex', _('Unisex')),
    ]
    gender = models.CharField(
        _('gender'),
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        help_text=_('Género del producto')
    )
    
    # Precios
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    compare_price = models.DecimalField(
        _('compare price'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Precio original para mostrar descuentos')
    )
    cost_price = models.DecimalField(
        _('cost price'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Precio de costo para calcular márgenes')
    )
    
    # Inventario
    track_inventory = models.BooleanField(_('track inventory'), default=True)
    inventory_quantity = models.PositiveIntegerField(_('inventory quantity'), default=0)
    low_stock_threshold = models.PositiveIntegerField(_('low stock threshold'), default=5)
    allow_backorder = models.BooleanField(_('allow backorder'), default=False)
    
    # Configuración
    status = models.CharField(_('status'), max_length=20, choices=PRODUCT_STATUS, default='draft')
    is_featured = models.BooleanField(_('is featured'), default=False)
    is_digital = models.BooleanField(_('is digital'), default=False)
    requires_shipping = models.BooleanField(_('requires shipping'), default=True)
    weight = models.DecimalField(
        _('weight'),
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Peso en kg')
    )
    
    # SEO
    meta_title = models.CharField(_('meta title'), max_length=200, blank=True)
    meta_description = models.TextField(_('meta description'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    published_at = models.DateTimeField(_('published at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['brand', 'status']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def is_in_stock(self):
        """Verifica si el producto está en stock."""
        if not self.track_inventory:
            return True
        return self.inventory_quantity > 0
    
    @property
    def is_low_stock(self):
        """Verifica si el producto tiene stock bajo."""
        if not self.track_inventory:
            return False
        return self.inventory_quantity <= self.low_stock_threshold
    
    @property
    def discount_percentage(self):
        """Calcula el porcentaje de descuento."""
        if self.compare_price and self.compare_price > self.price:
            return round(((self.compare_price - self.price) / self.compare_price) * 100, 2)
        return 0
    
    @property
    def margin_percentage(self):
        """Calcula el margen de ganancia."""
        if self.cost_price and self.cost_price > 0:
            return round(((self.price - self.cost_price) / self.cost_price) * 100, 2)
        return 0


class ProductImage(models.Model):
    """
    Imágenes de productos.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('product')
    )
    image = models.ImageField(_('image'), upload_to='products/')
    alt_text = models.CharField(_('alt text'), max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    is_primary = models.BooleanField(_('is primary'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Product Image')
        verbose_name_plural = _('Product Images')
        db_table = 'product_images'
        ordering = ['sort_order', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} - Image {self.sort_order}"
    
    def save(self, *args, **kwargs):
        # Si se marca como primaria, desmarcar otras
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)


class ProductVariant(models.Model):
    """
    Variantes de productos (tallas, colores, etc.).
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
        verbose_name=_('product')
    )
    sku = models.CharField(_('SKU'), max_length=100, unique=True)
    
    # Atributos de la variante
    size = models.ForeignKey(
        'categories.Size',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('size')
    )
    color = models.ForeignKey(
        'categories.Color',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('color')
    )
    
    # Precios específicos de la variante
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Precio específico de la variante. Si está vacío, usa el precio del producto.')
    )
    compare_price = models.DecimalField(
        _('compare price'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Inventario específico de la variante
    inventory_quantity = models.PositiveIntegerField(_('inventory quantity'), default=0)
    low_stock_threshold = models.PositiveIntegerField(_('low stock threshold'), default=5)
    
    # Configuración
    is_active = models.BooleanField(_('is active'), default=True)
    weight = models.DecimalField(
        _('weight'),
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Product Variant')
        verbose_name_plural = _('Product Variants')
        db_table = 'product_variants'
        unique_together = ['product', 'size', 'color']
    
    def __str__(self):
        variant_name = self.product.name
        if self.size:
            variant_name += f" - {self.size.name}"
        if self.color:
            variant_name += f" - {self.color.name}"
        return variant_name
    
    @property
    def final_price(self):
        """Retorna el precio final de la variante."""
        return self.price if self.price else self.product.price
    
    @property
    def final_compare_price(self):
        """Retorna el precio de comparación final."""
        return self.compare_price if self.compare_price else self.product.compare_price
    
    @property
    def is_in_stock(self):
        """Verifica si la variante está en stock."""
        if not self.product.track_inventory:
            return True
        return self.inventory_quantity > 0
    
    @property
    def is_low_stock(self):
        """Verifica si la variante tiene stock bajo."""
        if not self.product.track_inventory:
            return False
        return self.inventory_quantity <= self.low_stock_threshold


class ProductReview(models.Model):
    """
    Reseñas de productos.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_('product')
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='product_reviews',
        verbose_name=_('user')
    )
    rating = models.PositiveIntegerField(
        _('rating'),
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(_('title'), max_length=200)
    comment = models.TextField(_('comment'))
    is_verified_purchase = models.BooleanField(_('is verified purchase'), default=False)
    is_approved = models.BooleanField(_('is approved'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Product Review')
        verbose_name_plural = _('Product Reviews')
        db_table = 'product_reviews'
        unique_together = ['product', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.product.name} ({self.rating}/5)"


class ProductTag(models.Model):
    """
    Etiquetas para productos.
    """
    name = models.CharField(_('name'), max_length=50, unique=True)
    slug = models.SlugField(_('slug'), max_length=60, unique=True, blank=True)
    color = models.CharField(_('color'), max_length=7, default='#000000')  # Hex color
    is_active = models.BooleanField(_('is active'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Product Tag')
        verbose_name_plural = _('Product Tags')
        db_table = 'product_tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ProductTagRelation(models.Model):
    """
    Relación entre productos y etiquetas.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    tag = models.ForeignKey(ProductTag, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = _('Product Tag Relation')
        verbose_name_plural = _('Product Tag Relations')
        db_table = 'product_tag_relations'
        unique_together = ['product', 'tag']
    
    def __str__(self):
        return f"{self.product.name} - {self.tag.name}"
