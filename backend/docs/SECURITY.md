# 🔒 Documentación de Seguridad - eCommerce Template

## Resumen de Mejoras Implementadas

Este documento describe las mejoras críticas de seguridad implementadas en el proyecto eCommerce, siguiendo las mejores prácticas OWASP y estándares de la industria.

## 🛡️ Características de Seguridad Implementadas

### 1. **Generación Segura de Claves**
- ✅ SECRET_KEY generada dinámicamente con `django.core.management.utils.get_random_secret_key()`
- ✅ Generación de API keys criptográficamente seguras
- ✅ Nonces únicos para Content Security Policy (CSP)
- ✅ Secretos OTP para autenticación de dos factores

### 2. **Content Security Policy (CSP)**
- ✅ Política CSP estricta implementada
- ✅ Nonces dinámicos por request para scripts y estilos
- ✅ Configuración específica para pasarelas de pago (Stripe, Wompi, MercadoPago)
- ✅ Prevención de ataques XSS

### 3. **Validación de Entrada Robusta**
- ✅ Validadores personalizados contra XSS y SQL Injection
- ✅ Sanitización de datos de usuario
- ✅ Validación de emails, URLs, teléfonos y direcciones
- ✅ Validación específica para datos de pago

### 4. **Autenticación Robusta**
- ✅ Sistema de autenticación seguro
- ✅ Protección contra ataques de fuerza bruta
- ✅ Bloqueo automático de cuentas
- ✅ Logging de eventos de seguridad

### 5. **Validación de Contraseñas Avanzada**
- ✅ Validadores de complejidad personalizados
- ✅ Prevención de reutilización de contraseñas
- ✅ Validación de fortaleza basada en entropía
- ✅ Detección de patrones comunes y secuencias

### 6. **Auditoría y Monitoreo**
- ✅ Logging de eventos de seguridad
- ✅ Detección de intentos de fuerza bruta
- ✅ Alertas de seguridad configurables
- ✅ Historial de contraseñas

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# Claves de seguridad (generar con comando de gestión)
SECRET_KEY=your-secure-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Configuración de email para 2FA
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Configuración de SMS para 2FA (opcional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Configuración de base de datos segura
DB_SSLMODE=require
```

### Comandos de Gestión

#### Generar Claves de Seguridad
```bash
python manage.py generate_security_keys --type all --output .env.security
```

#### Configurar 2FA para Usuario
```bash
# Generar claves de seguridad
python manage.py generate_security_keys --type all

# Verificar configuración de seguridad
python manage.py check --deploy
```

## 🚀 Uso de las APIs de Seguridad

### Endpoints de Seguridad

Los endpoints de seguridad están disponibles en `/api/security/` y proporcionan funcionalidades de auditoría y monitoreo.

#### Eventos de Seguridad
```http
GET /api/security/events/
Authorization: Bearer <token>
```

#### Configuración de Seguridad
```http
GET /api/security/config/
Authorization: Bearer <token>
```

## 🔍 Validadores de Seguridad

### Uso en Serializers

```python
from ecommerce.security.validators import SecurityValidator

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[SecurityValidator.validate_email])
    first_name = serializers.CharField(validators=[SecurityValidator.validate_name])
    phone = serializers.CharField(validators=[SecurityValidator.validate_phone])
    
    def validate(self, data):
        # Sanitizar datos
        for field in ['first_name', 'last_name', 'address']:
            if field in data:
                data[field] = SecurityValidator.sanitize_html(data[field])
        
        return data
```

### Uso en Vistas

```python
from ecommerce.security.validators import SecurityValidator

def create_payment(request):
    try:
        # Validar datos de pago
        payment_data = SecurityValidator.validate_payment_data(request.data)
        
        # Procesar pago...
        
    except ValidationError as e:
        return Response({'error': str(e)}, status=400)
```

## 🛡️ Headers de Seguridad

El middleware CSP implementa automáticamente los siguientes headers:

- `Content-Security-Policy`: Política CSP estricta
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: Restricciones de permisos

## 📊 Monitoreo y Alertas

### Eventos de Seguridad Registrados

- Login exitoso/fallido
- Cambios de contraseña
- Habilitación/deshabilitación de 2FA
- Bloqueo/desbloqueo de cuentas
- Actividad sospechosa
- Acceso de administrador
- Exportación de datos

### Configuración de Alertas

```python
# En settings.py
SECURITY_LOGGING = {
    'LOGIN_ATTEMPTS': True,
    'FAILED_LOGINS': True,
    'ADMIN_ACCESS': True,
    'SENSITIVE_OPERATIONS': True,
}
```

## 🔐 Mejores Prácticas Implementadas

### 1. **Principio de Menor Privilegio**
- Validación estricta de permisos
- Acceso mínimo necesario a recursos
- Separación de responsabilidades

### 2. **Defensa en Profundidad**
- Múltiples capas de validación
- Autenticación multifactor
- Monitoreo continuo

### 3. **Validación de Entrada**
- Sanitización de todos los datos
- Validación en frontend y backend
- Prevención de inyecciones

### 4. **Gestión de Sesiones**
- Sesiones seguras con HttpOnly
- Expiración automática
- Rotación de tokens

### 5. **Cifrado y Hashing**
- Contraseñas hasheadas con bcrypt
- Tokens JWT firmados
- Datos sensibles cifrados

## 🚨 Respuesta a Incidentes

### Detección Automática
- Bloqueo automático por intentos fallidos
- Alertas de actividad sospechosa
- Logging detallado de eventos

### Proceso de Respuesta
1. **Detección**: Sistema automático + monitoreo manual
2. **Contención**: Bloqueo de cuentas/IPs comprometidas
3. **Eradicación**: Limpieza de vulnerabilidades
4. **Recuperación**: Restauración de servicios
5. **Lecciones**: Análisis post-incidente

## 📈 Métricas de Seguridad

### KPIs Recomendados
- Tiempo de detección de incidentes
- Tiempo de respuesta a alertas
- Número de intentos de fuerza bruta bloqueados
- Porcentaje de usuarios con 2FA habilitado
- Frecuencia de rotación de claves

## 🔄 Mantenimiento

### Tareas Regulares
- [ ] Rotar claves cada 90 días
- [ ] Revisar logs de seguridad semanalmente
- [ ] Actualizar dependencias de seguridad
- [ ] Auditar permisos de usuario mensualmente
- [ ] Probar procedimientos de respuesta a incidentes

### Actualizaciones de Seguridad
- [ ] Monitorear CVE de dependencias
- [ ] Aplicar parches de seguridad inmediatamente
- [ ] Revisar configuraciones de seguridad trimestralmente
- [ ] Actualizar políticas de seguridad anualmente

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)

---

**⚠️ IMPORTANTE**: Esta documentación debe mantenerse actualizada con cualquier cambio en las configuraciones de seguridad. Revisar regularmente y actualizar según sea necesario.
