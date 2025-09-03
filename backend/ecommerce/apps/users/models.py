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



