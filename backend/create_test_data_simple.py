#!/usr/bin/env python
"""
Script simple para crear datos de prueba: 50 usuarios y 50 pedidos
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

from ecommerce.apps.products.models import Product
from ecommerce.apps.categories.models import Category, Brand
from ecommerce.apps.orders.models import Order, OrderItem
from ecommerce.apps.users.models import User

def create_test_data():
    """Crear datos de prueba"""
    print("🚀 Creando datos de prueba...")
    
    # Crear categoría y marca
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
    
    # Crear productos si no existen
    if not Product.objects.exists():
        print("📦 Creando productos...")
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
    print("👥 Creando usuarios...")
    users_created = 0
    for i in range(50):
        email = f"usuario{i+1}@test.com"
        if not User.objects.filter(email=email).exists():
            User.objects.create_user(
                username=f"usuario{i+1}",
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
    
    # Crear 50 pedidos
    print("📋 Creando pedidos...")
    users = list(User.objects.all())
    products = list(Product.objects.all())
    
    order_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    payment_statuses = ['pending', 'completed', 'failed', 'refunded']
    
    orders_created = 0
    for i in range(50):
        user = random.choice(users)
        
        order = Order.objects.create(
            user=user,
            order_number=f"ORD-{timezone.now().strftime('%Y%m%d')}-{i+1:04d}-{random.randint(1000, 9999)}",
            status=random.choice(order_statuses),
            payment_status=random.choice(payment_statuses),
            subtotal=Decimal('0.00'),
            total_amount=Decimal('0.00'),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            shipping_first_name=user.first_name,
            shipping_last_name=user.last_name,
            shipping_address=f"Calle {random.randint(1, 100)} #{random.randint(1, 50)}-{random.randint(10, 99)}",
            shipping_city="Bogotá",
            shipping_state="Cundinamarca",
            shipping_country="Colombia",
            shipping_postal_code=f"{random.randint(100000, 999999)}",
            billing_first_name=user.first_name,
            billing_last_name=user.last_name,
            billing_address=f"Calle {random.randint(1, 100)} #{random.randint(1, 50)}-{random.randint(10, 99)}",
            billing_city="Bogotá",
            billing_state="Cundinamarca",
            billing_country="Colombia",
            billing_postal_code=f"{random.randint(100000, 999999)}",
            notes=f"Pedido de prueba {i+1}",
            created_at=timezone.now() - timedelta(days=random.randint(0, 30))
        )
        
        # Agregar items al pedido
        num_items = random.randint(1, 5)
        subtotal = Decimal('0.00')
        
        for _ in range(num_items):
            product = random.choice(products)
            quantity = random.randint(1, 3)
            price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=price
            )
            
            subtotal += price * quantity
        
        # Calcular totales
        tax_amount = subtotal * Decimal('0.19')  # 19% IVA
        shipping_amount = Decimal('5000.00')  # Envío fijo
        total_amount = subtotal + tax_amount + shipping_amount
        
        order.subtotal = subtotal
        order.tax_amount = tax_amount
        order.shipping_amount = shipping_amount
        order.total_amount = total_amount
        order.save()
        orders_created += 1
    
    print(f"✅ {orders_created} pedidos creados")
    
    # Resumen
    print("\n📊 Resumen:")
    print(f"   - Usuarios: {User.objects.count()}")
    print(f"   - Pedidos: {Order.objects.count()}")
    print(f"   - Productos: {Product.objects.count()}")
    print(f"   - Categorías: {Category.objects.count()}")
    print(f"   - Marcas: {Brand.objects.count()}")
    print("\n🎉 ¡Datos de prueba creados exitosamente!")

if __name__ == "__main__":
    create_test_data()
