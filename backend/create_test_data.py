#!/usr/bin/env python
import os
import django
from decimal import Decimal
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from ecommerce.apps.categories.models import Category, Brand, Size, Color
from ecommerce.apps.products.models import Product, ProductVariant

def clear_data():
    """Limpiar todos los datos existentes"""
    print("🧹 Limpiando datos existentes...")
    
    # Eliminar productos y variantes
    Product.objects.all().delete()
    ProductVariant.objects.all().delete()
    
    # Eliminar categorías y marcas
    Category.objects.all().delete()
    Brand.objects.all().delete()
    
    print("✅ Datos limpiados correctamente")

def create_categories():
    """Crear 5 categorías"""
    print("📁 Creando categorías...")
    
    categories_data = [
        {
            'name': 'Ropa Deportiva',
            'slug': 'ropa-deportiva',
            'description': 'Ropa para actividades deportivas y fitness',
            'is_active': True,
            'sort_order': 1
        },
        {
            'name': 'Calzado',
            'slug': 'calzado',
            'description': 'Zapatos deportivos y casuales',
            'is_active': True,
            'sort_order': 2
        },
        {
            'name': 'Accesorios',
            'slug': 'accesorios',
            'description': 'Accesorios deportivos y de moda',
            'is_active': True,
            'sort_order': 3
        },
        {
            'name': 'Ropa Casual',
            'slug': 'ropa-casual',
            'description': 'Ropa casual para el día a día',
            'is_active': True,
            'sort_order': 4
        },
        {
            'name': 'Equipamiento',
            'slug': 'equipamiento',
            'description': 'Equipamiento deportivo y accesorios',
            'is_active': True,
            'sort_order': 5
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories.append(category)
        print(f"  ✅ {category.name}")
    
    return categories

def create_brands():
    """Crear marcas"""
    print("🏷️ Creando marcas...")
    
    brands_data = [
        {'name': 'Nike', 'slug': 'nike'},
        {'name': 'Adidas', 'slug': 'adidas'},
        {'name': 'Puma', 'slug': 'puma'},
        {'name': 'Under Armour', 'slug': 'under-armour'},
        {'name': 'Reebok', 'slug': 'reebok'}
    ]
    
    brands = []
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            slug=brand_data['slug'],
            defaults={
                **brand_data,
                'is_active': True,
                'sort_order': 0
            }
        )
        brands.append(brand)
        print(f"  ✅ {brand.name}")
    
    return brands

def create_products(categories, brands):
    """Crear 20 productos (10 hombres, 10 mujeres) distribuidos en diferentes categorías"""
    print("👕 Creando productos...")
    
    # Productos para hombres
    men_products = [
        # Ropa Deportiva
        {'name': 'Camiseta Nike Dri-FIT', 'category': 'Ropa Deportiva', 'brand': 'Nike', 'gender': 'masculino'},
        {'name': 'Pantalón Adidas Training', 'category': 'Ropa Deportiva', 'brand': 'Adidas', 'gender': 'masculino'},
        {'name': 'Sudadera Puma Classic', 'category': 'Ropa Deportiva', 'brand': 'Puma', 'gender': 'masculino'},
        
        # Calzado
        {'name': 'Zapatillas Nike Air Max', 'category': 'Calzado', 'brand': 'Nike', 'gender': 'masculino'},
        {'name': 'Tenis Adidas Ultraboost', 'category': 'Calzado', 'brand': 'Adidas', 'gender': 'masculino'},
        
        # Ropa Casual
        {'name': 'Polo Under Armour', 'category': 'Ropa Casual', 'brand': 'Under Armour', 'gender': 'masculino'},
        {'name': 'Jeans Puma Relaxed', 'category': 'Ropa Casual', 'brand': 'Puma', 'gender': 'masculino'},
        
        # Accesorios
        {'name': 'Gorra Nike Classic', 'category': 'Accesorios', 'brand': 'Nike', 'gender': 'masculino'},
        {'name': 'Mochila Adidas', 'category': 'Accesorios', 'brand': 'Adidas', 'gender': 'masculino'},
        
        # Equipamiento
        {'name': 'Guantes Reebok Training', 'category': 'Equipamiento', 'brand': 'Reebok', 'gender': 'masculino'}
    ]
    
    # Productos para mujeres
    women_products = [
        # Ropa Deportiva
        {'name': 'Top Nike Pro', 'category': 'Ropa Deportiva', 'brand': 'Nike', 'gender': 'femenino'},
        {'name': 'Leggings Adidas Yoga', 'category': 'Ropa Deportiva', 'brand': 'Adidas', 'gender': 'femenino'},
        {'name': 'Sudadera Puma Oversized', 'category': 'Ropa Deportiva', 'brand': 'Puma', 'gender': 'femenino'},
        
        # Calzado
        {'name': 'Zapatillas Nike React', 'category': 'Calzado', 'brand': 'Nike', 'gender': 'femenino'},
        {'name': 'Tenis Adidas NMD', 'category': 'Calzado', 'brand': 'Adidas', 'gender': 'femenino'},
        
        # Ropa Casual
        {'name': 'Blusa Under Armour', 'category': 'Ropa Casual', 'brand': 'Under Armour', 'gender': 'femenino'},
        {'name': 'Short Puma High Waist', 'category': 'Ropa Casual', 'brand': 'Puma', 'gender': 'femenino'},
        
        # Accesorios
        {'name': 'Bandana Nike', 'category': 'Accesorios', 'brand': 'Nike', 'gender': 'femenino'},
        {'name': 'Riñonera Adidas', 'category': 'Accesorios', 'brand': 'Adidas', 'gender': 'femenino'},
        
        # Equipamiento
        {'name': 'Cinta Reebok Resistance', 'category': 'Equipamiento', 'brand': 'Reebok', 'gender': 'femenino'}
    ]
    
    all_products = men_products + women_products
    
    # Crear diccionarios para búsqueda rápida
    categories_dict = {cat.name: cat for cat in categories}
    brands_dict = {brand.name: brand for brand in brands}
    
    created_products = []
    
    for i, product_data in enumerate(all_products, 1):
        # Generar SKU único
        sku = f"PROD-{i:03d}-{product_data['gender'][:3].upper()}"
        
        # Precio aleatorio entre 50,000 y 200,000
        price = Decimal(str(random.randint(50000, 200000)))
        
        # Crear producto
        product = Product.objects.create(
            name=product_data['name'],
            slug=f"{product_data['name'].lower().replace(' ', '-')}-{i}",
            short_description=f"Descripción corta de {product_data['name']}",
            description=f"Descripción completa de {product_data['name']}. Producto de alta calidad para {product_data['gender']}.",
            price=price,
            sku=sku,
            category=categories_dict[product_data['category']],
            brand=brands_dict[product_data['brand']],
            gender=product_data['gender'],
            status='published',
            is_featured=random.choice([True, False]),
            inventory_quantity=random.randint(10, 100),
            compare_price=price * Decimal('1.2') if random.choice([True, False]) else None
        )
        
        created_products.append(product)
        print(f"  ✅ {product.name} - {product.category.name} - {product.brand.name} - {product.gender}")
    
    return created_products

def main():
    """Función principal"""
    print("🚀 Iniciando creación de datos de prueba...")
    
    # Limpiar datos existentes
    clear_data()
    
    # Crear categorías
    categories = create_categories()
    
    # Crear marcas
    brands = create_brands()
    
    # Crear productos
    products = create_products(categories, brands)
    
    print(f"\n✅ ¡Datos creados exitosamente!")
    print(f"📁 Categorías: {len(categories)}")
    print(f"🏷️ Marcas: {len(brands)}")
    print(f"👕 Productos: {len(products)}")
    
    # Mostrar resumen por categoría
    print(f"\n📊 Resumen por categoría:")
    for category in categories:
        count = category.products.filter(status='published').count()
        print(f"  {category.name}: {count} productos")
    
    # Mostrar resumen por marca
    print(f"\n📊 Resumen por marca:")
    for brand in brands:
        count = brand.products.filter(status='published').count()
        print(f"  {brand.name}: {count} productos")

if __name__ == "__main__":
    main()