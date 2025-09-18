"""
Factory para crear instancias de servicios de pago.
"""
from typing import Optional
from .base import BasePaymentService
from .wompi_service import WompiService
from .mercadopago_service import MercadoPagoService


class PaymentServiceFactory:
    """
    Factory para crear instancias de servicios de pago.
    """
    
    _services = {
        'wompi': WompiService,
        'mercadopago': MercadoPagoService,
    }
    
    @classmethod
    def create_service(cls, provider: str) -> Optional[BasePaymentService]:
        """
        Crea una instancia del servicio de pago especificado.
        
        Args:
            provider: Nombre del proveedor ('wompi', 'mercadopago')
            
        Returns:
            Instancia del servicio o None si no se encuentra
        """
        service_class = cls._services.get(provider.lower())
        if service_class:
            return service_class()
        return None
    
    @classmethod
    def get_available_providers(cls) -> list:
        """
        Obtiene la lista de proveedores disponibles.
        
        Returns:
            Lista de nombres de proveedores
        """
        return list(cls._services.keys())
    
    @classmethod
    def is_provider_available(cls, provider: str) -> bool:
        """
        Verifica si un proveedor está disponible.
        
        Args:
            provider: Nombre del proveedor
            
        Returns:
            True si está disponible, False en caso contrario
        """
        return provider.lower() in cls._services
    
    @classmethod
    def get_default_provider(cls) -> str:
        """
        Obtiene el proveedor por defecto (Wompi para Colombia).
        
        Returns:
            Nombre del proveedor por defecto
        """
        return 'wompi'
    
    @classmethod
    def get_provider_for_country(cls, country_code: str) -> str:
        """
        Obtiene el proveedor recomendado para un país.
        
        Args:
            country_code: Código del país (ej: 'CO', 'US', 'AR')
            
        Returns:
            Nombre del proveedor recomendado
        """
        country_providers = {
            'CO': 'wompi',  # Colombia - Wompi
            'AR': 'mercadopago',  # Argentina - MercadoPago
            'MX': 'mercadopago',  # México - MercadoPago
            'BR': 'mercadopago',  # Brasil - MercadoPago
            'US': 'mercadopago',  # Estados Unidos - MercadoPago
            'CA': 'mercadopago',  # Canadá - MercadoPago
            'GB': 'mercadopago',  # Reino Unido - MercadoPago
            'DE': 'mercadopago',  # Alemania - MercadoPago
            'FR': 'mercadopago',  # Francia - MercadoPago
            'ES': 'mercadopago',  # España - MercadoPago
        }
        
        return country_providers.get(country_code.upper(), cls.get_default_provider())
    
    @classmethod
    def get_providers_for_currency(cls, currency: str) -> list:
        """
        Obtiene los proveedores que soportan una moneda específica.
        
        Args:
            currency: Código de la moneda (ej: 'COP', 'USD', 'ARS')
            
        Returns:
            Lista de proveedores que soportan la moneda
        """
        currency_providers = {
            'COP': ['wompi', 'mercadopago'],  # Peso colombiano
            'USD': ['mercadopago'],  # Dólar estadounidense
            'ARS': ['mercadopago'],  # Peso argentino
            'MXN': ['mercadopago'],  # Peso mexicano
            'BRL': ['mercadopago'],  # Real brasileño
            'EUR': ['mercadopago'],  # Euro
            'GBP': ['mercadopago'],  # Libra esterlina
        }
        
        return currency_providers.get(currency.upper(), [cls.get_default_provider()])
    
    @classmethod
    def get_service_config(cls, provider: str) -> dict:
        """
        Obtiene la configuración de un proveedor.
        
        Args:
            provider: Nombre del proveedor
            
        Returns:
            Diccionario con la configuración del proveedor
        """
        configs = {
            'wompi': {
                'name': 'Wompi',
                'display_name': 'Wompi',
                'description': 'Pasarela de pago líder en Colombia',
                'supported_currencies': ['COP'],
                'supported_countries': ['CO'],
                'payment_methods': ['credit_card', 'debit_card', 'nequi', 'bancolombia_transfer'],
                'environment': 'sandbox',
                'website': 'https://wompi.co',
                'logo_url': '/static/images/payment-logos/wompi.png'
            },
            'mercadopago': {
                'name': 'MercadoPago',
                'display_name': 'MercadoPago',
                'description': 'Pasarela de pago líder en Latinoamérica',
                'supported_currencies': ['COP', 'USD', 'ARS', 'MXN', 'BRL', 'CLP', 'UYU', 'PEN'],
                'supported_countries': ['CO', 'AR', 'MX', 'BR', 'CL', 'UY', 'PE'],
                'payment_methods': ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'],
                'environment': 'sandbox',
                'website': 'https://mercadopago.com',
                'logo_url': '/static/images/payment-logos/mercadopago.png'
            },
        }
        
        return configs.get(provider.lower(), {})
    
    @classmethod
    def get_all_configs(cls) -> dict:
        """
        Obtiene la configuración de todos los proveedores.
        
        Returns:
            Diccionario con la configuración de todos los proveedores
        """
        return {provider: cls.get_service_config(provider) for provider in cls._services.keys()}
