"""
Backends de autenticación personalizados para el proyecto eCommerce.
Implementa autenticación con 2FA y validaciones de seguridad.
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import UserSecurityProfile, FailedLoginAttempt, SecurityEvent
from .validators import SecurityValidator
import logging

User = get_user_model()

logger = logging.getLogger('ecommerce.security')


class OTPSecurityBackend(ModelBackend):
    """
    Backend de autenticación que incluye validaciones de seguridad y 2FA.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """Autentica al usuario con validaciones de seguridad."""
        if not username or not password:
            return None
        
        # Sanitizar entrada
        username = SecurityValidator.sanitize_html(username)
        
        # Obtener IP del request
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
        
        try:
            # Buscar usuario
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Registrar intento fallido
            self._log_failed_attempt(ip_address, username, user_agent)
            return None
        
        # Verificar perfil de seguridad
        try:
            profile = user.security_profile
        except UserSecurityProfile.DoesNotExist:
            # Crear perfil si no existe
            profile = UserSecurityProfile.objects.create(user=user)
        
        # Verificar si la cuenta está bloqueada
        if profile.is_locked():
            self._log_security_event(
                user, 'account_locked', 
                f'Intento de login con cuenta bloqueada desde {ip_address}',
                ip_address, user_agent
            )
            return None
        
        # Verificar contraseña
        if not user.check_password(password):
            # Incrementar intentos fallidos
            profile.failed_login_attempts += 1
            if profile.failed_login_attempts >= 5:
                profile.lock_account()
                self._log_security_event(
                    user, 'account_locked',
                    f'Cuenta bloqueada por demasiados intentos fallidos desde {ip_address}',
                    ip_address, user_agent
                )
            else:
                profile.save(update_fields=['failed_login_attempts'])
            
            # Registrar intento fallido
            self._log_failed_attempt(ip_address, username, user_agent)
            return None
        
        # Login exitoso
        profile.unlock_account()
        self._log_security_event(
            user, 'login_success',
            f'Login exitoso desde {ip_address}',
            ip_address, user_agent
        )
        
        return user
    
    def _get_client_ip(self, request):
        """Obtiene la IP real del cliente."""
        if not request:
            return '127.0.0.1'
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        return ip
    
    def _log_failed_attempt(self, ip_address, username, user_agent):
        """Registra un intento de login fallido."""
        FailedLoginAttempt.objects.create(
            ip_address=ip_address,
            username=username,
            user_agent=user_agent
        )
        
        # Verificar si la IP debe ser bloqueada
        if FailedLoginAttempt.should_block_ip(ip_address):
            self._log_security_event(
                None, 'suspicious_activity',
                f'IP {ip_address} bloqueada por múltiples intentos fallidos',
                ip_address, user_agent
            )
    
    def _log_security_event(self, user, event_type, description, ip_address, user_agent):
        """Registra un evento de seguridad."""
        SecurityEvent.objects.create(
            user=user,
            event_type=event_type,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        logger.warning(f"Security Event: {event_type} - {description}")


