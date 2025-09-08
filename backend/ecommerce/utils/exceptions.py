"""
Excepciones personalizadas y manejo de errores estandarizado para el eCommerce.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


class EcommerceException(Exception):
    """Excepción base para el eCommerce."""
    default_message = "Ha ocurrido un error"
    default_code = "ecommerce_error"
    default_status = status.HTTP_400_BAD_REQUEST
    
    def __init__(self, message=None, code=None, status_code=None, details=None):
        self.message = message or self.default_message
        self.code = code or self.default_code
        self.status_code = status_code or self.default_status
        self.details = details or {}
        super().__init__(self.message)


class InsufficientStockException(EcommerceException):
    """Excepción para stock insuficiente."""
    default_message = "Stock insuficiente"
    default_code = "insufficient_stock"
    default_status = status.HTTP_400_BAD_REQUEST


class ProductNotAvailableException(EcommerceException):
    """Excepción para producto no disponible."""
    default_message = "Producto no disponible"
    default_code = "product_not_available"
    default_status = status.HTTP_400_BAD_REQUEST


class PaymentFailedException(EcommerceException):
    """Excepción para fallos en pagos."""
    default_message = "Error en el procesamiento del pago"
    default_code = "payment_failed"
    default_status = status.HTTP_400_BAD_REQUEST


class OrderNotFoundException(EcommerceException):
    """Excepción para orden no encontrada."""
    default_message = "Orden no encontrada"
    default_code = "order_not_found"
    default_status = status.HTTP_404_NOT_FOUND


class UnauthorizedAccessException(EcommerceException):
    """Excepción para acceso no autorizado."""
    default_message = "Acceso no autorizado"
    default_code = "unauthorized_access"
    default_status = status.HTTP_403_FORBIDDEN


class InvalidPaymentMethodException(EcommerceException):
    """Excepción para método de pago inválido."""
    default_message = "Método de pago inválido"
    default_code = "invalid_payment_method"
    default_status = status.HTTP_400_BAD_REQUEST


def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones para la API.
    """
    # Llamar al manejador por defecto de DRF
    response = exception_handler(exc, context)
    
    # Si DRF manejó la excepción, devolver la respuesta
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'Error en la solicitud',
            'code': 'api_error',
            'details': response.data,
            'status_code': response.status_code
        }
        response.data = custom_response_data
        return response
    
    # Manejar nuestras excepciones personalizadas
    if isinstance(exc, EcommerceException):
        logger.error(f"EcommerceException: {exc.message}", extra={
            'code': exc.code,
            'details': exc.details,
            'view': context.get('view'),
            'request': context.get('request')
        })
        
        custom_response_data = {
            'error': True,
            'message': exc.message,
            'code': exc.code,
            'details': exc.details,
            'status_code': exc.status_code
        }
        return Response(custom_response_data, status=exc.status_code)
    
    # Manejar ValidationError de Django
    if isinstance(exc, DjangoValidationError):
        logger.error(f"Django ValidationError: {exc.message}", extra={
            'view': context.get('view'),
            'request': context.get('request')
        })
        
        custom_response_data = {
            'error': True,
            'message': 'Error de validación',
            'code': 'validation_error',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else {'non_field_errors': exc.messages},
            'status_code': status.HTTP_400_BAD_REQUEST
        }
        return Response(custom_response_data, status=status.HTTP_400_BAD_REQUEST)
    
    # Manejar Http404
    if isinstance(exc, Http404):
        custom_response_data = {
            'error': True,
            'message': 'Recurso no encontrado',
            'code': 'not_found',
            'details': {},
            'status_code': status.HTTP_404_NOT_FOUND
        }
        return Response(custom_response_data, status=status.HTTP_404_NOT_FOUND)
    
    # Para otras excepciones no manejadas, log y devolver error genérico
    logger.error(f"Unhandled exception: {str(exc)}", extra={
        'exception_type': type(exc).__name__,
        'view': context.get('view'),
        'request': context.get('request')
    }, exc_info=True)
    
    custom_response_data = {
        'error': True,
        'message': 'Error interno del servidor',
        'code': 'internal_server_error',
        'details': {},
        'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
    }
    return Response(custom_response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def handle_api_error(func):
    """
    Decorador para manejar errores de API de forma consistente.
    """
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except EcommerceException as e:
            logger.error(f"EcommerceException in {func.__name__}: {e.message}")
            return Response({
                'error': True,
                'message': e.message,
                'code': e.code,
                'details': e.details,
                'status_code': e.status_code
            }, status=e.status_code)
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}", exc_info=True)
            return Response({
                'error': True,
                'message': 'Error interno del servidor',
                'code': 'internal_server_error',
                'details': {},
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return wrapper


class ErrorResponse:
    """
    Clase helper para crear respuestas de error consistentes.
    """
    
    @staticmethod
    def bad_request(message, code=None, details=None):
        return Response({
            'error': True,
            'message': message,
            'code': code or 'bad_request',
            'details': details or {},
            'status_code': status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @staticmethod
    def not_found(message="Recurso no encontrado", code=None, details=None):
        return Response({
            'error': True,
            'message': message,
            'code': code or 'not_found',
            'details': details or {},
            'status_code': status.HTTP_404_NOT_FOUND
        }, status=status.HTTP_404_NOT_FOUND)
    
    @staticmethod
    def forbidden(message="Acceso denegado", code=None, details=None):
        return Response({
            'error': True,
            'message': message,
            'code': code or 'forbidden',
            'details': details or {},
            'status_code': status.HTTP_403_FORBIDDEN
        }, status=status.HTTP_403_FORBIDDEN)
    
    @staticmethod
    def internal_error(message="Error interno del servidor", code=None, details=None):
        return Response({
            'error': True,
            'message': message,
            'code': code or 'internal_server_error',
            'details': details or {},
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def success(data=None, message="Operación exitosa", code=None):
        return Response({
            'error': False,
            'message': message,
            'code': code or 'success',
            'data': data or {},
            'status_code': status.HTTP_200_OK
        }, status=status.HTTP_200_OK)
