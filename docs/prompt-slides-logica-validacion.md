# Prompt para generar slides/PDF — Lógica de validación del Bot de Certificación Payworks

> Copia el contenido de abajo en Cowork, Gamma, Claude, ChatGPT o la herramienta de generación de slides que prefieras. Produce una presentación técnica de 14-16 diapositivas explicando cómo el bot automatiza las reglas de validación de los manuales oficiales de Banorte Payworks.

---

## Prompt

```
Crea una presentación técnica de 14-16 diapositivas titulada
"Motor de Validación del Bot de Certificación Payworks — Lógica y trazabilidad
contra los Manuales Oficiales Banorte".

AUDIENCIA: Coordinadores de certificación Banorte (Ramsses Bautista y equipo) +
líderes técnicos de productos Payworks + auditores internos.
Nivel técnico: medio-alto, conocen los manuales pero no el código.

OBJETIVO: explicar con precisión CÓMO el bot interpreta los manuales oficiales
y traduce cada regla a validación automática sobre logs reales. Debe quedar
claro que el bot NO inventa reglas: cada validación tiene una referencia
directa al manual y a un campo del log.

IDIOMA: Español (es-MX). Tono profesional, directo, orientado a trazabilidad.

IDENTIDAD VISUAL:
- Paleta Banorte: rojo #EB0029, gris oscuro #323E48, gris medio #5B6670,
  fondo claro #EBF0F2.
- Tipografía: Gotham o Montserrat para títulos, Roboto para cuerpo.
- Diagramas con líneas limpias, íconos Lucide/Feather.
- Evitar fondos oscuros o elementos decorativos innecesarios.

ESTRUCTURA DE SLIDES:

═══════════════════════════════════════════════════════════════════
SLIDE 1 — PORTADA
═══════════════════════════════════════════════════════════════════
Título: "Motor de Validación del Bot de Certificación Payworks"
Subtítulo: "Lógica y trazabilidad contra los Manuales Oficiales Banorte"
Fecha: [actual]. Logo Banorte arriba derecha.

═══════════════════════════════════════════════════════════════════
SLIDE 2 — EL PROBLEMA QUE RESUELVE
═══════════════════════════════════════════════════════════════════
Título: "Validar una integración manualmente es lento y propenso a errores"

Columna izquierda — "Proceso manual actual":
- Coordinador lee logs servlet/PROSA/3DS/Cybersource línea por línea
- Compara campo por campo contra matriz impresa del manual
- 10 productos × ~30 campos × 7 transacciones × 2 marcas = 4,200 combinaciones
- 2-5 días por cada comercio certificado
- Errores de transcripción pueden aprobar integraciones no conformes

Columna derecha — "Con el bot":
- 10 productos soportados con matrices JSON versionadas
- 31 reglas de validación automáticas
- Validación en minutos
- Trazabilidad: cada FAIL cita campo + regla + manual de origen

═══════════════════════════════════════════════════════════════════
SLIDE 3 — CATÁLOGO OFICIAL SOPORTADO
═══════════════════════════════════════════════════════════════════
Título: "10 productos del catálogo oficial alineados a los manuales"

Tabla:
| # | Producto | Versión | Transacciones | Capas |
| 1 | Comercio Electrónico Tradicional | v2.5 | AUTH/PRE/POS/DEV/CAN/REV/VER | 3DS + Cybersource + AN5822 |
| 2 | MOTO (Mail/Telephone Order) | v1.5 | AUTH/PRE/POS/DEV/CAN/REV/VER | AN5822 CIT/MIT |
| 3 | Cargos Periódicos Post | v2.1 | VTA/DEV/CAN/REV | AN5822 |
| 4 | Ventana de Comercio Electrónico | v1.8 | VTA (JSON cifrado) | 3DS + Cybersource |
| 5 | Agregadores - Comercio Electrónico | v2.6.4 | 6 tipos | 3 esquemas + 3DS opc |
| 6 | Agregadores - Cargos Periódicos | v2.6.4 | 4 tipos | 3 esquemas + AN5822 |
| 7 | API PW2 Seguro (TP) | v2.4 | 9 tipos (incl. Cashback) | EMV |
| 8 | Interredes Remoto (TP) | v1.7 | 9 tipos | EMV |

Pie: "Cada producto → 1 archivo JSON de reglas versionables.
3D Secure y Cybersource son CAPAS TRANSVERSALES, no productos."

═══════════════════════════════════════════════════════════════════
SLIDE 4 — DEL MANUAL AL JSON DE REGLAS
═══════════════════════════════════════════════════════════════════
Título: "Cada regla del manual se traduce 1:1 a una entrada JSON"

Lado izquierdo (imagen/foto): fragmento de la tabla R/O/N/A de un manual oficial
con los encabezados "VENTA VISA | VENTA MC | CANCELACIÓN VISA | ..." y
filas como "ID_AFILIACION R R R R | MONTO R R N/A N/A".

Lado derecho (código formateado):
{
  "MERCHANT_ID": {
    "manualName": "ID_AFILIACION",
    "displayName": "ID Afiliación",
    "dataType": "numeric(15)",
    "ambiguous": false,
    "rules": {
      "AUTH_VISA": "R", "AUTH_MC": "R",
      "VOID_VISA": "R", "VOID_MC": "R",
      "REFUND_VISA": "R", ...
    }
  }
}

Nota al pie: "manualName es el nombre en español del manual;
logName (la clave) es el nombre real que aparece en los logs."

═══════════════════════════════════════════════════════════════════
SLIDE 5 — GLOSARIO ESPAÑOL ↔ INGLÉS
═══════════════════════════════════════════════════════════════════
Título: "Los manuales usan nombres en español; los logs usan nombres en inglés"

Tabla de mapeo (8-10 filas, una por campo clave):
| Manual (español) | Log real | Observación |
| ID_AFILIACION | MERCHANT_ID | Confirmado en logs ZIGU/OPENLINEA |
| USUARIO | USER | — |
| CLAVE_USR | (no se logea) | PCI-DSS: nunca logueado |
| MONTO | AMOUNT | — |
| MODO | MODE | Valores: PRD/AUT/DEC/RND |
| REFERENCIA | REFERENCE | Solo en respuesta |
| NUMERO_CONTROL | CONTROL_NUMBER | — |
| NUMERO_TARJETA | CARD_NUMBER | Enmascarada (****) |
| MODO_ENTRADA | ENTRY_MODE | MANUAL/CHIP/CONTACTLESS |
| IDIOMA_RESPUESTA | RESPONSE_LANGUAGE | ES/EN |

Pie: "Glosario vive en src/config/variable-glossary.json.
6 secciones: servlet, agregadores, an5822, threeds, cybersource, emv."

═══════════════════════════════════════════════════════════════════
SLIDE 6 — 8 NIVELES DE VALIDACIÓN POR CAMPO
═══════════════════════════════════════════════════════════════════
Título: "Cada campo pasa por hasta 8 niveles de validación en orden"

Diagrama vertical (flujo top → bottom):

1. PRESENCIA (R/O/N/A/OI)
   ↓ ¿campo existe y tiene valor?

2. CARACTERES PROHIBIDOS
   ↓ < > | \ { } [ ] " * ; : # $ % & ( ) = é ú ó ü

3. OMIT IF EMPTY
   ↓ ¿XID/CAVV vacíos? → debe omitirse

4. FIXED VALUE
   ↓ ¿VERSION_3D = "2"?

5. VALID VALUES (enum)
   ↓ ¿MODE ∈ {PRD, AUT, DEC, RND}?

6. MAX LENGTH
   ↓ ¿MERCHANT_ID ≤ 15 chars?

7. FORMAT (regex)
   ↓ ¿MONTO coincide con ^\d{1,16}(\.\d{1,2})?$ ?

8. MUST BE MASKED
   ↓ ¿CARD_NUMBER contiene *** ?

Resultado: PASS o FAIL con razón estructurada.

═══════════════════════════════════════════════════════════════════
SLIDE 7 — EJEMPLO REAL DE VALIDACIÓN — ZIGU (Esquema 1)
═══════════════════════════════════════════════════════════════════
Título: "Ejemplo: validación de transacción ZIGU VENTA MC"

Lado izquierdo — fragmento del log real:
********************************************************************************
[16/12/2025 08:24:57] SE RECIBIO POST HTTP DESDE LA IP: 66.23.212.68
CARD_NUMBER:          [542418******1734]
CMD_TRANS:            [AUTH]
MERCHANT_ID:          [9607773]
CONTROL_NUMBER:       [6535824458]
AMOUNT:               [19.97]
MODE:                 [PRD]
USER:                 [a9607773]
ENTRY_MODE:           [MANUAL]
...
********************************************************************************

Lado derecho — resultado de validación:
✓ MERCHANT_ID: R — PASS (9607773)
✓ USER: R — PASS (a9607773)
✓ CMD_TRANS: R — PASS (AUTH)
✓ MODE: R — PASS (PRD, valor permitido)
✓ AMOUNT: R — PASS (19.97, formato decimal válido)
✓ CARD_NUMBER: R — PASS (enmascarada con ****)
✓ ENTRY_MODE: R — PASS (MANUAL, valor permitido)
○ PASSWORD: N/A — ignorado (PCI-DSS no se logea)
○ SECURITY_CODE: N/A — ignorado (PCI-DSS)
○ CUSTOMER_REF1..5: O — optativos

Veredicto: APROBADO (14/14 obligatorios)

═══════════════════════════════════════════════════════════════════
SLIDE 8 — CAPAS TRANSVERSALES (3DS, Cybersource, AN5822)
═══════════════════════════════════════════════════════════════════
Título: "3D Secure y Cybersource son capas, no productos"

Diagrama: un producto central "Comercio Electrónico Tradicional"
con 4 círculos envolvéntolo:
- Servlet base (siempre)
- 3D Secure (opcional, para transacciones e-commerce)
- Cybersource (opcional, anti-fraude)
- AN5822 CIT/MIT (mandatorio para transacciones MC recurrentes)

Cada capa tiene su propio log y su propio JSON de reglas:
- layer-3ds.json → 13 campos (ECI, XID, CAVV, Version3D=2, Cert3D=03)
- layer-cybersource.json → 40+ campos (BillTo_*, Card_*, Decision...)
- layer-an5822.json → CIT (U/F-V/0) y MIT (8-R/F-V/2-3) separados

═══════════════════════════════════════════════════════════════════
SLIDE 9 — 3 ESQUEMAS DE AGREGADORES
═══════════════════════════════════════════════════════════════════
Título: "Los productos Agregadores se validan en 3 esquemas distintos"

Tabla comparativa:
| Esquema | Campos extra mandatorios | Ejemplo de comercio |
| Esquema 1 - Tasa Natural | Ninguno | ZIGU TECHNOLOGIES |
| Esquema 4 Sin AGP | 8 campos (SUB_MERCHANT, AGGREGATOR_ID, MERCHANT_MCC, ZIP_CODE, TERMINAL_CITY, ESTADO_TERMINAL, TERMINAL_COUNTRY, DOMICILIO_COMERCIO) | OPENLINEA PAGOS |
| Esquema 4 Con AGP | 2 campos (SUB_MERCHANT, AGGREGATOR_ID) | DLOCAL MEXICO |

Pie: "El bot detecta el esquema automáticamente según los campos
presentes en el log servlet del agregador."

═══════════════════════════════════════════════════════════════════
SLIDE 10 — VALIDACIONES CRUZADAS ENTRE CAPAS
═══════════════════════════════════════════════════════════════════
Título: "4 reglas cruzadas validan consistencia entre capas"

Lista con iconos:
1. POSTAUTH → AUTH_CODE
   "Una POSTAUTH requiere AUTH_CODE de la PREAUTH previa"

2. XID / CAVV omitIfEmpty (3DS)
   "Si están vacíos, no deben enviarse al POST de Payworks"

3. PROSA Campo 37 ↔ Servlet REFERENCIA
   "La REFERENCIA del servlet debe coincidir con el Campo 37 ISO 8583"

4. CONTROL_NUMBER + MERCHANT_ID únicos por sesión
   "No puede haber 2 transacciones con la misma combinación"

5. Decision Cybersource ∈ {ACCEPT, REVIEW, REJECT, ERROR}

═══════════════════════════════════════════════════════════════════
SLIDE 11 — RAZONES DE FAIL ESTRUCTURADAS
═══════════════════════════════════════════════════════════════════
Título: "Cada rechazo tiene razón trazable, no solo 'FAIL'"

Tabla:
| failReason | Significado | Ejemplo |
| missing | Campo R ausente | MERCHANT_ID no está en el log |
| empty | Campo R vacío | AMOUNT: [  ] |
| forbidden_chars | Caracteres prohibidos | CUSTOMER_REF1: "José<Luis>" |
| invalid_format | No coincide regex | AMOUNT: "1,500.00" (coma no válida) |
| invalid_value | Fuera del enum | MODE: "TEST" no está en PRD/AUT/DEC/RND |
| fixed_value_mismatch | Valor fijo distinto | VERSION_3D: "1" (esperado "2") |
| exceeds_max_length | Longitud excedida | TERMINAL_ID: 16 chars (máx 15) |
| not_masked | Tarjeta sin enmascarar | CARD_NUMBER: "4111111111111111" |
| should_be_omitted | Vacío con omitIfEmpty | XID: "" en log 3DS |
| cross_field | Inconsistencia entre capas | POSTAUTH sin AUTH_CODE previo |

═══════════════════════════════════════════════════════════════════
SLIDE 12 — FLUJO END-TO-END
═══════════════════════════════════════════════════════════════════
Título: "De la matriz a la carta oficial en minutos"

Diagrama horizontal con 6 cajas:

[1. Usuario sube]
 Matriz Excel +
 Logs (Servlet, PROSA, 3DS, Cyber) +
 CSV Afiliaciones +
 Coordinador + Lenguaje + URL
     ↓
[2. Parser extrae]
 Transacciones de matriz
 Campos de cada log
 Registros de afiliaciones
     ↓
[3. Motor valida]
 31 reglas × campo × transacción
 3 capas transversales
 Validaciones cruzadas
 Unicidad de sesión
     ↓
[4. Dashboard]
 Donut chart % aprobación
 Tabla por transacción
 Detalle por capa
 Card de afiliación
     ↓
[5. Carta PDF]
 Placeholders auto-rellenados
 Logs técnicos embebidos
 Código CE3DS-NNNN_AFIL
     ↓
[6. Entregable]
 PDF oficial al comercio

═══════════════════════════════════════════════════════════════════
SLIDE 13 — TRAZABILIDAD TOTAL
═══════════════════════════════════════════════════════════════════
Título: "Todo FAIL se puede justificar contra el manual oficial"

Mockup de la pantalla de resultados mostrando:
- Una transacción RECHAZADA
- Acordeón expandido con:
  * Campo: AMOUNT
  * Regla: R (Requerido)
  * Encontrado: Sí
  * Valor: "1,500.00"
  * Veredicto: FAIL
  * failReason: invalid_format
  * failDetail: "No coincide con formato esperado: ^\d{1,16}(\.\d{1,2})?$"
  * manualName: MONTO (Comercio Electrónico Tradicional v2.5, p.6)

Nota al pie: "Cada campo lleva el nombre del manual + página de origen.
Auditable al 100%."

═══════════════════════════════════════════════════════════════════
SLIDE 14 — COBERTURA ACTUAL
═══════════════════════════════════════════════════════════════════
Título: "31 reglas implementadas | 97% cobertura de manuales"

Barras horizontales con % por producto:
- Comercio Electrónico Tradicional: 95%
- MOTO: 95%
- Cargos Periódicos Post: 95%
- Ventana Comercio Electrónico: 98%
- Agregadores CE: 97%
- Agregadores CP: 98%
- API PW2 Seguro: 97%
- Interredes Remoto: 98%
- Layer 3DS: 95%
- Layer Cybersource: 98%
- Layer AN5822: 100%

Debajo — cuadro "Pendiente (3%)":
- AMEX fields opcionales (P10.1)
- MerchantDefinedData dinámicos Cybersource (P10.2)
- ValidValues enforcement strict/warning (P10.3)
- Detección automática CIT/MIT (P3.1)

═══════════════════════════════════════════════════════════════════
SLIDE 15 — PRÓXIMOS PASOS
═══════════════════════════════════════════════════════════════════
Título: "Lo que sigue con el equipo de Ramsses"

3 peticiones priorizadas:
1. Plantilla Word (.docx) de la carta de certificación → visual 100% idéntico
2. Schema real de NPAYW.AFILIACIONES → afinar parser CSV
3. Respuestas a las 13 preguntas documentadas en preguntas-ramsses.md

Línea de tiempo:
- Hoy: bot en 97% listo, 181 tests unitarios, demo funcional
- +1 semana con respuestas: 100% cobertura
- +2 semanas: deploy a staging Banorte

═══════════════════════════════════════════════════════════════════
SLIDE 16 — Q&A + CONTACTO
═══════════════════════════════════════════════════════════════════
Título grande: "¿Preguntas?"
- Repositorio: github.com/AlexMendozaPrado/Monorepo-banorte
- Documentación: docs/plan-certificacion-payworks.md
- Preguntas pendientes: docs/preguntas-ramsses.md
- Contacto: [email del equipo]

═══════════════════════════════════════════════════════════════════

INSTRUCCIONES PARA LA HERRAMIENTA DE SLIDES:
- Diagramas simples, sin clipart genérico
- Tablas con encabezado en rojo Banorte #EB0029
- Código formateado en monospace con sintaxis highlighting
- Iconos lineales tipo Lucide/Feather
- Cada slide debe caber en 1-2 minutos de explicación
- Total de duración oral: 20-25 minutos
- Si generas mockups de UI, inspírate en el diseño de Linear/Stripe
  (cards redondeadas, sombras sutiles)

ENTREGA: archivo PPTX o Google Slides editable.
```

---

## Cómo usar este prompt

1. **Copia todo el bloque de arriba (desde "Crea una presentación técnica..." hasta el final)**.
2. Pégalo en:
   - **Cowork / Gamma / Beautiful.ai** — directamente en su campo de prompt para generación de slides
   - **Claude (web)** o **ChatGPT** — pidiendo que genere el contenido slide por slide y que tú lo vacíes en PowerPoint
   - **Google Slides con extensión de AI** — GPT for Slides, Plus AI, etc.
3. Revisa los slides 4, 7 y 13 — ahí conviene **pegar screenshots reales** del bot corriendo (logs, pantalla de resultados, detalle por transacción). Hacen la presentación mucho más convincente.

## Notas

- El prompt es **autocontenido**: no depende de que la herramienta tenga acceso al repo.
- Los números de cobertura (97%, 181 tests) son los actuales del repo.
- Si Ramsses o el equipo quieren ver **código real**, añade una slide extra con un screenshot del JSON de `ecommerce-tradicional.json` + una de `FieldRequirement.ts`.
