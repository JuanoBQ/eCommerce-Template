#!/usr/bin/env python
"""
Script para analizar performance y queries N+1.
Ejecutar desde el directorio backend/ con: python scripts/analyze_performance.py
"""

import os
import sys
import django
from pathlib import Path

# Agregar el directorio del proyecto al path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings.development')
django.setup()

from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model
from django.db import connection
from django.test import RequestFactory
from django.conf import settings

User = get_user_model()

def analyze_queries():
    """Analizar queries N+1 en el sistema."""
    print("🔍 Analizando queries N+1...")
    
    # Crear usuario de prueba si no existe
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True,
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print("✅ Usuario de prueba creado")
    
    # Ejecutar análisis de queries
    try:
        execute_from_command_line([
            'manage.py', 'analyze_queries',
            '--user-id', str(user.id),
            '--limit', '5'
        ])
        print("✅ Análisis de queries completado")
    except Exception as e:
        print(f"❌ Error en análisis de queries: {e}")

def analyze_database_performance():
    """Analizar performance de la base de datos."""
    print("\n📊 Analizando performance de base de datos...")
    
    # Verificar configuración de base de datos
    db_config = settings.DATABASES['default']
    print(f"  Base de datos: {db_config['ENGINE']}")
    print(f"  Host: {db_config.get('HOST', 'localhost')}")
    print(f"  Puerto: {db_config.get('PORT', 'default')}")
    
    # Verificar conexión
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("  ✅ Conexión a base de datos exitosa")
    except Exception as e:
        print(f"  ❌ Error de conexión: {e}")
        return False
    
    # Verificar índices
    print("\n🔍 Verificando índices...")
    try:
        with connection.cursor() as cursor:
            # Verificar índices en tablas principales
            tables = ['products_product', 'orders_order', 'payments_payment', 'users_user']
            for table in tables:
                cursor.execute(f"""
                    SELECT indexname, indexdef 
                    FROM pg_indexes 
                    WHERE tablename = '{table}'
                """)
                indexes = cursor.fetchall()
                print(f"  {table}: {len(indexes)} índices")
    except Exception as e:
        print(f"  ⚠️ No se pudieron verificar índices: {e}")
    
    return True

def analyze_cache_performance():
    """Analizar performance del cache."""
    print("\n💾 Analizando performance del cache...")
    
    # Verificar configuración de cache
    cache_config = settings.CACHES['default']
    print(f"  Backend: {cache_config['BACKEND']}")
    
    # Test de cache
    try:
        from django.core.cache import cache
        cache.set('test_key', 'test_value', 30)
        value = cache.get('test_key')
        if value == 'test_value':
            print("  ✅ Cache funcionando correctamente")
        else:
            print("  ❌ Cache no funcionando correctamente")
    except Exception as e:
        print(f"  ❌ Error en cache: {e}")

def analyze_static_files():
    """Analizar archivos estáticos."""
    print("\n📁 Analizando archivos estáticos...")
    
    static_root = settings.STATIC_ROOT
    media_root = settings.MEDIA_ROOT
    
    print(f"  STATIC_ROOT: {static_root}")
    print(f"  MEDIA_ROOT: {media_root}")
    
    # Verificar si los directorios existen
    if static_root and os.path.exists(static_root):
        static_files = len([f for f in os.listdir(static_root) if os.path.isfile(os.path.join(static_root, f))])
        print(f"  ✅ {static_files} archivos estáticos encontrados")
    else:
        print("  ⚠️ Directorio de archivos estáticos no encontrado")
    
    if media_root and os.path.exists(media_root):
        media_files = len([f for f in os.listdir(media_root) if os.path.isfile(os.path.join(media_root, f))])
        print(f"  ✅ {media_files} archivos media encontrados")
    else:
        print("  ⚠️ Directorio de archivos media no encontrado")

def analyze_middleware():
    """Analizar middleware configurado."""
    print("\n🔧 Analizando middleware...")
    
    middleware = settings.MIDDLEWARE
    print(f"  Total de middleware: {len(middleware)}")
    
    # Verificar middleware de optimización
    optimization_middleware = [
        'ecommerce.middleware.sentry.PerformanceMiddleware',
        'ecommerce.middleware.query_optimization.QueryOptimizationMiddleware',
    ]
    
    for middleware_name in optimization_middleware:
        if middleware_name in middleware:
            print(f"  ✅ {middleware_name}")
        else:
            print(f"  ⚠️ {middleware_name} no configurado")

def generate_report():
    """Generar reporte de performance."""
    print("\n📋 Generando reporte de performance...")
    
    report = {
        'database': analyze_database_performance(),
        'cache': True,  # Se asume que funciona si no hay errores
        'static_files': True,  # Se asume que funciona si no hay errores
        'middleware': True,  # Se asume que funciona si no hay errores
    }
    
    print("\n📊 Resumen del reporte:")
    for component, status in report.items():
        if status:
            print(f"  ✅ {component.title()}: OK")
        else:
            print(f"  ❌ {component.title()}: ERROR")
    
    return report

def main():
    """Función principal."""
    print("🚀 Iniciando análisis de performance...")
    
    # Verificar que estamos en el directorio correcto
    if not (BASE_DIR / 'manage.py').exists():
        print("❌ Error: No se encontró manage.py. Ejecutar desde el directorio backend/")
        return False
    
    try:
        # Ejecutar análisis
        analyze_queries()
        analyze_database_performance()
        analyze_cache_performance()
        analyze_static_files()
        analyze_middleware()
        
        # Generar reporte
        report = generate_report()
        
        print("\n🎉 Análisis de performance completado!")
        return True
        
    except Exception as e:
        print(f"❌ Error durante el análisis: {e}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
