# 📋 Plan de Integración: Business Rules Generator

Análisis y estrategia para integrar el proyecto Business Rules al monorepo Banorte.

---

## 🔍 Análisis del Proyecto Actual

### **Arquitectura Actual**

```
TC2005B-Reto-Equipo-3/
├── Frontend (Vite + React)
│   ├── src/               # Código React
│   ├── public/            # Assets estáticos
│   ├── vite.config.js     # Configuración Vite
│   └── package.json       # Dependencias frontend
│
└── Backend (Express + Node.js)
    ├── routes/            # API routes
    ├── services/          # Business logic (Gemini AI)
    ├── config/            # Database config
    ├── server.js          # Entry point
    └── package.json       # Dependencias backend
```

### **Tecnologías Identificadas**

**Frontend:**
- ⚠️ **Vite + React** (NO Next.js)
- React 19.1.1
- Material-UI v7
- React Router DOM
- Puerto: 5173

**Backend:**
- Express 5.1.0
- PostgreSQL + Supabase
- Google Gemini AI
- Puerto: 5000

### **Dependencias Clave**

**Frontend:** 42MB aprox
- @mui/material, @mui/icons-material
- react-router-dom
- @google/generative-ai
- chart.js, react-chartjs-2

**Backend:** 25MB aprox
- express, cors
- pg (PostgreSQL)
- @supabase/supabase-js
- @google/generative-ai
- multer, pdfkit

---

## 🎯 Estrategias de Integración

### **Opción 1: Migrar Frontend a Next.js** ⭐ **RECOMENDADO**

Convertir el frontend de Vite/React a Next.js para mantener consistencia en el monorepo.

**Ventajas:**
- ✅ Consistencia con otras apps (Documind, Sentiment)
- ✅ Mejor SEO y performance
- ✅ Server-side rendering
- ✅ API routes integradas (puedes mover backend a Next.js API)
- ✅ Deployment más simple en Vercel
- ✅ Reutilización de componentes del monorepo

**Desventajas:**
- ⚠️ Requiere migración (1-2 días de trabajo)
- ⚠️ Cambios en routing (react-router → Next.js router)

**Esfuerzo:** Medio (4-8 horas)

---

### **Opción 2: Mantener Vite + Backend Separado**

Integrar el frontend Vite tal cual, backend queda externo.

**Ventajas:**
- ✅ Rápido de implementar
- ✅ No requiere migración
- ✅ Código actual funciona sin cambios

**Desventajas:**
- ❌ Inconsistencia con resto del monorepo
- ❌ Backend debe desplegarse aparte (Railway, Render, etc.)
- ❌ Configuración CORS más compleja
- ❌ No aprovecha ventajas de Next.js

**Esfuerzo:** Bajo (1-2 horas)

---

### **Opción 3: Solo Frontend en Monorepo + Backend Externo**

Frontend migrado a Next.js, backend sigue separado pero optimizado.

**Ventajas:**
- ✅ Frontend consistente con monorepo
- ✅ Backend puede escalarse independientemente
- ✅ Separación clara de responsabilidades

**Desventajas:**
- ⚠️ Requiere mantener dos repos/deployments
- ⚠️ Variables de entorno para API URL

**Esfuerzo:** Medio-Alto (6-10 horas)

---

## 🚀 Estrategia Recomendada: **Opción 1**

### **Migración Frontend a Next.js + API Routes**

**Arquitectura Objetivo:**

```
banorte-monorepo/
└── apps/
    └── business-rules/              # Nueva app
        ├── src/
        │   ├── app/
        │   │   ├── page.tsx         # Landing (similar a otras apps)
        │   │   ├── dashboard/       # App principal
        │   │   └── api/             # Backend migrado a API routes
        │   │       ├── auth/
        │   │       ├── rules/
        │   │       ├── ai/
        │   │       └── simulation/
        │   ├── components/          # Componentes React (migrados)
        │   └── services/            # Services (adaptados)
        ├── public/                  # Assets
        ├── package.json
        └── next.config.js
```

