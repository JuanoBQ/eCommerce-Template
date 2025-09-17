# Script de despliegue para el proyecto eCommerce (PowerShell)
# Uso: .\scripts\deploy.ps1 [staging|production]

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

$ErrorActionPreference = "Stop"

$ProjectName = "ecommerce"
$BackendImage = "ecommerce-backend"
$FrontendImage = "ecommerce-frontend"

Write-Host "🚀 Iniciando despliegue en entorno: $Environment" -ForegroundColor Green

# Función para verificar si Docker está instalado
function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Función para verificar si docker-compose está instalado
function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Función para verificar si un servicio está funcionando
function Test-Service {
    param(
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )
    
    Write-Host "⏳ Verificando servicio: $ServiceName" -ForegroundColor Yellow
    
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        $status = docker-compose ps $ServiceName
        if ($status -match "Up") {
            Write-Host "✅ Servicio $ServiceName está funcionando" -ForegroundColor Green
            return $true
        }
        
        Write-Host "⏳ Intento $attempt/$MaxAttempts - Esperando servicio $ServiceName..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
    
    Write-Host "❌ Servicio $ServiceName no está funcionando después de $MaxAttempts intentos" -ForegroundColor Red
    return $false
}

# Función para hacer backup de la base de datos
function Backup-Database {
    Write-Host "💾 Creando backup de la base de datos..." -ForegroundColor Blue
    
    $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    
    if ($Environment -eq "production") {
        # En producción, hacer backup real
        if (!(Test-Path "backups")) {
            New-Item -ItemType Directory -Path "backups" | Out-Null
        }
        
        docker-compose exec -T db pg_dump -U ecommerce_user ecommerce_prod > "backups\$backupFile"
        Write-Host "✅ Backup creado: backups\$backupFile" -ForegroundColor Green
    }
    else {
        Write-Host "ℹ️  Backup omitido en entorno de staging" -ForegroundColor Yellow
    }
}

# Función para ejecutar migraciones
function Invoke-Migrations {
    Write-Host "🔄 Ejecutando migraciones de base de datos..." -ForegroundColor Blue
    
    docker-compose exec backend python manage.py makemigrations --check
    docker-compose exec backend python manage.py migrate
    
    Write-Host "✅ Migraciones completadas" -ForegroundColor Green
}

# Función para recopilar archivos estáticos
function Invoke-CollectStatic {
    Write-Host "📁 Recopilando archivos estáticos..." -ForegroundColor Blue
    
    docker-compose exec backend python manage.py collectstatic --noinput
    
    Write-Host "✅ Archivos estáticos recopilados" -ForegroundColor Green
}

# Función para crear superusuario si no existe
function New-SuperUser {
    Write-Host "👤 Verificando superusuario..." -ForegroundColor Blue
    
    # Verificar si ya existe un superusuario
    $superuserExists = docker-compose exec -T backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('SUPERUSER_EXISTS' if User.objects.filter(is_superuser=True).exists() else 'NO_SUPERUSER')"
    
    if ($superuserExists -match "SUPERUSER_EXISTS") {
        Write-Host "ℹ️  Superusuario ya existe" -ForegroundColor Yellow
    }
    else {
        Write-Host "👤 Creando superusuario..." -ForegroundColor Blue
        docker-compose exec backend python manage.py createsuperuser --noinput --username admin --email admin@example.com
        Write-Host "✅ Superusuario creado" -ForegroundColor Green
    }
}

# Función para verificar health checks
function Test-Health {
    Write-Host "🏥 Verificando health checks..." -ForegroundColor Blue
    
    # Esperar a que los servicios estén listos
    Start-Sleep -Seconds 30
    
    # Verificar backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health/" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend health check exitoso" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Backend health check falló" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Backend health check falló: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Verificar frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend health check exitoso" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Frontend health check falló" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Frontend health check falló: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Función para limpiar recursos no utilizados
function Invoke-Cleanup {
    Write-Host "🧹 Limpiando recursos no utilizados..." -ForegroundColor Blue
    
    # Limpiar imágenes Docker no utilizadas
    docker image prune -f
    
    # Limpiar contenedores detenidos
    docker container prune -f
    
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

# Función principal de despliegue
function Deploy {
    Write-Host "📋 Iniciando proceso de despliegue..." -ForegroundColor Blue
    
    # 1. Verificar dependencias
    if (!(Test-Docker)) {
        Write-Host "❌ Docker no está instalado. Por favor instala Docker primero." -ForegroundColor Red
        exit 1
    }
    
    if (!(Test-DockerCompose)) {
        Write-Host "❌ docker-compose no está instalado. Por favor instala docker-compose primero." -ForegroundColor Red
        exit 1
    }
    
    # 2. Crear directorio de backups si no existe
    if (!(Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    
    # 3. Hacer backup de la base de datos
    Backup-Database
    
    # 4. Detener servicios existentes
    Write-Host "🛑 Deteniendo servicios existentes..." -ForegroundColor Yellow
    docker-compose down
    
    # 5. Construir imágenes
    Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Blue
    docker-compose build --no-cache
    
    # 6. Iniciar servicios
    Write-Host "🚀 Iniciando servicios..." -ForegroundColor Blue
    docker-compose up -d
    
    # 7. Verificar que los servicios estén funcionando
    Test-Service "db"
    Test-Service "redis"
    Test-Service "backend"
    Test-Service "frontend"
    
    # 8. Ejecutar migraciones
    Invoke-Migrations
    
    # 9. Recopilar archivos estáticos
    Invoke-CollectStatic
    
    # 10. Crear superusuario si es necesario
    New-SuperUser
    
    # 11. Verificar health checks
    Test-Health
    
    # 12. Limpiar recursos
    Invoke-Cleanup
    
    Write-Host "🎉 Despliegue completado exitosamente en entorno: $Environment" -ForegroundColor Green
    Write-Host "🌐 Backend: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🏥 Health Check: http://localhost:8000/health/" -ForegroundColor Cyan
}

# Función para mostrar logs
function Show-Logs {
    Write-Host "📋 Mostrando logs de los servicios..." -ForegroundColor Blue
    docker-compose logs -f
}

# Función para mostrar estado
function Show-Status {
    Write-Host "📊 Estado de los servicios:" -ForegroundColor Blue
    docker-compose ps
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Uso: .\scripts\deploy.ps1 [comando] [entorno]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Comandos:" -ForegroundColor Yellow
    Write-Host "  deploy [staging|production]  - Desplegar la aplicación" -ForegroundColor White
    Write-Host "  logs                         - Mostrar logs de los servicios" -ForegroundColor White
    Write-Host "  status                       - Mostrar estado de los servicios" -ForegroundColor White
    Write-Host "  help                         - Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\scripts\deploy.ps1 deploy staging" -ForegroundColor White
    Write-Host "  .\scripts\deploy.ps1 deploy production" -ForegroundColor White
    Write-Host "  .\scripts\deploy.ps1 logs" -ForegroundColor White
}

# Ejecutar función principal
Deploy
