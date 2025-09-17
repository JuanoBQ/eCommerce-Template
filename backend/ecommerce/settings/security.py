"""
Configuración de seguridad para el proyecto eCommerce.
Implementa políticas de seguridad estrictas siguiendo OWASP.
"""

import os
from decouple import config
from .security.key_generator import generate_django_secret_key


# =============================================================================
# CONFIGURACIÓN DE SEGURIDAD CRÍTICA
# =============================================================================

# SECRET_KEY segura
SECRET_KEY = config('SECRET_KEY', default=generate_django_secret_key())

# Configuración de sesiones seguras
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 3600  # 1 hora

# Configuración de CSRF
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS', 
    default='http://localhost:3000,https://localhost:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Headers de seguridad
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Configuración SSL/TLS
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Configuración de contraseñas
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'ecommerce.security.password_validators.ComplexityValidator',
    },
]

# Configuración de autenticación
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'ecommerce.security.backends.OTPSecurityBackend',
]

# Configuración de login
LOGIN_URL = '/admin/login/'
LOGIN_REDIRECT_URL = '/admin/'
LOGOUT_REDIRECT_URL = '/'

# Configuración de rate limiting
RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'ecommerce.security.views.rate_limit_exceeded'

# Configuración de logging de seguridad
SECURITY_LOGGING = {
    'LOGIN_ATTEMPTS': True,
    'FAILED_LOGINS': True,
    'ADMIN_ACCESS': True,
    'SENSITIVE_OPERATIONS': True,
}

# Configuración de Content Security Policy
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = (
    "'self'",
    "'nonce-{nonce}'",
    "https://js.stripe.com",
    "https://sdk.mercadopago.com",
    "https://checkout.wompi.co",
)
CSP_STYLE_SRC = (
    "'self'",
    "'nonce-{nonce}'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
)
CSP_FONT_SRC = (
    "'self'",
    "https://fonts.gstatic.com",
)
CSP_IMG_SRC = (
    "'self'",
    "data:",
    "https:",
    "blob:",
)
CSP_CONNECT_SRC = (
    "'self'",
    "https://api.stripe.com",
    "https://api.mercadopago.com",
    "https://production.wompi.co",
    "https://sandbox.wompi.co",
)
CSP_FRAME_SRC = (
    "'self'",
    "https://js.stripe.com",
    "https://checkout.wompi.co",
    "https://www.mercadopago.com",
)
CSP_OBJECT_SRC = ("'none'",)
CSP_BASE_URI = ("'self'",)
CSP_FORM_ACTION = ("'self'",)
CSP_FRAME_ANCESTORS = ("'none'",)
CSP_UPGRADE_INSECURE_REQUESTS = True

# Configuración de CORS segura
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,https://localhost:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Configuración de archivos estáticos seguros
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# Configuración de email para 2FA
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@ecommerce.com')

# Configuración de SMS para 2FA (Twilio)
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')

# Configuración de JWT segura
JWT_AUTH = {
    'JWT_SECRET_KEY': config('JWT_SECRET_KEY', default=SECRET_KEY),
    'JWT_ALGORITHM': 'HS256',
    'JWT_VERIFY': True,
    'JWT_VERIFY_EXPIRATION': True,
    'JWT_LEEWAY': 0,
    'JWT_EXPIRATION_DELTA': timedelta(hours=1),
    'JWT_ALLOW_REFRESH': True,
    'JWT_REFRESH_EXPIRATION_DELTA': timedelta(days=7),
    'JWT_AUTH_HEADER_PREFIX': 'Bearer',
    'JWT_AUTH_COOKIE': None,
}

# Configuración de base de datos segura
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='ecommerce'),
        'USER': config('DB_USER', default='ecommerce'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',
            'client_encoding': 'UTF8',
        },
        'CONN_MAX_AGE': 60,
        'CONN_HEALTH_CHECKS': True,
    }
}

# Configuración de caché segura
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
        },
        'KEY_PREFIX': 'ecommerce_secure',
        'TIMEOUT': 300,
        'VERSION': 1,
    }
}

# Configuración de logging de seguridad
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'security': {
            'format': '[{asctime}] SECURITY {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': 'logs/security.log',
            'formatter': 'security',
        },
        'security_console': {
            'level': 'WARNING',
            'class': 'logging.StreamHandler',
            'formatter': 'security',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['security_file', 'security_console'],
            'level': 'WARNING',
            'propagate': True,
        },
        'ecommerce.security': {
            'handlers': ['security_file', 'security_console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