---

## 📋 Plan de Migración Paso a Paso

### **Fase 1: Setup Inicial** (30 min)

1. Crear estructura de app en monorepo
2. Configurar Next.js 14 con App Router
3. Configurar TypeScript
4. Configurar Tailwind CSS + Material-UI

### **Fase 2: Migración Frontend** (3-4 horas)

1. **Convertir componentes:**
   - React components → Next.js components
   - Agregar 'use client' donde sea necesario
   - Mantener Material-UI

2. **Migrar routing:**
   - react-router-dom → Next.js App Router
   - `/` → Landing page
   - `/dashboard` → App principal
   - `/rules` → Gestión de reglas
   - `/simulation` → Simulador

3. **Adaptar servicios:**
   - API calls → fetch a Next.js API routes
   - Mantener lógica de negocio

### **Fase 3: Migración Backend** (2-3 horas)

1. **Mover rutas Express a API Routes:**
   ```
   Backend/routes/auth.js → app/api/auth/route.ts
   Backend/routes/rules.js → app/api/rules/route.ts
   Backend/routes/ai.js → app/api/ai/route.ts
   ```

2. **Adaptar servicios:**
   - Gemini service → Mantener igual
   - Database config → Usar Supabase client

3. **Environment variables:**
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - GEMINI_API_KEY
   - DATABASE_URL (si usa Postgres directo)

### **Fase 4: Testing y Ajustes** (1-2 horas)

1. Probar funcionalidad completa
2. Ajustar estilos
3. Verificar integraciones (AI, DB)

---

## 🔧 Cambios Técnicos Necesarios

### **1. Routing**

**Antes (React Router):**
```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</BrowserRouter>
```

**Después (Next.js):**
```
app/
├── page.tsx              # Home (/)
├── dashboard/
│   └── page.tsx          # Dashboard (/dashboard)
└── layout.tsx            # Layout compartido
```

### **2. API Calls**

**Antes:**
```javascript
const response = await fetch('http://localhost:5000/api/rules')
```

**Después:**
```javascript
const response = await fetch('/api/rules')
```

### **3. Data Fetching**

**Antes (useEffect):**
```jsx
useEffect(() => {
  fetchRules()
}, [])
```

**Después (Server Components cuando sea posible):**
```tsx
async function RulesPage() {
  const rules = await getRules() // Server-side
  return <RulesList rules={rules} />
}
```

---

## 🌐 Despliegue en Vercel

### **Frontend (Next.js)**

```
Project: banorte-business-rules
Root Directory: apps/business-rules
Build Command: cd ../.. && turbo run build --filter=business-rules
Install Command: pnpm install
Node Version: 18.x
```

**Variables de Entorno:**
```
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
NEXT_PUBLIC_APP_URL=https://business-rules.banorte.com
```

### **Backend (Opcional - Si no migra a API Routes)**

Desplegar en Railway o Render:
```
Service: Node.js
Start Command: npm start
Root: Backend/
```

---

## ⏱️ Estimación de Tiempo (Actualizada)

### **Opción 1: Migración Completa a Next.js**

| Fase | Detalles | Tiempo |
|------|----------|--------|
| **Setup inicial** | Crear estructura, configurar Next.js, Tailwind, MUI | 30 min |
| **Migración de routing** | 10 rutas + middleware de auth | 2 horas |
| **Dashboard principal** | Componente de 2055 líneas, refactorizar | 4-5 horas |
| **Otras páginas** | Login, Register, Reglas, Simulador, etc. | 3-4 horas |
| **Custom hooks** | Migrar y adaptar 4 hooks principales | 2 horas |
| **Backend a API Routes** | 7 rutas Express → Next.js | 3-4 horas |
| **File uploads** | Migrar multer a Next.js | 1-2 horas |
| **Database integration** | Adaptar pool de PostgreSQL | 1 hora |
| **Gemini AI service** | Integrar servicio existente | 1 hora |
| **Authentication** | JWT + protected routes | 2 horas |
| **Testing completo** | Todas las funcionalidades | 2-3 horas |
| **Bug fixes** | Ajustes y correcciones | 2 horas |
| **TOTAL** | | **24-30 horas** |

