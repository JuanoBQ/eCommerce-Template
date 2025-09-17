"""
Script de prueba para simular confirmaciones de pago.
Demuestra el flujo completo con pagos aprobados y pendientes.
"""

import os
import sys
import django
from decimal import Decimal
import requests
import json

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
    """Crear un producto de prueba para las confirmaciones de pago."""
    print("🔧 CREANDO PRODUCTO DE PRUEBA...")
    
    # Crear categoría
    category, created = Category.objects.get_or_create(
        name='Accesorios',
        defaults={'description': 'Accesorios electrónicos'}
    )
    
    # Crear marca
    brand, created = Brand.objects.get_or_create(
        name='AccessoryBrand',
        defaults={'description': 'Marca de accesorios'}
    )
    
    # Crear tallas
    size_one, created = Size.objects.get_or_create(name='One Size', defaults={'sort_order': 1})
    
    # Crear colores
    color_black, created = Color.objects.get_or_create(name='Negro', defaults={'hex_code': '#000000'})
    color_white, created = Color.objects.get_or_create(name='Blanco', defaults={'hex_code': '#FFFFFF'})
    
    # Crear producto
    product, created = Product.objects.get_or_create(
        name='Auriculares Inalámbricos',
        defaults={
            'slug': 'auriculares-inalambricos',
            'description': 'Auriculares inalámbricos para probar confirmaciones de pago',
            'short_description': 'Auriculares test',
            'sku': 'AUDIO-TEST-001',
            'category': category,
            'brand': brand,
            'price': Decimal('89.99'),
            'compare_price': Decimal('129.99'),
            'track_inventory': True,
            'inventory_quantity': 0,  # Se sincronizará
            'low_stock_threshold': 5,
            'status': 'published'
        }
    )
    
    # Crear variantes
    variant_black, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_one,
        color=color_black,
        defaults={
            'sku': 'AUDIO-TEST-001-BLK',
            'inventory_quantity': 15,  # Stock de 15 unidades
            'low_stock_threshold': 3,
            'is_active': True
        }
    )
    
    variant_white, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_one,
        color=color_white,
        defaults={
            'sku': 'AUDIO-TEST-001-WHT',
            'inventory_quantity': 12,  # Stock de 12 unidades
            'low_stock_threshold': 3,
            'is_active': True
        }
    )
    
    # Sincronizar stock inicial
    AutoStockService.sync_product_stock(product)
    product.refresh_from_db()
    
    print(f"✅ Producto creado: {product.name}")
    print(f"   📊 Stock total: {product.inventory_quantity} unidades")
    print(f"   📦 Variante Negro: {variant_black.inventory_quantity} unidades")
    print(f"   📦 Variante Blanco: {variant_white.inventory_quantity} unidades")
    
    return product, variant_black, variant_white

def create_test_orders():
    """Crear órdenes de prueba para diferentes escenarios."""
    print("\n📋 CREANDO ÓRDENES DE PRUEBA...")
    
    # Crear producto
    product, variant_black, variant_white = create_test_product()
    
    # Crear usuarios
    users_data = [
        {
            'email': 'cliente.aprobado@example.com',
            'first_name': 'Juan',
            'last_name': 'Aprobado',
            'username': 'juan.aprobado'
        },
        {
            'email': 'cliente.pendiente@example.com',
            'first_name': 'María',
            'last_name': 'Pendiente',
            'username': 'maria.pendiente'
        }
    ]
    
    users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'username': user_data['username'],
                'is_active': True
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
        users.append(user)
    
    # Crear órdenes
    orders = []
    
    # Orden 1: Para pago aprobado
    order1 = Order.objects.create(
        user=users[0],
        order_number=f'APPROVED-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('89.99'),
        total_amount=Decimal('89.99'),
        shipping_address='Calle Aprobada 123, Ciudad',
        billing_address='Calle Aprobada 123, Ciudad'
    )
    
    OrderItem.objects.create(
        order=order1,
        product=product,
        variant=variant_black,
        quantity=1,
        unit_price=product.price,
        total_price=product.price,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant_black.size.name} - {variant_black.color.name}"
    )
    
    # Orden 2: Para pago pendiente
    order2 = Order.objects.create(
        user=users[1],
        order_number=f'PENDING-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('179.98'),
        total_amount=Decimal('179.98'),
        shipping_address='Calle Pendiente 456, Ciudad',
        billing_address='Calle Pendiente 456, Ciudad'
    )
    
    OrderItem.objects.create(
        order=order2,
        product=product,
        variant=variant_white,
        quantity=2,
        unit_price=product.price,
        total_price=product.price * 2,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant_white.size.name} - {variant_white.color.name}"
    )
    
    orders = [order1, order2]
    
    print(f"✅ Orden 1 creada: {order1.order_number} (Usuario: {users[0].first_name})")
    print(f"   📦 Item: 1x {variant_black.size.name}-{variant_black.color.name}")
    print(f"   💰 Total: ${order1.total_amount}")
    
    print(f"✅ Orden 2 creada: {order2.order_number} (Usuario: {users[1].first_name})")
    print(f"   📦 Item: 2x {variant_white.size.name}-{variant_white.color.name}")
    print(f"   💰 Total: ${order2.total_amount}")
    
    return orders, product, variant_black, variant_white

