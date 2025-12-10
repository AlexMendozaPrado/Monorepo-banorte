# 🚀 Business Rules Migration Progress

## Estado: EN PROGRESO

**Inicio:** 2025-12-09
**Enfoque:** Migración completa Frontend Vite → Next.js
**Backend:** Permanece en Express (deployment separado)

---

## ✅ Fase 1: Setup Inicial (COMPLETADO)

- [x] Branch creado: `feat/business-rules-integration`
- [x] Estructura de directorios creada
- [x] package.json con todas las dependencias
- [x] Configuración Next.js, TypeScript, Tailwind

---

## 🔄 Fase 2: Migración de Código (EN PROGRESO)

### Archivos de Configuración
- [ ] next.config.js
- [ ] tsconfig.json
- [ ] tailwind.config.ts
- [ ] .env.local
- [ ] globals.css

### Assets y Recursos
- [ ] Copiar assets desde TC2005B-Reto-Equipo-3/src/assets
- [ ] LogoBanorte.svg
- [ ] HeaderBanorte.svg
- [ ] Otros íconos/imágenes

### Services (Capa de datos)
- [ ] `services/api.js` → `services/api.ts`
- [ ] `services/authService.js` → `services/authService.ts`
- [ ] `services/rulesService.js` (si existe)

### Hooks Personalizados
- [ ] `hooks/useBusinessRules.jsx` → `hooks/useBusinessRules.ts`
- [ ] `hooks/useConversation.jsx` → `hooks/useConversation.ts`
- [ ] `hooks/useNotification.jsx` → `hooks/useNotification.ts`
- [ ] `hooks/useNavigation.jsx` → `hooks/useNavigation.ts`
- [ ] `hooks/useGlobalNotifications.jsx` → Context Provider

### Componentes Compartidos
- [ ] Identificar y migrar componentes reutilizables
- [ ] Adaptar a Next.js ('use client' donde sea necesario)

### Páginas (10 rutas)
#### Autenticación
- [ ] `app/page.tsx` - Landing individual (ya creado)
- [ ] `app/login/page.tsx`
- [ ] `app/register/page.tsx`
- [ ] `app/forgot-password/page.tsx`

#### App Principal
- [ ] `app/dashboard/page.tsx` - Dashboard principal (2055 líneas → refactorizar)
  - [ ] Componente principal
  - [ ] AIGenerator component
  - [ ] ConversationMode component
  - [ ] FileUpload component
  - [ ] RecentMovements component
  - [ ] ProfilePopup component
  - [ ] NotificationsPopup component

- [ ] `app/reglas/page.tsx` - Gestión de reglas
- [ ] `app/simulador/page.tsx` - Simulador
- [ ] `app/mapeo-xml/page.tsx` - Mapeo XML
- [ ] `app/reportes/page.tsx` - Reportes
- [ ] `app/historial/page.tsx` - Historial

### Layout y Middleware
- [ ] `app/layout.tsx` - Root layout
- [ ] `app/(dashboard)/layout.tsx` - Dashboard layout con sidebar
- [ ] `middleware.ts` - Autenticación y rutas protegidas

---

## 📊 Complejidad por Archivo

| Archivo Original | Líneas | Complejidad | Tiempo Estimado |
|------------------|--------|-------------|-----------------|
| Dashboard.jsx | 2055 | ⚠️ MUY ALTA | 4-5 horas |
| Login.jsx | ~200 | ✅ Media | 30 min |
| Register.jsx | ~200 | ✅ Media | 30 min |
| Reglas.jsx | ? | ⚠️ Alta | 2 horas |
| Simulador.jsx | ? | ⚠️ Alta | 2 horas |
| MapeoXML.jsx | ? | ⚠️ Alta | 1-2 horas |
| Reports.jsx | ? | ⚠️ Media | 1 hora |
| Historial.jsx | ? | ✅ Media | 1 hora |
| Hooks (4) | ~500 | ⚠️ Media | 2 horas |
| Services (3) | ~300 | ✅ Baja | 1 hora |

**Total estimado:** 15-19 horas

---

## 🎯 Próximos Pasos Inmediatos

1. Terminar configuración base (next.config, tsconfig, etc.)
2. Copiar assets
3. Migrar services (más fácil, sin UI)
4. Migrar hooks
5. Migrar componentes simples
6. Migrar páginas de autenticación
7. Refactorizar y migrar Dashboard (lo más complejo)

---

## 🔧 Configuración del Backend

**Backend permanece separado:**
- Ubicación actual: `C:\Users\fluid\TC2005B-Reto-Equipo-3\Backend`
- Stack: Express 5.1.0 + PostgreSQL + Gemini AI
- Deployment: Railway o Render
- API URL: Se configura en .env.local del frontend

---

## 📝 Notas Importantes

- Dashboard tiene 2055 líneas → Requiere refactorización en múltiples componentes
- Material-UI se usa extensivamente → Mantener misma versión
- Sistema de notificaciones usa Context API → Preservar
- Gemini AI conversacional → Mantener lógica completa
- File uploads (XML/TXT) → Adaptar a Next.js

---

**Última actualización:** 2025-12-09 16:05
