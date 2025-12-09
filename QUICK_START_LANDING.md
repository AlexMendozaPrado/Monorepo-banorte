# Quick Start - Landing Principal

Guía rápida para empezar a trabajar con la landing principal del monorepo.

## 🎯 ¿Qué es la Landing Principal?

La landing principal (`apps/landing`) es el **punto de entrada** para todas las aplicaciones del ecosistema Banorte. Funciona como un menú/directorio visual donde los usuarios pueden:

- Ver todas las aplicaciones disponibles
- Elegir entre 4 variantes de diseño
- Acceder directamente a cada aplicación

## 🚀 Desarrollo Local

### 1. Instalar dependencias

Desde la raíz del monorepo:

```bash
pnpm install
```

### 2. Ejecutar la landing

```bash
# Opción 1: Solo la landing
pnpm dev:landing

# Opción 2: Todas las apps (incluyendo landing)
pnpm dev
```

La landing estará disponible en: **http://localhost:3002**

### 3. Configurar URLs de las apps (opcional)

Si quieres que la landing apunte a URLs específicas:

```bash
cd apps/landing
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_DOCUMIND_URL=https://tu-documind.vercel.app
NEXT_PUBLIC_SENTIMENT_URL=https://tu-sentiment.vercel.app
```

## 📱 Estructura de la Landing

```
apps/landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout de Next.js
│   │   ├── page.tsx            # Página principal
│   │   └── globals.css         # Estilos globales
│   └── components/
│       ├── Header.tsx          # Header con logo Banorte
│       ├── AppGrid.tsx         # Grid de aplicaciones
│       ├── AppCard.tsx         # Diseño: Tarjetas
│       ├── AppCardHorizontal.tsx  # Diseño: Horizontal
│       ├── AppCardMinimal.tsx     # Diseño: Minimalista
│       └── AppCardBold.tsx        # Diseño: Atrevido
```

## ✏️ Agregar una Nueva Aplicación

Edita `apps/landing/src/components/AppGrid.tsx`:

```typescript
const apps = [
  // ... apps existentes
  {
    icon: <TuIcon size={60} color="#EB0029" />,
    title: 'Tu Nueva App',
    description: 'Descripción de tu app',
    route: process.env.NEXT_PUBLIC_TU_APP_URL || '/tu-app',
  },
]
```

Agrega la variable de entorno en `.env.local`:

```env
NEXT_PUBLIC_TU_APP_URL=https://tu-app.vercel.app
```

## 🎨 Variantes de Diseño

La landing incluye 4 variantes visuales:

1. **Tarjetas**: Diseño clásico con cards centradas
2. **Horizontal**: Layout horizontal con iconos a la izquierda
3. **Minimalista**: Diseño limpio con bordes sutiles
4. **Atrevido**: Cards con gradiente rojo de Banorte

Los usuarios pueden cambiar entre variantes usando los botones en la parte superior.

## 🌐 Arquitectura con Apps Individuales

### Flujo de Navegación

```
Usuario accede a banorte.com
    ↓
Landing Principal (apps/landing)
    ↓
Selecciona "Documind"
    ↓
Redirige a documind.banorte.com
    ↓
Landing Individual de Documind (en /)
    ↓
Usuario hace clic en "Analizar"
    ↓
App Documind (/analyze)
```

### Dos Niveles de Landing

1. **Landing Principal** (`apps/landing`):
   - Menú de todas las aplicaciones
   - Solo lectura/navegación
   - Punto de entrada único

2. **Landing Individual** (cada app en su ruta `/`):
   - Usa componentes de `@banorte/landing-page`
   - Promociones específicas de la app
   - Formulario de login
   - Chat de Maya

Ambas landings **coexisten y se preservan**.

## 🚀 Despliegue Rápido en Vercel

### 1. Crear Proyecto

En Vercel Dashboard:
- New Project → Import Git Repository
- Selecciona tu monorepo

### 2. Configurar

```
Project Name: banorte-landing
Framework: Next.js
Root Directory: apps/landing
Build Command: cd ../.. && turbo run build --filter=landing
Install Command: pnpm install
Node Version: 18.x
```

### 3. Variables de Entorno

Agregar en Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
```

### 4. Deploy

Click en "Deploy" y espera unos minutos.

### 5. Dominio Personalizado (opcional)

Settings → Domains → Add `banorte.com`

## 📋 Checklist Pre-Deploy

- [ ] `pnpm build:landing` funciona sin errores
- [ ] `pnpm type-check` pasa en la landing
- [ ] Variables de entorno configuradas en `.env.local.example`
- [ ] Apps individuales ya están desplegadas
- [ ] URLs de apps actualizadas en `AppGrid.tsx`

## 🔗 Enlaces Útiles

- **Guía Completa de Despliegue**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **README Principal**: [README.md](./README.md)
- **Documentación Landing**: [apps/landing/README.md](./apps/landing/README.md)

## 💡 Tips

- **Puerto ocupado?** La landing usa puerto 3002, pero puedes cambiarlo en `package.json`
- **Errores de build?** Asegúrate de instalar desde la raíz: `pnpm install`
- **Hot reload lento?** Turbo cachea builds, usa `pnpm clean` para resetear

## ❓ FAQ

**P: ¿Debo eliminar las landings individuales de cada app?**
R: NO. Cada app mantiene su landing individual en la ruta `/`. La landing principal es un directorio adicional.

**P: ¿Puedo cambiar los colores de la landing?**
R: Sí, edita `apps/landing/src/app/globals.css` donde están las variables CSS de Banorte.

**P: ¿Cómo agrego iconos personalizados?**
R: La landing usa Lucide React. Importa iconos desde `lucide-react`.

**P: ¿Funciona con otras apps además de documind y sentiment?**
R: Sí, solo agrega la nueva app en `AppGrid.tsx` con su URL.

---

**¿Problemas?** Revisa [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) o contacta al equipo de desarrollo.