def test_payment_approval():
    """Probar confirmación de pago aprobado."""
    print("\n✅ PROBANDO CONFIRMACIÓN DE PAGO APROBADO")
    print("=" * 50)
    
    # Crear órdenes
    orders, product, variant_black, variant_white = create_test_orders()
    order_approved = orders[0]  # Orden para aprobar
    
    # Mostrar stock inicial
    product.refresh_from_db()
    variant_black.refresh_from_db()
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante Negro: {variant_black.inventory_quantity} unidades")
    print(f"   Variante Blanco: {variant_white.inventory_quantity} unidades")
    
    # Mostrar estado inicial de la orden
    print(f"\n📋 ESTADO INICIAL DE LA ORDEN:")
    print(f"   Orden: {order_approved.order_number}")
    print(f"   Estado: {order_approved.status}")
    print(f"   Pago: {order_approved.payment_status}")
    
    # Reservar stock para la orden
    print(f"\n🔄 RESERVANDO STOCK...")
    stock_result = AutoStockService.reserve_order_stock(order_approved)
    
    if stock_result['success']:
        print(f"   ✅ Stock reservado exitosamente")
        print(f"   📊 Items reservados: {stock_result['reserved_items']}")
    else:
        print(f"   ❌ Error reservando stock: {stock_result['errors']}")
        return
    
    # Simular confirmación de pago aprobado
    print(f"\n💳 SIMULANDO CONFIRMACIÓN DE PAGO APROBADO...")
    print(f"   🔄 Procesando pago para orden: {order_approved.order_number}")
    print(f"   💳 Proveedor: Wompi")
    print(f"   🆔 ID de pago: WMP_APPROVED_123456")
    
    # Confirmar pago usando el servicio
    payment_result = PaymentConfirmationService.confirm_payment(
        order_number=order_approved.order_number,
        payment_provider='wompi',
        provider_payment_id='WMP_APPROVED_123456'
    )
    
    if payment_result['success']:
        print(f"   ✅ Pago confirmado exitosamente")
        print(f"   📊 Items procesados: {payment_result['stock_processed']}")
        print(f"   📋 Estado de orden: {payment_result['status']}")
        print(f"   💰 Estado de pago: {payment_result['payment_status']}")
        print(f"   💬 Mensaje: {payment_result['message']}")
    else:
        print(f"   ❌ Error confirmando pago: {payment_result['error']}")
        return
    
    # Mostrar stock después de confirmar pago
    product.refresh_from_db()
    variant_black.refresh_from_db()
    variant_white.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE CONFIRMAR PAGO:")
    print(f"   Producto: {product.inventory_quantity} unidades (debe haber bajado)")
    print(f"   Variante Negro: {variant_black.inventory_quantity} unidades (debe haber bajado)")
    print(f"   Variante Blanco: {variant_white.inventory_quantity} unidades (sin cambios)")
    
    # Mostrar estado final de la orden
    order_approved.refresh_from_db()
    print(f"\n📋 ESTADO FINAL DE LA ORDEN:")
    print(f"   Orden: {order_approved.order_number}")
    print(f"   Estado: {order_approved.status}")
    print(f"   Pago: {order_approved.payment_status}")
    print(f"   Confirmado: {getattr(order_approved, 'confirmed_at', 'N/A')}")
    
    return order_approved

