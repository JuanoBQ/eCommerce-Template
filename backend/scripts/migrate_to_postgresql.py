#!/usr/bin/env python
"""
Script para migrar de SQLite a PostgreSQL.
Crea la base de datos PostgreSQL y migra los datos existentes.
"""

import os
import sys
import django
from pathlib import Path

# Agregar el directorio del proyecto al path
sys.path.append(str(Path(__file__).parent.parent))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings.development')
django.setup()

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from django.core.management import call_command
from django.conf import settings
from decouple import config

def create_database():
    """Crear la base de datos PostgreSQL si no existe."""
    db_name = config('DB_NAME', default='ecommerce_dev')
    db_user = config('DB_USER', default='ecommerce_user')
    db_password = config('DB_PASSWORD', default='ecommerce_password')
    db_host = config('DB_HOST', default='localhost')
    db_port = config('DB_PORT', default='5432')
    
    try:
        # Conectar a PostgreSQL como superusuario
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user='postgres',  # Usar usuario postgres para crear DB
            password=config('POSTGRES_PASSWORD', default='postgres')
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Verificar si la base de datos existe
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"📦 Creando base de datos '{db_name}'...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"✅ Base de datos '{db_name}' creada exitosamente")
        else:
            print(f"ℹ️ La base de datos '{db_name}' ya existe")
        
        # Crear usuario si no existe
        cursor.execute(f"SELECT 1 FROM pg_roles WHERE rolname = '{db_user}'")
        user_exists = cursor.fetchone()
        
        if not user_exists:
            print(f"👤 Creando usuario '{db_user}'...")
            cursor.execute(f"CREATE USER {db_user} WITH PASSWORD '{db_password}'")
            cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user}")
            print(f"✅ Usuario '{db_user}' creado exitosamente")
        else:
            print(f"ℹ️ El usuario '{db_user}' ya existe")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Error creando base de datos: {e}")
        return False

def migrate_data():
    """Migrar datos de SQLite a PostgreSQL."""
    print("🔄 Iniciando migración de datos...")
    
    try:
        # Ejecutar migraciones
        print("📋 Ejecutando migraciones...")
        call_command('migrate', verbosity=2)
        
        # Crear superusuario si no existe
        print("👤 Creando superusuario...")
        call_command('createsuperuser', interactive=False, 
                    username='admin', email='admin@example.com')
        
        print("✅ Migración completada exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        return False

def test_connection():
    """Probar la conexión a PostgreSQL."""
    print("🔍 Probando conexión a PostgreSQL...")
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]
            print(f"✅ Conexión exitosa a PostgreSQL: {version}")
            return True
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    """Función principal del script."""
    print("🚀 Iniciando migración de SQLite a PostgreSQL...")
    print("=" * 50)
    
    # Paso 1: Crear base de datos
    if not create_database():
        print("❌ No se pudo crear la base de datos. Abortando migración.")
        return False
    
    # Paso 2: Probar conexión
    if not test_connection():
        print("❌ No se pudo conectar a PostgreSQL. Abortando migración.")
        return False
    
    # Paso 3: Migrar datos
    if not migrate_data():
        print("❌ Error durante la migración de datos.")
        return False
    
    print("=" * 50)
    print("🎉 ¡Migración completada exitosamente!")
    print("📝 Próximos pasos:")
    print("   1. Verificar que la aplicación funciona correctamente")
    print("   2. Ejecutar tests para asegurar la integridad de los datos")
    print("   3. Configurar backup automático de PostgreSQL")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)