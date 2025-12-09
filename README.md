# Banorte Monorepo 🏦

Monorepo oficial de Banorte administrado con Turborepo, que contiene aplicaciones y paquetes compartidos para el ecosistema de productos digitales.

## 📦 Estructura del Proyecto

```
banorte-monorepo/
├── apps/
│   ├── landing/           # 🆕 Landing Principal - Portal de Aplicaciones
│   │   ├── src/
│   │   │   ├── app/       # Next.js App Router
│   │   │   └── components/
│   │   └── package.json
│   │
│   ├── documind/          # Aplicación de análisis de documentos
│   │   ├── src/
│   │   │   ├── app/       # Next.js App Router
│   │   │   ├── components/
│   │   │   ├── core/      # Clean Architecture - Domain
│   │   │   └── infrastructure/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── sentiment-analysis/ # Aplicación de análisis de sentimientos
│       ├── src/
│       │   ├── app/
│       │   └── components/
│       └── package.json
│
├── packages/
│   ├── landing-page/      # 🆕 Componentes compartidos del landing page
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── ChatBubble.tsx
│   │   │   │   ├── Promotion.tsx
│   │   │   │   ├── SecondaryNav.tsx
│   │   │   │   └── SocialIcons.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                # Sistema de diseño compartido
│   ├── eslint-config/     # Configuración ESLint compartida
│   └── typescript-config/ # Configuración TypeScript compartida
│
├── package.json           # Root package
├── pnpm-workspace.yaml    # pnpm workspaces config
└── turbo.json             # Turborepo configuration
```

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Package Manager**: pnpm 10.22.0
- **Build System**: Turborepo 2.6.1
- **Styling**: Tailwind CSS 3.4
- **TypeScript**: 5.4+
- **AI/ML**: OpenAI SDK, LangChain
- **Database**: Supabase
- **UI Libraries**: Material-UI, Lucide Icons

## 🚀 Desarrollo Local

### Instalación Inicial

