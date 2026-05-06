# Prompt para Cowork — Generar `Documentacion_Aplicativo_Bot_Payworks_v3_0.docx`

Pega este prompt en Cowork **junto con dos archivos adjuntos**:

1. **`Documentacion_Aplicativo_Bot_Payworks_v2_0.docx`** (la versión 2.0 actual) — sirve como **template de formato**: portada Banorte café con triángulos, headers rojos, tablas con encabezado rojo, tipografías y márgenes corporativos.
2. **`documentacion-aplicativo-bot-payworks-v3.md`** (el `.md` que está en `docs/` de este repo) — contiene **todo el contenido textual** de la versión 3.0.

---

## Prompt (cópialo tal cual a Cowork)

> Hola Cowork, necesito que generes un nuevo documento Word `.docx` titulado **`Documentacion_Aplicativo_Bot_Payworks_v3_0.docx`** con el siguiente alcance:
>
> ### Formato (replicar del v2.0 adjunto)
>
> Usa el archivo adjunto `Documentacion_Aplicativo_Bot_Payworks_v2_0.docx` como **referencia de estilo visual y maquetación**:
>
> - **Portada Banorte**: fondo café con triángulos rojos/grises decorativos, logo Banorte arriba a la derecha, título en blanco grande "DOCUMENTACIÓN DEL APLICATIVO PAYWORKS CERTIFICATION BOT", subtítulo en cursiva *"Estado actual del aplicativo — evolución vs revisión v2.0"*, fecha y versión en esquina inferior derecha. **Cambia la fecha a `5 / Mayo / 2026` y la versión a `Versión 3.0`.**
> - **Encabezado de páginas internas**: línea roja arriba con texto pequeño rojo *"DOCUMENTACIÓN DEL APLICATIVO BOT DE CERTIFICACIÓN PAYWORKS"* alineado a la derecha (idéntico al v2.0).
> - **Pie de página**: número de página grande en color café/dorado a la izquierda, logo Banorte a la derecha (idéntico al v2.0).
> - **Notas verticales laterales**: la nota *"NOTA: ESTE DOCUMENTO ES DE CARÁCTER INFORMATIVO Y NO FORMA PARTE DE NINGÚN CONTRATO, SIN RESPONSABILIDAD PARA BANORTE"* en lateral derecho (idéntica al v2.0).
> - **Títulos de sección**: rojo Banorte en negrita cursiva (ej. `Sección 0 — Arquitectura del aplicativo`).
> - **Subtítulos**: rojo Banorte sin cursiva, más pequeños.
> - **Tablas**: encabezado con fondo rojo Banorte y texto blanco, filas alternas blancas, bordes finos grises.
> - **Cajas resaltadas**: marco rojo con fondo blanco para *"Cambios vs versión 2.0"*, *"Brecha documentada"*, *"Métricas finales (post iter 3)"*, *"Importante: Cómo enviar observaciones"*. Las métricas finales en marco verde si v2.0 las tiene así.
> - **Tipografías**: la misma fuente sans-serif que usa el v2.0 (parece Arial o equivalente).
>
> ### Contenido (tomar del .md adjunto)
>
> El archivo adjunto `documentacion-aplicativo-bot-payworks-v3.md` contiene **todo el texto, todas las tablas, todas las descripciones de diagramas**. Transcríbelo respetando:
>
> - La estructura de 16 secciones originales + **2 nuevas en v3.0** (Sección 17 — Carta `.docx`, Sección 18 — Folio por laboratorio).
> - **TOC en página 2** con las 18 secciones (marca las nuevas con un asterisco o nota *(nueva v3.0)*).
> - Tabla "Manuales utilizados" con **14 filas** (vs 12 en v2.0) — añadidos `agregadores-integradores-tp.json` y `layer-tokenizacion.json`.
> - Las **tablas de reglas A-J** con la columna *"Estado en aplicativo"* en verde para "Implementado", amarillo para "Parcial", verde más oscuro para "Resuelta iter 2/3".
> - **Cajas verdes** para "Métricas finales" en sección 13.
> - Las descripciones textuales antes de cada diagrama tal como están en el `.md`.
>
> ### Diagramas (10 en total, 8 originales + 2 nuevos)
>
> El `.md` incluye los 10 diagramas en formato **Mermaid**. Necesito que los **regeneres como diagramas visuales pulcros** integrados en el documento, manteniendo el estilo visual de los diagramas del v2.0 adjunto (cajas con esquinas redondeadas, colores Banorte, leyendas pequeñas debajo de cada caja).
>
> Los 10 diagramas son:
>
> 1. **Diagrama 1 — Las 4 familias de integración Payworks** *(idéntico al v2.0)*: 4 cajas (Familia 1 TNP directo verde · Familia 2 Ventana cifrada morada · Familia 3 Agregadores naranja · Familia 4 Tarjeta Presente amarillo) con sus productos dentro, capas transversales abajo, fuente al pie. **Añade AMEX** a las marcas soportadas en F1/F2/F4.
> 2. **Diagrama 2 — Flujo VCE cifrado AES** *(idéntico al v2.0)*: secuencia Browser → Cifrado AES-256/CTR → Payment.startPayment() → Ventana VCE modal → Servlet Payworks. Tabla de reglas VCE especiales debajo. Caja "Brecha documentada" en amarillo.
> 3. **Diagrama 3 — Flujo TNP directo** *(idéntico al v2.0)*: Comercio (SDK PHP/Java/.Net) → Servlet Payworks → PROSA. Caja "Bot de certificación — 5 pasos del CertifyCase" debajo.
> 4. **Diagrama 4 — Los 3 subesquemas de Agregadores** *(idéntico al v2.0)*: 3 columnas verticales ESQ_1 Tasa Natural / ESQ_4 Con AGP / ESQ_4 Sin AGP, con detección, campos clave, ejemplo observado (ZIGU / MUEVE CIUDAD / DLOCAL+OPENLINEA), capas activas.
> 5. **Diagrama 5 — Flujo Tarjeta Presente con tags EMV** *(idéntico al v2.0)*: Chip EMV → PinPad VeriFone → SDK Payworks → Servlet Payworks. Dos cajas paralelas: voucher físico (documental) y servlet.EMV_TAGS (real). Regla cruzada C12 abajo.
> 6. **Diagrama 6 — Capa 3D Secure: Envío vs Retorno** *(idéntico al v2.0 con un cambio menor)*: dos paneles verticales: sección `threeds` (envío, 13 campos) y sección `threedsResponse` (retorno, 7 campos). **Añade nota nueva**: "Regla cruzada C13 (H16) — REFERENCIA3D del primer POST = NUMERO_CONTROL del segundo POST (nuevo iter 3)".
> 7. **Diagrama 7 — Detector AN5822 con 3 flujos** *(idéntico al v2.0 con un cambio menor)*: árbol de decisión raíz "Transacción MasterCard detectada" → 3 ramas: firstCIT (PAYMENT_INFO=0) verde · subseqCIT (PAYMENT_INFO=3) morada · subseqMIT (PAYMENT_INFO=2) naranja. **Añade caja roja al pie**: "Cross-rule C14 (H17) — variables MIT/CIT prohibidas en productos no-recurrentes (nuevo iter 3)".
> 8. **Diagrama 8 — Pipeline de evaluación de campos (10 niveles)** *(idéntico al v2.0)*: flujo vertical con 10 cajas numeradas, colores graduados (gris, rojo PROHIBITED, rosa R_PCI, verde R, verde claro O, naranja FORBIDDEN, púrpura semántica, amarillo mustBeMasked).
> 9. **Diagrama 9 — Flujo de generación de carta `.docx`** *(NUEVO v3.0)*: cadena horizontal `UI Botón → GET /api/certificacion/carta/[id] → Gate P8 → CertificationLetterData (folio + filasMatriz + manualesUtilizados + notasAdicionales) → DocxCertificationLetterRenderer (pizzip + docxtemplater) → Buffer .docx → HTTP 200 con filename`. Caja al lado: "Template carta-certificacion.template.docx con 28 placeholders + 3 loops". Pie: "Cobertura E2E en 04-bundle-ecommerce-3ds-cybersource.cy.ts".
> 10. **Diagrama 10 — Árbol de folios por laboratorio** *(NUEVO v3.0)*: árbol con raíz `LaboratoryType` y 4 ramas: CAV/VIP (folios `VIP-…` y `VIPR-…`, padding 6) · ECOMM (10 prefijos: CE, CE3DS, CYB3D, AP, CYBEM, MOTO, CPP, VCE-3DS, etc.) · AGREGADORES_AGREGADOR (sufijos `A-CE`, `A-CP`, `A-CTLSSINTSEG`, `A-INTERSEG`) · AGREGADORES_INTEGRADOR (sufijos `I-CE`, `I-CP`, `I-CTLSSINTSEG`, `I-INTERSEG`). Pie: formato `{PREFIX}-{CONSECUTIVO_PADDED}_{AFILIACION}` con ejemplo `CE3DS-0003652_9885405`. Caja amarilla: "Pendiente: API_PW2_SEGURO + INTERREDES_REMOTO puros — bloqueado por Ramsses".
>
> ### Resaltados especiales
>
> - En la tabla de "Cambios vs versión 2.0" de la introducción, **resalta en negrita las 3 reglas nuevas A8 / H16 / H17**.
> - En la tabla de Sección 8 (Grupo H), las filas H16 y H17 deben tener un badge `(nuevo v3.0)` en rojo después del número.
> - En la tabla de Sección 1 (Grupo A), la fila A8 también con badge `(nuevo v3.0)` rojo.
> - Las secciones 17 y 18 deben tener un badge `(NUEVA EN V3.0)` rojo grande junto al título.
> - En la tabla de "Manuales utilizados" filas 13 y 14 con badge `(nuevo v3.0)`.
>
> ### Salida esperada
>
> Genera el archivo `Documentacion_Aplicativo_Bot_Payworks_v3_0.docx` listo para descargar. El documento debe tener aproximadamente **70-75 páginas** (vs 62 del v2.0, considerando las 2 secciones nuevas y los 2 diagramas nuevos).
>
> Si encuentras alguna inconsistencia entre el texto del `.md` y lo que pide el formato del v2.0, dame prioridad al `.md` para contenido y al v2.0 para formato visual.
>
> ¡Gracias!

---

## Notas para el usuario que ejecuta este prompt

- **Antes de pegarlo en Cowork**, asegúrate de adjuntar **ambos archivos** (`v2.0.docx` y `v3.md`).
- Si Cowork te genera un primer borrador con problemas, copia los errores específicos y pídele iteraciones puntuales (ej. "los diagramas 6 y 7 deben tener las notas nuevas marcadas en rojo").
- El `.md` source vive en `docs/documentacion-aplicativo-bot-payworks-v3.md` del repo y debe ser la **fuente autoritativa** para futuras revisiones (iter 4+). El `.docx` resultante es el entregable visual.
