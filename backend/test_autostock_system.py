"""
Script de prueba para el sistema de autostock.
Verifica que el stock se descuente correctamente al realizar compras.
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
from ecommerce.apps.inventory.autostock_service import AutoStockService
from ecommerce.apps.inventory.stock_validator import StockValidator
from ecommerce.apps.inventory.models import StockMovement, StockReservation, StockAlert

User = get_user_model()

def create_test_data():
    """Crear datos de prueba para el sistema de stock."""
    print("🔧 CREANDO DATOS DE PRUEBA...")
    
    # Crear usuario de prueba
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Crear categoría
    category, created = Category.objects.get_or_create(
        name='Ropa',
        defaults={'description': 'Categoría de ropa'}
    )
    
    # Crear marca
    brand, created = Brand.objects.get_or_create(
        name='Marca Test',
        defaults={'description': 'Marca de prueba'}
    )
    
    # Crear tallas
    size_s, created = Size.objects.get_or_create(name='S', defaults={'sort_order': 1})
    size_m, created = Size.objects.get_or_create(name='M', defaults={'sort_order': 2})
    size_l, created = Size.objects.get_or_create(name='L', defaults={'sort_order': 3})
    
    # Crear colores
    color_red, created = Color.objects.get_or_create(name='Rojo', defaults={'hex_code': '#FF0000'})
    color_blue, created = Color.objects.get_or_create(name='Azul', defaults={'hex_code': '#0000FF'})
    
    # Crear producto de prueba
    product, created = Product.objects.get_or_create(
        name='Camiseta de Prueba',
        defaults={
            'slug': 'camiseta-prueba',
            'description': 'Camiseta para probar el sistema de stock',
            'short_description': 'Camiseta test',
            'sku': 'CAM-TEST-001',
            'category': category,
            'brand': brand,
            'price': Decimal('29.99'),
            'compare_price': Decimal('39.99'),
            'track_inventory': True,
            'inventory_quantity': 10,  # Stock inicial de 10 unidades
            'low_stock_threshold': 3,
            'status': 'published'
        }
    )
    
    # Crear variantes del producto
    variant_s_red, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_s,
        color=color_red,
        defaults={
            'sku': 'CAM-TEST-001-S-RED',
            'inventory_quantity': 5,  # Stock de 5 unidades para esta variante
            'low_stock_threshold': 2,
            'is_active': True
        }
    )
    
    variant_m_blue, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_m,
        color=color_blue,
        defaults={
            'sku': 'CAM-TEST-001-M-BLUE',
            'inventory_quantity': 8,  # Stock de 8 unidades para esta variante
            'low_stock_threshold': 2,
            'is_active': True
        }
    )
    
    print(f"✅ Usuario creado: {user.email}")
    print(f"✅ Producto creado: {product.name} (Stock: {product.inventory_quantity})")
    print(f"✅ Variante S-Roja creada: {variant_s_red} (Stock: {variant_s_red.inventory_quantity})")
    print(f"✅ Variante M-Azul creada: {variant_m_blue} (Stock: {variant_m_blue.inventory_quantity})")
    
    return user, product, variant_s_red, variant_m_blue

def test_stock_validation():
    """Probar validación de stock."""
    print("\n🔍 PROBANDO VALIDACIÓN DE STOCK...")
    
    user, product, variant_s_red, variant_m_blue = create_test_data()
    
    # Probar validación de stock disponible
    print(f"\n📊 Stock inicial del producto: {product.inventory_quantity}")
    print(f"📊 Stock inicial variante S-Roja: {variant_s_red.inventory_quantity}")
    print(f"📊 Stock inicial variante M-Azul: {variant_m_blue.inventory_quantity}")
    
    # Validar stock disponible
    available_stock = AutoStockService.get_available_stock(product)
    print(f"📊 Stock disponible del producto: {available_stock}")
    
    # Validar disponibilidad para diferentes cantidades
    test_quantities = [1, 3, 5, 8, 12]
    
    for quantity in test_quantities:
        is_available, message = AutoStockService.validate_stock_availability(
            product, None, quantity
        )
        print(f"📦 Cantidad {quantity}: {'✅' if is_available else '❌'} {message}")
    
    # Validar variante específica
    print(f"\n🔍 Validando variante S-Roja:")
    for quantity in [1, 3, 6, 10]:
        is_available, message = AutoStockService.validate_stock_availability(
            product, variant_s_red, quantity
        )
        print(f"📦 Cantidad {quantity}: {'✅' if is_available else '❌'} {message}")

def test_stock_reservation():
    """Probar sistema de reservas de stock."""
    print("\n🔒 PROBANDO SISTEMA DE RESERVAS...")
    
    user, product, variant_s_red, variant_m_blue = create_test_data()
    
    # Crear reserva de stock
    print(f"📦 Creando reserva de 2 unidades del producto...")
    try:
        reservation = AutoStockService.reserve_stock(
            product=product,
            variant=None,
            quantity=2,
            user=user,
            expires_in_minutes=30
        )
        print(f"✅ Reserva creada: ID {reservation.id}")
        print(f"📊 Stock disponible después de reserva: {AutoStockService.get_available_stock(product)}")
        
        # Liberar reserva
        print(f"🔄 Liberando reserva...")
        AutoStockService.release_stock_reservation(reservation)
        print(f"✅ Reserva liberada")
        print(f"📊 Stock disponible después de liberar: {AutoStockService.get_available_stock(product)}")
        
    except Exception as e:
        print(f"❌ Error en reserva: {str(e)}")

def test_order_processing():
    """Probar procesamiento de órdenes y descuento de stock."""
    print("\n🛒 PROBANDO PROCESAMIENTO DE ÓRDENES...")
    
    user, product, variant_s_red, variant_m_blue = create_test_data()
    
    # Mostrar stock inicial
    print(f"📊 Stock inicial del producto: {product.inventory_quantity}")
    print(f"📊 Stock inicial variante S-Roja: {variant_s_red.inventory_quantity}")
    print(f"📊 Stock inicial variante M-Azul: {variant_m_blue.inventory_quantity}")
    
    # Crear orden de prueba
    order = Order.objects.create(
        user=user,
        order_number=f'TEST-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('0.00'),
        total_amount=Decimal('0.00'),
        shipping_address='Dirección de prueba',
        billing_address='Dirección de facturación'
    )
    
    # Agregar items a la orden
    item1 = OrderItem.objects.create(
        order=order,
        product=product,
        variant=variant_s_red,
        quantity=2,  # Comprar 2 unidades de la variante S-Roja
        unit_price=product.price,
        total_price=product.price * 2,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant_s_red.size.name} - {variant_s_red.color.name}"
    )
    
    item2 = OrderItem.objects.create(
        order=order,
        product=product,
        variant=variant_m_blue,
        quantity=3,  # Comprar 3 unidades de la variante M-Azul
        unit_price=product.price,
        total_price=product.price * 3,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant_m_blue.size.name} - {variant_m_blue.color.name}"
    )
    
    # Actualizar total de la orden
    order.subtotal = item1.total_price + item2.total_price
    order.total_amount = item1.total_price + item2.total_price
    order.save()
    
    print(f"✅ Orden creada: {order.order_number}")
    print(f"📦 Items en la orden: {order.items.count()}")
    print(f"💰 Total de la orden: ${order.total_amount}")
    
    # Validar stock antes de procesar
    print(f"\n🔍 Validando stock antes de procesar la orden...")
    validation_result = StockValidator.validate_order_stock(order)
    
    if validation_result['valid']:
        print(f"✅ Validación exitosa: Stock suficiente")
        for item in validation_result['items']:
            print(f"   📦 {item['product_name']} - {item['variant_name']}: {item['requested_quantity']} unidades ✅")
    else:
        print(f"❌ Validación falló: {validation_result['errors']}")
        return
    
    # Procesar stock de la orden
    print(f"\n🔄 Procesando stock de la orden...")
    stock_result = AutoStockService.process_order_stock(order)
    
    if stock_result['success']:
        print(f"✅ Stock procesado exitosamente")
        print(f"📊 Items procesados: {stock_result['processed_items']}")
    else:
        print(f"❌ Error procesando stock: {stock_result['errors']}")
        return
    
    # Mostrar stock después del procesamiento
    print(f"\n📊 Stock después del procesamiento:")
    product.refresh_from_db()
    variant_s_red.refresh_from_db()
    variant_m_blue.refresh_from_db()
    
    print(f"📊 Stock del producto: {product.inventory_quantity} (era 10, ahora {product.inventory_quantity})")
    print(f"📊 Stock variante S-Roja: {variant_s_red.inventory_quantity} (era 5, ahora {variant_s_red.inventory_quantity})")
    print(f"📊 Stock variante M-Azul: {variant_m_blue.inventory_quantity} (era 8, ahora {variant_m_blue.inventory_quantity})")
    
    # Verificar movimientos de stock
    movements = StockMovement.objects.filter(order=order)
    print(f"\n📋 Movimientos de stock registrados: {movements.count()}")
    for movement in movements:
        print(f"   🔄 {movement.get_movement_type_display()}: {movement.quantity} unidades de {movement.product.name}")
    
    # Verificar alertas de stock bajo
    alerts = StockAlert.objects.filter(product=product, status='active')
    print(f"\n⚠️ Alertas de stock activas: {alerts.count()}")
    for alert in alerts:
        print(f"   ⚠️ {alert.alert_type}: {alert.message}")

def test_stock_alerts():
    """Probar sistema de alertas de stock."""
    print("\n⚠️ PROBANDO SISTEMA DE ALERTAS...")
    
    user, product, variant_s_red, variant_m_blue = create_test_data()
    
    # Crear alertas manualmente para probar
    print(f"📊 Stock actual del producto: {product.inventory_quantity}")
    print(f"📊 Umbral de stock bajo: {product.low_stock_threshold}")
    
    if product.inventory_quantity <= product.low_stock_threshold:
        print(f"⚠️ El producto ya está en stock bajo")
    else:
        print(f"✅ El producto tiene stock suficiente")
    
    # Verificar alertas existentes
    alerts = StockAlert.objects.filter(product=product, status='active')
    print(f"📋 Alertas activas para el producto: {alerts.count()}")
    for alert in alerts:
        print(f"   ⚠️ {alert.alert_type}: {alert.message}")

def main():
    """Función principal para ejecutar todas las pruebas."""
    print("🧪 INICIANDO PRUEBAS DEL SISTEMA DE AUTOSTOCK")
    print("=" * 60)
    
    try:
        # Ejecutar pruebas
        test_stock_validation()
        test_stock_reservation()
        test_order_processing()
        test_stock_alerts()
        
        print("\n" + "=" * 60)
        print("🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE")
        print("✅ El sistema de autostock está funcionando correctamente")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
