# 🧪 Test de Navegación - Landing Principal

Guía para probar la navegación entre landing y apps tanto en local como en producción.

---

## 📋 Resumen Rápido

### ✅ Funcionamiento Actual

| Entorno | Landing URL | Click "Documind" | Click "Sentiment" | Funciona |
|---------|-------------|------------------|-------------------|----------|
| **Local** | localhost:3002 | → localhost:3000 | → localhost:3001 | ✅ Sí (si apps corren) |
| **Producción** | banorte.com | → documind.banorte.com | → sentiment.banorte.com | ✅ Sí |

---

## 🧪 Pruebas en Desarrollo Local

### Escenario 1: Todas las apps corriendo ✅

**Setup:**
```bash
# Terminal 1
pnpm dev:landing          # Puerto 3002

# Terminal 2
pnpm dev:documind         # Puerto 3000

# Terminal 3
pnpm dev:sentiment        # Puerto 3001
```

**Prueba:**
1. Abre http://localhost:3002 (Landing)
2. Click en "Documind" → Debe redirigir a http://localhost:3000 ✅
3. Vuelve a landing
4. Click en "Sentiment Analysis" → Debe redirigir a http://localhost:3001 ✅

**Resultado esperado:** ✅ Navegación funciona perfectamente

---

### Escenario 2: Solo landing corriendo ⚠️

**Setup:**
```bash
# Solo terminal 1
pnpm dev:landing          # Puerto 3002
```

**Prueba:**
1. Abre http://localhost:3002 (Landing)
2. Click en "Documind" → Intenta ir a http://localhost:3000
3. Resultado: Error "This site can't be reached" (esperado)

**Explicación:**
- La navegación SÍ funciona
- Solo que la app destino no está corriendo
- Esto es normal en desarrollo local

**Solución para testing:**
```bash
# Opción A: Corre todas las apps
pnpm dev

# Opción B: Corre solo las que necesites
pnpm dev:landing &
pnpm dev:documind
```

---

### Escenario 3: Testing con URLs de producción en local 🔧

**Setup:**
```bash
# Edita .env.local
NEXT_PUBLIC_DOCUMIND_URL=https://tu-documind-real.vercel.app
NEXT_PUBLIC_SENTIMENT_URL=https://tu-sentiment-real.vercel.app

# Restart landing
pnpm dev:landing
```

**Prueba:**
1. Abre http://localhost:3002
2. Click en "Documind" → Redirige a URL de producción ✅
3. Click en "Sentiment" → Redirige a URL de producción ✅

**Uso:** Útil para probar diseños de landing mientras apuntas a apps en producción

---

## 🚀 Pruebas en Producción (Vercel)

### Caso 1: Apps ya desplegadas, landing en preview

**Setup:**
1. Apps ya en producción:
   - `https://documind-app.vercel.app`
   - `https://sentiment-app.vercel.app`

2. Landing configurada con variables:
   ```
   NEXT_PUBLIC_DOCUMIND_URL=https://documind-app.vercel.app
   NEXT_PUBLIC_SENTIMENT_URL=https://sentiment-app.vercel.app
   ```

**Prueba:**
1. Despliega landing (preview o producción)
2. Abre URL de Vercel de la landing
3. Click en cards → Debe redirigir a apps ✅

---

### Caso 2: Subdominios configurados

**Setup:**
1. DNS configurado:
   - `banorte.com` → Landing
   - `documind.banorte.com` → Documind
   - `sentiment.banorte.com` → Sentiment

2. Variables en Vercel Dashboard:
   ```
   NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
   NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
   ```

**Prueba:**
1. Abre https://banorte.com
2. Click en "Documind" → https://documind.banorte.com ✅
3. Click en "Sentiment" → https://sentiment.banorte.com ✅

---

## 🔍 Verificación de Variables de Entorno

### En desarrollo local:

```bash
# Ver variables actuales
cd apps/landing
cat .env.local

# Debería mostrar:
# NEXT_PUBLIC_DOCUMIND_URL=http://localhost:3000
# NEXT_PUBLIC_SENTIMENT_URL=http://localhost:3001
```

### En Vercel:

1. Dashboard de Vercel → Proyecto "landing"
2. Settings → Environment Variables
3. Verificar que existan:
   - `NEXT_PUBLIC_DOCUMIND_URL`
   - `NEXT_PUBLIC_SENTIMENT_URL`

---

## 🐛 Troubleshooting

### Problema: Click en card no hace nada

**Diagnóstico:**
```javascript
// En browser console (F12)
console.log(process.env.NEXT_PUBLIC_DOCUMIND_URL)
// Debería mostrar la URL configurada
```

**Soluciones:**
1. Verifica que `.env.local` existe
2. Reinicia el dev server después de cambiar `.env.local`
3. Las variables DEBEN empezar con `NEXT_PUBLIC_`

---

### Problema: Redirige a 404

**Causa:** URL configurada incorrectamente

**Solución:**
```bash
# Verifica .env.local
cat apps/landing/.env.local

# URLs deben ser completas:
# ✅ Correcto: http://localhost:3000
# ✅ Correcto: https://app.vercel.app
# ❌ Incorrecto: localhost:3000 (falta http://)
# ❌ Incorrecto: /documind (path relativo, podría no funcionar)
```

