#!/usr/bin/env python3
"""
Script para limpiar y gestionar logs del proyecto
Útil para resolver problemas de permisos en Windows
"""

import os
import sys
import shutil
from pathlib import Path
import logging

def clean_logs():
    """Limpia los archivos de log y resuelve problemas de permisos"""
    print("🧹 Limpiando archivos de log...")
    
    # Directorio de logs
    logs_dir = Path(__file__).parent / 'logs'
    
    if not logs_dir.exists():
        print("✅ Directorio de logs no existe, no hay nada que limpiar")
        return True
    
    try:
        # Listar archivos de log
        log_files = list(logs_dir.glob('*.log*'))
        
        if not log_files:
            print("✅ No hay archivos de log para limpiar")
            return True
        
        print(f"📁 Encontrados {len(log_files)} archivos de log:")
        for log_file in log_files:
            print(f"   - {log_file.name}")
        
        # Intentar eliminar archivos de log
        removed_count = 0
        for log_file in log_files:
            try:
                if log_file.is_file():
                    log_file.unlink()
                    print(f"✅ Eliminado: {log_file.name}")
                    removed_count += 1
                else:
                    print(f"⚠️  No es un archivo: {log_file.name}")
            except PermissionError:
                print(f"❌ No se pudo eliminar {log_file.name} - archivo en uso")
            except Exception as e:
                print(f"❌ Error eliminando {log_file.name}: {e}")
        
        print(f"📊 Eliminados {removed_count}/{len(log_files)} archivos de log")
        
        # Recrear directorio si está vacío
        try:
            if not any(logs_dir.iterdir()):
                logs_dir.rmdir()
                logs_dir.mkdir(exist_ok=True)
                print("✅ Directorio de logs recreado")
        except Exception as e:
            print(f"⚠️  No se pudo recrear directorio: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error limpiando logs: {e}")
        return False

def reset_logging():
    """Reinicia la configuración de logging"""
    print("🔄 Reiniciando configuración de logging...")
    
    try:
        # Limpiar handlers existentes
        root_logger = logging.getLogger()
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
            handler.close()
        
        # Limpiar loggers específicos
        for logger_name in ['django', 'ecommerce']:
            logger = logging.getLogger(logger_name)
            for handler in logger.handlers[:]:
                logger.removeHandler(handler)
                handler.close()
        
        print("✅ Configuración de logging reiniciada")
        return True
        
    except Exception as e:
        print(f"❌ Error reiniciando logging: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Limpiador de logs del proyecto eCommerce")
    print("=" * 50)
    
    # Limpiar logs
    if not clean_logs():
        print("❌ Error limpiando logs")
        return False
    
    # Reiniciar logging
    if not reset_logging():
        print("❌ Error reiniciando logging")
        return False
    
    print("\n🎉 ¡Limpieza completada!")
    print("📋 Próximos pasos:")
    print("1. Reinicia el servidor Django")
    print("2. Los logs se crearán automáticamente")
    print("3. Si persisten los problemas, ejecuta como administrador")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
