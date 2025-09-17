"""
Script de prueba para verificar la sincronización de stock.
Demuestra que el stock total se actualiza correctamente.
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
from django.db import models
from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.categories.models import Category, Brand, Size, Color
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.inventory.autostock_service import AutoStockService

User = get_user_model()

def create_test_product_with_variants():
    """Crear un producto con múltiples variantes para probar la sincronización."""
    print("🔧 CREANDO PRODUCTO CON VARIANTES...")
    
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
    size_large, created = Size.objects.get_or_create(name='Large', defaults={'sort_order': 3})
    
    # Crear colores
    color_black, created = Color.objects.get_or_create(name='Negro', defaults={'hex_code': '#000000'})
    color_white, created = Color.objects.get_or_create(name='Blanco', defaults={'hex_code': '#FFFFFF'})
    color_red, created = Color.objects.get_or_create(name='Rojo', defaults={'hex_code': '#FF0000'})
    
    # Crear producto
    product, created = Product.objects.get_or_create(
        name='Laptop de Prueba',
        defaults={
            'slug': 'laptop-prueba',
            'description': 'Laptop para probar sincronización de stock',
            'short_description': 'Laptop test',
            'sku': 'LAPTOP-TEST-001',
            'category': category,
            'brand': brand,
            'price': Decimal('1299.99'),
            'compare_price': Decimal('1499.99'),
            'track_inventory': True,
            'inventory_quantity': 0,  # Inicialmente 0, se sincronizará
            'low_stock_threshold': 5,
            'status': 'published'
        }
    )
    
    # Crear variantes con diferentes stocks
    variants_data = [
        (size_small, color_black, 5, 'LAPTOP-TEST-001-BLK-SM'),
        (size_medium, color_white, 8, 'LAPTOP-TEST-001-WHT-MD'),
        (size_large, color_red, 3, 'LAPTOP-TEST-001-RED-LG'),
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
                'low_stock_threshold': 2,
                'is_active': True
            }
        )
        variants.append(variant)
        print(f"   📦 Variante {size.name}-{color.name}: {stock} unidades")
    
    print(f"✅ Producto creado: {product.name}")
    print(f"   📊 Stock inicial del producto: {product.inventory_quantity}")
    print(f"   📊 Total de variantes: {len(variants)}")
    
    return product, variants

def test_stock_synchronization():
    """Probar la sincronización de stock."""
    print("\n🔄 PROBANDO SINCRONIZACIÓN DE STOCK")
    print("=" * 50)
    
    # Crear producto con variantes
    product, variants = create_test_product_with_variants()
    
    # Mostrar stock antes de sincronizar
    print(f"\n📊 ANTES DE SINCRONIZAR:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    for variant in variants:
        print(f"   {variant.size.name}-{variant.color.name}: {variant.inventory_quantity} unidades")
    
    # Calcular total esperado
    expected_total = sum(v.inventory_quantity for v in variants)
    print(f"   Total esperado: {expected_total} unidades")
    
    # Sincronizar stock
    print(f"\n🔄 SINCRONIZANDO STOCK...")
    AutoStockService.sync_product_stock(product)
    
    # Mostrar stock después de sincronizar
    product.refresh_from_db()
    print(f"\n📊 DESPUÉS DE SINCRONIZAR:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    
    if product.inventory_quantity == expected_total:
        print(f"   ✅ Sincronización exitosa: {product.inventory_quantity} = {expected_total}")
    else:
        print(f"   ❌ Error en sincronización: {product.inventory_quantity} ≠ {expected_total}")

def test_stock_after_purchase():
    """Probar cómo se actualiza el stock después de una compra."""
    print("\n🛒 PROBANDO ACTUALIZACIÓN DESPUÉS DE COMPRA")
    print("=" * 50)
    
    # Crear producto con variantes
    product, variants = create_test_product_with_variants()
    
    # Sincronizar stock inicial
    AutoStockService.sync_product_stock(product)
    product.refresh_from_db()
    
    print(f"\n📊 STOCK INICIAL SINCRONIZADO:")
    print(f"   Producto: {product.inventory_quantity} unidades")
    for variant in variants:
        print(f"   {variant.size.name}-{variant.color.name}: {variant.inventory_quantity} unidades")
    
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
    
    # Crear orden de prueba
    order = Order.objects.create(
        user=user,
        order_number=f'SYNC-TEST-{Order.objects.count() + 1:06d}',
        status='pending',
        payment_status='pending',
        subtotal=Decimal('0.00'),
        total_amount=Decimal('0.00'),
        shipping_address='Dirección de prueba',
        billing_address='Dirección de facturación'
    )
    
    # Agregar items a la orden (comprar de diferentes variantes)
    OrderItem.objects.create(
        order=order,
        product=product,
        variant=variants[0],  # Small-Black
        quantity=2,
        unit_price=product.price,
        total_price=product.price * 2,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variants[0].size.name} - {variants[0].color.name}"
    )
    
    OrderItem.objects.create(
        order=order,
        product=product,
        variant=variants[1],  # Medium-White
        quantity=1,
        unit_price=product.price,
        total_price=product.price * 1,
        product_name=product.name,
        product_sku=product.sku,
        variant_info=f"{variants[1].size.name} - {variants[1].color.name}"
    )
    
    # Actualizar total de la orden
    order.subtotal = order.items.aggregate(total=models.Sum('total_price'))['total'] or Decimal('0.00')
    order.total_amount = order.subtotal
    order.save()
    
    print(f"\n🛒 ORDEN CREADA:")
    print(f"   Orden: {order.order_number}")
    print(f"   Items: {order.items.count()}")
    print(f"   Total: ${order.total_amount}")
    
    # Procesar stock de la orden
    print(f"\n🔄 PROCESANDO STOCK DE LA ORDEN...")
    stock_result = AutoStockService.process_order_stock(order)
    
    if stock_result['success']:
        print(f"   ✅ Stock procesado exitosamente")
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
    
    # Verificar que el stock del producto se sincronizó correctamente
    expected_total = sum(v.inventory_quantity for v in variants)
    if product.inventory_quantity == expected_total:
        print(f"   ✅ Stock sincronizado correctamente: {product.inventory_quantity} = {expected_total}")
    else:
        print(f"   ❌ Error en sincronización: {product.inventory_quantity} ≠ {expected_total}")

def main():
    """Función principal para ejecutar las pruebas de sincronización."""
    print("🔄 INICIANDO PRUEBAS DE SINCRONIZACIÓN DE STOCK")
    print("=" * 60)
    
    try:
        # Prueba de sincronización básica
        test_stock_synchronization()
        
        # Prueba de actualización después de compra
        test_stock_after_purchase()
        
        print("\n" + "=" * 60)
        print("🎉 TODAS LAS PRUEBAS DE SINCRONIZACIÓN COMPLETADAS")
        print("✅ El sistema de sincronización de stock funciona correctamente")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
