# Landing Page - Portal de Aplicaciones Banorte

Landing page principal que funciona como menú/directorio para acceder a las diferentes aplicaciones del ecosistema Banorte.

## Características

- **4 variantes de diseño**: Tarjetas, Horizontal, Minimalista y Atrevido
- **Responsive**: Optimizado para desktop, tablet y móvil
- **Banorte Design System**: Colores, tipografías y componentes siguiendo las guías de diseño
- **Fácil configuración**: URLs de apps configurables por variables de entorno

## Estructura del Proyecto

```
apps/landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principal de Next.js
│   │   ├── page.tsx             # Página principal
│   │   └── globals.css          # Estilos globales y Tailwind
│   └── components/
│       ├── Header.tsx           # Header con logo Banorte
│       ├── AppCard.tsx          # Tarjeta estilo cards
│       ├── AppCardHorizontal.tsx # Tarjeta estilo horizontal
│       ├── AppCardMinimal.tsx   # Tarjeta estilo minimal
│       ├── AppCardBold.tsx      # Tarjeta estilo bold
│       └── AppGrid.tsx          # Grid de aplicaciones
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Desarrollo Local

### Instalación

Desde la raíz del monorepo:

```bash
# Instalar dependencias
pnpm install

# Ejecutar landing en desarrollo (puerto 3002)
pnpm dev:landing
```

La landing estará disponible en `http://localhost:3002`

### Configuración de URLs

1. Copia `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` con las URLs de tus aplicaciones desplegadas:
   ```env
   NEXT_PUBLIC_DOCUMIND_URL=https://documind.vercel.app
   NEXT_PUBLIC_SENTIMENT_URL=https://sentiment-analysis.vercel.app
   # ... etc
   ```

## Despliegue en Vercel

### Opción 1: Landing como Dominio Principal (Recomendado)

Esta configuración hace que la landing sea el punto de entrada principal.

#### Configuración en Vercel

1. **Crear nuevo proyecto en Vercel**:
   - Conecta tu repositorio de GitHub
   - Nombre del proyecto: `banorte-landing` (o el que prefieras)

2. **Settings del proyecto**:
   ```
   Framework Preset: Next.js
   Root Directory: apps/landing
   Build Command: cd ../.. && turbo run build --filter=landing
   Output Directory: (dejar vacío, usa default de Next.js)
   Install Command: pnpm install
   Node.js Version: 18.x
   ```

3. **Variables de entorno** (en Vercel Dashboard):
   ```
   NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
   NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
   NEXT_PUBLIC_BUSINESS_RULES_URL=https://rules.banorte.com
   NEXT_PUBLIC_MENTORIA_URL=https://mentoria.banorte.com
   ```

4. **Dominio personalizado**:
   - Settings → Domains
   - Agregar: `banorte.com` o `apps.banorte.com`

### Opción 2: Todas las Apps en un Mismo Proyecto

Si prefieres un deployment único con todas las apps:

1. **Configurar rewrites en `next.config.js`**:
   ```javascript
   async rewrites() {
     return [
       {
         source: '/documind/:path*',
         destination: 'https://documind-internal.vercel.app/:path*',
       },
       {
         source: '/sentiment-analysis/:path*',
         destination: 'https://sentiment-internal.vercel.app/:path*',
       },
     ];
   }
   ```

2. **Variables de entorno**:
   ```
   NEXT_PUBLIC_DOCUMIND_URL=/documind
   NEXT_PUBLIC_SENTIMENT_URL=/sentiment-analysis
   ```

### Opción 3: Subdominios Separados

Cada app tiene su propio subdominio:

1. **Desplegar cada app por separado** en Vercel
2. **Configurar DNS**:
   ```
   banorte.com → Landing (este proyecto)
   documind.banorte.com → App Documind
   sentiment.banorte.com → App Sentiment Analysis
   ```

3. **Variables de entorno en Landing**:
   ```
   NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
   NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
   ```

## Agregar Nuevas Aplicaciones

Para agregar una nueva app al menú:

1. Edita `src/components/AppGrid.tsx`
2. Agrega un nuevo objeto en el array `apps`:

```typescript
{
  icon: <YourIcon size={60} color="#EB0029" />,
  title: 'Nueva App',
  description: 'Descripción de la aplicación',
  route: process.env.NEXT_PUBLIC_NUEVA_APP_URL || '/nueva-app',
}
```

3. Agrega la variable de entorno correspondiente en `.env.local` y Vercel

## Scripts Disponibles

Desde la raíz del monorepo:

```bash
# Desarrollo
pnpm dev:landing           # Ejecutar en desarrollo (puerto 3002)

# Build
pnpm build:landing         # Construir para producción

# Otras utilidades
pnpm type-check            # Validar tipos de TypeScript
pnpm lint                  # Ejecutar ESLint
```

## Tecnologías Utilizadas

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **Lucide React**: Iconos
- **Turbo**: Build system del monorepo

## Personalización

### Colores

Los colores de Banorte están definidos en `src/app/globals.css`:

```css
--rojo-banorte: #EB0029;
--rojo-hover: #E30028;
--gris-banorte: #5B6670;
--gris-oscuro: #323E48;
--blanco: #FFFFFF;
--fondo: #EBF0F2;
--fondo-2: #F4F7F8;
```

### Tipografías

- **Principal**: Gotham (cargada desde CDN)
- **Secundaria**: Roboto (Google Fonts)

### Agregar/Quitar Variantes de Diseño

Edita `src/app/page.tsx` para modificar el array `variants` y agregar o quitar opciones de diseño.

## Troubleshooting

### Error: Cannot find module 'lucide-react'

```bash
cd apps/landing
pnpm install
```

### Build falla en Vercel

Verifica que:
1. El comando de build incluya `cd ../.. && turbo run build --filter=landing`
2. El comando de instalación sea `pnpm install`
3. La versión de Node.js sea >= 18.0.0

### Las URLs no funcionan

Asegúrate de que las variables de entorno `NEXT_PUBLIC_*` estén configuradas en Vercel Dashboard.

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo.
