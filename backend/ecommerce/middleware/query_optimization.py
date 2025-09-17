"""
Middleware para monitorear y optimizar queries N+1.
"""

import logging
from django.db import connection
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('django.db.backends')


class QueryOptimizationMiddleware(MiddlewareMixin):
    """
    Middleware para monitorear queries N+1 y optimizar performance.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.query_threshold = getattr(settings, 'QUERY_THRESHOLD', 10)
        self.slow_query_threshold = getattr(settings, 'SLOW_QUERY_THRESHOLD', 0.1)
    
    def process_request(self, request):
        """Inicializar monitoreo de queries."""
        if settings.DEBUG:
            connection.queries_log.clear()
        return None
    
    def process_response(self, request, response):
        """Analizar queries ejecutadas."""
        if not settings.DEBUG:
            return response
        
        # Solo monitorear requests a la API
        if not request.path.startswith('/api/'):
            return response
        
        queries = connection.queries
        query_count = len(queries)
        
        # Log de queries excesivas
        if query_count > self.query_threshold:
            logger.warning(
                f"High query count detected: {query_count} queries for {request.path}",
                extra={
                    'query_count': query_count,
                    'path': request.path,
                    'method': request.method,
                    'user': getattr(request.user, 'id', None),
                }
            )
        
        # Log de queries lentas
        slow_queries = [
            q for q in queries 
            if float(q['time']) > self.slow_query_threshold
        ]
        
        if slow_queries:
            logger.warning(
                f"Slow queries detected: {len(slow_queries)} queries > {self.slow_query_threshold}s",
                extra={
                    'slow_queries': slow_queries,
                    'path': request.path,
                    'method': request.method,
                    'user': getattr(request.user, 'id', None),
                }
            )
        
        # Detectar posibles queries N+1
        self._detect_n_plus_one_queries(queries, request)
        
        return response
    
    def _detect_n_plus_one_queries(self, queries, request):
        """
        Detectar posibles queries N+1 basándose en patrones comunes.
        """
        # Patrones comunes de queries N+1
        n_plus_one_patterns = [
            'SELECT * FROM "users_user" WHERE "users_user"."id" = %s',
            'SELECT * FROM "products_category" WHERE "products_category"."id" = %s',
            'SELECT * FROM "products_brand" WHERE "products_brand"."id" = %s',
            'SELECT * FROM "products_productimage" WHERE "products_productimage"."product_id" = %s',
            'SELECT * FROM "products_productvariant" WHERE "products_productvariant"."product_id" = %s',
            'SELECT * FROM "products_productreview" WHERE "products_productreview"."product_id" = %s',
            'SELECT * FROM "orders_orderitem" WHERE "orders_orderitem"."order_id" = %s',
            'SELECT * FROM "payments_payment" WHERE "payments_payment"."order_id" = %s',
        ]
        
        # Contar queries por patrón
        pattern_counts = {}
        for query in queries:
            sql = query['sql']
            for pattern in n_plus_one_patterns:
                if pattern in sql:
                    pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
        
        # Detectar patrones sospechosos (más de 5 queries del mismo tipo)
        suspicious_patterns = {
            pattern: count for pattern, count in pattern_counts.items()
            if count > 5
        }
        
        if suspicious_patterns:
            logger.warning(
                f"Possible N+1 queries detected: {suspicious_patterns}",
                extra={
                    'suspicious_patterns': suspicious_patterns,
                    'path': request.path,
                    'method': request.method,
                    'user': getattr(request.user, 'id', None),
                    'total_queries': len(queries),
                }
            )


class DatabaseQueryLogger:
    """
    Logger personalizado para queries de base de datos.
    """
    
    def __init__(self):
        self.logger = logging.getLogger('django.db.backends')
    
    def log_query(self, query, duration):
        """Log de query individual."""
        if duration > 0.1:  # Solo log queries lentas
            self.logger.warning(
                f"Slow query: {duration:.3f}s - {query['sql'][:100]}...",
                extra={
                    'duration': duration,
                    'sql': query['sql'],
                    'params': query['params'],
                }
            )


class QueryOptimizationMixin:
    """
    Mixin para optimizar queries en ViewSets.
    """
    
    def get_optimized_queryset(self, queryset):
        """
        Aplicar optimizaciones comunes al queryset.
        """
        # Aplicar select_related para relaciones ForeignKey
        select_related_fields = self.get_select_related_fields()
        if select_related_fields:
            queryset = queryset.select_related(*select_related_fields)
        
        # Aplicar prefetch_related para relaciones ManyToMany y reverse ForeignKey
        prefetch_related_fields = self.get_prefetch_related_fields()
        if prefetch_related_fields:
            queryset = queryset.prefetch_related(*prefetch_related_fields)
        
        return queryset
    
    def get_select_related_fields(self):
        """
        Retornar campos para select_related.
        Debe ser implementado por las subclases.
        """
        return []
    
    def get_prefetch_related_fields(self):
        """
        Retornar campos para prefetch_related.
        Debe ser implementado por las subclases.
        """
        return []


class ProductQueryOptimizationMixin(QueryOptimizationMixin):
    """
    Mixin específico para optimización de queries de productos.
    """
    
    def get_select_related_fields(self):
        return ['category', 'brand']
    
    def get_prefetch_related_fields(self):
        return [
            'images',
            'variants__size',
            'variants__color',
            'reviews__user',
        ]


class OrderQueryOptimizationMixin(QueryOptimizationMixin):
    """
    Mixin específico para optimización de queries de órdenes.
    """
    
    def get_select_related_fields(self):
        return ['user', 'user__profile']
    
    def get_prefetch_related_fields(self):
        return [
            'items__product__category',
            'items__product__brand',
            'items__product__images',
            'payments',
        ]


class PaymentQueryOptimizationMixin(QueryOptimizationMixin):
    """
    Mixin específico para optimización de queries de pagos.
    """
    
    def get_select_related_fields(self):
        return ['user', 'order', 'order__user']
    
    def get_prefetch_related_fields(self):
        return [
            'order__items__product__category',
            'order__items__product__brand',
            'refunds',
        ]
