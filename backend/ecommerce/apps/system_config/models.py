from django.db import models
from django.utils.translation import gettext_lazy as _


class AdminSettings(models.Model):
    """
    Modelo para configuraciones del sistema de administración.
    """
    # Configuración general
    site_name = models.CharField(_('site name'), max_length=200, default='eCommerce Admin')
    site_description = models.TextField(_('site description'), blank=True)
    site_url = models.URLField(_('site URL'), default='http://localhost:3000')
    admin_email = models.EmailField(_('admin email'), default='admin@admin.com')
    
    # Configuración de email
    email_host = models.CharField(_('email host'), max_length=200, default='smtp.gmail.com')
    email_port = models.PositiveIntegerField(_('email port'), default=587)
    email_username = models.CharField(_('email username'), max_length=200, blank=True)
    email_password = models.CharField(_('email password'), max_length=200, blank=True)
    email_use_tls = models.BooleanField(_('email use TLS'), default=True)
    
    # Configuración de seguridad
    session_timeout = models.PositiveIntegerField(_('session timeout'), default=30)  # minutos
    max_login_attempts = models.PositiveIntegerField(_('max login attempts'), default=5)
    password_min_length = models.PositiveIntegerField(_('password min length'), default=8)
    require_2fa = models.BooleanField(_('require 2FA'), default=False)
    
    # Configuración de productos
    max_products_per_page = models.PositiveIntegerField(_('max products per page'), default=20)
    enable_reviews = models.BooleanField(_('enable reviews'), default=True)
    enable_wishlist = models.BooleanField(_('enable wishlist'), default=True)
    enable_notifications = models.BooleanField(_('enable notifications'), default=True)
    
    # Configuración de órdenes
    order_auto_confirm = models.BooleanField(_('order auto confirm'), default=False)
    order_auto_cancel_hours = models.PositiveIntegerField(_('order auto cancel hours'), default=24)
    enable_tracking = models.BooleanField(_('enable tracking'), default=True)
    
    # Configuración de pagos
    payment_gateway = models.CharField(_('payment gateway'), max_length=50, default='wompi')
    payment_test_mode = models.BooleanField(_('payment test mode'), default=True)
    currency = models.CharField(_('currency'), max_length=10, default='COP')
    
    # Configuración de notificaciones
    email_notifications = models.BooleanField(_('email notifications'), default=True)
    sms_notifications = models.BooleanField(_('SMS notifications'), default=False)
    push_notifications = models.BooleanField(_('push notifications'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Admin Settings')
        verbose_name_plural = _('Admin Settings')
        db_table = 'admin_settings'
    
    def __str__(self):
        return f"Configuración del Sistema - {self.site_name}"
    
    def save(self, *args, **kwargs):
        # Solo permitir una instancia de configuración
        if not self.pk and AdminSettings.objects.exists():
            raise ValueError("Solo puede existir una configuración del sistema")
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Obtiene la configuración del sistema, creándola si no existe."""
        settings, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'site_name': 'eCommerce Admin',
                'site_description': 'Panel de administración del eCommerce',
                'site_url': 'http://localhost:3000',
                'admin_email': 'admin@admin.com'
            }
        )
        return settings
