#!/usr/bin/env python3
"""
Script para instalar dependencias del proyecto eCommerce
Maneja compatibilidad con Python 3.12+ y resuelve problemas de pkg_resources
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Ejecuta un comando y maneja errores"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en {description}: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Instalando dependencias del proyecto eCommerce...")
    
    # Verificar Python version
    python_version = sys.version_info
    print(f"🐍 Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 8):
        print("❌ Se requiere Python 3.8 o superior")
        sys.exit(1)
    
    # Instalar setuptools primero (necesario para pkg_resources)
    if not run_command("pip install --upgrade setuptools wheel", "Actualizando setuptools"):
        print("⚠️  Advertencia: No se pudo actualizar setuptools")
    
    # Instalar dependencias del proyecto
    requirements_file = Path(__file__).parent / "requirements.txt"
    if requirements_file.exists():
        if not run_command(f"pip install -r {requirements_file}", "Instalando dependencias del proyecto"):
            print("❌ Error instalando dependencias del proyecto")
            sys.exit(1)
    else:
        print("❌ Archivo requirements.txt no encontrado")
        sys.exit(1)
    
    # Verificar instalación de Django
    try:
        import django
        print(f"✅ Django {django.get_version()} instalado correctamente")
    except ImportError:
        print("❌ Django no se instaló correctamente")
        sys.exit(1)
    
    # Verificar instalación de DRF
    try:
        import rest_framework
        print("✅ Django REST Framework instalado correctamente")
    except ImportError:
        print("❌ Django REST Framework no se instaló correctamente")
        sys.exit(1)
    
    print("🎉 ¡Todas las dependencias se instalaron correctamente!")
    print("\n📋 Próximos pasos:")
    print("1. Ejecuta: python manage.py migrate")
    print("2. Ejecuta: python manage.py runserver")

if __name__ == "__main__":
    main()
