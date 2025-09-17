# 🛍️ eCommerce Template - Solución Completa

Un ecommerce moderno y escalable construido con **Django 4.2 + DRF** (backend) y **Next.js 14** (frontend), optimizado para múltiples segmentos (retail e industrial) con integración de pagos, panel administrativo avanzado y arquitectura preparada para producción.

## 🚀 Características

### Frontend (Next.js 14)
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS + shadcn/ui
- **Gráficas**: Recharts para dashboards
- **Autenticación**: JWT con dj-rest-auth
- **Estado**: React Query para manejo de estado del servidor

### Backend (Django + DRF)
- **Framework**: Django 4.2 + Django REST Framework
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT con dj-rest-auth + Django Allauth
- **Pagos**: Integración con Wompi y MercadoPago
- **Cache**: Redis
- **Tareas**: Celery para tareas asíncronas

### Funcionalidades Principales

#### Tienda Pública
- ✅ Catálogo de productos con filtros avanzados
- ✅ Detalle de producto con variantes (tallas, colores)
- ✅ Carrito de compras persistente
- ✅ Proceso de checkout completo
- ✅ Sistema de reseñas y calificaciones
- ✅ Lista de deseos (wishlist)
- ✅ Búsqueda de productos
- ✅ Registro y login de usuarios
- ✅ Perfil de usuario con direcciones
- ✅ Historial de pedidos

#### Panel de Administración (Estilo Shopify)
- ✅ Dashboard con métricas y gráficos
- ✅ Gestión completa de productos (CRUD)
- ✅ Gestión de categorías y marcas
- ✅ Control de inventario y stock
- ✅ Gestión de pedidos y estados
- ✅ Gestión de usuarios y clientes
- ✅ Reportes de ventas y analytics
- ✅ Widgets personalizables del dashboard
- ✅ Gestión de pagos y reembolsos

## 📁 Estructura del Proyecto

```
ecommerce-template/
├── backend/                    # Backend Django
│   ├── ecommerce/             # Proyecto principal
│   │   ├── apps/              # Aplicaciones Django
│   │   │   ├── products/      # Gestión de productos
│   │   │   ├── categories/    # Categorías y marcas
│   │   │   ├── users/         # Usuarios y perfiles
│   │   │   ├── cart/          # Carrito y wishlist
│   │   │   ├── orders/        # Pedidos
│   │   │   ├── payments/      # Pagos
│   │   │   └── reports/       # Reportes y analytics
│   │   ├── settings.py        # Configuración
│   │   └── urls.py           # URLs principales
│   ├── requirements.txt       # Dependencias Python
│   └── manage.py             # Script de Django
├── frontend/                  # Frontend Next.js
│   ├── src/
│   │   ├── app/              # App Router de Next.js
│   │   │   ├── admin/        # Panel de administración
│   │   │   ├── shop/         # Tienda pública
│   │   │   ├── auth/         # Autenticación
│   │   │   └── profile/      # Perfil de usuario
│   │   ├── components/       # Componentes React
│   │   ├── hooks/           # Hooks personalizados
│   │   ├── lib/             # Utilidades y API
│   │   ├── types/           # Tipos TypeScript
│   │   └── styles/          # Estilos globales
│   ├── package.json         # Dependencias Node.js
│   └── tailwind.config.js   # Configuración Tailwind
└── docs/                    # Documentación
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- **Python**: 3.8+ (compatible con 3.8, 3.9, 3.10, 3.11, 3.12, 3.13+)
- **Node.js**: 18+
- **PostgreSQL**: 12+ (opcional, también funciona con SQLite)
- **Redis**: 6+ (opcional, tiene fallback a cache local)

### 🚀 Instalación Rápida

#### Opción 1: Script Automático (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/JuanoBQ/eCommerce-Template.git
cd eCommerce-Template/backend

# Ejecutar script de instalación automática
python install_dependencies.py

# Verificar que todo esté funcionando
python test_setup.py

# Ejecutar migraciones
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

#### Opción 2: Instalación Manual

### Backend (Django)

1. **Clonar el repositorio**
```bash
git clone https://github.com/JuanoBQ/eCommerce-Template.git
cd eCommerce-Template/backend
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
# Actualizar pip y setuptools
pip install --upgrade pip setuptools wheel

# Instalar todas las dependencias
pip install -r requirements.txt
```

4. **Verificar instalación**
```bash
# Verificar que todas las importaciones funcionen
python verify_imports.py

# Verificar configuración completa
python test_setup.py
```

5. **Configurar variables de entorno**
```bash
cp env.example env
# Editar el archivo env con tus configuraciones
```

6. **Configurar base de datos**
```bash
# Para PostgreSQL (recomendado para producción)
createdb ecommerce_db

