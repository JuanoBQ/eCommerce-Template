"""
Configuración de desarrollo para Django.
"""

from .base import *
from decouple import config
from .sentry import init_sentry

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Database para desarrollo (SQLite temporalmente)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuración PostgreSQL (comentada temporalmente)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME', default='ecommerce_dev'),
#         'USER': config('DB_USER', default='ecommerce_user'),
#         'PASSWORD': config('DB_PASSWORD', default='ecommerce_password'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#         'OPTIONS': {
#             'client_encoding': 'UTF8',
#         },
#         'CONN_MAX_AGE': 60,
#         'CONN_HEALTH_CHECKS': True,
#     }
# }

# Cache Configuration para desarrollo
# Try to use Redis if available, fallback to local memory cache
try:
    import django_redis
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'retry_on_timeout': True,
                }
            }
        }
    }
    # Celery con Redis
    CELERY_BROKER_URL = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
    CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://127.0.0.1:6379/0')
except ImportError:
    # Fallback to local memory cache if django-redis is not available
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
        }
    }
    # Fallback to database if Redis is not available
    CELERY_BROKER_URL = 'django://'
    CELERY_RESULT_BACKEND = 'django-db'

# Logging Configuration para desarrollo
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024*1024*5,  # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'ecommerce': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Email backend para desarrollo
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS más permisivo para desarrollo
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Static files configuración para desarrollo
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Configuración de medios para desarrollo
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Apps adicionales para desarrollo (opcionales)
try:
    import django_extensions
    INSTALLED_APPS += ['django_extensions']
except ImportError:
    pass

# Django Debug Toolbar (opcional)
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
except ImportError:
    pass

# Configuración de Sentry
SENTRY_DSN = config('SENTRY_DSN', default='')
SENTRY_ENVIRONMENT = config('SENTRY_ENVIRONMENT', default='development')
SENTRY_RELEASE = config('SENTRY_RELEASE', default=None)

# Inicializar Sentry si está configurado
if SENTRY_DSN:
    try:
        init_sentry()
    except Exception as e:
        print(f"Warning: Could not initialize Sentry: {e}")
