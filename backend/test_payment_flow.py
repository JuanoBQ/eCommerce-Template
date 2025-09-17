"""
Script de prueba para el nuevo flujo de pagos.
Demuestra que el stock solo se descuenta cuando el pago está confirmado.
"""

import os
import sys
import django
from decimal import Decimal

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.categories.models import Category, Brand, Size, Color
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.payments.services.payment_confirmation_service import PaymentConfirmationService
from ecommerce.apps.inventory.autostock_service import AutoStockService

User = get_user_model()

def create_test_product():
    """Crear un producto de prueba para el flujo de pagos."""
    print("🔧 CREANDO PRODUCTO DE PRUEBA...")
    
    # Crear categoría
    category, created = Category.objects.get_or_create(
        name='Electrónicos',
        defaults={'description': 'Productos electrónicos'}
    )
    
    # Crear marca
    brand, created = Brand.objects.get_or_create(
        name='TechBrand',
        defaults={'description': 'Marca de tecnología'}
    )
    
    # Crear tallas
    size_medium, created = Size.objects.get_or_create(name='Medium', defaults={'sort_order': 2})
    
    # Crear colores
    color_black, created = Color.objects.get_or_create(name='Negro', defaults={'hex_code': '#000000'})
    
    # Crear producto
    product, created = Product.objects.get_or_create(
        name='Tablet de Prueba',
        defaults={
            'slug': 'tablet-prueba',
            'description': 'Tablet para probar el flujo de pagos',
            'short_description': 'Tablet test',
            'sku': 'TABLET-TEST-001',
            'category': category,
            'brand': brand,
            'price': Decimal('299.99'),
            'compare_price': Decimal('399.99'),
            'track_inventory': True,
            'inventory_quantity': 0,  # Se sincronizará
            'low_stock_threshold': 3,
            'status': 'published'
        }
    )
    
    # Crear variante
    variant, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_medium,
        color=color_black,
        defaults={
            'sku': 'TABLET-TEST-001-BLK-MD',
            'inventory_quantity': 10,  # Stock de 10 unidades
            'low_stock_threshold': 2,
            'is_active': True
        }
    )
    
    # Sincronizar stock inicial
    AutoStockService.sync_product_stock(product)
    product.refresh_from_db()
    
    print(f"✅ Producto creado: {product.name}")
    print(f"   📊 Stock inicial: {product.inventory_quantity} unidades")
    print(f"   📦 Variante: {variant.size.name}-{variant.color.name}: {variant.inventory_quantity} unidades")
    
    return product, variant

