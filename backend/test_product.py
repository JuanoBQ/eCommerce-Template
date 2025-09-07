#!/usr/bin/env python
"""
Script para investigar el problema con el mapeo de categoría y marca
"""

import os
import sys
import django

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')

# Configurar Django
django.setup()

from ecommerce.apps.products.models import Product
from ecommerce.apps.products.serializers import ProductDetailSerializer

def test_product_mapping():
    print("🔍 Investigando el problema con el mapeo de categoría y marca...")
    print("=" * 60)

    try:
        # Buscar el producto con ID 80
        product = Product.objects.select_related('category', 'brand').get(id=80)
        print(f"✅ Producto encontrado: {product.name}")
        print(f"   ID: {product.id}")
        print(f"   Categoría ID: {product.category_id}")
        print(f"   Marca ID: {product.brand_id}")
        print()

        # Verificar relaciones
        if product.category:
            print(f"📂 Categoría asignada:")
            print(f"   ID: {product.category.id}")
            print(f"   Nombre: {product.category.name}")
            print(f"   Slug: {product.category.slug}")
            print(f"   Descripción: {product.category.description}")
            print(f"   Activa: {product.category.is_active}")
        else:
            print("❌ No tiene categoría asignada")

        print()

        if product.brand:
            print(f"🏷️  Marca asignada:")
            print(f"   ID: {product.brand.id}")
            print(f"   Nombre: {product.brand.name}")
            print(f"   Slug: {product.brand.slug}")
            print(f"   Descripción: {product.brand.description}")
            print(f"   Website: {product.brand.website}")
            print(f"   Logo: {product.brand.logo}")
            print(f"   Activa: {product.brand.is_active}")
        else:
            print("❌ No tiene marca asignada")

        print()
        print("=" * 60)

        # Probar el serializer
        print("🔧 Probando el serializer...")
        serializer = ProductDetailSerializer(product)
        data = serializer.data

        print(f"📊 Datos serializados:")
        print(f"   category_details: {data.get('category_details')}")
        print(f"   brand_details: {data.get('brand_details')}")

        print()
        print("✅ Investigación completada")

    except Product.DoesNotExist:
        print("❌ Producto con ID 80 no encontrado")
        print("   Verificando si existen productos...")
        products = Product.objects.all()[:5]
        if products:
            print("   Productos encontrados:")
            for p in products:
                print(f"   - ID {p.id}: {p.name}")
        else:
            print("   No hay productos en la base de datos")

    except Exception as e:
        print(f"❌ Error durante la investigación: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_product_mapping()
