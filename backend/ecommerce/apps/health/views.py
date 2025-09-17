"""
Health check views para monitoreo del sistema.
"""
import time
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check básico del sistema.
    """
    return JsonResponse({
        'status': 'healthy',
        'timestamp': time.time(),
        'service': 'ecommerce-api',
        'version': '1.0.0'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_detailed(request):
    """
    Health check detallado con verificación de servicios.
    """
    checks = {
        'database': _check_database(),
        'cache': _check_cache(),
        'redis': _check_redis(),
    }
    
    # Determinar el estado general
    all_healthy = all(check['status'] == 'healthy' for check in checks.values())
    overall_status = 'healthy' if all_healthy else 'unhealthy'
    
    response_data = {
        'status': overall_status,
        'timestamp': time.time(),
        'service': 'ecommerce-api',
        'version': '1.0.0',
        'checks': checks
    }
    
    # Usar código de estado HTTP apropiado
    http_status = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JsonResponse(response_data, status=http_status)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_ready(request):
    """
    Health check para readiness probe (Kubernetes).
    Verifica que el servicio esté listo para recibir tráfico.
    """
    checks = {
        'database': _check_database(),
        'cache': _check_cache(),
    }
    
    # Para readiness, solo verificamos servicios críticos
    critical_checks = ['database']
    all_ready = all(checks[check]['status'] == 'healthy' for check in critical_checks)
    
    response_data = {
        'status': 'ready' if all_ready else 'not_ready',
        'timestamp': time.time(),
        'checks': {k: v for k, v in checks.items() if k in critical_checks}
    }
    
    http_status = status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JsonResponse(response_data, status=http_status)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_live(request):
    """
    Health check para liveness probe (Kubernetes).
    Verifica que el servicio esté vivo.
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': time.time(),
        'service': 'ecommerce-api'
    })


def _check_database():
    """Verifica la conexión a la base de datos."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result and result[0] == 1:
                return {
                    'status': 'healthy',
                    'message': 'Database connection successful',
                    'response_time_ms': 0  # Podríamos medir esto si es necesario
                }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'message': f'Database connection failed: {str(e)}',
            'error': str(e)
        }
    
    return {
        'status': 'unhealthy',
        'message': 'Database query failed'
    }


def _check_cache():
    """Verifica la conexión al cache."""
    try:
        # Intentar escribir y leer del cache
        test_key = 'health_check_test'
        test_value = 'test_value'
        
        cache.set(test_key, test_value, timeout=10)
        retrieved_value = cache.get(test_key)
        
        if retrieved_value == test_value:
            cache.delete(test_key)  # Limpiar
            return {
                'status': 'healthy',
                'message': 'Cache connection successful'
            }
        else:
            return {
                'status': 'unhealthy',
                'message': 'Cache read/write test failed'
            }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'message': f'Cache connection failed: {str(e)}',
            'error': str(e)
        }


def _check_redis():
    """Verifica la conexión a Redis específicamente."""
    try:
        import redis
        from django.conf import settings
        
        # Obtener URL de Redis desde la configuración
        redis_url = getattr(settings, 'REDIS_URL', 'redis://127.0.0.1:6379/0')
        
        r = redis.from_url(redis_url)
        r.ping()
        
        return {
            'status': 'healthy',
            'message': 'Redis connection successful'
        }
    except ImportError:
        return {
            'status': 'unhealthy',
            'message': 'Redis client not available'
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'message': f'Redis connection failed: {str(e)}',
            'error': str(e)
        }
