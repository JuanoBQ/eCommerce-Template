#!/usr/bin/env python3
"""
Script para crear productos de prueba para hombres y mujeres
con diferentes categorías y todos los campos disponibles.
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from ecommerce.apps.products.models import Product, ProductVariant, ProductImage
from ecommerce.apps.categories.models import Category, Brand, Size, Color
from django.contrib.auth import get_user_model

User = get_user_model()

def clear_products():
    """Limpiar todos los productos existentes"""
    print("🧹 Limpiando productos existentes...")
    Product.objects.all().delete()
    print("✅ Productos eliminados")

def get_or_create_categories():
    """Obtener o crear categorías"""
    categories = []
    
    # Categorías para ropa
    categories.append(Category.objects.get_or_create(
        name="Camisetas",
        slug="camisetas",
        defaults={
            'description': 'Camisetas para hombres y mujeres',
            'status': 'published',
            'sort_order': 1
        }
    )[0])
    
    categories.append(Category.objects.get_or_create(
        name="Pantalones",
        slug="pantalones", 
        defaults={
            'description': 'Pantalones para hombres y mujeres',
            'status': 'published',
            'sort_order': 2
        }
    )[0])
    
    categories.append(Category.objects.get_or_create(
        name="Zapatos",
        slug="zapatos",
        defaults={
            'description': 'Zapatos deportivos y casuales',
            'status': 'published',
            'sort_order': 3
        }
    )[0])
    
    categories.append(Category.objects.get_or_create(
        name="Accesorios",
        slug="accesorios",
        defaults={
            'description': 'Accesorios deportivos',
            'status': 'published',
            'sort_order': 4
        }
    )[0])
    
    categories.append(Category.objects.get_or_create(
        name="Chaquetas",
        slug="chaquetas",
        defaults={
            'description': 'Chaquetas y abrigos',
            'status': 'published',
            'sort_order': 5
        }
    )[0])
    
    return categories

def get_or_create_brands():
    """Obtener o crear marcas"""
    brands = []
    
    brands.append(Brand.objects.get_or_create(
        name="Nike",
        slug="nike",
        defaults={
            'description': 'Just Do It',
            'status': 'published',
            'sort_order': 1
        }
    )[0])
    
    brands.append(Brand.objects.get_or_create(
        name="Adidas",
        slug="adidas",
        defaults={
            'description': 'Impossible is Nothing',
            'status': 'published',
            'sort_order': 2
        }
    )[0])
    
    brands.append(Brand.objects.get_or_create(
        name="Puma",
        slug="puma",
        defaults={
            'description': 'Forever Faster',
            'status': 'published',
            'sort_order': 3
        }
    )[0])
    
    brands.append(Brand.objects.get_or_create(
        name="Under Armour",
        slug="under-armour",
        defaults={
            'description': 'I Will',
            'status': 'published',
            'sort_order': 4
        }
    )[0])
    
    return brands

def get_or_create_sizes():
    """Obtener o crear tallas"""
    sizes = []
    
    # Tallas de ropa
    clothing_sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    for size_name in clothing_sizes:
        size, created = Size.objects.get_or_create(
            name=size_name,
            type='clothing',
            defaults={
                'sort_order': clothing_sizes.index(size_name) + 1,
                'status': 'published'
            }
        )
        sizes.append(size)
    
    # Tallas de zapatos
    shoe_sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
    for size_name in shoe_sizes:
        size, created = Size.objects.get_or_create(
            name=size_name,
            type='shoes',
            defaults={
                'sort_order': shoe_sizes.index(size_name) + 1,
                'status': 'published'
            }
        )
        sizes.append(size)
    
    # Tallas de accesorios
    accessory_sizes = ['Única', 'S', 'M', 'L']
    for size_name in accessory_sizes:
        size, created = Size.objects.get_or_create(
            name=size_name,
            type='accessories',
            defaults={
                'sort_order': accessory_sizes.index(size_name) + 1,
                'status': 'published'
            }
        )
        sizes.append(size)
    
    return sizes

def get_or_create_colors():
    """Obtener o crear colores"""
    colors = []
    
    color_data = [
        ('Negro', '#000000'),
        ('Blanco', '#FFFFFF'),
        ('Rojo', '#FF0000'),
        ('Azul', '#0000FF'),
        ('Verde', '#00FF00'),
        ('Gris', '#808080'),
        ('Rosa', '#FFC0CB'),
        ('Amarillo', '#FFFF00'),
        ('Marrón', '#A52A2A'),
        ('Morado', '#800080')
    ]
    
    for color_name, hex_code in color_data:
        color, created = Color.objects.get_or_create(
            name=color_name,
            defaults={
                'hex_code': hex_code,
                'status': 'published'
            }
        )
        colors.append(color)
    
    return colors

def create_product_variants(product, sizes, colors):
    """Crear variantes para un producto"""
    variants = []
    
    # Obtener tallas apropiadas según la categoría
    if product.category.name in ['Zapatos']:
        product_sizes = [s for s in sizes if s.type == 'shoes']
    elif product.category.name in ['Accesorios']:
        product_sizes = [s for s in sizes if s.type == 'accessories']
    else:
        product_sizes = [s for s in sizes if s.type == 'clothing']
    
    # Crear variantes con diferentes combinaciones de talla y color
    for size in product_sizes[:3]:  # Máximo 3 tallas por producto
        for color in colors[:2]:  # Máximo 2 colores por producto
            variant = ProductVariant.objects.create(
                product=product,
                size=size,
                color=color,
                sku=f"{product.slug}-{size.name}-{color.name}".upper(),
                stock_quantity=random.randint(5, 50),
                is_active=True
            )
            variants.append(variant)
    
    return variants

def create_products():
    """Crear productos de prueba"""
    print("🏗️ Creando productos de prueba...")
    
    # Obtener datos necesarios
    categories = get_or_create_categories()
    brands = get_or_create_brands()
    sizes = get_or_create_sizes()
    colors = get_or_create_colors()
    
    # Productos para hombres
    men_products = [
        {
            'name': 'Camiseta Nike Dri-FIT Hombres',
            'slug': 'camiseta-nike-dri-fit-hombres',
            'description': 'Camiseta deportiva de alta calidad con tecnología Dri-FIT para mantenerte seco durante el ejercicio.',
            'short_description': 'Camiseta deportiva Nike Dri-FIT',
            'sku': 'NKE-DRI-FIT-M-001',
            'category': categories[0],  # Camisetas
            'brand': brands[0],  # Nike
            'gender': 'masculino',
            'price': Decimal('89900'),
            'compare_price': Decimal('119900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Pantalón Adidas Tiro Hombres',
            'slug': 'pantalon-adidas-tiro-hombres',
            'description': 'Pantalón deportivo cómodo y funcional, perfecto para entrenar o usar casualmente.',
            'short_description': 'Pantalón deportivo Adidas Tiro',
            'category': categories[1],  # Pantalones
            'brand': brands[1],  # Adidas
            'gender': 'masculino',
            'price': Decimal('149900'),
            'compare_price': Decimal('199900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Zapatos Nike Air Max Hombres',
            'slug': 'zapatos-nike-air-max-hombres',
            'description': 'Zapatos deportivos con tecnología Air Max para máxima comodidad y amortiguación.',
            'short_description': 'Zapatos Nike Air Max',
            'category': categories[2],  # Zapatos
            'brand': brands[0],  # Nike
            'gender': 'masculino',
            'price': Decimal('299900'),
            'compare_price': Decimal('399900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Gorra Puma Classic Hombres',
            'slug': 'gorra-puma-classic-hombres',
            'description': 'Gorra clásica con diseño moderno y ajuste cómodo.',
            'short_description': 'Gorra Puma Classic',
            'category': categories[3],  # Accesorios
            'brand': brands[2],  # Puma
            'gender': 'masculino',
            'price': Decimal('49900'),
            'compare_price': Decimal('69900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Chaqueta Under Armour Storm Hombres',
            'slug': 'chaqueta-under-armour-storm-hombres',
            'description': 'Chaqueta resistente al agua con tecnología Storm para mantenerte seco en cualquier clima.',
            'short_description': 'Chaqueta Under Armour Storm',
            'category': categories[4],  # Chaquetas
            'brand': brands[3],  # Under Armour
            'gender': 'masculino',
            'price': Decimal('199900'),
            'compare_price': Decimal('249900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Adidas Originals Hombres',
            'slug': 'camiseta-adidas-originals-hombres',
            'description': 'Camiseta clásica con el icónico logo de Adidas Originals.',
            'short_description': 'Camiseta Adidas Originals',
            'category': categories[0],  # Camisetas
            'brand': brands[1],  # Adidas
            'gender': 'masculino',
            'price': Decimal('79900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Pantalón Nike Sportswear Hombres',
            'slug': 'pantalon-nike-sportswear-hombres',
            'description': 'Pantalón casual deportivo con corte moderno y materiales de calidad.',
            'short_description': 'Pantalón Nike Sportswear',
            'category': categories[1],  # Pantalones
            'brand': brands[0],  # Nike
            'gender': 'masculino',
            'price': Decimal('129900'),
            'compare_price': Decimal('159900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Zapatos Adidas Ultraboost Hombres',
            'slug': 'zapatos-adidas-ultraboost-hombres',
            'description': 'Zapatos de running con tecnología Boost para máxima energía de retorno.',
            'short_description': 'Zapatos Adidas Ultraboost',
            'category': categories[2],  # Zapatos
            'brand': brands[1],  # Adidas
            'gender': 'masculino',
            'price': Decimal('399900'),
            'compare_price': Decimal('499900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Mochila Puma Backpack Hombres',
            'slug': 'mochila-puma-backpack-hombres',
            'description': 'Mochila deportiva con múltiples compartimentos y diseño ergonómico.',
            'short_description': 'Mochila Puma Backpack',
            'category': categories[3],  # Accesorios
            'brand': brands[2],  # Puma
            'gender': 'masculino',
            'price': Decimal('89900'),
            'compare_price': Decimal('119900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Chaqueta Nike Windrunner Hombres',
            'slug': 'chaqueta-nike-windrunner-hombres',
            'description': 'Chaqueta ligera y transpirable, perfecta para correr en clima fresco.',
            'short_description': 'Chaqueta Nike Windrunner',
            'category': categories[4],  # Chaquetas
            'brand': brands[0],  # Nike
            'gender': 'masculino',
            'price': Decimal('179900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        }
    ]
    
    # Productos para mujeres
    women_products = [
        {
            'name': 'Camiseta Nike Dri-FIT Mujeres',
            'slug': 'camiseta-nike-dri-fit-mujeres',
            'description': 'Camiseta deportiva diseñada específicamente para mujeres con tecnología Dri-FIT.',
            'short_description': 'Camiseta deportiva Nike Dri-FIT',
            'category': categories[0],  # Camisetas
            'brand': brands[0],  # Nike
            'gender': 'femenino',
            'price': Decimal('89900'),
            'compare_price': Decimal('119900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Pantalón Adidas Tiro Mujeres',
            'slug': 'pantalon-adidas-tiro-mujeres',
            'description': 'Pantalón deportivo con corte femenino, cómodo y funcional.',
            'short_description': 'Pantalón deportivo Adidas Tiro',
            'category': categories[1],  # Pantalones
            'brand': brands[1],  # Adidas
            'gender': 'femenino',
            'price': Decimal('139900'),
            'compare_price': Decimal('179900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Zapatos Nike Air Max Mujeres',
            'slug': 'zapatos-nike-air-max-mujeres',
            'description': 'Zapatos deportivos con tecnología Air Max, diseñados para el pie femenino.',
            'short_description': 'Zapatos Nike Air Max',
            'category': categories[2],  # Zapatos
            'brand': brands[0],  # Nike
            'gender': 'femenino',
            'price': Decimal('279900'),
            'compare_price': Decimal('359900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Gorra Puma Classic Mujeres',
            'slug': 'gorra-puma-classic-mujeres',
            'description': 'Gorra clásica con diseño femenino y ajuste cómodo.',
            'short_description': 'Gorra Puma Classic',
            'category': categories[3],  # Accesorios
            'brand': brands[2],  # Puma
            'gender': 'femenino',
            'price': Decimal('49900'),
            'compare_price': Decimal('69900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Chaqueta Under Armour Storm Mujeres',
            'slug': 'chaqueta-under-armour-storm-mujeres',
            'description': 'Chaqueta resistente al agua con corte femenino y tecnología Storm.',
            'short_description': 'Chaqueta Under Armour Storm',
            'category': categories[4],  # Chaquetas
            'brand': brands[3],  # Under Armour
            'gender': 'femenino',
            'price': Decimal('189900'),
            'compare_price': Decimal('229900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Camiseta Adidas Originals Mujeres',
            'slug': 'camiseta-adidas-originals-mujeres',
            'description': 'Camiseta clásica con diseño femenino y el icónico logo de Adidas Originals.',
            'short_description': 'Camiseta Adidas Originals',
            'category': categories[0],  # Camisetas
            'brand': brands[1],  # Adidas
            'gender': 'femenino',
            'price': Decimal('79900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Pantalón Nike Sportswear Mujeres',
            'slug': 'pantalon-nike-sportswear-mujeres',
            'description': 'Pantalón casual deportivo con corte femenino y materiales de calidad.',
            'short_description': 'Pantalón Nike Sportswear',
            'category': categories[1],  # Pantalones
            'brand': brands[0],  # Nike
            'gender': 'femenino',
            'price': Decimal('119900'),
            'compare_price': Decimal('149900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Zapatos Adidas Ultraboost Mujeres',
            'slug': 'zapatos-adidas-ultraboost-mujeres',
            'description': 'Zapatos de running con tecnología Boost, diseñados para mujeres.',
            'short_description': 'Zapatos Adidas Ultraboost',
            'category': categories[2],  # Zapatos
            'brand': brands[1],  # Adidas
            'gender': 'femenino',
            'price': Decimal('379900'),
            'compare_price': Decimal('479900'),
            'is_featured': True,
            'status': 'published'
        },
        {
            'name': 'Mochila Puma Backpack Mujeres',
            'slug': 'mochila-puma-backpack-mujeres',
            'description': 'Mochila deportiva con diseño femenino y múltiples compartimentos.',
            'short_description': 'Mochila Puma Backpack',
            'category': categories[3],  # Accesorios
            'brand': brands[2],  # Puma
            'gender': 'femenino',
            'price': Decimal('89900'),
            'compare_price': Decimal('119900'),
            'is_featured': False,
            'status': 'published'
        },
        {
            'name': 'Chaqueta Nike Windrunner Mujeres',
            'slug': 'chaqueta-nike-windrunner-mujeres',
            'description': 'Chaqueta ligera y transpirable, diseñada específicamente para mujeres.',
            'short_description': 'Chaqueta Nike Windrunner',
            'category': categories[4],  # Chaquetas
            'brand': brands[0],  # Nike
            'gender': 'femenino',
            'price': Decimal('169900'),
            'compare_price': None,
            'is_featured': False,
            'status': 'published'
        }
    ]
    
    # Crear productos para hombres
    print("👨 Creando productos para hombres...")
    for i, product_data in enumerate(men_products, 1):
        product = Product.objects.create(**product_data)
        create_product_variants(product, sizes, colors)
        print(f"  ✅ Producto {i}/10: {product.name}")
    
    # Crear productos para mujeres
    print("👩 Creando productos para mujeres...")
    for i, product_data in enumerate(women_products, 1):
        product = Product.objects.create(**product_data)
        create_product_variants(product, sizes, colors)
        print(f"  ✅ Producto {i}/10: {product.name}")
    
    print(f"🎉 ¡Productos creados exitosamente!")
    print(f"📊 Total de productos: {Product.objects.count()}")
    print(f"👨 Productos para hombres: {Product.objects.filter(gender='masculino').count()}")
    print(f"👩 Productos para mujeres: {Product.objects.filter(gender='femenino').count()}")
    print(f"🏷️ Categorías utilizadas: {len(categories)}")
    print(f"🏢 Marcas utilizadas: {len(brands)}")

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
