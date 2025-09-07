#!/usr/bin/env python
"""
Script para crear datos de prueba: 50 usuarios y 50 pedidos
"""
import os
import sys
import django
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import random
from datetime import datetime, timedelta

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from ecommerce.apps.products.models import Product, Category, Brand
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.users.models import User

def create_test_users():
    """Crear 50 usuarios de prueba"""
    print("Creando 50 usuarios de prueba...")
    
    # Crear categorías y marcas si no existen
    category, _ = Category.objects.get_or_create(
        name="Ropa",
        defaults={
            'description': 'Categoría de ropa',
            'is_active': True,
            'sort_order': 1
        }
    )
    
    brand, _ = Brand.objects.get_or_create(
        name="Marca Test",
        defaults={
            'description': 'Marca de prueba',
            'is_active': True,
            'sort_order': 1
        }
    )
    
    # Crear algunos productos si no existen
    if not Product.objects.exists():
        for i in range(10):
            Product.objects.create(
                name=f"Producto Test {i+1}",
                description=f"Descripción del producto {i+1}",
                price=Decimal(f"{random.uniform(10, 100):.2f}"),
                inventory_quantity=random.randint(10, 100),
                category=category,
                brand=brand,
                status='published',
                gender=random.choice(['masculino', 'femenino', 'unisex']),
                is_active=True
            )
    
    # Crear 50 usuarios
    users_created = 0
    for i in range(50):
        email = f"usuario{i+1}@test.com"
        if not User.objects.filter(email=email).exists():
            User.objects.create_user(
                email=email,
                password="test123",
                first_name=f"Usuario{i+1}",
                last_name="Test",
                phone=f"+57300{random.randint(1000000, 9999999)}",
                is_active=True,
                is_staff=False
            )
            users_created += 1
    
    print(f"✅ {users_created} usuarios creados")
    return users_created

def create_test_orders():
    """Crear 50 pedidos de prueba"""
    print("Creando 50 pedidos de prueba...")
    
    users = list(User.objects.all())
    products = list(Product.objects.all())
    
    if not users:
        print("❌ No hay usuarios disponibles. Creando usuarios primero...")
        create_test_users()
        users = list(User.objects.all())
    
    if not products:
        print("❌ No hay productos disponibles. Creando productos primero...")
        # Crear productos básicos
        category, _ = Category.objects.get_or_create(
            name="Ropa",
            defaults={'description': 'Categoría de ropa', 'is_active': True, 'sort_order': 1}
        )
        brand, _ = Brand.objects.get_or_create(
            name="Marca Test",
            defaults={'description': 'Marca de prueba', 'is_active': True, 'sort_order': 1}
        )
        
        for i in range(10):
            Product.objects.create(
                name=f"Producto Test {i+1}",
                description=f"Descripción del producto {i+1}",
                price=Decimal(f"{random.uniform(10, 100):.2f}"),
                inventory_quantity=random.randint(10, 100),
                category=category,
                brand=brand,
                status='published',
                gender=random.choice(['masculino', 'femenino', 'unisex']),
                is_active=True
            )
        products = list(Product.objects.all())
    
    # Estados posibles
    order_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    payment_statuses = ['pending', 'completed', 'failed', 'refunded']
    
    orders_created = 0
    for i in range(50):
        # Seleccionar usuario aleatorio
        user = random.choice(users)
        
        # Crear pedido
        order = Order.objects.create(
            user=user,
            order_number=f"ORD-{timezone.now().strftime('%Y%m%d')}-{i+1:04d}",
            status=random.choice(order_statuses),
            payment_status=random.choice(payment_statuses),
            total_amount=Decimal('0.00'),
            shipping_address=f"Calle {random.randint(1, 100)} #{random.randint(1, 50)}-{random.randint(10, 99)}",
            billing_address=f"Calle {random.randint(1, 100)} #{random.randint(1, 50)}-{random.randint(10, 99)}",
            notes=f"Pedido de prueba {i+1}",
            created_at=timezone.now() - timedelta(days=random.randint(0, 30))
        )
        
        # Agregar items al pedido
        num_items = random.randint(1, 5)
        total_amount = Decimal('0.00')
        
        for _ in range(num_items):
            product = random.choice(products)
            quantity = random.randint(1, 3)
            price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )
            
            total_amount += price * quantity
        
        # Actualizar total del pedido
        order.total_amount = total_amount
        order.save()
        
        orders_created += 1
    
    print(f"✅ {orders_created} pedidos creados")
    return orders_created

def main():
    """Función principal"""
    print("🚀 Iniciando creación de datos de prueba...")
    print("=" * 50)
    
    try:
        # Crear usuarios
        users_count = create_test_users()
        
        # Crear pedidos
        orders_count = create_test_orders()
        
        print("=" * 50)
        print("✅ Datos de prueba creados exitosamente!")
        print(f"📊 Resumen:")
        print(f"   - Usuarios: {users_count}")
        print(f"   - Pedidos: {orders_count}")
        print(f"   - Productos: {Product.objects.count()}")
        print(f"   - Categorías: {Category.objects.count()}")
        print(f"   - Marcas: {Brand.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error al crear datos de prueba: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
