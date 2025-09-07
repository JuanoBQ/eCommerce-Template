#!/usr/bin/env python3
"""
Script simplificado para crear productos de prueba para hombres y mujeres
"""

import os
import sys
import django
from decimal import Decimal
import random

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from ecommerce.apps.products.models import Product, ProductVariant
from ecommerce.apps.categories.models import Category, Brand, Size, Color

def clear_products():
    """Limpiar todos los productos existentes"""
    print("🧹 Limpiando productos existentes...")
    Product.objects.all().delete()
    print("✅ Productos eliminados")

def get_or_create_basic_data():
    """Obtener o crear datos básicos"""
    # Crear categorías
    category, _ = Category.objects.get_or_create(
        name="Ropa Deportiva",
        slug="ropa-deportiva",
        defaults={'description': 'Ropa deportiva para hombres y mujeres', 'is_active': True}
    )
    
    # Crear marca
    brand, _ = Brand.objects.get_or_create(
        name="Nike",
        slug="nike",
        defaults={'description': 'Just Do It', 'is_active': True}
    )
    
    # Crear tallas
    sizes = []
    for size_name in ['S', 'M', 'L', 'XL']:
        size, _ = Size.objects.get_or_create(
            name=size_name,
            type='clothing',
            defaults={'sort_order': 1, 'is_active': True}
        )
        sizes.append(size)
    
    # Crear colores
    colors = []
    for color_name, hex_code in [('Negro', '#000000'), ('Blanco', '#FFFFFF'), ('Azul', '#0000FF')]:
        color, _ = Color.objects.get_or_create(
            name=color_name,
            defaults={'hex_code': hex_code, 'is_active': True}
        )
        colors.append(color)
    
    return category, brand, sizes, colors

def create_products():
    """Crear productos de prueba"""
    print("🏗️ Creando productos de prueba...")
    
    category, brand, sizes, colors = get_or_create_basic_data()
    
    # Productos para hombres
    men_products = [
        {
            'name': 'Camiseta Nike Hombres 1',
            'slug': 'camiseta-nike-hombres-1',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-001',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('89900'),
            'compare_price': Decimal('119900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 2',
            'slug': 'camiseta-nike-hombres-2',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-002',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('79900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 3',
            'slug': 'camiseta-nike-hombres-3',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-003',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('99900'),
            'compare_price': Decimal('129900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 4',
            'slug': 'camiseta-nike-hombres-4',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-004',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('69900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 5',
            'slug': 'camiseta-nike-hombres-5',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-005',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('109900'),
            'compare_price': Decimal('139900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 6',
            'slug': 'camiseta-nike-hombres-6',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-006',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('84900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 7',
            'slug': 'camiseta-nike-hombres-7',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-007',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('94900'),
            'compare_price': Decimal('124900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 8',
            'slug': 'camiseta-nike-hombres-8',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-008',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('74900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 9',
            'slug': 'camiseta-nike-hombres-9',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-009',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('119900'),
            'compare_price': Decimal('149900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Hombres 10',
            'slug': 'camiseta-nike-hombres-10',
            'description': 'Camiseta deportiva de alta calidad para hombres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-M-010',
            'category': category,
            'brand': brand,
            'gender': 'masculino',
            'price': Decimal('89900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        }
    ]
    
    # Productos para mujeres
    women_products = [
        {
            'name': 'Camiseta Nike Mujeres 1',
            'slug': 'camiseta-nike-mujeres-1',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-001',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('89900'),
            'compare_price': Decimal('119900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 2',
            'slug': 'camiseta-nike-mujeres-2',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-002',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('79900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 3',
            'slug': 'camiseta-nike-mujeres-3',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-003',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('99900'),
            'compare_price': Decimal('129900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 4',
            'slug': 'camiseta-nike-mujeres-4',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-004',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('69900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 5',
            'slug': 'camiseta-nike-mujeres-5',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-005',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('109900'),
            'compare_price': Decimal('139900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 6',
            'slug': 'camiseta-nike-mujeres-6',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-006',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('84900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 7',
            'slug': 'camiseta-nike-mujeres-7',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-007',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('94900'),
            'compare_price': Decimal('124900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 8',
            'slug': 'camiseta-nike-mujeres-8',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-008',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('74900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 9',
            'slug': 'camiseta-nike-mujeres-9',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-009',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('119900'),
            'compare_price': Decimal('149900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Nike Mujeres 10',
            'slug': 'camiseta-nike-mujeres-10',
            'description': 'Camiseta deportiva de alta calidad para mujeres.',
            'short_description': 'Camiseta deportiva Nike',
            'sku': 'NKE-F-010',
            'category': category,
            'brand': brand,
            'gender': 'femenino',
            'price': Decimal('89900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        }
    ]
    
    # Crear productos para hombres
    print("👨 Creando productos para hombres...")
    for i, product_data in enumerate(men_products, 1):
        product = Product.objects.create(**product_data)
        print(f"  ✅ Producto {i}/10: {product.name}")
    
    # Crear productos para mujeres
    print("👩 Creando productos para mujeres...")
    for i, product_data in enumerate(women_products, 1):
        product = Product.objects.create(**product_data)
        print(f"  ✅ Producto {i}/10: {product.name}")
    
    print(f"🎉 ¡Productos creados exitosamente!")
    print(f"📊 Total de productos: {Product.objects.count()}")
    print(f"👨 Productos para hombres: {Product.objects.filter(gender='masculino').count()}")
    print(f"👩 Productos para mujeres: {Product.objects.filter(gender='femenino').count()}")

def main():
    """Función principal"""
    print("🚀 Iniciando creación de productos de prueba...")
    
    try:
        # Limpiar productos existentes
        clear_products()
        
        # Crear productos de prueba
        create_products()
        
        print("\n✅ ¡Proceso completado exitosamente!")
        print("🔗 Puedes verificar los productos en el admin o en la API:")
        print("   - Admin: http://localhost:3000/admin/products")
        print("   - API: http://localhost:8000/api/products/")
        
    except Exception as e:
        print(f"❌ Error durante la creación: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
