"""
Modelos de seguridad para el proyecto eCommerce.
Implementa historial de contraseñas y auditoría de seguridad.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
import hashlib

User = get_user_model()


class PasswordHistory(models.Model):
    """Historial de contraseñas del usuario."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_history')
    password_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'password_hash']
    
    def set_password(self, raw_password):
        """Establece la contraseña hasheada."""
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Verifica si la contraseña coincide."""
        return check_password(raw_password, self.password_hash)
    
    def save(self, *args, **kwargs):
        if not self.password_hash:
            # Si no hay hash, generar uno vacío (se debe establecer con set_password)
            self.password_hash = make_password('')
        super().save(*args, **kwargs)


class SecurityEvent(models.Model):
    """Eventos de seguridad para auditoría."""
    
    EVENT_TYPES = [
        ('login_success', 'Login Exitoso'),
        ('login_failed', 'Login Fallido'),
        ('password_changed', 'Contraseña Cambiada'),
        ('account_locked', 'Cuenta Bloqueada'),
        ('account_unlocked', 'Cuenta Desbloqueada'),
        ('suspicious_activity', 'Actividad Sospechosa'),
        ('admin_access', 'Acceso de Administrador'),
        ('data_export', 'Exportación de Datos'),
        ('api_access', 'Acceso a API'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.user or 'Sistema'} - {self.created_at}"


class SecurityConfiguration(models.Model):
    """Configuración de seguridad del sistema."""
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['key']
    
    def __str__(self):
        return f"{self.key}: {self.value}"
    
    @classmethod
    def get_setting(cls, key, default=None):
        """Obtiene una configuración de seguridad."""
        try:
            config = cls.objects.get(key=key, is_active=True)
            return config.value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_setting(cls, key, value, description=''):
        """Establece una configuración de seguridad."""
        config, created = cls.objects.get_or_create(
            key=key,
            defaults={'value': value, 'description': description}
        )
        if not created:
            config.value = value
            config.description = description
            config.save(update_fields=['value', 'description'])
        return config


class FailedLoginAttempt(models.Model):
    """Intentos de login fallidos para detección de ataques."""
    
    ip_address = models.GenericIPAddressField()
    username = models.CharField(max_length=150, blank=True)
    user_agent = models.TextField(blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    is_blocked = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-attempted_at']
        indexes = [
            models.Index(fields=['ip_address', 'attempted_at']),
            models.Index(fields=['username', 'attempted_at']),
        ]
    
    def __str__(self):
        return f"Failed login: {self.username or 'Unknown'} from {self.ip_address}"
    
    @classmethod
    def get_recent_attempts(cls, ip_address, minutes=15):
        """Obtiene intentos recientes desde una IP."""
        cutoff = timezone.now() - timezone.timedelta(minutes=minutes)
        return cls.objects.filter(
            ip_address=ip_address,
            attempted_at__gte=cutoff
        )
    
    @classmethod
    def should_block_ip(cls, ip_address, max_attempts=5, minutes=15):
        """Determina si una IP debe ser bloqueada."""
        recent_attempts = cls.get_recent_attempts(ip_address, minutes)
        return recent_attempts.count() >= max_attempts


class SecurityAlert(models.Model):
    """Alertas de seguridad del sistema."""
    
    ALERT_LEVELS = [
        ('low', 'Bajo'),
        ('medium', 'Medio'),
        ('high', 'Alto'),
        ('critical', 'Crítico'),
    ]
    
    ALERT_TYPES = [
        ('brute_force', 'Ataque de Fuerza Bruta'),
        ('suspicious_login', 'Login Sospechoso'),
        ('data_breach', 'Violación de Datos'),
        ('unauthorized_access', 'Acceso No Autorizado'),
        ('system_anomaly', 'Anomalía del Sistema'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    level = models.CharField(max_length=10, choices=ALERT_LEVELS)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['level', 'is_resolved']),
            models.Index(fields=['alert_type', 'is_resolved']),
        ]
    
    def __str__(self):
        return f"[{self.get_level_display()}] {self.title}"
    
    def resolve(self, user=None):
        """Resuelve la alerta."""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.save(update_fields=['is_resolved', 'resolved_at', 'resolved_by'])
