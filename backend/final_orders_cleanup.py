#!/usr/bin/env python
"""
Script final para limpiar órdenes con nombres de tablas correctos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings.development')
django.setup()

from django.db import connection
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.payments.models import Payment
from ecommerce.apps.products.models import Product
from django.utils import timezone

def final_orders_cleanup():
    """Limpieza final de órdenes"""
    print("=" * 80)
    print("🧹 LIMPIEZA FINAL DE ÓRDENES")
    print("=" * 80)
    
    with connection.cursor() as cursor:
        # 1. Identificar pagos duplicados
        print("\n🔍 IDENTIFICANDO PAGOS DUPLICADOS:")
        cursor.execute("""
            SELECT order_id, COUNT(*) as count
            FROM payments_payment
            GROUP BY order_id
            HAVING COUNT(*) > 1
        """)
        
        duplicates = cursor.fetchall()
        print(f"Órdenes con pagos duplicados: {len(duplicates)}")
        
        for order_id, count in duplicates:
            try:
                order = Order.objects.get(id=order_id)
                print(f"  Orden {order.order_number}: {count} pagos")
            except Order.DoesNotExist:
                print(f"  Orden ID {order_id}: {count} pagos (orden no existe)")
        
        # 2. Limpiar pagos duplicados (mantener el más reciente)
        if duplicates:
            print(f"\n🧹 LIMPIANDO PAGOS DUPLICADOS:")
            
            for order_id, count in duplicates:
                # Obtener el pago más reciente
                cursor.execute("""
                    SELECT id FROM payments_payment
                    WHERE order_id = %s
                    ORDER BY created_at DESC
                    LIMIT 1
                """, [order_id])
                
                keep_payment_id = cursor.fetchone()[0]
                
                # Eliminar los demás pagos
                cursor.execute("""
                    DELETE FROM payments_payment
                    WHERE order_id = %s AND id != %s
                """, [order_id, keep_payment_id])
                
                deleted_count = cursor.rowcount
                print(f"  Orden ID {order_id}: Eliminados {deleted_count} pagos duplicados")
        
        # 3. Identificar órdenes sin items
        print(f"\n🔍 IDENTIFICANDO ÓRDENES SIN ITEMS:")
        cursor.execute("""
            SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.id IS NULL
        """)
        
        orders_without_items = cursor.fetchall()
        print(f"Órdenes sin items: {len(orders_without_items)}")
        
        # 4. Limpiar órdenes sin items
        if orders_without_items:
            print(f"\n🧹 LIMPIANDO ÓRDENES SIN ITEMS:")
            
            for order_id, order_number, status, payment_status, total_amount in orders_without_items:
                # Verificar si tiene pagos
                cursor.execute("""
                    SELECT COUNT(*) FROM payments_payment WHERE order_id = %s
                """, [order_id])
                
                payment_count = cursor.fetchone()[0]
                
                if payment_count == 0:
                    # Sin pagos, eliminar orden
                    cursor.execute("DELETE FROM orders WHERE id = %s", [order_id])
                    print(f"  Eliminada orden {order_number} (sin pagos)")
                else:
                    # Verificar estado del pago
                    cursor.execute("""
                        SELECT status FROM payments_payment WHERE order_id = %s LIMIT 1
                    """, [order_id])
                    
                    payment_status_result = cursor.fetchone()
                    if payment_status_result:
                        payment_status_db = payment_status_result[0]
                        
                        if payment_status_db in ['completed', 'paid']:
                            # Pago completado sin items - crear item de recuperación
                            recovery_product = Product.objects.filter(track_inventory=True).first()
                            if recovery_product:
                                cursor.execute("""
                                    INSERT INTO order_items 
                                    (order_id, product_id, quantity, unit_price, total_price, product_name, product_sku, created_at, updated_at)
                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                                """, [
                                    order_id,
                                    recovery_product.id,
                                    1,
                                    float(total_amount),
                                    float(total_amount),
                                    recovery_product.name,
                                    recovery_product.sku,
                                    timezone.now(),
                                    timezone.now()
                                ])
                                print(f"  ✓ Orden {order_number}: Item de recuperación agregado")
                        else:
                            # Pago pendiente/fallido, eliminar orden
                            cursor.execute("DELETE FROM orders WHERE id = %s", [order_id])
                            print(f"  Eliminada orden {order_number} (pago {payment_status_db})")
    
    # 5. Verificar estado final
    print(f"\n📊 ESTADO FINAL:")
    
    # Órdenes totales
    total_orders = Order.objects.count()
    print(f"Total órdenes: {total_orders}")
    
    # Órdenes por estado
    print("\nPor estado:")
    for status in ['pending', 'confirmed', 'cancelled', 'delivered', 'refunded']:
        count = Order.objects.filter(status=status).count()
        print(f"  {status}: {count}")
    
    # Órdenes por estado de pago
    print("\nPor estado de pago:")
    for payment_status in ['pending', 'paid', 'failed', 'refunded']:
        count = Order.objects.filter(payment_status=payment_status).count()
        print(f"  {payment_status}: {count}")
    
    # Órdenes sin items restantes
    remaining_orders_without_items = Order.objects.filter(items__isnull=True).count()
    print(f"\nÓrdenes sin items restantes: {remaining_orders_without_items}")
    
    # Stock de productos
    print(f"\n📦 STOCK DE PRODUCTOS:")
    products = Product.objects.filter(track_inventory=True)
    for product in products:
        print(f"  {product.name}: {product.inventory_quantity} unidades")
    
    # 6. Verificar consistencia
    print(f"\n🔍 VERIFICANDO CONSISTENCIA:")
    
    # Órdenes inconsistentes
    inconsistent_orders = (
        Order.objects.filter(status='pending', payment_status='paid').count() +
        Order.objects.filter(status='confirmed', payment_status='pending').count() +
        Order.objects.filter(status='cancelled', payment_status='paid').count()
    )
    print(f"Órdenes inconsistentes: {inconsistent_orders}")
    
    # 7. Resumen final
    print(f"\n🎉 RESUMEN FINAL:")
    if remaining_orders_without_items == 0 and inconsistent_orders == 0:
        print("✅ Todas las órdenes están limpias y consistentes")
    else:
        print("⚠️ Aún hay problemas que requieren atención:")
        if remaining_orders_without_items > 0:
            print(f"  - {remaining_orders_without_items} órdenes sin items")
        if inconsistent_orders > 0:
            print(f"  - {inconsistent_orders} órdenes inconsistentes")
    
    print("\n🎉 LIMPIEZA FINAL COMPLETADA")

if __name__ == '__main__':
    final_orders_cleanup()
