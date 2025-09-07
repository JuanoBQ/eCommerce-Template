#!/usr/bin/env python
import requests
import json

# Verificar la respuesta de la API
url = "http://localhost:8000/api/products/111/"
print(f"🔍 Verificando API: {url}")

try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print("✅ Respuesta exitosa")
        print(f"Keys disponibles: {list(data.keys())}")
        print(f"Descripción: {repr(data.get('description', 'NOT FOUND'))}")
        if 'description' in data:
            print(f"Longitud de descripción: {len(data['description'])}")
        else:
            print("❌ Campo 'description' no encontrado en la respuesta")
    else:
        print(f"❌ Error HTTP: {response.status_code}")
        print(f"Respuesta: {response.text}")
except Exception as e:
    print(f"❌ Error de conexión: {e}")
