"""
Configuración de cache para el proyecto eCommerce.
Soporta múltiples backends: Redis, Memcached, y cache local.
"""

from decouple import config
import os

# Configuración de cache con fallback automático
import os
from django.core.cache.backends.redis import RedisCache
from django.core.cache.backends.locmem import LocMemCache

def get_cache_config():
    """
    Obtiene configuración de cache con fallback automático a local.
    """
    redis_url = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
    
    # Intentar conectar a Redis
    try:
        import redis
        r = redis.from_url(redis_url)
        r.ping()  # Test de conexión
        use_redis = True
    except:
        use_redis = False
    
    if use_redis:
        return {
            'default': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': redis_url,
                'TIMEOUT': 300,
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                    'CONNECTION_POOL_KWARGS': {
                        'max_connections': 50,
                        'retry_on_timeout': True,
                    }
                }
            },
            'sessions': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': redis_url.replace('/0', '/1'),
                'TIMEOUT': 86400,
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                }
            },
            'products': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': redis_url.replace('/0', '/2'),
                'TIMEOUT': 3600,
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                }
            },
            'payments': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': redis_url.replace('/0', '/3'),
                'TIMEOUT': 1800,
                'OPTIONS': {
                    'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                }
            }
        }
    else:
        # Fallback a cache local
        return {
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'unique-snowflake',
                'TIMEOUT': 300,
                'OPTIONS': {
                    'MAX_ENTRIES': 1000,
                    'CULL_FREQUENCY': 3,
                }
            },
            'sessions': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'sessions-cache',
                'TIMEOUT': 86400,
                'OPTIONS': {
                    'MAX_ENTRIES': 1000,
                    'CULL_FREQUENCY': 3,
                }
            },
            'products': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'products-cache',
                'TIMEOUT': 3600,
                'OPTIONS': {
                    'MAX_ENTRIES': 500,
                    'CULL_FREQUENCY': 3,
                }
            },
            'payments': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'payments-cache',
                'TIMEOUT': 1800,
                'OPTIONS': {
                    'MAX_ENTRIES': 500,
                    'CULL_FREQUENCY': 3,
                }
            }
        }

CACHES = get_cache_config()

# Configuración de sesiones con cache (deshabilitado temporalmente)
# SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
# SESSION_CACHE_ALIAS = 'sessions'
SESSION_COOKIE_AGE = 86400  # 24 horas

# Configuración de cache para diferentes tipos de datos
CACHE_TIMEOUTS = {
    'products': 3600,      # 1 hora
    'categories': 7200,    # 2 horas
    'user_profiles': 1800, # 30 minutos
    'payment_intents': 900, # 15 minutos
    'order_stats': 300,    # 5 minutos
    'search_results': 600, # 10 minutos
}

# Configuración de cache por vista
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300
CACHE_MIDDLEWARE_KEY_PREFIX = 'ecommerce'

# Configuración de cache para API
REST_FRAMEWORK_CACHE = {
    'DEFAULT_CACHE_TIMEOUT': 300,
    'DEFAULT_CACHE_KEY_PREFIX': 'api',
    'DEFAULT_CACHE_ALIAS': 'default',
}
