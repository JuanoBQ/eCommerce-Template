#!/usr/bin/env python3
"""
Script para probar la API de productos desde la perspectiva del admin
"""

import requests
import json

def test_admin_product():
    """Probar la API de productos para admin"""
    
    # URL de la API
    base_url = "http://localhost:8000/api"
    product_id = 111  # ID del producto a probar
    
    print(f"🔍 Probando API de productos para admin: {base_url}/products/{product_id}/")
    
    try:
        # Hacer petición GET al endpoint de productos
        response = requests.get(f"{base_url}/products/{product_id}/")
        
        if response.status_code == 200:
            print("✅ Respuesta exitosa")
            
            # Parsear respuesta JSON
            data = response.json()
            
            # Mostrar información relevante
            print(f"📦 Producto: {data.get('name', 'N/A')}")
            print(f"🔗 Slug: {data.get('slug', 'N/A')}")
            print(f"📝 Descripción: {data.get('description', 'N/A')}")
            print(f"📝 Descripción corta: {data.get('short_description', 'N/A')}")
            print(f"🏷️ SKU: {data.get('sku', 'N/A')}")
            print(f"💰 Precio: {data.get('price', 'N/A')}")
            print(f"📊 Estado: {data.get('status', 'N/A')}")
            
            # Verificar campos específicos
            print("\n🔍 Verificación de campos:")
            print(f"   - description existe: {'description' in data}")
            print(f"   - description no es None: {data.get('description') is not None}")
            print(f"   - description no está vacío: {bool(data.get('description', '').strip())}")
            print(f"   - description longitud: {len(data.get('description', ''))}")
            
            # Mostrar todas las keys disponibles
            print(f"\n📋 Keys disponibles: {list(data.keys())}")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    test_admin_product()
