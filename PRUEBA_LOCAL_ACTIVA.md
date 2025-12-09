# 🎯 Prueba Local Activa - TODAS LAS APPS CORRIENDO

## ✅ Estado Actual

Todas las aplicaciones están corriendo correctamente:

| Aplicación | Puerto | URL | Estado |
|------------|--------|-----|--------|
| **Landing Principal** | 3002 | http://localhost:3002 | ✅ Ready |
| **Documind** | 3000 | http://localhost:3000 | ✅ Ready |
| **Sentiment Analysis** | 3001 | http://localhost:3001 | ✅ Ready |

---

## 🧪 Guía de Prueba de Navegación

### **Prueba 1: Landing Principal**

1. Abre en tu navegador: **http://localhost:3002**

**Deberías ver:**
- ✅ Header rojo con logo Banorte
- ✅ Título "Selecciona una Aplicación"
- ✅ Selector de variantes (4 botones)
- ✅ 4 tarjetas de aplicaciones

**Prueba los 4 diseños:**
- Click en **[Tarjetas]** - Diseño vertical clásico
- Click en **[Horizontal]** - Diseño con icono a la izquierda
- Click en **[Minimalista]** - Diseño con bordes
- Click en **[Atrevido]** - Diseño con gradiente rojo

---

### **Prueba 2: Navegación a Sentiment Analysis**

1. Estando en http://localhost:3002
2. Busca la tarjeta **"Sentiment Analysis"** (📊)
3. Click en el botón **[Acceder]**

**Resultado esperado:**
- ✅ URL cambia a: `http://localhost:3001`
- ✅ Carga la landing individual de Sentiment Analysis
- ✅ Ves el header Banorte
- ✅ Ves opciones de login/promociones

**Para volver:**
- Click en el botón "Atrás" del navegador
- O escribe: http://localhost:3002

---

### **Prueba 3: Navegación a Documind**

1. Vuelve a http://localhost:3002
2. Busca la tarjeta **"DocuMind"** (📄)
3. Click en el botón **[Acceder]**

**Resultado esperado:**
- ✅ URL cambia a: `http://localhost:3000`
- ✅ Carga la landing individual de Documind
- ✅ Ves el header Banorte
- ✅ Ves chat de Maya y opciones

---

### **Prueba 4: Navegar dentro de las Apps**

**En Sentiment Analysis (localhost:3001):**
1. Desde la landing individual, busca el botón de acceso a la app
2. Click para ir al dashboard principal
3. Deberías llegar a: `http://localhost:3001/app`
4. Verás el dashboard con tabs de análisis

**En Documind (localhost:3000):**
1. Desde la landing individual, busca el botón de acceso
2. Click para ir a la funcionalidad principal
3. Deberías llegar a: `http://localhost:3000/analyze`
4. Verás la interfaz de análisis de documentos

---

### **Prueba 5: Flujo Completo de Usuario**

Simula un usuario real:

```
1. Usuario abre → http://localhost:3002 (Landing Principal)
   └─ Ve todas las opciones disponibles
   └─ Cambia entre variantes de diseño
   └─ Decide explorar "Sentiment Analysis"

2. Click en Sentiment → http://localhost:3001 (Landing Individual)
   └─ Ve información de la app
   └─ Ve promociones/beneficios
   └─ Decide acceder a la app

3. Click en "Analizar" → http://localhost:3001/app (App Principal)
   └─ Usa la funcionalidad de análisis
   └─ Sube documentos, ve resultados

4. Quiere explorar otra app → Vuelve a landing principal
   └─ Navegador atrás o escribe localhost:3002
   └─ Ahora prueba Documind

5. Click en Documind → http://localhost:3000 (Landing Individual)
   └─ Repite el proceso
```

---

## 🎨 Pruebas de Diseño

### Responsive Design

1. Abre http://localhost:3002
2. Presiona **F12** para abrir DevTools
3. Click en el **icono de dispositivo móvil** (o Ctrl+Shift+M)
4. Prueba diferentes tamaños:
   - Mobile: 375px (iPhone)
   - Tablet: 768px (iPad)
   - Desktop: 1440px (Laptop)

**Observa cómo cambia:**
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

### Hover Effects

1. Pasa el mouse sobre cada card
2. Observa las animaciones:
   - Cards se elevan ligeramente
   - Cambios de color
   - Transiciones suaves

### Diferentes Navegadores

Prueba en diferentes navegadores:
- Chrome
- Edge
- Firefox

---

## 🔍 Verificación de URLs

