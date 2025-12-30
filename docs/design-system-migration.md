# Banorte Design System - Estado de Migración

## Resumen

Este documento detalla el estado actual de la migración del Design System `@banorte/ui` en el monorepo de Banorte.

---

## Apps Migradas

### 1. banorte-financial-app ✅
- **Commit:** `f66e704`
- **Cambios:**
  - 55 archivos actualizados con imports de `@banorte/ui`
  - 6 componentes locales eliminados (Button, Card, Input, Modal, ProgressBar, Stepper)
  - Tailwind configurado con `banortePreset`
- **Componentes usados:** Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Modal, ProgressBar, Stepper

### 2. sdk-version-control ✅
- **Commit:** `5b8bbb3`
- **Cambios:**
  - Dependencia `@banorte/ui` agregada
  - Tailwind configurado con `banortePreset`
  - Tokens duplicados eliminados (colores, tipografía, spacing)
  - Animaciones específicas de la app preservadas

### 3. landing ✅
- **Commit:** `111fe95`
- **Cambios:**
  - Dependencia `@banorte/ui` agregada
  - Tailwind configurado con `banortePreset`
  - 4 componentes AppCard refactorizados para usar Button de `@banorte/ui`
  - Colores hardcodeados reemplazados por tokens (banorte-red, banorte-dark, etc.)

---

## Apps Pendientes (Estrategia de Coexistencia)

Las siguientes apps usan Material-UI para componentes complejos. La estrategia es mantener MUI para tablas y gráficos mientras se usa `@banorte/ui` para componentes base.

### 4. business-rules ⏳
- **UI actual:** Material-UI (@mui/material, @mui/x-data-grid)
- **Tareas pendientes:**
  - [ ] Agregar dependencia `@banorte/ui`
  - [ ] Crear/usar tema MUI compartido (`banorteMuiTheme`)
  - [ ] Reemplazar botones básicos con Button de `@banorte/ui`
  - [ ] Mantener MUI para: Table, Dialog, DataGrid, Chip

### 5. documind ⏳
- **UI actual:** Material-UI + embla-carousel
- **Tareas pendientes:**
  - [ ] Agregar dependencia `@banorte/ui`
  - [ ] Usar tema MUI compartido
  - [ ] Reemplazar componentes base donde sea posible
  - [ ] Mantener MUI para: layout complejo, iconos

### 6. sentiment-analysis ⏳
- **UI actual:** Material-UI + Recharts
- **Tareas pendientes:**
  - [ ] Agregar dependencia `@banorte/ui`
  - [ ] Usar tema MUI compartido
  - [ ] Reemplazar botones/cards básicos
  - [ ] Mantener: MUI DataGrid, Recharts, DatePickers

---

## Componentes Futuros

### DataTable
- **Ubicación propuesta:** `packages/ui/src/components/DataTable/`
- **Propósito:** Wrapper de tabla HTML con estilos Banorte
- **Features:** sorting, pagination, search básico
- **Nota:** Para casos complejos, seguir usando MUI DataGrid

### Charts
- **Ubicación propuesta:** `packages/ui/src/components/Charts/`
- **Propósito:** Wrappers de Recharts con colores Banorte
- **Componentes:** BarChart, LineChart, PieChart, AreaChart
- **Paleta predefinida:** banorte-red, banorte-gray, status colors

---

## Tema MUI Compartido (Pendiente)

Crear para mantener consistencia visual en apps que usan Material-UI:

```typescript
// packages/ui/src/mui-theme/banorteTheme.ts
import { createTheme } from '@mui/material/styles';
import { banorteColors } from '../tokens/colors';

export const banorteMuiTheme = createTheme({
  palette: {
    primary: { main: '#EB0029' },
    secondary: { main: '#5B6670' },
    success: { main: '#6CC04A' },
    warning: { main: '#FFA400' },
    error: { main: '#FF671B' },
    background: { default: '#EBF0F2', paper: '#FCFCFC' },
    text: { primary: '#323E48', secondary: '#5B6670' }
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: '4px' } }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 3px 6px rgba(0,0,0,0.16)'
        }
      }
    }
  }
});
```

---

## Estructura del Paquete @banorte/ui

```
packages/ui/src/
├── components/
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Modal/
│   ├── ProgressBar/
│   ├── Stepper/
│   ├── TextInput/
│   ├── TextArea/
│   ├── DateInput/
│   ├── Select/
│   ├── SearchInput/
│   └── TableSearchInput/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── tailwind/
│   └── preset.ts
├── utils/
│   └── cn.ts
└── index.ts
```

---

## Cómo Usar en Nuevas Apps

### 1. Agregar dependencia
```json
{
  "dependencies": {
    "@banorte/ui": "workspace:*",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0"
  }
}
```

### 2. Configurar Tailwind
```javascript
const { banortePreset } = require('@banorte/ui/tailwind/preset');

module.exports = {
  presets: [banortePreset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
}
```

### 3. Importar componentes
```typescript
import { Button, Card, Input, Modal } from '@banorte/ui';
```

---

## Comandos Útiles

```bash
# Instalar dependencias
pnpm install

# Type-check todo el monorepo
pnpm turbo run type-check

# Build específico
pnpm --filter banorte-financial-app build

# Desarrollo
pnpm dev:financial
pnpm dev:landing
```

---

## Historial de Commits

| Commit | Descripción |
|--------|-------------|
| `df17a7e` | feat(ui): add Banorte Design System components and tokens |
| `f66e704` | refactor(financial-app): migrate to @banorte/ui shared components |
| `5b8bbb3` | refactor(sdk-version-control): integrate @banorte/ui design system |
| `111fe95` | refactor(landing): migrate to @banorte/ui components and tokens |
