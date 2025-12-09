# 🎉 Landing Principal - Resumen de Implementación

## ✅ Implementación Completada

Se ha creado exitosamente la **Landing Principal** (`apps/landing`) como punto de acceso central para todas las aplicaciones del ecosistema Banorte.

---

## 📦 Estructura Creada

```
banorte-monorepo/
├── apps/
│   └── landing/                          # ✨ NUEVO
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx           # Layout de Next.js
│       │   │   ├── page.tsx             # Página principal
│       │   │   └── globals.css          # Estilos + Banorte Design System
│       │   └── components/
│       │       ├── Header.tsx           # Header con logo Banorte
│       │       ├── AppGrid.tsx          # Grid de aplicaciones
│       │       ├── AppCard.tsx          # Variante: Tarjetas
│       │       ├── AppCardHorizontal.tsx # Variante: Horizontal
│       │       ├── AppCardMinimal.tsx    # Variante: Minimalista
│       │       └── AppCardBold.tsx       # Variante: Atrevido
│       ├── package.json                 # Dependencias
│       ├── tsconfig.json                # TypeScript config
│       ├── next.config.js               # Next.js config
│       ├── tailwind.config.js           # Tailwind config
│       ├── postcss.config.js            # PostCSS config
│       ├── .env.local                   # Variables de entorno (local)
│       ├── .env.local.example           # Template de variables
│       ├── .gitignore                   # Git ignore
│       ├── .eslintrc.js                 # ESLint config
│       ├── verify-setup.js              # Script de verificación
│       └── README.md                    # Documentación
│
├── DEPLOYMENT_GUIDE.md                   # ✨ NUEVO - Guía completa de deploy
├── QUICK_START_LANDING.md               # ✨ NUEVO - Quick start guide
└── package.json                         # ✨ ACTUALIZADO - Agregados scripts landing
```

---

## 🎯 Arquitectura Implementada

### Flujo de Usuario

```
1. Usuario accede → banorte.com (Landing Principal)
                     ├── Visualiza 4 apps disponibles
                     └── Elige variante de diseño

2. Click en "Documind" → documind.banorte.com
                          ├── Landing Individual (/)
                          └── App (/analyze)

3. Click en "Sentiment Analysis" → sentiment.banorte.com
                                     ├── Landing Individual (/)
                                     └── App (/app)
```

### Dos Niveles de Landing

✅ **Landing Principal** (`apps/landing`)
- Punto de entrada único
- Menú visual de aplicaciones
- 4 variantes de diseño
- Redirige a cada app

✅ **Landing Individual** (cada app en `/`)
- Usa componentes de `@banorte/landing-page`
- Promociones específicas de la app
- Login form
- Chat de Maya
- **SE PRESERVA** tal cual está ahora

---

## 🚀 Cómo Usar

### Desarrollo Local

```bash
# Desde la raíz del monorepo

# 1. Instalar dependencias (ya hecho)
pnpm install

# 2. Ejecutar solo la landing
pnpm dev:landing

# O ejecutar todas las apps
pnpm dev
```

**URLs locales:**
- Landing Principal: http://localhost:3002
- Documind: http://localhost:3000
- Sentiment Analysis: http://localhost:3001

### Build para Producción

```bash
# Build solo landing
pnpm build:landing

# Build todas las apps
pnpm build
```

---

## 🌐 Despliegue en Vercel

### Estrategia Recomendada: Subdominios

```
banorte.com              → apps/landing
documind.banorte.com     → apps/documind
sentiment.banorte.com    → apps/sentiment-analysis
```

### Quick Deploy

**1. Landing Principal**

Crear proyecto en Vercel:
```
Framework: Next.js
Root Directory: apps/landing
Build Command: cd ../.. && turbo run build --filter=landing
Install Command: pnpm install
Node Version: 18.x
```

Variables de entorno:
```
NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
```

**2. Cada App Individual**

Repetir proceso similar, cambiando:
- Root Directory: `apps/[app-name]`
- Build Command: `cd ../.. && turbo run build --filter=[app-name]`

### 📖 Guía Completa

Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para:
- 3 estrategias de despliegue
- Configuración de DNS
- Troubleshooting
- CI/CD workflows

---

## ✏️ Personalización

### Agregar Nueva Aplicación

Edita `apps/landing/src/components/AppGrid.tsx`:

```typescript
const apps = [
  // Apps existentes...
  {
    icon: <TuIcon size={60} color="#EB0029" />,
    title: 'Tu Nueva App',
    description: 'Descripción de tu aplicación',
    route: process.env.NEXT_PUBLIC_TU_APP_URL || '/tu-app',
  },
]
```

Agrega variable de entorno:
```bash
# .env.local
NEXT_PUBLIC_TU_APP_URL=https://tu-app.banorte.com
```

### Cambiar Colores

Edita `apps/landing/src/app/globals.css`:

