from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Modelo de usuario personalizado para el ecommerce.
    """
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    birth_date = models.DateField(_('birth date'), null=True, blank=True)
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', blank=True, null=True)
    
    # Campos adicionales para el ecommerce
    is_vendor = models.BooleanField(_('is vendor'), default=False)
    is_customer = models.BooleanField(_('is customer'), default=True)
    
    # Dirección por defecto
    default_address = models.TextField(_('default address'), blank=True)
    default_city = models.CharField(_('default city'), max_length=100, blank=True)
    default_state = models.CharField(_('default state'), max_length=100, blank=True)
    default_country = models.CharField(_('default country'), max_length=100, blank=True)
    default_postal_code = models.CharField(_('default postal code'), max_length=20, blank=True)
    
    # Configuración de notificaciones
    email_notifications = models.BooleanField(_('email notifications'), default=True)
    sms_notifications = models.BooleanField(_('sms notifications'), default=False)
    
    # Términos y condiciones
    terms_accepted = models.BooleanField(_('terms accepted'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        db_table = 'users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_admin(self):
        return self.is_staff or self.is_superuser


class UserProfile(models.Model):
    """
    Perfil extendido del usuario con información adicional.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Información personal
    bio = models.TextField(_('biography'), blank=True)
    website = models.URLField(_('website'), blank=True)
    
    # Preferencias de compra
    favorite_categories = models.ManyToManyField(
        'categories.Category',
        verbose_name=_('favorite categories'),
        blank=True
    )
    preferred_size = models.CharField(_('preferred size'), max_length=10, blank=True)
    preferred_brand = models.CharField(_('preferred brand'), max_length=100, blank=True)
    
    # Configuración de privacidad
    show_email = models.BooleanField(_('show email'), default=False)
    show_phone = models.BooleanField(_('show phone'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile of {self.user.full_name}"


class Address(models.Model):
    """
    Direcciones del usuario para envíos.
    """
    ADDRESS_TYPES = [
        ('home', _('Home')),
        ('work', _('Work')),
        ('other', _('Other')),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    type = models.CharField(_('type'), max_length=10, choices=ADDRESS_TYPES, default='home')
    is_default = models.BooleanField(_('is default'), default=False)
    
    # Información de la dirección
    street_address = models.CharField(_('street address'), max_length=255)
    apartment = models.CharField(_('apartment'), max_length=50, blank=True)
    city = models.CharField(_('city'), max_length=100)
    state = models.CharField(_('state'), max_length=100)
    country = models.CharField(_('country'), max_length=100)
    postal_code = models.CharField(_('postal code'), max_length=20)
    
    # Información de contacto
    contact_name = models.CharField(_('contact name'), max_length=150)
    contact_phone = models.CharField(_('contact phone'), max_length=20)
    
    # Instrucciones especiales
    delivery_instructions = models.TextField(_('delivery instructions'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Address')
        verbose_name_plural = _('Addresses')
        db_table = 'addresses'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.contact_name} - {self.street_address}, {self.city}"
    
    def save(self, *args, **kwargs):
        # Si se marca como default, desmarcar otros
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
