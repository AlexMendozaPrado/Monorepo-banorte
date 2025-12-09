# 📦 Entrega a DevSecOps - Sentiment Analysis

**Aplicación:** Banorte Sentiment Analysis
**Versión:** 1.0.0
**Fecha:** 2025-12-03
**Contacto:** [Tu nombre/equipo]

---

## 📋 Resumen

Esta aplicación analiza el sentimiento de documentos PDF usando OpenAI GPT-4, construida con Next.js 14 y arquitectura Clean Architecture.

---

## 🐳 Imagen Docker

### Ubicación del Dockerfile
```
apps/sentiment-analysis/Dockerfile.openshift
```

### Características de la Imagen
- **Tamaño:** ~278MB (optimizada con Next.js standalone)
- **Base:** Red Hat UBI9 con Node.js 20
- **Multi-stage build:** 3 etapas (deps, builder, runner)
- **Seguridad:** Usuario no-root, permisos grupo 0 (compatible OpenShift)
- **Health check:** `/api/health` endpoint

---

## 🔨 Build de la Imagen

### Desde la Raíz del Monorepo

```bash
cd /path/to/banorte-monorepo

docker build \
  -t sentiment-analysis:v1.0.0 \
  -f apps/sentiment-analysis/Dockerfile.openshift \
  .
```

**⚠️ IMPORTANTE:**
- El build DEBE ejecutarse desde la raíz del monorepo (`banorte-monorepo/`)
- No desde `apps/sentiment-analysis/`
- Esto es necesario porque la app usa workspaces de pnpm

### Tiempo de Build
- Primera vez: ~8 minutos
- Con caché: ~2-3 minutos

---

## 🔑 Variables de Entorno Requeridas

### Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `OPENAI_API_KEY` | API Key de OpenAI | `sk-xxx...` |
| `NODE_ENV` | Ambiente de ejecución | `production` |
| `PORT` | Puerto de la aplicación | `3001` |

### Opcionales

| Variable | Default | Descripción |
|----------|---------|-------------|
| `AI_PROVIDER` | `openai` | Proveedor de IA |
| `DEFAULT_MODEL` | `gpt-4` | Modelo de OpenAI |
| `MAX_FILE_SIZE` | `10485760` | Tamaño máximo PDF (10MB) |
| `ALLOWED_FILE_TYPES` | `application/pdf` | Tipos permitidos |
| `NEXT_TELEMETRY_DISABLED` | `1` | Deshabilitar telemetría |

### Crear Secret en OpenShift

```bash
oc create secret generic sentiment-analysis-secrets \
  --from-literal=openai-api-key=sk-xxx-tu-api-key-aqui
```

---

## 📊 Health Check

### Endpoint
```
GET /api/health
```

### Respuesta Exitosa (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T15:30:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0",
  "service": "sentiment-analysis"
}
```

### Respuesta de Error (503 Service Unavailable)
```json
{
  "status": "error",
  "timestamp": "2025-12-03T15:30:00.000Z",
  "error": "mensaje de error"
}
```

### Configuración en OpenShift

Los manifiestos en `openshift/deployment.yaml` ya incluyen:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 60
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 5
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /api/health
    port: 3001
  periodSeconds: 10
  failureThreshold: 30
```

---

## 🚀 Deployment en OpenShift

### Opción A: Build en OpenShift (Recomendado)

```bash
# 1. Crear build config
oc new-build \
  --name=sentiment-analysis \
  --strategy=docker \
  --binary=true

# 2. Subir código y construir
oc start-build sentiment-analysis \
  --from-dir=. \
  --follow

# 3. Aplicar manifiestos
oc apply -f apps/sentiment-analysis/openshift/
```

### Opción B: Push de Imagen Pre-construida

```bash
# 1. Build local
docker build -t sentiment-analysis:v1.0.0 \
  -f apps/sentiment-analysis/Dockerfile.openshift \
  .

# 2. Tag para OpenShift registry
docker tag sentiment-analysis:v1.0.0 \
  image-registry.openshift-image-registry.svc:5000/banorte-apps/sentiment-analysis:v1.0.0

# 3. Login a OpenShift registry
docker login -u $(oc whoami) -p $(oc whoami -t) \
  image-registry.openshift-image-registry.svc:5000

# 4. Push
docker push \
  image-registry.openshift-image-registry.svc:5000/banorte-apps/sentiment-analysis:v1.0.0

# 5. Aplicar manifiestos
oc apply -f apps/sentiment-analysis/openshift/
```

---

## 📁 Manifiestos OpenShift

Ubicación: `apps/sentiment-analysis/openshift/`