# Para SQLite (desarrollo - ya configurado por defecto)
# No requiere configuración adicional

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser
```

7. **Ejecutar servidor**
```bash
python manage.py runserver
```

### 🔧 Solución de Problemas Comunes

#### Error: "No module named 'pkg_resources'"
```bash
# Solución automática
pip install --upgrade setuptools

# O usar el script de compatibilidad
python py312_compat.py
```

#### Error: "Module not found: Can't resolve '@/lib/utils'"
```bash
# Este error ya está solucionado en el repositorio
# Los archivos de frontend/lib/ están incluidos
```

#### Error: "No module named 'django_redis'"
```bash
# El proyecto tiene fallback automático a cache local
# Pero puedes instalar Redis si lo prefieres:
pip install django-redis
```

#### Error: "No module named 'drf_yasg'"
```bash
# Instalar dependencia faltante
pip install drf-yasg
```

#### Verificar todas las dependencias
```bash
# Script de verificación completa
python verify_imports.py

# Script de test completo
python test_setup.py
```

### 📋 Dependencias Incluidas

El proyecto incluye todas las dependencias necesarias:

#### Core Django & DRF
- Django >=4.2.7,<5.0
- djangorestframework >=3.14.0
- django-cors-headers >=4.3.1
- django-filter >=23.3

#### Autenticación & Autorización
- dj-rest-auth >=5.0.2
- django-allauth >=0.57.0
- djangorestframework-simplejwt >=5.3.0

#### API Documentation
- drf-yasg >=1.21.7

#### Base de Datos
- psycopg2-binary >=2.9.7

#### Cache & Sesiones
- django-redis >=5.4.0
- redis >=5.0.1

#### Cola de Tareas
- celery >=5.3.4
- django-celery-beat >=2.5.0

#### Pagos
- requests >=2.31.0
- mercadopago >=2.0.0

#### Procesamiento de Imágenes
- Pillow >=10.0.1

#### Configuración & Entorno
- python-decouple >=3.8
- setuptools >=65.0.0

#### Herramientas de Desarrollo
- django-debug-toolbar >=4.2.0
- django-extensions >=3.2.3

#### Producción
- gunicorn >=21.2.0
- whitenoise >=6.6.0

#### Seguridad
- cryptography >=41.0.0

#### Utilidades
- python-dateutil >=2.8.2
- pytz >=2023.3

### Frontend (Next.js)

1. **Navegar al directorio frontend**
```bash
cd ../frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example env
# Editar el archivo env con tus configuraciones
```

4. **Ejecutar servidor de desarrollo**
```bash
npm run dev
```

### 🐍 Compatibilidad con Python 3.12+

El proyecto está completamente optimizado para Python 3.12+ y versiones anteriores:

#### Características de Compatibilidad
- ✅ **Python 3.8+**: Compatible con versiones 3.8, 3.9, 3.10, 3.11, 3.12, 3.13+
- ✅ **Fallbacks automáticos**: Cache local si Redis no está disponible
- ✅ **Configuración robusta**: Manejo automático de dependencias faltantes
- ✅ **Scripts de verificación**: Validación completa del setup

#### Archivos de Compatibilidad Incluidos
- `py312_compat.py`: Manejo de compatibilidad con Python 3.12+
- `install_dependencies.py`: Instalación automática de dependencias
- `test_setup.py`: Verificación completa del proyecto
- `verify_imports.py`: Verificación de importaciones
- `PYTHON312_SETUP.md`: Documentación específica para Python 3.12+

#### Instalación Específica para Python 3.12+
```bash
# Usar el script de instalación optimizado
python install_dependencies.py

# Verificar compatibilidad
python test_setup.py

# Si hay problemas con pkg_resources
python py312_compat.py
```

## 🔧 Configuración de Servicios

### Base de Datos PostgreSQL

```sql
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

### Redis

```bash
# Instalar Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS

# Iniciar Redis
redis-server
```

### Variables de Entorno

