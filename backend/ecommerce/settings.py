"""
Configuración de Django - Redirección a settings por ambiente.

Este archivo mantiene compatibilidad mientras se migra a la nueva estructura.
Se recomienda usar DJANGO_ENVIRONMENT para seleccionar el ambiente.
"""

# Importar configuración basada en ambiente
from .settings import *

import warnings

warnings.warn(
    "settings.py será deprecado. Usar DJANGO_ENVIRONMENT=production|development",
    DeprecationWarning,
    stacklevel=2
)