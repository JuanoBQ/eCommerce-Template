"""
Configuración de producción para Django.
Optimizada para deployment en Hostinger.
"""

from .base import *
from decouple import config
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

# Hosts permitidos en producción
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS', 
    default='yourdomain.com,www.yourdomain.com'
).split(',')

# Agregar WhiteNoise para servir archivos estáticos en producción
MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Base de datos para producción - MySQL (recomendado para Hostinger)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}

# Configuración de seguridad para producción
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS settings (configurar cuando tengas SSL)
if config('USE_SSL', default=False, cast=bool):
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Cache ligero para Hostinger (file-based)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': config('CACHE_LOCATION', default='/tmp/django_cache'),
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
            'CULL_FREQUENCY': 3,
        }
    }
}

# Celery simplificado para producción
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='django://')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='django-db')
CELERY_TASK_ALWAYS_EAGER = config('CELERY_TASK_ALWAYS_EAGER', default=False, cast=bool)

# Logging para producción
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {name} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': config('LOG_FILE', default='/tmp/django_production.log'),
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler', 
            'filename': config('ERROR_LOG_FILE', default='/tmp/django_errors.log'),
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'ecommerce': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Email configuration para producción
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)

# Static files para producción
STATIC_URL = '/static/'
STATIC_ROOT = config('STATIC_ROOT', default='/path/to/staticfiles/')

# Media files para producción en Hostinger
MEDIA_URL = '/media/'
MEDIA_ROOT = config('MEDIA_ROOT', default='/path/to/media/')

# Configuración de archivos estáticos con WhiteNoise
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# CORS restrictivo para producción
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')
CORS_ALLOW_CREDENTIALS = True

# Configuración JWT más estricta para producción
REST_AUTH['JWT_AUTH_SECURE'] = True
REST_AUTH['JWT_AUTH_HTTPONLY'] = True

# Session configuration para producción
SESSION_COOKIE_AGE = 86400  # 24 horas
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# Configuración de upload de archivos optimizada para Hostinger
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644

# Configuración específica para pagos en producción
WOMPI_ENVIRONMENT = config('WOMPI_ENVIRONMENT', default='production')
MERCADOPAGO_ENVIRONMENT = config('MERCADOPAGO_ENVIRONMENT', default='production')

# Compresión de archivos estáticos
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Optimizaciones de base de datos
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración específica de Hostinger
# Ajustar según las limitaciones de tu plan
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

# Timeout configurations
CONN_MAX_AGE = 60

# Database connection pooling (si está disponible)
if config('DB_POOL', default=False, cast=bool):
    DATABASES['default']['CONN_MAX_AGE'] = 60
    DATABASES['default']['OPTIONS']['MAX_CONNS'] = 20
