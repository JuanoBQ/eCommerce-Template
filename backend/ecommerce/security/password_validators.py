"""
Validadores de contraseñas personalizados para el proyecto eCommerce.
Implementa validación de complejidad y seguridad de contraseñas.
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class ComplexityValidator:
    """
    Validador de complejidad de contraseñas.
    Verifica que la contraseña cumpla con criterios de seguridad.
    """
    
    def __init__(self, min_length=12, require_uppercase=True, require_lowercase=True, 
                 require_digits=True, require_symbols=True, max_similarity=0.7):
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_digits = require_digits
        self.require_symbols = require_symbols
        self.max_similarity = max_similarity
    
    def validate(self, password, user=None):
        """Valida la contraseña según los criterios de complejidad."""
        if not password:
            return
        
        errors = []
        
        # Longitud mínima
        if len(password) < self.min_length:
            errors.append(
                ValidationError(
                    _('La contraseña debe tener al menos %(min_length)d caracteres.'),
                    code='password_too_short',
                    params={'min_length': self.min_length},
                )
            )
        
        # Caracteres en mayúscula
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append(
                ValidationError(
                    _('La contraseña debe contener al menos una letra mayúscula.'),
                    code='password_no_upper',
                )
            )
        
        # Caracteres en minúscula
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append(
                ValidationError(
                    _('La contraseña debe contener al menos una letra minúscula.'),
                    code='password_no_lower',
                )
            )
        
        # Dígitos
        if self.require_digits and not re.search(r'\d', password):
            errors.append(
                ValidationError(
                    _('La contraseña debe contener al menos un dígito.'),
                    code='password_no_digit',
                )
            )
        
        # Símbolos
        if self.require_symbols and not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
            errors.append(
                ValidationError(
                    _('La contraseña debe contener al menos un símbolo especial.'),
                    code='password_no_symbol',
                )
            )
        
        # Verificar patrones comunes
        if self._has_common_patterns(password):
            errors.append(
                ValidationError(
                    _('La contraseña contiene patrones comunes que son fáciles de adivinar.'),
                    code='password_common_pattern',
                )
            )
        
        # Verificar repetición de caracteres
        if self._has_repeated_characters(password):
            errors.append(
                ValidationError(
                    _('La contraseña no debe contener más de 3 caracteres consecutivos iguales.'),
                    code='password_repeated_chars',
                )
            )
        
        # Verificar secuencias
        if self._has_sequences(password):
            errors.append(
                ValidationError(
                    _('La contraseña no debe contener secuencias de teclado.'),
                    code='password_sequences',
                )
            )
        
        if errors:
            raise ValidationError(errors)
    
    def _has_common_patterns(self, password):
        """Verifica si la contraseña contiene patrones comunes."""
        common_patterns = [
            r'123456',
            r'password',
            r'qwerty',
            r'abc123',
            r'admin',
            r'welcome',
            r'login',
            r'user',
            r'guest',
            r'test',
        ]
        
        password_lower = password.lower()
        for pattern in common_patterns:
            if pattern in password_lower:
                return True
        return False
    
    def _has_repeated_characters(self, password):
        """Verifica si hay más de 3 caracteres consecutivos iguales."""
        for i in range(len(password) - 3):
            if password[i] == password[i+1] == password[i+2] == password[i+3]:
                return True
        return False
    
    def _has_sequences(self, password):
        """Verifica si hay secuencias de teclado."""
        sequences = [
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm',
            '1234567890',
            'abcdefghijklmnopqrstuvwxyz',
        ]
        
        password_lower = password.lower()
        for sequence in sequences:
            for i in range(len(sequence) - 3):
                if sequence[i:i+4] in password_lower:
                    return True
        return False
    
    def get_help_text(self):
        """Retorna texto de ayuda para el validador."""
        help_texts = []
        
        if self.min_length:
            help_texts.append(f'Al menos {self.min_length} caracteres')
        
        if self.require_uppercase:
            help_texts.append('Una letra mayúscula')
        
        if self.require_lowercase:
            help_texts.append('Una letra minúscula')
        
        if self.require_digits:
            help_texts.append('Un dígito')
        
        if self.require_symbols:
            help_texts.append('Un símbolo especial')
        
        help_texts.append('Sin patrones comunes')
        help_texts.append('Sin secuencias de teclado')
        help_texts.append('Máximo 3 caracteres consecutivos iguales')
        
        return 'La contraseña debe contener: ' + ', '.join(help_texts) + '.'


class PasswordHistoryValidator:
    """
    Validador que previene reutilización de contraseñas anteriores.
    """
    
    def __init__(self, history_count=5):
        self.history_count = history_count
    
    def validate(self, password, user=None):
        """Valida que la contraseña no haya sido usada recientemente."""
        if not user or not user.pk:
            return
        
        # Obtener historial de contraseñas (implementar modelo PasswordHistory)
        from .models import PasswordHistory
        
        recent_passwords = PasswordHistory.objects.filter(
            user=user
        ).order_by('-created_at')[:self.history_count]
        
        for password_record in recent_passwords:
            if password_record.check_password(password):
                raise ValidationError(
                    _('No puedes reutilizar una de tus %(count)d contraseñas anteriores.'),
                    code='password_reused',
                    params={'count': self.history_count},
                )
    
    def get_help_text(self):
        return f'No puedes reutilizar ninguna de tus {self.history_count} contraseñas anteriores.'


class PasswordStrengthValidator:
    """
    Validador de fortaleza de contraseñas basado en entropía.
    """
    
    def __init__(self, min_entropy=50):
        self.min_entropy = min_entropy
    
    def validate(self, password, user=None):
        """Valida la fortaleza de la contraseña basada en entropía."""
        if not password:
            return
        
        entropy = self._calculate_entropy(password)
        
        if entropy < self.min_entropy:
            raise ValidationError(
                _('La contraseña no es lo suficientemente fuerte. Entropía: %(entropy).1f bits (mínimo: %(min_entropy)d bits)'),
                code='password_weak',
                params={'entropy': entropy, 'min_entropy': self.min_entropy},
            )
    
    def _calculate_entropy(self, password):
        """Calcula la entropía de la contraseña."""
        import math
        
        # Contar tipos de caracteres
        has_lower = bool(re.search(r'[a-z]', password))
        has_upper = bool(re.search(r'[A-Z]', password))
        has_digits = bool(re.search(r'\d', password))
        has_symbols = bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password))
        
        # Calcular tamaño del conjunto de caracteres
        charset_size = 0
        if has_lower:
            charset_size += 26
        if has_upper:
            charset_size += 26
        if has_digits:
            charset_size += 10
        if has_symbols:
            charset_size += 32  # Aproximado
        
        # Calcular entropía
        entropy = len(password) * math.log2(charset_size)
        
        return entropy
    
    def get_help_text(self):
        return f'La contraseña debe tener al menos {self.min_entropy} bits de entropía.'
