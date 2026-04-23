# Payworks Certification Bot - Reglas de Validacion Implementadas

> Documento de conciliacion para comparar la logica implementada contra los manuales oficiales de integracion Banorte Payworks.
>
> **Actualizado: 2026-04-22** | Estado: **validado contra PDFs oficiales + auditoria iter 2 cerrada (P0 + P2 resueltos)**
>
> **Historial**:
> 1. Spec v5 cerrada al 100% (`ee40c16` → `18fdf1c`) — 9 commits
> 2. Validación campo por campo contra los 10 manuales oficiales (`a3abfb5` → `5cf3ffd`) — 9 commits
> 3. Auditoría iter 2 (`58ad282`) — P0 bloqueantes + P2 documentales pre-certificación

---

## Tabla de contenidos

1. [Objetivo del aplicativo](#1-objetivo-del-aplicativo)
2. [Arquitectura de validacion](#2-arquitectura-de-validacion)
3. [Catalogo de productos implementados](#3-catalogo-de-productos-implementados)
4. [Tipos de transaccion soportados](#4-tipos-de-transaccion-soportados)
5. [Capas de validacion (ValidationLayer)](#5-capas-de-validacion)
6. [Motor de evaluacion de campos (pipeline secuencial)](#6-motor-de-evaluacion-de-campos-pipeline-secuencial)
7. [Matrices R/O/N/A por producto](#7-matrices-rona-por-producto)
8. [Capa 3D Secure v1.4](#8-capa-3d-secure-v14)
9. [Capa Cybersource Direct v1.10](#9-capa-cybersource-direct-v110)
10. [Capa AN5822 CIT/MIT MasterCard (refactorizada en v5)](#10-capa-an5822-citmit-mastercard-refactorizada-en-v5)
11. [Esquemas de Agregadores + Anexo D](#11-esquemas-de-agregadores)
12. [Validaciones cruzadas entre campos (C1-C12 + rate limit + Anexo D)](#12-validaciones-cruzadas-entre-campos)
13. [Glosario de variables espanol-ingles](#13-glosario-de-variables-espanol-ingles)
14. [Parsers de logs](#14-parsers-de-logs)
15. [Parser de afiliaciones](#15-parser-de-afiliaciones)
16. [Generacion de carta de certificacion](#16-generacion-de-carta-de-certificacion)
17. [Flujo completo de certificacion](#17-flujo-completo-de-certificacion)
18. [Reglas de respuesta (response-rules)](#18-reglas-de-respuesta)
19. [Campos PCI-DSS y regla R_PCI](#19-campos-pci-dss-nunca-logueados)
20. [Campos marcados como ambiguos](#20-campos-marcados-como-ambiguos)
20-BIS. [Estado actual por JSON (validado contra PDFs)](#20-bis-estado-actual-por-json-validado-contra-pdfs-oficiales)
21. [Cobertura actual y brechas conocidas](#21-cobertura-actual-y-brechas-conocidas)
22. [Changelog del documento](#22-changelog-del-documento)

---

## 1. Objetivo del aplicativo

El **Payworks Certification Bot** automatiza el proceso manual de certificacion de integraciones de pago contra la plataforma Banorte Payworks. El flujo que reemplaza es:

1. El comercio envia una **matriz de pruebas** (Excel/CSV) con las transacciones ejecutadas en ambiente de certificacion.
2. El validador humano revisa campo por campo cada transaccion contra los **manuales oficiales de integracion** para verificar que los campos requeridos (R), opcionales (O) y no aplicables (N/A) se envian correctamente.
3. El validador contrasta los logs del **servlet Payworks** y del **autorizador PROSA** (ISO 8583) para confirmar que los valores coinciden.
4. Si aplica, valida capas adicionales: **3D Secure**, **Cybersource**, campos **AN5822 CIT/MIT MasterCard**.
5. Genera una **carta de certificacion oficial** (PDF) con el dictamen.

El bot automatiza los pasos 2-5: recibe los archivos, ejecuta las validaciones programaticas, y emite el dictamen con la carta PDF.

### Fuentes de reglas

Las reglas implementadas provienen de **10 manuales oficiales de integracion** + **5 logs de ejemplo reales**. Todos validados contra los PDFs en `C:\Users\fluid\Downloads\ConsolidadoManualesyLogs\`:

| # | Manual | Version | Fecha | Tipo | JSON implementado |
|---|---|---|---|---|---|
| 1 | Comercio Electronico Tradicional | **2.5** | 19-Jun-2025 | TNP | `ecommerce-tradicional.json` ✅ |
| 2 | MOTO (Mail Order / Telephone Order) | **1.5** | 19-Jun-2025 | TNP | `moto.json` ✅ |
| 3 | Cargos Periodicos Post | **2.1** | 19-Jun-2025 | TNP | `cargos-periodicos-post.json` ✅ |
| 4 | Ventana de Comercio Electronico (Cifrada) | **1.8** | 24-Mar-2026 | TNP | `ventana-comercio-electronico.json` ✅ |
| 5 | Comercio Electronico Agregadores y Aliados | **2.6.4** | 23-Ene-2026 | TNP | `agregadores-comercio-electronico.json` ✅ |
| 6 | Cargos Periodicos Agregadores | **2.6.4** | Ene-2026 | TNP | `agregadores-cargos-periodicos.json` ✅ |
| 7 | API PW2 Seguro | **2.4** | Marzo 2023 | Tarjeta Presente | `api-pw2-seguro.json` ✅ |
| 8 | Interredes Remoto | **1.7** | Julio 2025 | Tarjeta Presente | `interredes-remoto.json` ✅ |
| 9 | 3D Secure 2 (capa transversal) | **1.4** | 29-Oct-2024 | Capa | `layer-3ds.json` ✅ |
| 10 | Cybersource Direct (capa transversal) | **1.10** | 18-Ene-2021 | Capa | `layer-cybersource.json` ✅ |
| — | AN5822 CIT/MIT MasterCard (capa transversal) | consolidado | — | Capa | `layer-an5822.json` (cita 5 manuales) ✅ |
| — | Reglas de respuesta (consolidado) | — | — | — | `response-rules.json` (cita 4 manuales) ✅ |

Cada JSON declara en su `_meta`:
- `manualVersion` y `manualDate` del PDF oficial validado
- `_meta.note` con el contexto del producto
- `_meta.specSource` con el historial de la validación y los fixes aplicados

---

## 2. Arquitectura de validacion

```
                        +-----------------------+
                        |  Usuario sube archivos|
                        |  (matriz + logs + CSV)|
                        +-----------+-----------+
                                    |
                        +-----------v-----------+
                        | POST /api/certificacion|
                        |       /validar        |
                        +-----------+-----------+
                                    |
                        +-----------v-----------+
                        | RunCertificationUseCase|
                        |  (orquestador)        |
                        +-----------+-----------+
                                    |
                    +---------------+---------------+
                    |               |               |
            +-------v------+ +-----v------+ +------v-------+
            | MatrixParser | | LogParsers | | AfiliacionParser|
            | (Excel/CSV)  | | (Servlet,  | | (CSV/TXT)    |
            +--------------+ | PROSA,3DS, | +--------------+
                             | Cybersource)|
                             +-----+------+
                                   |
                        +----------v-----------+
                        | ValidateTransaction   |
                        | FieldsUseCase         |
                        | (por cada transaccion)|
                        +----------+-----------+
                                   |
               +-------------------+-------------------+
               |                   |                   |
      +--------v-------+  +-------v--------+  +-------v--------+
      | Servlet Layer  |  | 3DS Layer      |  | Cybersource    |
      | (siempre)      |  | (si aplica)    |  | Layer(si aplica)|
      +--------+-------+  +-------+--------+  +-------+--------+
               |                   |                   |
               +-------------------+-------------------+
                                   |
                        +----------v-----------+
                        | FieldRequirementVO    |
                        | (motor 8 niveles)     |
                        | por cada campo        |
                        +----------+-----------+
                                   |
                        +----------v-----------+
                        | CrossFieldValidator   |
                        | (reglas cruzadas)     |
                        +----------+-----------+
                                   |
                        +----------v-----------+
                        | CertificationSession  |
                        | (veredicto global)    |
                        +----------+-----------+
                                   |
                        +----------v-----------+
                        | Carta PDF (jsPDF)     |
                        +----------------------+
```

### Veredicto global

- Si **todas** las transacciones pasan: `APROBADO`
- Si **alguna** transaccion falla: `RECHAZADO`
- Si no hay transacciones: `PENDIENTE`

Logica: "peor caso gana" -- una sola transaccion rechazada invalida la certificacion completa.

---

## 3. Catalogo de productos implementados

| # | Clave interna | Display Name | Manual | Tipo | Capas soportadas |
|---|---|---|---|---|---|
| 1 | `ECOMMERCE_TRADICIONAL` | Comercio Electronico Tradicional | v2.5 | TNP | SERVLET, THREEDS, CYBERSOURCE, AN5822 |
| 2 | `MOTO` | MOTO (Mail Order / Telephone Order) | v1.5 | TNP | SERVLET, AN5822 |
| 3 | `CARGOS_PERIODICOS_POST` | Cargos Periodicos Post | v2.1 | TNP | SERVLET, AN5822 |
| 4 | `VENTANA_COMERCIO_ELECTRONICO` | Ventana de Comercio Electronico (Cifrada) | v1.8 | TNP | SERVLET, THREEDS, CYBERSOURCE, AN5822 |
| 5 | `AGREGADORES_COMERCIO_ELECTRONICO` | Agregadores - Comercio Electrónico | v2.6.4 | TNP | SERVLET, AGREGADOR, THREEDS, CYBERSOURCE, AN5822 |
| 6 | `AGREGADORES_CARGOS_PERIODICOS` | Agregadores - Cargos Periodicos | v2.6.4 | TNP | SERVLET, AGREGADOR, AN5822 |
| 7 | `API_PW2_SEGURO` | API PW2 Seguro (Tarjeta Presente) | v2.4 | TP | SERVLET, EMV |
| 8 | `INTERREDES_REMOTO` | Interredes Remoto (PinPad WiFi/LAN) | v1.7 | TP | SERVLET, EMV |

### Reglas por producto

- **Productos TNP (1-6)**: Validan campos en logs servlet con formato `NOMBRE: [valor]`
- **Productos TP (7-8)**: Adicionalmente validan campos EMV (TVR, TSI, AID, APN, AL, EMV_TAGS)
- **Solo Agregadores (5-6)**: Soportan 3 sub-esquemas (Esq.1, Esq.4 Sin AGP, Esq.4 Con AGP)
- **MOTO (2)**: NO soporta 3DS (canal telefonico, sin browser)
- **Cargos Periodicos Post (3)**: NO tiene PREAUTH/POSTAUTH (solo VTA/DEV/CAN/REV/VER)
- **Ventana CE (4)**: Variables en camelCase (merchantId, name, password...) en vez de MAYUSCULAS_SNAKE

---

## 4. Tipos de transaccion soportados

| Tipo | CMD_TRANS | Display | Pair PROSA | Solo TP? |
|---|---|---|---|---|
| `AUTH` | VTA | Venta | 0200/0210 | No |
| `PREAUTH` | PRE | Preautorizacion | 0200/0210 | No |
| `POSTAUTH` | POS | Postautorizacion | 0220/0230 | No |
| `REFUND` | DEV | Devolucion | 0220/0230 | No |
| `VOID` | CAN | Cancelacion | 0220/0230 | No |
| `REVERSAL` | REV | Reversa | 0220/0230 | No |
| `VERIFY` | VER | Verificacion | 0200/0210 | No |
| `CASHBACK` | CSH | Cashback | 0200/0210 | Si |
| `REAUTH` | REA | Reautorizacion | 0200/0210 | Si |

### Mapeo de PROSA (ISO 8583)

- **0200/0210**: Mensajes de autorizacion (AUTH, PREAUTH, VERIFY, REAUTH, CASHBACK)
- **0220/0230**: Mensajes financieros (POSTAUTH, VOID, REFUND, REVERSAL)

El parser PROSA busca el par correcto basado en el tipo de transaccion.

### Parsing de CMD_TRANS

El parser acepta multiples formatos de entrada para cada transaccion:

| Tipo | Acepta |
|---|---|
| AUTH | `VTA`, `VENTA`, `AUTH` |
| VOID | `CAN`, `CANCELACION`, `VOID` |
| REFUND | `DEV`, `DEVOLUCION`, `REFUND` |
| PREAUTH | `PRE`, `PREAUTORIZACION`, `PREAUTH` |
| POSTAUTH | `POS`, `POSTAUTORIZACION`, `POSTAUTH` |
| VERIFY | `VER`, `VERIFICACION`, `VERIFY` |
| REVERSAL | `REV`, `REVERSA`, `REVERSAL` |
| CASHBACK | `CSH`, `CASHBACK` |
| REAUTH | `REA`, `REAUTORIZACION`, `REAUTH` |

---

## 5. Capas de validacion

Cada producto soporta un conjunto de capas. La validacion es aditiva: la capa SERVLET siempre se ejecuta, y las demas se agregan segun el producto y la presencia de logs.

| Capa | Display | Descripcion | Productos que la soportan |
|---|---|---|---|
| `SERVLET` | Servlet | Campos base del servlet Payworks | Todos (1-8) |
| `THREEDS` | 3D Secure | Autenticacion 3D Secure 2 | 1 (Tradicional), 4 (Ventana CE), 5 (Agregadores CE) |
| `CYBERSOURCE` | Cybersource | Validacion fraude Cybersource Direct | 1 (Tradicional), 4 (Ventana CE) |
| `AGREGADOR` | Agregador | Campos adicionales de agregadores | 5 (Agregadores CE), 6 (Agregadores CP) |
| `EMV` | EMV | Campos de chip/contactless | 7 (API PW2), 8 (Interredes) |
| `AN5822` | AN5822 CIT/MIT | Mandato MasterCard CIT/MIT | 1-6 (todos los TNP) |

### Logica de activacion de capas

```
Para cada transaccion:
  1. SIEMPRE validar capa SERVLET
  2. SI producto.supportsLayer(THREEDS) Y existe log 3DS → validar capa THREEDS
  3. SI producto.supportsLayer(CYBERSOURCE) Y existe log Cybersource → validar capa CYBERSOURCE
  4. Capas AN5822, AGREGADOR, EMV se validan segun campos presentes en el JSON del producto
```

---

## 6. Motor de evaluacion de campos (pipeline secuencial)

Cada campo de cada transaccion se evalua a traves de un pipeline secuencial. Si alguno falla, se retorna inmediatamente con el motivo de fallo.

**Archivo**: `src/core/domain/value-objects/FieldRequirement.ts`

### Tipos de regla

| Regla | Significado | Comportamiento |
|---|---|---|
| `R` | Requerido | DEBE existir y NO estar vacio |
| `O` | Opcional | Puede no existir; si existe, se validan niveles siguientes |
| `OI` | Opcional si aplica | Igual que O (variante contextual) |
| `N/A` | No Aplica | Siempre pasa (no se valida) |
| `PROHIBITED` | **(v5)** Prohibido | Si aparece con valor no vacio → FALLA; si ausente → PASA |
| `R_PCI` | **(v5)** Requerido PCI, no logueable | Contra log: pasa silenciosamente (campos PCI-sensibles no deben aparecer en logs). Documentado para consumo futuro por MatrixValidator. |

**Proyeccion por marca** (v5): antes de invocar al evaluador, la aplicacion llama `resolveSpecForBrand(spec, brand)` que produce un `FieldSpec` efectivo con `validValues = spec.validValuesByBrand[brand]` si existe. El evaluador permanece agnostico a la marca — la aplicacion resuelve el contexto.

### Pipeline de evaluacion (orden de precedencia)

```
Entrada: (regla, campoEncontrado, valorCampo, especEfectiva)

NIVEL 1 - Regla N/A
  Si regla === 'N/A' -> PASA (fin)

NIVEL 2 - Regla PROHIBITED (v5)
  Si regla === 'PROHIBITED':
    Si campo encontrado con valor no vacio -> FALLA 'prohibited'
    Si ausente o vacio -> PASA

NIVEL 3 - Regla R_PCI (v5)
  Si regla === 'R_PCI' -> PASA silenciosamente
  (Los campos PCI nunca aparecen en logs. Cuando exista MatrixValidator
   el tipo se comportara como R contra la matriz del comercio.)

NIVEL 4 - Presencia requerida
  Si regla === 'R':
    Si campo NO encontrado -> FALLA 'missing'
    Si campo encontrado pero vacio/solo espacios -> FALLA 'empty'

NIVEL 5 - Campo opcional no encontrado
  Si campo NO encontrado -> PASA (opcional ausente es valido)

NIVEL 6 - OmitIfEmpty
  Si spec.omitIfEmpty === true Y campo encontrado Y valor vacio:
    -> FALLA 'should_be_omitted' ("Campo no debe enviarse vacio")

NIVEL 7 - Valor vacio (optional short-circuit)
  Si valor es falsy o solo espacios -> PASA

NIVEL 8 - Caracteres prohibidos
  Si spec.mustBeMasked NO es true:
    Probar contra FORBIDDEN_CHARS_REGEX
    Si hay match -> FALLA 'forbidden_chars' (detalle: char ofensor)
  (Campos enmascarados con * se saltan esta prueba)

NIVEL 9a - Valor fijo
  Si spec.fixedValue existe Y valor.trim() !== fixedValue:
    -> FALLA 'fixed_value_mismatch' ("Esperado: X, recibido: Y")

NIVEL 9b - Valores validos (enum)
  Si spec.validValues existe Y es no-vacio Y valor NO esta en la lista:
    -> FALLA 'invalid_value' ("Valor X no esta en [A, B, C]")

NIVEL 9c - Longitud maxima
  Si spec.maxLength existe Y longitud del valor > maxLength:
    -> FALLA 'exceeds_max_length' ("Longitud X excede maximo Y")

NIVEL 9d - Formato (regex)
  Si spec.format existe:
    Compilar regex; si regex invalido -> ignorar (no bloquear por config rota)
    Si regex no coincide -> FALLA 'invalid_format'

NIVEL 10 - Enmascaramiento
  Si spec.mustBeMasked === true Y valor NO contiene '*':
    -> FALLA 'not_masked' ("Tarjeta debe estar enmascarada")

-> Si llega aqui sin fallar: PASA
```

### Caracteres prohibidos (FORBIDDEN_CHARS_REGEX) — alineado a manual v5

```regex
/[<>|¡!¿?*+'\/\\{}[\]"¨;:,#$%&()=áéíóúÁÉÍÓÚñÑ]/
```

Caracteres bloqueados: `< > | ¡ ! ¿ ? * + ' / \ { } [ ] ¨ ; : , # $ % & ( ) =` + vocales acentuadas `á é í ó ú Á É Í Ó Ú` + `ñ Ñ`.

**Cambios v5** respecto a versiones previas:
- Removido `ü` (no esta listado como prohibido en los manuales vigentes).
- Agregado set oficial completo del Manual VCE v1.8 §7 + Ecommerce v2.6.4: vocales acentuadas de ambas cajas, `¡ ! ¿ ¨ ,`.
- Nombres validos como "MUEVE CIUDAD", "ECOFLOW", "PINGUINO" ahora pasan. Palabras con acentos (`CAFE`, `NIÑOS`, `MERIDA`) fallan correctamente.

**Fuente manual**: Ventana CE v1.8 p.7, Ecommerce v2.6.4, MOTO v1.5 p.8, 3DS v1.4 p.6.

**Excepcion**: Campos con `mustBeMasked: true` (como CARD_NUMBER) se saltan esta validacion porque el `*` del enmascaramiento dispararia un falso positivo.

**Pendiente**: variante relajada para Agregadores (permite `*` y `&` como separadores formato 7*14). Se introducira con Anexo D en el commit que lo wire completo.

### Motivos de fallo implementados

| Codigo | Descripcion | Origen |
|---|---|---|
| `missing` | Campo requerido no encontrado en el log | Pipeline nivel 4 |
| `empty` | Campo requerido encontrado pero vacio | Pipeline nivel 4 |
| `prohibited` | **(v5)** Campo prohibido presente con valor | Pipeline nivel 2 |
| `should_be_omitted` | Campo con omitIfEmpty encontrado vacio | Pipeline nivel 6 |
| `forbidden_chars` | Caracteres especiales prohibidos detectados | Pipeline nivel 8 |
| `fixed_value_mismatch` | Valor no coincide con valor fijo esperado | Pipeline nivel 9a |
| `invalid_value` | Valor fuera del dominio enumerado | Pipeline nivel 9b |
| `exceeds_max_length` | Valor excede longitud maxima permitida | Pipeline nivel 9c |
| `invalid_format` | Valor no coincide con patron regex | Pipeline nivel 9d |
| `not_masked` | Numero de tarjeta sin enmascarar | Pipeline nivel 10 |
| `cross_field` | Fallo en validacion cruzada entre campos | CrossFieldValidator |
| `duplicate` | Combinacion CONTROL_NUMBER+MERCHANT_ID duplicada | UniqueValidator |
| `rate_limit_exceeded` | **(v5)** Ventana de 60s excede 200 tx (Cargos Periodicos) | RateLimitValidator |
| `anexo_d_format` | **(v5)** SUB_MERCHANT no cumple formato 7*14 | AnexoDValidator |
| `anexo_d_chars` | **(v5)** Campo Agregadores con charset invalido (acentos, Ñ, puntuacion no permitida) | AnexoDValidator |
| `anexo_d_double_space` | **(v5)** Campo Agregadores con doble espacio | AnexoDValidator |
| `anexo_d_leading_space` | **(v5)** Campo Agregadores empieza con espacio | AnexoDValidator |

---

## 7. Matrices R/O/N/A por producto

Cada producto tiene un archivo JSON en `src/config/mandatory-fields/` con la matriz completa de campos. Los campos estan indexados por su **nombre en el log** (ingles) con alias al nombre del manual (espanol).

> **NOTA**: Las tablas individuales por producto (7.1-7.8) tienen el esquema de v4. El **estado actual en runtime** está en los JSONs y se documenta arriba — cada cambio crítico está blindado por asserts en `__tests__/unit/infrastructure/ProductConfigsV5.test.ts`.

### Cambios clave vs. v4 original (ya en runtime)

| Producto | Campo | Cambio vs v4 | Fuente |
|---|---|---|---|
| Ecommerce Tradicional | `MERCHANT_ID` | maxLen 15 → **7**, format `^\d{1,7}$` | Manual v2.5 p.6 |
| Ecommerce Tradicional | `TERMINAL_ID` | maxLen 15 → **10** | Manual v2.5 p.6 |
| Ecommerce Tradicional | `MARKETPLACE_TX` | **`PROHIBITED`** en MC/AMEX | Manual v2.5 p.8 (solo VISA) |
| Ecommerce Tradicional | `PASSWORD` / `EXP_DATE` / `SECURITY_CODE` | N/A → **`R_PCI`** | Manual v2.5 dice R, PCI no loggeable |
| Ecommerce Tradicional | `ID_GATEWAY` / `GROUP` / `PLAN_TYPE` / etc. | **REMOVIDOS** — no pertenecen a Tradicional | Solo existen en Agregadores v2.6.4 |
| MOTO | `TERMINAL_ID` | maxLen 15 → **10** | Manual v1.5 p.6 |
| MOTO | `PAYMENT_NUMBER` | rename a **`PAYMENTS_NUMBER`** | Manual v1.5 p.11 (logName oficial) |
| MOTO | `GROUP` | **REMOVIDO** | No existe en Manual v1.5 |
| Cargos Periodicos Post | `SECURITY_CODE` / `ID_GATEWAY` | **REMOVIDOS** | Manual v2.1 p.6-8 no los lista |
| Cargos Periodicos Post | `BATCH` | rename a **`GROUP`** | Manual v2.1 p.8 (logName oficial) |
| Cargos Periodicos Post | `CUSTOMER_REF3` | O → **R 20** ("Número de contrato") | Manual v2.1 p.7 |
| VCE | `merchantCity` | maxLen 13 → **40** | Manual v1.8 p.8 |
| VCE | `amount` | maxLen 21 → **15** | Manual v1.8 p.8 (Numérico 15 total) |
| VCE | `mode.validValues` | [PRD,AUT,DEC,RND] → **[PRD, AUT]** | Manual v1.8 p.8 |
| VCE | Q6 MSI | `initialDeferment` + `paymentsNumber` + `planType` | Manual v1.8 p.11 |
| Agregadores CE | **Esquemas 4 CON/SIN AGP** | **DESINVERTIDOS**: CON_AGP=2 campos, SIN_AGP=8 campos | Manual v2.6.4 p.15-17 |
| Agregadores CE | `CUSTOMER_REF5` | O → **R** ("Identificador del Agregador") | Manual v2.6.4 p.9 |
| Tradicional / MOTO / Agregadores CE | `CUSTOMER_REF3` | R 20 → **O 30** (es "Dato para uso exclusivo del cliente" en estos 3 productos) | Manual Tradicional v2.5 Anexo C, MOTO v1.5 Anexo C, Agreg.CE v2.6.4 p.9 |
| Cargos Post / Agregadores CP | `CUSTOMER_REF3` | → **R 20** ("Número de contrato del Tarjetahabiente con el comercio") | Manual Cargos Post v2.1 p.7, Agreg.CP v2.6.4 p.8 |
| Agregadores CP | Esquemas 4 CON/SIN AGP | **DESINVERTIDOS** igual que CE | Manual v2.6.4 |
| API PW2 Seguro, Interredes | `TVR/TSI/AID/APN/AL` | Removidos de `servlet` → `emvVoucher` | Anexo V: son outputs del SDK, no envío |
| API PW2 Seguro, Interredes | `EMV_TAGS` | Único campo EMV de envío real en `servlet` | Anexo V |
| API PW2 Seguro, Interredes | `BATCH` | rename a **`GROUP`** | Manual oficial |
| API PW2 Seguro, Interredes | `PASSWORD` | N/A → `R_PCI` | Manual v2.4/v1.7 Anexo V dice R |
| Interredes | `CMD_TRANS` | validValues extendido a **13 opciones** | Manual v1.7 Anexo III |
| **Todos los TNP** | `CUSTOMER_REF2` | maxLen 30 → **16** | Todos los manuales |
| **Todos los TNP** | `RESPONSE_LANGUAGE` | validValues `[ES, EN, 01, 02]` → **`[ES, EN]`** | Todos los manuales |
| **Todos los TNP** | `PASSWORD` / `EXP_DATE` / `SECURITY_CODE` | N/A/O → **`R_PCI`** en VENTA/PREAUT | Manual dice R, PCI no loggeable |
| 3DS | `ECI` | validValues globales → **`validValuesByBrand`** (VISA/AMEX: [05,06,07], MC: [01,02]) | Manual 3DS v1.4 |
| 3DS | `CERTIFICACION_3D` / `STATUS_3D` | **separados** envío vs retorno | Bug histórico corregido |
| Cybersource | `Card_cardType` | validValues `[001, 002, 003]` → **`[001, 002]`** (sin AMEX) | Manual v1.10 |
| Cybersource | `MerchantID` | variable → **fixedValue `"banorteixe"`** | Manual v1.10 |
| AN5822 | 2 flujos (CIT/MIT) → **3 flujos** | firstCIT / subseqCIT / subseqMIT | Mandato MasterCard |
| AN5822 | `IND_PAGO` | `8` → **`U`** (Ecommerce/MOTO/VCE/Agreg.CE) o **`R`** (Cargos Periódicos + Agreg.CP) | 5 manuales TNP |
| AN5822 | `COF` | nuevo campo | MC AN5822 en Cargos Periódicos |
| response-rules | `PAYW_RESULT.validValues` | agregado **`Z`** (Reversa automática por timeout) | Manual MOTO v1.5 p.5 |
| response-rules | `AGGREGATOR_REF` → **`ID_AGREGADOR`** | rename (logName oficial) | Manual Agregadores |

### 7.1 Comercio Electrónico Tradicional (v2.5)

**Archivo**: `ecommerce-tradicional.json`
**Estado detallado**: ver §20-BIS.1 para el inventario campo a campo alineado al PDF oficial v2.5 (19-Jun-2025).

- Transacciones: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL, VERIFY × VISA/MC/AMEX = 21 combinaciones.
- Capas activas: Servlet + 3DS + Cybersource + AN5822.
- Campos PCI (R_PCI): `PASSWORD`, `EXP_DATE`, `SECURITY_CODE`.
- Mandatos implementados: AN5822 (3 flujos vía `layer-an5822`), Marketplace VISA (`MARKETPLACE_TX` PROHIBITED en MC/AMEX), AN7110 (ID_MAC retorno).
- **Ver `ecommerce-tradicional.json` para la matriz R/O/N/A/PROHIBITED/R_PCI completa por transacción y marca.** Los valores están blindados por asserts en `__tests__/unit/infrastructure/ProductConfigsV5.test.ts`.

### 7.2 MOTO (v1.5)

**Archivo**: `moto.json`

Misma estructura que Tradicional **sin capas 3DS ni Cybersource** (canal telefónico, sin browser).

Diferencias clave:
- NO soporta 3D Secure (canal telefónico sin navegador del tarjetahabiente)
- NO soporta AMEX (solo VISA/MC)
- AN5822 para MC: ver `layer-an5822.json._meta.productMapping.MOTO` — 3 flujos (`firstCIT`/`subseqCIT`/`subseqMIT`) con `PAYMENT_IND=U`, `PAYMENT_INFO`=0/3/2 respectivamente. MOTO **no usa** `COF` (exclusivo de Cargos Periódicos).
- Transacciones: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL, VERIFY × VISA/MC

### 7.3 Cargos Periódicos Post (v2.1)

**Archivo**: `cargos-periodicos-post.json`
**Estado detallado**: ver §20-BIS.3 para el inventario campo a campo alineado al PDF oficial v2.1 (19-Jun-2025).

- Transacciones: AUTH, REFUND, VOID, REVERSAL, VERIFY × VISA/MC = 10 combinaciones (sin AMEX/PREAUT/POSTAUT).
- Capas activas: Servlet + AN5822.
- Campo distintivo: `CUSTOMER_REF3` R 20 ("Número de contrato" — sí es del manual).
- Removidos v5: `SECURITY_CODE` (cargos recurrentes no piden CVV), `ID_GATEWAY` (pertenece a Agregadores).
- AN5822: `PAYMENT_IND=R` (Recurrente), `COF=4` en subseqMIT. Rate limit 200 tx/min.
- **Ver `cargos-periodicos-post.json` para la matriz completa.** Blindado por `ProductConfigsV5.test.ts`.

### 7.4 Ventana de Comercio Electrónico Cifrada (v1.8)

**Archivo**: `ventana-comercio-electronico.json`
**Estado detallado**: ver §20-BIS.4 para el inventario campo a campo alineado al PDF oficial v1.8 (24-Mar-2026).

- Transacciones: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL × VISA/MC/AMEX = 18 combinaciones.
- Capas activas: Servlet + 3DS + Cybersource + AN5822.
- Formato de nombres: **camelCase** (merchantId, customerRef1-5 — distinto de otros manuales).
- Distintivos: `password` R (viaja cifrado AES); `merchantCity` maxLen 40; `mode.validValues=[PRD, AUT]`; `amount` maxLen 15.
- Tokenización: `usarTokenizacion`, `idUsrComercio`, `correoUsrComercio`.
- **Ver `ventana-comercio-electronico.json` para la matriz completa.** Blindado por `ProductConfigsV5.test.ts`.

### 7.5 Agregadores - Comercio Electrónico (v2.6.4)

**Archivo**: `agregadores-comercio-electronico.json`
**Estado detallado**: ver §20-BIS.5 para el inventario campo a campo alineado al PDF oficial v2.6.4 (23-Ene-2026).

- Transacciones: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL × VISA/MC = 12 combinaciones (sin AMEX).
- Capas activas: Servlet + Agregador + 3DS + Cybersource + AN5822.
- subEsquemas (corregidos en v5): `ESQ_1` (sin campos extra), `ESQ_4_CON_AGP` (2 campos), `ESQ_4_SIN_AGP` (8 campos).
- Distintivos: `CUSTOMER_REF5` R ("Identificador del Agregador"); `MARKETPLACE_TX` PROHIBITED en MC/AMEX; `ID_GATEWAY` para Gateway 7118 MC.
- **Ver `agregadores-comercio-electronico.json` para la matriz completa.** Blindado por `ProductConfigsV5.test.ts`.

### 7.6 Agregadores - Cargos Periódicos (v2.6.4)

**Archivo**: `agregadores-cargos-periodicos.json`
**Estado detallado**: ver §20-BIS.6 para el inventario campo a campo alineado al PDF oficial v2.6.4 (Ene-2026).

- Transacciones: AUTH, REFUND, VOID, REVERSAL × VISA/MC = 8 combinaciones (sin AMEX/PREAUT/POSTAUT).
- Capas activas: Servlet + Agregador + AN5822.
- Mismos subEsquemas que Agregadores CE.
- Distintivos: `CUSTOMER_REF3` R 20 y `CUSTOMER_REF5` R 30. AN5822 con `PAYMENT_IND=R`, `COF=4` en subseqMIT. Rate limit 200 tx/min. Anexo D oficial en manual p.36.
- Removidos: `SECURITY_CODE`, `BATCH`→`GROUP`.
- **Ver `agregadores-cargos-periodicos.json` para la matriz completa.** Blindado por `ProductConfigsV5.test.ts`.

### 7.7 API PW2 Seguro - Tarjeta Presente (v2.4)

**Archivo**: `api-pw2-seguro.json`
**Estado detallado**: ver §20-BIS.7 para el inventario campo a campo alineado al PDF oficial v2.4 (Mar-2023) + Anexo V.

- Transacciones (Anexo V Tabla 8): 13 tipos incluyendo VENTA, CASHBACK, VENTA_FORZADA, PREAUT, REAUT, POSTAUT, DEVOLUCION, REVERSA, CIERRE_LOTE, VERIFICACION, SUSPENSION, REACTIVACION, CIERRE_AFILIACION × VISA/MC/AMEX.
- Capas activas: Servlet + EMV (no 3DS, no AN5822 — es Tarjeta Presente).
- Separación crítica: `EMV_TAGS` (único campo EMV de envío real, en `servlet`) vs `TVR/TSI/AID/APN/AL` (tags EMV documentales outputs del SDK, en `emvVoucher` — no se validan contra log).
- Brechas: ~13 variables del Anexo V pendientes de agregar cuando haya logs reales (CASHBACK_AMOUNT, PAGO_MOVIL, AUTH_CODE, BANROTE_URL, TRANS_TIMEOUT, Q6 MSI, RESPONSE_LANGUAGE, QPS, CUSTOMER_REF2-5).
- **Ver `api-pw2-seguro.json` para la matriz completa.**

### 7.8 Interredes Remoto (v1.7)

**Archivo**: `interredes-remoto.json`
**Estado detallado**: ver §20-BIS.8 para el inventario campo a campo alineado al PDF oficial v1.7 (Jul-2025) + Anexos I-VII.

- Transacciones (Anexo III): 13 tipos incluyendo OBTENER_LLAVE, CASHBACK, DEVOLUCION_CLIENTE, VENTA_CON_VALIDACION, CANCELAR + estándares × VISA/MC/AMEX.
- Capas activas: Servlet + EMV.
- Distintivos: campo `PIN_REQUESTED` nuevo; `errorCodes` del Anexo VI (usado por regla cruzada C12).
- Mismos fixes que API PW2 Seguro: PASSWORD→R_PCI, BATCH→GROUP, tags EMV en `emvVoucher`.
- **Ver `interredes-remoto.json` para la matriz completa.**

---

## 8. Capa 3D Secure v1.4

**Archivo**: `layer-3ds.json`
**Aplica a**: Tradicional, Ventana CE, Agregadores CE (este ultimo fue agregado en v5 — gap `SUPPORTED_LAYERS` corregido)

> **v5 — cambios criticos**:
> - `CERTIFICACION_3D` (envio, `fixedValue="03"`) y `STATUS_3D` (retorno, valores `200` etc.) ahora estan **separados** en secciones distintas del JSON (`threeds` vs `threedsResponse`). Antes se confundian y causaban el bug "manual dice 200, log dice 03".
> - **ECI tiene `validValuesByBrand`**: VISA/AMEX → `[05, 06, 07]`, MC → `[01, 02]`. El `validValues` global sigue existiendo como fallback. La aplicacion proyecta al subset correcto por marca via `resolveSpecForBrand`.
> - 13 campos nuevos de envio agregados: `FORWARD_PATH`, `REFERENCE3D`, `CITY`, `COUNTRY`, `EMAIL`, `NAME`, `LAST_NAME`, `POSTAL_CODE`, `STATE`, `STREET`, `MOBILE_PHONE`, `THREED_VERSION`, `CREDIT_TYPE`.
> - `STATUS_3D` tiene tabla completa de 40+ codigos en `validValues`.

### Campos pre-3DS (entrada al servicio 3DS)

| Campo (logName) | Manual (ES) | AUTH | PREAUTH | POSTAUTH |
|---|---|---|---|---|
| Card | NUMERO_TARJETA | R | R | R |
| Total | MONTO | R | R | R |
| CardType | MARCA_TARJETA | R | R | R |
| MerchantId | ID_AFILIACION | R | R | R |
| MerchantName | NOMBRE_COMERCIO | R | R | R |
| MerchantCity | CIUDAD_COMERCIO | R | R | R |

Nota: `Card` tiene `mustBeMasked: true`, `CardType` tiene `validValues: [VISA, MASTERCARD, AMEX]`

### Campos post-3DS (resultado de autenticacion, se envian a Payworks)

| Campo (logName) | Manual (ES) | AUTH | PREAUTH | POSTAUTH | Valor fijo | validValues | omitIfEmpty |
|---|---|---|---|---|---|---|---|
| Cert3D | ESTATUS_3D | R | R | R | 03 | | |
| ECI | ECI | R | R | R | | 01, 02, 05, 06, 07 | |
| XID | XID | R(VISA/AMEX), N/A(MC) | R(VISA/AMEX), N/A(MC) | R(VISA/AMEX), N/A(MC) | | | true |
| CAVV | CAVV | R | R | R | | | true |
| Version3D | VERSION_3D | R | R | R | 2 | | |
| UCAF | UCAF | N/A(VISA), O(MC) | N/A(VISA), O(MC) | N/A(VISA), O(MC) | | | |

### Reglas especiales 3DS implementadas

1. **`CERTIFICACION_3D` = `"03"`** (fixedValue, envío): El campo de envío hacia Payworks siempre debe ser `"03"` (indicador de que la certificación 3DS 2.0 está activa).
   - **Histórico**: hasta v4 había un único campo `"3D_STATUS"` que mezclaba el valor de envío (03) con el de retorno (200=autenticación exitosa, 201-448=otros códigos). Esto causaba falsos rechazos porque la validación no sabía contra qué dominio comparar.
   - **Resuelto en v5**: el JSON `layer-3ds.json` separa ahora `threeds.CERTIFICACION_3D` (envío, `fixedValue="03"`) y `threedsResponse.STATUS_3D` (retorno, `validValues=[200, 201, 202, 421, 422, 423, ...]` — 40+ códigos del Anexo D del manual VCE v1.8).
   - Blindado por test: `ProductConfigsV5.test.ts` → `CERTIFICACION_3D en envío con fixedValue 03 (no confundir con STATUS_3D de retorno)` y `STATUS_3D en retorno (no en envío)`.

2. **Version3D = "2"** (fixedValue): Siempre la version 2 del protocolo

3. **XID solo para VISA/AMEX**: MasterCard no retorna XID (campo es N/A para MC)

4. **XID y CAVV con omitIfEmpty**: Si el servicio 3DS retorna valor nulo o blanco, NO se debe enviar el campo al POST de Payworks. Si el campo esta presente pero vacio, el motor de validacion lo marca como `should_be_omitted`.

5. **ECI valores permitidos**: 05 (VISA autenticacion exitosa), 06 (VISA intento), 07 (VISA sin autenticacion), 01 (MC autenticacion exitosa), 02 (MC intento)

---

## 9. Capa Cybersource Direct v1.10

**Archivo**: `layer-cybersource.json`
**Aplica a**: Tradicional, Ventana CE, **Agregadores CE** (agregado en v5 — gap `SUPPORTED_LAYERS` corregido en `IntegrationType.ts`)

> **v5 — cambios criticos**:
> - `Card_cardType` `validValues` reducido a `["001", "002"]` (solo VISA y MasterCard). **AMEX ya no aplica** — Cybersource Banorte no soporta cardType `"003"`.
> - `MerchantID` tiene `fixedValue: "banorteixe"`.
> - `BillTo_ipAddress` ahora es `R` (era O en versiones previas segun manual v1.6+).
> - Regla cruzada **C11a**: `ID_CYBERSOURCE` del servlet debe coincidir con `requestID` de Cybersource.
> - Regla cruzada **C11b**: BIN (primeros 6 de `Card_accountNumber`, tolerante a masking con `*`) debe ser consistente con `Card_cardType`.

### Campos BillTo (direccion de facturacion)

| Campo | Regla | maxLen | Notas |
|---|---|---|---|
| BillTo_firstName | R | | |
| BillTo_lastName | R | | |
| BillTo_street | R | | |
| BillTo_streetNumber | R | | |
| BillTo_streetNumber2 | O | | |
| BillTo_street2Col | R | | |
| BillTo_street2Del | R | | |
| BillTo_city | R | | |
| BillTo_state | R | | |
| BillTo_country | R | | |
| BillTo_phoneNumber | R | | |
| BillTo_postalCode | R | | |
| BillTo_email | O | | |
| BillTo_customerID | O | | |
| BillTo_customerPassword | O | | |
| BillTo_dateOfBirth | O | | |
| BillTo_hostname | O | | |
| BillTo_ipAddress | R | | |

### Campos Card (datos de tarjeta)

| Campo | Regla | validValues | Notas |
|---|---|---|---|
| Card_accountNumber | R | | |
| Card_cardType | R | 001, 002 | 001=VISA, 002=MC |
| Card_expirationMonth | R | | |
| Card_expirationYear | R | | |

### Campos de identificacion

| Campo | Regla |
|---|---|
| DeviceFingerprintID | R |
| Name | R |
| Password | R |
| MerchantNumber | R |
| TerminalId | R |
| OrderId | R |

### Campos ShipTo (direccion de envio) - todos O

ShipTo_firstName, ShipTo_lastName, ShipTo_street, ShipTo_streetNumber, ShipTo_city, ShipTo_state, ShipTo_country, ShipTo_postalCode, ShipTo_phoneNumber, ShipTo_shippingMethod, ShipTo_email

### Campos de compra

| Campo | Regla | validValues |
|---|---|---|
| PurchaseTotals_currency | R | MXN, USD |
| PurchaseTotals_grandTotalAmount | R | |

### Campos de respuesta Cybersource

| Campo | Regla | validValues |
|---|---|---|
| decision | R | ACCEPT, REVIEW, REJECT, ERROR |
| reasonCode | R | 100, 101, 102, 110, 150, 151, ... (60+ codigos) |
| afsReply_afsResult | O | |

---

## 10. Capa AN5822 CIT/MIT MasterCard (refactorizada en v5)

**Archivos**: `src/config/mandatory-fields/layer-an5822.json`, `src/core/domain/services/An5822FlowDetector.ts`, `src/core/domain/services/An5822Validator.ts`, `src/core/domain/value-objects/An5822Flow.ts`
**Aplica a**: productos TNP (Ecommerce, MOTO, Cargos Periodicos Post, VCE, Agregadores CE, Agregadores CP), solo marca MC, excluye VOID/REVERSAL
**No aplica a**: productos TP (API PW2 Seguro, Interredes Remoto), VISA, AMEX, tipos VOID/REVERSAL.

### Bug legacy corregido

v4 tenia un solo modelo "CIT/MIT" de 2 flujos y aceptaba `IND_PAGO=8` (valor inventado, no existe en manuales). Tambien usaba `U` como valor uniforme sin diferenciar entre Ecommerce y Cargos Periodicos.

v5 modela los **3 flujos oficiales** y `IND_PAGO=8` queda rechazado con `invalid_value`.

### 3 flujos del mandato

| Flujo | Significado |
|---|---|
| `firstCIT` | Primera transaccion donde el comercio almacena credenciales con autorizacion explicita del tarjetahabiente |
| `subseqCIT` | Transaccion subsecuente iniciada por el cliente (click explicito, ej. autocompletado) |
| `subseqMIT` | Transaccion subsecuente iniciada por el comercio (cargo automatico) |

### Valores esperados por producto y flujo

| Producto | firstCIT | subseqCIT | subseqMIT |
|---|---|---|---|
| Ecommerce Tradicional | `IND_PAGO=U, TIPO_MONTO∈[V,F], INFO_PAGO=0` | `U, [V,F], 3` | `U, [V,F], 2` |
| MOTO | `U, [V,F], 0` | `U, [V,F], 3` | `U, [V,F], 2` |
| VCE | `U, [V,F], 0` | `U, [V,F], 3` | `U, [V,F], 2` |
| Agregadores CE | `U, [V,F], 0` | `U, [V,F], 3` | `U, [V,F], 2` |
| **Cargos Periodicos Post** | **`R`**, `[F,V], 0`, sin COF | (no aplica) | `R, [F,V], 2, COF=4` |
| **Agregadores CP** | **`R`**, `[F,V], 0`, sin COF | (no aplica) | `R, [F,V], 2, COF=4` |

Fuente: `layer-an5822.json` `_meta.productMapping`.

### Detector de flujo (`An5822FlowDetector`)

```
Entrada: { declaredFlow, observedValues, brand, transactionType, product }

1. Si brand != MC                           -> NOT_APPLICABLE (silencioso)
2. Si transactionType in {VOID, REVERSAL}   -> NOT_APPLICABLE (silencioso)
3. Si product in {API_PW2_SEGURO, INTERREDES_REMOTO} -> NOT_APPLICABLE
4. Si matriz declaro flujo_an5822:
     Si observacion contradice (PAYMENT_INFO distinto) -> FAIL C10
     Retornar declaredFlow
5. Si no hay declaracion:
     Inferir por PAYMENT_INFO: 0->firstCIT, 3->subseqCIT, 2->subseqMIT
     Emitir warning recomendando columna flujo_an5822
6. Sin declaracion ni inferencia posible -> NOT_APPLICABLE con warning
```

### Validator (`An5822Validator`)

Compara los 4 campos observados contra el mapping producto/flujo. Emite `An5822FieldFailure` por cada discrepancia:

| Campo | Fail reason si difiere |
|---|---|
| `PAYMENT_IND` (IND_PAGO) | `invalid_value` o `missing` |
| `AMOUNT_TYPE` (TIPO_MONTO) | `invalid_value` o `missing` |
| `PAYMENT_INFO` (INFO_PAGO) | `invalid_value` o `missing` |
| `COF` | `invalid_value` / `missing` en Cargos Periodicos MIT; `prohibited` en productos donde no aplica |

### Matriz Excel: columna `flujo_an5822` (v5)

El parser `ExcelMatrixParser` reconoce aliases tolerantes: `flujo_an5822`, `FLUJO_AN5822`, `Flujo AN5822`, `FLUJOAN5822`, `AN5822_FLOW`, `AN5822 FLOW`.

Valores aceptados (case-insensitive): `firstCIT`, `subseqCIT`, `subseqMIT`, `N/A`, vacio. Cualquier otro valor lanza error con numero de fila.

Semantica del parser:
- **undefined** (columna ausente en la matriz) -> detector cae a inferencia.
- **null** (columna presente pero valor vacio o `N/A`) -> detector tratara como no aplicable.
- **An5822Flow** (valor declarado) -> detector lo usa con prioridad sobre inferencia.

---

## 11. Esquemas de Agregadores

Los productos Agregadores (5 y 6) soportan 3 sub-esquemas que agregan campos requeridos adicionales al servlet base.

### Esquema 1 - Tasa Natural

- Sin campos adicionales (solo los del servlet base)
- El agregador opera bajo la afiliacion padre

### Esquema 4 - Sin AGP (Autorizacion de Garantia de Pago)

Campos adicionales requeridos (R):

| Campo (logName) | Manual (ES) | Tipo | maxLen |
|---|---|---|---|
| SUB_MERCHANT | SUB_AFILIACION | alfanum | 22 (formato `7*14`) |
| ID_AGREGADOR | ID_AGREGADOR | num | 19 |

### Esquema 4 - Con AGP PROSA

Campos adicionales requeridos (R) = todos los de Sin AGP + 6 mas:

| Campo (logName) | Manual (ES) | Tipo | maxLen |
|---|---|---|---|
| SUB_MERCHANT | SUB_AFILIACION | alfanum | 22 (formato `7*14`) |
| ID_AGREGADOR | ID_AGREGADOR | num | 19 |
| MERCHANT_MCC | MERCHANT_MCC | num | 4 |
| DOMICILIO_COMERCIO | DOMICILIO_COMERCIO | alfanum | 25 |
| ZIP_CODE | CODIGO_POSTAL | num | 10 |
| CIUDAD_TERMINAL | CIUDAD_TERMINAL | alfanum | 13 |
| ESTADO_TERMINAL | ESTADO_TERMINAL | alfanum | 3 |
| PAIS_TERMINAL | PAIS_TERMINAL | alfanum | 2 |

**Rename v5**: El campo `AGGREGATOR_ID` legacy se renombro a `ID_AGREGADOR` (tambien en `response-rules.json`: `AGGREGATOR_REF` -> `ID_AGREGADOR`). Cero consumidores quedan con el nombre viejo.

### Anexo D — Reglas de contenido Agregadores (v5)

**Archivo**: `src/core/domain/services/AnexoDValidator.ts`
**Aplica a**: AGREGADORES_COMERCIO_ELECTRONICO, AGREGADORES_CARGOS_PERIODICOS
**Fuente**: Manual Agregadores v2.6.4 §Anexo D

Servicio de dominio puro (sin I/O) que valida el contenido de campos especificos a agregadores:

| Campo | Regla |
|---|---|
| `SUB_MERCHANT` | Formato estricto `^[A-Z0-9&]{7}\*[A-Z0-9&]{14}$` (7 chars agregador + `*` + 14 chars subafiliado). Ejemplo valido: `OPLINEA*ESSENTIALMASSA` |
| `ID_AGREGADOR`, `CIUDAD_TERMINAL`, `ESTADO_TERMINAL`, `PAIS_TERMINAL` | Charset: `A-Z`, `0-9`, `&`, espacio. Sin acentos, sin `Ñ`, sin puntuacion |
| `DOMICILIO_COMERCIO` | Charset genericos + `.` (unico campo que admite punto) |
| **Todos** | Sin dobles espacios consecutivos, sin espacio al inicio |

Fail reasons emitidos: `anexo_d_format`, `anexo_d_chars`, `anexo_d_double_space`, `anexo_d_leading_space`.

Integrado en `ValidateTransactionFieldsUseCase` via DI — se ejecuta automaticamente para cada transaccion de los 2 productos agregadores.

---

## 12. Validaciones cruzadas entre campos

**Archivos**: `src/core/domain/services/CrossFieldValidator.ts`, `PreAuthPostAuthCorrelator.ts`, `RateLimitValidator.ts`

Ademas del motor de pipeline por campo, existen validaciones que requieren comparar MULTIPLES campos o logs entre si, o agregar datos cross-transaccion. Se dividen en **per-tx** (corren en `ValidateTransactionFieldsUseCase`) y **cross-tx** (corren en `RunCertificationUseCase` tras el loop).

### Regla C1: XID/CAVV no deben enviarse vacios

**Fuente**: Manual 3DS v1.4, p.9 ("Si las Variables XID y/o CAVV retornaron valor Nulo o Blanco en la respuesta de la autenticacion 3D Secure, no enviar en el post hacia Payworks")

```
SI log 3DS tiene campo XID o CAVV:
  SI el valor esta presente PERO vacio → FALLA
  Detalle: "XID esta presente pero vacio -- no debe enviarse"
  Capa: THREEDS
```

### Regla C2: POSTAUTH requiere AUTH_CODE de PREAUTH previo

**Fuente**: Logica de negocio -- una postautorizacion necesita el codigo de autorizacion obtenido en la preautorizacion previa.

```
SI tipo transaccion === POSTAUTH:
  Buscar AUTH_CODE (o CODIGO_AUT) en el request del servlet
  SI no esta en el request:
    Buscar en respuestas previas de la sesion
    SI no se encuentra en ninguna parte → FALLA
  Detalle: "No se encontro AUTH_CODE en request ni en respuestas previas"
  Capa: SERVLET
```

### Regla C3: REFERENCIA servlet debe coincidir con Campo 37 PROSA

**Fuente**: Validacion de integridad -- el Campo 37 de PROSA (Retrieval Reference Number) debe ser identico a la REFERENCIA del servlet.

```
SI existe respuesta servlet Y respuesta PROSA:
  servletRef = response.REFERENCE o response.REFERENCIA
  prosaRef = response.Campo37
  SI ambos existen Y son diferentes → FALLA
  Detalle: 'Servlet: "X", PROSA Campo 37: "Y"'
  Capa: SERVLET
```

### Regla C4: Decision Cybersource valores validos

**Fuente**: Manual Cybersource v1.10

```
SI existe log Cybersource:
  SI campo 'decision' existe Y NO esta en [ACCEPT, REVIEW, REJECT, ERROR]:
    → FALLA
  Detalle: 'Valor recibido: "X"'
  Capa: CYBERSOURCE
```

### Regla C5: Pais de envio debe coincidir con pais del terminal

**Fuente**: Validacion de consistencia Cybersource

```
SI existe log Cybersource Y servlet request:
  shipCountry = cybersource.ShipTo_country
  terminalCountry = servlet.TERMINAL_COUNTRY
  SI ambos existen Y son diferentes → FALLA
  Detalle: 'ShipTo_country: "X", TERMINAL_COUNTRY: "Y"'
  Capa: CYBERSOURCE
```

### Regla C6: Campos de respuesta en dominio valido

```
Para cada campo esperado con validValues:
  SI campo presente en respuesta servlet Y valor NO esta en validValues:
    → FALLA
  Capa: SERVLET
```

### Regla C7: Unicidad CONTROL_NUMBER + MERCHANT_ID

**Fuente**: Manual MOTO v1.5, p.7 ("La combinacion del numero de afiliacion con este numero de control debera ser unico e irrepetible por cada transaccion")
**Servicio**: `UniqueValidator`
**Granularidad**: cross-tx

```
Para cada transaccion procesada:
  key = MERCHANT_ID + ":" + CONTROL_NUMBER
  SI key ya fue vista previamente → FALLA (duplicado)
  Detalle: "Combinacion X:Y aparece N veces -- debe ser unica"
  Capa: SERVLET
```

### Regla C8: CUSTOMER_REF2 consistente entre PREAUT y POSTAUT (v5)

**Fuente**: Manual Ecommerce Tradicional v2.5 p.10 ("Si se usa en operativa de PRE y POSTAUTORIZACION, el valor que envie en ambas transacciones debe ser igual")
**Servicio**: `PreAuthPostAuthCorrelator`
**Granularidad**: cross-tx (corre en RunCertificationUseCase tras el loop)

```
Para cada transaccion en la sesion:
  Agrupar PREAUT por numeroControl
Para cada POSTAUT:
  Buscar PREAUT con mismo numeroControl
  Si existe: comparar servletRequest.CUSTOMER_REF2 entre ambas
    Si difieren -> FALLA 'inconsistent_customer_ref2'
    Detalle incluye refs de PRE y POST + valores ("(vacio)" si ausente)
    El fail se adjunta al ValidationResult de la POSTAUT
```

Politica: si ambos vacios → pasa; si solo uno trae valor → falla.

### Regla C9: ECI validValues segun CARD_BRAND (v5)

**Fuente**: `layer-3ds.json:476` — `validValuesByBrand` nuevo en FieldSpec
**Granularidad**: per-tx (via proyeccion en `resolveSpecForBrand`)

ECI en la respuesta 3DS se valida contra un subset segun la marca:

| Marca | validValues ECI |
|---|---|
| VISA | `[05, 06, 07]` |
| AMEX | `[05, 06, 07]` |
| MC | `[01, 02]` |

Cuando el `validValues` global de un campo coexiste con `validValuesByBrand`, la aplicacion resuelve al subset de marca **antes** de invocar al evaluador. Si el valor observado cae fuera, produce `invalid_value`.

### Regla C10: Coherencia AN5822 declarado vs observado (v5)

**Servicio**: `An5822FlowDetector`
**Granularidad**: per-tx

Si la matriz declara `flujo_an5822` en la transaccion Y el log observado sugiere otro flujo por `PAYMENT_INFO`, el detector emite un failure con `source: 'AN5822'` describiendo la inconsistencia (ej. declaracion `firstCIT` pero PAYMENT_INFO=`2` sugiere `subseqMIT`). Esto tambien activa logica defensiva en el validator AN5822 (no muta el flujo declarado, pero flaggea).

### Regla C11: ID_CYBERSOURCE = requestID + BIN vs Card_cardType (v5)

**Servicio**: `CrossFieldValidator.validateCybersourceIdAndBin`
**Granularidad**: per-tx
**source reportado**: `CYBERSOURCE`

**C11a** — `ID_CYBERSOURCE` del servlet debe coincidir con `requestID` de la respuesta Cybersource. Si difieren: FAIL.

**C11b** — BIN (primeros 6 digitos de `Card_accountNumber`, tolerante a masking con `*`) debe ser consistente con `Card_cardType`:
- `001` (VISA): BIN debe empezar con `4`.
- `002` (MC): BIN en rangos `510000-559999` o `222100-272099` (incluye nuevos ranges MC).

AMEX no aplica (Cybersource Banorte no soporta Card_cardType=003 en v5).

### Regla C12: Codigos de error PinPad documentados (v5)

**Servicio**: `CrossFieldValidator.validatePinPadErrorCode`
**Granularidad**: per-tx
**Aplica a**: productos Tarjeta Presente con tabla `errorCodes` declarada (API PW2 Seguro, Interredes Remoto)
**Fuente**: Manual Interredes Remoto Anexo VI, API PW2 Seguro §error codes

Si el servlet log expone `ERROR_CODE` (o alias `CODIGO_ERROR`, `PINPAD_ERROR`) con valor no vacio distinto de `0`/`00`, verifica que el codigo este documentado en `errorCodes` del producto. Si no esta: FAIL.

### Regla Rate Limit: 200 tx/min en Cargos Periodicos (v5)

**Servicio**: `RateLimitValidator`
**Granularidad**: cross-tx
**Fuente**: Manual Cargos Periodicos Post v2.1 y Agregadores CP v2.6.4
**Aplica a**: CARGOS_PERIODICOS_POST, AGREGADORES_CARGOS_PERIODICOS

Ventana deslizante de 60 segundos. Si en alguna ventana el numero de transacciones supera 200, se reporta una violacion con el conjunto completo de refs dentro de la ventana. Cada tx afectada recibe un fail `rate_limit_exceeded` en su `ValidationResult`.

Solo se reporta la **primera** violacion detectada por sesion (evitar ruido de sintoma repetido).

### Regla Anexo D: Reglas de contenido Agregadores (v5)

Ver [Seccion 11](#11-esquemas-de-agregadores) — Anexo D.

Servicio: `AnexoDValidator`. Granularidad: per-tx. Solo aplica a los 2 productos agregadores.

---

## 13. Glosario de variables espanol-ingles

**Archivo**: `src/config/variable-glossary.json`

El problema: los manuales usan nombres en **espanol MAYUSCULAS** (ID_AFILIACION, USUARIO, MONTO) pero los logs del servlet usan nombres en **ingles MAYUSCULAS** (MERCHANT_ID, USER, AMOUNT). El glosario mapea entre ambos.

### Seccion: Servlet (campos base)

| Manual (ES) | Log (EN) | Display | Tipo | Ambiguo |
|---|---|---|---|---|
| ID_AFILIACION | MERCHANT_ID | ID Afiliacion | numeric(9) | No |
| USUARIO | USER | Usuario | alphanum | No |
| CLAVE_USR | (no se logea) | Clave Usuario | — | Si (PCI) |
| ID_TERMINAL | TERMINAL_ID | ID Terminal | numeric | No |
| CMD_TRANS | CMD_TRANS | Tipo Transaccion | enum | No |
| MONTO | AMOUNT | Monto | decimal(18,2) | No |
| MODO | MODE | Modo | enum | No |
| REFERENCIA | REFERENCE | Referencia | alphanum | No |
| NUMERO_CONTROL | CONTROL_NUMBER | Numero de Control | alphanum | No |
| REF_CLIENTE1..5 | CUSTOMER_REF1..5 | Referencia Cliente 1..5 | alphanum | No |
| NUMERO_TARJETA | CARD_NUMBER | Numero de Tarjeta | masked | No |
| FECHA_EXP | CARD_EXP (probable) | Fecha Expiracion | date(MMAA) | **Si** |
| CODIGO_SEGURIDAD | (no se logea) | Codigo de Seguridad | — | Si (PCI) |
| MODO_ENTRADA | ENTRY_MODE | Modo de Entrada | enum | No |
| IDIOMA_RESPUESTA | RESPONSE_LANGUAGE | Idioma Respuesta | enum | No |
| LOTE | GROUP | Lote | alphanum(30) | No (renombrado a `GROUP` en v5 — `logName` oficial del manual) |
| MARKETPLACE_TX | MARKETPLACE_TX | Marketplace TX | num(1) | No (regla `PROHIBITED` en MC/AMEX, `O` con `fixedValue="1"` en VISA — ver §6 pipeline nivel 2) |

### Seccion: Agregadores

| Manual (ES) | Log (EN) | Tipo |
|---|---|---|
| SUB_AFILIACION | SUB_MERCHANT | alfanum(18) |
| ID_AGREGADOR | AGGREGATOR_ID | num(19) |
| MERCHANT_MCC | MERCHANT_MCC | num(4) |
| DOMICILIO_COMERCIO | DOMICILIO_COMERCIO | alfanum(25) |
| CODIGO_POSTAL | ZIP_CODE | num(10) |
| CIUDAD_TERMINAL | TERMINAL_CITY | alfanum(13) |
| ESTADO_TERMINAL | ESTADO_TERMINAL | alfanum(3) |
| PAIS_TERMINAL | TERMINAL_COUNTRY | alfanum(2) |

### Seccion: AN5822

| Manual (ES) | Log (EN) | validValues | Notas |
|---|---|---|---|
| IND_PAGO | PAYMENT_IND | U, R | **U** en Ecommerce/MOTO/VCE/Agreg.CE; **R** en Cargos Periódicos Post + Agreg.CP. El valor `8` era el bug legacy v4, eliminado en v5. |
| TIPO_MONTO | AMOUNT_TYPE | F, V | F=Fijo, V=Variable. |
| INFO_PAGO | PAYMENT_INFO | 0, 2, 3 | 0=firstCIT, 3=subseqCIT, 2=subseqMIT. |
| COF | COF | 4 | Card on File indicator. Solo aplica a Cargos Periódicos Post y Agreg.CP en subseqMIT. |
| CIF | CIF | (alfanum) | Customer Initial Frequency — documentado en Anexo V pero raro en logs. |

### Seccion: 3DS

| Manual (ES) | Log 3DS | Notas |
|---|---|---|
| NUMERO_TARJETA | Card | enmascarado |
| MONTO | Total | decimal |
| MARCA_TARJETA | CardType | VISA/MASTERCARD |
| ID_AFILIACION | MerchantId | |
| NOMBRE_COMERCIO | MerchantName | |
| CIUDAD_COMERCIO | MerchantCity | |
| CERTIFICACION_3D (envío) | Cert3D | Variable de envío al servicio 3DS. `fixedValue="03"` (indicador de certificación 3DS 2.0 activa). Ver §8. |
| STATUS_3D (retorno) | Status | Variable de retorno del servicio 3DS. `validValues=[200, 201, 202, 421-448]` (40+ códigos Anexo D VCE v1.8). Resuelto en v5 — antes se confundía con Cert3D. |
| ECI | ECI | |
| XID | XID | |
| CAVV | CAVV | |
| VERSION_3D | Version3D | |

### Seccion: Cybersource

Variables en camelCase con prefijos: `BillTo_`, `Card_`, `PurchaseTotals_`, `ShipTo_`
Los nombres del manual coinciden con los del log.

### Seccion: EMV

| Nombre | TAG | Tipo |
|---|---|---|
| EMV_TAGS | — | hex |
| TVR | TAG 95 | hex(10) |
| TSI | TAG 9B | hex(4) |
| AID | TAG 4F | hex |
| APN | TAG 9F12 | alfanum |
| AL | TAG 50 | alfanum |

---

## 14. Parsers de logs

### 14.1 Parser Servlet

**Archivo**: `src/infrastructure/log-parsers/PayworksServletLogParser.ts`

#### Formato esperado del log

```
********************************************************************************
[11/03/2026 18:02:25] SE RECIBIO POST HTTP DESDE LA IP: 99.80.99.245
CARD_NUMBER:        [510125******2396]
CMD_TRANS:          [AUTH]
CONTROL_NUMBER:     [140802786372026031200022522]
MERCHANT_ID:        [9885405]
AMOUNT:             [98.39]
MODE:               [AUT]
ENTRY_MODE:         [MANUAL]
...
********************************************************************************

[11/03/2026 18:02:26] SE ENVIO RESPUESTA HTTP HACIA LA IP: 99.80.99.245
RESULTADO_PAYW:     [A]
CODIGO_PAYW:        [000]
AUTH_CODE:          [830125]
REFERENCE:          [320146914713]
...
********************************************************************************
```

#### Algoritmo de parsing

1. Dividir contenido por linea de asteriscos (`*{80}`)
2. Para cada bloque:
   - Extraer campos con regex: `^([A-Z_0-9]+)\s*:\s*\[([^\]]*)\]\s*$`
   - Verificar si CONTROL_NUMBER o NUMERO_CONTROL coincide con el buscado
   - Si coincide:
     - Si header contiene "SE RECIBIO POST HTTP" → bloque REQUEST
     - Si header contiene "SE ENVIO RESPUESTA HTTP" → bloque RESPONSE
3. Extraer timestamp: `[DD/MM/YYYY HH:MM:SS]` → convertir a Date
4. Extraer IP: `DESDE LA IP: X.X.X.X` o `HACIA LA IP: X.X.X.X`
5. **Ambos bloques (request + response) son obligatorios** -- error si falta alguno

### 14.2 Parser PROSA (ISO 8583)

**Archivo**: `src/infrastructure/log-parsers/PayworksProsaLogParser.ts`

#### Formato esperado del log

```
[11/03/2026 18:02:25] SE ENVIO MENSAJE HACIA EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
Campo 0: [0200]
Campo 2: [5101250000002396]
Campo 3: [000000]
Campo 4: [000000009839]
Campo 37: [320146914713]
Campo 38: [830125]
...

[11/03/2026 18:02:26] SE RECIBIO MENSAJE DESDE EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
Campo 0: [0210]
Campo 37: [320146914713]
Campo 39: [00]
...
```

#### Algoritmo de parsing

1. Dividir en bloques por lineas de header (SE ENVIO/SE RECIBIO MENSAJE)
2. Para cada bloque:
   - Extraer campos ISO con regex: `^Campo\s+(\d+)\s*:\s*\[([^\]]*)\]\s*$`
   - Verificar Campo 37 (RRN/REFERENCIA) coincide con referencia buscada
   - Verificar Campo 0 (Message Type) coincide con par esperado:
     - Request: Campo 0 = messagePair.request (ej. "0200") Y header = "SE ENVIO MENSAJE HACIA"
     - Response: Campo 0 = messagePair.response (ej. "0210") Y header = "SE RECIBIO MENSAJE DESDE"
3. **Doble validacion**: tanto el tipo de mensaje como la direccion del header deben coincidir
4. Extraer timestamp y direccion IP:puerto del header
5. **Ambos mensajes (request + response) son obligatorios** -- error si falta alguno

### 14.3 Correlacion entre parsers

| Log | Clave de busqueda | Campo de correlacion |
|---|---|---|
| Servlet | CONTROL_NUMBER | CONTROL_NUMBER o NUMERO_CONTROL en campos del bloque |
| PROSA | REFERENCIA | Campo 37 (RRN) |
| 3DS | Folio/REFERENCIA | Por folio de transaccion |
| Cybersource | OrderId/REFERENCIA | Por OrderId |

La **referencia** de la transaccion en la matriz Excel es la que une todos los logs: se usa para buscar en el servlet (via CONTROL_NUMBER del registro de BD) y en PROSA (via Campo 37).

---

## 15. Parser de afiliaciones

**Archivo**: `src/infrastructure/parsers/AfiliacionFileParser.ts`

### Formatos aceptados

- CSV con separador `,` o `;`
- TXT con pipes `|`
- Encoding: UTF-8 o Latin-1 (auto-detectado)

### Deteccion automatica

1. **Encoding**: Si UTF-8 produce caracteres de reemplazo (`\uFFFD`), re-decodifica como Latin-1
2. **Separador**: Prioridad para .txt con pipes; sino, usa el separador mas frecuente en las primeras 3 lineas
3. **Headers**: Normalizacion tolerante que remueve acentos, espacios, guiones bajos y convierte a mayusculas

### Mapeo de columnas (alias tolerantes)

| Campo canonico | Aliases aceptados |
|---|---|
| idAfiliacion | ID_AFILIACION, AFILIACION, ID AFILIACION, MERCHANT_ID |
| nombreComercio | NOMBRE_COMERCIO, NOMBRE COMERCIO, NOMBRE, MERCHANT_NAME |
| razonSocial | RAZON_SOCIAL, RAZON SOCIAL, RAZONSOCIAL |
| rfc | RFC |
| numeroCliente | NUMERO_CLIENTE, NUMERO CLIENTE, ID_CLIENTE, NUMCLIENTE |
| giro | GIRO |
| mccDescripcion | MCC_DESCRIPCION, MCC, GIRO_MCC |
| esquema | ESQUEMA |
| tipoIntegracion | TIPO_INTEGRACION, TIPO INTEGRACION, INTEGRATION_TYPE |
| direccion | DIRECCION, DOMICILIO |
| ciudad | CIUDAD |
| estado | ESTADO |
| codigoPostal | CP, CODIGO_POSTAL, CODIGO POSTAL, ZIP, ZIP_CODE |
| email | EMAIL, CORREO, CORREO_ELECTRONICO |
| telefono | TELEFONO, TEL, PHONE |
| usuario | USUARIO, USER |
| status | STATUS, ESTATUS |

Las columnas no reconocidas se preservan en un mapa `extras` para flexibilidad.

---

## 16. Generacion de carta de certificacion

**Archivo**: `src/presentation/utils/generateCertificationLetterPDF.ts`

### Estructura de 3 paginas (jsPDF)

#### Pagina 1 - Portada

- Fondo cafe/marron con logo BANORTE
- Titulo: "CERTIFICACION {PRODUCTO} {CAPAS}"
  - Ejemplo: "CERTIFICACION COMERCIO ELECTRONICO CON 3D SECURE"
- Fecha de emision (DD/MM/YYYY)
- Version del manual
- Colores: rojo #EB0029, oscuro #323E48, gris #5B6670

#### Pagina 2 - Contenido principal

- **Coordinador de certificacion** (ingresado por el usuario)
- **Parrafo introductorio** con datos de afiliacion
- **Tabla de datos de afiliacion**: Nombre Comercio, RFC, Numero Cliente, Afiliacion
- **9 bullets de informacion tecnica**:
  1. Esquema (ej. "PAYWORKS 2 - AGREGADORES CON 3D SECURE")
  2. Modo de transmision (TCP/IP/TLS)
  3. Mensajeria (HTTP)
  4. Lenguaje (proporcionado por usuario o "NO PROPORCIONADO")
  5. Tarjetas procesadas (detectadas de las transacciones reales: VISA, MASTERCARD, AMEX)
  6. Giro (del CSV de afiliaciones o "—")
  7. Modo de lectura (CHIP/BANDA/CONTACTLESS para TP, MANUAL para TNP)
  8. Version de aplicacion (proporcionada por usuario)
  9. Responsable tecnico (nombre, email, telefono, direccion del CSV de afiliaciones)
- **Matriz de pruebas** (tabla):
  - Columnas: Referencia | Tipo Transaccion | Marca | Veredicto
  - Una fila por transaccion validada
- **URL de subdominio** (si proporcionada)

#### Pagina 3 - Notas y firma

- **6 notas tecnicas**:
  1. Manual utilizado y version
  2. Variables CIT/MIT enviadas (si aplica AN5822)
  3. Responsabilidades del comercio
  4. Aclaracion sobre modo PRD
  5. Manuales de referencia utilizados
  6. Disclaimer
- **Lista de manuales utilizados** (detectados automaticamente segun capas activas)
- **Firma**: Nombre y rol ("Soporte Tecnico Payworks")
- **Codigo de certificado**: Formato `CE{PREFIJO}-{CONSECUTIVO}_{AFILIACION}`

### Codigo de certificado

**Formato**: `CE{PREFIX}-{CONSECUTIVO}_{AFILIACION}`

| Producto | Prefijo |
|---|---|
| ECOMMERCE_TRADICIONAL | 3DS |
| MOTO | MTO |
| CARGOS_PERIODICOS_POST | CPP |
| VENTANA_COMERCIO_ELECTRONICO | VCE |
| AGREGADORES_COMERCIO_ELECTRONICO | AEC |
| AGREGADORES_CARGOS_PERIODICOS | ACP |
| API_PW2_SEGURO | PW2 |
| INTERREDES_REMOTO | INT |

**Consecutivo**: Hash deterministico de 7 digitos derivado del sessionId:
```
hash = 0
para cada caracter del sessionId:
  hash = (hash * 31 + charCode) >>> 0  (unsigned 32-bit)
consecutivo = (hash % 9999999).toString().padStart(7, '0')
```

**Ejemplo**: `CE3DS-0003652_9885405`

---

## 17. Flujo completo de certificacion

### Endpoint: POST `/api/certificacion/validar`

**Archivo**: `src/app/api/certificacion/validar/route.ts`

#### Entradas (multipart/form-data)

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `matriz` | File | Si | Matriz de pruebas (Excel/CSV) |
| `integrationType` | string | Si | Clave del producto (ej. `AGREGADORES_COMERCIO_ELECTRONICO`) |
| `operationMode` | string | No | `semi` (default) o `auto` |
| `merchantName` | string | No | Nombre del comercio (override) |
| `coordinadorCertificacion` | string | No | Nombre del coordinador |
| `lenguaje` | string | No | Lenguaje de la aplicacion del comercio |
| `versionAplicacion` | string | No | Version de la app del comercio |
| `urlSubdominio` | string | No | URL/subdominio del comercio |
| `servletLog` | File | No | Log del servlet Payworks |
| `prosaLog` | File | No | Log del autorizador PROSA |
| `threeDSLog` | File | No | Log de 3D Secure |
| `cybersourceLog` | File | No | Log de Cybersource |
| `afiliaciones` | File | No | CSV/TXT de afiliaciones |
| `csvBD` | File | No | CSV de transacciones BD |

#### Flujo de ejecucion

```
1. Validar inputs obligatorios (matriz + integrationType)

2. Cargar archivos en repositorios in-memory:
   - CSV de BD → TransactionRepository.loadFromCSV()
   - Servlet log → LogRetrieval.setServletLog()
   - PROSA log → LogRetrieval.setProsaLog()
   - 3DS log → LogRetrieval.setThreeDSLog()
   - Cybersource log → LogRetrieval.setCybersourceLog()
   - Afiliaciones → AfiliacionRepository.loadFromFile()

3. Ejecutar RunCertificationUseCase.execute():

   3.1 Parsear matriz Excel/CSV → lista de transacciones
       Cada transaccion tiene: referencia, tipoTransaccion, cardBrand

   3.2 Para CADA transaccion en la matriz:

       3.2.1 Buscar registro en BD por referencia
             → Obtener: numeroControl, numero (afiliacion), fechas

       3.2.2 Resolver nombre del comercio:
             Prioridad: parametro > CSV afiliaciones > registro BD

       3.2.3 Parsear log Servlet por CONTROL_NUMBER
             → Obtener: request (campos enviados) + response (campos recibidos)

       3.2.4 Parsear log PROSA por REFERENCIA + par de mensaje
             → Obtener: request (ISO 8583 enviado) + response (ISO 8583 recibido)

       3.2.5 [Si producto soporta 3DS] Parsear log 3DS por folio
             → Obtener: campos de autenticacion 3DS

       3.2.6 [Si producto soporta Cybersource] Parsear log Cybersource por OrderId
             → Obtener: campos de validacion fraude

       3.2.7 VALIDAR todos los campos:
             Para la capa SERVLET:
               transactionKey = "{tipo}_{marca}" (ej. "AUTH_VISA")
               Para CADA campo en la matriz del producto:
                 regla = spec.rules[transactionKey] ?? 'N/A'
                 encontrado = servletRequest.hasField(logName)
                 valor = servletRequest.getField(logName)
                 resultado = FieldRequirementVO(regla).evaluateDetailed(encontrado, valor, spec)
                 → PASS o FAIL con motivo especifico

             Para la capa THREEDS (si aplica):
               Mismo proceso contra campos de layer-3ds.json

             Para la capa CYBERSOURCE (si aplica):
               Mismo proceso contra campos de layer-cybersource.json

       3.2.8 Agregar resultado de validacion a la lista

   3.3 Crear CertificationSession con todos los resultados
   3.4 Persistir sesion (InMemoryCertificationRepository)
   3.5 Retornar sesion con ID para consultar carta

4. Retornar JSON con:
   - id de sesion
   - veredicto global (APROBADO/RECHAZADO/PENDIENTE)
   - conteo aprobadas/rechazadas
   - tasa de aprobacion (%)
   - detalle campo por campo de cada transaccion
```

### Endpoint: GET `/api/certificacion/carta/[id]`

**Archivo**: `src/app/api/certificacion/carta/[id]/route.ts`

#### Flujo

```
1. Buscar sesion por ID en el repositorio

2. Derivar datos de la carta:
   - Buscar afiliacion del primer MERCHANT_ID
   - Construir codigo de certificado
   - Contar aprobadas/rechazadas
   - Determinar veredicto global
   - Detectar capas activas (3DS, Cybersource) de los resultados
   - Construir nombre de esquema completo
   - Detectar marcas de tarjeta usadas
   - Detectar tipos de transaccion certificados

3. Armar CertificationLetterData con 22+ campos

4. Generar PDF con jsPDF (3 paginas)

5. Retornar PDF como descarga
   Content-Type: application/pdf
   Content-Disposition: attachment; filename="CE{codigo}.pdf"
```

---

## 18. Reglas de respuesta

**Archivo**: `src/config/mandatory-fields/response-rules.json`

Campos validados en la respuesta del servlet:

`response-rules.json._meta` (iter 2) declara: `integrationType: LAYER_RESPONSE`, `manualVersion: compiled-v1.0`, `manualDate: 2026-04-22`, con 6 fuentes citadas. Esto permite al dictamen PDF incluir "Reglas de respuesta compiladas el 22-Abr-2026 a partir de [manuales...]".

| Campo | Tipo | Descripcion | validValues |
|---|---|---|---|
| PAYW_RESULT | enum | Resultado Payworks | **A** (Aprobada), **D** (Declinada), **R** (Rechazada), **T** (Sin respuesta), **Z** (v5 — Reversa automatica por timeout) |
| **AUTH_RESULT** *(iter 2)* | num(2) | Codigo autorizacion | **Tabla completa de 65 valores** — +18 codigos del Anexo B que faltaban (19, 23, 26, 45, 46, 47, 49, 50, 55, 56, 59, 60, 62, 63, 67, 68, 70, 75). Sin esto, declinaciones validas del autorizador eran rechazadas como `invalid_value`. |
| AUTH_CODE | alfanum(6) | Codigo de autorizacion | — |
| CARD_BRAND | enum | Marca de tarjeta | VISA, MASTERCARD, AMEX |
| CARD_TYPE | enum | Tipo de tarjeta | CREDITO, DEBITO |
| PAYW_CODE | num(3) | Código Payworks | 000=Aprobada. Tabla completa (~105 códigos) incluye: 000-069 (errores de validación), 099, 101, 102, 110, 150, 200-211, 230, 231, 400, 443-445, 500, 999. Solo entregado cuando Payworks rechaza la transacción. Dominio exacto en `response-rules.json.PAYW_CODE.validValues`. |
| **ID_MAC** *(iter 2)* | enum | Indicador AN7110 MC (Mandato AN7110) | `U` (Prepago) / `V` (Virtual de un solo uso) / **`X`** (Virtual multiuso — **nuevo iter 2**, introducido en Manual Tradicional v2.5 changelog Jun-2025). Sin el valor X, transacciones MC internacionales eran rechazadas. |
| **ID_CYBERSOURCE** *(v5)* | string | requestID del retorno Cybersource | (validado por regla C11a) |
| **AUTH_DATE** *(v5, nota corregida iter 2)* | fecha | Fecha de autorizacion | Formato AAAAMMDD HH:MM:SS.sss. Documentado en Manual Agregadores v2.6.4 p.12, heredado operativamente por Tradicional/MOTO/Cargos Post. |
| **CUST_RSP_DATE** *(v5, nota corregida iter 2)* | fecha | Fecha de respuesta al cliente | Idem AUTH_DATE — fuente Manual Agregadores v2.6.4 p.12. |
| **CARD_HOLDER** *(v5)* | alfanum | Tarjetahabiente | — |
| **REFERENCE** *(v5)* | num(12) | Referencia como respuesta | — |
| **MARKETPLACE_TX_RETURN** *(v5)* | enum | Retorno marketplace | — |
| **ID_AGREGADOR** *(v5, rename)* | num(19) | ID del agregador (antes `AGGREGATOR_REF`) | — |

### Codigos PAYW_CODE implementados (60+)

- 000: Approved (Aprobada)
- 001: Refer to card issuer
- 003: Invalid merchant
- 004: Capture card
- 005: Do not honor
- 012: Invalid transaction
- 013: Invalid amount
- 014: Invalid card number
- 030: Format error
- 041: Lost card
- 043: Stolen card
- 051: Insufficient funds
- 054: Expired card
- 057: Transaction not permitted
- 076: Reversal accepted
- 078: Deactivated card
- 089: Invalid terminal
- 091: Issuer unavailable
- 092: Routing error
- 096: System malfunction
- Y mas...

---

## 19. Campos PCI-DSS (nunca logueados)

Los siguientes campos son **requeridos por los manuales** pero nunca aparecen en los logs por razones de seguridad PCI-DSS:

| Campo | Manual (ES) | Regla v5 | Aplicado en | Razón |
|---|---|---|---|---|
| PASSWORD | CLAVE_USR | `R_PCI` | Tradicional, MOTO, Cargos Post, Agreg.CE, Agreg.CP, API PW2 Seguro, Interredes Remoto (7 JSONs TNP/TP) | Credencial — nunca se loguea. Excepción: VCE mantiene `R` porque viaja cifrado AES dentro del JSON. |
| SECURITY_CODE | CODIGO_SEGURIDAD | `R_PCI` / removido | Tradicional, MOTO, Agreg.CE (aplicado como R_PCI en V/PRE). Removido de Cargos Post y Agreg.CP (MIT recurrente no pide CVV). | CVV/CVC — nunca se loguea. |
| EXP_DATE | FECHA_EXP | `R_PCI` | Tradicional, MOTO, Cargos Post, Agreg.CE, Agreg.CP (en V/PRE) | Dato sensible — rara vez en logs. |

**Estado actual (post iter 2)**:
- El tipo **`R_PCI`** está implementado en `FieldRule` y **pasa silenciosamente** cuando se evalúa contra log (comportamiento correcto: el campo PCI nunca debe aparecer en el log del servlet).
- Los JSONs v5 **ya marcan** estos campos con `R_PCI` en las transacciones donde el manual los pide (VENTA, PREAUTORIZACIÓN cuando aplica).
- **Brecha pendiente**: cuando exista un `MatrixValidator` que lea la matriz del comercio (fuera del scope v5 — documentado en sección 21), la regla `R_PCI` se comportará como `R` contra esa fuente — validando que el comercio declaró el campo aunque no aparezca en el log del servlet.

**Implementación actual**: `FieldRequirementValueObject.evaluateDetailed` maneja `R_PCI` en el nivel 3 del pipeline (entre `PROHIBITED` y `R`). `getDisplayName()` retorna `"Requerido (PCI — no logueable)"`.

**Commits que aplicaron R_PCI**: `37711ae` (Tradicional), `645fa32` (MOTO), `5b644b1` (Cargos Post), `f8aeebb` (Agreg.CE), `1087746` (Agreg.CP), `4b5ca7d` (API PW2), `5cf3ffd` (Interredes).

---

## 20. Campos marcados como ambiguos

Los siguientes campos tienen `"ambiguous": true` en el glosario o en las matrices, indicando que su mapeo con el log real del servlet no está 100% confirmado por falta de casos operativos suficientes. Se mantienen tolerantes (`O`) o con notas de seguimiento:

| Campo | Ambigüedad | Estado actual |
|---|---|---|
| FECHA_EXP / EXP_DATE / CARD_EXP | Nombre en log: hipótesis `CARD_EXP`. Formato MMAA (TNP) vs AAMM (API PW2 Seguro) — ver `_meta.fechaExpFormat` por producto. | `R_PCI` en V/PRE — pasa silenciosamente contra log (PCI no loggeable). |
| UCAF | Presente para MC pero rara vez en logs reales | Marcado `O`, `ambiguous: true` |
| NUMERO_BIN | Aparece en logs de agregadores pero no lo documenta el manual base | No validado (sin regla) |

**Resueltos en v5** (ya no son ambiguos):

| Campo | Estado previo | Resolución |
|---|---|---|
| ~~LOTE / BATCH~~ | "No visto en logs TNP" | Renombrado a `GROUP` (`logName` oficial). Opcional en todos los productos. |
| ~~MARKETPLACE_TX~~ | "No claro cuándo aplica" | Implementada regla `PROHIBITED` en MC/AMEX, `O` con `fixedValue="1"` en VISA. Ver §6 pipeline nivel 2. |
| ~~ESTATUS_3D / Cert3D~~ | "Manual dice 200 pero log 03" | Separados en `CERTIFICACION_3D` (envío, fijo 03) y `STATUS_3D` (retorno, 200=éxito). Ver §8. |
| ~~GATEWAY_ID~~ | "Solo en Esquema 1 (ZIGU)" | Implementado como `ID_GATEWAY` con scope por producto (solo Agregadores CE/CP + Cargos Post MC). `PROHIBITED` en VISA/AMEX. Removido de Tradicional/MOTO. |

---

## 20-BIS. Estado actual por JSON (validado contra PDFs oficiales)

Esta sección documenta el estado **real en runtime** de cada archivo JSON en `src/config/mandatory-fields/`, con referencia al manual oficial validado y al commit en el que se alineó. Es la fuente autoritativa después de la validación exhaustiva del 2026-04-22.

### 20-BIS.1 `ecommerce-tradicional.json`

- **Manual**: Comercio Electrónico Tradicional **v2.5** (19-Jun-2025)
- **Commit alineado**: `37711ae`
- **Servlet fields**: 20 campos (coincide con tabla p.6-9 del manual)
- **Transacciones**: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL, VERIFY × VISA/MC/AMEX = 21 combinaciones
- **Campos PCI**: `PASSWORD`, `EXP_DATE`, `SECURITY_CODE` con regla **`R_PCI`** (manual dice R pero PCI no loggeable)
- **Caracteres especiales** (manual p.9): `" , / \ & % $ ! ¡ | ? ¿ ' * - _ # ( )` + NOTA 2 recomienda sin acentos
- **Capas que aplican**: Servlet + 3DS + Cybersource + AN5822
- **Brechas**: variables AMEX adicionales (DOMICILIO, CODIGO_POSTAL, TELEFONO, DOMICILIO_ENTREGA, etc. — manual p.9) pendientes de agregar

### 20-BIS.2 `moto.json`

- **Manual**: MOTO (Mail Order / Telephone Order) **v1.5** (19-Jun-2025)
- **Commit alineado**: `645fa32`
- **Servlet fields**: 23 campos (20 base p.6-8 + 3 Q6 p.11)
- **Transacciones**: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL, VERIFY × VISA/MC (sin AMEX)
- **Campos PCI**: `PASSWORD`, `EXP_DATE`, `SECURITY_CODE` con regla `R_PCI`
- **Q6 Pagos Diferidos**: `INITIAL_DEFERMENT`, `PAYMENTS_NUMBER` (no singular), `PLAN_TYPE`
- **Capas que aplican**: Servlet + AN5822
- **Brechas**: ninguna crítica

### 20-BIS.3 `cargos-periodicos-post.json`

- **Manual**: Cargos Periódicos Post **v2.1** (19-Jun-2025)
- **Commit alineado**: `5b644b1`
- **Servlet fields**: 20 campos (coincide con manual p.6-8)
- **Transacciones**: AUTH, REFUND, VOID, REVERSAL, VERIFY × VISA/MC (sin AMEX, sin PREAUT/POSTAUT)
- **Campo distintivo**: `CUSTOMER_REF3` R 20 ("Número de contrato del Tarjetahabiente con el comercio" — sí es del manual)
- **Removido vs v4**: `SECURITY_CODE` (cargos recurrentes no piden CVV), `ID_GATEWAY` (pertenece a Agregadores)
- **AN5822**: `PAYMENT_IND=R` (Recurrente), `COF=4` en subseqMIT
- **Rate limit**: **200 tx/min** (manual p.6)
- **Capas que aplican**: Servlet + AN5822

### 20-BIS.4 `ventana-comercio-electronico.json`

- **Manual**: Ventana de Comercio Electrónico Cifrada (VCE) **v1.8** (24-Mar-2026)
- **Commit alineado**: `77d090e`
- **Servlet fields**: 21 campos (incluye Q6 MSI + tokenización)
- **Formato nombres**: camelCase (merchantId, merchantName, customerRef1, etc. — distinto de otros manuales)
- **Transacciones**: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL × VISA/MC/AMEX = 18 combinaciones
- **Distintivos**:
  - `password` R (no R_PCI — viaja **cifrado AES** dentro del JSON)
  - `merchantCity` maxLen **40** (bug de 3DS v1.0 corregido)
  - `mode.validValues` **`[PRD, AUT]`** (solo 2, no DEC/RND como otros)
  - `amount` maxLen **15** (Numérico total incluyendo decimales)
- **Tokenización**: `usarTokenizacion`, `idUsrComercio`, `correoUsrComercio` (manual v1.2 changelog)
- **Capas que aplican**: Servlet + 3DS + Cybersource + AN5822

### 20-BIS.5 `agregadores-comercio-electronico.json`

- **Manual**: Comercio Electrónico Agregadores y Aliados **v2.6.4** (23-Ene-2026)
- **Commit alineado**: `f8aeebb`
- **Servlet fields**: 22 campos
- **Transacciones**: AUTH, PREAUTH, POSTAUTH, REFUND, VOID, REVERSAL × VISA/MC (sin AMEX)
- **subEsquemas** (corregidos, antes estaban invertidos):
  - `ESQ_1` (Natural / Giro Agregador): sin campos adicionales
  - `ESQ_4_CON_AGP`: SUB_MERCHANT + AGGREGATOR_ID (2 campos — subafiliado vía AGP PROSA)
  - `ESQ_4_SIN_AGP`: 8 campos (SUB_MERCHANT, AGGREGATOR_ID, MERCHANT_MCC, DOMICILIO_COMERCIO, ZIP_CODE, TERMINAL_CITY, ESTADO_TERMINAL, TERMINAL_COUNTRY)
- **Campo distintivo**: `CUSTOMER_REF5` R 30 ("Identificador o nombre del Agregador o Integrador" — sí es del manual)
- **MARKETPLACE_TX** `PROHIBITED` en MC/AMEX (manual p.14)
- **ID_GATEWAY** para Gateway 7118 MC (manual p.15)
- **Capas que aplican**: Servlet + Agregador + 3DS + Cybersource + AN5822

### 20-BIS.6 `agregadores-cargos-periodicos.json`

- **Manual**: Cargos Periódicos Agregadores **v2.6.4** (Ene-2026)
- **Commit alineado**: `1087746`
- **Servlet fields**: 21 campos
- **Transacciones**: AUTH, REFUND, VOID, REVERSAL × VISA/MC (sin AMEX/PREAUT/POSTAUT)
- **subEsquemas**: mismos que Agregadores CE pero desinvertidos igual
- **CUSTOMER_REF3 R 20** (Número de contrato — sí es del manual)
- **CUSTOMER_REF5 R 30** (ID Agregador — sí es del manual)
- **AN5822**: `PAYMENT_IND=R`, `COF=4` en subseqMIT
- **Rate limit**: 200 tx/min
- **Removido vs v4**: `SECURITY_CODE`, `BATCH` → `GROUP`
- **Anexo D oficial existe en manual p.36** (reglas de contenido SUB_MERCHANT)
- **Capas que aplican**: Servlet + Agregador + AN5822

### 20-BIS.7 `api-pw2-seguro.json`

- **Manual**: API PW2 Seguro **v2.4** (Mar-2023) + Anexo V Tabla de Parámetros
- **Commit alineado**: `4b5ca7d`
- **Servlet fields**: 13 campos (básicos)
- **emvVoucher fields**: 5 tags EMV documentales (TVR/TSI/AID/APN/AL — outputs del SDK, no se validan)
- **Transacciones** (manual Anexo V Tabla 8): VENTA, CASHBACK, VENTA_FORZADA, PREAUT, REAUT, POSTAUT, DEVOLUCION, REVERSA, CIERRE_LOTE, VERIFICACION, SUSPENSION, REACTIVACION, CIERRE_AFILIACION × VISA/MC/AMEX
- **Único campo EMV de envío**: `EMV_TAGS` (TLV hex concatenado, permanece en servlet)
- **BATCH → GROUP** rename aplicado
- **PASSWORD → R_PCI**
- **Brechas (alcance separado)**: variables del Anexo V pendientes — CASHBACK_AMOUNT, PAGO_MOVIL, AUTH_CODE, BANROTE_URL, TRANS_TIMEOUT, Q6, RESPONSE_LANGUAGE, QPS, CUSTOMER_REF2-5
- **Capas que aplican**: Servlet + EMV (no 3DS, no AN5822)

### 20-BIS.8 `interredes-remoto.json`

- **Manual**: Interredes Remoto **v1.7** (Jul-2025) + Anexos I-VII
- **Commit alineado**: `5cf3ffd`
- **Servlet fields**: 14 campos (incluye `CASHBACK_AMOUNT`, `PIN_REQUESTED`)
- **emvVoucher fields**: 5 tags EMV
- **Transacciones (Anexo III)**: 13 tipos, incluye `OBTENER_LLAVE`, `CASHBACK`, `DEVOLUCION_CLIENTE`, `VENTA_CON_VALIDACION`, `CANCELAR` + estándares
- **errorCodes**: tabla PinPad del Anexo VI (usado por regla cruzada C12)
- **Fixes paralelos a API PW2 Seguro**: PASSWORD→R_PCI, BATCH→GROUP
- **Capas que aplican**: Servlet + EMV

### 20-BIS.9 `layer-3ds.json`

- **Manual**: 3D Secure 2 Banorte **v1.4** (29-Oct-2024)
- **Estructura**:
  - `threeds`: variables de **envío** al servicio 3DS (13+ campos: FORWARD_PATH, REFERENCE3D, CITY, COUNTRY, EMAIL, NAME, LAST_NAME, POSTAL_CODE, STATE, STREET, MOBILE_PHONE, CREDIT_TYPE, THREED_VERSION, CERTIFICACION_3D fixedValue="03")
  - `threedsResponse`: variables de **retorno** (STATUS_3D con 40+ códigos, ECI, XID, CAVV)
- **Cambio crítico**: `CERTIFICACION_3D` (envío, fijo 03) y `STATUS_3D` (retorno, 200=éxito) **separados**
- **ECI `validValuesByBrand`**: VISA/AMEX → `[05, 06, 07]`, MC → `[01, 02]`
- **Aplica a**: Ecommerce Tradicional, VCE, Agregadores CE

### 20-BIS.10 `layer-cybersource.json`

- **Manual**: Cybersource Direct **v1.10** (18-Ene-2021)
- **Servlet fields**: 28+ campos (BillTo + Card + ShipTo + Purchase + retorno)
- **`Card_cardType.validValues`**: **`["001", "002"]`** (solo VISA/MC — sin AMEX)
- **`MerchantID.fixedValue`**: **`"banorteixe"`**
- **`BillTo_ipAddress`**: R desde v1.6
- **Reason codes**: tabla completa en `reasonCodeDescriptions`
- **Aplica a**: Ecommerce Tradicional, VCE, Agregadores CE (gap corregido en spec v5)

### 20-BIS.11 `layer-an5822.json`

- **Consolidado de 5 manuales TNP** (citas en `_meta.sources`):
  - Ecommerce Tradicional v2.5 p.11-13
  - MOTO v1.5 p.9-11
  - Cargos Periódicos Post v2.1 p.10-12
  - Agregadores CE v2.6.4 p.12-14
  - Agregadores CP v2.6.4 p.11-13
- **3 flujos**: `firstCIT`, `subseqCIT`, `subseqMIT`
- **productMapping**: valores esperados (`PAYMENT_IND`, `AMOUNT_TYPE`, `PAYMENT_INFO`, `COF`) por producto y flujo
- **Bug corregido**: `IND_PAGO=8` era inválido; valores reales son `U` (Ecommerce/MOTO/VCE/Agreg.CE) y `R` (Cargos Periódicos Post + Agreg.CP)
- **COF=4** solo en Cargos Periódicos MIT

### 20-BIS.12 `response-rules.json`

- **Metadata iter 2**: `integrationType: LAYER_RESPONSE`, `manualVersion: compiled-v1.0`, `manualDate: 2026-04-22`, `displayName` declarados en `_meta` (para que el dictamen PDF pueda citar "compilado el 22-Abr-2026").
- **Consolidado de 6 fuentes** (citas en `_meta.sources`):
  - MOTO v1.5 p.5 (PAYW_RESULT)
  - Ecommerce Tradicional v2.5 Anexo A (PAYW_CODE, campos retorno)
  - Cargos Periódicos Post v2.1 p.5 (Z - timeout)
  - API PW2 Seguro v2.4 p.20 (tabla AUTH_RESULT)
  - **Agregadores v2.6.4 p.12** (AUTH_DATE, CUST_RSP_DATE — añadido iter 2)
  - **Tradicional v2.5 changelog** (ID_MAC valor X introducido — añadido iter 2)
- **Campos validados**:
  - `PAYW_RESULT` (A/D/R/T/Z)
  - `AUTH_RESULT` — **tabla de 65 códigos** (47 → 65 en iter 2: +18 del Anexo B)
  - `PAYW_CODE` (400s/500s/999)
  - `ID_MAC` — **validValues `[U, V, X]`** (U=Prepago, V=Virtual un solo uso, X=Virtual multiuso — X añadido iter 2)
  - `ID_CYBERSOURCE`, `AUTH_DATE`, `CUST_RSP_DATE`, `CARD_HOLDER`, `MARKETPLACE_TX_RETURN`, `ID_AGREGADOR` (renombrado)

### Resumen de fixes por patrón recurrente

1. **`manualVersion`** — corregida la confusión Tradicional v2.5 vs Agregadores v2.6.4.
2. **`PASSWORD` N/A → R_PCI** — aplicado en 8 JSONs TNP/TP (todos salvo VCE que mantiene R).
3. **`EXP_DATE` / `SECURITY_CODE`** → `R_PCI` V/PRE donde el manual lo pide.
4. **`BATCH` → `GROUP`** rename — aplicado en 5 JSONs (Cargos Periódicos Post, Agreg.CP, API PW2 Seguro, Interredes).
5. **`SECURITY_CODE` removido** de Cargos Periódicos Post y Agregadores CP (manuales no lo listan — MIT recurrente).
6. **`ID_GATEWAY` / `GROUP`** removidos de Tradicional/MOTO (solo existen en Agregadores).
7. **Esquemas 4 CON/SIN AGP desinvertidos** en ambos Agregadores (CE y CP).
8. **`required` en subEsquemas** cambiado de nombres en español a logNames en inglés.
9. **`CUSTOMER_REF2` maxLen 30 → 16** en todos los TNP.
10. **`RESPONSE_LANGUAGE.validValues`** `[ES, EN, 01, 02]` → `[ES, EN]`.
11. **Pipeline v5**: `PROHIBITED` + `R_PCI` añadidos al evaluador (FieldRequirement.ts).
12. **Regex `FORBIDDEN_CHARS`**: alineado al superset de manual VCE v1.8 / Ecommerce v2.6.4.
13. **(iter 2) `AUTH_RESULT`**: tabla ampliada a 65 códigos oficiales del Anexo B (incluye 19, 23, 26, 45-50, 55-56, 59-63, 67-68, 70, 75).
14. **(iter 2) `ID_MAC`**: agregado valor `X` (Tarjeta Virtual multiuso, introducido en changelog Tradicional v2.5 Jun-2025).
15. **(iter 2) `response-rules._meta`**: agregados `integrationType`, `manualVersion`, `manualDate` para que el dictamen PDF pueda citar la capa de retorno.
16. **(iter 2) notas `AUTH_DATE`/`CUST_RSP_DATE`** corregidas: citaban "Manual Ecommerce v2.6.4" inexistente → ahora apuntan al Manual Agregadores v2.6.4 p.12 (fuente real, heredada operativamente).
17. **(iter 2) `layer-an5822.firstCIT._rulesNote`** documental añadida explicando scoping PREAUTH/POSTAUTH por producto.

### Preguntas abiertas para Ramsses (Q1-Q4 de auditoría iter 2)

No son bugs — son decisiones de negocio:

- **Q1**: ¿Existe un Manual Tradicional v2.6.4 como documento interno? (el PDF publicado es v2.5)
- **Q2**: ¿Se certifica algún comercio Tradicional con reglas operativas de Agregadores v2.6.4? (ej. marketplaces certificados como Tradicional por volumen)
- **Q3**: ¿`AUTH_DATE`/`CUST_RSP_DATE` son entregados por Banorte en Tradicional/MOTO aunque el manual del producto no los mencione?
- **Q4**: ¿El regex Anexo D de `SUB_MERCHANT` (formato 7*14) es requisito duro o recomendación?

---

## 21. Cobertura actual y brechas conocidas

### Cobertura implementada tras spec v5 (~92% manuales + 100% cambios P0)

- 8/8 productos con matrices R/O/N/A/PROHIBITED/R_PCI completas (v5)
- 9/9 tipos de transaccion
- 3/3 esquemas de agregadores
- Capa 3DS: envio y retorno **separados** (`threeds` vs `threedsResponse`), ECI por marca, 13+ campos de envio
- Capa Cybersource: 28+ campos, sin AMEX, `MerchantID="banorteixe"`
- **Capa AN5822 refactorizada**: 3 flujos (firstCIT/subseqCIT/subseqMIT) con mapping por producto, bug `IND_PAGO=8` eliminado
- Campos EMV separados: `servlet.EMV_TAGS` (envio) vs `emvVoucher.*` (documental)
- Pipeline evaluacion con `PROHIBITED` y `R_PCI`
- **10 reglas cruzadas activas** (antes solo 7 implementadas; algunas no wired a runtime):
  - **Per-tx**: C3, C5, C9, C10, C11, C12, XID/CAVV, POSTAUTH, Cybersource decision, Anexo D
  - **Cross-tx**: C7 (UniqueValidator), C8 (PreAuthPostAuthCorrelator), Rate limit
- Regex forbidden_chars alineado a manual (v5)
- Matriz Excel con columna `flujo_an5822` + aliases tolerantes
- Content-regression: 43 asserts blindando los cambios v5
- Suite de regresion con 4 casos reales (MUEVE CIUDAD, DLOCAL, OPENLINEA, ZIGU) + smoke por producto
- Carta PDF de 3 paginas
- Parser de afiliaciones tolerante

### Commits de la implementacion v5 (Fases 1-7)

| # | Hash | Alcance |
|---|---|---|
| 1 | `ee40c16` | JSONs v5 + PROHIBITED + borra 5 legacy |
| 2 | `6ee6b86` | regex chars + validValuesByBrand + fixture |
| 3 | `2fce458` | AN5822 (detector + validator + wiring) |
| 4 | `2c90eb5` | EmvVoucherSection typed |
| 5 | `d28df28` | Matriz Excel columna `flujo_an5822` |
| 6 | `da85dfb` | CrossField wiring + C11 + Anexo D |
| 7 | `23e1a07` | Agreg.CE + Cybersource + content-regression |
| 8 | `e2f386e` | R_PCI + C8 + C12 + rate limit |
| 9 | `18fdf1c` | Fase 7 regresion (4 casos + smoke) |

### Commits de validación vs PDFs oficiales (2026-04-22)

| # | Hash | JSON | Manual validado |
|---|---|---|---|
| 1 | `a3abfb5` | (metadata) | Fix confusión Tradicional v2.5 vs Agregadores v2.6.4 |
| 2 | `37711ae` | `ecommerce-tradicional.json` | v2.5 (19-Jun-2025) |
| 3 | `f8aeebb` | `agregadores-comercio-electronico.json` | v2.6.4 (23-Ene-2026) — esquemas desinvertidos |
| 4 | `645fa32` | `moto.json` | v1.5 (19-Jun-2025) |
| 5 | `5b644b1` | `cargos-periodicos-post.json` | v2.1 (19-Jun-2025) |
| 6 | `77d090e` | `ventana-comercio-electronico.json` | v1.8 (24-Mar-2026) |
| 7 | `1087746` | `agregadores-cargos-periodicos.json` | v2.6.4 (Ene-2026) |
| 8 | `4b5ca7d` | `api-pw2-seguro.json` | v2.4 (Mar-2023) + Anexo V |
| 9 | `5cf3ffd` | `interredes-remoto.json` | v1.7 (Jul-2025) + Anexos I-VII |

### Commits de auditoría iter 2 (pre-certificación 2026-04-22)

| # | Hash | Alcance |
|---|---|---|
| 1 | `58ad282` | **P0**: ID_MAC +X, AUTH_RESULT 47→65 códigos; **P2**: notas AUTH_DATE/CUST_RSP_DATE, `response-rules._meta` con integrationType+manualVersion, `layer-an5822._rulesNote` |

Total acumulado: **425/425 tests verdes**, typecheck limpio, 19 suites, **11/11 JSONs validados contra PDFs oficiales + auditoría iter 2 cerrada**.

### Estado listo para certificación

- ✅ 2/2 P0 bloqueantes resueltos (ID_MAC `X`, AUTH_RESULT 65 códigos)
- ✅ 5/5 P2 documentales aplicados
- ⏸️ 4/4 Q de negocio documentadas para sesión con Ramsses (no bloquean)

### Brechas conocidas remanentes (~8%)

| Brecha | Impacto | Siguiente paso |
|---|---|---|
| `MatrixValidator` (validacion contra matriz del comercio) | R_PCI no valida presencia en matriz; hoy solo pasa silencioso | Introducir port + adapter cuando haya fuente de matriz field-by-field |
| MerchantDefinedData de Cybersource (campos dinamicos) | No estandarizables por producto | Mecanismo de campos declarados por comercio |
| Policy `validValues` invalido: FAIL vs WARN | Recomendacion: FAIL si R, WARN si O | Decision de negocio + implementacion tercer estado `WARN` |
| Deteccion automatica esquema agregador | Hoy el comercio lo declara | Inferir por campos SUB_MERCHANT/MERCHANT_MCC |
| Regla consecutivo de certificado | Hash deterministico vs. secuencia global | Decision de negocio |
| Variante regex TNP vs Agregador | Unificada hoy (TNP); Agregador permite `*` y `&` en SUB_MERCHANT | Split en commit que amplie Anexo D a caracteres |
| Validacion cifrado VCE (AES/CTR) | Bot no valida estructura del JSON cifrado | Requiere credenciales de cifrado |
| Policy Postautorizacion por operativa (retail/restaurant/hotel) | Reglas adicionales condicionales por MCC | Pregunta abierta + MCC-aware validator |

### Preguntas pendientes para Ramsses

Documentadas en `docs/preguntas-ramsses.md` y en `docs/PENDIENTES-FIXES-JSONS-V5.md`. La mayoria de ambiguedades iniciales de los manuales quedaron resueltas durante la revision v5.

---

---

## 22. Changelog del documento

- **2026-04-22 (iter 2, commit `58ad282` + doc fixes)**: Auditoría pre-certificación cerrada.
  - **P0 aplicados**: `response-rules.ID_MAC.validValues` +`X` (Tarjeta Virtual multiuso); `response-rules.AUTH_RESULT.validValues` ampliado de 47 a 65 códigos (+18 del Anexo B del manual API PW2 Seguro).
  - **P2 aplicados**: notas de `AUTH_DATE`/`CUST_RSP_DATE` corregidas (citaban manual inexistente, ahora apuntan a Agregadores v2.6.4 p.12); `_meta` de `response-rules.json` con `integrationType: LAYER_RESPONSE` + `manualVersion: compiled-v1.0` + `manualDate`; `_rulesNote` documental en `layer-an5822.firstCIT`.
  - **Fixes documentales al MD**: sección 20-BIS añadida con estado autoritativo por JSON; tablas 7.1-7.8 simplificadas (pointer a 20-BIS); glosario AN5822 limpio; sección 19 actualizada a "R_PCI aplicado" en vez de "candidato"; sección 8 bug Cert3D/Status reformulado como histórico resuelto; sección 20 distingue ambiguos reales vs resueltos; tabla §3 completada con CYBERSOURCE en Agregadores CE.
  - Preguntas operativas Q1-Q4 para Ramsses documentadas (no bloquean).

- **2026-04-19 → 2026-04-21 (spec v5 cerrada, commits `ee40c16` → `5cf3ffd`)**: 12 JSONs alineados contra 10 PDFs oficiales + 1 Consolidado. Pipeline v5 (`PROHIBITED` + `R_PCI`), AN5822 refactorizada (3 flujos firstCIT/subseqCIT/subseqMIT), Anexo D implementado, 10 reglas cruzadas wired (C1-C12 + rate limit). 425/425 tests verdes, 19 suites.

- **Previo a v5 (legacy v4, deprecado)**: un único modelo "CIT/MIT" de 2 flujos aceptando `IND_PAGO=8` (valor inventado que no existe en manuales); campos EMV (TVR/TSI/AID/APN/AL) mezclados en el servlet en vez de diferenciar envío (EMV_TAGS) vs voucher físico (salida del SDK); `Cert3D` vs `Status` ambiguos en la misma sección del JSON 3DS; Cybersource aceptaba `Card_cardType=003` (AMEX, no soportado por Banorte); subesquemas Agregadores 4 CON/SIN AGP invertidos.

---

> **Fuente autoritativa en runtime**: los JSONs en `src/config/mandatory-fields/*.json`. La delta clave v5 está blindada por 43 asserts en `__tests__/unit/infrastructure/ProductConfigsV5.test.ts`.
> **Casos de regresión**: `__tests__/integration/regression/regression-cases.test.ts` reproduce los 4 escenarios operativos identificados en la revisión Banorte.