```css
:root {
  --rojo-banorte: #EB0029;
  --gris-banorte: #5B6670;
  /* ... más variables */
}
```

### Modificar Diseños

Cada variante tiene su propio componente:
- `AppCard.tsx` - Tarjetas
- `AppCardHorizontal.tsx` - Horizontal
- `AppCardMinimal.tsx` - Minimalista
- `AppCardBold.tsx` - Atrevido

---

## 📋 Verificación del Setup

```bash
cd apps/landing
node verify-setup.js
```

Debe mostrar:
```
✓ Todo configurado correctamente!

Siguiente paso:
  Desde la raíz del monorepo, ejecuta: pnpm dev:landing
  La landing estará disponible en: http://localhost:3002
```

---

## 🎨 Características Implementadas

### ✅ 4 Variantes de Diseño

1. **Tarjetas** - Diseño clásico con cards elevadas
2. **Horizontal** - Layout con iconos a la izquierda
3. **Minimalista** - Diseño limpio con bordes sutiles
4. **Atrevido** - Cards con gradiente rojo Banorte

Los usuarios pueden cambiar entre variantes usando los botones superiores.

### ✅ Responsive Design

- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

### ✅ Banorte Design System

- Colores oficiales
- Tipografía Gotham + Roboto
- Animaciones suaves
- Hover effects

### ✅ Performance

- Next.js 14 con App Router
- Static generation donde sea posible
- Optimización de imágenes
- Code splitting automático

---

## 🔗 Navegación Entre Apps

### Variables de Entorno

La landing usa variables `NEXT_PUBLIC_*` para las URLs:

**Desarrollo Local:**
```env
NEXT_PUBLIC_DOCUMIND_URL=http://localhost:3000
NEXT_PUBLIC_SENTIMENT_URL=http://localhost:3001
```

**Producción (Vercel):**
```env
NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
```

### Fallbacks

Si las variables no están configuradas, usa paths relativos:
```typescript
route: process.env.NEXT_PUBLIC_DOCUMIND_URL || '/documind'
```

---

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Guía completa de despliegue en Vercel |
| [QUICK_START_LANDING.md](./QUICK_START_LANDING.md) | Quick start para desarrolladores |
| [apps/landing/README.md](./apps/landing/README.md) | Documentación técnica de la landing |
| [README.md](./README.md) | README principal del monorepo |

---

## 🐛 Troubleshooting

### Error: Cannot find module 'lucide-react'

```bash
cd apps/landing
pnpm install
```

### Puerto 3002 ocupado

Edita `apps/landing/package.json`:
```json
"dev": "next dev --port 3005"  // Cambiar a otro puerto
```

### Build falla en Vercel

Verifica:
1. Build Command: `cd ../.. && turbo run build --filter=landing`
2. Install Command: `pnpm install`
3. Node Version: 18.x

### URLs no funcionan

Asegúrate de:
1. Variables `NEXT_PUBLIC_*` configuradas en Vercel
2. Apps individuales ya desplegadas
3. Re-deploy después de agregar variables

---

## ✨ Próximos Pasos

### Para Desarrollo

1. [ ] Ejecutar `pnpm dev:landing` y probar localmente
2. [ ] Agregar las apps que faltan al `AppGrid`
3. [ ] Personalizar colores/estilos si es necesario

### Para Producción

1. [ ] Desplegar apps individuales primero
2. [ ] Obtener URLs de producción
3. [ ] Configurar variables en Landing
4. [ ] Desplegar Landing Principal
5. [ ] Configurar DNS para subdominios

---

## 🎯 Beneficios de esta Arquitectura

✅ **Escalabilidad**: Fácil agregar nuevas apps
✅ **Mantenibilidad**: Código separado por app
✅ **Flexibilidad**: Cada app puede evolucionar independientemente
✅ **UX**: Punto de entrada único y claro
✅ **Performance**: Apps solo se cargan cuando se acceden
✅ **SEO**: Cada app tiene su propio dominio/subdominio

---

## 💡 Consejos

1. **Desarrollo**: Mantén las apps corriendo en puertos diferentes
2. **Deploy**: Despliega apps individuales antes que la landing
3. **URLs**: Usa subdominios en producción para mejor organización
4. **Variables**: Siempre configura `.env.local` para desarrollo
5. **Testing**: Prueba todas las variantes de diseño antes de deploy

---

## 📞 Soporte

¿Problemas o preguntas?

1. Revisa [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Revisa [QUICK_START_LANDING.md](./QUICK_START_LANDING.md)
3. Ejecuta `node apps/landing/verify-setup.js`
4. Contacta al equipo de desarrollo

---

## 🎉 ¡Todo Listo!

La landing principal está completamente implementada y lista para usar.

**Comando para empezar:**
```bash
pnpm dev:landing
```

**URL local:**
http://localhost:3002

---

**Creado**: 2025-12-08
**Versión**: 1.0.0
**Next.js**: 14.2.0
**Turborepo**: 2.6.1
