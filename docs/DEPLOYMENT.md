# Guía de Despliegue - Ecommerce de Ropa

Esta guía te ayudará a desplegar el ecommerce en diferentes plataformas de hosting.

## 🐳 Despliegue con Docker

### Prerrequisitos
- Docker
- Docker Compose

### 1. Configurar Variables de Entorno

```bash
# Backend
cp backend/env.example backend/.env
# Editar backend/.env con configuraciones de producción

# Frontend
cp frontend/env.example frontend/.env
# Editar frontend/.env con configuraciones de producción
```

### 2. Ejecutar con Docker Compose

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 3. Comandos Útiles

```bash
# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Recopilar archivos estáticos
docker-compose exec backend python manage.py collectstatic

# Acceder al shell de Django
docker-compose exec backend python manage.py shell
```

## ☁️ Despliegue en Vercel (Frontend)

### 1. Preparar el Proyecto

```bash
cd frontend

# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login
```

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, agregar las siguientes variables:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=tu_wompi_public_key
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key
```

### 3. Desplegar

```bash
# Desplegar
vercel --prod

# O conectar repositorio en Vercel Dashboard
```

## 🚂 Despliegue en Railway (Backend)

### 1. Preparar el Proyecto

```bash
cd backend

# Instalar Railway CLI
npm install -g @railway/cli

# Login en Railway
railway login
```

### 2. Crear Proyecto

```bash
# Inicializar proyecto
railway init

# Agregar base de datos PostgreSQL
railway add postgresql

# Agregar Redis
railway add redis
```

### 3. Configurar Variables de Entorno

```bash
# Configurar variables
railway variables set SECRET_KEY=tu-secret-key-muy-seguro
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS=tu-backend.railway.app
railway variables set CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
```

### 4. Desplegar

```bash
# Desplegar
railway up
```

## 🌊 Despliegue en Render

### 1. Backend (Web Service)

1. Conectar repositorio en Render Dashboard
2. Configurar:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn ecommerce.wsgi:application`
   - **Environment**: Python 3.11

3. Variables de entorno:
```env
SECRET_KEY=tu-secret-key-muy-seguro
DEBUG=False
ALLOWED_HOSTS=tu-backend.onrender.com
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
```

### 2. Frontend (Static Site)

1. Conectar repositorio en Render Dashboard
2. Configurar:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/out`
   - **Environment**: Node.js 18

3. Variables de entorno:
```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://tu-frontend.onrender.com
```

## 🐘 Despliegue en DigitalOcean

### 1. Crear Droplet

```bash
# Crear droplet Ubuntu 22.04
# Tamaño mínimo: 2GB RAM, 1 CPU
```

### 2. Configurar Servidor

```bash
# Conectar al servidor
ssh root@tu-servidor-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y
```

### 3. Desplegar Aplicación

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd ecommerce-template

# Configurar variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Editar archivos .env con configuraciones de producción

# Ejecutar con Docker Compose
docker-compose up -d
```

### 4. Configurar Nginx (Opcional)

```bash
# Instalar Nginx
apt install nginx -y

# Configurar proxy reverso
cat > /etc/nginx/sites-available/ecommerce << EOF
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Habilitar sitio
ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 🔒 Configuración de SSL

### Con Let's Encrypt

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado
certbot --nginx -d tu-dominio.com

# Renovación automática
crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Logs

### 1. Configurar Logs

```bash
# En el archivo settings.py del backend
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Monitoreo con Sentry

```bash
# Instalar Sentry
pip install sentry-sdk[django]

# Configurar en settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="tu-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

## 🔄 CI/CD con GitHub Actions

### 1. Configurar Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway login --token ${{ secrets.RAILWAY_TOKEN }}
        railway up
```

### 2. Configurar Secrets

En GitHub Settings > Secrets, agregar:
- `RAILWAY_TOKEN`
- `VERCEL_TOKEN`
- `DATABASE_URL`
- `SECRET_KEY`

## 🗄️ Backup y Restauración

### 1. Backup de Base de Datos

```bash
# Backup
pg_dump -h localhost -U ecommerce_user ecommerce_db > backup.sql

# Restaurar
psql -h localhost -U ecommerce_user ecommerce_db < backup.sql
```

### 2. Backup Automático

```bash
# Script de backup
cat > /usr/local/bin/backup-db.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U ecommerce_user ecommerce_db > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Programar en crontab
crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-db.sh
```

## 🚀 Optimizaciones de Producción

### 1. Backend

```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['tu-dominio.com']

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Static files
STATIC_ROOT = '/var/www/static/'
MEDIA_ROOT = '/var/www/media/'
```

### 2. Frontend

```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}
```

## 🔧 Solución de Problemas

### Error de Conexión a Base de Datos

```bash
# Verificar conexión
psql -h localhost -U ecommerce_user -d ecommerce_db

# Verificar variables de entorno
echo $DATABASE_URL
```

### Error de CORS

```python
# Verificar configuración
CORS_ALLOWED_ORIGINS = [
    "https://tu-frontend.vercel.app",
    "https://tu-dominio.com",
]
```

### Error de Archivos Estáticos

```bash
# Recopilar archivos estáticos
python manage.py collectstatic --noinput

# Verificar permisos
chmod -R 755 /var/www/static/
```

## 📈 Escalabilidad

### 1. Load Balancer

```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

### 2. CDN

```python
# Configurar CDN para archivos estáticos
STATIC_URL = 'https://cdn.tu-dominio.com/static/'
MEDIA_URL = 'https://cdn.tu-dominio.com/media/'
```

### 3. Cache

```python
# Cache de vistas
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 minutos
def product_list(request):
    # Vista
```

---

¡Felicitaciones! 🎉 Has desplegado exitosamente tu ecommerce. Recuerda monitorear el rendimiento y hacer backups regulares.