#### Backend (.env)
```env
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
DATABASE_URL=postgresql://usuario:password@localhost:5432/ecommerce_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=tu-jwt-secret-key
WOMPI_PUBLIC_KEY=tu-wompi-public-key
WOMPI_PRIVATE_KEY=tu-wompi-private-key
MERCADOPAGO_ACCESS_TOKEN=tu-mercadopago-access-token
```

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=tu-wompi-public-key
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu-mercadopago-public-key
```

## 🚀 Despliegue

### Backend (Railway/Render)

1. **Railway**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

2. **Render**
```bash
# Conectar repositorio en Render Dashboard
# Configurar variables de entorno
# Deploy automático desde Git
```

### Frontend (Vercel)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 📊 Modelos de Datos

### Productos
- Producto principal con información básica
- Variantes (tallas, colores)
- Imágenes múltiples
- Reseñas y calificaciones
- Etiquetas y categorización

### Usuarios
- Usuario personalizado con campos extendidos
- Perfil de usuario con preferencias
- Direcciones múltiples
- Historial de compras

### Pedidos
- Sistema completo de pedidos
- Estados de pedido
- Historial de cambios
- Notas internas

### Pagos
- Integración con múltiples proveedores
- Reembolsos
- Métodos de pago guardados
- Historial de transacciones

## 🔐 Autenticación

- **JWT**: Tokens de acceso y refresh
- **Social Auth**: Google y Facebook
- **Registro**: Con validación de email
- **Recuperación**: Reset de contraseña
- **Perfiles**: Gestión completa de usuario

## 💳 Integración de Pagos

### Wompi (Colombia)
- Pago con tarjeta de crédito/débito
- Pago con PSE
- Pago con Nequi
- Webhooks para confirmación

### MercadoPago (Latinoamérica)
- Pago con tarjeta
- Pago en efectivo
- Pago con billetera digital
- Webhooks para confirmación

## 📈 Analytics y Reportes

- Dashboard con métricas en tiempo real
- Reportes de ventas por período
- Analytics de productos
- Analytics de clientes
- Widgets personalizables

## 🧪 Testing

```bash
# Backend
python manage.py test

# Frontend
npm run test
npm run test:e2e
```

## 📝 API Documentation

La documentación de la API está disponible en:
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte y Troubleshooting

### Problemas Comunes y Soluciones

#### 🐍 Problemas de Python
```bash
# Error: "No module named 'pkg_resources'"
pip install --upgrade setuptools
python py312_compat.py

# Error: "No module named 'django_redis'"
# El proyecto tiene fallback automático, pero puedes instalar:
pip install django-redis

# Error: "No module named 'drf_yasg'"
pip install drf-yasg

# Verificar todas las dependencias
python verify_imports.py
```

#### 🚀 Problemas de Django
```bash
# Error: "Could not find backend 'django_redis.cache.RedisCache'"
# El proyecto usa fallback automático a cache local

# Error: "No such file or directory: 'logs/django.log'"
# El directorio se crea automáticamente

# Error de rotación de logs en Windows
python clean_logs.py
# Luego reinicia el servidor

# Error de migraciones
python manage.py makemigrations
python manage.py migrate
```

#### ⚛️ Problemas de Frontend
```bash
# Error: "Module not found: Can't resolve '@/lib/utils'"
# Los archivos ya están incluidos en el repositorio

# Error: "Next.js is outdated"
npm update

# Limpiar cache
rm -rf .next node_modules
npm install
```

#### 🔧 Verificación Completa
```bash
# Backend
cd backend
python test_setup.py
python verify_imports.py

# Frontend
cd frontend
npm run build
```

### Scripts de Diagnóstico

El proyecto incluye varios scripts para diagnosticar problemas:

- `install_dependencies.py`: Instalación automática
- `test_setup.py`: Verificación completa del setup
- `verify_imports.py`: Verificación de importaciones
- `py312_compat.py`: Compatibilidad con Python 3.12+
- `clean_logs.py`: Limpieza de logs y resolución de permisos
- `logging_config.py`: Configuración robusta de logging

### 🪟 Problemas Específicos de Windows

#### Error de Rotación de Logs
```bash
# Error: PermissionError: [WinError 32] The process cannot access the file
python clean_logs.py
# Luego reinicia el servidor Django
```

#### Problemas de Permisos
```bash
# Ejecutar como administrador si es necesario
# O usar el script de limpieza automática
python clean_logs.py
```

#### Configuración de Logging Optimizada
El proyecto incluye configuración de logging optimizada para Windows:
- `TimedRotatingFileHandler` en lugar de `RotatingFileHandler`
- Manejo automático de permisos
- Fallback a logging de consola si hay problemas

### Logs y Debugging

```bash
# Ver logs de Django
tail -f backend/logs/django.log

# Debug mode en Django
export DEBUG=True
python manage.py runserver

# Logs de Next.js
npm run dev -- --verbose
```

### Contacto y Ayuda

Si tienes preguntas o necesitas ayuda:

1. **Revisa la documentación** en `docs/`
2. **Ejecuta los scripts de diagnóstico** incluidos
3. **Busca en los issues existentes** del repositorio
4. **Crea un nuevo issue** con:
   - Versión de Python y Node.js
   - Sistema operativo
   - Logs de error completos
   - Resultado de `python test_setup.py`

## 🎯 Roadmap

- [ ] Integración con más gateways de pago
- [ ] Sistema de cupones y descuentos
- [ ] Programa de afiliados
- [ ] App móvil (React Native)
- [ ] Integración con sistemas de inventario
- [ ] Multi-tenant para múltiples tiendas
- [ ] Sistema de notificaciones push
- [ ] Integración con servicios de envío

---

**Desarrollado con ❤️ para la comunidad de desarrolladores**