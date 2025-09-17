"""
Generador de claves seguras para el proyecto eCommerce.
Genera claves criptográficamente seguras para SECRET_KEY y otros usos.
"""

import secrets
import string
from django.core.management.utils import get_random_secret_key


def generate_secure_key(length=50):
    """
    Genera una clave criptográficamente segura.
    
    Args:
        length (int): Longitud de la clave (mínimo 32)
    
    Returns:
        str: Clave segura generada
    """
    if length < 32:
        length = 32
    
    # Caracteres seguros para claves
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    
    # Generar clave usando secrets (criptográficamente seguro)
    key = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    return key


def generate_django_secret_key():
    """
    Genera una SECRET_KEY válida para Django.
    
    Returns:
        str: SECRET_KEY de Django
    """
    return get_random_secret_key()


def generate_csp_nonce(length=16):
    """
    Genera un nonce para Content Security Policy.
    
    Args:
        length (int): Longitud del nonce
    
    Returns:
        str: Nonce generado
    """
    return secrets.token_urlsafe(length)


def generate_api_key(length=32):
    """
    Genera una API key segura.
    
    Args:
        length (int): Longitud de la API key
    
    Returns:
        str: API key generada
    """
    return secrets.token_urlsafe(length)




if __name__ == "__main__":
    # Ejemplo de uso
    print("=== GENERADOR DE CLAVES SEGURAS ===")
    print(f"SECRET_KEY: {generate_django_secret_key()}")
    print(f"API Key: {generate_api_key()}")
    print(f"CSP Nonce: {generate_csp_nonce()}")
    print(f"Clave personalizada: {generate_secure_key(64)}")
