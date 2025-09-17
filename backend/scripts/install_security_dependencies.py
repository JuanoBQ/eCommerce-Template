#!/usr/bin/env python3
"""
Script para instalar dependencias de seguridad del proyecto eCommerce.
Instala paquetes necesarios para 2FA, CSP y validación de seguridad.
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Ejecuta un comando y maneja errores."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"   Salida: {e.stdout}")
        print(f"   Error: {e.stderr}")
        return False


def install_python_packages():
    """Instala paquetes Python necesarios para seguridad."""
    packages = [
        'django-otp',
        'django-csp',
        'django-ratelimit',
        'pyotp',
        'qrcode[pil]',
        'cryptography',
        'django-redis',
        'django-cors-headers',
        'django-environ',
        'python-decouple',
    ]
    
    print("📦 Instalando paquetes Python de seguridad...")
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Instalando {package}"):
            print(f"⚠️  No se pudo instalar {package}, continuando...")
    
    return True


def create_directories():
    """Crea directorios necesarios para seguridad."""
    directories = [
        'logs',
        'logs/security',
        'static/security',
        'media/security',
    ]
    
    print("📁 Creando directorios de seguridad...")
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Directorio creado: {directory}")
    
    return True


def generate_security_keys():
    """Genera claves de seguridad iniciales."""
    print("🔐 Generando claves de seguridad...")
    
    # Cambiar al directorio del proyecto
    project_dir = Path(__file__).parent.parent
    os.chdir(project_dir)
    
    # Generar claves
    if run_command(
        "python manage.py generate_security_keys --type all --env-format --output .env.security",
        "Generando claves de seguridad"
    ):
        print("✅ Claves de seguridad generadas en .env.security")
        return True
    else:
        print("⚠️  No se pudieron generar claves automáticamente")
        return False


def setup_database():
    """Configura la base de datos para seguridad."""
    print("🗄️  Configurando base de datos para seguridad...")
    
    commands = [
        "python manage.py makemigrations security",
        "python manage.py migrate security",
        "python manage.py migrate",
    ]
    
    for command in commands:
        if not run_command(command, f"Ejecutando: {command}"):
            print(f"⚠️  Error en: {command}")
            return False
    
    return True


def create_superuser_if_needed():
    """Crea superusuario si no existe."""
    print("👤 Verificando superusuario...")
    
    # Verificar si existe superusuario
    result = subprocess.run(
        "python manage.py shell -c \"from django.contrib.auth.models import User; print('exists' if User.objects.filter(is_superuser=True).exists() else 'not_exists')\"",
        shell=True,
        capture_output=True,
        text=True
    )
    
    if 'not_exists' in result.stdout:
        print("👤 Creando superusuario...")
        if run_command(
            "python manage.py createsuperuser --noinput --username admin --email admin@example.com",
            "Creando superusuario"
        ):
            # Establecer contraseña
            run_command(
                "python manage.py shell -c \"from django.contrib.auth.models import User; u = User.objects.get(username='admin'); u.set_password('admin123'); u.save()\"",
                "Estableciendo contraseña del superusuario"
            )
            print("✅ Superusuario creado: admin / admin123")
        else:
            print("⚠️  No se pudo crear superusuario automáticamente")
    else:
        print("✅ Superusuario ya existe")


def main():
    """Función principal del script."""
    print("🛡️  INSTALADOR DE SEGURIDAD - eCommerce Template")
    print("=" * 50)
    
    # Verificar Python
    if sys.version_info < (3, 8):
        print("❌ Se requiere Python 3.8 o superior")
        sys.exit(1)
    
    # Instalar paquetes
    if not install_python_packages():
        print("❌ Error instalando paquetes Python")
        sys.exit(1)
    
    # Crear directorios
    if not create_directories():
        print("❌ Error creando directorios")
        sys.exit(1)
    
    # Generar claves
    if not generate_security_keys():
        print("⚠️  Advertencia: No se pudieron generar claves automáticamente")
    
    # Configurar base de datos
    if not setup_database():
        print("❌ Error configurando base de datos")
        sys.exit(1)
    
    # Crear superusuario
    create_superuser_if_needed()
    
    print("\n" + "=" * 50)
    print("✅ INSTALACIÓN DE SEGURIDAD COMPLETADA")
    print("=" * 50)
    
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. Revisar el archivo .env.security generado")
    print("2. Copiar las claves necesarias a tu archivo .env")
    print("3. Configurar 2FA para usuarios: python manage.py setup_user_2fa --username admin")
    print("4. Revisar la documentación en backend/docs/SECURITY.md")
    print("5. Probar los endpoints de seguridad")
    
    print("\n🔐 CONFIGURACIÓN RECOMENDADA:")
    print("- Habilitar HTTPS en producción")
    print("- Configurar firewall y rate limiting")
    print("- Monitorear logs de seguridad regularmente")
    print("- Rotar claves cada 90 días")
    
    print("\n⚠️  IMPORTANTE:")
    print("- NO commites el archivo .env.security al repositorio")
    print("- Usa diferentes claves para desarrollo y producción")
    print("- Configura alertas de seguridad en Sentry")


if __name__ == "__main__":
    main()
