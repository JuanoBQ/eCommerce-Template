"""
Configuración de Django para producción.
"""

from .base import *
from .sentry import init_sentry
import os
import logging

# ===========================================
# CONFIGURACIÓN BÁSICA
# ===========================================

DEBUG = False
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')

# ===========================================
# BASE DE DATOS
# ===========================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='ecommerce_prod'),
        'USER': config('DB_USER', default='ecommerce_user'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        },
        'CONN_MAX_AGE': config('DB_CONN_MAX_AGE', default=60, cast=int),
        'CONN_HEALTH_CHECKS': config('DB_CONN_HEALTH_CHECKS', default=True, cast=bool),
    }
}

# ===========================================
# CACHE CONFIGURATION
# ===========================================

# Usar configuración de cache con fallback automático
from .cache import CACHES, CACHE_TIMEOUTS, CACHE_MIDDLEWARE_ALIAS, CACHE_MIDDLEWARE_SECONDS, CACHE_MIDDLEWARE_KEY_PREFIX

# ===========================================
# SEGURIDAD
# ===========================================

# HTTPS Settings
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=True, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=True, cast=bool)
SECURE_CONTENT_TYPE_NOSNIFF = config('SECURE_CONTENT_TYPE_NOSNIFF', default=True, cast=bool)
SECURE_BROWSER_XSS_FILTER = config('SECURE_BROWSER_XSS_FILTER', default=True, cast=bool)
X_FRAME_OPTIONS = config('X_FRAME_OPTIONS', default='DENY')

# Session Security
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
SESSION_COOKIE_HTTPONLY = config('SESSION_COOKIE_HTTPONLY', default=True, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
CSRF_COOKIE_HTTPONLY = config('CSRF_COOKIE_HTTPONLY', default=True, cast=bool)

# ===========================================
# CORS CONFIGURATION
# ===========================================

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='').split(',') if config('CORS_ALLOWED_ORIGINS', default='') else []
CORS_ALLOW_CREDENTIALS = config('CORS_ALLOW_CREDENTIALS', default=True, cast=bool)

# ===========================================
# EMAIL CONFIGURATION
# ===========================================

EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@yourdomain.com')

# ===========================================
# LOGGING CONFIGURATION
# ===========================================

LOG_LEVEL = config('LOG_LEVEL', default='INFO')
LOG_FILE = config('LOG_FILE', default='/var/log/ecommerce/django.log')

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
        'file': {
            'level': LOG_LEVEL,
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_FILE,
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'level': LOG_LEVEL,
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': LOG_LEVEL,
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
        'ecommerce': {
            'handlers': ['console', 'file'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
    },
}

# ===========================================
# STATIC FILES
# ===========================================

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ===========================================
# CELERY CONFIGURATION
# ===========================================

CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/4')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/5')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Bogota'

# ===========================================
# PERFORMANCE SETTINGS
# ===========================================

# Cache Performance
CACHE_MIDDLEWARE_SECONDS = config('CACHE_MIDDLEWARE_SECONDS', default=300, cast=int)
CACHE_MIDDLEWARE_KEY_PREFIX = config('CACHE_MIDDLEWARE_KEY_PREFIX', default='ecommerce')

# Database Performance
CONN_MAX_AGE = config('DB_CONN_MAX_AGE', default=60, cast=int)

# ===========================================
# SENTRY CONFIGURATION
# ===========================================

# Inicializar Sentry si está configurado
if config('SENTRY_DSN', default=''):
    init_sentry(
        dsn=config('SENTRY_DSN'),
        environment=config('SENTRY_ENVIRONMENT', default='production'),
        release=config('SENTRY_RELEASE', default='1.0.0'),
    )

# ===========================================
# MIDDLEWARE ADICIONAL PARA PRODUCCIÓN
# ===========================================

MIDDLEWARE = MIDDLEWARE + [
    'ecommerce.middleware.cache_middleware.SmartCacheMiddleware',
    'ecommerce.middleware.cache_middleware.CacheStatsMiddleware',
]

# ===========================================
# CONFIGURACIÓN DE SESIONES
# ===========================================

# Habilitar cache de sesiones en producción
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'

# ===========================================
# CONFIGURACIÓN DE BACKUP
# ===========================================

BACKUP_ENABLED = config('BACKUP_ENABLED', default=True, cast=bool)
BACKUP_SCHEDULE = config('BACKUP_SCHEDULE', default='0 2 * * *')  # Daily at 2 AM
BACKUP_RETENTION_DAYS = config('BACKUP_RETENTION_DAYS', default=30, cast=int)

# ===========================================
# CONFIGURACIÓN DE MONITOREO
# ===========================================

HEALTH_CHECK_ENABLED = config('HEALTH_CHECK_ENABLED', default=True, cast=bool)
HEALTH_CHECK_TIMEOUT = config('HEALTH_CHECK_TIMEOUT', default=30, cast=int)
PERFORMANCE_MONITORING = config('PERFORMANCE_MONITORING', default=True, cast=bool)
SLOW_QUERY_THRESHOLD = config('SLOW_QUERY_THRESHOLD', default=1.0, cast=float)