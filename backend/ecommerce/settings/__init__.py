"""
Configuración de Django por ambientes.
"""
import os

# Determinar el ambiente basado en la variable de entorno
environment = os.environ.get('DJANGO_ENVIRONMENT', 'development')

if environment == 'production':
    from .production import *
elif environment == 'staging':
    try:
        from .staging import *
    except ImportError:
        from .development import *
else:
    from .development import *
