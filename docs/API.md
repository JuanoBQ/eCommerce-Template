# Documentación de la API - Ecommerce de Ropa

Esta documentación describe todos los endpoints disponibles en la API del ecommerce.

## 🔗 Base URL

```
http://localhost:8000/api/
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header `Authorization`:

```
Authorization: Bearer <tu_token_aqui>
```

### Obtener Token

```bash
POST /api/auth/login/
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "tu_password"
}
```

### Respuesta

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 👤 Usuarios

### Obtener Perfil

```bash
GET /api/users/profile/
Authorization: Bearer <token>
```

### Actualizar Perfil

```bash
PATCH /api/users/profile/
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+573001234567"
}
```

### Cambiar Contraseña

```bash
POST /api/users/profile/change-password/
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "password_actual",
  "new_password": "nuevo_password",
  "new_password_confirm": "nuevo_password"
}
```

### Direcciones

#### Listar Direcciones

```bash
GET /api/users/addresses/
Authorization: Bearer <token>
```

#### Crear Dirección

```bash
POST /api/users/addresses/
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "home",
  "is_default": true,
  "street_address": "Calle 123 #45-67",
  "city": "Bogotá",
  "state": "Cundinamarca",
  "country": "Colombia",
  "postal_code": "110111",
  "contact_name": "Juan Pérez",
  "contact_phone": "+573001234567"
}
```

## 🛍️ Productos

### Listar Productos

```bash
GET /api/products/
```

**Parámetros de consulta:**
- `category`: ID de categoría
- `brand`: ID de marca
- `min_price`: Precio mínimo
- `max_price`: Precio máximo
- `is_featured`: Productos destacados (true/false)
- `is_in_stock`: En stock (true/false)
- `search`: Búsqueda por texto
- `ordering`: Ordenamiento (name, price, created_at, -price, etc.)

**Ejemplo:**
```bash
GET /api/products/?category=1&min_price=50000&max_price=200000&ordering=-created_at
```

### Obtener Producto

```bash
GET /api/products/{id}/
```

### Buscar Productos

```bash
GET /api/products/search/
```

**Parámetros adicionales:**
- `size`: ID de talla
- `color`: ID de color

### Productos Destacados

```bash
GET /api/products/featured/
```

### Productos Relacionados

```bash
GET /api/products/{id}/related/
```

### Variantes de Producto

```bash
GET /api/products/{id}/variants/
```

### Reseñas de Producto

```bash
GET /api/products/{id}/reviews/
```

#### Crear Reseña

```bash
POST /api/products/{id}/reviews/
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excelente producto",
  "comment": "Muy buena calidad, lo recomiendo"
}
```

## 🛒 Carrito

### Obtener Carrito

```bash
GET /api/cart/
Authorization: Bearer <token>
```

### Agregar al Carrito

```bash
POST /api/cart/items/
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": 1,
  "quantity": 2,
  "variant": 1  // Opcional
}
```

### Actualizar Item del Carrito

```bash
PATCH /api/cart/items/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Eliminar del Carrito

```bash
DELETE /api/cart/items/{id}/
Authorization: Bearer <token>
```

### Vaciar Carrito

```bash
DELETE /api/cart/clear/
Authorization: Bearer <token>
```

### Lista de Deseos

#### Obtener Wishlist

```bash
GET /api/cart/wishlist/
Authorization: Bearer <token>
```

#### Agregar a Wishlist

```bash
POST /api/cart/wishlist/
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": 1
}
```

#### Eliminar de Wishlist

```bash
DELETE /api/cart/wishlist/{id}/
Authorization: Bearer <token>
```

## 📦 Pedidos

### Listar Pedidos

```bash
GET /api/orders/
Authorization: Bearer <token>
```

**Parámetros:**
- `status`: Estado del pedido
- `payment_status`: Estado del pago
- `date_from`: Fecha desde (YYYY-MM-DD)
- `date_to`: Fecha hasta (YYYY-MM-DD)

### Crear Pedido

```bash
POST /api/orders/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "phone": "+573001234567",
  "shipping_first_name": "Juan",
  "shipping_last_name": "Pérez",
  "shipping_address": "Calle 123 #45-67",
  "shipping_city": "Bogotá",
  "shipping_state": "Cundinamarca",
  "shipping_country": "Colombia",
  "shipping_postal_code": "110111",
  "payment_method": "credit_card",
  "notes": "Entregar en horario de oficina"
}
```

### Obtener Pedido

```bash
GET /api/orders/{id}/
Authorization: Bearer <token>
```

### Cancelar Pedido

```bash
POST /api/orders/{id}/cancel/
Authorization: Bearer <token>
```

### Items del Pedido

```bash
GET /api/orders/{id}/items/
Authorization: Bearer <token>
```

### Historial de Estados

```bash
GET /api/orders/{id}/status-history/
Authorization: Bearer <token>
```

## 💳 Pagos

### Listar Pagos

```bash
GET /api/payments/
Authorization: Bearer <token>
```

### Crear Pago

```bash
POST /api/payments/
Authorization: Bearer <token>
Content-Type: application/json

{
  "order": 1,
  "amount": 150000,
  "method": "credit_card",
  "provider": "wompi"
}
```

### Procesar Pago

