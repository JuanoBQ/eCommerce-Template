"""
Vistas para gestión de stock en tiempo real.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from .models import StockMovement, StockReservation, StockAlert
from .stock_serializers import (
    StockMovementSerializer, StockReservationSerializer, 
    StockAlertSerializer, StockSummarySerializer
)
from .autostock_service import AutoStockService
from .stock_validator import StockValidator
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.cart.models import CartItem


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar movimientos de stock.
    """
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['product', 'variant', 'movement_type', 'reason']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtra movimientos según permisos del usuario."""
        queryset = StockMovement.objects.select_related(
            'product', 'variant', 'order', 'user'
        )
        
        # Solo administradores pueden ver todos los movimientos
        if not self.request.user.is_staff:
            # Usuarios normales solo ven sus propios movimientos
            queryset = queryset.filter(user=self.request.user)
        
        return queryset


class StockReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reservas de stock.
    """
    serializer_class = StockReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtra reservas según el usuario."""
        return StockReservation.objects.filter(
            user=self.request.user
        ).select_related('product', 'variant', 'order')
    
    @action(detail=False, methods=['post'])
    def sync_cart(self, request):
        """
        Sincroniza las reservas de stock con el carrito del usuario.
        """
        try:
            AutoStockService.sync_cart_reservations(request.user)
            return Response({
                'success': True,
                'message': 'Reservas sincronizadas correctamente'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def cleanup_expired(self, request):
        """
        Limpia las reservas expiradas.
        """
        try:
            count = AutoStockService.cleanup_expired_reservations()
            return Response({
                'success': True,
                'message': f'{count} reservas expiradas liberadas'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class StockAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar alertas de stock.
    """
    serializer_class = StockAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['product', 'variant', 'alert_type', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filtra alertas según permisos del usuario."""
        queryset = StockAlert.objects.select_related(
            'product', 'variant', 'resolved_by'
        )
        
        # Solo administradores pueden ver todas las alertas
        if not self.request.user.is_staff:
            # Usuarios normales solo ven alertas de sus productos
            queryset = queryset.filter(
                Q(product__user=self.request.user) | 
                Q(variant__product__user=self.request.user)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """
        Resuelve una alerta de stock.
        """
        alert = self.get_object()
        alert.resolve(user=request.user)
        
        return Response({
            'success': True,
            'message': 'Alerta resuelta correctamente'
        })


class StockValidationViewSet(viewsets.ViewSet):
    """
    ViewSet para validaciones de stock en tiempo real.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def validate_cart(self, request):
        """
        Valida el stock de todos los items del carrito.
        """
        try:
            cart_items = CartItem.objects.filter(
                cart__user=request.user
            ).select_related('product', 'variant')
            
            result = StockValidator.validate_cart_stock(cart_items)
            
            return Response({
                'success': True,
                'validation': result
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def validate_items(self, request):
        """
        Valida el stock de una lista de items.
        """
        try:
            items = request.data.get('items', [])
            if not items:
                return Response({
                    'success': False,
                    'error': 'No se proporcionaron items para validar'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = StockValidator.validate_bulk_stock(items)
            
            return Response({
                'success': True,
                'validation': result
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def check_availability(self, request):
        """
        Verifica la disponibilidad de un producto/variante específico.
        """
        try:
            product_id = request.query_params.get('product_id')
            variant_id = request.query_params.get('variant_id')
            quantity = int(request.query_params.get('quantity', 1))
            
            if not product_id:
                return Response({
                    'success': False,
                    'error': 'product_id es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            product = Product.objects.get(id=product_id)
            variant = None
            
            if variant_id:
                variant = ProductVariant.objects.get(
                    id=variant_id,
                    product=product
                )
            
            result = StockValidator.validate_item_stock(
                product=product,
                variant=variant,
                quantity=quantity
            )
            
            return Response({
                'success': True,
                'availability': result
            })
        except (Product.DoesNotExist, ProductVariant.DoesNotExist) as e:
            return Response({
                'success': False,
                'error': 'Producto o variante no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stock_summary(self, request):
        """
        Obtiene un resumen del stock de productos.
        """
        try:
            product_ids = request.query_params.getlist('product_ids')
            
            if product_ids:
                products = Product.objects.filter(id__in=product_ids)
            else:
                # Si no se especifican productos, obtener todos
                products = Product.objects.all()[:100]  # Limitar a 100 productos
            
            result = StockValidator.get_stock_summary(products)
            
            return Response({
                'success': True,
                'summary': result
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class StockManagementViewSet(viewsets.ViewSet):
    """
    ViewSet para operaciones de gestión de stock.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def reserve_stock(self, request):
        """
        Reserva stock para un usuario.
        """
        try:
            product_id = request.data.get('product_id')
            variant_id = request.data.get('variant_id')
            quantity = int(request.data.get('quantity', 1))
            expires_in_minutes = int(request.data.get('expires_in_minutes', 30))
            
            if not product_id:
                return Response({
                    'success': False,
                    'error': 'product_id es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            product = Product.objects.get(id=product_id)
            variant = None
            
            if variant_id:
                variant = ProductVariant.objects.get(
                    id=variant_id,
                    product=product
                )
            
            reservation = AutoStockService.reserve_stock(
                product=product,
                variant=variant,
                quantity=quantity,
                user=request.user,
                expires_in_minutes=expires_in_minutes
            )
            
            return Response({
                'success': True,
                'reservation_id': reservation.id,
                'expires_at': reservation.expires_at,
                'message': 'Stock reservado correctamente'
            })
        except (Product.DoesNotExist, ProductVariant.DoesNotExist) as e:
            return Response({
                'success': False,
                'error': 'Producto o variante no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def release_reservation(self, request):
        """
        Libera una reserva de stock.
        """
        try:
            reservation_id = request.data.get('reservation_id')
            
            if not reservation_id:
                return Response({
                    'success': False,
                    'error': 'reservation_id es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            reservation = StockReservation.objects.get(
                id=reservation_id,
                user=request.user
            )
            
            AutoStockService.release_stock_reservation(reservation)
            
            return Response({
                'success': True,
                'message': 'Reserva liberada correctamente'
            })
        except StockReservation.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Reserva no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
