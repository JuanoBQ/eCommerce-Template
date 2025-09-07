#!/usr/bin/env python3
"""
Script para verificar que el setup del proyecto esté funcionando correctamente
"""

import os
import sys
import django
from pathlib import Path

def test_imports():
    """Verifica que todas las importaciones críticas funcionen"""
    print("🔍 Verificando importaciones...")
    
    try:
        # Django core
        import django
        print(f"✅ Django {django.get_version()}")
        
        # DRF
        import rest_framework
        print("✅ Django REST Framework")
        
        # Auth
        import dj_rest_auth
        print("✅ dj-rest-auth")
        
        import djangorestframework_simplejwt
        print("✅ djangorestframework-simplejwt")
        
        # API Documentation
        import drf_yasg
        print("✅ drf-yasg")
        
        # Cache
        try:
            import django_redis
            print("✅ django-redis")
        except ImportError:
            print("⚠️  django-redis no disponible (usando cache local)")
        
        # Other dependencies
        import PIL
        print("✅ Pillow")
        
        import decouple
        print("✅ python-decouple")
        
        import requests
        print("✅ requests")
        
        return True
        
    except ImportError as e:
        print(f"❌ Error de importación: {e}")
        return False

def test_django_setup():
    """Verifica que Django se configure correctamente"""
    print("\n🔍 Verificando configuración de Django...")
    
    try:
        # Configurar Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
        django.setup()
        
        # Verificar configuración
        from django.conf import settings
        
        print(f"✅ DEBUG: {settings.DEBUG}")
        print(f"✅ Database: {settings.DATABASES['default']['ENGINE']}")
        print(f"✅ Cache: {settings.CACHES['default']['BACKEND']}")
        print(f"✅ Installed Apps: {len(settings.INSTALLED_APPS)} apps")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en configuración de Django: {e}")
        return False

def test_database_connection():
    """Verifica la conexión a la base de datos"""
    print("\n🔍 Verificando conexión a base de datos...")
    
    try:
        from django.db import connection
        connection.ensure_connection()
        print("✅ Conexión a base de datos exitosa")
        return True
        
    except Exception as e:
        print(f"❌ Error de conexión a base de datos: {e}")
        return False

def test_urls():
    """Verifica que las URLs se resuelvan correctamente"""
    print("\n🔍 Verificando configuración de URLs...")
    
    try:
        from django.urls import reverse
        from django.test import RequestFactory
        
        # Crear una request factory
        factory = RequestFactory()
        request = factory.get('/')
        
        # Verificar que las URLs principales existan
        try:
            reverse('api-root')
            print("✅ API root URL configurada")
        except Exception as e:
            print(f"⚠️  API root URL: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en configuración de URLs: {e}")
        return False

def main():
    """Función principal de verificación"""
    print("🚀 Verificando setup del proyecto eCommerce...")
    print("=" * 50)
    
    # Cambiar al directorio del backend
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Ejecutar verificaciones
    checks = [
        test_imports,
        test_django_setup,
        test_database_connection,
        test_urls,
    ]
    
    passed = 0
    total = len(checks)
    
    for check in checks:
        try:
            if check():
                passed += 1
        except Exception as e:
            print(f"❌ Error inesperado en {check.__name__}: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Resultado: {passed}/{total} verificaciones pasaron")
    
    if passed == total:
        print("🎉 ¡Todo está funcionando correctamente!")
        print("\n📋 Próximos pasos:")
        print("1. python manage.py migrate")
        print("2. python manage.py runserver")
        return True
    else:
        print("❌ Algunas verificaciones fallaron. Revisa los errores arriba.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
