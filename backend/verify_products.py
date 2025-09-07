#!/usr/bin/env python3
"""
Script para verificar los productos creados
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from ecommerce.apps.products.models import Product

def verify_products():
    """Verificar productos creados"""
    print("🔍 Verificando productos creados...")
    
    total_products = Product.objects.count()
    men_products = Product.objects.filter(gender='masculino').count()
    women_products = Product.objects.filter(gender='femenino').count()
    
    print(f"📊 Total de productos: {total_products}")
    print(f"👨 Productos para hombres: {men_products}")
    print(f"👩 Productos para mujeres: {women_products}")
    
    print("\n📋 Primeros 5 productos:")
    for product in Product.objects.all()[:5]:
        print(f"  ID: {product.id}, Nombre: {product.name}, Género: {product.gender}, Precio: ${product.price}")
    
    print("\n✅ Verificación completada!")

if __name__ == "__main__":
    verify_products()
