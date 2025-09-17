"""
Utilidades para optimización de consultas N+1 y cache de consultas.
"""

from django.core.cache import cache
from django.db import models
from django.db.models import Prefetch, Q
from functools import wraps
import time
import logging

logger = logging.getLogger(__name__)


class QueryOptimizer:
    """
    Clase para optimizar consultas y evitar problemas N+1.
    """
    
    @staticmethod
    def optimize_product_queryset(queryset):
        """
        Optimiza queryset de productos para evitar N+1.
        """
        return queryset.select_related(
            'category',
            'brand',
            'vendor'
        ).prefetch_related(
            'images',
            'variants__size',
            'variants__color',
            'reviews__user',
            'reviews__product',
            'tags'
        )
    
    @staticmethod
    def optimize_order_queryset(queryset):
        """
        Optimiza queryset de órdenes para evitar N+1.
        """
        return queryset.select_related(
            'user',
            'shipping_address',
            'billing_address'
        ).prefetch_related(
            'items__product__category',
            'items__product__brand',
            'items__product__images',
            'payments',
            'refunds'
        )
    
    @staticmethod
    def optimize_category_queryset(queryset):
        """
        Optimiza queryset de categorías para evitar N+1.
        """
        return queryset.prefetch_related(
            'children',
            'parent',
            'products__images'
        )
    
    @staticmethod
    def optimize_user_queryset(queryset):
        """
        Optimiza queryset de usuarios para evitar N+1.
        """
        return queryset.select_related(
            'profile'
        ).prefetch_related(
            'orders__items__product',
            'addresses'
        )


def cache_queryset_result(timeout=300, key_prefix='', cache_alias='default'):
    """
    Decorador para cachear resultados de querysets.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de cache
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Intentar obtener del cache
            cached_result = cache.get(cache_key, cache_alias)
            if cached_result is not None:
                logger.debug(f"Cache HIT para {cache_key}")
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            
            # Solo cachear si es un queryset o lista
            if hasattr(result, 'count') or isinstance(result, list):
                cache.set(cache_key, result, timeout, cache_alias)
                logger.debug(f"Cache SET para {cache_key}")
            
            return result
        return wrapper
    return decorator


def prefetch_related_cache(relation_name, timeout=3600, cache_alias='default'):
    """
    Decorador para cachear prefetch_related results.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de cache para la relación
            cache_key = f"prefetch:{relation_name}:{func.__name__}"
            
            # Intentar obtener del cache
            cached_relations = cache.get(cache_key, cache_alias)
            if cached_relations is not None:
                logger.debug(f"Prefetch cache HIT para {cache_key}")
                # Aplicar las relaciones cacheadas
                queryset = func(*args, **kwargs)
                for relation in cached_relations:
                    queryset = queryset.prefetch_related(relation)
                return queryset
            
            # Ejecutar función normal
            result = func(*args, **kwargs)
            
            # Cachear las relaciones encontradas
            if hasattr(result, '_prefetch_related_lookups'):
                cache.set(cache_key, result._prefetch_related_lookups, timeout, cache_alias)
                logger.debug(f"Prefetch cache SET para {cache_key}")
            
            return result
        return wrapper
    return decorator


class QueryCacheManager:
    """
    Gestor de cache para consultas complejas.
    """
    
    def __init__(self, cache_alias='default'):
        self.cache_alias = cache_alias
    
    def get_or_create_queryset(self, key, queryset_func, timeout=300):
        """
        Obtiene un queryset del cache o lo crea si no existe.
        """
        cached_queryset = cache.get(key, self.cache_alias)
        if cached_queryset is not None:
            return cached_queryset
        
        queryset = queryset_func()
        cache.set(key, queryset, timeout, self.cache_alias)
        return queryset
    
    def invalidate_pattern(self, pattern):
        """
        Invalida cache basado en patrón.
        """
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern, self.cache_alias)
        else:
            cache.clear(self.cache_alias)
    
    def warm_up_queries(self, queries_config):
        """
        Pre-calienta cache con consultas frecuentes.
        """
        for key, queryset_func, timeout in queries_config:
            self.get_or_create_queryset(key, queryset_func, timeout)


def measure_query_performance(func):
    """
    Decorador para medir performance de consultas.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        logger.info(f"Query {func.__name__} ejecutada en {execution_time:.4f} segundos")
        
        # Log si la consulta es lenta
        if execution_time > 1.0:  # Más de 1 segundo
            logger.warning(f"Query lenta detectada: {func.__name__} ({execution_time:.4f}s)")
        
        return result
    return wrapper


class NPlusOneDetector:
    """
    Detector de consultas N+1.
    """
    
    def __init__(self):
        self.query_count = 0
        self.queries = []
    
    def start_monitoring(self):
        """Inicia el monitoreo de consultas."""
        from django.db import connection
        connection.queries_log.clear()
        self.query_count = 0
        self.queries = []
    
    def stop_monitoring(self):
        """Detiene el monitoreo y analiza las consultas."""
        from django.db import connection
        self.queries = connection.queries
        self.query_count = len(self.queries)
        
        # Analizar patrones N+1
        self._analyze_n_plus_one()
        
        return {
            'total_queries': self.query_count,
            'queries': self.queries,
            'n_plus_one_detected': self._has_n_plus_one()
        }
    
    def _analyze_n_plus_one(self):
        """Analiza si hay patrones N+1 en las consultas."""
        # Implementar lógica de detección de N+1
        pass
    
    def _has_n_plus_one(self):
        """Determina si se detectaron consultas N+1."""
        # Implementar lógica de detección
        return self.query_count > 10  # Threshold simple
