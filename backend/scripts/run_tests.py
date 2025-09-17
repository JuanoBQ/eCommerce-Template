#!/usr/bin/env python
"""
Script para ejecutar tests con pytest.
Ejecutar desde el directorio backend/ con: python scripts/run_tests.py
"""

import os
import sys
import subprocess
from pathlib import Path

# Agregar el directorio del proyecto al path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

def run_command(command, description):
    """Ejecutar comando y mostrar resultado."""
    print(f"\n🔄 {description}...")
    print(f"Comando: {' '.join(command)}")
    
    try:
        result = subprocess.run(command, cwd=BASE_DIR, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ {description} completado exitosamente")
            if result.stdout:
                print("Salida:", result.stdout)
        else:
            print(f"❌ {description} falló")
            if result.stderr:
                print("Error:", result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error ejecutando {description}: {e}")
        return False
    
    return True

def main():
    """Función principal."""
    print("🚀 Iniciando ejecución de tests...")
    
    # Verificar que estamos en el directorio correcto
    if not (BASE_DIR / 'manage.py').exists():
        print("❌ Error: No se encontró manage.py. Ejecutar desde el directorio backend/")
        return False
    
    # Verificar que pytest está instalado
    try:
        import pytest
        print("✅ pytest está instalado")
    except ImportError:
        print("❌ pytest no está instalado. Instalando...")
        if not run_command([sys.executable, '-m', 'pip', 'install', 'pytest', 'pytest-django', 'pytest-cov'], "Instalando pytest"):
            return False
    
    # Ejecutar tests
    test_commands = [
        # Tests básicos
        {
            'command': [sys.executable, '-m', 'pytest', 'ecommerce/apps/users/tests.py', '-v'],
            'description': 'Tests de usuarios'
        },
        {
            'command': [sys.executable, '-m', 'pytest', 'ecommerce/apps/products/tests.py', '-v'],
            'description': 'Tests de productos'
        },
        {
            'command': [sys.executable, '-m', 'pytest', 'ecommerce/apps/payments/tests.py', '-v'],
            'description': 'Tests de pagos'
        },
        # Tests con coverage
        {
            'command': [sys.executable, '-m', 'pytest', 'ecommerce/apps/', '--cov=ecommerce', '--cov-report=html', '--cov-report=term-missing', '--cov-fail-under=40'],
            'description': 'Tests con coverage'
        },
        # Tests de performance
        {
            'command': [sys.executable, '-m', 'pytest', 'ecommerce/apps/', '-m', 'performance', '-v'],
            'description': 'Tests de performance'
        },
        # Tests de seguridad
        {
            'command': [sys.executable, '-m', 'pytest', 'ecommerce/apps/', '-m', 'security', '-v'],
            'description': 'Tests de seguridad'
        }
    ]
    
    success_count = 0
    total_count = len(test_commands)
    
    for test_cmd in test_commands:
        if run_command(test_cmd['command'], test_cmd['description']):
            success_count += 1
    
    # Resumen
    print(f"\n📊 Resumen de tests:")
    print(f"✅ Exitosos: {success_count}/{total_count}")
    print(f"❌ Fallidos: {total_count - success_count}/{total_count}")
    
    if success_count == total_count:
        print("🎉 Todos los tests pasaron exitosamente!")
        return True
    else:
        print("⚠️ Algunos tests fallaron. Revisar la salida anterior.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
