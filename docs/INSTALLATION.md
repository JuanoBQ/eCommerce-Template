# Guía de Instalación - Ecommerce de Ropa

Esta guía te ayudará a instalar y configurar el ecommerce completo paso a paso.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.9+** - [Descargar Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Descargar Node.js](https://nodejs.org/)
- **PostgreSQL 12+** - [Descargar PostgreSQL](https://www.postgresql.org/download/)
- **Redis 6+** - [Descargar Redis](https://redis.io/download)
- **Git** - [Descargar Git](https://git-scm.com/downloads)

### Verificar Instalaciones

```bash
# Verificar Python
python --version
# Debe mostrar Python 3.9 o superior

# Verificar Node.js
node --version
# Debe mostrar v18 o superior

# Verificar PostgreSQL
psql --version
# Debe mostrar PostgreSQL 12 o superior

# Verificar Redis
redis-server --version
# Debe mostrar Redis 6 o superior
```

## 🗄️ Configuración de Base de Datos

### 1. Crear Base de Datos PostgreSQL

```sql
-- Conectar a PostgreSQL como superusuario
sudo -u postgres psql

-- Crear base de datos
CREATE DATABASE ecommerce_db;

-- Crear usuario
CREATE USER ecommerce_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;

-- Salir
\q
```

### 2. Configurar Redis

```bash
# Iniciar Redis (Linux/macOS)
redis-server

# En Windows, usar Redis Desktop Manager o WSL
```

## 🔧 Instalación del Backend (Django)

### 1. Clonar y Navegar

```bash
git clone <repository-url>
cd ecommerce-template/backend
```

### 2. Crear Entorno Virtual

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/macOS:
source venv/bin/activate

# En Windows:
venv\Scripts\activate
```

### 3. Instalar Dependencias

```bash
# Actualizar pip
pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example env

# Editar el archivo env con tus configuraciones
nano env  # o usar tu editor preferido
```

**Configuración mínima del archivo env:**

```env
SECRET_KEY=tu-secret-key-muy-seguro-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de datos
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=tu_password_seguro
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=tu-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 5. Ejecutar Migraciones

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser
```

### 6. Cargar Datos de Prueba (Opcional)

```bash
# Crear datos de ejemplo
python manage.py loaddata fixtures/initial_data.json
```

### 7. Ejecutar Servidor

```bash
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

## 🎨 Instalación del Frontend (Next.js)

### 1. Navegar al Directorio Frontend

```bash
cd ../frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example env

# Editar el archivo env
nano env  # o usar tu editor preferido
```

**Configuración mínima del archivo env:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_JWT_SECRET=jwt-secret-for-development
```

### 4. Ejecutar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## 🔐 Configuración de Autenticación

### 1. Configurar Social Auth (Opcional)

#### Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar URLs de redirección:
   - `http://localhost:8000/api/auth/social/google/`
   - `http://localhost:3000/auth/callback/google`

#### Facebook OAuth

1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Crear una nueva aplicación
3. Configurar Facebook Login
4. Agregar URLs de redirección:
   - `http://localhost:8000/api/auth/social/facebook/`
   - `http://localhost:3000/auth/callback/facebook`

### 2. Configurar Email (Opcional)

```env
# En el archivo env del backend
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password
```

## 💳 Configuración de Pagos

### Wompi (Colombia)

1. Registrarse en [Wompi](https://wompi.co/)
2. Obtener claves de API
3. Configurar en el archivo env:

```env
WOMPI_PUBLIC_KEY=pub_test_tu_clave_publica
WOMPI_PRIVATE_KEY=prv_test_tu_clave_privada
WOMPI_ENVIRONMENT=sandbox  # o production
```

### MercadoPago (Latinoamérica)

1. Registrarse en [MercadoPago](https://www.mercadopago.com.co/)
2. Obtener credenciales de API
3. Configurar en el archivo env:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST_tu_access_token
MERCADOPAGO_PUBLIC_KEY=TEST_tu_public_key
```

## 🧪 Verificar Instalación

### 1. Backend

```bash
# Verificar que el servidor esté corriendo
curl http://localhost:8000/api/

# Debe devolver una respuesta JSON
```

### 2. Frontend

```bash
# Abrir en el navegador
open http://localhost:3000

# Debe mostrar la página principal
```

### 3. API Documentation

```bash
# Swagger UI
open http://localhost:8000/swagger/

# ReDoc
open http://localhost:8000/redoc/
```

## 🚀 Comandos Útiles

### Backend

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar tests
python manage.py test

# Recopilar archivos estáticos
python manage.py collectstatic

# Ejecutar shell de Django
python manage.py shell
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🔧 Solución de Problemas

### Error de Conexión a Base de Datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U ecommerce_user -d ecommerce_db
```

### Error de Conexión a Redis

```bash
# Verificar que Redis esté corriendo
redis-cli ping
# Debe devolver PONG
```

### Error de CORS

```bash
# Verificar configuración en settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Error de Migraciones

```bash
# Resetear migraciones (¡CUIDADO! Esto elimina datos)
python manage.py migrate --fake-initial
```

## 📚 Próximos Pasos

1. **Configurar Dominio**: Configurar un dominio personalizado
2. **SSL**: Configurar certificados SSL
3. **CDN**: Configurar CDN para archivos estáticos
4. **Monitoring**: Configurar monitoreo y logs
5. **Backup**: Configurar respaldos automáticos

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de Django y Next.js
4. Busca en los issues del repositorio
5. Crea un nuevo issue con detalles del problema

---

¡Felicitaciones! 🎉 Has instalado exitosamente el ecommerce completo. Ahora puedes comenzar a personalizarlo según tus necesidades.
