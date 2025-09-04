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


class UserAddress(models.Model):
    """
    Modelo para direcciones de usuario.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(_('address title'), max_length=100, help_text=_('e.g., Home, Work'))
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    company = models.CharField(_('company'), max_length=100, blank=True)
    address_line_1 = models.CharField(_('address line 1'), max_length=255)
    address_line_2 = models.CharField(_('address line 2'), max_length=255, blank=True)
    city = models.CharField(_('city'), max_length=100)
    state = models.CharField(_('state/province'), max_length=100)
    postal_code = models.CharField(_('postal code'), max_length=20)
    country = models.CharField(_('country'), max_length=100, default='España')
    phone = models.CharField(_('phone number'), max_length=20, blank=True)
    is_default = models.BooleanField(_('is default address'), default=False)
    is_billing = models.BooleanField(_('is billing address'), default=False)
    is_shipping = models.BooleanField(_('is shipping address'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('User Address')
        verbose_name_plural = _('User Addresses')
        db_table = 'user_addresses'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    def save(self, *args, **kwargs):
        # Si se marca como default, desmarcar otros
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    @property
    def full_address(self):
        """Retorna la dirección completa formateada."""
        address_parts = [
            self.address_line_1,
            self.address_line_2 if self.address_line_2 else None,
            f"{self.city}, {self.state} {self.postal_code}",
            self.country
        ]
        return ', '.join(filter(None, address_parts))



