"""
Validador de Stock en Tiempo Real para eCommerce.
Implementa validaciones de stock antes de confirmar órdenes.
"""

from django.core.exceptions import ValidationError
from django.db import transaction
from typing import Dict, List, Tuple, Optional
import logging

from .autostock_service import AutoStockService
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.cart.models import CartItem

logger = logging.getLogger(__name__)


class StockValidator:
    """
    Validador de stock en tiempo real.
    """
    
    @staticmethod
    def validate_cart_stock(cart_items: List[CartItem]) -> Dict[str, any]:
        """
        Valida el stock de todos los items del carrito.
        
        Args:
            cart_items: Lista de items del carrito
            
        Returns:
            Dict: Resultado de la validación
        """
        results = {
            'valid': True,
            'items': [],
            'errors': [],
            'warnings': []
        }
        
        for cart_item in cart_items:
            item_result = StockValidator.validate_item_stock(
                product=cart_item.product,
                variant=cart_item.variant,
                quantity=cart_item.quantity
            )
            
            results['items'].append({
                'cart_item_id': cart_item.id,
                'product_id': cart_item.product.id,
                'variant_id': cart_item.variant.id if cart_item.variant else None,
                'product_name': cart_item.product.name,
                'variant_name': str(cart_item.variant) if cart_item.variant else None,
                'requested_quantity': cart_item.quantity,
                'available_stock': item_result['available_stock'],
                'is_available': item_result['is_available'],
                'message': item_result['message'],
                'warnings': item_result.get('warnings', [])
            })
            
            if not item_result['is_available']:
                results['valid'] = False
                results['errors'].append(
                    f"{cart_item.product.name}: {item_result['message']}"
                )
            
            if item_result.get('warnings'):
                results['warnings'].extend(item_result['warnings'])
        
        return results
    
    @staticmethod
    def validate_order_stock(order: Order) -> Dict[str, any]:
        """
        Valida el stock de todos los items de una orden.
        
        Args:
            order: Orden a validar
            
        Returns:
            Dict: Resultado de la validación
        """
        results = {
            'valid': True,
            'items': [],
            'errors': [],
            'warnings': []
        }
        
        for order_item in order.items.all():
            item_result = StockValidator.validate_item_stock(
                product=order_item.product,
                variant=order_item.variant,
                quantity=order_item.quantity
            )
            
            results['items'].append({
                'order_item_id': order_item.id,
                'product_id': order_item.product.id,
                'variant_id': order_item.variant.id if order_item.variant else None,
                'product_name': order_item.product_name,
                'variant_name': order_item.variant_info,
                'requested_quantity': order_item.quantity,
                'available_stock': item_result['available_stock'],
                'is_available': item_result['is_available'],
                'message': item_result['message'],
                'warnings': item_result.get('warnings', [])
            })
            
            if not item_result['is_available']:
                results['valid'] = False
                results['errors'].append(
                    f"{order_item.product_name}: {item_result['message']}"
                )
            
            if item_result.get('warnings'):
                results['warnings'].extend(item_result['warnings'])
        
        return results
    
    @staticmethod
    def validate_item_stock(product: Product, variant: Optional[ProductVariant], 
                           quantity: int) -> Dict[str, any]:
        """
        Valida el stock de un item específico.
        
        Args:
            product: Producto a validar
            variant: Variante específica (opcional)
            quantity: Cantidad solicitada
            
        Returns:
            Dict: Resultado de la validación
        """
        result = {
            'is_available': False,
            'available_stock': 0,
            'message': '',
            'warnings': []
        }
        
        try:
            # Obtener stock disponible
            available_stock = AutoStockService.get_available_stock(product, variant)
            result['available_stock'] = available_stock
            
            # Validar disponibilidad
            is_available, message = AutoStockService.validate_stock_availability(
                product, variant, quantity
            )
            
            result['is_available'] = is_available
            result['message'] = message
            
            # Generar advertencias adicionales
            if is_available:
                # Verificar si está cerca del límite
                if available_stock <= quantity + 2:  # Solo 2 unidades más disponibles
                    result['warnings'].append(
                        f"Stock limitado: solo quedan {available_stock} unidades"
                    )
                
                # Verificar si es stock bajo
                if variant:
                    threshold = variant.low_stock_threshold
                else:
                    threshold = product.low_stock_threshold
                
                if available_stock <= threshold:
                    result['warnings'].append(
                        f"Stock bajo: {available_stock} unidades (umbral: {threshold})"
                    )
                
                # Verificar si permite backorder
                if available_stock < quantity and product.allow_backorder:
                    result['warnings'].append(
                        "Este producto permite backorder - puede haber demoras en la entrega"
                    )
            
            logger.info(f"Validación de stock: {product.name} - Disponible: {available_stock}, Solicitado: {quantity}, Válido: {is_available}")
            
        except Exception as e:
            result['is_available'] = False
            result['message'] = f"Error validando stock: {str(e)}"
            logger.error(f"Error validando stock para {product.name}: {str(e)}")
        
        return result
    
    @staticmethod
    def validate_bulk_stock(items: List[Dict]) -> Dict[str, any]:
        """
        Valida el stock de múltiples items en lote.
        
        Args:
            items: Lista de diccionarios con 'product_id', 'variant_id', 'quantity'
            
        Returns:
            Dict: Resultado de la validación
        """
        results = {
            'valid': True,
            'items': [],
            'errors': [],
            'warnings': []
        }
        
        try:
            with transaction.atomic():
                for item_data in items:
                    try:
                        product = Product.objects.get(id=item_data['product_id'])
                        variant = None
                        
                        if item_data.get('variant_id'):
                            variant = ProductVariant.objects.get(
                                id=item_data['variant_id'],
                                product=product
                            )
                        
                        item_result = StockValidator.validate_item_stock(
                            product=product,
                            variant=variant,
                            quantity=item_data['quantity']
                        )
                        
                        results['items'].append({
                            'product_id': product.id,
                            'variant_id': variant.id if variant else None,
                            'product_name': product.name,
                            'variant_name': str(variant) if variant else None,
                            'requested_quantity': item_data['quantity'],
                            'available_stock': item_result['available_stock'],
                            'is_available': item_result['is_available'],
                            'message': item_result['message'],
                            'warnings': item_result.get('warnings', [])
                        })
                        
                        if not item_result['is_available']:
                            results['valid'] = False
                            results['errors'].append(
                                f"{product.name}: {item_result['message']}"
                            )
                        
                        if item_result.get('warnings'):
                            results['warnings'].extend(item_result['warnings'])
                    
                    except (Product.DoesNotExist, ProductVariant.DoesNotExist) as e:
                        error_msg = f"Producto o variante no encontrado: {str(e)}"
                        results['valid'] = False
                        results['errors'].append(error_msg)
                        logger.error(error_msg)
                    
                    except Exception as e:
                        error_msg = f"Error validando item: {str(e)}"
                        results['valid'] = False
                        results['errors'].append(error_msg)
                        logger.error(error_msg)
        
        except Exception as e:
            results['valid'] = False
            results['errors'].append(f"Error en validación masiva: {str(e)}")
            logger.error(f"Error en validación masiva de stock: {str(e)}")
        
        return results
    
    @staticmethod
    def get_stock_summary(products: List[Product]) -> Dict[str, any]:
        """
        Obtiene un resumen del stock para una lista de productos.
        
        Args:
            products: Lista de productos
            
        Returns:
            Dict: Resumen del stock
        """
        summary = {
            'total_products': len(products),
            'in_stock': 0,
            'low_stock': 0,
            'out_of_stock': 0,
            'products': []
        }
        
        for product in products:
            product_summary = {
                'product_id': product.id,
                'product_name': product.name,
                'sku': product.sku,
                'track_inventory': product.track_inventory,
                'variants': []
            }
            
            if product.track_inventory:
                # Stock a nivel de producto
                available_stock = AutoStockService.get_available_stock(product)
                
                if available_stock > product.low_stock_threshold:
                    status = 'in_stock'
                    summary['in_stock'] += 1
                elif available_stock > 0:
                    status = 'low_stock'
                    summary['low_stock'] += 1
                else:
                    status = 'out_of_stock'
                    summary['out_of_stock'] += 1
                
                product_summary['stock_status'] = status
                product_summary['available_stock'] = available_stock
                product_summary['low_stock_threshold'] = product.low_stock_threshold
                
                # Stock por variantes
                for variant in product.variants.all():
                    variant_stock = AutoStockService.get_available_stock(product, variant)
                    
                    if variant_stock > variant.low_stock_threshold:
                        variant_status = 'in_stock'
                    elif variant_stock > 0:
                        variant_status = 'low_stock'
                    else:
                        variant_status = 'out_of_stock'
                    
                    product_summary['variants'].append({
                        'variant_id': variant.id,
                        'variant_name': str(variant),
                        'sku': variant.sku,
                        'stock_status': variant_status,
                        'available_stock': variant_stock,
                        'low_stock_threshold': variant.low_stock_threshold
                    })
            else:
                product_summary['stock_status'] = 'unlimited'
                product_summary['available_stock'] = 999999
            
            summary['products'].append(product_summary)
        
        return summary
