"""
Validadores de seguridad para el proyecto eCommerce.
Implementa validación robusta contra ataques comunes.
"""

import re
import html
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, URLValidator
from django.utils.translation import gettext_lazy as _


class SecurityValidator:
    """Validador de seguridad para datos de entrada."""
    
    # Patrones de ataque comunes
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
        r'<link[^>]*>',
        r'<meta[^>]*>',
        r'<style[^>]*>',
        r'expression\s*\(',
        r'url\s*\(',
        r'@import',
    ]
    
    SQL_INJECTION_PATTERNS = [
        r'union\s+select',
        r'drop\s+table',
        r'delete\s+from',
        r'insert\s+into',
        r'update\s+set',
        r'exec\s*\(',
        r'execute\s*\(',
        r'sp_',
        r'xp_',
        r'--',
        r'/\*.*?\*/',
        r';\s*drop',
        r';\s*delete',
        r';\s*insert',
        r';\s*update',
    ]
    
    @classmethod
    def validate_xss(cls, value):
        """Valida contra ataques XSS."""
        if not isinstance(value, str):
            return value
            
        value_lower = value.lower()
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE | re.DOTALL):
                raise ValidationError(
                    _('Contenido potencialmente malicioso detectado.'),
                    code='xss_detected'
                )
        return value
    
    @classmethod
    def validate_sql_injection(cls, value):
        """Valida contra inyecciones SQL."""
        if not isinstance(value, str):
            return value
            
        value_lower = value.lower()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE | re.DOTALL):
                raise ValidationError(
                    _('Patrón de inyección SQL detectado.'),
                    code='sql_injection_detected'
                )
        return value
    
    @classmethod
    def sanitize_html(cls, value):
        """Sanitiza HTML escapando caracteres peligrosos."""
        if not isinstance(value, str):
            return value
        return html.escape(value, quote=True)
    
    @classmethod
    def validate_email(cls, value):
        """Valida email con sanitización."""
        if not value:
            return value
            
        # Sanitizar primero
        value = cls.sanitize_html(value)
        
        # Validar formato
        email_validator = EmailValidator()
        email_validator(value)
        
        # Validar contra XSS
        cls.validate_xss(value)
        
        return value
    
    @classmethod
    def validate_url(cls, value):
        """Valida URL con sanitización."""
        if not value:
            return value
            
        # Sanitizar primero
        value = cls.sanitize_html(value)
        
        # Validar formato
        url_validator = URLValidator()
        url_validator(value)
        
        # Validar contra XSS
        cls.validate_xss(value)
        
        return value
    
    @classmethod
    def validate_phone(cls, value):
        """Valida número de teléfono."""
        if not value:
            return value
            
        # Patrón para teléfonos (números, +, -, espacios, paréntesis)
        phone_pattern = r'^[\+]?[0-9\s\-\(\)]{7,20}$'
        
        if not re.match(phone_pattern, value):
            raise ValidationError(
                _('Formato de teléfono inválido.'),
                code='invalid_phone'
            )
        
        return value
    
    @classmethod
    def validate_name(cls, value):
        """Valida nombres de personas."""
        if not value:
            return value
            
        # Sanitizar
        value = cls.sanitize_html(value)
        
        # Validar contra ataques
        cls.validate_xss(value)
        cls.validate_sql_injection(value)
        
        # Patrón para nombres (letras, espacios, guiones, apostrofes)
        name_pattern = r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\']{2,50}$'
        
        if not re.match(name_pattern, value):
            raise ValidationError(
                _('Formato de nombre inválido.'),
                code='invalid_name'
            )
        
        return value
    
    @classmethod
    def validate_address(cls, value):
        """Valida direcciones."""
        if not value:
            return value
            
        # Sanitizar
        value = cls.sanitize_html(value)
        
        # Validar contra ataques
        cls.validate_xss(value)
        cls.validate_sql_injection(value)
        
        # Longitud máxima
        if len(value) > 200:
            raise ValidationError(
                _('Dirección demasiado larga.'),
                code='address_too_long'
            )
        
        return value
    
    @classmethod
    def validate_payment_data(cls, data):
        """Valida datos de pago específicos."""
        if not isinstance(data, dict):
            raise ValidationError('Datos de pago inválidos.')
        
        # Validar campos requeridos
        required_fields = ['amount', 'currency', 'order_id']
        for field in required_fields:
            if field not in data:
                raise ValidationError(f'Campo requerido: {field}')
        
        # Validar monto
        try:
            amount = float(data['amount'])
            if amount <= 0:
                raise ValidationError('El monto debe ser mayor a 0.')
        except (ValueError, TypeError):
            raise ValidationError('Monto inválido.')
        
        # Validar moneda
        currency = data.get('currency', '').upper()
        valid_currencies = ['USD', 'COP', 'EUR', 'MXN']
        if currency not in valid_currencies:
            raise ValidationError('Moneda no soportada.')
        
        return data
