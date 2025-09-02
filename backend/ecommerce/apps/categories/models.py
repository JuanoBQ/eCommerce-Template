from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


class Category(models.Model):
    """
    Modelo para categorías de productos.
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=120, unique=True, blank=True)
    description = models.TextField(_('description'), blank=True)
    image = models.ImageField(_('image'), upload_to='categories/', blank=True, null=True)
    icon = models.CharField(_('icon'), max_length=50, blank=True)  # Para iconos de FontAwesome
    
    # Jerarquía de categorías
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('parent category')
    )
    
    # Configuración
    is_active = models.BooleanField(_('is active'), default=True)
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    
    # SEO
    meta_title = models.CharField(_('meta title'), max_length=200, blank=True)
    meta_description = models.TextField(_('meta description'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        db_table = 'categories'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def full_path(self):
        """
        Retorna la ruta completa de la categoría incluyendo padres.
        """
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    @property
    def level(self):
        """
        Retorna el nivel de profundidad de la categoría.
        """
        level = 0
        parent = self.parent
        while parent:
            level += 1
            parent = parent.parent
        return level
    
    def get_children(self):
        """
        Retorna todas las categorías hijas.
        """
        return Category.objects.filter(parent=self, is_active=True)
    
    def get_descendants(self):
        """
        Retorna todas las categorías descendientes.
        """
        descendants = []
        for child in self.get_children():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants


class Brand(models.Model):
    """
    Modelo para marcas de productos.
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=120, unique=True, blank=True)
    description = models.TextField(_('description'), blank=True)
    logo = models.ImageField(_('logo'), upload_to='brands/', blank=True, null=True)
    website = models.URLField(_('website'), blank=True)
    
    # Configuración
    is_active = models.BooleanField(_('is active'), default=True)
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    
    # SEO
    meta_title = models.CharField(_('meta title'), max_length=200, blank=True)
    meta_description = models.TextField(_('meta description'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Brand')
        verbose_name_plural = _('Brands')
        db_table = 'brands'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Size(models.Model):
    """
    Modelo para tallas de productos.
    """
    SIZE_TYPES = [
        ('clothing', _('Clothing')),
        ('shoes', _('Shoes')),
        ('accessories', _('Accessories')),
    ]
    
    name = models.CharField(_('name'), max_length=20)
    type = models.CharField(_('type'), max_length=20, choices=SIZE_TYPES, default='clothing')
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    is_active = models.BooleanField(_('is active'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Size')
        verbose_name_plural = _('Sizes')
        db_table = 'sizes'
        ordering = ['type', 'sort_order', 'name']
        unique_together = ['name', 'type']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Color(models.Model):
    """
    Modelo para colores de productos.
    """
    name = models.CharField(_('name'), max_length=50, unique=True)
    hex_code = models.CharField(_('hex code'), max_length=7, blank=True)  # #FFFFFF
    is_active = models.BooleanField(_('is active'), default=True)
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Color')
        verbose_name_plural = _('Colors')
        db_table = 'colors'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name
