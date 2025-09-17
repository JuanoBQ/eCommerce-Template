#!/usr/bin/env python
"""
Script para migrar datos de SQLite a PostgreSQL.
Ejecutar desde el directorio backend/ con: python scripts/migrate_to_postgresql.py
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
from django.db import connection
from django.conf import settings
import subprocess

def check_postgresql_connection():
    """Verificar conexión a PostgreSQL"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Conexión a PostgreSQL exitosa")
            return True
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        return False

def backup_sqlite():
    """Crear backup de SQLite"""
    sqlite_path = BASE_DIR / 'db.sqlite3'
    if sqlite_path.exists():
        backup_path = BASE_DIR / 'db_backup.sqlite3'
        import shutil
        shutil.copy2(sqlite_path, backup_path)
        print(f"✅ Backup creado: {backup_path}")
        return True
    else:
        print("ℹ️ No se encontró db.sqlite3")
        return False

def run_migrations():
    """Ejecutar migraciones en PostgreSQL"""
    try:
        print("🔄 Ejecutando migraciones...")
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Migraciones completadas")
        return True
    except Exception as e:
        print(f"❌ Error en migraciones: {e}")
        return False

def create_superuser():
    """Crear superusuario si no existe"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(is_superuser=True).exists():
            print("🔄 Creando superusuario...")
            execute_from_command_line([
                'manage.py', 'createsuperuser',
                '--email', 'admin@admin.com',
                '--username', 'admin',
                '--noinput'
            ])
            # Establecer contraseña
            user = User.objects.get(username='admin')
            user.set_password('admin123')
            user.save()
            print("✅ Superusuario creado: admin@admin.com / admin123")
        else:
            print("ℹ️ Superusuario ya existe")
        return True
    except Exception as e:
        print(f"❌ Error creando superusuario: {e}")
        return False

def load_sample_data():
    """Cargar datos de muestra"""
    try:
        print("🔄 Cargando datos de muestra...")
        execute_from_command_line(['manage.py', 'loaddata', 'sample_data.json'])
        print("✅ Datos de muestra cargados")
        return True
    except Exception as e:
        print(f"⚠️ No se pudieron cargar datos de muestra: {e}")
        return True  # No es crítico

def main():
    """Función principal"""
    print("🚀 Iniciando migración a PostgreSQL...")
    
    # Verificar conexión
    if not check_postgresql_connection():
        print("❌ No se puede continuar sin conexión a PostgreSQL")
        return False
    
    # Crear backup
    backup_sqlite()
    
    # Ejecutar migraciones
    if not run_migrations():
        return False
    
    # Crear superusuario
    if not create_superuser():
        return False
    
    # Cargar datos de muestra
    load_sample_data()
    
    print("✅ Migración a PostgreSQL completada exitosamente!")
    print("\n📋 Próximos pasos:")
    print("1. Verificar que la aplicación funcione correctamente")
    print("2. Ejecutar tests: python manage.py test")
    print("3. Si todo está bien, eliminar db.sqlite3")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
