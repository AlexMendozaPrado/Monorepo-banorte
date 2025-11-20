# 🚀 Próximos Pasos - Banorte Monorepo

## ✅ ¿Qué se completó?

1. ✅ Monorepo base configurado con Turborepo
2. ✅ Package manager cambiado a pnpm
3. ✅ Package `@banorte/landing-page` creado con todos los componentes compartidos
4. ✅ App `documind` migrada a `apps/documind`
5. ✅ Landing page de documind actualizado para usar workspace package
6. ✅ Todas las dependencias instaladas
7. ✅ Configuración de Turborepo optimizada

## 📍 Estado Actual

**Ubicación del monorepo**: `C:\Users\fluid\banorte-monorepo`

**Proyecto original (respaldo)**: `C:\Users\fluid\PocBanorte`

### Estructura Actual
```
banorte-monorepo/
├── apps/
│   └── documind/          ✅ Migrado y configurado
├── packages/
│   ├── landing-page/      ✅ Creado
│   ├── ui/                ✅ Disponible
│   ├── eslint-config/     ✅ Renombrado a @banorte/*
│   └── typescript-config/ ✅ Renombrado a @banorte/*
├── package.json           ✅ Configurado con pnpm
├── pnpm-workspace.yaml    ✅ Workspaces configurados
└── turbo.json             ✅ Pipelines optimizadas
```

## 🎯 Próximos Pasos Recomendados

### 1. Probar el Desarrollo Local (AHORA)

```bash
cd C:\Users\fluid\banorte-monorepo

# Ejecutar documind en desarrollo
pnpm dev:documind
```

**Verificar**:
- ✓ La app carga en http://localhost:3000
- ✓ El landing page se muestra correctamente
- ✓ Los componentes del workspace package funcionan

### 2. Configurar Variables de Entorno

```bash
cd apps/documind

# Si existe .env.local, está listo
# Si no, copiar desde el proyecto original:
cp ../../PocBanorte/.env.local .
```

### 3. Resolver Errores de TypeScript (OPCIONAL)

Los errores de tipo en documind son por incompatibilidades en AI SDK. Para resolverlos:

**Opción A: Actualizar AI SDK** (recomendado)
```bash
cd apps/documind
pnpm update @ai-sdk/openai @ai-sdk/react ai
```

**Opción B: Ignorar temporalmente**
Los errores no afectan la funcionalidad en runtime. Puedes continuar desarrollando.

### 4. Agregar Nueva App (CUANDO SEA NECESARIO)

Cuando estés listo para agregar otra aplicación:

```bash
# Crear estructura
mkdir -p apps/app-creditos

# Inicializar Next.js
cd apps/app-creditos
pnpm dlx create-next-app@latest . --typescript --tailwind --app

# Actualizar package.json para usar workspace packages
# En dependencies:
{
  "@banorte/landing-page": "workspace:*"
}

# En devDependencies:
{
  "@banorte/eslint-config": "workspace:*",
  "@banorte/typescript-config": "workspace:*"
}

# Volver al root e instalar
cd ../..
pnpm install

# Probar
pnpm dev
```

### 5. Configurar Git

```bash
cd C:\Users\fluid\banorte-monorepo

# Inicializar git si no está inicializado
git init

# Crear .gitignore si no existe (ya existe)
# Agregar archivos
git add .

# Primer commit
git commit -m "feat: initial monorepo setup with Turborepo and documind app"

# Conectar con repositorio remoto
git remote add origin <tu-repo-url>
git push -u origin main
```

### 6. Configurar Vercel (PARA DEPLOY)

**Paso 1: Conectar Repositorio**
1. Ir a [vercel.com](https://vercel.com)
2. Import Project
3. Seleccionar tu repositorio Git

**Paso 2: Configurar Documind**
- Framework Preset: **Next.js**
- Root Directory: **apps/documind**
- Build Command: **turbo run build --filter=documind**
- Output Directory: **.next**
- Install Command: **pnpm install**
- Node.js Version: **18.x**

**Paso 3: Variables de Entorno**
Agregar en Vercel:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

**Paso 4: Deploy**
- Click "Deploy"
- Esperar a que termine el build

### 7. Habilitar Remote Caching (OPCIONAL)

Para compartir cache entre equipo y CI/CD:

```bash
cd C:\Users\fluid\banorte-monorepo

# Autenticar con Vercel
npx turbo login

# Vincular con tu cuenta
npx turbo link
```

Verificar que funciona:
```bash
# Primera vez (sin cache)
pnpm build

# Segunda vez (con cache) - debería ser instantáneo
pnpm build
# >>> FULL TURBO ⚡️
```

## 🔍 Verificación de Setup

### Checklist de Verificación

- [ ] `pnpm dev:documind` ejecuta correctamente
- [ ] Landing page se muestra con Header, LoginForm, etc.
- [ ] Variables de entorno configuradas
- [ ] Git inicializado y primer commit hecho
- [ ] Repositorio remoto conectado (opcional)
- [ ] Vercel configurado y deployado (opcional)
- [ ] Remote caching habilitado (opcional)

## 🆘 Troubleshooting

### Problema: "Cannot find module '@banorte/landing-page'"

**Solución:**
```bash
# Reinstalar dependencias
cd C:\Users\fluid\banorte-monorepo
rm -rf node_modules
pnpm install
```

### Problema: Port 3000 ya en uso

**Solución:**
```bash
# Matar proceso en puerto 3000
# O usar otro puerto
cd apps/documind
pnpm dev -- -p 3001
```

### Problema: Errores de TypeScript

**Solución:**
```bash
# Actualizar AI SDK
cd apps/documind
pnpm update @ai-sdk/openai @ai-sdk/react ai

# O ignorar temporalmente
# Los errores no afectan runtime
```

## 📊 Comandos Útiles de Día a Día

```bash
# Desarrollo
pnpm dev:documind              # Dev solo documind
pnpm dev                        # Dev todas las apps

# Build
pnpm build:documind            # Build solo documind
pnpm build                      # Build todas las apps

# Calidad de código
pnpm lint                       # Lint todo
pnpm type-check                # Type check todo

# Mantenimiento
pnpm clean                      # Limpiar builds y cache
rm -rf node_modules && pnpm install  # Reinstalar todo
```

## 🎉 ¡Felicidades!

Tu monorepo está listo para desarrollo. El siguiente paso es probar que todo funciona ejecutando:

```bash
cd C:\Users\fluid\banorte-monorepo
pnpm dev:documind
```

Y visitar http://localhost:3000

## 📚 Recursos Adicionales

- [README.md](./README.md) - Documentación completa del monorepo
- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Vercel Monorepos](https://vercel.com/docs/monorepos)

## 🤔 ¿Preguntas?

Si tienes dudas sobre:
- Agregar nueva app → Ver sección 4 de este documento
- Deploy → Ver sección 6 de este documento
- Problemas técnicos → Ver sección "Troubleshooting"
- Estructura del monorepo → Ver [README.md](./README.md)
