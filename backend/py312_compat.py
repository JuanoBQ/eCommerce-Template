"""
Compatibilidad para Python 3.12+
Maneja la transición de pkg_resources a importlib.metadata
"""

import sys
import warnings

# Suprimir warnings de pkg_resources
warnings.filterwarnings("ignore", category=DeprecationWarning, module="pkg_resources")

# Para Python 3.12+, asegurar que pkg_resources esté disponible
if sys.version_info >= (3, 12):
    try:
        import pkg_resources
    except ImportError:
        # Instalar pkg_resources si no está disponible
        import subprocess
        import os
        
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "setuptools"])
            import pkg_resources
        except Exception as e:
            print(f"Advertencia: No se pudo instalar pkg_resources: {e}")
            # Crear un mock básico si es necesario
            class MockPkgResources:
                def get_distribution(self, name):
                    return None
                DistributionNotFound = Exception
            
            pkg_resources = MockPkgResources()
            sys.modules['pkg_resources'] = pkg_resources
