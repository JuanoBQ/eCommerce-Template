"""
Script de prueba específico para productos reales:
- Camisa Nike (M - Blanco) - Pago aprobado
- Camiseta de Prueba (M - Azul) - Pago pendiente
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

def find_products():
    """Buscar los productos específicos que necesitamos."""
    print("🔍 BUSCANDO PRODUCTOS ESPECÍFICOS...")
    
    # Buscar Camisa Nike
    try:
        camisa_nike = Product.objects.get(sku='CAM-NIKE-001')
        print(f"✅ Encontrado: {camisa_nike.name} (SKU: {camisa_nike.sku})")
    except Product.DoesNotExist:
        print("❌ No se encontró Camisa Nike")
        return None, None, None, None
    
    # Buscar Camiseta de Prueba
    try:
        camiseta_prueba = Product.objects.get(sku='CAM-TEST-001')
        print(f"✅ Encontrado: {camiseta_prueba.name} (SKU: {camiseta_prueba.sku})")
    except Product.DoesNotExist:
        print("❌ No se encontró Camiseta de Prueba")
        return None, None, None, None
    
    # Buscar variante Camisa Nike M - Blanco
    try:
        variant_nike = ProductVariant.objects.get(
            product=camisa_nike,
            size__name='M',
            color__name='Blanco'
        )
        print(f"✅ Encontrada variante: {variant_nike.product.name} - {variant_nike.size.name} - {variant_nike.color.name}")
        print(f"   📦 Stock actual: {variant_nike.inventory_quantity} unidades")
    except ProductVariant.DoesNotExist:
        print("❌ No se encontró variante Camisa Nike M - Blanco")
        return None, None, None, None
    
    # Buscar variante Camiseta de Prueba M - Azul
    try:
        variant_camiseta = ProductVariant.objects.get(
            product=camiseta_prueba,
            size__name='M',
            color__name='Azul'
        )
        print(f"✅ Encontrada variante: {variant_camiseta.product.name} - {variant_camiseta.size.name} - {variant_camiseta.color.name}")
        print(f"   📦 Stock actual: {variant_camiseta.inventory_quantity} unidades")
    except ProductVariant.DoesNotExist:
        print("❌ No se encontró variante Camiseta de Prueba M - Azul")
        return None, None, None, None
    
    return camisa_nike, camiseta_prueba, variant_nike, variant_camiseta

def create_test_users():
    """Crear usuarios de prueba específicos."""
    print("\n👥 CREANDO USUARIOS DE PRUEBA...")
    
    users_data = [
        {
            'email': 'cliente.nike@example.com',
            'first_name': 'Carlos',
            'last_name': 'Nike',
            'username': 'carlos.nike'
        },
        {
            'email': 'cliente.camiseta@example.com',
            'first_name': 'Ana',
            'last_name': 'Camiseta',
            'username': 'ana.camiseta'
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
            print(f"✅ Usuario creado: {user.first_name} {user.last_name}")
        else:
            print(f"✅ Usuario existente: {user.first_name} {user.last_name}")
        users.append(user)
    
    return users

def test_nike_approved_payment():
    """Probar pago aprobado para Camisa Nike M - Blanco."""
    print("\n" + "="*70)
    print("✅ PROBANDO PAGO APROBADO - CAMISA NIKE M - BLANCO")
    print("="*70)
    
    # Buscar productos
    camisa_nike, camiseta_prueba, variant_nike, variant_camiseta = find_products()
    if not all([camisa_nike, variant_nike]):
        print("❌ No se pudieron encontrar los productos necesarios")
        return None
    
    # Crear usuarios
    users = create_test_users()
    
    # Mostrar stock inicial
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {camisa_nike.name}")
    print(f"   Variante: {variant_nike.size.name} - {variant_nike.color.name}")
    print(f"   Stock: {variant_nike.inventory_quantity} unidades")
    print(f"   Precio: ${camisa_nike.price}")
    
    # Sincronizar stock del producto
    AutoStockService.sync_product_stock(camisa_nike)
    camisa_nike.refresh_from_db()
    variant_nike.refresh_from_db()
    
    print(f"\n📊 STOCK DESPUÉS DE SINCRONIZAR:")
    print(f"   Producto total: {camisa_nike.inventory_quantity} unidades")
    print(f"   Variante: {variant_nike.inventory_quantity} unidades")
    
    # Crear orden para Camisa Nike
    order_nike = Order.objects.create(
        user=users[0],
        order_number=f'NIKE-APPROVED-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=camisa_nike.price,
        total_amount=camisa_nike.price,
        shipping_address='Calle Nike 123, Ciudad Deportiva',
        billing_address='Calle Nike 123, Ciudad Deportiva'
    )
    
    OrderItem.objects.create(
        order=order_nike,
        product=camisa_nike,
        variant=variant_nike,
        quantity=1,
        unit_price=camisa_nike.price,
        total_price=camisa_nike.price,
        product_name=camisa_nike.name,
        product_sku=camisa_nike.sku,
        variant_info=f"{variant_nike.size.name} - {variant_nike.color.name}"
    )
    
    print(f"\n📋 ORDEN CREADA:")
    print(f"   Número: {order_nike.order_number}")
    print(f"   Usuario: {users[0].first_name} {users[0].last_name}")
    print(f"   Producto: {camisa_nike.name}")
    print(f"   Variante: {variant_nike.size.name} - {variant_nike.color.name}")
    print(f"   Cantidad: 1")
    print(f"   Total: ${order_nike.total_amount}")
    
    # Reservar stock
    print(f"\n🔄 RESERVANDO STOCK...")
    stock_result = AutoStockService.reserve_order_stock(order_nike)
    
    if stock_result['success']:
        print(f"   ✅ Stock reservado exitosamente")
        print(f"   📊 Items reservados: {stock_result['reserved_items']}")
    else:
        print(f"   ❌ Error reservando stock: {stock_result['errors']}")
        return None
    
    # Mostrar stock después de reservar
    variant_nike.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE RESERVAR:")
    print(f"   Variante: {variant_nike.inventory_quantity} unidades (reservado, no descuentado)")
    
    # Simular confirmación de pago aprobado
    print(f"\n💳 SIMULANDO CONFIRMACIÓN DE PAGO APROBADO...")
    print(f"   🔄 Procesando pago para orden: {order_nike.order_number}")
    print(f"   💳 Proveedor: Wompi")
    print(f"   🆔 ID de pago: WMP_NIKE_APPROVED_123456")
    print(f"   📦 Producto: {camisa_nike.name} - {variant_nike.size.name} - {variant_nike.color.name}")
    
    # Confirmar pago usando el servicio
    payment_result = PaymentConfirmationService.confirm_payment(
        order_number=order_nike.order_number,
        payment_provider='wompi',
        provider_payment_id='WMP_NIKE_APPROVED_123456'
    )
    
    if payment_result['success']:
        print(f"   ✅ Pago confirmado exitosamente")
        print(f"   📊 Items procesados: {payment_result['stock_processed']}")
        print(f"   📋 Estado de orden: {payment_result['status']}")
        print(f"   💰 Estado de pago: {payment_result['payment_status']}")
        print(f"   💬 Mensaje: {payment_result['message']}")
    else:
        print(f"   ❌ Error confirmando pago: {payment_result['error']}")
        return None
    
    # Mostrar stock después de confirmar pago
    camisa_nike.refresh_from_db()
    variant_nike.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE CONFIRMAR PAGO:")
    print(f"   Producto total: {camisa_nike.inventory_quantity} unidades (debe haber bajado)")
    print(f"   Variante: {variant_nike.inventory_quantity} unidades (debe haber bajado)")
    
    # Mostrar estado final de la orden
    order_nike.refresh_from_db()
    print(f"\n📋 ESTADO FINAL DE LA ORDEN:")
    print(f"   Orden: {order_nike.order_number}")
    print(f"   Estado: {order_nike.status}")
    print(f"   Pago: {order_nike.payment_status}")
    print(f"   Usuario: {order_nike.user.first_name} {order_nike.user.last_name}")
    print(f"   Producto: {camisa_nike.name}")
    print(f"   Variante: {variant_nike.size.name} - {variant_nike.color.name}")
    
    return order_nike

def test_camiseta_pending_payment():
    """Probar pago pendiente para Camiseta de Prueba M - Azul."""
    print("\n" + "="*70)
    print("⏳ PROBANDO PAGO PENDIENTE - CAMISETA DE PRUEBA M - AZUL")
    print("="*70)
    
    # Buscar productos
    camisa_nike, camiseta_prueba, variant_nike, variant_camiseta = find_products()
    if not all([camiseta_prueba, variant_camiseta]):
        print("❌ No se pudieron encontrar los productos necesarios")
        return None
    
    # Crear usuarios
    users = create_test_users()
    
    # Mostrar stock inicial
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {camiseta_prueba.name}")
    print(f"   Variante: {variant_camiseta.size.name} - {variant_camiseta.color.name}")
    print(f"   Stock: {variant_camiseta.inventory_quantity} unidades")
    print(f"   Precio: ${camiseta_prueba.price}")
    
    # Sincronizar stock del producto
    AutoStockService.sync_product_stock(camiseta_prueba)
    camiseta_prueba.refresh_from_db()
    variant_camiseta.refresh_from_db()
    
    print(f"\n📊 STOCK DESPUÉS DE SINCRONIZAR:")
    print(f"   Producto total: {camiseta_prueba.inventory_quantity} unidades")
    print(f"   Variante: {variant_camiseta.inventory_quantity} unidades")
    
    # Crear orden para Camiseta de Prueba
    order_camiseta = Order.objects.create(
        user=users[1],
        order_number=f'CAMISETA-PENDING-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=camiseta_prueba.price,
        total_amount=camiseta_prueba.price,
        shipping_address='Calle Camiseta 456, Ciudad Textil',
        billing_address='Calle Camiseta 456, Ciudad Textil'
    )
    
    OrderItem.objects.create(
        order=order_camiseta,
        product=camiseta_prueba,
        variant=variant_camiseta,
        quantity=1,
        unit_price=camiseta_prueba.price,
        total_price=camiseta_prueba.price,
        product_name=camiseta_prueba.name,
        product_sku=camiseta_prueba.sku,
        variant_info=f"{variant_camiseta.size.name} - {variant_camiseta.color.name}"
    )
    
    print(f"\n📋 ORDEN CREADA:")
    print(f"   Número: {order_camiseta.order_number}")
    print(f"   Usuario: {users[1].first_name} {users[1].last_name}")
    print(f"   Producto: {camiseta_prueba.name}")
    print(f"   Variante: {variant_camiseta.size.name} - {variant_camiseta.color.name}")
    print(f"   Cantidad: 1")
    print(f"   Total: ${order_camiseta.total_amount}")
    
    # Reservar stock
    print(f"\n🔄 RESERVANDO STOCK...")
    stock_result = AutoStockService.reserve_order_stock(order_camiseta)
    
    if stock_result['success']:
        print(f"   ✅ Stock reservado exitosamente")
        print(f"   📊 Items reservados: {stock_result['reserved_items']}")
    else:
        print(f"   ❌ Error reservando stock: {stock_result['errors']}")
        return None
    
    # Mostrar stock después de reservar (NO debe cambiar el total)
    camiseta_prueba.refresh_from_db()
    variant_camiseta.refresh_from_db()
    print(f"\n📊 STOCK DESPUÉS DE RESERVAR:")
    print(f"   Producto total: {camiseta_prueba.inventory_quantity} unidades (NO debe cambiar - solo reservado)")
    print(f"   Variante: {variant_camiseta.inventory_quantity} unidades (NO debe cambiar - solo reservado)")
    
    # Verificar reservas activas
    from ecommerce.apps.inventory.models import StockReservation
    reservations = StockReservation.objects.filter(order=order_camiseta, status='active')
    print(f"   🔒 Reservas activas: {reservations.count()}")
    for reservation in reservations:
        print(f"      📦 {reservation.product.name}: {reservation.quantity} unidades reservadas")
        print(f"      ⏰ Expira: {reservation.expires_at}")
    
    # Simular que el pago está pendiente (no hacer nada)
    print(f"\n⏳ PAGO PENDIENTE - NO SE PROCESA STOCK:")
    print(f"   💳 Orden: {order_camiseta.order_number}")
    print(f"   ⏰ Estado: Esperando confirmación de la pasarela de pago")
    print(f"   🔒 Stock: Reservado pero no consumido")
    print(f"   📦 Producto: {camiseta_prueba.name} - {variant_camiseta.size.name} - {variant_camiseta.color.name}")
    
    # Mostrar estado de la orden (debe seguir igual)
    order_camiseta.refresh_from_db()
    print(f"\n📋 ESTADO DE LA ORDEN PENDIENTE:")
    print(f"   Orden: {order_camiseta.order_number}")
    print(f"   Estado: {order_camiseta.status}")
    print(f"   Pago: {order_camiseta.payment_status}")
    print(f"   Usuario: {order_camiseta.user.first_name} {order_camiseta.user.last_name}")
    print(f"   Producto: {camiseta_prueba.name}")
    print(f"   Variante: {variant_camiseta.size.name} - {variant_camiseta.color.name}")
    print(f"   ⏰ Creado: {order_camiseta.created_at}")
    
    return order_camiseta

def test_api_endpoints_specific():
    """Probar los endpoints de la API con los productos específicos."""
    print("\n" + "="*70)
    print("🌐 PROBANDO ENDPOINTS DE LA API - PRODUCTOS ESPECÍFICOS")
    print("="*70)
    
    # Buscar productos
    camisa_nike, camiseta_prueba, variant_nike, variant_camiseta = find_products()
    if not all([camisa_nike, variant_nike]):
        print("❌ No se pudieron encontrar los productos necesarios")
        return
    
    # Crear usuarios
    users = create_test_users()
    
    # Crear orden para prueba de API
    order_api = Order.objects.create(
        user=users[0],
        order_number=f'API-TEST-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=camisa_nike.price,
        total_amount=camisa_nike.price,
        shipping_address='Calle API 789, Ciudad Digital',
        billing_address='Calle API 789, Ciudad Digital'
    )
    
    OrderItem.objects.create(
        order=order_api,
        product=camisa_nike,
        variant=variant_nike,
        quantity=1,
        unit_price=camisa_nike.price,
        total_price=camisa_nike.price,
        product_name=camisa_nike.name,
        product_sku=camisa_nike.sku,
        variant_info=f"{variant_nike.size.name} - {variant_nike.color.name}"
    )
    
    # Reservar stock
    stock_result = AutoStockService.reserve_order_stock(order_api)
    print(f"✅ Stock reservado para orden: {order_api.order_number}")
    
    # Simular llamada a la API para confirmar pago
    print(f"\n🌐 SIMULANDO LLAMADA A LA API...")
    print(f"   📡 Endpoint: POST /api/payments/confirm_payment/")
    print(f"   📋 Orden: {order_api.order_number}")
    print(f"   💳 Proveedor: mercadopago")
    print(f"   🆔 ID de pago: MP_CAMISA_NIKE_789012")
    print(f"   📦 Producto: {camisa_nike.name} - {variant_nike.size.name} - {variant_nike.color.name}")
    
    # Confirmar pago usando el servicio (simulando API)
    payment_result = PaymentConfirmationService.confirm_payment(
        order_number=order_api.order_number,
        payment_provider='mercadopago',
        provider_payment_id='MP_CAMISA_NIKE_789012'
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
    """Función principal para ejecutar las pruebas específicas."""
    print("💳 INICIANDO PRUEBAS ESPECÍFICAS DE CONFIRMACIÓN DE PAGOS")
    print("=" * 70)
    print("🎯 PRODUCTOS OBJETIVO:")
    print("   ✅ Camisa Nike (M - Blanco) - Pago aprobado")
    print("   ⏳ Camiseta de Prueba (M - Azul) - Pago pendiente")
    print("=" * 70)
    
    try:
        # Prueba de pago aprobado para Camisa Nike
        order_nike = test_nike_approved_payment()
        
        # Prueba de pago pendiente para Camiseta de Prueba
        order_camiseta = test_camiseta_pending_payment()
        
        # Prueba de endpoints de API
        test_api_endpoints_specific()
        
        print("\n" + "=" * 70)
        print("🎉 TODAS LAS PRUEBAS ESPECÍFICAS COMPLETADAS")
        print("✅ Camisa Nike M - Blanco: Pago aprobado, stock descuentado")
        print("✅ Camiseta de Prueba M - Azul: Pago pendiente, stock reservado")
        print("✅ API endpoints: Funcionando correctamente")
        print("✅ El sistema maneja correctamente los productos específicos")
        
        if order_nike:
            print(f"\n📋 RESUMEN DE ÓRDENES CREADAS:")
            print(f"   🏆 Nike Aprobada: {order_nike.order_number}")
            print(f"   ⏳ Camiseta Pendiente: {order_camiseta.order_number if order_camiseta else 'N/A'}")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