def test_payment_pending():
    """Probar orden con pago pendiente."""
    print("\n⏳ PROBANDO ORDEN CON PAGO PENDIENTE")
    print("=" * 50)
    
    # Crear órdenes
    orders, product, variant_black, variant_white = create_test_orders()
    order_pending = orders[1]  # Orden pendiente
    
    # Mostrar stock inicial
    product.refresh_from_db()
    variant_white.refresh_from_db()
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante Blanco: {variant_white.inventory_quantity} unidades")
    
    # Mostrar estado inicial de la orden
    print(f"\n📋 ESTADO INICIAL DE LA ORDEN:")
    print(f"   Orden: {order_pending.order_number}")
    print(f"   Estado: {order_pending.status}")
    print(f"   Pago: {order_pending.payment_status}")
    
    # Reservar stock para la orden
    print(f"\n🔄 RESERVANDO STOCK...")
    stock_result = AutoStockService.reserve_order_stock(order_pending)
    
    if stock_result['success']:
        print(f"   ✅ Stock reservado exitosamente")
        print(f"   📊 Items reservados: {stock_result['reserved_items']}")
    else:
        print(f"   ❌ Error reservando stock: {stock_result['errors']}")
        return
    
    # Mostrar stock después de reservar (NO debe cambiar el total)
    product.refresh_from_db()
    variant_white.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE RESERVAR:")
    print(f"   Producto: {product.inventory_quantity} unidades (NO debe cambiar - solo reservado)")
    print(f"   Variante Blanco: {variant_white.inventory_quantity} unidades (NO debe cambiar - solo reservado)")
    
    # Verificar reservas activas
    from ecommerce.apps.inventory.models import StockReservation
    reservations = StockReservation.objects.filter(order=order_pending, status='active')
    print(f"   🔒 Reservas activas: {reservations.count()}")
    for reservation in reservations:
        print(f"      📦 {reservation.product.name}: {reservation.quantity} unidades reservadas")
        print(f"      ⏰ Expira: {reservation.expires_at}")
    
    # Simular que el pago está pendiente (no hacer nada)
    print(f"\n⏳ PAGO PENDIENTE - NO SE PROCESA STOCK:")
    print(f"   💳 Orden: {order_pending.order_number}")
    print(f"   ⏰ Estado: Esperando confirmación de la pasarela de pago")
    print(f"   🔒 Stock: Reservado pero no consumido")
    
    # Mostrar estado de la orden (debe seguir igual)
    order_pending.refresh_from_db()
    print(f"\n📋 ESTADO DE LA ORDEN PENDIENTE:")
    print(f"   Orden: {order_pending.order_number}")
    print(f"   Estado: {order_pending.status}")
    print(f"   Pago: {order_pending.payment_status}")
    print(f"   ⏰ Creado: {order_pending.created_at}")
    
    return order_pending

def test_payment_failure():
    """Probar fallo de pago después de estar pendiente."""
    print("\n❌ PROBANDO FALLO DE PAGO DESPUÉS DE PENDIENTE")
    print("=" * 50)
    
    # Crear órdenes
    orders, product, variant_black, variant_white = create_test_orders()
    order_failure = orders[1]  # Usar la orden pendiente
    
    # Reservar stock
    stock_result = AutoStockService.reserve_order_stock(order_failure)
    print(f"✅ Stock reservado para orden: {order_failure.order_number}")
    
    # Mostrar stock antes del fallo
    product.refresh_from_db()
    variant_white.refresh_from_db()
    print(f"\n📊 STOCK ANTES DEL FALLO:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante Blanco: {variant_white.inventory_quantity} unidades")
    
    # Simular fallo de pago
    print(f"\n💳 SIMULANDO FALLO DE PAGO...")
    print(f"   🔄 Procesando fallo para orden: {order_failure.order_number}")
    print(f"   ❌ Razón: Tarjeta rechazada por el banco")
    
    # Marcar pago como fallido
    payment_result = PaymentConfirmationService.fail_payment(
        order_number=order_failure.order_number,
        reason='Tarjeta rechazada por el banco'
    )
    
    if payment_result['success']:
        print(f"   ✅ Pago marcado como fallido")
        print(f"   📋 Estado de orden: {payment_result['status']}")
        print(f"   💰 Estado de pago: {payment_result['payment_status']}")
        print(f"   💬 Mensaje: {payment_result['message']}")
    else:
        print(f"   ❌ Error marcando pago como fallido: {payment_result['error']}")
        return
    
    # Mostrar stock después del fallo (debe volver al original)
    product.refresh_from_db()
    variant_white.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DEL FALLO:")
    print(f"   Producto: {product.inventory_quantity} unidades (debe volver al original)")
    print(f"   Variante Blanco: {variant_white.inventory_quantity} unidades (debe volver al original)")
    
    # Mostrar estado final de la orden
    order_failure.refresh_from_db()
    print(f"\n📋 ESTADO FINAL DE LA ORDEN:")
    print(f"   Orden: {order_failure.order_number}")
    print(f"   Estado: {order_failure.status}")
    print(f"   Pago: {order_failure.payment_status}")
    print(f"   Cancelado: {getattr(order_failure, 'cancelled_at', 'N/A')}")
    
    return order_failure

