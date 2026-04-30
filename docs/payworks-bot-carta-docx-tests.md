# Pruebas — Carta de certificación en `.docx`

Plan de pruebas para la feature **"Generar carta de certificación en `.docx` desde
template oficial"** (branch `feat/payworks-bot-carta-docx-template`,
commit `ed08d08`).

## Alcance

| Componente | Archivo | Cambio |
|---|---|---|
| Template | `apps/payworks-bot/src/infrastructure/templates/carta-certificacion.template.docx` | Marcado con 28 placeholders + 3 loops |
| Renderer | `apps/payworks-bot/src/infrastructure/templates/DocxCertificationLetterRenderer.ts` | Nuevo |
| Endpoint | `apps/payworks-bot/src/app/api/certificacion/carta/[id]/route.ts` | `?format=docx` (default) / `?format=pdf` / `?notas=` |
| UI | `apps/payworks-bot/src/app/resultados/[id]/page.tsx` | Botón `.docx` + textarea de notas |
| `@banorte/ui` | `packages/ui/src/{components,index}.ts` | Export de `TextArea` |

## Datos esperados en el `.docx` renderizado

Tras llamar al endpoint con un `id` de sesión válido, el archivo Word debe contener:

| Campo | Origen del valor |
|---|---|
| Fecha de portada / fecha header (2x) | `session.createdAt` formateada `DD/MM/YYYY` |
| Título portada + header | `CERTIFICACIÓN <integration display name>` + sufijo `CON 3D SECURE` / `CON CYBERSOURCE` si aplica |
| Nombre del comercio (3x: portada, intro, fila afiliación) | `afiliacion.getDisplayLabel()` o `session.merchantName` |
| Coordinador certificación | `session.coordinadorCertificacion` |
| RFC, número de cliente | `afiliacion.rfc` / `afiliacion.numeroCliente` |
| Número de afiliación | `firstTransaction.numero` |
| Esquema de integración | `PAYWORKS 2 - <product>` + sufijo de capas |
| Bullets fijos (modo, mensajería, lenguaje, tarjetas, giro, modo lectura, versión) | `session.lenguaje`, `session.versionAplicacion`, marcas únicas, etc. |
| Filas Matriz de pruebas | `session.results.map(...)` — una fila por transacción |
| URL subdominio | `session.urlSubdominio` |
| Notas dinámicas (transacciones validadas, usuario) | Derivadas de results |
| Manuales utilizados (loop) | Manual del producto + 3DSecure si aplica + Cybersource si aplica |
| Notas adicionales (loop) | `?notas=` query param parseado por líneas |
| Firma | `Dulce María Rivera Luna` / `Soporte Técnico Payworks` (hardcoded) |
| Folio | `session.folio` o `folioGenerator.generate(...)` |

## Test 1 — Smoke: endpoint default devuelve `.docx`

**Objetivo:** Verificar que `GET /api/certificacion/carta/[id]` sin parámetros
devuelve un `.docx` válido con headers correctos.

**Pasos:**
1. Levantar el dev server: `pnpm --filter payworks-bot dev`
2. Tener al menos una sesión de certificación en memoria (correr una desde la UI o
   recuperar `id` con `GET /api/certificacion/historial`)
3. Ejecutar:
   ```bash
   curl -sS -D /tmp/headers.txt -o /tmp/carta.docx \
     "http://localhost:3006/api/certificacion/carta/<sessionId>"
   ```

**Aceptación:**
- HTTP `200 OK`
- Header `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Header `Content-Disposition: attachment; filename="<folio>.docx"`
- `file /tmp/carta.docx` reporta `Zip archive data` (el `.docx` es un ZIP)
- Tamaño del archivo > 50 KB (el template base ronda 1.4 MB)

**Verificación de contenido (manual):**
1. Abrir el `.docx` en Word/Google Docs/LibreOffice
2. Confirmar visualmente:
   - Portada con título correcto y fecha
   - Header de páginas internas con título del producto
   - Tabla de afiliación con número y nombre poblados
   - Bullets de "Información general" todos completos
   - Tabla "Matriz de pruebas" con tantas filas como transacciones tenga la sesión
   - Sección "Notas:" con los 7 bullets fijos
   - Manuales como sub-bullets anidados
   - Firma final con folio + nombre + rol

**Verificación automatizada (regex):**
```bash
unzip -o /tmp/carta.docx -d /tmp/carta-out > /dev/null
python -c "
import re
with open('/tmp/carta-out/word/document.xml','r',encoding='utf-8') as f:
    xml = f.read()
text_only = re.sub(r'<[^>]+>', '|', xml)
remaining = re.findall(r'\{[^}]{1,40}\}', text_only)
print('Placeholders sin sustituir:', sorted(set(remaining)) if remaining else 'NONE')
"
```
Debe imprimir `NONE`. Si hay placeholders sin sustituir, el renderer no recibió ese
campo o el dato es `undefined` (el `nullGetter` lo deja vacío, no como `{tag}`).

## Test 2 — `?notas=` inyecta bullets adicionales

**Objetivo:** Confirmar que el query param `notas` con valores separados por `\n`
se traduce a bullets adicionales al final de la sección "Notas:".

**Pasos:**
1. Llamar al endpoint con dos notas:
   ```bash
   curl -sS -o /tmp/carta-notas.docx \
     "http://localhost:3006/api/certificacion/carta/<sessionId>?notas=$(printf 'Primera nota\nSegunda nota' | python -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.stdin.read()))')"
   ```
2. Extraer y leer el documento:
   ```bash
   unzip -o /tmp/carta-notas.docx -d /tmp/carta-notas-out > /dev/null
   ```

**Aceptación:**
- Las dos cadenas aparecen como bullets separados al final de la sección "Notas:",
  inmediatamente después del bullet "Antes de salir a producción..."
- Líneas en blanco o solo whitespace en el input se descartan (filtro `.trim().filter(Boolean)`)
- Si `?notas=` se omite o está vacío, el bullet de notas adicionales desaparece
  por completo (no queda un bullet vacío)

## Test 3 — `?format=pdf` preserva fallback legacy

**Objetivo:** Asegurar que el camino de PDF con jsPDF sigue funcionando para
clientes que aún lo usen.

**Pasos:**
```bash
curl -sS -D /tmp/headers-pdf.txt -o /tmp/carta.pdf \
  "http://localhost:3006/api/certificacion/carta/<sessionId>?format=pdf"