### **Opción 2: Integración Rápida (Vite + Backend Externo)**

| Fase | Detalles | Tiempo |
|------|----------|--------|
| **Copiar código** | Frontend a monorepo | 30 min |
| **Configurar Vite** | Ajustar vite.config.js | 30 min |
| **Environment variables** | Configurar URLs de backend | 15 min |
| **Testing básico** | Verificar funcionamiento | 30 min |
| **TOTAL** | | **1-2 horas** |

### **Opción 3: Frontend Next.js + Backend Separado**

| Fase | Detalles | Tiempo |
|------|----------|--------|
| **Migración frontend** | Solo frontend a Next.js | 12-15 horas |
| **API client setup** | Configurar llamadas a backend externo | 1-2 horas |
| **Testing** | Verificar integración | 2 horas |
| **TOTAL** | | **15-19 horas** |

---

## 🎯 Quick Start (Opción Rápida)

Si necesitas integración inmediata:

### **Plan Rápido: Solo Frontend en Monorepo**

1. Copiar `src/` a `apps/business-rules/src/`
2. Agregar wrapper de Next.js mínimo
3. Mantener backend externo
4. Configurar proxy a backend

**Tiempo:** 1-2 horas
**Trade-off:** No aprovecha ventajas de Next.js

---

## 📝 Notas Importantes

### **Dependencias Especiales:**

1. **Google Gemini AI:** Necesita API key segura
2. **PostgreSQL/Supabase:** DB debe estar accesible
3. **Multer (file uploads):** Puede migrar a Next.js upload
4. **PDFKit (reportes):** Compatible con Next.js API routes

### **Consideraciones:**

- Backend tiene lógica compleja de AI (Gemini)
- Usa PostgreSQL directo + Supabase
- Generación de reportes CSV/PDF
- Upload de archivos XML
- Sistema de autenticación con JWT

---

## 🔬 Análisis Técnico Detallado

### **Frontend Architecture**

**Routing (React Router DOM):**
```javascript
Routes:
  / → Navigate to /login
  /login → Login page
  /register → Register page
  /forgot-password → Password recovery
  /dashboard → Main dashboard (AI generator)
  /reglas → Business rules management
  /simulador → Rule simulator
  /reportes → Reports
  /historial → History
  /mapeo-xml → XML mapping
```

**Key Pages:**
- **Dashboard.jsx** (2055 lines): Main hub with:
  - AI business rule generator with Gemini
  - Conversational mode for iterative rule creation
  - File upload (TXT/XML) for mapping
  - Real-time notifications system
  - User profile management
  - Sidebar navigation
  - Material-UI components extensively used

**State Management:**
- Custom hooks for business logic (`useBusinessRules`, `useConversation`)
- Context API for global notifications (`NotificationsProvider`)
- Local state with useState for UI components

**Key Features:**
1. **AI Conversation Mode**: Iterative dialogue with Gemini to refine rules
2. **Direct Generation**: One-shot rule generation from prompt
3. **File Processing**: XML/TXT payment file mapping (ISO 20022 PAIN.001)
4. **Authentication**: JWT-based with session management

### **Backend Architecture**

**API Routes:**
```javascript
/api/auth → Authentication (login, register, change password)
/api/rules → Business rules CRUD
/api/ai → Gemini AI integration
  - POST /test-gemini
  - POST /continue-conversation
  - POST /process-payment-mapping
  - GET /gemini-info
/api/reports → Report generation
/api/historial → History tracking
/api/simulation → Rule simulation
/api/health → Health check
```

**Database (PostgreSQL):**
- Connection via `pg` Pool
- SSL enabled (Supabase-compatible)
- Environment-based configuration:
  - DB_USER
  - DB_HOST
  - DB_NAME
  - DB_PASSWORD
  - DB_PORT

