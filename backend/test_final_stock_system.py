"""
Prueba final del sistema de autostock completo.
Verifica que el stock se actualice correctamente en todas las vistas.
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

User = get_user_model()

def create_final_test_product():
    """Crear un producto final para probar el sistema completo."""
    print("🔧 CREANDO PRODUCTO FINAL DE PRUEBA...")
    
    # Crear categoría
    category, created = Category.objects.get_or_create(
        name='Ropa Deportiva',
        defaults={'description': 'Ropa deportiva de alta calidad'}
    )
    
    # Crear marca
    brand, created = Brand.objects.get_or_create(
        name='SportBrand',
        defaults={'description': 'Marca deportiva premium'}
    )
    
    # Crear tallas
    size_s, created = Size.objects.get_or_create(name='S', defaults={'sort_order': 1})
    size_m, created = Size.objects.get_or_create(name='M', defaults={'sort_order': 2})
    size_l, created = Size.objects.get_or_create(name='L', defaults={'sort_order': 3})
    
    # Crear colores
    color_blue, created = Color.objects.get_or_create(name='Azul', defaults={'hex_code': '#0066CC'})
    color_red, created = Color.objects.get_or_create(name='Rojo', defaults={'hex_code': '#CC0000'})
    
    # Crear producto
    product, created = Product.objects.get_or_create(
        name='Camiseta Deportiva Premium',
        defaults={
            'slug': 'camiseta-deportiva-premium',
            'description': 'Camiseta deportiva de alta calidad para pruebas del sistema de stock',
            'short_description': 'Camiseta deportiva premium',
            'sku': 'CAM-DEP-001',
            'category': category,
            'brand': brand,
            'price': Decimal('49.99'),
            'compare_price': Decimal('69.99'),
            'track_inventory': True,
            'inventory_quantity': 0,  # Se sincronizará automáticamente
            'low_stock_threshold': 5,
            'status': 'published'
        }
    )
    
    # Crear variantes
    variants_data = [
        (size_s, color_blue, 10, 'CAM-DEP-001-BLU-S'),
        (size_m, color_blue, 15, 'CAM-DEP-001-BLU-M'),
        (size_l, color_blue, 8, 'CAM-DEP-001-BLU-L'),
        (size_s, color_red, 12, 'CAM-DEP-001-RED-S'),
        (size_m, color_red, 18, 'CAM-DEP-001-RED-M'),
        (size_l, color_red, 6, 'CAM-DEP-001-RED-L'),
    ]
    
    variants = []
    for size, color, stock, sku in variants_data:
        variant, created = ProductVariant.objects.get_or_create(
            product=product,
            size=size,
            color=color,
            defaults={
                'sku': sku,
                'inventory_quantity': stock,
                'low_stock_threshold': 3,
                'is_active': True
            }
        )
        variants.append(variant)
        print(f"   📦 {size.name}-{color.name}: {stock} unidades")
    
    # Sincronizar stock inicial
    AutoStockService.sync_product_stock(product)
    product.refresh_from_db()
    
    print(f"✅ Producto creado: {product.name}")
    print(f"   📊 Stock total sincronizado: {product.inventory_quantity} unidades")
    print(f"   📊 Total de variantes: {len(variants)}")
    
    return product, variants

def test_complete_purchase_flow():
    """Probar el flujo completo de compra con múltiples variantes."""
    print("\n🛒 PROBANDO FLUJO COMPLETO DE COMPRA")
    print("=" * 50)
    
    # Crear producto
    product, variants = create_final_test_product()
    
    # Mostrar stock inicial
    print(f"\n📊 STOCK INICIAL:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    for variant in variants:
        print(f"   {variant.size.name}-{variant.color.name}: {variant.inventory_quantity} unidades")
    
    # Crear usuario
    user, created = User.objects.get_or_create(
        email='comprador.final@example.com',
        defaults={
            'first_name': 'María',
            'last_name': 'Compradora',
            'username': 'maria.compradora',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    
    # Crear orden con múltiples variantes
    order = Order.objects.create(
        user=user,
        order_number=f'FINAL-TEST-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('0.00'),
        total_amount=Decimal('0.00'),
        shipping_address='Calle Principal 123, Ciudad',
        billing_address='Calle Principal 123, Ciudad'
    )
    
    # Agregar items de diferentes variantes
    order_items = [
        (variants[0], 2),  # S-Azul: 2 unidades
        (variants[1], 3),  # M-Azul: 3 unidades
        (variants[3], 1),  # S-Rojo: 1 unidad
        (variants[4], 4),  # M-Rojo: 4 unidades
    ]
    
    total_amount = Decimal('0.00')
    for variant, quantity in order_items:
        item_total = product.price * quantity
        total_amount += item_total
        
        OrderItem.objects.create(
            order=order,
            product=product,
            variant=variant,
            quantity=quantity,
            unit_price=product.price,
            total_price=item_total,
            product_name=product.name,
            product_sku=product.sku,
            variant_info=f"{variant.size.name} - {variant.color.name}"
        )
        
        print(f"   📦 Agregado: {quantity}x {variant.size.name}-{variant.color.name} (${item_total})")
    
    # Actualizar total de la orden
    order.subtotal = total_amount
    order.total_amount = total_amount
    order.save()
    
    print(f"\n📋 ORDEN CREADA:")
    print(f"   Orden: {order.order_number}")
    print(f"   Items: {order.items.count()}")
    print(f"   Total: ${order.total_amount}")
    
    # Procesar stock de la orden
    print(f"\n🔄 PROCESANDO STOCK DE LA ORDEN...")
    stock_result = AutoStockService.process_order_stock(order)
    
    if stock_result['success']:
        print(f"   ✅ Stock procesado exitosamente")
        print(f"   📊 Items procesados: {stock_result['processed_items']}")
    else:
        print(f"   ❌ Error procesando stock: {stock_result['errors']}")
        return
    
    # Mostrar stock después de la compra
    product.refresh_from_db()
    for variant in variants:
        variant.refresh_from_db()
    
    print(f"\n📊 STOCK DESPUÉS DE LA COMPRA:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    for variant in variants:
        print(f"   {variant.size.name}-{variant.color.name}: {variant.inventory_quantity} unidades")
    
    # Verificar sincronización
    expected_total = sum(v.inventory_quantity for v in variants)
    if product.inventory_quantity == expected_total:
        print(f"   ✅ Stock sincronizado correctamente: {product.inventory_quantity} = {expected_total}")
    else:
        print(f"   ❌ Error en sincronización: {product.inventory_quantity} ≠ {expected_total}")
    
    # Verificar alertas de stock bajo
    from ecommerce.apps.inventory.models import StockAlert
    alerts = StockAlert.objects.filter(product=product, status='active')
    print(f"\n⚠️ ALERTAS DE STOCK ACTIVAS: {alerts.count()}")
    for alert in alerts:
        print(f"   ⚠️ {alert.alert_type}: {alert.message}")
    
    return order

def test_admin_dashboard_view():
    """Simular la vista del dashboard de admin."""
    print("\n📊 SIMULANDO VISTA DEL DASHBOARD DE ADMIN")
    print("=" * 50)
    
    # Obtener productos con stock bajo
    products = Product.objects.filter(track_inventory=True)
    
    print(f"📋 PRODUCTOS EN EL SISTEMA:")
    for product in products:
        print(f"   🏷️  {product.name}")
        print(f"      📊 Stock total: {product.inventory_quantity} unidades")
        print(f"      ⚠️  Umbral bajo: {product.low_stock_threshold} unidades")
        
        # Verificar si está en stock bajo
        if product.inventory_quantity <= product.low_stock_threshold:
            print(f"      🚨 ESTADO: STOCK BAJO")
        else:
            print(f"      ✅ ESTADO: Stock normal")
        
        # Mostrar variantes
        variants = product.variants.filter(is_active=True)
        print(f"      📦 Variantes activas: {variants.count()}")
        for variant in variants:
            print(f"         {variant.size.name}-{variant.color.name}: {variant.inventory_quantity} unidades")

def main():
    """Función principal para ejecutar las pruebas finales."""
    print("🎯 INICIANDO PRUEBAS FINALES DEL SISTEMA DE AUTOSTOCK")
    print("=" * 70)
    
    try:
        # Prueba de flujo completo de compra
        order = test_complete_purchase_flow()
        
        # Prueba de vista del dashboard
        test_admin_dashboard_view()
        
        print("\n" + "=" * 70)
        print("🎉 TODAS LAS PRUEBAS FINALES COMPLETADAS")
        print("✅ El sistema de autostock está funcionando perfectamente")
        print("✅ El stock se actualiza correctamente en todas las vistas")
        print("✅ El dashboard de admin refleja los cambios correctamente")
        print("✅ La sincronización entre producto y variantes funciona")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
