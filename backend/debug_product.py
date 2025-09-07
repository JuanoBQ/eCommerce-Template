#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from ecommerce.apps.products.models import Product

print("🔍 Debug: Verificando producto ID 80...")

try:
    product = Product.objects.select_related('category', 'brand').get(id=80)
    print(f"✅ Producto encontrado: {product.name}")
    print(f"   ID: {product.id}")
    print(f"   category_id: {product.category_id}")
    print(f"   brand_id: {product.brand_id}")

    if product.category:
        print(f"📂 Categoría: {product.category.name} (ID: {product.category.id})")
    else:
        print("❌ Sin categoría asignada")

    if product.brand:
        print(f"🏷️ Marca: {product.brand.name} (ID: {product.brand.id})")
    else:
        print("❌ Sin marca asignada")

except Product.DoesNotExist:
    print("❌ Producto con ID 80 no encontrado")
    products = Product.objects.all()[:3]
    print(f"Productos disponibles: {len(products)}")
    for p in products:
        print(f"  - ID {p.id}: {p.name}")

except Exception as e:
    print(f"❌ Error: {e}")

print("\n🔍 Debug: Probando API endpoint...")
try:
    response = requests.get('http://localhost:8000/api/products/80/')
    if response.status_code == 200:
        data = response.json()
        print("✅ API responde correctamente")
        print(f"   category_details: {data.get('category_details')}")
        print(f"   brand_details: {data.get('brand_details')}")
    else:
        print(f"❌ Error en API: {response.status_code}")
        print(response.text[:200])
except Exception as e:
    print(f"❌ Error conectando a API: {e}")