Usa la consola del navegador para verificar las variables:

1. Abre http://localhost:3002
2. Presiona **F12**
3. Ve a la pestaña **Console**
4. Escribe: `window.location.href`
5. Debería mostrar: `"http://localhost:3002/"`

Haz click en "Sentiment Analysis" y repite:
6. Debería mostrar: `"http://localhost:3001/"`

---

## 📊 Checklist de Pruebas

### Landing Principal (localhost:3002)
- [ ] Landing carga correctamente
- [ ] Header Banorte visible
- [ ] 4 variantes de diseño funcionan
- [ ] 4 tarjetas de apps visibles
- [ ] Responsive design funciona
- [ ] Hover effects funcionan

### Navegación a Sentiment
- [ ] Click en card funciona
- [ ] URL cambia a localhost:3001
- [ ] Landing individual carga
- [ ] Navegación dentro de app funciona
- [ ] Puede volver a landing principal

### Navegación a Documind
- [ ] Click en card funciona
- [ ] URL cambia a localhost:3000
- [ ] Landing individual carga
- [ ] Navegación dentro de app funciona
- [ ] Puede volver a landing principal

### Flujo Completo
- [ ] Usuario puede explorar todas las apps
- [ ] Navegación es intuitiva
- [ ] No hay errores en console
- [ ] Todas las transiciones son suaves

---

## 🐛 Troubleshooting

### Si una app no carga:

**Verifica que esté corriendo:**
```bash
# Ver procesos en puertos
netstat -ano | findstr :3002
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

Deberías ver procesos activos en cada puerto.

### Si hay errores en console:

1. Presiona F12
2. Ve a Console tab
3. Copia el error y revisa

### Si la navegación no funciona:

1. Verifica que `.env.local` exista en `apps/landing/`
2. Verifica que tenga las URLs correctas:
   ```
   NEXT_PUBLIC_DOCUMIND_URL=http://localhost:3000
   NEXT_PUBLIC_SENTIMENT_URL=http://localhost:3001
   ```

---

## 📸 Capturas Esperadas

### Landing Principal
```
┌─────────────────────────────────────────────┐
│  🔴 BANORTE              🔍  🔔  ☰          │
├─────────────────────────────────────────────┤
│  Selecciona una Aplicación                  │
│  Explora y prueba nuestras aplicaciones     │
│                                             │
│  [Tarjetas][Horizontal][Minimal][Atrevido] │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ DocuMind│ │Sentiment│ │Business │      │
│  │    📄   │ │    📊   │ │   📝    │      │
│  │[Acceder]│ │[Acceder]│ │[Acceder]│      │
│  └─────────┘ └─────────┘ └─────────┘      │
└─────────────────────────────────────────────┘
```

### Después de Click
```
URL: http://localhost:3001
┌─────────────────────────────────────────────┐
│  Sentiment Analysis - Landing Individual     │
├─────────────────────────────────────────────┤
│  - Header Banorte                           │
│  - Promociones                              │
│  - Login Form                               │
│  - Chat Maya                                │
│  - [Analizar Documentos] ← Click aquí      │
└─────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades a Destacar

### 1. Dos Niveles de Landing
- ✅ Landing Principal (puerto 3002) - Menú de apps
- ✅ Landing Individual (cada app) - Información específica

### 2. Navegación Fluida
- ✅ Full page navigation con `window.location.href`
- ✅ URLs cambian correctamente
- ✅ Historial del navegador funciona

### 3. Design System Banorte
- ✅ Colores oficiales (#EB0029, #5B6670)
- ✅ Tipografía Gotham
- ✅ Componentes consistentes

### 4. Variantes de Diseño
- ✅ 4 opciones para diferentes gustos
- ✅ Cambio instantáneo
- ✅ Todas responsive

---

## 🎯 Siguiente Paso

Una vez que hayas probado todo localmente y estés satisfecho:

1. Verifica que todo funciona como esperas
2. Toma nota de cualquier cambio que quieras hacer
3. Cuando estés listo, podemos proceder a:
   - Desplegar en Vercel
   - Configurar subdominios
   - Personalizar diseños
   - Agregar más apps

---

**Apps Corriendo:**
- ✅ Landing: http://localhost:3002
- ✅ Documind: http://localhost:3000
- ✅ Sentiment: http://localhost:3001

**Tiempo de inicio:**
- Landing: 2.8s
- Documind: 3.7s
- Sentiment: 3.2s

¡Disfruta probando la navegación! 🚀
