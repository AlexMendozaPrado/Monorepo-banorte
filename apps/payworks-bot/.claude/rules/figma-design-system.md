# Figma Design System Rules - Payworks Bot

## Design System Structure

### Token Definitions
- Design tokens are centralized in `packages/ui/src/tokens/`
  - Colors: `packages/ui/src/tokens/colors.ts`
  - Typography: `packages/ui/src/tokens/typography.ts`
  - Spacing: `packages/ui/src/tokens/spacing.ts`
- Tailwind preset extends these tokens: `packages/ui/src/tailwind/preset.ts`

### Color Tokens
```typescript
// IMPORTANT: Never hardcode colors - always use these tokens
banorteRed: '#EB0029'       // Primary brand, buttons, links, focus rings
banorteRedHover: '#E30028'  // Hover state for red elements
banorteGray: '#5B6670'      // Secondary text, labels, disabled
banorteDark: '#323E48'      // Primary text color
banorteBg: '#EBF0F2'        // Page background
banorteLight: '#F4F7F8'     // Card backgrounds, hover states, table headers
banorteWhite: '#FCFCFC'     // Off-white surfaces
statusSuccess: '#6CC04A'    // Success/approved states
statusWarning: '#FFA400'    // Warning states
statusAlert: '#FF671B'      // Error/rejected states
```

### Typography
```typescript
fontFamily: {
  sans: ['Roboto', 'system-ui', 'sans-serif'],     // Body text
  display: ['Gotham', 'Montserrat', 'sans-serif'],  // Headings
}
```
- Font sources: Gotham from `fonts.cdnfonts.com`, Roboto from Google Fonts
- Weights: 400 (regular), 500 (medium), 600-700 (bold)

### Spacing & Radius
```typescript
borderRadius: {
  btn: '4px',    // Buttons
  input: '6px',  // Inputs
  card: '8px',   // Cards, modals
}
boxShadow: {
  card: '0 3px 6px rgba(0,0,0,0.16)',
  hover: '0 6px 12px rgba(0,0,0,0.20)',
}
```

## Component Library

- IMPORTANT: Always use components from `@banorte/ui` (located at `packages/ui/src/components/`)
- Available components: Button, Card (CardHeader, CardTitle, CardContent, CardFooter), Input, TextInput, Select, DateInput, TextArea, SearchInput, Modal, Stepper, ProgressBar, Table (TableHeader, TableBody, TableRow, TableHead, TableCell)
- Place new UI components in `src/presentation/components/`
- Component naming: PascalCase, composition pattern for subcomponents

### Button Variants
- `primary`: bg-banorte-red, text-white
- `secondary`: bg-banorte-dark, text-white
- `outline`: border-banorte-red, text-banorte-red
- `ghost`: transparent, text-banorte-dark
- `danger`: bg-status-alert, text-white
- Sizes: `sm` (35px), `md` (45px), `lg` (50px)

### Input Standard
- Height: 50px
- Border: #CFD2D3 normal, #EB0029 error, #5B6670 focus
- Border radius: 6px (rounded-input)

### Card Standard
- Background: white
- Border radius: 8px (rounded-card)
- Shadow: card shadow
- Hover: -translate-y-1, shadow-hover (optional)
- Padding: p-5

## Figma MCP Integration Rules

### Required Flow (do not skip)
1. Run get_design_context first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run get_metadata to get the high-level node map, then re-fetch only the required node(s) with get_design_context
3. Run get_screenshot for a visual reference of the node variant being implemented
4. Only after you have both get_design_context and get_screenshot, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into this project's conventions, styles, and framework
6. Validate against Figma for 1:1 look and behavior before marking complete

### Implementation Rules
- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style
- Reuse existing components from `@banorte/ui` instead of duplicating functionality
- Use the project's color system (`banorteColors` tokens), typography scale, and spacing tokens consistently
- IMPORTANT: Map Figma colors to Banorte tokens:
  - Red (#EB0029) -> `banorte-red` or `text-banorte-red` or `bg-banorte-red`
  - Dark (#323E48) -> `banorte-dark` or `text-banorte-dark`
  - Gray (#5B6670) -> `banorte-gray` or `text-banorte-gray`
  - Background (#EBF0F2) -> `banorte-bg` or `bg-banorte-bg`
  - Light (#F4F7F8) -> `banorte-light` or `bg-banorte-light`
  - Green (#6CC04A) -> `status-success`
  - Orange (#FFA400) -> `status-warning`
  - Red-Orange (#FF671B) -> `status-alert`
- Use `cn()` utility from `@banorte/ui` for className composition
- Icons: ONLY use Lucide React icons (v0.553.0)
- Strive for 1:1 visual parity with the Figma design

## Asset Handling
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages - use Lucide React for all icons
- Store downloaded assets in `public/assets/`

## Project-Specific Conventions
- Architecture: Clean Architecture (core/domain, core/application, infrastructure, presentation)
- Styling: Tailwind CSS with `cn()` utility (clsx + tailwind-merge)
- State: React hooks, no external state management for POC
- Routing: Next.js 14 App Router
- Body font: Roboto, Headings: Gotham
- Page background: always `bg-banorte-bg` (#EBF0F2)
- All text in Spanish (es-MX)

## Payworks Bot Specific Views

### Dashboard Principal
- Header con logo Banorte + titulo "Bot de Certificacion Payworks"
- Estadisticas: certificaciones completadas, pendientes, aprobadas, rechazadas
- Tabla con historial de certificaciones recientes

### Pagina de Carga
- Drag & drop zone para Matriz de Pruebas (Excel)
- Selector de tipo de integracion (6 opciones)
- Boton "Iniciar Certificacion"

### Resultados de Certificacion
- Card por transaccion con veredicto (APROBADO verde / RECHAZADO rojo)
- Tabla de comparacion campo por campo (campo, regla R/O/N/A, encontrado, valor, veredicto)
- Visor de LOGs Servlet y PROSA
- Timeline del proceso
- Boton "Descargar Dictamen PDF"