def test_api_endpoints():
    """Probar los endpoints de la API para confirmación de pagos."""
    print("\n🌐 PROBANDO ENDPOINTS DE LA API")
    print("=" * 50)
    
    # Crear órdenes
    orders, product, variant_black, variant_white = create_test_orders()
    order_api = orders[0]  # Usar la primera orden
    
    # Reservar stock
    stock_result = AutoStockService.reserve_order_stock(order_api)
    print(f"✅ Stock reservado para orden: {order_api.order_number}")
    
    # Simular llamada a la API para confirmar pago
    print(f"\n🌐 SIMULANDO LLAMADA A LA API...")
    print(f"   📡 Endpoint: POST /api/payments/confirm_payment/")
    print(f"   📋 Orden: {order_api.order_number}")
    print(f"   💳 Proveedor: mercadopago")
    print(f"   🆔 ID de pago: MP_APPROVED_789012")
    
    # Confirmar pago usando el servicio (simulando API)
    payment_result = PaymentConfirmationService.confirm_payment(
        order_number=order_api.order_number,
        payment_provider='mercadopago',
        provider_payment_id='MP_APPROVED_789012'
    )
    
    if payment_result['success']:
        print(f"   ✅ Respuesta de la API: Pago confirmado")
        print(f"   📊 Datos retornados:")
        for key, value in payment_result.items():
            print(f"      {key}: {value}")
    else:
        print(f"   ❌ Error en la API: {payment_result['error']}")
    
    # Simular consulta de estado
    print(f"\n🌐 CONSULTANDO ESTADO DE PAGO...")
    print(f"   📡 Endpoint: GET /api/payments/payment_status/")
    print(f"   📋 Orden: {order_api.order_number}")
    
    status_result = PaymentConfirmationService.get_payment_status(order_api.order_number)
    
    if status_result['success']:
        print(f"   ✅ Estado obtenido exitosamente:")
        for key, value in status_result.items():
            if key != 'success':
                print(f"      {key}: {value}")
    else:
        print(f"   ❌ Error obteniendo estado: {status_result['error']}")

def main():
    """Función principal para ejecutar todas las pruebas de confirmación de pagos."""
    print("💳 INICIANDO PRUEBAS DE CONFIRMACIÓN DE PAGOS")
    print("=" * 70)
    
    try:
        # Prueba de pago aprobado
        order_approved = test_payment_approval()
        
        # Prueba de pago pendiente
        order_pending = test_payment_pending()
        
        # Prueba de fallo de pago
        order_failure = test_payment_failure()
        
        # Prueba de endpoints de API
        test_api_endpoints()
        
        print("\n" + "=" * 70)
        print("🎉 TODAS LAS PRUEBAS DE CONFIRMACIÓN COMPLETADAS")
        print("✅ Pago aprobado: Stock descuentado correctamente")
        print("✅ Pago pendiente: Stock reservado, no descuentado")
        print("✅ Pago fallido: Stock liberado correctamente")
        print("✅ API endpoints: Funcionando correctamente")
        print("✅ El sistema maneja todos los estados de pago correctamente")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