\`\`\`bash
# Instalar dependencias
pnpm install
\`\`\`

### Variables de Entorno

Copia \`.env.local\` en la app documind y configura las variables necesarias:

\`\`\`bash
cd apps/documind
cp .env.local.example .env.local
\`\`\`

Variables requeridas:
- \`OPENAI_API_KEY\`: API key de OpenAI
- \`SUPABASE_URL\`: URL de Supabase
- \`SUPABASE_ANON_KEY\`: Anon key de Supabase
- \`NEXT_PUBLIC_APP_URL\`: URL de la aplicación

### Comandos de Desarrollo

\`\`\`bash
# Ejecutar todas las apps en modo desarrollo
pnpm dev

# Ejecutar solo documind
pnpm dev:documind

# Build de todas las apps
pnpm build

# Build solo de documind
pnpm build:documind

# Lint de todo el proyecto
pnpm lint

# Type checking de todo el proyecto
pnpm type-check

# Limpiar builds y cache
pnpm clean
\`\`\`

## 📱 Aplicaciones

### Documind
**Aplicación principal de análisis de documentos con IA**

- **Port**: 3000 (dev)
- **Descripción**: Análisis inteligente de documentos PDF usando RAG (Retrieval-Augmented Generation)
- **Características**:
  - Chat con asistente Maya
  - Análisis de PDFs con extracción de keywords
  - Búsqueda semántica en documentos
  - Landing page integrado

**Comandos específicos:**
\`\`\`bash
cd apps/documind
pnpm dev      # Desarrollo local
pnpm build    # Build para producción
pnpm start    # Ejecutar build de producción
\`\`\`

## 📦 Paquetes Compartidos

### @banorte/landing-page
Componentes React compartidos para landing pages de todas las aplicaciones.

**Componentes incluidos:**
- \`Header\` - Header principal de Banorte
- \`LoginForm\` - Formulario de login
- \`ChatBubble\` - Chat widget de Maya
- \`Promotion\` - Carrusel de promociones
- \`SecondaryNav\` - Navegación secundaria
- \`SocialIcons\` - Iconos de redes sociales

**Uso:**
\`\`\`typescript
import { Header, LoginForm, ChatBubble } from '@banorte/landing-page';

export default function Page() {
  return (
    <>
      <Header />
      <LoginForm />
      <ChatBubble />
    </>
  );
}
\`\`\`

### @banorte/ui
Sistema de diseño compartido con componentes base reutilizables.

### @banorte/eslint-config
Configuración ESLint compartida para mantener consistencia en el código.

### @banorte/typescript-config
Configuraciones TypeScript base para diferentes tipos de proyectos.

## 🎯 Agregar Nueva Aplicación

Para agregar una nueva app al monorepo:

\`\`\`bash
# 1. Crear directorio de la app
mkdir -p apps/nueva-app

# 2. Inicializar Next.js app
cd apps/nueva-app
pnpm dlx create-next-app@latest . --typescript --tailwind --app

# 3. Actualizar package.json para usar workspace packages
# Agregar a dependencies:
"@banorte/landing-page": "workspace:*"

# Agregar a devDependencies:
"@banorte/eslint-config": "workspace:*",
"@banorte/typescript-config": "workspace:*"

# 4. Instalar dependencias desde el root
cd ../..
pnpm install

# 5. Probar
pnpm dev
\`\`\`

## 🚀 Deploy en Vercel

### Deploy de Documind

1. **Conectar Repositorio en Vercel**
   - Importar el repositorio Git
   - Vercel detectará automáticamente el monorepo

2. **Configurar Proyecto en Vercel**
   \`\`\`
   Framework Preset: Next.js
   Root Directory: apps/documind
   Build Command: turbo run build --filter=documind
   Output Directory: .next
   Install Command: pnpm install
   Node.js Version: 18.x
   \`\`\`

3. **Variables de Entorno en Vercel**
   - \`OPENAI_API_KEY\`
   - \`SUPABASE_URL\`
   - \`SUPABASE_ANON_KEY\`
   - \`NEXT_PUBLIC_APP_URL\`

4. **Deploy**
   - Vercel automáticamente genera preview deployments para cada PR
   - Solo las apps afectadas se rebuildan (gracias a Turborepo)

### Build Skipping Automático

Vercel automáticamente detecta qué apps cambiaron y solo rebuilda las necesarias. Si haces cambios solo en \`documind\`, las otras apps no se rebuildarán.

## 🎛️ Configuración de Turborepo

El archivo \`turbo.json\` define las pipelines de build:

\`\`\`json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  },
  "globalEnv": [
    "OPENAI_API_KEY",
    "SUPABASE_URL"
  ]
}
\`\`\`

### Comandos Útiles de Turborepo

\`\`\`bash
# Build solo lo que cambió desde main
turbo run build --filter=...[origin/main]

# Ver qué se va a cachear
turbo run build --dry-run=json

# Limpiar cache de Turborepo
rm -rf .turbo

# Ver telemetría
turbo telemetry
\`\`\`

## 🔧 Troubleshooting

### Error: workspace package not found
\`\`\`bash
# Solución: Reinstalar dependencias
rm -rf node_modules
pnpm install
\`\`\`

### Error: Type errors en documind
Los errores de tipo en la app documind son conocidos y relacionados con incompatibilidades de versión en AI SDK. No afectan la funcionalidad del monorepo.

### Peer dependency warnings
Los warnings sobre peer dependencies de React (v18 vs v19) son esperados y no críticos.

## 📚 Recursos

### Turborepo
- [Tasks](https://turbo.build/repo/docs/core-concepts/caching/task-caching)
- [Workspaces](https://turbo.build/repo/docs/core-concepts/caching/workspace-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/filtering)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### Vercel
- [Monorepos en Vercel](https://vercel.com/docs/monorepos)
- [Turborepo con Vercel](https://vercel.com/docs/monorepos/turborepo)

## 🤝 Contribuir

1. Crear branch: \`git checkout -b feature/nueva-funcionalidad\`
2. Hacer cambios y commits: \`git commit -m "feat: nueva funcionalidad"\`
3. Push: \`git push origin feature/nueva-funcionalidad\`
4. Crear Pull Request

## 📄 Licencia

Propietario - Banorte © 2024
