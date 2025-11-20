# Demo del Proyecto DocuMind

## 🚀 Pasos para Probar la Aplicación

### 1. Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   yarn install
   # o
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copia `.env.local.example` a `.env.local`
   - Agrega tu API key de OpenAI:
   ```env
   OPENAI_API_KEY=sk-tu-api-key-aqui
   OPENAI_MODEL=gpt-4o-mini
   MAX_UPLOAD_MB=20
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   yarn dev
   # o
   npm run dev
   ```

4. **Abrir la aplicación:**
   - Navega a [http://localhost:3000/analyze](http://localhost:3000/analyze)

### 2. Flujo de Prueba

1. **Subir PDF:**
   - Arrastra un archivo PDF a la zona de carga
   - O usa el botón "Seleccionar archivo"
   - El PDF debe ser menor a 20MB

2. **Visualización:**
   - El PDF aparecerá inmediatamente en la columna izquierda
   - Verás un indicador "Analizando documento..."

3. **Análisis:**
   - El sistema extraerá el texto del PDF
   - Enviará el texto a OpenAI para generar palabras clave
   - Las palabras clave aparecerán como chips de colores

4. **Resultado:**
   - Entre 8-20 palabras clave categorizadas
   - Colores por categoría:
     - 🔵 Persona (azul)
     - 🔵 Organización (cian)
     - 🟢 Fecha (verde)
     - 🔴 Cantidad (rojo)
     - 🟠 Ubicación (naranja)
     - ⚪ Tema/Otro (gris)

### 3. Casos de Prueba

#### ✅ Casos Exitosos
- PDF con texto extraíble
- Documentos en español
- Archivos menores a 20MB
- PDFs con contenido estructurado

#### ❌ Casos de Error
- Archivos que no son PDF
- PDFs mayores a 20MB
- PDFs escaneados sin OCR
- API key inválida o faltante

### 4. Arquitectura Demostrada

El proyecto demuestra:

- **Clean Architecture:** Separación clara de capas
- **Dependency Injection:** Composición en `container.ts`
- **Type Safety:** TypeScript en toda la aplicación
- **Modern React:** Hooks, componentes funcionales
- **API Routes:** Backend integrado con Next.js
- **Error Handling:** Manejo robusto de errores
- **UI/UX:** Interfaz moderna con Material UI

### 5. Tecnologías en Acción

- **Next.js 14+:** App Router, API Routes
- **React 18:** Componentes funcionales, hooks
- **TypeScript:** Tipado estático completo
- **Material UI:** Componentes de interfaz
- **react-pdf:** Visualización de PDFs
- **pdf-parse:** Extracción de texto
- **OpenAI:** Generación de palabras clave
- **Clean Architecture:** Organización del código

### 6. Puntos de Extensión

El proyecto está preparado para:

- **Múltiples modos:** generic, legal, academic, finance
- **Idiomas:** español, inglés
- **Categorías personalizadas:** Fácil modificación
- **Nuevos extractores:** Implementar otros servicios
- **Persistencia:** Agregar base de datos
- **Autenticación:** Integrar sistema de usuarios
