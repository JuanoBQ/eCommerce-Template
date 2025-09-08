# 🔒 Guía de Integración de Pasarelas de Pago

Esta guía explica cómo utilizar las pasarelas de pago **Wompi** y **MercadoPago** integradas en el sistema de ecommerce.

## ✨ Características Implementadas

### 🚀 Integración Completa
- ✅ **Wompi** - Pasarela líder en Colombia
- ✅ **MercadoPago** - Pasarela líder en Latinoamérica
- ✅ **Selector dinámico** de proveedores según país/moneda
- ✅ **Webhooks** para actualización automática de estado
- ✅ **Reembolsos** automáticos y manuales
- ✅ **Verificación** de estado de pagos
- ✅ **Interfaz unificada** en el checkout

### 🎯 Flujo de Pago
1. El usuario selecciona productos y va al checkout
2. Completa información personal y dirección
3. **Selecciona método de pago** (tradicional o pasarela)
4. Para pasarelas: **Se redirige de forma segura** a la plataforma de pago
5. Completa el pago en la pasarela externa
6. **Regresa automáticamente** con confirmación
7. **Orden y pago actualizados** automáticamente

## 🛠️ Configuración

### 1. Variables de Entorno

Copia y configura las variables de entorno:

```bash
cp .env.payments.example backend/.env
```

### 2. Obtener Credenciales

#### Wompi (Colombia)
1. Regístrate en [https://comercios.wompi.co](https://comercios.wompi.co)
2. Obtén tus claves en el panel de desarrollador
3. Configura webhooks apuntando a: `https://tu-dominio.com/api/payments/webhooks/wompi/`

#### MercadoPago
1. Regístrate en [https://www.mercadopago.com.co/developers](https://www.mercadopago.com.co/developers)
2. Crea una aplicación y obtén tus credenciales
3. Configura webhooks apuntando a: `https://tu-dominio.com/api/payments/webhooks/mercadopago/`

### 3. Configuración en Django

Las credenciales se cargan automáticamente desde las variables de entorno. El sistema incluye **valores de prueba** para desarrollo.

## 💻 Uso en el Frontend

### Métodos de Pago Disponibles

El checkout ahora incluye **métodos tradicionales** y **pagos en línea**:

**Tradicionales:**
- 💰 Pago Contra Entrega
- 🏦 Transferencia Bancaria

**Pagos en Línea:**
- 💳 Tarjetas con Wompi
- 🅿️ MercadoPago

### Componente PaymentMethodSelector

```tsx
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';

<PaymentMethodSelector
  selectedMethod={paymentMethod}
  onMethodChange={setPaymentMethod}
  onPaymentSuccess={handleSuccess}
  onPaymentError={handleError}
  orderId={order.id}
  amount={totalAmount}
/>
```

## 🔧 API Endpoints

### Backend Endpoints Disponibles

```
# Obtener proveedores disponibles
GET /api/payments/providers/?country=CO&currency=COP

# Crear intención de pago
POST /api/payments/payments/create_payment_intent/
{
  "order_id": 123,
  "provider": "wompi"
}

# Verificar estado de pago
POST /api/payments/payments/{payment_id}/verify_payment/

# Procesar reembolso
POST /api/payments/payments/{payment_id}/refund_payment/
{
  "amount": 50000,  // Opcional, si no se especifica es reembolso total
  "reason": "Solicitud del cliente"
}

# Webhooks (automáticos)
POST /api/payments/webhooks/wompi/
POST /api/payments/webhooks/mercadopago/
```

## 🎨 Experiencia de Usuario

### Flujo Tradicional (Sin cambios)
1. Usuario selecciona "Pago Contra Entrega" o "Transferencia"
2. Completa formulario y hace clic en "Finalizar Compra"
3. Orden creada, confirmación inmediata

### Flujo con Pasarelas (Nuevo)
1. Usuario selecciona "Tarjetas con Wompi" o "MercadoPago"
2. Completa formulario y hace clic en "Finalizar Compra"
3. **Orden creada** en estado pendiente
4. **Aparece componente de pago** con botón "Proceder al Pago"
5. **Redirección segura** a la pasarela externa
6. Usuario completa pago en plataforma segura
7. **Redirección automática** de vuelta al sitio
8. **Confirmación de pago exitoso**

## 🛡️ Seguridad

### Características de Seguridad Implementadas
- ✅ **Encriptación SSL** en todas las comunicaciones
- ✅ **Verificación de webhooks** con firmas HMAC
- ✅ **Tokens únicos** para cada transacción
- ✅ **No almacenamiento** de información sensible de tarjetas
- ✅ **Validación** de estado de pago en servidor
- ✅ **Logs de auditoría** para todas las transacciones

### Información Almacenada
- ✅ Estado de la transacción
- ✅ ID de referencia de la pasarela
- ✅ Últimos 4 dígitos de tarjeta (cuando aplique)
- ✅ Marca de tarjeta (Visa, Mastercard, etc.)
- ❌ **Nunca almacenamos**: Número completo de tarjeta, CVV, o PIN

## 🔍 Testing

### Tarjetas de Prueba para Wompi
```
Visa: 4242424242424242
Mastercard: 5555555555554444
CVV: 123
Fecha: Cualquier fecha futura
```

### Usuarios de Prueba para MercadoPago
```
Email: test_user_12345678@testuser.com
Password: qatest1234
```

## 📊 Monitoreo

### Logs del Sistema
Los pagos se registran con logs detallados:
```
🔍 WompiService - Creando intención de pago
🔍 PaymentForm - Redirigiendo a URL de pago
🔍 Webhook - Pago completado exitosamente
```

### Estados de Pago
- `pending` - Pago iniciado, esperando confirmación
- `processing` - Pago en proceso
- `completed` - Pago completado exitosamente
- `failed` - Pago falló
- `cancelled` - Pago cancelado por el usuario
- `refunded` - Pago reembolsado

## 🚀 Producción

### Lista de Verificación
- [ ] Configurar credenciales de producción
- [ ] Configurar SSL/HTTPS
- [ ] Configurar webhooks en production
- [ ] Configurar URLs de producción en variables de entorno
- [ ] Probar flujo completo en ambiente de staging
- [ ] Configurar monitoreo de transacciones
- [ ] Revisar logs de errores regularmente

### URLs de Webhook para Producción
```
Wompi: https://tu-dominio.com/api/payments/webhooks/wompi/
MercadoPago: https://tu-dominio.com/api/payments/webhooks/mercadopago/
```

## 🆘 Soporte

### Problemas Comunes

**Error: "Proveedor no disponible"**
- Verificar configuración de variables de entorno
- Confirmar que las credenciales son correctas

**Webhook no funciona**
- Verificar configuración de URL en la pasarela
- Confirmar que el servidor es accesible desde internet

**Pago queda en pendiente**
- Los webhooks pueden tomar tiempo
- El sistema verifica automáticamente cada 5 segundos
- Verificar configuración de webhook_secret

### Contacto
Para soporte técnico:
- 📧 **Email**: soporte@tu-dominio.com
- 📞 **Teléfono**: +57 300 123 4567

---

**Desarrollado con ❤️ para un ecommerce seguro y eficiente**
