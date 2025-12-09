# Guía de Despliegue - Banorte Monorepo

Esta guía detalla cómo desplegar el ecosistema completo de aplicaciones Banorte en Vercel.

## Arquitectura del Monorepo

```
banorte-monorepo/
├── apps/
│   ├── landing/              # 🏠 Landing Principal (Menú de Apps)
│   ├── documind/             # 📄 App: Análisis de Documentos
│   ├── sentiment-analysis/   # 📊 App: Análisis de Sentimientos
│   └── [future apps]/        # Aplicaciones futuras
└── packages/
    ├── landing-page/         # Componentes compartidos (landing individual)
    └── ui/                   # Design System
```

## Estrategias de Despliegue

### Estrategia 1: Landing Principal + Apps con Subdominios (RECOMENDADO)

Esta es la estrategia más limpia y escalable.

#### Arquitectura:
```
banorte.com                    → apps/landing (Menú principal)
documind.banorte.com           → apps/documind
sentiment.banorte.com          → apps/sentiment-analysis
[nueva-app].banorte.com        → apps/[nueva-app]
```

#### Ventajas:
✅ Separación clara entre apps
✅ Cada app puede escalarse independientemente
✅ Fácil agregar nuevas aplicaciones
✅ URLs limpias y fáciles de recordar
✅ Cada app mantiene su landing individual

#### Pasos:

**1. Desplegar Landing Principal (apps/landing)**

En Vercel Dashboard:
```
Project Name: banorte-landing
Framework: Next.js
Root Directory: apps/landing
Build Command: cd ../.. && turbo run build --filter=landing
Install Command: pnpm install
Node Version: 18.x
```

Variables de entorno:
```env
NEXT_PUBLIC_DOCUMIND_URL=https://documind.banorte.com
NEXT_PUBLIC_SENTIMENT_URL=https://sentiment.banorte.com
NEXT_PUBLIC_BUSINESS_RULES_URL=https://rules.banorte.com
NEXT_PUBLIC_MENTORIA_URL=https://mentoria.banorte.com
```

Dominio personalizado:
- Settings → Domains → Add `banorte.com`

**2. Desplegar Documind (apps/documind)**

```
Project Name: banorte-documind
Framework: Next.js
Root Directory: apps/documind
Build Command: cd ../.. && turbo run build --filter=documind
Install Command: pnpm install
Node Version: 18.x
```

Variables de entorno:
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://documind.banorte.com
```

Dominio personalizado:
- Settings → Domains → Add `documind.banorte.com`

**3. Desplegar Sentiment Analysis (apps/sentiment-analysis)**

```
Project Name: banorte-sentiment
Framework: Next.js
Root Directory: apps/sentiment-analysis
Build Command: cd ../.. && turbo run build --filter=sentiment-analysis
Install Command: pnpm install
Node Version: 18.x
```

Variables de entorno:
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://sentiment.banorte.com
```

Dominio personalizado:
- Settings → Domains → Add `sentiment.banorte.com`

**4. Configurar DNS**

En tu proveedor de DNS (GoDaddy, Cloudflare, etc.):

```
Tipo    Nombre      Valor
----    ------      -----
CNAME   @           cname.vercel-dns.com
CNAME   documind    cname.vercel-dns.com
CNAME   sentiment   cname.vercel-dns.com
```

---

### Estrategia 2: Todo bajo un Dominio con Paths

Todas las apps accesibles desde el mismo dominio con diferentes rutas.

#### Arquitectura:
```
banorte.com/                   → apps/landing
banorte.com/documind           → apps/documind
banorte.com/sentiment-analysis → apps/sentiment-analysis
```

#### Ventajas:
✅ Un solo dominio principal
✅ Gestión centralizada de SSL
✅ Más simple para DNS

#### Desventajas:
❌ Más complejo de configurar (requiere proxy/rewrites)
❌ Dificulta escalamiento independiente
❌ Puede haber conflictos de rutas

#### Implementación:

**Opción A: Vercel Rewrites** (en `apps/landing/next.config.js`):

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

**Opción B: Vercel Monorepo con basePath**:

Cada app configura su `basePath` en `next.config.js`:

```javascript
// apps/documind/next.config.js
module.exports = {
  basePath: '/documind',
  // ... resto de config
}

// apps/sentiment-analysis/next.config.js
module.exports = {
  basePath: '/sentiment-analysis',
  // ... resto de config
}
```

Variables de entorno en Landing:
```env
NEXT_PUBLIC_DOCUMIND_URL=/documind
NEXT_PUBLIC_SENTIMENT_URL=/sentiment-analysis
```

---

### Estrategia 3: Proyectos Vercel Separados con URLs Auto-generadas

Cada app tiene su propia URL de Vercel sin dominio personalizado.

#### Arquitectura:
```
banorte-landing.vercel.app     → apps/landing
banorte-documind.vercel.app    → apps/documind
banorte-sentiment.vercel.app   → apps/sentiment-analysis
```

#### Ventajas:
✅ Más rápido de implementar (sin DNS)
✅ Ideal para desarrollo/staging
✅ Gratis sin necesidad de dominio

#### Desventajas:
❌ URLs no profesionales
❌ Solo para pruebas/staging

#### Variables de entorno en Landing:
```env
NEXT_PUBLIC_DOCUMIND_URL=https://banorte-documind.vercel.app
NEXT_PUBLIC_SENTIMENT_URL=https://banorte-sentiment.vercel.app
```