**AI Integration:**
- Service: `geminiService.js`
- Model: `gemini-2.5-flash`
- Capabilities:
  - Business rule generation from text
  - CSV data analysis
  - Rule refinement
  - Iterative conversation
  - ISO 20022 PAIN.001 payment mapping

---

## 🚧 Migration Complexity Analysis

### **High Complexity Areas:**

1. **Dashboard Component (2055 lines)**
   - Extensive Material-UI usage
   - Complex state management
   - Multiple interactive features
   - Needs to be split into smaller components

2. **React Router → Next.js App Router**
   - 10 routes to migrate
   - Navigation hooks need adaptation
   - Protected routes need middleware

3. **File Uploads**
   - Currently using input[type=file]
   - Needs Next.js API route handling
   - Multer migration for backend

4. **Conversational AI State**
   - Complex conversation flow
   - Real-time updates
   - Needs careful state preservation

### **Medium Complexity Areas:**

1. **Authentication System**
   - JWT token management
   - Session persistence
   - Password change functionality

2. **Custom Hooks**
   - `useBusinessRules`: Manage rule generation state
   - `useConversation`: Handle AI dialogue
   - `useNotification`: Toast notifications
   - `useNavigation`: Route navigation

3. **API Service Layer**
   - `api.js`: Centralized API calls
   - `authService.js`: Authentication logic
   - `rulesService.js`: Business rules operations

### **Low Complexity Areas:**

1. **Backend API Routes** → Next.js API Routes
   - Straightforward migration
   - Keep same endpoints
   - Minimal code changes

2. **Database Connection**
   - Already using standard pg Pool
   - Easy to adapt to Next.js

3. **Gemini AI Service**
   - Standalone service
   - Can be reused as-is

---

## 🎬 ¿Qué Prefieres?

### **Opción A: Migración Completa** ⭐
- Frontend a Next.js
- Backend a API Routes
- Todo en el monorepo
- Deployment unificado en Vercel

### **Opción B: Integración Rápida**
- Frontend Vite tal cual
- Backend externo (Railway/Render)
- Solo frontend en monorepo

### **Opción C: Híbrido**
- Frontend migrado a Next.js
- Backend separado pero optimizado
- Dos deployments

---

## 💭 Recomendación Final (Basada en Análisis Completo)

Después de analizar en profundidad el código (Dashboard de 2055 líneas, múltiples hooks personalizados, sistema de autenticación complejo, integración con Gemini AI, y manejo de archivos), mi recomendación es:

### **🎯 OPCIÓN 3: Frontend Next.js + Backend Separado** (15-19 horas)

**Justificación:**

✅ **Pros:**
1. **Consistencia con monorepo:** Frontend en Next.js como Documind y Sentiment
2. **Backend preservado:** El backend Express está bien estructurado y funciona perfectamente
3. **Separación de responsabilidades:** Backend puede escalar independientemente
4. **Menor riesgo:** No tocamos el backend que tiene lógica compleja de IA
5. **Deployment flexible:** Frontend en Vercel, Backend en Railway/Render
6. **Realista:** 15-19 horas vs 24-30 horas de migración completa

⚠️ **Contras:**
- Requiere mantener dos deployments
- Variables de entorno para API URL

### **Por qué NO la Opción 1 (Migración Completa):**
- **24-30 horas es mucho tiempo** para la complejidad encontrada
- Dashboard de 2055 líneas necesita refactorización significativa
- Riesgo alto de bugs al migrar backend con Gemini AI
- El backend Express funciona perfectamente, ¿para qué arriesgarlo?

### **Por qué NO la Opción 2 (Integración Rápida):**
- Inconsistencia con el monorepo (único usando Vite)
- No aprovecha ventajas de Next.js
- Configuración CORS más compleja
- Frontend y backend acoplados en deployment

---

## 🚀 Plan de Acción Recomendado

### **Fase 1: Preparación (30 min)**
1. ✅ Análisis completo del proyecto (COMPLETADO)
2. Crear branch en monorepo: `feat/business-rules-integration`
3. Crear estructura `apps/business-rules/`

