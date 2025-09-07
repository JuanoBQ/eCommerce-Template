#!/usr/bin/env python3
"""
Script para verificar que todas las importaciones del proyecto funcionen correctamente
"""

import sys
import importlib

def test_import(module_name, package_name=None, description=None):
    """Prueba una importación y maneja errores"""
    if description is None:
        description = module_name
    
    try:
        importlib.import_module(module_name)
        print(f"✅ {description}")
        return True
    except ImportError as e:
        if package_name:
            print(f"❌ {description} - Instala con: pip install {package_name}")
        else:
            print(f"❌ {description} - Error: {e}")
        return False

def main():
    """Verifica todas las importaciones necesarias"""
    print("🔍 Verificando importaciones del proyecto eCommerce...")
    print("=" * 60)
    
    # Mapeo de módulos a paquetes
    imports_to_test = [
        # Core Django
        ("django", "Django", "Django Framework"),
        ("rest_framework", "djangorestframework", "Django REST Framework"),
        ("corsheaders", "django-cors-headers", "Django CORS Headers"),
        ("django_filters", "django-filter", "Django Filter"),
        
        # Authentication
        ("dj_rest_auth", "dj-rest-auth", "dj-rest-auth"),
        ("allauth", "django-allauth", "Django Allauth"),
        ("rest_framework_simplejwt", "djangorestframework-simplejwt", "Simple JWT"),
        
        # API Documentation
        ("drf_yasg", "drf-yasg", "DRF YASG (Swagger)"),
        
        # Database
        ("psycopg2", "psycopg2-binary", "PostgreSQL Adapter"),
        
        # Cache
        ("django_redis", "django-redis", "Django Redis"),
        ("redis", "redis", "Redis Client"),
        
        # Task Queue
        ("celery", "celery", "Celery"),
        ("django_celery_beat", "django-celery-beat", "Django Celery Beat"),
        
        # Payments
        ("requests", "requests", "HTTP Requests"),
        ("mercadopago", "mercadopago", "MercadoPago SDK"),
        
        # Image Processing
        ("PIL", "Pillow", "Pillow (PIL)"),
        
        # Configuration
        ("decouple", "python-decouple", "Python Decouple"),
        
        # Development
        ("debug_toolbar", "django-debug-toolbar", "Django Debug Toolbar"),
        ("django_extensions", "django-extensions", "Django Extensions"),
        
        # Production
        ("gunicorn", "gunicorn", "Gunicorn"),
        ("whitenoise", "whitenoise", "WhiteNoise"),
        
        # Security
        ("cryptography", "cryptography", "Cryptography"),
        
        # Utilities
        ("dateutil", "python-dateutil", "Python DateUtil"),
        ("pytz", "pytz", "Pytz"),
    ]
    
    passed = 0
    total = len(imports_to_test)
    
    for module_name, package_name, description in imports_to_test:
        if test_import(module_name, package_name, description):
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 Resultado: {passed}/{total} importaciones exitosas")
    
    if passed == total:
        print("🎉 ¡Todas las importaciones funcionan correctamente!")
        return True
    else:
        print("❌ Algunas importaciones fallaron. Instala las dependencias faltantes.")
        print("\n💡 Para instalar todas las dependencias:")
        print("   pip install -r requirements.txt")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
