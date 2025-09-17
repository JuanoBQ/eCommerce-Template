"""
Configuración de testing para Django.
Optimizada para ejecutar tests rápidos y aislados.
"""

from .base import *
from decouple import config

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Base de datos en memoria para tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
        'OPTIONS': {
            'timeout': 20,
        }
    }
}

# Configuración de cache para tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Configuración de sesiones para tests
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Configuración de email para tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Configuración de archivos estáticos para tests
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Configuración de archivos media para tests
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
MEDIA_ROOT = '/tmp/test_media'

# Configuración de logging para tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'ecommerce': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Configuración de CORS para tests
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Configuración de JWT para tests
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=10),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': 'test-secret-key',
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(minutes=10),
}

# Configuración de pagos para tests
WOMPI_PUBLIC_KEY = 'test_public_key'
WOMPI_PRIVATE_KEY = 'test_private_key'
WOMPI_WEBHOOK_SECRET = 'test_webhook_secret'
WOMPI_ENVIRONMENT = 'sandbox'
WOMPI_INTEGRITY_KEY = 'test_integrity_key'

MERCADOPAGO_PUBLIC_KEY = 'TEST_public_key'
MERCADOPAGO_ACCESS_TOKEN = 'TEST_access_token'
MERCADOPAGO_WEBHOOK_SECRET = 'test_webhook_secret'
MERCADOPAGO_ENVIRONMENT = 'sandbox'

# Configuración de Celery para tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = 'memory://'
CELERY_RESULT_BACKEND = 'cache+memory://'

# Configuración de Sentry para tests (deshabilitado)
SENTRY_DSN = ''

# Configuración de archivos para tests
FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1MB

# Configuración de timeouts para tests
CONN_MAX_AGE = 0

# Configuración de middleware para tests
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'ecommerce.middleware.JWTAuthenticationMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuración de apps para tests
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'ecommerce.apps.products',
    'ecommerce.apps.categories',
    'ecommerce.apps.users',
    'ecommerce.apps.cart',
    'ecommerce.apps.orders',
    'ecommerce.apps.payments',
    'ecommerce.apps.inventory',
    'ecommerce.apps.reports',
    'ecommerce.apps.system_config',
]

# Configuración de URLs para tests
ROOT_URLCONF = 'ecommerce.urls'

# Configuración de templates para tests
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Configuración de WSGI para tests
WSGI_APPLICATION = 'ecommerce.wsgi.application'

# Configuración de validación de contraseñas para tests
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 6,
        }
    },
]

# Configuración de internacionalización para tests
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

# Configuración de archivos estáticos para tests
STATIC_URL = '/static/'
STATIC_ROOT = '/tmp/test_static'

# Configuración de archivos media para tests
MEDIA_URL = '/media/'
MEDIA_ROOT = '/tmp/test_media'

# Configuración de clave primaria para tests
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración de REST Framework para tests
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
}

# Configuración de dj-rest-auth para tests
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'access',
    'JWT_AUTH_REFRESH_COOKIE': 'refresh',
    'JWT_AUTH_HTTPONLY': False,
    'JWT_AUTH_SECURE': False,
    'JWT_AUTH_SAMESITE': 'Lax',
    'USER_DETAILS_SERIALIZER': 'ecommerce.apps.users.serializers.UserSerializer',
    'REGISTER_SERIALIZER': 'ecommerce.apps.users.serializers.CustomRegisterSerializer',
    'REGISTER_PERMISSION_CLASSES': ('rest_framework.permissions.AllowAny',),
}

# Configuración de sites para tests
SITE_ID = 1

# Configuración de secret key para tests
SECRET_KEY = 'test-secret-key-for-testing-only'

# Configuración de hosts permitidos para tests
ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']

# Configuración de URLs para tests
FRONTEND_URL = 'http://localhost:3000'
BACKEND_URL = 'http://localhost:8000'
