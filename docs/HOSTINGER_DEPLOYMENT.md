# 🚀 Guía de Deployment en Hostinger - eCommerce de Ropa

Esta guía te ayudará a desplegar tu eCommerce optimizado en Hostinger con todas las mejoras implementadas.

## 📋 Preparativos Pre-Deployment

### 1. Verificar Mejoras Implementadas ✅

El proyecto ha sido optimizado con las siguientes mejoras:

- ✅ **Configuración por ambientes**: Development/Production separados
- ✅ **Manejo de errores estandarizado**: API responses consistentes
- ✅ **Constantes centralizadas**: Fácil mantenimiento
- ✅ **Logging optimizado**: Compatible con Windows/Linux
- ✅ **Limpieza de código**: Comentarios debug eliminados
- ✅ **Configuración Hostinger**: Optimizada para hosting compartido

### 2. Estructura Actualizada

```
backend/
├── ecommerce/
│   ├── settings/
│   │   ├── __init__.py         # ✅ Configuración por ambiente
│   │   ├── base.py             # ✅ Configuración común
│   │   ├── development.py      # ✅ Config desarrollo
│   │   └── production.py       # ✅ Config optimizada Hostinger
│   ├── constants.py            # ✅ Constantes centralizadas
│   └── utils/
│       ├── __init__.py
│       └── exceptions.py       # ✅ Manejo errores estándar
├── env.production.example      # ✅ Template configuración
└── requirements.txt
```

## 🗄️ Configuración de Base de Datos

### 1. Crear Base de Datos MySQL en Hostinger

1. **Accede al panel de Hostinger**
2. **Ve a "Bases de datos MySQL"**
3. **Crea una nueva base de datos:**
   - Nombre: `tu_usuario_ecommerce`
   - Usuario: `tu_usuario_ecommerce`
   - Contraseña: `password_seguro`

### 2. Instalar Cliente MySQL (si no tienes)

```bash
# Ubuntu/Debian
sudo apt-get install default-mysql-client

# CentOS/RHEL
sudo yum install mysql

# macOS
brew install mysql-client
```

### 3. Agregar MySQL a requirements.txt

```bash
# Agregar al final de requirements.txt
mysqlclient>=2.1.1
```

## 📁 Configuración de Archivos

### 1. Crear Archivo de Configuración

```bash
# Copiar el template de configuración
cp env.production.example .env
```

### 2. Editar Configuración (.env)

```env
# CONFIGURACIÓN HOSTINGER
DJANGO_ENVIRONMENT=production
DEBUG=False

# Tu dominio en Hostinger
ALLOWED_HOSTS=tudominio.com,www.tudominio.com

# URLs
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com/api

# Clave secreta (generar una nueva)
SECRET_KEY=tu-clave-secreta-muy-larga-y-compleja-aqui

# SSL (cuando configures certificado)
USE_SSL=True

# Base de datos (datos reales de Hostinger)
DB_NAME=tu_usuario_ecommerce
DB_USER=tu_usuario_ecommerce
DB_PASSWORD=tu_password_mysql
DB_HOST=localhost
DB_PORT=3306

# Rutas en Hostinger (ajustar según tu estructura)
STATIC_ROOT=/home/tu_usuario/domains/tudominio.com/public_html/static/
MEDIA_ROOT=/home/tu_usuario/domains/tudominio.com/public_html/media/
STATIC_URL=/static/
MEDIA_URL=/media/

# Email (configurar SMTP de Hostinger)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@tudominio.com
EMAIL_HOST_PASSWORD=tu_password_email

# CORS
CORS_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com

# Pagos (usar keys de producción)
WOMPI_PUBLIC_KEY=pub_prod_xxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxx
WOMPI_ENVIRONMENT=production

MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx-prod
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx-prod
MERCADOPAGO_ENVIRONMENT=production
```

## 📦 Deployment Steps

### 1. Subir Archivos al Servidor

```bash
# Comprimir el proyecto (sin node_modules, __pycache__, etc.)
tar -czf ecommerce.tar.gz \
    --exclude='__pycache__' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='db.sqlite3' \
    --exclude='logs' \
    --exclude='media' \
    backend/ frontend/ docs/

# Subir vía FTP/SFTP a:
# /home/tu_usuario/domains/tudominio.com/
```

### 2. Configuración en Servidor Hostinger

```bash
# Conectar por SSH
ssh tu_usuario@tudominio.com

# Ir al directorio del proyecto
cd domains/tudominio.com

# Extraer archivos
tar -xzf ecommerce.tar.gz

# Crear directorios necesarios
mkdir -p logs static media
chmod 755 logs static media
```

### 3. Configurar Python Virtual Environment

```bash
# Crear virtual environment
python3 -m venv venv

# Activar virtual environment
source venv/bin/activate

# Instalar dependencias
cd backend
pip install -r requirements.txt
```

### 4. Configurar Base de Datos

```bash
# Variables de ambiente
export DJANGO_ENVIRONMENT=production

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recopilar archivos estáticos
python manage.py collectstatic --noinput
```

## 🌐 Configuración del Frontend

