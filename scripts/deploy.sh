#!/bin/bash

# Script de despliegue para el proyecto eCommerce
# Uso: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_NAME="ecommerce"
BACKEND_IMAGE="ecommerce-backend"
FRONTEND_IMAGE="ecommerce-frontend"

echo "🚀 Iniciando despliegue en entorno: $ENVIRONMENT"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que docker-compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose no está instalado. Por favor instala docker-compose primero."
    exit 1
fi

# Función para verificar si un servicio está funcionando
check_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Verificando servicio: $service_name"
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service_name | grep -q "Up"; then
            echo "✅ Servicio $service_name está funcionando"
            return 0
        fi
        
        echo "⏳ Intento $attempt/$max_attempts - Esperando servicio $service_name..."
        sleep 10
        ((attempt++))
    done
    
    echo "❌ Servicio $service_name no está funcionando después de $max_attempts intentos"
    return 1
}

# Función para hacer backup de la base de datos
backup_database() {
    echo "💾 Creando backup de la base de datos..."
    
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # En producción, hacer backup real
        docker-compose exec -T db pg_dump -U ecommerce_user ecommerce_prod > "backups/$backup_file"
        echo "✅ Backup creado: backups/$backup_file"
    else
        echo "ℹ️  Backup omitido en entorno de staging"
    fi
}

# Función para ejecutar migraciones
run_migrations() {
    echo "🔄 Ejecutando migraciones de base de datos..."
    
    docker-compose exec backend python manage.py makemigrations --check
    docker-compose exec backend python manage.py migrate
    
    echo "✅ Migraciones completadas"
}

# Función para recopilar archivos estáticos
collect_static() {
    echo "📁 Recopilando archivos estáticos..."
    
    docker-compose exec backend python manage.py collectstatic --noinput
    
    echo "✅ Archivos estáticos recopilados"
}

# Función para crear superusuario si no existe
create_superuser() {
    echo "👤 Verificando superusuario..."
    
    # Verificar si ya existe un superusuario
    if docker-compose exec -T backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('SUPERUSER_EXISTS' if User.objects.filter(is_superuser=True).exists() else 'NO_SUPERUSER')" | grep -q "SUPERUSER_EXISTS"; then
        echo "ℹ️  Superusuario ya existe"
    else
        echo "👤 Creando superusuario..."
        docker-compose exec backend python manage.py createsuperuser --noinput --username admin --email admin@example.com
        echo "✅ Superusuario creado"
    fi
}

# Función para verificar health checks
check_health() {
    echo "🏥 Verificando health checks..."
    
    # Esperar a que los servicios estén listos
    sleep 30
    
    # Verificar backend
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        echo "✅ Backend health check exitoso"
    else
        echo "❌ Backend health check falló"
        return 1
    fi
    
    # Verificar frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend health check exitoso"
    else
        echo "❌ Frontend health check falló"
        return 1
    fi
}

# Función para limpiar recursos no utilizados
cleanup() {
    echo "🧹 Limpiando recursos no utilizados..."
    
    # Limpiar imágenes Docker no utilizadas
    docker image prune -f
    
    # Limpiar contenedores detenidos
    docker container prune -f
    
    echo "✅ Limpieza completada"
}

# Función principal de despliegue
deploy() {
    echo "📋 Iniciando proceso de despliegue..."
    
    # 1. Crear directorio de backups si no existe
    mkdir -p backups
    
    # 2. Hacer backup de la base de datos
    backup_database
    
    # 3. Detener servicios existentes
    echo "🛑 Deteniendo servicios existentes..."
    docker-compose down
    
    # 4. Construir imágenes
    echo "🔨 Construyendo imágenes Docker..."
    docker-compose build --no-cache
    
    # 5. Iniciar servicios
    echo "🚀 Iniciando servicios..."
    docker-compose up -d
    
    # 6. Verificar que los servicios estén funcionando
    check_service "db"
    check_service "redis"
    check_service "backend"
    check_service "frontend"
    
    # 7. Ejecutar migraciones
    run_migrations
    
    # 8. Recopilar archivos estáticos
    collect_static
    
    # 9. Crear superusuario si es necesario
    create_superuser
    
    # 10. Verificar health checks
    check_health
    
    # 11. Limpiar recursos
    cleanup
    
    echo "🎉 Despliegue completado exitosamente en entorno: $ENVIRONMENT"
    echo "🌐 Backend: http://localhost:8000"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🏥 Health Check: http://localhost:8000/health/"
}

# Función para rollback
rollback() {
    echo "🔄 Iniciando rollback..."
    
    # Detener servicios actuales
    docker-compose down
    
    # Restaurar desde backup más reciente
    local latest_backup=$(ls -t backups/*.sql 2>/dev/null | head -n1)
    
    if [ -n "$latest_backup" ]; then
        echo "📦 Restaurando desde backup: $latest_backup"
        docker-compose up -d db
        sleep 10
        docker-compose exec -T db psql -U ecommerce_user ecommerce_prod < "$latest_backup"
        docker-compose up -d
        echo "✅ Rollback completado"
    else
        echo "❌ No se encontraron backups para restaurar"
        exit 1
    fi
}

# Función para mostrar logs
show_logs() {
    echo "📋 Mostrando logs de los servicios..."
    docker-compose logs -f
}

# Función para mostrar estado
show_status() {
    echo "📊 Estado de los servicios:"
    docker-compose ps
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando] [entorno]"
    echo ""
    echo "Comandos:"
    echo "  deploy [staging|production]  - Desplegar la aplicación"
    echo "  rollback                     - Hacer rollback a la versión anterior"
    echo "  logs                         - Mostrar logs de los servicios"
    echo "  status                       - Mostrar estado de los servicios"
    echo "  help                         - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 deploy staging"
    echo "  $0 deploy production"
    echo "  $0 rollback"
    echo "  $0 logs"
}

# Procesar argumentos
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
