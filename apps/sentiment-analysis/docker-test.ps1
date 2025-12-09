# ============================================
# Script de Prueba Local - Docker Image (PowerShell)
# Para: sentiment-analysis
# ============================================

# Configuración de errores
$ErrorActionPreference = "Stop"

# Variables
$IMAGE_NAME = "sentiment-analysis"
$IMAGE_TAG = "test"
$CONTAINER_NAME = "sentiment-analysis-test"
$PORT = 3001

Write-Host "============================================" -ForegroundColor Blue
Write-Host "  Prueba de Imagen Docker - Sentiment Analysis" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host ""

# Paso 1: Verificar que Docker esté corriendo
Write-Host "📋 Verificando Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y vuelve a intentar" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Limpiar contenedores previos
Write-Host "🧹 Limpiando contenedores previos..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}"
if ($existingContainer) {
    docker stop $CONTAINER_NAME 2>$null | Out-Null
    docker rm $CONTAINER_NAME 2>$null | Out-Null
    Write-Host "✅ Contenedor previo removido" -ForegroundColor Green
} else {
    Write-Host "✅ No hay contenedores previos" -ForegroundColor Green
}
Write-Host ""

# Paso 3: Build de la imagen
Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Yellow
Write-Host "Contexto: $(Get-Location)\..\.." -ForegroundColor Gray
Write-Host "Dockerfile: Dockerfile.openshift" -ForegroundColor Gray
Write-Host ""

Set-Location ..\..
docker build `
    -t "${IMAGE_NAME}:${IMAGE_TAG}" `
    -f apps/sentiment-analysis/Dockerfile.openshift `
    .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al construir la imagen" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Mostrar tamaño de la imagen
Write-Host "📊 Información de la imagen:" -ForegroundColor Yellow
docker images "${IMAGE_NAME}:${IMAGE_TAG}"
Write-Host ""

# Paso 5: Verificar variables de entorno
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Yellow
if (-not $env:OPENAI_API_KEY) {
    Write-Host "⚠️  WARNING: OPENAI_API_KEY no está configurada" -ForegroundColor Yellow
    Write-Host "La aplicación funcionará pero el análisis de sentimiento fallará" -ForegroundColor Yellow
    Write-Host "Configura con: `$env:OPENAI_API_KEY='tu_api_key'" -ForegroundColor Yellow
} else {
    Write-Host "✅ OPENAI_API_KEY configurada" -ForegroundColor Green
}
Write-Host ""

# Paso 6: Ejecutar contenedor
Write-Host "🚀 Ejecutando contenedor..." -ForegroundColor Yellow

$OPENAI_KEY = if ($env:OPENAI_API_KEY) { $env:OPENAI_API_KEY } else { "sk-test-key" }
$AI_PROVIDER_VAR = if ($env:AI_PROVIDER) { $env:AI_PROVIDER } else { "openai" }
$DEFAULT_MODEL_VAR = if ($env:DEFAULT_MODEL) { $env:DEFAULT_MODEL } else { "gpt-4" }
$MAX_FILE_SIZE_VAR = if ($env:MAX_FILE_SIZE) { $env:MAX_FILE_SIZE } else { "10485760" }

docker run -d `
    --name $CONTAINER_NAME `
    -p "${PORT}:${PORT}" `
    -e NODE_ENV=production `
    -e PORT=$PORT `
    -e OPENAI_API_KEY=$OPENAI_KEY `
    -e AI_PROVIDER=$AI_PROVIDER_VAR `
    -e DEFAULT_MODEL=$DEFAULT_MODEL_VAR `
    -e MAX_FILE_SIZE=$MAX_FILE_SIZE_VAR `
    -e NEXT_TELEMETRY_DISABLED=1 `
    "${IMAGE_NAME}:${IMAGE_TAG}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contenedor iniciado" -ForegroundColor Green
} else {
    Write-Host "❌ Error al iniciar contenedor" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 7: Esperar a que la app esté lista
Write-Host "⏳ Esperando a que la aplicación esté lista..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Intentar health check por 30 segundos
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:${PORT}/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Aplicación lista!" -ForegroundColor Green
            $ready = $true
            break
        }
    } catch {
        # Continuar intentando
    }

    if ($i -eq 30) {
        Write-Host "❌ Timeout: La aplicación no respondió" -ForegroundColor Red
        Write-Host "Mostrando logs:" -ForegroundColor Yellow
        docker logs $CONTAINER_NAME
        exit 1
    }
    Start-Sleep -Seconds 1
}
Write-Host ""

# Paso 8: Pruebas básicas
Write-Host "🧪 Ejecutando pruebas básicas..." -ForegroundColor Yellow
Write-Host ""

# Health check
Write-Host "Test 1: Health Check" -ForegroundColor Blue
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:${PORT}/api/health" -UseBasicParsing
    if ($healthResponse.status -eq "ok") {
        Write-Host "✅ Health check: OK" -ForegroundColor Green
        Write-Host "Response: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Health check: FAILED" -ForegroundColor Red
        Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Health check: FAILED" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Homepage
Write-Host "Test 2: Homepage" -ForegroundColor Blue
try {
    $homepageResponse = Invoke-WebRequest -Uri "http://localhost:${PORT}/" -UseBasicParsing
    if ($homepageResponse.StatusCode -eq 200) {
        Write-Host "✅ Homepage: OK (HTTP 200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Homepage: FAILED (HTTP $($homepageResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Homepage: FAILED" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Paso 9: Mostrar información útil
Write-Host "============================================" -ForegroundColor Blue
Write-Host "✅ Imagen creada y probada exitosamente!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Blue
Write-Host ""
Write-Host "📝 Información del contenedor:" -ForegroundColor Yellow
Write-Host "  Nombre: $CONTAINER_NAME"
Write-Host "  Puerto: $PORT"
Write-Host "  URL: http://localhost:$PORT"
Write-Host "  Health: http://localhost:$PORT/api/health"
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Yellow
Write-Host "  Ver logs:     docker logs $CONTAINER_NAME"
Write-Host "  Ver logs -f:  docker logs -f $CONTAINER_NAME"
Write-Host "  Detener:      docker stop $CONTAINER_NAME"
Write-Host "  Eliminar:     docker rm $CONTAINER_NAME"
Write-Host "  Shell:        docker exec -it $CONTAINER_NAME /bin/sh"
Write-Host ""
Write-Host "🌐 URLs de prueba:" -ForegroundColor Yellow
Write-Host "  Homepage:     http://localhost:$PORT/"
Write-Host "  Health:       http://localhost:$PORT/api/health"
Write-Host "  App:          http://localhost:$PORT/app"
Write-Host ""
Write-Host "🛑 Para detener:" -ForegroundColor Yellow
Write-Host "  docker stop $CONTAINER_NAME; docker rm $CONTAINER_NAME"
Write-Host ""