### 1. Preparar Next.js para Producción

```bash
# En tu máquina local, ir al frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo de configuración de producción
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://tudominio.com/api
NEXT_PUBLIC_SITE_URL=https://tudominio.com
EOF

# Build de producción
npm run build
```

### 2. Subir Build del Frontend

```bash
# Comprimir el build
tar -czf frontend-build.tar.gz .next/ public/ package.json

# Subir y extraer en el servidor
# En el servidor:
cd /home/tu_usuario/domains/tudominio.com/public_html
tar -xzf frontend-build.tar.gz
```

## ⚙️ Configuración de Hostinger

### 1. Configurar .htaccess

```apache
# Crear /home/tu_usuario/domains/tudominio.com/public_html/.htaccess

RewriteEngine On

# Redireccionar API al backend Django
RewriteRule ^api/(.*)$ /home/tu_usuario/domains/tudominio.com/backend/manage.py wsgi [L]

# Servir archivos estáticos
RewriteRule ^static/(.*)$ /home/tu_usuario/domains/tudominio.com/public_html/static/$1 [L]
RewriteRule ^media/(.*)$ /home/tu_usuario/domains/tudominio.com/public_html/media/$1 [L]

# Frontend Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### 2. Configurar Variables de Entorno en Hostinger

En el panel de Hostinger:
1. Ve a "Hosting" > "Gestionar"
2. Busca "Variables de entorno"
3. Agregar todas las variables del archivo `.env`

### 3. Configurar Cron Jobs (opcional)

```bash
# En el panel de Hostinger, agregar cron job para tareas
# Cada hora: 0 * * * *
cd /home/tu_usuario/domains/tudominio.com/backend && python manage.py runtasks
```

## 🔒 Configuración SSL

### 1. SSL Gratuito de Hostinger

1. En el panel: "SSL" > "Gestionar"
2. Activar "SSL gratuito"
3. Esperar configuración automática

### 2. Actualizar Configuración

```bash
# En .env, cambiar:
USE_SSL=True
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com/api
```

## 🧪 Testing Post-Deployment

### 1. Verificar Backend

```bash
# Test API
curl https://tudominio.com/api/products/

# Verificar admin
# https://tudominio.com/api/admin/
```

### 2. Verificar Frontend

```bash
# Test frontend
curl https://tudominio.com/

# Verificar rutas principales:
# https://tudominio.com/tienda
# https://tudominio.com/admin
```

## 🐛 Troubleshooting

### Error de Base de Datos

```bash
# Verificar conexión
mysql -h localhost -u tu_usuario -p tu_database

# Verificar permisos
SHOW GRANTS FOR 'tu_usuario'@'localhost';
```

### Error de Archivos Estáticos

```bash
# Verificar permisos
chmod -R 755 /home/tu_usuario/domains/tudominio.com/public_html/static/
chmod -R 755 /home/tu_usuario/domains/tudominio.com/public_html/media/

# Re-ejecutar collectstatic
python manage.py collectstatic --clear --noinput
```

### Error 500

```bash
# Verificar logs
tail -f /home/tu_usuario/domains/tudominio.com/logs/django.log
tail -f /home/tu_usuario/domains/tudominio.com/logs/django_errors.log
```

### Problemas de CORS

```bash
# Verificar en .env:
CORS_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

## 🎯 Optimizaciones Post-Deployment

### 1. Configurar Cache

```bash
# El proyecto ya está configurado con file-based cache
# Verificar que el directorio /tmp/django_cache existe
mkdir -p /tmp/django_cache
chmod 755 /tmp/django_cache
```

### 2. Configurar Backup

```bash
# Script de backup automático
cat > /home/tu_usuario/backup_ecommerce.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h localhost -u tu_usuario -p'tu_password' tu_database > /home/tu_usuario/backups/ecommerce_$DATE.sql
find /home/tu_usuario/backups -name "ecommerce_*.sql" -mtime +7 -delete
EOF

chmod +x /home/tu_usuario/backup_ecommerce.sh

# Configurar en cron (diario a las 3 AM)
# 0 3 * * * /home/tu_usuario/backup_ecommerce.sh
```

## ✅ Checklist Final

- [ ] Base de datos MySQL creada y configurada
- [ ] Archivos subidos al servidor
- [ ] Virtual environment creado e dependencies instaladas
- [ ] Migraciones ejecutadas
- [ ] Archivos estáticos recopilados
- [ ] Variables de entorno configuradas
- [ ] .htaccess configurado
- [ ] SSL configurado
- [ ] Frontend build subido
- [ ] Tests básicos realizados
- [ ] Backup configurado

## 📞 Soporte

Si encuentras problemas:

1. **Revisa logs**: `tail -f logs/django_errors.log`
2. **Verifica configuración**: Variables de entorno correctas
3. **Permisos de archivos**: `chmod 755` en directorios necesarios
4. **Base de datos**: Conexión y permisos correctos

---

¡Felicitaciones! 🎉 Tu eCommerce optimizado está desplegado en Hostinger con todas las mejores prácticas implementadas.
