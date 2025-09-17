"""
Middleware de cache inteligente para el proyecto eCommerce.
"""

import time
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from django.conf import settings
from django.http import HttpResponse
import json


class SmartCacheMiddleware(MiddlewareMixin):
    """
    Middleware que implementa cache inteligente basado en:
    - Tipo de endpoint
    - Usuario autenticado
    - Parámetros de consulta
    - Headers de la request
    """
    
    # Configuración de cache por endpoint
    CACHE_CONFIG = {
        '/api/products/': {
            'timeout': 3600,  # 1 hora
            'key_prefix': 'products',
            'cache_alias': 'products',
            'vary_headers': ['Accept-Language', 'Authorization'],
            'vary_params': ['page', 'page_size', 'category', 'search']
        },
        '/api/categories/': {
            'timeout': 7200,  # 2 horas
            'key_prefix': 'categories',
            'cache_alias': 'products',
            'vary_headers': ['Accept-Language'],
            'vary_params': ['parent']
        },
        '/api/orders/stats/': {
            'timeout': 300,  # 5 minutos
            'key_prefix': 'order_stats',
            'cache_alias': 'default',
            'vary_headers': ['Authorization'],
            'vary_params': ['period', 'start_date', 'end_date']
        },
        '/api/payments/': {
            'timeout': 900,  # 15 minutos
            'key_prefix': 'payments',
            'cache_alias': 'payments',
            'vary_headers': ['Authorization'],
            'vary_params': ['status', 'method']
        }
    }
    
    def process_request(self, request):
        """
        Procesa la request para determinar si debe usar cache.
        """
        # Solo cachear requests GET
        if request.method != 'GET':
            return None
        
        # Obtener configuración de cache para el endpoint
        cache_config = self._get_cache_config(request.path)
        if not cache_config:
            return None
        
        # Generar clave de cache
        cache_key = self._generate_cache_key(request, cache_config)
        
        # Intentar obtener del cache
        cached_response = cache.get(cache_key, cache_config['cache_alias'])
        if cached_response:
            # Crear respuesta desde cache
            response = HttpResponse(
                cached_response['content'],
                content_type=cached_response['content_type'],
                status=cached_response['status_code']
            )
            
            # Restaurar headers
            for header, value in cached_response['headers'].items():
                response[header] = value
            
            # Agregar header de cache
            response['X-Cache'] = 'HIT'
            response['X-Cache-Key'] = cache_key
            
            return response
        
        # Marcar para cachear en process_response
        request._cache_config = cache_config
        request._cache_key = cache_key
        
        return None
    
    def process_response(self, request, response):
        """
        Procesa la respuesta para cachearla si es necesario.
        """
        # Solo cachear si se configuró en process_request
        if not hasattr(request, '_cache_config'):
            return response
        
        cache_config = request._cache_config
        cache_key = request._cache_key
        
        # Solo cachear respuestas exitosas
        if response.status_code == 200:
            # Preparar datos para cache
            cache_data = {
                'content': response.content,
                'content_type': response.get('Content-Type', ''),
                'status_code': response.status_code,
                'headers': dict(response.items())
            }
            
            # Guardar en cache
            cache.set(
                cache_key,
                cache_data,
                cache_config['timeout'],
                cache_config['cache_alias']
            )
            
            # Agregar header de cache
            response['X-Cache'] = 'MISS'
            response['X-Cache-Key'] = cache_key
        
        return response
    
    def _get_cache_config(self, path):
        """
        Obtiene la configuración de cache para un path específico.
        """
        for pattern, config in self.CACHE_CONFIG.items():
            if path.startswith(pattern):
                return config
        return None
    
    def _generate_cache_key(self, request, cache_config):
        """
        Genera una clave única para el cache.
        """
        key_parts = [cache_config['key_prefix']]
        
        # Agregar path
        key_parts.append(request.path)
        
        # Agregar parámetros de consulta relevantes
        vary_params = cache_config.get('vary_params', [])
        for param in vary_params:
            if param in request.GET:
                key_parts.append(f"{param}:{request.GET[param]}")
        
        # Agregar headers relevantes
        vary_headers = cache_config.get('vary_headers', [])
        for header in vary_headers:
            if header in request.META:
                key_parts.append(f"{header}:{request.META[header]}")
        
        # Agregar usuario si está autenticado
        if hasattr(request, 'user') and request.user.is_authenticated:
            key_parts.append(f"user:{request.user.id}")
        
        return ':'.join(key_parts)


class CacheStatsMiddleware(MiddlewareMixin):
    """
    Middleware para recopilar estadísticas de cache.
    """
    
    def process_response(self, request, response):
        """
        Procesa la respuesta para recopilar estadísticas.
        """
        # Solo para requests de API
        if not request.path.startswith('/api/'):
            return response
        
        # Recopilar estadísticas básicas
        stats = {
            'path': request.path,
            'method': request.method,
            'status_code': response.status_code,
            'cache_status': response.get('X-Cache', 'NONE'),
            'timestamp': time.time()
        }
        
        # Guardar estadísticas en cache (últimas 1000 requests)
        cache_key = f"cache_stats:{int(time.time() // 60)}"  # Por minuto
        existing_stats = cache.get(cache_key, [])
        existing_stats.append(stats)
        
        # Mantener solo las últimas 1000 entradas
        if len(existing_stats) > 1000:
            existing_stats = existing_stats[-1000:]
        
        cache.set(cache_key, existing_stats, 3600)  # 1 hora
        
        return response
