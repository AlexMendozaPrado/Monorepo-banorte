#!/bin/bash

# ============================================
# Script de Prueba Local - Docker Image
# Para: sentiment-analysis
# ============================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
IMAGE_NAME="sentiment-analysis"
IMAGE_TAG="test"
CONTAINER_NAME="sentiment-analysis-test"
PORT=3001

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Prueba de Imagen Docker - Sentiment Analysis${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Paso 1: Verificar que Docker esté corriendo
echo -e "${YELLOW}📋 Verificando Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    echo "Por favor inicia Docker Desktop y vuelve a intentar"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"
echo ""

# Paso 2: Limpiar contenedores previos
echo -e "${YELLOW}🧹 Limpiando contenedores previos...${NC}"
if docker ps -a | grep -q $CONTAINER_NAME; then
    docker stop $CONTAINER_NAME > /dev/null 2>&1 || true
    docker rm $CONTAINER_NAME > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ Contenedor previo removido${NC}"
else
    echo -e "${GREEN}✅ No hay contenedores previos${NC}"
fi
echo ""

# Paso 3: Build de la imagen
echo -e "${YELLOW}🔨 Construyendo imagen Docker...${NC}"
echo "Contexto: $(pwd)/../.."
echo "Dockerfile: Dockerfile.openshift"
echo ""

cd ../..
docker build \
    -t ${IMAGE_NAME}:${IMAGE_TAG} \
    -f apps/sentiment-analysis/Dockerfile.openshift \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
else
    echo -e "${RED}❌ Error al construir la imagen${NC}"
    exit 1
fi
echo ""

# Paso 4: Mostrar tamaño de la imagen
echo -e "${YELLOW}📊 Información de la imagen:${NC}"
docker images ${IMAGE_NAME}:${IMAGE_TAG}
echo ""

# Paso 5: Verificar variables de entorno
echo -e "${YELLOW}🔐 Verificando variables de entorno...${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}⚠️  WARNING: OPENAI_API_KEY no está configurada${NC}"
    echo "La aplicación funcionará pero el análisis de sentimiento fallará"
    echo "Configura con: export OPENAI_API_KEY=tu_api_key"
else
    echo -e "${GREEN}✅ OPENAI_API_KEY configurada${NC}"
fi
echo ""

# Paso 6: Ejecutar contenedor
echo -e "${YELLOW}🚀 Ejecutando contenedor...${NC}"
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:${PORT} \
    -e NODE_ENV=production \
    -e PORT=${PORT} \
    -e OPENAI_API_KEY="${OPENAI_API_KEY:-sk-test-key}" \
    -e AI_PROVIDER="${AI_PROVIDER:-openai}" \
    -e DEFAULT_MODEL="${DEFAULT_MODEL:-gpt-4}" \
    -e MAX_FILE_SIZE="${MAX_FILE_SIZE:-10485760}" \
    -e NEXT_TELEMETRY_DISABLED=1 \
    ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contenedor iniciado${NC}"
else
    echo -e "${RED}❌ Error al iniciar contenedor${NC}"
    exit 1
fi
echo ""

# Paso 7: Esperar a que la app esté lista
echo -e "${YELLOW}⏳ Esperando a que la aplicación esté lista...${NC}"
sleep 5

# Intentar health check por 30 segundos
for i in {1..30}; do
    if curl -s http://localhost:${PORT}/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicación lista!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Timeout: La aplicación no respondió${NC}"
        echo "Mostrando logs:"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
    sleep 1
done
echo ""

# Paso 8: Pruebas básicas
echo -e "${YELLOW}🧪 Ejecutando pruebas básicas...${NC}"
echo ""

# Health check
echo -e "${BLUE}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:${PORT}/api/health)
if echo $HEALTH_RESPONSE | grep -q "\"status\":\"ok\""; then
    echo -e "${GREEN}✅ Health check: OK${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check: FAILED${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi
echo ""

# Homepage
echo -e "${BLUE}Test 2: Homepage${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/ | grep -q "200"; then
    echo -e "${GREEN}✅ Homepage: OK (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Homepage: FAILED${NC}"
fi
echo ""

# Paso 9: Mostrar información útil
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Imagen creada y probada exitosamente!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}📝 Información del contenedor:${NC}"
echo "  Nombre: ${CONTAINER_NAME}"
echo "  Puerto: ${PORT}"
echo "  URL: http://localhost:${PORT}"
echo "  Health: http://localhost:${PORT}/api/health"
echo ""
echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
echo "  Ver logs:     docker logs ${CONTAINER_NAME}"
echo "  Ver logs -f:  docker logs -f ${CONTAINER_NAME}"
echo "  Detener:      docker stop ${CONTAINER_NAME}"
echo "  Eliminar:     docker rm ${CONTAINER_NAME}"
echo "  Shell:        docker exec -it ${CONTAINER_NAME} /bin/sh"
echo ""
echo -e "${YELLOW}🌐 URLs de prueba:${NC}"
echo "  Homepage:     http://localhost:${PORT}/"
echo "  Health:       http://localhost:${PORT}/api/health"
echo "  App:          http://localhost:${PORT}/app"
echo ""
echo -e "${YELLOW}🛑 Para detener:${NC}"
echo "  docker stop ${CONTAINER_NAME} && docker rm ${CONTAINER_NAME}"
echo ""