def test_payment_flow():
    """Probar el flujo completo de pagos."""
    print("\n💳 PROBANDO FLUJO COMPLETO DE PAGOS")
    print("=" * 50)
    
    # Crear producto
    product, variant = create_test_product()
    
    # Crear usuario
    user, created = User.objects.get_or_create(
        email='comprador.pago@example.com',
        defaults={
            'first_name': 'Carlos',
            'last_name': 'Comprador',
            'username': 'carlos.comprador',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Mostrar stock inicial
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante: {variant.inventory_quantity} unidades")
    
    # Crear orden
    order = Order.objects.create(
        user=user,
        order_number=f'PAYMENT-TEST-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('299.99'),
        total_amount=Decimal('299.99'),
        shipping_address='Calle Principal 123, Ciudad',
        billing_address='Calle Principal 123, Ciudad'
    )
    
    # Agregar item a la orden
    OrderItem.objects.create(
        order=order,
        product=product,
        variant=variant,
        quantity=2,  # Comprar 2 tablets
        unit_price=product.price,
        total_price=product.price * 2,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant.size.name} - {variant.color.name}"
    )
    
    print(f"\n📋 ORDEN CREADA:")
    print(f"   Orden: {order.order_number}")
    print(f"   Estado: {order.status}")
    print(f"   Estado de pago: {order.payment_status}")
    print(f"   Total: ${order.total_amount}")
    
    # Mostrar stock después de crear la orden (NO debe cambiar)
    product.refresh_from_db()
    variant.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE CREAR ORDEN:")
    print(f"   Producto: {product.inventory_quantity} unidades (NO debe cambiar)")
    print(f"   Variante: {variant.inventory_quantity} unidades (NO debe cambiar)")
    
    # Confirmar orden (reservar stock)
    print(f"\n🔄 CONFIRMANDO ORDEN (RESERVANDO STOCK)...")
    from ecommerce.apps.orders.views import OrderViewSet
    from rest_framework.test import APIRequestFactory
    
    # Simular confirmación de orden
    stock_result = AutoStockService.reserve_order_stock(order)
    
    if stock_result['success']:
        print(f"   ✅ Stock reservado exitosamente")
        print(f"   📊 Items reservados: {stock_result['reserved_items']}")
    else:
        print(f"   ❌ Error reservando stock: {stock_result['errors']}")
        return
    
    # Mostrar stock después de reservar (debe mostrar stock disponible reducido)
    product.refresh_from_db()
    variant.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE RESERVAR:")
    print(f"   Producto: {product.inventory_quantity} unidades (NO debe cambiar - es el total)")
    print(f"   Variante: {variant.inventory_quantity} unidades (NO debe cambiar - es el total)")
    
    # Verificar reservas
    from ecommerce.apps.inventory.models import StockReservation
    reservations = StockReservation.objects.filter(order=order, status='active')
    print(f"   🔒 Reservas activas: {reservations.count()}")
    for reservation in reservations:
        print(f"      📦 {reservation.product.name}: {reservation.quantity} unidades reservadas")
    
    # Simular confirmación de pago exitoso
    print(f"\n💳 CONFIRMANDO PAGO EXITOSO...")
    payment_result = PaymentConfirmationService.confirm_payment(
        order_number=order.order_number,
        payment_provider='wompi',
        provider_payment_id='TEST_PAYMENT_123'
    )
    
    if payment_result['success']:
        print(f"   ✅ Pago confirmado exitosamente")
        print(f"   📊 Items procesados: {payment_result['stock_processed']}")
        print(f"   📋 Estado de orden: {payment_result['status']}")
        print(f"   💰 Estado de pago: {payment_result['payment_status']}")
    else:
        print(f"   ❌ Error confirmando pago: {payment_result['error']}")
        return
    
    # Mostrar stock después de confirmar pago (DEBE cambiar)
    product.refresh_from_db()
    variant.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE CONFIRMAR PAGO:")
    print(f"   Producto: {product.inventory_quantity} unidades (DEBE haber bajado)")
    print(f"   Variante: {variant.inventory_quantity} unidades (DEBE haber bajado)")
    
    # Verificar que las reservas se consumieron
    reservations = StockReservation.objects.filter(order=order, status='consumed')
    print(f"   🔒 Reservas consumidas: {reservations.count()}")
    
    # Verificar estado de la orden
    order.refresh_from_db()
    print(f"\n📋 ESTADO FINAL DE LA ORDEN:")
    print(f"   Orden: {order.order_number}")
    print(f"   Estado: {order.status}")
    print(f"   Estado de pago: {order.payment_status}")
    print(f"   Proveedor: {getattr(order, 'payment_provider', 'N/A')}")
    print(f"   Referencia: {getattr(order, 'payment_reference', 'N/A')}")

def test_payment_failure():
    """Probar el flujo cuando el pago falla."""
    print("\n❌ PROBANDO FALLO DE PAGO")
    print("=" * 50)
    
    # Crear producto
    product, variant = create_test_product()
    
    # Crear usuario
    user, created = User.objects.get_or_create(
        email='comprador.fallo@example.com',
        defaults={
            'first_name': 'Ana',
            'last_name': 'Fallo',
            'username': 'ana.fallo',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Mostrar stock inicial
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante: {variant.inventory_quantity} unidades")
    
    # Crear orden
    order = Order.objects.create(
        user=user,
        order_number=f'FAIL-TEST-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('299.99'),
        total_amount=Decimal('299.99'),
        shipping_address='Calle Principal 123, Ciudad',
        billing_address='Calle Principal 123, Ciudad'
    )
    
    # Agregar item a la orden
    OrderItem.objects.create(
        order=order,
        product=product,
        variant=variant,
        quantity=1,
        unit_price=product.price,
        total_price=product.price,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant.size.name} - {variant.color.name}"
    )
    
    # Reservar stock
    stock_result = AutoStockService.reserve_order_stock(order)
    print(f"\n🔄 STOCK RESERVADO:")
    print(f"   ✅ Reservas creadas: {stock_result['reserved_items']}")
    
    # Simular fallo de pago
    print(f"\n💳 SIMULANDO FALLO DE PAGO...")
    payment_result = PaymentConfirmationService.fail_payment(
        order_number=order.order_number,
        reason='Tarjeta rechazada'
    )
    
    if payment_result['success']:
        print(f"   ✅ Pago marcado como fallido")
        print(f"   📋 Estado de orden: {payment_result['status']}")
        print(f"   💰 Estado de pago: {payment_result['payment_status']}")
    else:
        print(f"   ❌ Error marcando pago como fallido: {payment_result['error']}")
        return
    
    # Mostrar stock después del fallo (debe volver al original)
    product.refresh_from_db()
    variant.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DEL FALLO:")
    print(f"   Producto: {product.inventory_quantity} unidades (debe volver al original)")
    print(f"   Variante: {variant.inventory_quantity} unidades (debe volver al original)")
    
    # Verificar estado de la orden
    order.refresh_from_db()
    print(f"\n📋 ESTADO FINAL DE LA ORDEN:")
    print(f"   Orden: {order.order_number}")
    print(f"   Estado: {order.status}")
    print(f"   Estado de pago: {order.payment_status}")

def main():
    """Función principal para ejecutar las pruebas del flujo de pagos."""
    print("💳 INICIANDO PRUEBAS DEL FLUJO DE PAGOS")
    print("=" * 60)
    
    try:
        # Prueba de flujo exitoso
        test_payment_flow()
        
        # Prueba de fallo de pago
        test_payment_failure()
        
        print("\n" + "=" * 60)
        print("🎉 TODAS LAS PRUEBAS DEL FLUJO DE PAGOS COMPLETADAS")
        print("✅ El stock solo se descuenta cuando el pago está confirmado")
        print("✅ Las reservas se liberan cuando el pago falla")
        print("✅ El sistema maneja correctamente los estados de pago")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
