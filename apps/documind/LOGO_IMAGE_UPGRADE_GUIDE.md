# Guía para Actualizar el Logo a Imagen en el Proyecto Existente

## 🎯 Objetivo
Reemplazar el logo de texto actual con una imagen real del logo de Banorte en el header existente.

## 📋 Pasos de Implementación

### Paso 1: Preparar la Estructura de Carpetas
```bash
# Crear carpeta para imágenes si no existe
mkdir -p public/images/logos
```

### Paso 2: Agregar las Imágenes del Logo
Coloca tus archivos de imagen del logo de Banorte en:
```
public/
└── images/
    └── logos/
        ├── banorte-logo.png          # Logo principal (fondo claro)
        └── banorte-logo-white.png    # Logo blanco (fondo rojo del header)
```

**Especificaciones recomendadas:**
- **Tamaño**: 280x64px (ratio 4.375:1)
- **Formato**: PNG con fondo transparente
- **Calidad**: Alta resolución para pantallas retina
- **Peso**: Menos de 50KB por imagen

### Paso 3: Actualizar el Componente BanorteLogo
**Archivo: `src/components/BanorteLogo.tsx`**

Reemplaza el contenido actual con:

```typescript
import Image from "next/image";

interface BanorteLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'red' | 'white';
  useImage?: boolean; // Nueva prop para alternar entre imagen y texto
}

export default function BanorteLogo({ 
  className = "", 
  width = 140, 
  height = 32, 
  variant = 'red',
  useImage = true // Por defecto usar imagen
}: BanorteLogoProps) {
  const isWhite = variant === 'white';

  // Si se usa imagen, renderizar componente Image de Next.js
  if (useImage) {
    return (
      <div className={`flex items-center ${className}`} style={{ width, height }}>
        <Image
          src={isWhite ? "/images/logos/banorte-logo-white.png" : "/images/logos/banorte-logo.png"}
          alt="Banorte"
          width={width}
          height={height}
          priority={true} // Cargar logo inmediatamente
          className="object-contain"
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
          onError={(e) => {
            // Fallback si la imagen no carga
            console.warn('Logo image failed to load, falling back to text logo');
          }}
        />
      </div>
    );
  }

  // Fallback al logo de texto (implementación original)
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ width, height }}>
      {/* Símbolo simple */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: height,
          height: height,
          backgroundColor: isWhite ? 'rgba(255, 255, 255, 0.2)' : '#EB0029',
          minWidth: height,
          border: isWhite ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: height * 0.4,
            height: height * 0.4,
            backgroundColor: isWhite ? '#FFFFFF' : '#FFFFFF'
          }}
        />
      </div>

      {/* Texto BANORTE */}
      <span
        className="font-bold tracking-wider"
        style={{
          color: isWhite ? '#FFFFFF' : '#EB0029',
          fontSize: height * 0.5,
          lineHeight: 1,
          fontFamily: 'Arial, sans-serif',
          textShadow: isWhite ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        BANORTE
      </span>
    </div>
  );
}
```

### Paso 4: Actualizar el Componente Header
**Archivo: `src/components/Header.tsx`**

Actualiza la línea del logo para habilitar el uso de imagen:

```typescript
// Busca esta línea en tu Header.tsx:
<BanorteLogo variant="white" height={32} width={140} />

// Reemplázala con:
<BanorteLogo 
  variant="white" 
  height={32} 
  width={140} 
  useImage={true} // Habilitar logo de imagen
/>
```

### Paso 5: Configurar Next.js para Optimización de Imágenes
**Archivo: `next.config.js`**

Si no tienes este archivo, créalo. Si ya existe, agrega la configuración de imágenes:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configurar optimización de imágenes para logos
    formats: ['image/webp', 'image/png'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache de 1 año para logos
    minimumCacheTTL: 31536000,
  },
}

module.exports = nextConfig
```

### Paso 6: Verificación
1. **Reinicia el servidor de desarrollo**:
   ```bash
   yarn dev
   ```

2. **Verifica visualmente**:
   - [ ] El logo de imagen aparece en el header
   - [ ] El logo se ve nítido y bien proporcionado
   - [ ] No hay errores en la consola del navegador
   - [ ] El logo mantiene el tamaño correcto

3. **Prueba el fallback**:
   ```typescript
   // Temporalmente cambia a false para probar el fallback
   <BanorteLogo useImage={false} variant="white" />
   ```

## 🔧 Opciones de Personalización

### Diferentes Tamaños
```typescript
// Logo más grande para páginas especiales
<BanorteLogo width={200} height={46} useImage={true} />

// Logo compacto para espacios reducidos
<BanorteLogo width={100} height={23} useImage={true} />
```

### Manejo de Errores
```typescript
// Con manejo personalizado de errores
<BanorteLogo 
  useImage={true}
  variant="white"
  onError={() => {
    console.log('Switching to text logo');
    // Lógica personalizada si la imagen falla
  }}
/>
```

## ⚠️ Solución de Problemas

### Problema: La imagen no se muestra
**Soluciones**:
1. Verifica que el archivo existe en `public/images/logos/`
2. Revisa que el nombre del archivo coincida exactamente
3. Asegúrate de que el formato sea PNG, JPG o WebP
4. Reinicia el servidor de desarrollo

### Problema: La imagen se ve pixelada
**Soluciones**:
1. Usa una imagen de mayor resolución (mínimo 280x64px)
2. Asegúrate de que la imagen tenga buena calidad
3. Considera usar formato WebP para mejor compresión

### Problema: La imagen no se adapta bien
**Soluciones**:
1. Ajusta las propiedades `width` y `height`
2. Verifica que la imagen tenga el ratio correcto (4.375:1)
3. Usa `object-contain` para mantener proporciones

## 🎯 Resultado Esperado

Después de seguir estos pasos:
- ✅ El header mostrará tu logo real de Banorte
- ✅ El logo se verá nítido en todas las resoluciones
- ✅ Mantendrá la funcionalidad responsive
- ✅ Tendrá fallback al logo de texto si hay problemas
- ✅ Estará optimizado para rendimiento

## 📝 Notas Adicionales

- **Backup**: Guarda una copia del componente original antes de hacer cambios
- **Testing**: Prueba en diferentes navegadores y dispositivos
- **Performance**: Las imágenes se optimizan automáticamente con Next.js
- **Accesibilidad**: El atributo `alt="Banorte"` mejora la accesibilidad

¡Tu header ahora tendrá el logo real de Banorte con máxima calidad y rendimiento!