| Archivo | Propósito |
|---------|-----------|
| `deployment.yaml` | Configuración de pods, recursos, probes |
| `service.yaml` | Servicio interno (ClusterIP) |
| `route.yaml` | Exposición externa (HTTPS) |
| `configmap.yaml` | Configuración de la aplicación |

---

## 💾 Recursos Recomendados

```yaml
resources:
  requests:
    memory: "512Mi"    # Mínimo garantizado
    cpu: "250m"        # 0.25 cores
  limits:
    memory: "2Gi"      # Máximo permitido
    cpu: "1000m"       # 1 core
```

**Justificación:**
- Next.js SSR necesita ~300-400MB en idle
- Análisis de sentimiento es I/O bound (llamadas API OpenAI)
- Picos de memoria durante análisis de PDFs grandes

---

## 🔒 Seguridad

### Usuario No-Root
- Imagen ejecuta como UID 1001 (no-root)
- Compatible con OpenShift Security Context Constraints (SCC)
- Permisos de grupo 0 para UID aleatorio

### Imagen Base Certificada
- Red Hat UBI9 (Universal Base Image)
- Actualizaciones de seguridad automáticas
- Cumple estándares empresariales

### Secrets Management
- API keys NO están en la imagen
- Se inyectan vía OpenShift Secrets en runtime
- Ver `deployment.yaml` para configuración

---

## 📊 Monitoreo

### Métricas Disponibles
- **Health status:** `/api/health`
- **Uptime:** Incluido en health check
- **Environment:** Incluido en health check

### Logs
```bash
# Ver logs en tiempo real
oc logs -f deployment/sentiment-analysis

# Ver logs de pod específico
oc logs sentiment-analysis-xxxxx-yyyyy
```

---

## 🧪 Pruebas Locales (Opcional)

Si desean probar la imagen localmente antes del deployment:

### Linux/macOS
```bash
cd apps/sentiment-analysis
chmod +x docker-test.sh
./docker-test.sh
```

### Windows PowerShell
```powershell
cd apps\sentiment-analysis
.\docker-test.ps1
```

Estos scripts automatizan:
- Build de la imagen
- Ejecución del contenedor
- Pruebas de health check
- Validación de endpoints

---

## 📚 Documentación Adicional

- **`DOCKER.md`** - Documentación técnica completa de la imagen
  - Arquitectura multi-stage
  - Optimizaciones implementadas
  - Troubleshooting detallado
  - Variables de entorno completas

- **`README.md`** - Documentación general de la aplicación
  - Características de la app
  - Arquitectura de software
  - API endpoints

---

## ⚠️ Consideraciones Importantes

### Persistencia de Datos
- **Repositorio in-memory:** Los datos NO persisten entre reinicios
- Para persistencia, se requiere migración a PostgreSQL (futuro)
- Actualmente aceptable para POC/demo

### Dependencias Externas
- **OpenAI API:** Requiere conectividad a internet
- **Alternativa:** Soporte para Ollama (modelos locales) vía variable `AI_PROVIDER=ollama`

### Escalabilidad
- **Stateless:** Puede escalarse horizontalmente (múltiples réplicas)
- **Sin sticky sessions:** Cualquier pod puede manejar cualquier request
- Recomendado: 2-3 réplicas para alta disponibilidad

---

## 🐛 Troubleshooting Común

### Error: "Permission denied"
**Causa:** Permisos incorrectos para UID aleatorio de OpenShift
**Solución:** El Dockerfile ya incluye `chmod g=u` (línea 78)

### Error: "Cannot find module"
**Causa:** Dependencia faltante en node_modules
**Solución:** Verificar que `output: 'standalone'` está en next.config.js

### Error: Health check falla
**Causa:** App no respondiendo en /api/health
**Solución:** Verificar logs con `oc logs`, ajustar `initialDelaySeconds`

### Build muy lento
**Causa:** Caché de Docker no optimizado
**Solución:** Verificar que .dockerignore está presente

**Más detalles en `DOCKER.md` sección Troubleshooting**

---

## 📞 Contacto

Para dudas o problemas:
- **Equipo:** [Tu equipo]
- **Email:** [tu-email@banorte.com]
- **Slack:** [#canal-sentiment-analysis]

---

## ✅ Checklist de Verificación

Antes de deployment, verificar:

- [ ] Secret `sentiment-analysis-secrets` creado con `openai-api-key`
- [ ] ConfigMap aplicado (ver `openshift/configmap.yaml`)
- [ ] Imagen construida y disponible en registry
- [ ] Manifiestos aplicados (`oc apply -f openshift/`)
- [ ] Health check responde correctamente
- [ ] Pods en estado `Running`
- [ ] Route configurado y accesible
- [ ] Logs no muestran errores críticos

---

**Versión del documento:** 1.0.0
**Última actualización:** 2025-12-03