---

### Problema: CORS errors en console

**Diagnóstico:** Estás navegando a otra app, esto es esperado

**Explicación:**
- `window.location.href` hace **full page navigation**
- No es una llamada AJAX, no debería haber CORS
- Si ves errores CORS, probablemente son de la app destino

**Solución:** No hacer nada, es comportamiento normal

---

## ✅ Checklist de Pruebas

### Desarrollo Local

- [ ] Landing corre en puerto 3002
- [ ] Variables en `.env.local` configuradas
- [ ] Documind corre en puerto 3000 (si quieres probarlo)
- [ ] Sentiment corre en puerto 3001 (si quieres probarlo)
- [ ] Click en card → Navegación funciona
- [ ] URL cambia en browser
- [ ] App destino carga correctamente

### Producción

- [ ] Apps individuales desplegadas primero
- [ ] URLs de apps obtenidas (ej: `app.vercel.app`)
- [ ] Variables configuradas en Vercel Dashboard
- [ ] Landing desplegada
- [ ] Preview deployment probado
- [ ] Click en card → Navegación funciona
- [ ] Subdominio personalizado configurado (opcional)
- [ ] DNS propagado (si usas subdominios)

---

## 🎯 Flujo de Testing Recomendado

### Fase 1: Local (Solo Landing)

```bash
# 1. Corre solo landing
pnpm dev:landing

# 2. Abre http://localhost:3002
# 3. Verifica que la landing se ve bien
# 4. Click en cards mostrará error (normal, apps no corren)
```

**Objetivo:** Verificar diseño y UI de landing

---

### Fase 2: Local (Todas las apps)

```bash
# 1. Corre todas las apps
pnpm dev

# 2. Espera a que todas inicien:
#    - Landing: 3002
#    - Documind: 3000
#    - Sentiment: 3001

# 3. Abre http://localhost:3002
# 4. Click en cada card
# 5. Verifica navegación
```

**Objetivo:** Testing completo de navegación local

---

### Fase 3: Producción (Preview)

```bash
# 1. Push código a GitHub
git push origin main

# 2. Vercel auto-deploys
# 3. Obtén preview URL
# 4. Configura variables en Vercel
# 5. Re-deploy
# 6. Prueba navegación
```

**Objetivo:** Testing en ambiente real

---

## 📊 Matriz de Compatibilidad

| From \ To | Local App | Vercel App | Custom Domain |
|-----------|-----------|------------|---------------|
| **Local Landing** | ✅ `localhost:3000` | ✅ `app.vercel.app` | ✅ `app.com` |
| **Vercel Landing** | ❌ No accesible | ✅ `app.vercel.app` | ✅ `app.com` |
| **Prod Landing** | ❌ No accesible | ✅ `app.vercel.app` | ✅ `app.com` |

---

## 🎓 Ejemplos de Configuración

### Ejemplo 1: Desarrollo Full Local

```env
# apps/landing/.env.local
NEXT_PUBLIC_DOCUMIND_URL=http://localhost:3000
NEXT_PUBLIC_SENTIMENT_URL=http://localhost:3001
NEXT_PUBLIC_BUSINESS_RULES_URL=http://localhost:3003
NEXT_PUBLIC_MENTORIA_URL=http://localhost:3004
```

**Uso:** Desarrollar todas las apps localmente

---

### Ejemplo 2: Landing local + Apps en producción

```env
# apps/landing/.env.local
NEXT_PUBLIC_DOCUMIND_URL=https://documind.vercel.app
NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.vercel.app
```

**Uso:** Desarrollar solo landing, apuntar a apps reales

---

### Ejemplo 3: Producción con subdominios

```env
# Vercel Dashboard → Landing → Environment Variables
NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
```

**Uso:** Configuración final para producción

---

## 🚦 Indicadores de Éxito

### ✅ Todo funciona si:

1. **Local:**
   - Landing carga en localhost:3002
   - Click en card cambia URL del navegador
   - App destino carga (si está corriendo)

2. **Producción:**
   - Landing carga en dominio
   - Click en card redirige a URL correcta
   - App destino carga
   - No hay errores en console

### ❌ Hay problema si:

1. Click en card no hace nada
2. URL no cambia
3. Redirige a URL incorrecta
4. Variables de entorno no se leen

---

## 💡 Tips

1. **Siempre reinicia** el dev server después de cambiar `.env.local`
2. **Verifica variables** con `console.log()` en browser
3. **Prueba con apps reales** antes de desplegar landing
4. **Usa network tab** en DevTools para ver requests
5. **Subdominios requieren DNS** (puede tomar 24-48h propagar)

---

## 📞 Comandos Útiles

```bash
# Ver qué puertos están en uso
netstat -ano | findstr :3002
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar proceso en puerto (Windows)
taskkill /PID <PID> /F

# Verificar build local
pnpm build:landing

# Ver variables en build
pnpm build:landing --debug
```

---

## ✨ Conclusión

**La navegación SÍ funciona** tanto en local como en producción.

**En local:**
- Requiere que las apps estén corriendo
- URLs configuradas en `.env.local`

**En producción:**
- URLs configuradas en Vercel Dashboard
- Apps deben estar desplegadas primero

---

**Última actualización:** 2025-12-08