---

## Checklist de Despliegue

### Pre-despliegue

- [ ] Código commiteado y pusheado a GitHub
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Build local exitoso (`pnpm build`)
- [ ] Lint sin errores (`pnpm lint`)
- [ ] Type-check sin errores (`pnpm type-check`)

### Despliegue de Landing Principal

- [ ] Proyecto creado en Vercel
- [ ] Root Directory configurado: `apps/landing`
- [ ] Build Command: `cd ../.. && turbo run build --filter=landing`
- [ ] Variables `NEXT_PUBLIC_*` configuradas
- [ ] Dominio personalizado agregado (si aplica)
- [ ] Deploy exitoso y sitio accesible

### Despliegue de Apps Individuales

Para cada app (documind, sentiment-analysis):

- [ ] Proyecto creado en Vercel
- [ ] Root Directory configurado
- [ ] Build Command configurado
- [ ] Variables de entorno agregadas
- [ ] Subdominio/dominio configurado
- [ ] Deploy exitoso
- [ ] Landing individual funcional (en ruta `/`)
- [ ] App principal funcional (en `/app` o `/analyze`)

### Post-despliegue

- [ ] Probar navegación desde Landing a cada app
- [ ] Verificar que las URLs en AppGrid funcionan correctamente
- [ ] Probar las 4 variantes de diseño en la Landing
- [ ] Verificar responsive en mobile/tablet/desktop
- [ ] Configurar analytics (si aplica)
- [ ] Configurar monitoring/error tracking

---

## Workflows de CI/CD

### GitHub Actions (Automático con Vercel)

Vercel detecta automáticamente los cambios y despliega:

```
main branch → Production
otras branches → Preview deployments
```

### Despliegue Manual desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy landing
cd apps/landing
vercel --prod

# Deploy documind
cd ../documind
vercel --prod
```

---

## Troubleshooting

### Build falla: "Cannot find module"

**Causa**: Dependencias no instaladas o pnpm no reconocido

**Solución**:
1. Verifica Install Command: `pnpm install`
2. Verifica que `package.json` tenga `"packageManager": "pnpm@10.22.0"`

### Build falla: "Turbo not found"

**Causa**: Build command incorrecto

**Solución**: Asegúrate de usar:
```
cd ../.. && turbo run build --filter=[app-name]
```

### Variables de entorno no funcionan

**Causa**: Variables no configuradas en Vercel o no tienen prefijo `NEXT_PUBLIC_`

**Solución**:
1. Todas las variables de frontend deben tener `NEXT_PUBLIC_`
2. Configurar en Vercel Dashboard → Settings → Environment Variables
3. Re-deploy después de agregar variables

### Landing no puede acceder a las apps

**Causa**: URLs incorrectas o apps no desplegadas

**Solución**:
1. Verifica que las apps estén desplegadas y accesibles
2. Actualiza `NEXT_PUBLIC_*_URL` en landing con URLs correctas
3. Re-deploy landing

### Conflictos de rutas entre apps

**Causa**: basePath no configurado correctamente

**Solución**: Si usas paths (Estrategia 2), asegúrate que cada app tenga su `basePath` único

---

## Rollback y Versiones

### Rollback en Vercel

1. Ve a Deployments en Vercel Dashboard
2. Encuentra el deployment anterior
3. Click en `...` → `Promote to Production`

### Rollback con Git

```bash
# Ver commits recientes
git log --oneline

# Revertir a commit anterior
git revert [commit-hash]
git push origin main
```

---

## Monitoreo y Logs

### Ver logs en Vercel

1. Dashboard → Proyecto → Functions
2. Real-time Logs tab
3. Filtra por errores: `level:error`

### Configurar alertas

Settings → Integrations → Add integration
- Slack notifications
- Datadog
- Sentry

---

## Escalamiento

### Agregar nueva app

1. Crear app en `apps/nueva-app`
2. Desplegar en Vercel (siguiendo pasos anteriores)
3. Actualizar `apps/landing/src/components/AppGrid.tsx`:

```typescript
{
  icon: <NuevoIcon size={60} color="#EB0029" />,
  title: 'Nueva App',
  description: 'Descripción...',
  route: process.env.NEXT_PUBLIC_NUEVA_APP_URL || '/nueva-app',
}
```

4. Agregar variable de entorno en Landing
5. Re-deploy landing

---

## Costos Estimados (Vercel)

### Plan Hobby (Gratis)
- ✅ Ideal para desarrollo/staging
- ✅ 100 GB bandwidth
- ❌ Solo 1 miembro del equipo
- ❌ Sin dominios comerciales

### Plan Pro ($20/mes por miembro)
- ✅ Unlimited team members
- ✅ 1 TB bandwidth
- ✅ Dominios comerciales
- ✅ Analytics avanzados
- **Recomendado para producción**

### Cálculo:
```
Landing:     $20/mes
Documind:    $20/mes
Sentiment:   $20/mes
----------
Total:       $60/mes
```

O un solo plan Pro con todos los proyectos: $20/mes

---

## Soporte

Para problemas de despliegue:
- 📧 Email: devops@banorte.com
- 📝 Documentación Vercel: https://vercel.com/docs
- 🐛 Issues: GitHub Issues del repo

---

**Última actualización**: 2025-12-08
