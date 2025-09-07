"""
Configuración de logging robusta para el proyecto eCommerce
Maneja problemas de permisos en Windows y diferentes entornos
"""

import os
import sys
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler, RotatingFileHandler
import logging

def get_logging_config(debug=False, base_dir=None):
    """
    Retorna configuración de logging optimizada para diferentes entornos
    """
    if base_dir is None:
        base_dir = Path(__file__).parent
    
    # Crear directorio de logs si no existe
    logs_dir = base_dir / 'logs'
    logs_dir.mkdir(exist_ok=True)
    
    # Detectar si estamos en Windows
    is_windows = sys.platform.startswith('win')
    
    # Configuración base
    config = {
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
            'detailed': {
                'format': '{levelname} {asctime} {name} {module} {funcName} {lineno} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'console': {
                'level': 'DEBUG' if debug else 'INFO',
                'class': 'logging.StreamHandler',
                'formatter': 'simple',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': False,
            },
            'ecommerce': {
                'handlers': ['console'],
                'level': 'DEBUG' if debug else 'INFO',
                'propagate': False,
            },
        },
    }
    
    # Agregar handler de archivo solo si es posible
    try:
        if is_windows:
            # En Windows, usar TimedRotatingFileHandler que es más estable
            file_handler = {
                'level': 'INFO',
                'class': 'logging.handlers.TimedRotatingFileHandler',
                'filename': str(logs_dir / 'django.log'),
                'when': 'midnight',
                'interval': 1,
                'backupCount': 7,
                'formatter': 'verbose',
                'encoding': 'utf-8',
            }
        else:
            # En Unix/Linux, usar RotatingFileHandler
            file_handler = {
                'level': 'INFO',
                'class': 'logging.handlers.RotatingFileHandler',
                'filename': str(logs_dir / 'django.log'),
                'maxBytes': 1024*1024*5,  # 5 MB
                'backupCount': 5,
                'formatter': 'verbose',
                'encoding': 'utf-8',
            }
        
        config['handlers']['file'] = file_handler
        
        # Agregar file handler a los loggers
        for logger_name in ['django', 'ecommerce']:
            if 'file' not in config['loggers'][logger_name]['handlers']:
                config['loggers'][logger_name]['handlers'].append('file')
        
        # Agregar file handler al root
        if 'file' not in config['root']['handlers']:
            config['root']['handlers'].append('file')
            
    except (PermissionError, OSError) as e:
        # Si no se puede crear el archivo de log, solo usar console
        print(f"⚠️  No se pudo configurar logging a archivo: {e}")
        print("📝 Usando solo logging a consola")
    
    return config

def setup_logging(debug=False, base_dir=None):
    """
    Configura el logging del proyecto
    """
    import logging.config
    
    config = get_logging_config(debug, base_dir)
    logging.config.dictConfig(config)
    
    # Log inicial
    logger = logging.getLogger('ecommerce')
    logger.info("🚀 Sistema de logging configurado correctamente")
    
    return config
