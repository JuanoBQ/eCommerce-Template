"""
Configuración de Sentry para monitoreo de errores.
"""

import logging
from django.conf import settings

try:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

def init_sentry():
    """
    Inicializar Sentry con configuración optimizada para Django.
    """
    if not SENTRY_AVAILABLE:
        return
    
    sentry_dsn = getattr(settings, 'SENTRY_DSN', None)
    sentry_environment = getattr(settings, 'SENTRY_ENVIRONMENT', 'development')
    
    if not sentry_dsn:
        return
    
    # Configurar integraciones
    integrations = [
        DjangoIntegration(
            transaction_style='url',
            middleware_spans=True,
            signals_spans=True,
            cache_spans=True,
        ),
        RedisIntegration(),
        CeleryIntegration(),
        LoggingIntegration(
            level=logging.INFO,        # Capturar info y superiores
            event_level=logging.ERROR  # Solo enviar errores como eventos
        ),
    ]
    
    # Configurar Sentry
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=sentry_environment,
        integrations=integrations,
        
        # Configuración de performance
        traces_sample_rate=0.1 if sentry_environment == 'production' else 1.0,
        profiles_sample_rate=0.1 if sentry_environment == 'production' else 1.0,
        
        # Configuración de errores
        send_default_pii=False,  # No enviar información personal
        attach_stacktrace=True,
        
        # Filtros de errores
        before_send=filter_sensitive_data,
        
        # Configuración de release
        release=getattr(settings, 'SENTRY_RELEASE', None),
        
        # Configuración de debugging
        debug=sentry_environment == 'development',
    )
    
    # Configurar contexto adicional
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("component", "backend")
        scope.set_tag("framework", "django")
        scope.set_tag("version", getattr(settings, 'VERSION', 'unknown'))


def filter_sensitive_data(event, hint):
    """
    Filtrar datos sensibles antes de enviar a Sentry.
    """
    # Lista de campos sensibles a filtrar
    sensitive_fields = [
        'password', 'token', 'secret', 'key', 'authorization',
        'credit_card', 'cvv', 'ssn', 'social_security',
        'wompi_private_key', 'mercadopago_access_token',
        'jwt_secret_key', 'secret_key'
    ]
    
    # Filtrar en el contexto
    if 'contexts' in event:
        for context_name, context_data in event['contexts'].items():
            if isinstance(context_data, dict):
                for field in sensitive_fields:
                    if field in context_data:
                        context_data[field] = '[FILTERED]'
    
    # Filtrar en extra
    if 'extra' in event:
        for field in sensitive_fields:
            if field in event['extra']:
                event['extra'][field] = '[FILTERED]'
    
    # Filtrar en tags
    if 'tags' in event:
        for field in sensitive_fields:
            if field in event['tags']:
                event['tags'][field] = '[FILTERED]'
    
    return event


def capture_exception(exception, **kwargs):
    """
    Capturar excepción con contexto adicional.
    """
    with sentry_sdk.push_scope() as scope:
        # Agregar contexto de la request si está disponible
        if 'request' in kwargs:
            request = kwargs['request']
            scope.set_context("request", {
                "url": request.build_absolute_uri(),
                "method": request.method,
                "headers": dict(request.headers),
                "user_agent": request.META.get('HTTP_USER_AGENT'),
            })
            
            # Agregar información del usuario si está autenticado
            if hasattr(request, 'user') and request.user.is_authenticated:
                scope.set_user({
                    "id": request.user.id,
                    "email": request.user.email,
                    "username": request.user.username,
                })
        
        # Agregar contexto adicional
        for key, value in kwargs.items():
            if key != 'request':
                scope.set_extra(key, value)
        
        sentry_sdk.capture_exception(exception)


def capture_message(message, level='info', **kwargs):
    """
    Capturar mensaje con contexto adicional.
    """
    with sentry_sdk.push_scope() as scope:
        # Agregar contexto adicional
        for key, value in kwargs.items():
            scope.set_extra(key, value)
        
        sentry_sdk.capture_message(message, level=level)


# Configuración de logging para Sentry
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
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
            'formatter': 'verbose',
        },
        'sentry': {
            'class': 'sentry_sdk.integrations.logging.SentryHandler',
            'level': 'ERROR',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file', 'sentry'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'sentry'],
            'level': 'INFO',
            'propagate': False,
        },
        'ecommerce': {
            'handlers': ['console', 'file', 'sentry'],
            'level': 'INFO',
            'propagate': False,
        },
        'sentry_sdk': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
