"""
Decoradores de cache personalizados para el proyecto eCommerce.
"""

import hashlib
import json
from functools import wraps
from django.core.cache import cache
from django.conf import settings
from django.utils.encoding import force_str


def cache_result(timeout=None, key_prefix='', cache_alias='default'):
    """
    Decorador para cachear el resultado de una función.
    
    Args:
        timeout: Tiempo de expiración en segundos
        key_prefix: Prefijo para la clave de cache
        cache_alias: Alias del cache a usar
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave única basada en función y argumentos
            cache_key = _generate_cache_key(func, args, kwargs, key_prefix)
            
            # Intentar obtener del cache
            result = cache.get(cache_key, cache_alias)
            if result is not None:
                return result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout or 300, cache_alias)
            return result
        return wrapper
    return decorator


def cache_invalidate(pattern, cache_alias='default'):
    """
    Decorador para invalidar cache basado en un patrón.
    
    Args:
        pattern: Patrón de claves a invalidar
        cache_alias: Alias del cache a usar
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            # Invalidar cache basado en patrón
            if hasattr(cache, 'delete_pattern'):
                cache.delete_pattern(pattern, cache_alias)
            else:
                # Fallback para caches que no soportan delete_pattern
                cache.clear(cache_alias)
            
            return result
        return wrapper
    return decorator


def cache_by_user(timeout=None, key_prefix='', cache_alias='default'):
    """
    Decorador para cachear resultados por usuario.
    
    Args:
        timeout: Tiempo de expiración en segundos
        key_prefix: Prefijo para la clave de cache
        cache_alias: Alias del cache a usar
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            user_id = getattr(request.user, 'id', 'anonymous')
            cache_key = f"{key_prefix}:user:{user_id}:{func.__name__}"
            
            # Intentar obtener del cache
            result = cache.get(cache_key, cache_alias)
            if result is not None:
                return result
            
            # Ejecutar función y cachear resultado
            result = func(self, request, *args, **kwargs)
            cache.set(cache_key, result, timeout or 300, cache_alias)
            return result
        return wrapper
    return decorator


def _generate_cache_key(func, args, kwargs, key_prefix):
    """
    Genera una clave única para el cache basada en la función y argumentos.
    """
    # Crear hash de los argumentos
    args_str = json.dumps(args, sort_keys=True, default=str)
    kwargs_str = json.dumps(kwargs, sort_keys=True, default=str)
    
    # Generar hash único
    key_data = f"{func.__module__}.{func.__name__}:{args_str}:{kwargs_str}"
    key_hash = hashlib.md5(force_str(key_data).encode()).hexdigest()
    
    return f"{key_prefix}:{key_hash}" if key_prefix else key_hash


class CacheManager:
    """
    Gestor de cache para operaciones complejas.
    """
    
    def __init__(self, cache_alias='default'):
        self.cache_alias = cache_alias
    
    def get_or_set(self, key, callable_func, timeout=None):
        """
        Obtiene un valor del cache o lo calcula y guarda.
        """
        result = cache.get(key, self.cache_alias)
        if result is None:
            result = callable_func()
            cache.set(key, result, timeout or 300, self.cache_alias)
        return result
    
    def invalidate_pattern(self, pattern):
        """
        Invalida todas las claves que coincidan con el patrón.
        """
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern, self.cache_alias)
        else:
            cache.clear(self.cache_alias)
    
    def warm_up(self, keys_and_callables):
        """
        Pre-calienta el cache con múltiples claves.
        """
        for key, callable_func, timeout in keys_and_callables:
            self.get_or_set(key, callable_func, timeout)
    
    def get_stats(self):
        """
        Obtiene estadísticas del cache.
        """
        # Esta implementación depende del backend de cache
        return {
            'cache_alias': self.cache_alias,
            'backend': cache._cache.get_backend_timeout(self.cache_alias) if hasattr(cache, '_cache') else 'unknown'
        }
