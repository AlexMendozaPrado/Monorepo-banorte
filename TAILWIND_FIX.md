# Fix de Estilos de Tailwind en Monorepo

## ✅ Problema Resuelto

Los componentes de `@banorte/landing-page` no mostraban estilos porque Tailwind CSS no estaba procesando los archivos del workspace package.

## 🔧 Solución Aplicada

### 1. Actualizado `tailwind.config.ts`

**Archivo**: `apps/documind/tailwind.config.ts`

**Cambio aplicado**:
```typescript
content: [
  "./src/app/**/*.{ts,tsx}",
  "./src/components/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
  // ✅ AGREGADO: Include workspace packages
  "../../packages/landing-page/src/**/*.{ts,tsx}"
],
```

**Por qué**: Tailwind CSS necesita saber dónde buscar las clases CSS. Al agregar la ruta al workspace package, ahora procesa correctamente los componentes compartidos.

## 🎯 Cómo Verificar

1. **Detener todos los servidores**:
   ```bash
   # Matar procesos en puertos 3000-3004
   # O reiniciar terminal
   ```

2. **Limpiar cache y reiniciar**:
   ```bash
   cd C:\Users\fluid\banorte-monorepo
   
   # Limpiar cache de Next.js
   rm -rf apps/documind/.next
   
   # Reiniciar servidor
   pnpm dev:documind
   ```

3. **Abrir en navegador**:
   ```
   http://localhost:3004  (o el puerto que indique)
   ```

4. **Verificar**:
   - ✅ Header rojo de Banorte (#EB0029)
   - ✅ Logo de Banorte blanco
   - ✅ Navegación secundaria gris
   - ✅ Formulario de login con estilos
   - ✅ Chat bubble de Maya
   - ✅ Iconos sociales
   - ✅ Carrusel de promociones

## 📋 Configuración Adicional para Nuevas Apps

Cuando agregues una nueva app que use `@banorte/landing-page`, asegúrate de:

### 1. Instalar el workspace package

```json
// apps/nueva-app/package.json
{
  "dependencies": {
    "@banorte/landing-page": "workspace:*"
  }
}
```

### 2. Configurar Tailwind

```typescript
// apps/nueva-app/tailwind.config.ts
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    // ⚠️ IMPORTANTE: Agregar workspace packages
    "../../packages/landing-page/src/**/*.{ts,tsx}"
  ],
  // ... resto de config
}
```

### 3. Configurar Next.js

```javascript
// apps/nueva-app/next.config.js
const nextConfig = {
  // ⚠️ IMPORTANTE: Transpilar workspace packages
  transpilePackages: ['@banorte/landing-page'],
  // ... resto de config
}
```

## 🎨 Estilos de Banorte

Los colores oficiales de Banorte ya están configurados en el `tailwind.config.ts`:

```typescript
colors: {
  banorteRed: "#EB0029",
  banorteRedHover: "#E30028",
  // ... otros colores
}
```

**Uso en componentes**:
```tsx
<button className="bg-banorteRed hover:bg-banorteRedHover">
  Botón Banorte
</button>
```

## 🔍 Troubleshooting

### Los estilos siguen sin verse

1. **Limpiar cache completamente**:
   ```bash
   cd apps/documind
   rm -rf .next node_modules/.cache
   ```

2. **Verificar que Tailwind está procesando los archivos**:
   - Abrir DevTools en el navegador
   - Buscar en el CSS compilado las clases como `bg-banorteRed`
   - Si no aparecen, el `content` path puede estar incorrecto

3. **Verificar ruta relativa**:
   ```bash
   # Desde apps/documind
   ls ../../packages/landing-page/src/components/
   # Debe listar: Header.tsx, LoginForm.tsx, etc.
   ```

### Hot reload no funciona para componentes del workspace

Esto es normal en monorepos. Opciones:

**Opción A**: Reiniciar servidor cuando cambies componentes compartidos
```bash
# Ctrl+C para detener
pnpm dev:documind
```

**Opción B**: Ejecutar Turbo watch (avanzado)
```bash
# En el root del monorepo
pnpm dev  # Ejecuta todas las apps con watch
```

## 📚 Recursos

- [Tailwind CSS Content Configuration](https://tailwindcss.com/docs/content-configuration)
- [Next.js transpilePackages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
- [Turborepo & Tailwind](https://turbo.build/repo/docs/handbook/tools/tailwindcss)

## ✅ Checklist

- [x] Agregado `../../packages/landing-page/src/**/*.{ts,tsx}` a `content` en Tailwind config
- [x] Agregado `transpilePackages: ['@banorte/landing-page']` en Next.js config
- [x] Cache limpiado
- [ ] Verificar en navegador que los estilos se aplican correctamente
- [ ] Probar hot reload
- [ ] Documentar para el equipo

## 🎯 Siguiente Paso

Abre http://localhost:3004 en tu navegador y verifica que:
1. El header sea rojo (#EB0029)
2. El logo de Banorte esté visible
3. Los botones y formularios tengan los estilos correctos
4. El chat bubble de Maya funcione

Si los estilos aún no se ven, comparte una captura de pantalla y revisaremos juntos.
