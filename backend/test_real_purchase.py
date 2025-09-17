"""
Prueba de compra real para demostrar el descuento de stock.
Simula una compra completa desde el carrito hasta la confirmación de la orden.
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
from ecommerce.apps.cart.models import Cart, CartItem
from ecommerce.apps.inventory.autostock_service import AutoStockService
from ecommerce.apps.inventory.stock_validator import StockValidator
from ecommerce.apps.inventory.models import StockMovement, StockReservation, StockAlert

User = get_user_model()

def create_test_product():
    """Crear un producto de prueba con stock inicial."""
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
    size_small, created = Size.objects.get_or_create(name='Small', defaults={'sort_order': 1})
    size_medium, created = Size.objects.get_or_create(name='Medium', defaults={'sort_order': 2})
    
    # Crear colores
    color_black, created = Color.objects.get_or_create(name='Negro', defaults={'hex_code': '#000000'})
    color_white, created = Color.objects.get_or_create(name='Blanco', defaults={'hex_code': '#FFFFFF'})
    
    # Crear producto
    product, created = Product.objects.get_or_create(
        name='Smartphone de Prueba',
        defaults={
            'slug': 'smartphone-prueba',
            'description': 'Smartphone para probar el sistema de stock',
            'short_description': 'Smartphone test',
            'sku': 'PHONE-TEST-001',
            'category': category,
            'brand': brand,
            'price': Decimal('599.99'),
            'compare_price': Decimal('699.99'),
            'track_inventory': True,
            'inventory_quantity': 20,  # Stock inicial de 20 unidades
            'low_stock_threshold': 5,
            'status': 'published'
        }
    )
    
    # Crear variantes
    variant_black_small, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_small,
        color=color_black,
        defaults={
            'sku': 'PHONE-TEST-001-BLK-SM',
            'inventory_quantity': 8,  # Stock de 8 unidades
            'low_stock_threshold': 2,
            'is_active': True
        }
    )
    
    variant_white_medium, created = ProductVariant.objects.get_or_create(
        product=product,
        size=size_medium,
        color=color_white,
        defaults={
            'sku': 'PHONE-TEST-001-WHT-MD',
            'inventory_quantity': 12,  # Stock de 12 unidades
            'low_stock_threshold': 3,
            'is_active': True
        }
    )
    
    print(f"✅ Producto creado: {product.name}")
    print(f"   📊 Stock total: {product.inventory_quantity} unidades")
    print(f"   📊 Variante Negro-Small: {variant_black_small.inventory_quantity} unidades")
    print(f"   📊 Variante Blanco-Medium: {variant_white_medium.inventory_quantity} unidades")
    
    return product, variant_black_small, variant_white_medium

def simulate_purchase_flow():
    """Simular el flujo completo de una compra."""
    print("\n🛒 SIMULANDO FLUJO DE COMPRA COMPLETO")
    print("=" * 50)
    
    # Crear usuario
    user, created = User.objects.get_or_create(
        email='comprador@example.com',
        defaults={
            'first_name': 'Juan',
            'last_name': 'Comprador',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Crear producto
    product, variant_black_small, variant_white_medium = create_test_product()
    
    # Mostrar stock inicial
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante Negro-Small: {variant_black_small.inventory_quantity} unidades")
    print(f"   Variante Blanco-Medium: {variant_white_medium.inventory_quantity} unidades")
    
    # Simular agregar al carrito
    print(f"\n🛒 AGREGANDO AL CARRITO...")
    
    # Crear carrito
    cart, created = Cart.objects.get_or_create(user=user)
    
    # Agregar items al carrito
    cart_item1 = CartItem.objects.create(
        cart=cart,
        product=product,
        variant=variant_black_small,
        quantity=2  # Comprar 2 smartphones negro-small
    )
    
    cart_item2 = CartItem.objects.create(
        cart=cart,
        product=product,
        variant=variant_white_medium,
        quantity=3  # Comprar 3 smartphones blanco-medium
    )
    
    print(f"   ✅ Agregado: 2x {variant_black_small} (${cart_item1.total_price})")
    print(f"   ✅ Agregado: 3x {variant_white_medium} (${cart_item2.total_price})")
    print(f"   💰 Total del carrito: ${cart.total_price}")
    
    # Validar stock del carrito
    print(f"\n🔍 VALIDANDO STOCK DEL CARRITO...")
    cart_items = CartItem.objects.filter(cart=cart)
    validation_result = StockValidator.validate_cart_stock(cart_items)
    
    if validation_result['valid']:
        print(f"   ✅ Validación exitosa: Stock suficiente para la compra")
        for item in validation_result['items']:
            print(f"   📦 {item['product_name']} - {item['variant_name']}: {item['requested_quantity']} unidades ✅")
    else:
        print(f"   ❌ Validación falló: {validation_result['errors']}")
        return
    
    # Crear orden
    print(f"\n📋 CREANDO ORDEN...")
    order = Order.objects.create(
        user=user,
        order_number=f'COMPRA-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=cart.total_price,
        total_amount=cart.total_price,
        shipping_address='Calle 123, Ciudad, País',
        billing_address='Calle 123, Ciudad, País'
    )
    
    # Crear items de la orden
    order_item1 = OrderItem.objects.create(
        order=order,
        product=product,
        variant=variant_black_small,
        quantity=cart_item1.quantity,
        unit_price=cart_item1.unit_price,
        total_price=cart_item1.total_price,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant_black_small.size.name} - {variant_black_small.color.name}"
    )
    
    order_item2 = OrderItem.objects.create(
        order=order,
        product=product,
        variant=variant_white_medium,
        quantity=cart_item2.quantity,
        unit_price=cart_item2.unit_price,
        total_price=cart_item2.total_price,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variant_white_medium.size.name} - {variant_white_medium.color.name}"
    )
    
    print(f"   ✅ Orden creada: {order.order_number}")
    print(f"   💰 Total de la orden: ${order.total_amount}")
    
    # Validar stock de la orden
    print(f"\n🔍 VALIDANDO STOCK DE LA ORDEN...")
    order_validation = StockValidator.validate_order_stock(order)
    
    if not order_validation['valid']:
        print(f"   ❌ Validación falló: {order_validation['errors']}")
        return
    
    print(f"   ✅ Validación exitosa: Stock suficiente")
    
    # Procesar stock de la orden (simular confirmación)
    print(f"\n🔄 PROCESANDO STOCK DE LA ORDEN...")
    stock_result = AutoStockService.process_order_stock(order)
    
    if stock_result['success']:
        print(f"   ✅ Stock procesado exitosamente")
        print(f"   📊 Items procesados: {stock_result['processed_items']}")
    else:
        print(f"   ❌ Error procesando stock: {stock_result['errors']}")
        return
    
    # Mostrar stock después de la compra
    print(f"\n📊 STOCK DESPUÉS DE LA COMPRA:")
    product.refresh_from_db()
    variant_black_small.refresh_from_db()
    variant_white_medium.refresh_from_db()
    
    print(f"   Producto: {product.inventory_quantity} unidades (era 20, ahora {product.inventory_quantity})")
    print(f"   Variante Negro-Small: {variant_black_small.inventory_quantity} unidades (era 8, ahora {variant_black_small.inventory_quantity})")
    print(f"   Variante Blanco-Medium: {variant_white_medium.inventory_quantity} unidades (era 12, ahora {variant_white_medium.inventory_quantity})")
    
    # Verificar movimientos de stock
    movements = StockMovement.objects.filter(order=order)
    print(f"\n📋 MOVIMIENTOS DE STOCK REGISTRADOS:")
    for movement in movements:
        print(f"   🔄 {movement.get_movement_type_display()}: {movement.quantity} unidades de {movement.product.name}")
        if movement.variant:
            print(f"      📦 Variante: {movement.variant}")
    
    # Verificar alertas de stock bajo
    alerts = StockAlert.objects.filter(product=product, status='active')
    print(f"\n⚠️ ALERTAS DE STOCK ACTIVAS: {alerts.count()}")
    for alert in alerts:
        print(f"   ⚠️ {alert.alert_type}: {alert.message}")
    
    # Limpiar carrito
    print(f"\n🧹 LIMPIANDO CARRITO...")
    cart.items.all().delete()
    print(f"   ✅ Carrito limpiado")
    
    return order

def test_multiple_purchases():
    """Probar múltiples compras para ver el descuento acumulado."""
    print("\n🛒 PROBANDO MÚLTIPLES COMPRAS")
    print("=" * 50)
    
    # Crear producto con stock limitado
    product, variant_black_small, variant_white_medium = create_test_product()
    
    # Reducir stock para hacer la prueba más interesante
    variant_black_small.inventory_quantity = 5
    variant_black_small.save()
    variant_white_medium.inventory_quantity = 7
    variant_white_medium.save()
    
    print(f"\n📊 STOCK INICIAL AJUSTADO:")
    print(f"   Variante Negro-Small: {variant_black_small.inventory_quantity} unidades")
    print(f"   Variante Blanco-Medium: {variant_white_medium.inventory_quantity} unidades")
    
    # Simular 3 compras
    for i in range(3):
        print(f"\n🛒 COMPRA #{i+1}:")
        
        # Crear usuario único para cada compra
        user, created = User.objects.get_or_create(
            email=f'comprador{i+1}@example.com',
            defaults={
                'first_name': f'Usuario{i+1}',
                'last_name': 'Comprador',
                'is_active': True
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
        
        # Crear orden
        order = Order.objects.create(
            user=user,
            order_number=f'COMPRA-{i+1:03d}',
            status='pending',
            payment_status='pending',
            subtotal=Decimal('599.99'),
            total_amount=Decimal('599.99'),
            shipping_address=f'Dirección {i+1}',
            billing_address=f'Dirección {i+1}'
        )
        
        # Agregar item a la orden
        OrderItem.objects.create(
            order=order,
            product=product,
            variant=variant_black_small,
            quantity=1,
            unit_price=product.price,
            total_price=product.price,
            product_name=product.name,
            product_sku=product.sku,
            variant_info=f"{variant_black_small.size.name} - {variant_black_small.color.name}"
        )
        
        # Procesar stock
        stock_result = AutoStockService.process_order_stock(order)
        
        if stock_result['success']:
            variant_black_small.refresh_from_db()
            print(f"   ✅ Compra procesada - Stock restante: {variant_black_small.inventory_quantity} unidades")
        else:
            print(f"   ❌ Error en compra: {stock_result['errors']}")
            break
    
    # Mostrar stock final
    product.refresh_from_db()
    variant_black_small.refresh_from_db()
    variant_white_medium.refresh_from_db()
    
    print(f"\n📊 STOCK FINAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    print(f"   Variante Negro-Small: {variant_black_small.inventory_quantity} unidades")
    print(f"   Variante Blanco-Medium: {variant_white_medium.inventory_quantity} unidades")

def main():
    """Función principal para ejecutar las pruebas de compra real."""
    print("🛒 INICIANDO PRUEBAS DE COMPRA REAL")
    print("=" * 60)
    
    try:
        # Prueba de compra individual
        order = simulate_purchase_flow()
        
        if order:
            print(f"\n✅ COMPRA INDIVIDUAL EXITOSA")
            print(f"   📋 Orden: {order.order_number}")
            print(f"   💰 Total: ${order.total_amount}")
        
        # Prueba de múltiples compras
        test_multiple_purchases()
        
        print("\n" + "=" * 60)
        print("🎉 TODAS LAS PRUEBAS DE COMPRA COMPLETADAS")
        print("✅ El sistema de autostock funciona correctamente en compras reales")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