file /tmp/carta.pdf
```

**Aceptación:**
- HTTP `200 OK`
- Header `Content-Type: application/pdf`
- Header `Content-Disposition: attachment; filename="<folio>.pdf"`
- `file` reporta `PDF document, version 1.3, 3 page(s)` (la implementación jsPDF
  genera 3 páginas)

## Test 4 — Sesión inexistente devuelve 404

```bash
curl -sS -w "\n%{http_code}\n" \
  "http://localhost:3006/api/certificacion/carta/no-existe-id"
```

**Aceptación:**
- HTTP `404`
- Body: `{"success":false,"error":"Certificación no-existe-id no encontrada"}`

## Test 5 — Loop `filasMatriz` crece dinámicamente

**Objetivo:** Verificar que la fila plantilla del template se clona una vez por
cada elemento de `session.results`.

**Pasos:**
1. Generar una sesión con 1 transacción → descargar `.docx` → contar filas en la tabla
   "Matriz de pruebas"
2. Generar una sesión con 5 transacciones → repetir
3. Generar una sesión con 0 transacciones → repetir

**Aceptación:**
- Caso 1: 2 filas (encabezado + 1 fila de datos)
- Caso 2: 6 filas (encabezado + 5 filas de datos)
- Caso 3: 1 fila (solo encabezado, sin filas de datos)

## Test 6 — Loop `manualesUtilizados` por capas activas

**Objetivo:** Confirmar que la lista de manuales se construye según las capas
detectadas durante la sesión.

| Sesión | Layers detectadas en results | Manuales esperados |
|---|---|---|
| Solo VENTA básica | ninguna 3DS/CS | 1 manual del producto |
| VENTA con 3DS | THREEDS | 2 manuales (producto + 3DSecure_V1.4) |
| VENTA con 3DS + Cybersource | THREEDS + CYBERSOURCE | 3 manuales |

**Aceptación:** El sub-bullet anidado bajo "Manual utilizado para la integración:"
se repite tantas veces como manuales correspondan, con los nombres exactos
producidos por `IntegrationTypeValueObject.getConfigFileName()` y
`getManualVersion()`.

## Test 7 — Test UI (manual / Cypress)

**Objetivo:** Verificar el flujo completo desde la página de resultados.

**Pasos:**
1. Abrir `http://localhost:3006/resultados/<sessionId>` en Chrome
2. Scrollear hasta el card "Notas adicionales para la carta oficial"
3. Sin escribir nada en el textarea, click `Descargar Carta Oficial (.docx)`
4. Volver a la página, escribir 2 notas separadas por Enter
5. Click `Descargar Carta Oficial (.docx)` otra vez

**Aceptación:**
- Paso 3: descarga `<folio>.docx` sin notas adicionales en la sección Notas
- Paso 5: descarga `<folio>.docx` con las 2 notas como bullets al final de la
  sección Notas
- En ambos casos: el botón abre nueva pestaña con la URL del endpoint, la pestaña
  se cierra automáticamente al iniciar la descarga (comportamiento default del
  navegador para attachments)

## Test 8 — Type check del workspace

```bash
cd apps/payworks-bot
pnpm type-check
```

**Aceptación:** Exit `0`, sin errores. Cubre:
- Que el renderer importa correctamente `docxtemplater` y `pizzip`
- Que `CertificationLetterData.notasAdicionales` y `esquemaAgregador` están en el tipo
- Que `TextArea` se exporta correctamente desde `@banorte/ui`
- Que `e.target.value` está bien tipado en el `onChange`

## Issues conocidos / no cubiertos

- **Página de portada con Drawing**: Google Docs exportó la portada como text
  boxes WordprocessingML (caso bueno). Si en el futuro algún editor reconvierte
  la portada a imagen, los placeholders de portada (`{tipoProducto}`,
  `{fechaEmision}`, `{nombreComercio}`) dejarán de sustituirse. Smoke test:
  abrir el `.docx` rendered, confirmar que la portada muestra el título correcto
  y la fecha actual.
- **Sección LOGS por transacción**: el template original incluía LOGs como
  texto descriptivo. Se eliminó del template porque el certificador puede
  pegar logs a mano si los necesita. Si en el futuro se requiere automatizar,
  hace falta otro loop anidado (`{#logsTransacciones}` con sub-secciones 3DS /
  Servlet / PROSA).
- **El generador de PDF (`generateCertificationLetterPDF.ts`) sigue activo**
  como fallback `?format=pdf`. No se eliminó para no romper consumidores
  legacy. Si el equipo confirma que ya nadie usa PDF, se puede borrar tanto
  el archivo del generador como el branching del endpoint.

## Rollback

Si el `.docx` rompe en producción y el cliente necesita PDF inmediatamente:
- El endpoint sigue aceptando `?format=pdf` y devuelve el PDF generado por jsPDF.
- En la UI, cambiar el `onClick` del botón "Descargar Carta Oficial" a
  `window.open('/api/certificacion/carta/' + id + '?format=pdf', '_blank')`.