### **Fase 2: Setup Next.js (30 min)**
1. Inicializar Next.js 14 con App Router
2. Configurar TypeScript
3. Configurar Tailwind CSS + Material-UI v7
4. Copiar assets (LogoBanorte, HeaderBanorte SVG)

### **Fase 3: Migración Frontend (12-15 horas)**
1. **Routing y Layout** (2h)
   - Crear middleware de autenticación
   - Migrar 10 rutas a App Router
   - Layout con header y sidebar

2. **Páginas de Autenticación** (2h)
   - Login.tsx
   - Register.tsx
   - ForgotPassword.tsx

3. **Dashboard Principal** (5h)
   - Refactorizar en componentes más pequeños
   - DashboardLayout.tsx
   - AIGenerator.tsx
   - ConversationMode.tsx
   - FileUpload.tsx
   - RecentMovements.tsx

4. **Otras Páginas** (3h)
   - Reglas.tsx
   - Simulador.tsx
   - MapeoXML.tsx
   - Reportes.tsx
   - Historial.tsx

5. **Hooks y Services** (2h)
   - Adaptar useBusinessRules
   - Adaptar useConversation
   - Adaptar useNotification
   - API client para backend externo

### **Fase 4: Configuración Backend Externo (1-2 horas)**
1. Desplegar backend Express en Railway/Render
2. Configurar variables de entorno
3. Configurar CORS para producción
4. Probar endpoints desde frontend local

### **Fase 5: Testing e Integración (2 horas)**
1. Probar flujo completo de autenticación
2. Probar generación de reglas con IA
3. Probar modo conversacional
4. Probar file uploads
5. Verificar integración con PostgreSQL

### **Fase 6: Deployment (1 hora)**
1. Agregar business-rules a turbo.json
2. Desplegar frontend en Vercel
3. Configurar environment variables en Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://business-rules-api.railway.app
   NEXT_PUBLIC_APP_URL=https://business-rules.vercel.app
   ```
4. Verificar funcionamiento en producción

---

## 📋 Checklist de Migración

### Pre-requisitos
- [ ] Branch creado: `feat/business-rules-integration`
- [ ] Backend deployado en Railway/Render
- [ ] Database PostgreSQL accesible
- [ ] Gemini API key disponible

### Frontend
- [ ] Next.js app structure creado
- [ ] Material-UI configurado
- [ ] Routing migrado (10 rutas)
- [ ] Dashboard refactorizado
- [ ] Hooks adaptados
- [ ] API client configurado

### Testing
- [ ] Login/Register funciona
- [ ] Dashboard carga correctamente
- [ ] Generación de reglas funciona
- [ ] Modo conversacional funciona
- [ ] File uploads funcionan
- [ ] Todas las páginas navegables

### Deployment
- [ ] Frontend en Vercel
- [ ] Backend en Railway/Render
- [ ] Environment variables configuradas
- [ ] CORS configurado
- [ ] Funcionamiento verificado

---

## ❓ Preguntas para Ti

Antes de empezar, necesito confirmar:

1. **¿Estás de acuerdo con la Opción 3** (Frontend Next.js + Backend Separado)?
   - Si prefieres otra opción, indícame cuál y por qué

2. **¿Tienes acceso a:**
   - Gemini API Key?
   - PostgreSQL/Supabase database credentials?
   - Railway o Render para desplegar backend?

3. **¿Prefieres que:**
   - Empiece directamente con la migración?
   - Primero despliegue el backend Express?
   - Hagamos una prueba rápida con Opción 2 primero?

---

**Resumen Final:**
- ✅ Análisis completo: 2055 líneas de Dashboard, 10 rutas, sistema complejo de IA
- ✅ Opción recomendada: Frontend Next.js + Backend Separado (15-19 horas)
- ✅ Backend Express está bien hecho, mejor no migrarlo
- ✅ Listo para empezar cuando confirmes el approach

¿Cómo quieres proceder?
