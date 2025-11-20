# Guía de Solución de Problemas

## 🚨 Problemas Comunes y Soluciones

### 1. Error de Instalación de Dependencias

**Problema**: `yarn install` o `npm install` falla
```bash
# Solución 1: Limpiar caché
yarn cache clean
# o
npm cache clean --force

# Solución 2: Eliminar node_modules y reinstalar
rm -rf node_modules yarn.lock package-lock.json
yarn install
# o
npm install
```

### 2. Error de API Key de OpenAI

**Problema**: `OPENAI_API_KEY environment variable is required`
```bash
# Solución: Verificar archivo .env.local
cp .env.local.example .env.local
# Editar .env.local y agregar tu API key válida
OPENAI_API_KEY=sk-tu-api-key-real-aqui
```

### 3. Error al Cargar PDF

**Problema**: PDF no se visualiza o da error
```bash
# Verificar:
1. El archivo es realmente un PDF
2. El tamaño es menor a 20MB
3. El PDF contiene texto extraíble (no es solo imagen)
```

### 4. Error de TypeScript

**Problema**: Errores de tipos en componentes MUI
```bash
# Solución: Reinstalar tipos de MUI
yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material
# o
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### 5. Error de PDF Worker

**Problema**: `Setting up fake worker failed`
```javascript
// Verificar en PdfPane.tsx que esté configurado:
pdfjs.GlobalWorkerOptions.workerSrc = "//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js";
```

### 6. Error de CORS en Desarrollo

**Problema**: Errores de CORS al llamar API
```javascript
// Verificar que la API route esté en:
// src/app/api/analyze/route.ts
// Y que tenga: export const runtime = "nodejs";
```

### 7. Error de Canvas en react-pdf

**Problema**: Errores relacionados con canvas
```javascript
// En next.config.js debe estar:
webpack: (config) => {
  config.resolve.alias.canvas = false;
  return config;
}
```

### 8. Palabras Clave Vacías

**Problema**: OpenAI no devuelve keywords
```bash
# Verificar:
1. API key válida y con créditos
2. El PDF contiene texto extraíble
3. Conexión a internet estable
4. Modelo OpenAI disponible (gpt-4o-mini)
```

### 9. Error de Memoria en Desarrollo

**Problema**: `JavaScript heap out of memory`
```bash
# Solución: Aumentar memoria de Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
yarn dev
# o
set NODE_OPTIONS=--max-old-space-size=4096 && npm run dev
```

### 10. Error de Puertos

**Problema**: Puerto 3000 ya en uso
```bash
# Solución: Usar otro puerto
yarn dev -p 3001
# o
npm run dev -- -p 3001
```

## 🔧 Comandos de Diagnóstico

### Verificar Instalación
```bash
# Verificar versiones
node --version
yarn --version  # o npm --version
next --version

# Verificar dependencias
yarn list react react-dom next
# o
npm list react react-dom next
```

### Verificar Configuración
```bash
# Verificar variables de entorno
cat .env.local

# Verificar configuración de Next.js
cat next.config.js

# Verificar TypeScript
npx tsc --noEmit
```

### Limpiar Proyecto
```bash
# Limpiar completamente
rm -rf .next node_modules yarn.lock package-lock.json
yarn install
yarn dev
```

## 📞 Contacto de Soporte

Si los problemas persisten:
1. Verificar que todas las dependencias estén instaladas
2. Revisar los logs de la consola del navegador
3. Verificar los logs del servidor en la terminal
4. Comprobar que la API key de OpenAI sea válida

## 🔍 Logs Útiles

### Logs del Cliente (Navegador)
- Abrir DevTools (F12)
- Ir a Console
- Buscar errores en rojo

### Logs del Servidor (Terminal)
- Revisar la terminal donde corre `yarn dev`
- Buscar errores de API o compilación

### Logs de Red
- En DevTools → Network
- Verificar llamadas a `/api/analyze`
- Revisar códigos de respuesta HTTP
