"""
Base service class for payment gateways.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from decimal import Decimal
from django.conf import settings
from ..models import Payment


class BasePaymentService(ABC):
    """
    Clase base para servicios de pasarelas de pago.
    """
    
    def __init__(self):
        self.environment = self.get_environment()
        self.public_key = self.get_public_key()
        self.private_key = self.get_private_key()
        self.webhook_secret = self.get_webhook_secret()
    
    @abstractmethod
    def get_environment(self) -> str:
        """Obtiene el entorno (sandbox/production)."""
        pass
    
    @abstractmethod
    def get_public_key(self) -> str:
        """Obtiene la clave pública."""
        pass
    
    @abstractmethod
    def get_private_key(self) -> str:
        """Obtiene la clave privada."""
        pass
    
    @abstractmethod
    def get_webhook_secret(self) -> str:
        """Obtiene el secreto del webhook."""
        pass
    
    @abstractmethod
    def create_payment_intent(self, order, amount: Decimal, currency: str = 'COP') -> Dict[str, Any]:
        """
        Crea una intención de pago.
        
        Args:
            order: Orden a pagar
            amount: Monto a pagar
            currency: Moneda (por defecto COP)
            
        Returns:
            Dict con la información de la intención de pago
        """
        pass
    
    @abstractmethod
    def process_payment(self, payment_intent_id: str, payment_method: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa un pago.
        
        Args:
            payment_intent_id: ID de la intención de pago
            payment_method: Información del método de pago
            
        Returns:
            Dict con el resultado del pago
        """
        pass
    
    @abstractmethod
    def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Verifica el estado de un pago.
        
        Args:
            payment_id: ID del pago
            
        Returns:
            Dict con el estado del pago
        """
        pass
    
    @abstractmethod
    def refund_payment(self, payment_id: str, amount: Optional[Decimal] = None) -> Dict[str, Any]:
        """
        Reembolsa un pago.
        
        Args:
            payment_id: ID del pago
            amount: Monto a reembolsar (si es None, reembolso total)
            
        Returns:
            Dict con el resultado del reembolso
        """
        pass
    
    @abstractmethod
    def verify_webhook(self, payload: str, signature: str) -> bool:
        """
        Verifica la autenticidad de un webhook.
        
        Args:
            payload: Cuerpo del webhook
            signature: Firma del webhook
            
        Returns:
            True si es válido, False en caso contrario
        """
        pass
    
    @abstractmethod
    def process_webhook(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa un webhook.
        
        Args:
            payload: Datos del webhook
            
        Returns:
            Dict con el resultado del procesamiento
        """
        pass
    
    def is_sandbox(self) -> bool:
        """Verifica si está en modo sandbox."""
        return self.environment.lower() in ['sandbox', 'test', 'development']
    
    def is_production(self) -> bool:
        """Verifica si está en modo producción."""
        return self.environment.lower() in ['production', 'live']
    
    def format_amount(self, amount: Decimal, currency: str = 'COP') -> int:
        """
        Convierte el monto a la unidad correcta para la pasarela.
        Para Wompi y MercadoPago, los montos se envían en centavos.
        """
        if currency == 'COP':
            return int(amount * 100)
        return int(amount)
    
    def parse_amount(self, amount: int, currency: str = 'COP') -> Decimal:
        """
        Convierte el monto de la pasarela a Decimal.
        """
        if currency == 'COP':
            return Decimal(amount) / 100
        return Decimal(amount)
    
    def supports_country(self, country_code: str) -> bool:
        """
        Verifica si el servicio soporta un país específico.
        
        Args:
            country_code: Código del país (ej: 'CO', 'US', 'AR')
            
        Returns:
            True si soporta el país, False en caso contrario
        """
        return country_code.upper() in self.get_supported_countries()
    
    def supports_currency(self, currency: str) -> bool:
        """
        Verifica si el servicio soporta una moneda específica.
        
        Args:
            currency: Código de la moneda (ej: 'COP', 'USD', 'ARS')
            
        Returns:
            True si soporta la moneda, False en caso contrario
        """
        return currency.upper() in self.get_supported_currencies()
    
    @abstractmethod
    def get_supported_countries(self) -> list:
        """
        Obtiene la lista de países soportados.
        
        Returns:
            Lista de códigos de países soportados
        """
        pass
    
    @abstractmethod
    def get_supported_currencies(self) -> list:
        """
        Obtiene la lista de monedas soportadas.
        
        Returns:
            Lista de códigos de monedas soportadas
        """
        pass
    
    @abstractmethod
    def get_provider_config(self) -> Dict[str, Any]:
        """
        Obtiene la configuración del proveedor.
        
        Returns:
            Dict con la configuración del proveedor
        """
        pass