```bash
POST /api/payments/{id}/process/
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_data": {
    "card_number": "4111111111111111",
    "exp_month": "12",
    "exp_year": "2025",
    "cvv": "123",
    "card_holder_name": "Juan Pérez"
  }
}
```

### Reembolsos

#### Listar Reembolsos

```bash
GET /api/payments/refunds/
Authorization: Bearer <token>
```

#### Crear Reembolso

```bash
POST /api/payments/refunds/
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment": 1,
  "amount": 150000,
  "type": "full",
  "reason": "Producto defectuoso"
}
```

### Métodos de Pago

#### Listar Métodos Guardados

```bash
GET /api/payments/methods/
Authorization: Bearer <token>
```

#### Agregar Método de Pago

```bash
POST /api/payments/methods/
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "credit_card",
  "provider": "wompi",
  "card_last_four": "1111",
  "card_brand": "visa",
  "card_exp_month": "12",
  "card_exp_year": "2025",
  "card_holder_name": "Juan Pérez",
  "provider_payment_method_id": "pm_123456789"
}
```

## 📊 Reportes

### Dashboard

```bash
GET /api/reports/dashboard/
Authorization: Bearer <token>
```

### Reportes de Ventas

```bash
GET /api/reports/sales/
Authorization: Bearer <token>
```

**Parámetros:**
- `type`: daily, weekly, monthly, yearly, custom
- `start_date`: Fecha inicio (YYYY-MM-DD)
- `end_date`: Fecha fin (YYYY-MM-DD)

### Analytics de Producto

```bash
GET /api/reports/products/{id}/analytics/
Authorization: Bearer <token>
```

### Analytics de Cliente

```bash
GET /api/reports/customers/{id}/analytics/
Authorization: Bearer <token>
```

### Analytics del Sitio Web

```bash
GET /api/reports/website/
Authorization: Bearer <token>
```

## 🏷️ Categorías

### Listar Categorías

```bash
GET /api/categories/
```

### Obtener Categoría

```bash
GET /api/categories/{id}/
```

### Marcas

```bash
GET /api/categories/brands/
```

### Tallas

```bash
GET /api/categories/sizes/
```

### Colores

```bash
GET /api/categories/colors/
```

## 🔍 Búsqueda

### Búsqueda Global

```bash
GET /api/search/
```

**Parámetros:**
- `q`: Término de búsqueda
- `type`: product, category, brand
- `category`: Filtrar por categoría
- `brand`: Filtrar por marca
- `min_price`: Precio mínimo
- `max_price`: Precio máximo

## 📱 Autenticación Social

### Google

```bash
GET /api/auth/social/google/
```

### Facebook

```bash
GET /api/auth/social/facebook/
```

## 🔄 Webhooks

### Wompi

```bash
POST /api/payments/webhooks/wompi/
Content-Type: application/json

{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "123456789",
      "status": "APPROVED",
      "amount_in_cents": 15000000,
      "reference": "ORDER_123"
    }
  }
}
```

### MercadoPago

```bash
POST /api/payments/webhooks/mercadopago/
Content-Type: application/json

{
  "id": 123456789,
  "live_mode": false,
  "type": "payment",
  "date_created": "2023-01-01T00:00:00Z",
  "data": {
    "id": "123456789"
  }
}
```

## 📄 Respuestas de Error

### Formato de Error

```json
{
  "detail": "Mensaje de error",
  "errors": {
    "field_name": ["Error específico del campo"]
  }
}
```

### Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error interno del servidor

## 🔧 Filtros y Ordenamiento

### Filtros Disponibles

La mayoría de endpoints soportan filtros usando parámetros de consulta:

```bash
GET /api/products/?category=1&brand=2&min_price=50000&max_price=200000
```

### Ordenamiento

```bash
GET /api/products/?ordering=name          # Ascendente
GET /api/products/?ordering=-price        # Descendente
GET /api/products/?ordering=name,price    # Múltiples campos
```

### Paginación

```bash
GET /api/products/?page=2&page_size=20
```

**Respuesta paginada:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/products/?page=3",
  "previous": "http://localhost:8000/api/products/?page=1",
  "results": [...]
}
```

## 📚 Ejemplos de Uso

### Flujo Completo de Compra

1. **Buscar productos**
```bash
GET /api/products/?search=camiseta
```

2. **Agregar al carrito**
```bash
POST /api/cart/items/
{
  "product": 1,
  "quantity": 2
}
```

3. **Crear pedido**
```bash
POST /api/orders/
{
  "email": "usuario@ejemplo.com",
  "shipping_first_name": "Juan",
  "shipping_last_name": "Pérez",
  "shipping_address": "Calle 123 #45-67",
  "shipping_city": "Bogotá",
  "shipping_state": "Cundinamarca",
  "shipping_country": "Colombia",
  "shipping_postal_code": "110111"
}
```

4. **Procesar pago**
```bash
POST /api/payments/
{
  "order": 1,
  "amount": 150000,
  "method": "credit_card",
  "provider": "wompi"
}
```

5. **Confirmar pago**
```bash
POST /api/payments/1/process/
{
  "payment_data": {
    "card_number": "4111111111111111",
    "exp_month": "12",
    "exp_year": "2025",
    "cvv": "123"
  }
}
```

---

Para más información, consulta la documentación interactiva en:
- **Swagger UI**: `http://localhost:8000/swagger/`
- **ReDoc**: `http://localhost:8000/redoc/`
