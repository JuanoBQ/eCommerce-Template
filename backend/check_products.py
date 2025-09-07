#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
sys.path.append(os.path.dirname(__file__))
django.setup()

from ecommerce.apps.products.models import Product

print("🔍 Verificando productos en la base de datos...")
print("=" * 50)

products = Product.objects.all()[:5]
for p in products:
    print(f'ID: {p.id}')
    print(f'Name: {p.name[:50]}...')
    print(f'Has Description: {bool(p.description)}')
    print(f'Description Length: {len(p.description) if p.description else 0}')
    if p.description:
        print(f'Description Preview: {p.description[:100]}...')
    print("-" * 30)

print("\n✅ Verificación completada")
