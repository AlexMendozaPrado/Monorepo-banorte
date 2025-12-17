# Comandos de Prueba - OpenAI Integration

Guía rápida de comandos para probar los endpoints de OpenAI en Banorte Financial App.

---

## Prerequisitos

1. Servidor corriendo en puerto 3004:
```bash
cd apps/banorte-financial-app
npm run dev
```

2. Variables de entorno configuradas en `.env.local`:
```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

---

## Módulo Advisor (Asesor Financiero)

### 1. Chat Conversacional
```bash
curl -X POST http://localhost:3004/api/advisor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "¿Cómo puedo ahorrar más dinero cada mes?"
  }'
```

**Variaciones de mensajes:**
```bash
# Pregunta sobre deudas
curl -X POST http://localhost:3004/api/advisor/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","message":"Tengo 3 tarjetas de crédito, ¿cómo las pago?"}'

# Pregunta sobre presupuesto
curl -X POST http://localhost:3004/api/advisor/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","message":"¿Cuánto debería destinar a ahorros?"}'

# Pregunta sobre inversión (debe redirigir, no asesora inversiones)
curl -X POST http://localhost:3004/api/advisor/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","message":"¿Dónde invierto mi dinero en la bolsa?"}'
```

### 2. Dashboard Summary
```bash
curl -X GET "http://localhost:3004/api/dashboard/summary?userId=test-user"
```

---

## Módulo Budget (Presupuestos)

### 1. Detectar Gastos Hormiga
```bash
# 1 mes de análisis
curl -X GET "http://localhost:3004/api/budget/ant-expenses?userId=test-user&timeFrameMonths=1"

# 3 meses de análisis
curl -X GET "http://localhost:3004/api/budget/ant-expenses?userId=test-user&timeFrameMonths=3"

# 6 meses de análisis
curl -X GET "http://localhost:3004/api/budget/ant-expenses?userId=test-user&timeFrameMonths=6"
```

### 2. Analizar Patrones de Gasto
```bash
curl -X POST http://localhost:3004/api/budget/patterns \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "timeFrameMonths": 3
  }'
```

### 3. Predecir Gastos Futuros
```bash
curl -X POST http://localhost:3004/api/budget/predict \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "timeFrameMonths": 1
  }'
```

---

## Módulo Debt (Deudas)

### 1. Analizar Estrategia de Deudas
```bash
# Estrategia Avalancha (mayor tasa primero)
curl -X POST http://localhost:3004/api/debt/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "strategyType": "AVALANCHE",
    "availableMonthly": 3000
  }'

# Estrategia Bola de Nieve (menor saldo primero)
curl -X POST http://localhost:3004/api/debt/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "strategyType": "SNOWBALL",
    "availableMonthly": 5000
  }'
```

### 2. Evaluar Consolidación
```bash
curl -X POST http://localhost:3004/api/debt/consolidation \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user"
  }'
```

### 3. Optimizar Pagos Extra
```bash
curl -X POST http://localhost:3004/api/debt/optimize-payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "extraAmount": 2000
  }'
```

---

## Health Check

### Verificar Conexión con OpenAI
```bash
curl -X GET http://localhost:3004/api/health/ai
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "services": {
    "openai": true
  }
}
```

---

## Testing en PowerShell (Windows)

Si prefieres PowerShell en lugar de curl:

### Advisor Chat
```powershell
$body = @{
    userId = "test-user"
    message = "¿Cómo puedo ahorrar más dinero?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/advisor/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Budget Ant Expenses
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/budget/ant-expenses?userId=test-user&timeFrameMonths=1" `
  -Method Get
```

### Debt Strategy
```powershell
$body = @{
    userId = "test-user"
    strategyType = "AVALANCHE"
    availableMonthly = 3000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/debt/strategy" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

---

## Validación de Respuestas

### ✅ Respuesta Exitosa
Todas las respuestas exitosas tienen este formato:
```json
{
  "success": true,
  "data": { ... }
}
```

### ❌ Respuesta con Error
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

### Errores Comunes

1. **Sin API Key**
```json
{
  "success": false,
  "error": "❌ OPENAI_API_KEY is required. Set it in .env file."
}
```
**Solución:** Configurar `OPENAI_API_KEY` en `.env.local`

2. **Rate Limit Excedido**
```json
{
  "success": false,
  "error": "OpenAI rate limit exceeded"
}
```
**Solución:** Esperar 1 minuto (free tier: 3 RPM)

3. **Timeout**
```json
{
  "success": false,
  "error": "OpenAI request timeout"
}
```
**Solución:** Reintentar (automático con retry logic)

---

## Monitoreo de Logs

### Ver logs del servidor en tiempo real
```bash
# En la terminal donde corre npm run dev
# Los logs aparecerán automáticamente
```

**Ejemplo de logs:**
```
🤖 OpenAI Request: {
  service: 'OpenAIFinancialAdvisor',
  model: 'gpt-4o-mini',
  systemPromptLength: 1231,
  userPromptLength: 363
}

✅ OpenAI Response: {
  service: 'OpenAIFinancialAdvisor',
  tokensUsed: 649,
  duration: '6912ms'
}
```

---

## Pruebas con Postman

### Importar Collection

Crea un archivo `banorte-openai.postman_collection.json`:

```json
{
  "info": {
    "name": "Banorte Financial - OpenAI",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Advisor Chat",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"test-user\",\n  \"message\": \"¿Cómo puedo ahorrar más?\"\n}"
        },
        "url": {
          "raw": "http://localhost:3004/api/advisor/chat",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3004",
          "path": ["api", "advisor", "chat"]
        }
      }
    },
    {
      "name": "Budget Ant Expenses",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3004/api/budget/ant-expenses?userId=test-user&timeFrameMonths=1",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3004",
          "path": ["api", "budget", "ant-expenses"],
          "query": [
            {"key": "userId", "value": "test-user"},
            {"key": "timeFrameMonths", "value": "1"}
          ]
        }
      }
    },
    {
      "name": "Debt Strategy",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"test-user\",\n  \"strategyType\": \"AVALANCHE\",\n  \"availableMonthly\": 3000\n}"
        },
        "url": {
          "raw": "http://localhost:3004/api/debt/strategy",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3004",
          "path": ["api", "debt", "strategy"]
        }
      }
    }
  ]
}
```

Importar en Postman: `File > Import > Upload Files`

---

## Troubleshooting

### Problema: "EADDRINUSE: address already in use :::3004"
**Solución:**
```bash
# Windows
netstat -ano | findstr :3004
taskkill //F //PID <PID>

# Linux/Mac
lsof -ti:3004 | xargs kill -9
```

### Problema: Servidor no carga variables de entorno
**Solución:**
1. Detener servidor (Ctrl+C)
2. Verificar que `.env.local` o `.env` exista
3. Reiniciar servidor: `npm run dev`

### Problema: Respuestas muy lentas (>30s)
**Posibles causas:**
- API key inválida (verificar formato `sk-*`)
- Red lenta (verificar conexión a internet)
- OpenAI con alta demanda (reintentar más tarde)

---

**Última actualización:** 2025-12-16
