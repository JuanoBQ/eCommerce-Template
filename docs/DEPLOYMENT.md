# Guía de Despliegue - eCommerce Template

Esta guía describe cómo desplegar el proyecto eCommerce en diferentes entornos.

## 📋 Requisitos Previos

### Software Requerido
- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Git** (para clonar el repositorio)

### Variables de Entorno
Antes del despliegue, asegúrate de configurar las variables de entorno necesarias:

```bash
# Copiar archivo de ejemplo
cp backend/env.development.example backend/.env
cp frontend/env.example frontend/.env.local
```

## 🚀 Despliegue Rápido

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd eCommerce-Template
```

### 2. Configurar Variables de Entorno
```bash
# Backend
cp backend/env.development.example backend/.env

# Frontend
cp frontend/env.example frontend/.env.local
```

### 3. Desplegar con Docker Compose
```bash
# Despliegue completo
docker-compose up -d

# O usar el script de despliegue
./scripts/deploy.sh staging
```

## 🔧 Despliegue por Entornos

### Desarrollo Local

```bash
# 1. Configurar variables de entorno
export DB_HOST=localhost
export REDIS_URL=redis://localhost:6379/0

# 2. Iniciar servicios de base de datos
docker-compose up -d db redis

# 3. Ejecutar migraciones
cd backend
python manage.py migrate

# 4. Crear superusuario
python manage.py createsuperuser

# 5. Iniciar servidor de desarrollo
python manage.py runserver

# 6. En otra terminal, iniciar frontend
cd frontend
npm run dev
```

### Staging

```bash
# Usar script de despliegue
./scripts/deploy.sh staging

# O manualmente
docker-compose -f docker-compose.staging.yml up -d
```

### Producción

```bash
# Usar script de despliegue
./scripts/deploy.sh production

# O manualmente
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoreo y Health Checks

### Health Checks Disponibles

- **Básico**: `GET /health/`
- **Detallado**: `GET /health/detailed/`
- **Readiness**: `GET /health/ready/`
- **Liveness**: `GET /health/live/`

### Verificar Estado del Sistema

```bash
# Verificar estado de contenedores
docker-compose ps

# Ver logs
docker-compose logs -f

# Verificar health checks
curl http://localhost:8000/health/detailed/
```

## 🔒 Seguridad

### Rate Limiting
El sistema incluye rate limiting configurado para:
- **Login**: 5 intentos por 5 minutos
- **Registro**: 3 registros por 5 minutos
- **Pagos**: 10 pagos por minuto
- **General**: 100 requests por minuto

### Headers de Seguridad
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy configurado

## 🗄️ Base de Datos

### Migraciones
```bash
# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker-compose exec backend python manage.py migrate

# Verificar estado
docker-compose exec backend python manage.py showmigrations
```

### Backup y Restore
```bash
# Backup
docker-compose exec db pg_dump -U ecommerce_user ecommerce_prod > backup.sql

# Restore
docker-compose exec -T db psql -U ecommerce_user ecommerce_prod < backup.sql
```

## 🔄 CI/CD

### GitHub Actions
El proyecto incluye workflows de CI/CD que:
- Ejecutan tests automáticamente
- Hacen build de imágenes Docker
- Despliegan en staging/producción
- Escanean vulnerabilidades

### Configurar Secrets
En GitHub, configurar los siguientes secrets:
- `DOCKER_USERNAME`: Usuario de Docker Hub
- `DOCKER_PASSWORD`: Contraseña de Docker Hub
- `SENTRY_DSN`: DSN de Sentry para monitoreo

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté funcionando
docker-compose ps db

# Ver logs de la base de datos
docker-compose logs db

# Reiniciar base de datos
docker-compose restart db
```

#### 2. Error de Conexión a Redis
```bash
# Verificar que Redis esté funcionando
docker-compose ps redis

# Ver logs de Redis
docker-compose logs redis

# Reiniciar Redis
docker-compose restart redis
```

#### 3. Error de Migraciones
```bash
# Verificar estado de migraciones
docker-compose exec backend python manage.py showmigrations

# Aplicar migraciones pendientes
docker-compose exec backend python manage.py migrate

# Si hay conflictos, hacer reset
docker-compose exec backend python manage.py migrate --fake-initial
```

#### 4. Error de Permisos
```bash
# En Linux/Mac, dar permisos de ejecución
chmod +x scripts/deploy.sh

# En Windows, usar PowerShell
.\scripts\deploy.ps1
```

### Logs y Debugging

```bash
# Ver todos los logs
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Seguir logs en tiempo real
docker-compose logs -f backend
```

## 📈 Escalabilidad

### Escalar Servicios
```bash
# Escalar backend
docker-compose up -d --scale backend=3

# Escalar frontend
docker-compose up -d --scale frontend=2
```

### Configuración de Load Balancer
Para producción, se recomienda usar un load balancer como Nginx:

```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

upstream frontend {
    server frontend1:3000;
    server frontend2:3000;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend;
    }
    
    location / {
        proxy_pass http://frontend;
    }
}
```

## 🔧 Mantenimiento

### Actualizaciones
```bash
# Actualizar código
git pull origin main

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar servicios
docker-compose up -d
```

### Limpieza
```bash
# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar los logs del sistema
2. Verificar la documentación
3. Crear un issue en el repositorio
4. Contactar al equipo de desarrollo

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Django](https://docs.djangoproject.com/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de Sentry](https://docs.sentry.io/)