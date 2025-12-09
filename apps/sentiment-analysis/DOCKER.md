# 🐳 Documentación Técnica - Docker

## Índice
- [Arquitectura de la Imagen](#arquitectura-de-la-imagen)
- [Construcción de la Imagen](#construcción-de-la-imagen)
- [Pruebas Locales](#pruebas-locales)
- [Optimizaciones Implementadas](#optimizaciones-implementadas)
- [Variables de Entorno](#variables-de-entorno)
- [Deployment en OpenShift](#deployment-en-openshift)
- [Troubleshooting](#troubleshooting)

---

## Arquitectura de la Imagen

### Multi-Stage Build Strategy

La imagen utiliza una estrategia de **multi-stage build** con 3 etapas para optimizar tamaño y seguridad:

```dockerfile
┌─────────────────────────────────────────────────────────┐
│ Stage 1: deps                                           │
│ - Imagen: ubi9/nodejs-20:latest                         │
│ - Propósito: Instalar dependencias de producción       │
│ - Output: node_modules (prod only)                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 2: builder                                        │
│ - Imagen: ubi9/nodejs-20:latest                         │
│ - Propósito: Build de la aplicación                    │
│ - Output: .next/standalone + .next/static + public     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 3: runner (FINAL)                                 │
│ - Imagen: ubi9/nodejs-20-minimal:latest                 │
│ - Propósito: Ejecutar aplicación en producción         │
│ - Tamaño: ~200-300MB (vs ~800MB sin optimización)      │
└─────────────────────────────────────────────────────────┘
```

### Next.js Standalone Output

La aplicación usa `output: 'standalone'` en `next.config.js`, que:

✅ **Genera `.next/standalone`** con solo archivos necesarios
✅ **Traza dependencias automáticamente** (tree-shaking de node_modules)
✅ **Reduce tamaño** de ~800MB a ~200-300MB
✅ **Incluye server.js** para ejecutar sin `next start`

**⚠️ Importante:** Standalone NO incluye `public/` ni `.next/static/`, deben copiarse manualmente.

---

## Construcción de la Imagen

### Desde la Raíz del Monorepo

```bash
# Navegar a la raíz
cd /path/to/banorte-monorepo

# Build de la imagen
docker build \
  -t sentiment-analysis:latest \
  -f apps/sentiment-analysis/Dockerfile.openshift \
  .
```

### Con Tag Específico

```bash
# Para producción
docker build \
  -t sentiment-analysis:v1.0.0 \
  -f apps/sentiment-analysis/Dockerfile.openshift \
  .

# Para staging
docker build \
  -t sentiment-analysis:staging \
  -f apps/sentiment-analysis/Dockerfile.openshift \
  .
```

### Build Args (Futuro)

```dockerfile
# Ejemplo de build args para configuración en build time
docker build \
  --build-arg NODE_ENV=production \
  --build-arg NEXT_TELEMETRY_DISABLED=1 \
  -t sentiment-analysis:latest \
  -f apps/sentiment-analysis/Dockerfile.openshift \
  .
```

### Tiempo de Build

| Etapa | Tiempo Aprox | Caché |
|-------|--------------|-------|
| deps | 2-3 min | ✅ Alta |
| builder | 3-5 min | ✅ Media |
| runner | 30 seg | ✅ Alta |
| **Total (primera vez)** | **~8 min** | - |
| **Total (con caché)** | **~2 min** | - |

---

## Pruebas Locales

### Opción A: Scripts Automatizados (Recomendado)

#### Linux/macOS
```bash
cd apps/sentiment-analysis
chmod +x docker-test.sh
./docker-test.sh
```

#### Windows PowerShell
```powershell
cd apps\sentiment-analysis
.\docker-test.ps1
```

**¿Qué hace el script?**
1. ✅ Verifica que Docker esté corriendo
2. ✅ Limpia contenedores previos
3. ✅ Construye la imagen
4. ✅ Ejecuta el contenedor con variables de entorno
5. ✅ Espera a que la app esté lista
6. ✅ Ejecuta pruebas de health check
7. ✅ Muestra información útil y comandos

### Opción B: Manual (Paso a Paso)

#### 1. Build
```bash
cd /path/to/banorte-monorepo
docker build -t sentiment-analysis:test -f apps/sentiment-analysis/Dockerfile.openshift .
```

#### 2. Run
```bash
docker run -d \
  --name sentiment-analysis-test \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e OPENAI_API_KEY=sk-xxx \
  -e AI_PROVIDER=openai \
  -e DEFAULT_MODEL=gpt-4 \
  -e MAX_FILE_SIZE=10485760 \
  -e NEXT_TELEMETRY_DISABLED=1 \
  sentiment-analysis:test
```

#### 3. Verificar Logs
```bash
# Ver logs en tiempo real
docker logs -f sentiment-analysis-test

# Ver últimas 50 líneas
docker logs --tail 50 sentiment-analysis-test
```

#### 4. Health Check
```bash
# Verificar que la app está corriendo
curl http://localhost:3001/api/health

# Debería retornar:
# {"status":"ok","timestamp":"...","uptime":123.45,"environment":"production","version":"1.0.0","service":"sentiment-analysis"}
```

#### 5. Probar Homepage
```bash
# Browser
open http://localhost:3001

# Curl
curl -I http://localhost:3001
# Debe retornar: HTTP/1.1 200 OK
```

#### 6. Detener y Limpiar
```bash
docker stop sentiment-analysis-test
docker rm sentiment-analysis-test
```

---

## Optimizaciones Implementadas

### 1. `.dockerignore`

**Ubicación:**
- `banorte-monorepo/.dockerignore` (raíz del monorepo)
- `apps/sentiment-analysis/.dockerignore` (app específica)

**Archivos excluidos:**
```
node_modules, .next, out, dist, build
cypress, __tests__, *.test.ts, coverage
.env, .env.local, .git, .vscode
README.md, *.md (excepto package.json)
```

**Impacto:**
- ⚡ Reduce tiempo de build de ~10min a ~3min
- 📦 Reduce tamaño del contexto de Docker de ~2GB a ~200MB
- 🔒 Evita copiar archivos sensibles (.env, secrets)

### 2. Next.js Standalone Output

**Configuración:** `next.config.js`
```javascript
const nextConfig = {
  output: 'standalone',  // ← Clave para optimización
  // ...
}
```

**Impacto:**
- 📦 Reduce tamaño final de ~800MB a ~200-300MB
- ⚡ Startup más rápido (menos archivos que cargar)
- 🎯 Solo incluye dependencias realmente usadas

### 3. Imagen Base Minimal

**Stage 3 (runner):**
```dockerfile
FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest
```

**vs. Full Image:**
```dockerfile
FROM registry.access.redhat.com/ubi9/nodejs-20:latest
```

**Diferencia:**
- Minimal: ~150MB base
- Full: ~300MB base
- **Ahorro: ~150MB**

### 4. Layer Caching Strategy

**Orden de COPY optimizado:**
```dockerfile
# 1. Archivos que cambian RARAMENTE primero (mejor caché)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 2. package.json de workspaces
COPY apps/sentiment-analysis/package.json ./apps/sentiment-analysis/

# 3. Instalación (layer pesado, pero cacheado si package.json no cambió)
RUN pnpm install --frozen-lockfile

# 4. Código fuente (cambia frecuentemente, al final)
COPY apps/sentiment-analysis ./apps/sentiment-analysis
```

**Impacto:**
- 🚀 Rebuild con cambios en código: ~2min (reusa caché de deps)
- 🐌 Sin caché: ~8min (reinstala todo)

### 5. Permisos OpenShift-Compatible

```dockerfile
# Crear directorios con permisos para grupo 0 (OpenShift requirement)
RUN mkdir -p /opt/app-root/src/uploads /tmp && \
    chgrp -R 0 /opt/app-root/src && \
    chmod -R g=u /opt/app-root/src && \
    chmod -R g=u /tmp

# Usuario no-root (OpenShift asigna UID aleatorio, siempre grupo 0)
USER 1001
```

**¿Por qué?**
- OpenShift ejecuta contenedores con UID aleatorio por seguridad
- Siempre asigna grupo 0 (root group)
- Permisos `g=u` permiten que grupo tenga mismos permisos que usuario

---

## Variables de Entorno

### Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Ambiente de ejecución | `production` |
| `PORT` | Puerto de la aplicación | `3001` |
| `OPENAI_API_KEY` | API Key de OpenAI | `sk-xxx...` |

### Opcionales

| Variable | Default | Descripción |
|----------|---------|-------------|
| `AI_PROVIDER` | `openai` | Proveedor de IA (`openai` o `ollama`) |
| `DEFAULT_MODEL` | `gpt-4` | Modelo de OpenAI a usar |
| `MAX_FILE_SIZE` | `10485760` | Tamaño máximo de PDF (10MB) |
| `ALLOWED_FILE_TYPES` | `application/pdf` | Tipos de archivo permitidos |
| `TEMPERATURE` | `0.3` | Temperatura del modelo (creatividad) |
| `MAX_TOKENS` | `4000` | Máximo de tokens por análisis |
| `NEXT_TELEMETRY_DISABLED` | `1` | Deshabilitar telemetría de Next.js |

### Configuración con Archivo `.env`

```bash
# Crear archivo .env.docker
cat > .env.docker <<EOF
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-xxx
AI_PROVIDER=openai
DEFAULT_MODEL=gpt-4
MAX_FILE_SIZE=10485760
NEXT_TELEMETRY_DISABLED=1
EOF

# Ejecutar con archivo env
docker run -d \
  --name sentiment-analysis \}
  -p 3001:3001 \
  --env-file .env.docker \
  sentiment-analysis:latest
```

---

## Deployment en OpenShift

### Manifiestos Disponibles

**Ubicación:** `apps/sentiment-analysis/openshift/`

```
openshift/
├── deployment.yaml    # Configuración del deployment (pods, recursos, probes)
├── service.yaml       # Servicio interno (ClusterIP)
├── route.yaml         # Exposición externa (ingress)
└── configmap.yaml     # Configuración de la aplicación
```

### Proceso de Deployment

#### 1. Crear Namespace (si no existe)
```bash
oc new-project banorte-apps
```

#### 2. Crear Secrets
```bash
# Secret para OpenAI API Key
oc create secret generic sentiment-analysis-secrets \
  --from-literal=openai-api-key=sk-xxx

# Secret para Database URL (futuro)
oc create secret generic sentiment-analysis-secrets \
  --from-literal=database-url=postgresql://user:pass@host:5432/db \
  --dry-run=client -o yaml | oc apply -f -
```

#### 3. Crear ConfigMap
```bash
oc apply -f openshift/configmap.yaml
```

#### 4. Build de Imagen en OpenShift

**Opción A: Build desde Source (S2I)**
```bash
oc new-build \
  --name=sentiment-analysis \
  --strategy=docker \
  --docker-image=registry.access.redhat.com/ubi9/nodejs-20:latest \
  --binary=true

# Upload del código
oc start-build sentiment-analysis --from-dir=. --follow
```

**Opción B: Push de Imagen Pre-construida**
```bash
# Build local
docker build -t sentiment-analysis:v1.0.0 -f apps/sentiment-analysis/Dockerfile.openshift .

# Tag para OpenShift registry
docker tag sentiment-analysis:v1.0.0 \
  image-registry.openshift-image-registry.svc:5000/banorte-apps/sentiment-analysis:v1.0.0

# Login a OpenShift registry
docker login -u $(oc whoami) -p $(oc whoami -t) \
  image-registry.openshift-image-registry.svc:5000

# Push
docker push image-registry.openshift-image-registry.svc:5000/banorte-apps/sentiment-analysis:v1.0.0
```

#### 5. Aplicar Manifiestos
```bash
# Aplicar todos los manifiestos
oc apply -f openshift/

# O uno por uno
oc apply -f openshift/deployment.yaml
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml
```

#### 6. Verificar Deployment
```bash
# Ver status del deployment
oc get deployment sentiment-analysis

# Ver pods
oc get pods -l app=sentiment-analysis

# Ver logs
oc logs -f deployment/sentiment-analysis

# Ver route (URL externa)
oc get route sentiment-analysis
```

### Health Checks Configurados

**Liveness Probe:** Verifica que la app está ejecutándose
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 60
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe:** Verifica que la app está lista para recibir tráfico
```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

**Startup Probe:** Para cold starts lentos (inicialización)
```yaml
startupProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30  # Permite hasta 5 minutos de startup
```

### Recursos Recomendados

```yaml
resources:
  requests:
    memory: "512Mi"   # Mínimo garantizado
    cpu: "250m"       # 0.25 CPU cores
  limits:
    memory: "2Gi"     # Máximo permitido
    cpu: "1000m"      # 1 CPU core
```

**Justificación:**
- Next.js SSR necesita ~300-400MB en estado idle
- Análisis de sentimiento (OpenAI API calls) son I/O bound, no CPU intensive
- Picos de memoria durante análisis de PDFs grandes

---

## Troubleshooting

### Error: "Permission Denied" al ejecutar script

**Problema:**
```bash
bash: ./docker-test.sh: Permission denied
```

**Solución:**
```bash
chmod +x docker-test.sh
./docker-test.sh
```

---

### Error: Imagen no puede copiar `.next/standalone`

**Problema:**
```
COPY failed: file not found in build context or excluded by .dockerignore: stat apps/sentiment-analysis/.next/standalone: file does not exist
```

**Causa:** `output: 'standalone'` no está configurado en `next.config.js`

**Solución:**
```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',  // ← Agregar esta línea
  // ...
}
```

---

### Error: Health Check Falla

**Problema:**
```
Liveness probe failed: Get "http://10.x.x.x:3001/api/health": dial tcp 10.x.x.x:3001: connect: connection refused
```

**Diagnóstico:**
```bash
# Ver logs del pod
oc logs -f deployment/sentiment-analysis

# Verificar que el endpoint existe
oc exec deployment/sentiment-analysis -- curl http://localhost:3001/api/health
```

**Causas comunes:**
1. App no escucha en `0.0.0.0` (solo en `localhost`)
2. Puerto incorrecto en el probe
3. Endpoint `/api/health` no existe
4. App crasheó durante el startup

**Solución:**
- Verificar que Next.js escucha en `0.0.0.0` (default con standalone)
- Ajustar `initialDelaySeconds` si el startup es lento

---

### Error: "Cannot find module" en Producción

**Problema:**
```
Error: Cannot find module 'some-package'
```

**Causa:** Dependencia está en `devDependencies` en vez de `dependencies`

**Solución:**
```bash
# Mover a dependencies
pnpm add some-package
pnpm remove -D some-package

# Rebuild imagen
docker build --no-cache -t sentiment-analysis:latest -f apps/sentiment-analysis/Dockerfile.openshift .
```

---

### Error: Imagen muy grande (>500MB)

**Diagnóstico:**
```bash
# Ver tamaño de cada layer
docker history sentiment-analysis:latest

# Inspeccionar contenido de la imagen
docker run --rm sentiment-analysis:latest du -sh /opt/app-root/src/*
```

**Soluciones:**
1. Verificar que `output: 'standalone'` está configurado
2. Revisar `.dockerignore` - no excluir archivos importantes
3. Asegurar que stage final copia solo desde builder (no deps)

---

### Performance: Build Muy Lento

**Optimizaciones:**

#### 1. Usar BuildKit (más rápido y con mejor caché)
```bash
# Linux/macOS
export DOCKER_BUILDKIT=1
docker build -t sentiment-analysis:latest -f apps/sentiment-analysis/Dockerfile.openshift .

# Windows PowerShell
$env:DOCKER_BUILDKIT=1
docker build -t sentiment-analysis:latest -f apps/sentiment-analysis/Dockerfile.openshift .
```

#### 2. Cachear layers de npm/pnpm
```dockerfile
# En Dockerfile, separar instalación de build
RUN pnpm install --frozen-lockfile  # ← Layer cacheado si package.json no cambió
# ...
RUN pnpm build  # ← Solo re-ejecuta si código cambió
```

#### 3. Limpiar caché de Docker si está corrupto
```bash
docker builder prune
docker system prune -a
```

---

## Mejores Prácticas

### ✅ DO

- ✅ **Usar multi-stage builds** para reducir tamaño
- ✅ **Configurar `output: 'standalone'`** en Next.js
- ✅ **Copiar layers pesados primero** (package.json, install)
- ✅ **Usar `.dockerignore`** agresivamente
- ✅ **Ejecutar como usuario no-root** (seguridad)
- ✅ **Configurar health checks** en deployment.yaml
- ✅ **Usar variables de entorno** para configuración
- ✅ **Probar imagen localmente** antes de deployment

### ❌ DON'T

- ❌ **NO copiar `.env` a la imagen** (usar env vars en runtime)
- ❌ **NO usar `latest` tag** en producción (usar version tags)
- ❌ **NO ignorar `public/` y `.next/static/`** en standalone
- ❌ **NO ejecutar como root** en producción
- ❌ **NO incluir `node_modules` completo** (usar standalone)
- ❌ **NO hacer `npm install` en stage final** (solo copiar)

---

## Referencias

**Documentación Oficial:**
- [Next.js Docker Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Next.js Standalone Output](https://nextjs.org/docs/pages/api-reference/config/next-config-js/output)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [OpenShift Container Platform](https://docs.openshift.com/)

**Mejores Prácticas:**
- [Dockerize a Next.js app using multi-stage builds](https://johnnymetz.com/posts/dockerize-nextjs-app/)
- [Optimize Your Next.js App for Docker](https://medium.com/@raviwcuk/optimize-your-next-js-app-for-docker-with-a-multi-stage-build-e1eca52ddce2)
- [Next.js with Docker, Standalone, and Custom Server](https://hmos.dev/en/nextjs-docker-standalone-and-custom-server)

---

**Última actualización:** 2025-12-03
**Versión de la imagen:** 1.0.0
**Compatibilidad:** OpenShift 4.x, Kubernetes 1.20+
