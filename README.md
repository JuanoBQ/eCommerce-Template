# Ecommerce de Ropa - Template Completo

Un ecommerce completo de ropa construido con Django REST Framework (backend) y Next.js 14 (frontend), diseñado para ser escalable, moderno y fácil de desplegar.

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
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+

### Backend (Django)

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ecommerce-template/backend
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp env.example env
# Editar el archivo env con tus configuraciones
```

5. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb ecommerce_db

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser
```

6. **Ejecutar servidor**
```bash
python manage.py runserver
```

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

## 🆘 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

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