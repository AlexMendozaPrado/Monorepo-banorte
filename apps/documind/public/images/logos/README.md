# Logos de Banorte

## 📁 Estructura de Archivos

Coloca los archivos de logo de Banorte en esta carpeta con los siguientes nombres:

```
public/images/logos/
├── logo.png                  # Logo principal de Banorte ✅ AGREGADO
└── README.md                 # Este archivo de instrucciones
```

## 🎨 Especificaciones de Imagen

### Tamaño Recomendado
- **Ancho**: 280px
- **Alto**: 64px
- **Ratio**: 4.375:1 (mantener esta proporción)

### Formato
- **Formato preferido**: PNG con fondo transparente
- **Formatos soportados**: PNG, JPG, WebP
- **Peso máximo**: 50KB por imagen

### Calidad
- **Resolución**: Alta calidad para pantallas retina
- **Fondo**: Transparente preferiblemente
- **Colores**: Mantener colores oficiales de Banorte

## 🔧 Uso en el Código

### Logo en Header (automáticamente blanco en fondo rojo)
```typescript
<BanorteLogo variant="white" useImage={true} />
```

### Logo en Fondo Claro (colores originales)
```typescript
<BanorteLogo variant="red" useImage={true} />
```

### Fallback a Texto
```typescript
<BanorteLogo variant="white" useImage={false} />
```

## 🎨 Cómo Funciona

- **Archivo único**: `logo.png` se usa para ambas variantes
- **Filtro automático**: Para `variant="white"`, se aplica un filtro CSS que convierte el logo a blanco
- **Optimización**: Next.js optimiza automáticamente la imagen para mejor rendimiento

## ⚠️ Notas Importantes

1. **Nombres exactos**: Los nombres de archivo deben coincidir exactamente
2. **Mayúsculas/minúsculas**: Los nombres son sensibles a mayúsculas
3. **Formato**: PNG es preferido para mejor calidad con transparencia
4. **Optimización**: Next.js optimizará automáticamente las imágenes

## 🚀 Después de Agregar las Imágenes

1. Reinicia el servidor de desarrollo:
   ```bash
   yarn dev
   ```

2. Verifica que el logo aparezca correctamente en el header

3. Si hay problemas, revisa la consola del navegador para errores

## 📝 Ejemplo de Estructura Final

```
public/
└── images/
    └── logos/
        ├── logo.png                  ✅ Agregado
        └── README.md                 ✅ Este archivo
```

¡Una vez que agregues las imágenes, el header mostrará el logo real de Banorte!
