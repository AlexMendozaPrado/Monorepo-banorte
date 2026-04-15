# Plan: Certificación robusta Payworks Bot (manuales oficiales)

## Context

El equipo de Ramsses Bautista compartió el paquete completo de manuales oficiales de integración Banorte Payworks. El bot debe alinearse al catálogo oficial para emitir certificaciones válidas, reemplazando las reglas inferidas del PDF "Datos_mandatorios.pdf" (parcial) que se usó inicialmente.

### Fuentes procesadas
- **10 manuales de producto** (8 Tarjeta No Presente + 2 Tarjeta Presente) — matrices R/O/N/A extraídas
- **5 logs de ejemplo reales** (3DS, Cybersource, ZIGU Esq.1, OPENLINEA Esq.4 Sin AGP, DLOCAL Esq.4 Con AGP)
- **Carta ejemplo** `CE3DS-0003652_9885405 MUEVE CIUDAD.pdf` — 22 placeholders identificados
- **Query**: `SELECT * FROM NPAYW.AFILIACIONES` (schema real pendiente)

### Problema
El bot actual: (a) enum de 6 productos desalineado con catálogo oficial; (b) nombres de campo en JSONs no coinciden con los reales; (c) trata 3DS/Cybersource como bloques por producto en lugar de **capas transversales**; (d) ignora Tarjeta Presente; (e) no genera carta oficial; (f) falta soporte a transacciones `REVERSA` y `CASHBACK`.

### Resultado esperado
Usuario sube matriz Excel + elige producto → bot valida servlet + capas 3DS/Cybersource si aplican → consulta afiliación por ID en Oracle → rellena carta oficial → PDF con logs embebidos y código `CEXXXX-XXXXXX`.

---

## Catálogo oficial consolidado (10 productos + 2 capas)

| # | Producto | Versión | Tipo | Transacciones | Capas transversales |
|---|---|---|---|---|---|
| 1 | Comercio Electrónico Tradicional | 2.5 | TNP | AUTH, PRE, POS, DEV, CAN, REV, VER | 3DS obligatorio + Cybersource opc |
| 2 | MOTO (Mail Order / Telephone Order) | 1.5 | TNP | AUTH, PRE, POS, DEV, CAN, REV, VER | CIT/MIT (AN5822) |
| 3 | Cargos Periódicos Post | 2.1 | TNP | VTA, DEV, CAN, REV, VER | CIT/MIT |
| 4 | Ventana de Comercio Electrónico (Cifrada) | 1.8 | TNP | VTA (JSON cifrado) | 3DS + Cybersource (SPA) |
| 5 | Comercio Electrónico Agregadores y Aliados | 2.6.4 | TNP | VTA, PRE, POS, DEV, CAN, REV | 3 esquemas + 3DS opc |
| 6 | Cargos Periódicos Agregadores | 2.6.4 | TNP | VTA, DEV, CAN, REV | 3 esquemas + CIT/MIT |
| 7 | API PW2 Seguro | 2.4 | **TP** | 10 (incl. Cashback, Reauth, Cierre) | PinPad local + EMV |
| 8 | Interredes Remoto | 1.7 | **TP** | 10 | PinPad remoto TCP/TLS + EMV |
| — | 3D Secure 2 (capa) | 1.4 | Capa | VTA, PRE, POS | — |
| — | Cybersource Direct (capa) | 1.10 | Capa | Validación | — |

### Reglas transversales
- **3D Secure y Cybersource son capas**, no productos. Se activan por flag en cada producto.
- **Tres esquemas de agregadores** (Esq. 1 Tasa Natural / Esq. 4 Sin AGP / Esq. 4 Con AGP) son sub-variantes del mismo producto — modelan como `subEsquema` dentro del JSON del producto.
- **Mandato AN5822** (MasterCard CIT/MIT) aplica transversalmente a productos con transacciones MC — agrega `PAYMENT_IND`, `AMOUNT_TYPE`, `PAYMENT_INFO` y `COF`.

---

## Matrices R/O/N/A oficiales extraídas

### Producto 1 — Comercio Electrónico Tradicional (v2.5)

| Variable | AUTH | PREAUTH | POSTAUTH | REFUND | VOID | REVERSAL | VERIFY |
|---|---|---|---|---|---|---|---|
| ID_AFILIACION | R | R | R | R | R | R | R |
| USUARIO | R | R | R | R | R | R | R |
| CLAVE_USR | R | R | R | R | R | R | R |
| ID_TERMINAL | R | R | R | R | R | R | R |
| CMD_TRANS | R | R | R | R | R | R | R |
| MONTO | R | R | R | O | N/A | N/A | N/A |
| MODO | R | R | R | R | R | R | R |
| REFERENCIA | O | O | R | R | R | R | O |
| NUMERO_CONTROL | O | O | O | R | O | O | O |
| REF_CLIENTE1..5 | O | O | O | O | O | O | O |
| NUMERO_TARJETA | R | R | R | N/A | N/A | N/A | N/A |
| FECHA_EXP | R | R | R | N/A | N/A | N/A | N/A |
| CODIGO_SEGURIDAD | R | R | R | N/A | N/A | N/A | N/A |
| MODO_ENTRADA | R | R | R | N/A | N/A | N/A | N/A |
| MARKETPLACE_TX | O | O | O | O | O | O | O |
| IDIOMA_RESPUESTA | O | O | O | O | O | O | O |
| **3DS obligatorio:** ESTATUS_3D, ECI, XID, CAVV, VERSION_3D | R | R | R | N/A | N/A | N/A | N/A |

**Variables AMEX (opcional para VENTA/PREAUTH):** DOMICILIO, CODIGO_POSTAL, TELEFONO, CORREO_ELECTRONICO, NOMBRE_CLIENTE_FACTURA, EQUIPO_NOMBRE_CLIENTE, DATOS_BROWSER + datos de entrega (7 campos) + productos/cantidades/precios (hasta 3 items).

**AN5822 MasterCard CIT/MIT:**
- Primera tx (CIT): `IND_PAGO`=U, `TIPO_MONTO`=V|F, `INFO_PAGO`=0
- Subsecuentes (MIT): `CIF`, `IND_PAGO`=8, `TIPO_MONTO`=V|F, `INFO_PAGO`=3

**Valores:** `CMD_TRANS` = VENTA|AUTH | PREAUTH | POSTAUTH | DEVOLUCION|REFUND | CANCELACION|VOID | REVERSA|REVERSAL | VERIFICACION|VERIFY; `MODO` = PRD|AUT|DEC|RND.

### Producto 2 — MOTO (v1.5)

Misma matriz que Producto 1 **sin variables 3DS** y sin AMEX (MOTO no tiene 3DS por diseño — canal telefónico). AN5822 MC con valores ajustados para MOTO: CIT primero (`IND_PAGO`=U, `TIPO_MONTO`=V|F, `INFO_PAGO`=0); MIT subsecuente (`COF`=4, `IND_PAGO`=8, `TIPO_MONTO`=V|F, `INFO_PAGO`=2).

### Producto 3 — Cargos Periódicos Post (v2.1)

| Variable | VTA | DEV | CAN | REV |
|---|---|---|---|---|
| ID_AFILIACION, USUARIO, CLAVE_USR, CMD_TRANS, MODO | R | R | R | R |
| ID_TERMINAL, REF_CLIENTE1,2,4,5, LOTE, IDIOMA_RESPUESTA | O | O | O | O |
| REF_CLIENTE3 | R | R | R | R |
| MONTO | R | O | N/A | N/A |
| REFERENCIA | O | R | R | R |
| NUMERO_CONTROL | R | R | R | R |
| NUMERO_TARJETA, FECHA_EXP, MODO_ENTRADA | R | N/A | N/A | N/A |

No incluye PRE/POS/VER. Requiere AN5822 CIT/MIT para MC.

### Producto 4 — Ventana de Comercio Electrónico Cifrada (v1.8)

Usa **JSON cifrado** (no variables servlet tradicionales). Campos en camelCase:

| Variable | AUTH | PRE | POS | REFUND | VOID | REV |
|---|---|---|---|---|---|---|
| merchantId, name, password, mode, controlNumber, terminalId | R | R | R | R | R | R |
| merchantName, merchantCity, lang | R | R | R | R | R | R |
| amount | R | R | R | R | O | O |
| customerRef1..5 | O | O | O | O | O | O |

**AN5822 MC:** `PAYMENT_IND`=U|R, `AMOUNT_TYPE`=F|V, `PAYMENT_INFO`=0|3 (para VENTA/PREAUTH/POSTAUTH).

### Producto 5 — Comercio Electrónico Agregadores (v2.6.4)

**Base común** (todos los esquemas):

| Variable | AUTH | PRE | POS | REFUND | VOID | REV |
|---|---|---|---|---|---|---|
| ID_AFILIACION, USUARIO, CLAVE_USR, CMD_TRANS, MODO | R | R | R | R | R | R |
| ID_TERMINAL | R | O | O | O | O | O |
| MONTO | R | R | R | O | O | O |
| REFERENCIA | O | O | O | R | R | O |
| NUMERO_CONTROL, REF_CLIENTE1..5, LOTE, IDIOMA_RESPUESTA | O | O | O | O | O | O |
| NUMERO_TARJETA, FECHA_EXP, CODIGO_SEGURIDAD | R | R | R | R | O | O |
| MODO_ENTRADA | R | R | R | R | R | R |

**Sub-esquema "Esquema 4 Con AGP PROSA"** — agrega obligatorios:
- SUB_AFILIACION (R, alfanum 18)
- ID_AGREGADOR (R, num 19)

**Sub-esquema "Esquema 4 Sin AGP"** — agrega TODOS los del anterior + 6 más:
- MERCHANT_MCC (R, num 4)
- DOMICILIO_COMERCIO (R, alfanum 25)
- CODIGO_POSTAL (R, num 10)
- CIUDAD_TERMINAL (R, alfanum 13)
- ESTADO_TERMINAL (R, alfanum 3)
- PAIS_TERMINAL (R, alfanum 2)

**AN5822 MC VENTA:** `PAYMENT_IND`=U|R, `AMOUNT_TYPE`=F|V, `PAYMENT_INFO`=0|3.

### Producto 6 — Cargos Periódicos Agregadores (v2.6.4)

| Variable | VTA | DEV | CAN | REV |
|---|---|---|---|---|
| ID_AFILIACION, USUARIO, CLAVE_USR, CMD_TRANS, MODO | R | R | R | R |
| ID_TERMINAL, NUMERO_CONTROL, REF_CLIENTE1..5, LOTE, IDIOMA_RESPUESTA | O | O | O | O |
| MONTO | R | O | O | O |
| REFERENCIA | R | R | R | O |
| NUMERO_TARJETA, FECHA_EXP, CODIGO_SEGURIDAD | R | R | O | O |
| MODO_ENTRADA | R | R | R | R |

Esquemas 4 Sin/Con AGP igual que Producto 5 (mismos 8 campos adicionales requeridos).

Para MC VENTA: `PAYMENT_IND`=R (cargo recurrente).

### Producto 7 — API PW2 Seguro (Tarjeta Presente v2.4)

| Variable | VTA | PRE | REAUTH | POS | DEV | CAN | REV | CSH | VER |
|---|---|---|---|---|---|---|---|---|---|
| CMD_TRANS, MODO, NUMERO_CONTROL | R | R | R | R | R | R | R | R | R |
| MONTO | R | R | R | R | R | N/A | N/A | R | N/A |
| REFERENCIA | N/A | R | R | R | R | N/A | R | N/A | N/A |
| LOTE | O | R | N/A | N/A | N/A | R | N/A | N/A | N/A |

**CMD_TRANS valores:** VENTA, CASHBACK, VENTA_FORZADA, PREAUTORIZACION, REAUTORIZACION, POSTAUTORIZACION, DEVOLUCION, REVERSA, CIERRE_AFILIACION, CIERRE_LOTE, VERIFICACION, SUSPENSION, REACTIVACION, OBTENER_LLAVE.

**Response** incluye EMV: EMV_TAGS, TVR, TSI, AID, APN, AL (obligatorio para CHIP), TARJETAHABIENTE, BANCO_EMISOR, MARCA_TARJETA, TIPO_TARJETA, MODO_ENTRADA (BANDA|CHIP|MANUAL|CONTACTLESSCHIP|CONTACTLESSBANDA).

### Producto 8 — Interredes Remoto (Tarjeta Presente v1.7)

**⚠️ Diferente**: API basada en **funciones SDK** (`PPSetCommand()`, `PPSetTransactionAmount()`, etc.), NO variables servlet. La validación del bot se limita a verificar que los logs generados por el dispositivo contengan los campos esperados.

**Campos en logs (Response)**: Todos los `PPGet*()` — `PPGetPaywResult()` (A|D|R|T), `PPGetControlNumber()`, `PPGetAuthCode()`, `PPGetCardType()`, `PPGetCardBrand()`, `PPGetEntryMode()`, `PPGetBin()`, `PPGetPan()`, `PPGetCardExpireDate()`, `PPGetPINRequested()` (1|2|0), `PPGetAppPrefName()` (EMV TAG 9F12), `PPGetAppLabel()` (TAG 50), `PPGetAppID()` (TAG 4F), `PPGetTVR()` (TAG 95), fechas `PPGetCustReqDate/AuthReqDate/CustRespDate/AuthRespDate`.

**Funciones de entrada** (tipados como `const char*` o `float`): PPSetCommPort, PPSetIPAddressPort, PPSetUser, PPSetPassword, PPSetCommand, PPSetTransactionAmount, PPSetCashBackAmount, PPSetMode, PPSetPaywReference, PPSetGroup, PPSetAuthCode, PPSetControlNumber, PPSetCustomerRef1..5, PPSetPlanType, PPSetPaymentNumber, PPSetDeferment.

### Capa 3DS (v1.4) — reglas de validación

Aplicable a Tradicional, Agregadores E-comm, Ventana CE (no a MOTO, Cargos Periódicos, Tarjeta Presente).

**Pre-3DS (variables de entrada al servicio 3DS):**

| Variable | VTA | PRE | POS |
|---|---|---|---|
| NUMERO_TARJETA, FECHA_EXP, MONTO, MARCA_TARJETA, ID_AFILIACION, NOMBRE_COMERCIO, CIUDAD_COMERCIO | R | R | R |

**Post-3DS (variables que el comercio debe incluir en el POST a Payworks):**

| Variable | Valor |
|---|---|
| ESTATUS_3D | R (200 = auth exitoso; ≠200 = falló) |
| ECI | R (01, 02, 05, 06, 07) |
| XID | R para VISA/AMEX; MC no genera |
| CAVV | R (VISA/MC/AMEX) |
| VERSION_3D | R (valor fijo = 2) |

**Regla especial**: si XID o CAVV retornan nulo/blanco, NO enviar al POST a Payworks.

### Capa Cybersource Direct (v1.10) — reglas de validación

Aplicable a Tradicional, Ventana CE.

| Variable | Validación |
|---|---|
| BillTo_firstName, BillTo_lastName, BillTo_street, BillTo_streetNumber, BillTo_street2Col, BillTo_street2Del, BillTo_city, BillTo_state, BillTo_country, BillTo_phoneNumber, BillTo_postalCode, BillTo_email | R |
| BillTo_streetNumber2 | O |
| BillTo_customerID, BillTo_customerPassword, BillTo_dateOfBirth, BillTo_hostname | O |
| Card_accountNumber, Card_cardType (001|002), Card_expirationMonth, Card_expirationYear | R |
| DeviceFingerprintID, Name (usuario Payworks2), Password, MerchantNumber, TerminalId, OrderId | R |

**Response clave:** `Decision` (ACCEPT|REVIEW|REJECT|ERROR) — determina flujo downstream (ACCEPT→Payworks; REVIEW→3DS; REJECT→fin).

---

## Glosario español↔inglés (construido desde logs y manuales)

**Decisión de modelado**: JSON de reglas **indexado por `logName`** (lo que el validador realmente encuentra en el log), con campos alias `manualName` y `displayName` para UI y referencias al manual.

**Realidad de nomenclatura detectada:**
- Manuales TNP (Tradicional, MOTO, Cargos Post, Agregadores, 3DS): variables en **español MAYÚSCULAS_SNAKE**
- Manual Ventana CE + Cybersource: variables en **inglés camelCase**
- Manual Interredes Remoto: API basada en funciones SDK (`PPSet*` / `PPGet*`)
- Logs servlet/3DS/agregadores: **inglés MAYÚSCULAS_SNAKE** (`MERCHANT_ID`, `USER`, `AMOUNT`)
- Log Cybersource: **camelCase** con prefijos (`BillTo_`, `Card_`, `PurchaseTotals_`)
- Log 3DS: mix — algunos campos español (`Nombre:`, `Ciudad:`), otros inglés (`MerchantId:`, `Reference3D:`)

### Tabla de equivalencias (v1.0 — construida de los 5 logs + 10 manuales)

**Servlet base (confirmado en logs ZIGU/OPENLINEA/DLOCAL):**

| Manual (español) | Log real | Tipo | Notas |
|---|---|---|---|
| ID_AFILIACION | MERCHANT_ID | num(9) | ✓ confirmado |
| USUARIO | USER | alfanum | ✓ |
| CLAVE_USR | — | — | NO se logea (password, seguridad) |
| ID_TERMINAL | TERMINAL_ID | num | ✓ |
| CMD_TRANS | CMD_TRANS | enum | ✓ mismo nombre |
| MONTO | AMOUNT | decimal | ✓ |
| MODO | MODE | enum | ✓ (PRD/AUT/DEC/RND) |
| REFERENCIA | REFERENCE | alfanum | ✓ (en respuesta) |
| NUMERO_CONTROL | CONTROL_NUMBER | alfanum | ✓ |
| REF_CLIENTE1..5 | CUSTOMER_REF1..5 | alfanum | ⚠️ ZIGU usa también `CUST_REF3` (alias) |
| NUMERO_TARJETA | CARD_NUMBER | masked | ✓ (aparece enmascarado `518899******7492`) |
| FECHA_EXP | (no en request log) | date | — probablemente `CARD_EXP` en response |
| CODIGO_SEGURIDAD | — | — | NO se logea (seguridad) |
| MODO_ENTRADA | ENTRY_MODE | enum | ✓ |
| IDIOMA_RESPUESTA | RESPONSE_LANGUAGE | enum | ✓ |
| LOTE | — | — | AMBIGUO (no visto en logs) |
| MARKETPLACE_TX | — | — | AMBIGUO |

**Agregadores (confirmado en DLOCAL/OPENLINEA):**

| Manual | Log real | Tipo | Notas |
|---|---|---|---|
| SUB_AFILIACION | SUB_MERCHANT | alfanum(18) | ✓ |
| ID_AGREGADOR | AGGREGATOR_ID | num(19) | ✓ |
| MERCHANT_MCC | MERCHANT_MCC | num(4) | ✓ igual |
| DOMICILIO_COMERCIO | DOMICILIO_COMERCIO | alfanum(25) | ✓ igual |
| CODIGO_POSTAL | ZIP_CODE | num | ✓ |
| CIUDAD_TERMINAL | TERMINAL_CITY | alfanum(13) | ✓ |
| ESTADO_TERMINAL | ESTADO_TERMINAL | alfanum(3) | ✓ igual |
| PAIS_TERMINAL | TERMINAL_COUNTRY | alfanum(2) | ✓ |
| — | NUMERO_BIN | num(6) | Solo en logs, no en manual |
| — | EMV_TAGS | hex | OPENLINEA Chip (no aparece en ZIGU) |
| — | GATEWAY_ID | num | Solo ZIGU Esq.1 |

**AN5822 CIT/MIT (no confirmado en logs pero sí en manuales):**

| Manual | Log esperado | Valores |
|---|---|---|
| PAYMENT_IND / IND_PAGO | PAYMENT_IND | U, R, 8, 4 |
| AMOUNT_TYPE / TIPO_MONTO | AMOUNT_TYPE | F, V |
| PAYMENT_INFO / INFO_PAGO | PAYMENT_INFO | 0, 2, 3 |
| COF | COF | 4 |
| CIF | CIF | alfanum |

**3DS (confirmado en LOG 3D SECURE.txt — ⚠️ usa nombres distintos a manual):**

| Manual (pre-3DS) | Log real 3DS | Notas |
|---|---|---|
| NUMERO_TARJETA | Card | formato `41891431******56` |
| FECHA_EXP | — | AMBIGUO (no visto explícito) |
| MONTO | Total | decimal |
| MARCA_TARJETA | CardType | "VISA" / "MASTERCARD" |
| ID_AFILIACION | MerchantId | num |
| NOMBRE_COMERCIO | MerchantName | alfanum |
| CIUDAD_COMERCIO | MerchantCity | alfanum |

| Manual (post-3DS) | Log real 3DS | Notas |
|---|---|---|
| ESTATUS_3D | Cert3D | `03` en el log (no `200` como dice manual — ⚠️ AMBIGUO) |
| ECI | ECI | `05` |
| XID | XID | hex 40 chars |
| CAVV | CAVV | hex 40 chars |
| VERSION_3D | Version3D | `2` |
| — | ForwardPath | URL callback |
| — | Reference3D | alfanum — identificador único |
| — | Status | `200` HTTP status |

**Cybersource (confirmado en LOG CYBERSOURCE.txt):**

Los nombres del manual coinciden con los del log **excepto que el log agrupa por secciones:**
- Request: `VARIABLES EN ENVÍO` → mismas variables (BillTo_*, Card_*, PurchaseTotals_*, MerchantID, OrderId, MerchantNumber, TerminalId, DeviceFingerprintID, Comments, Mode, Name, Review, MerchantDefinedData_field[N])
- Response: `VARIABLES DE RETORNO` → decision, requestID, reasonCode, OrderId, afsReply_afsResult, Bnte_code

**Tarjeta Presente (API PW2 + Interredes Remoto):**

Los logs usan el mismo formato que servlet TNP pero añaden campos EMV: `EMV_TAGS`, `TVR`, `TSI`, `AID`, `APN`, `AL`, `TARJETAHABIENTE`, `TIPO_TARJETA`, `BANCO_EMISOR`, `MARCA_TARJETA`. Para Interredes Remoto los valores vienen de funciones `PPGet*()` pero acaban logueados con los mismos nombres.

### Campos marcados como AMBIGUO (requieren log real para confirmar)

- `FECHA_EXP` en logs (nombre probable `CARD_EXP` o `EXPIRATION`)
- `LOTE`, `MARKETPLACE_TX` — no aparecen en los 5 logs
- `ESTATUS_3D` valor `200` vs `03` — el log muestra `Cert3D: [03]`, conflicto con manual
- 20+ campos AMEX del Tradicional (DOMICILIO, TELEFONO, DATOS_BROWSER, etc.)

### Implementación del glosario

Un archivo centralizado `src/config/variable-glossary.json` con la tabla completa + flag `ambiguous`:

```json
{
  "ID_AFILIACION": { "logName": "MERCHANT_ID", "displayName": "ID Afiliación", "ambiguous": false },
  "FECHA_EXP":     { "logName": "CARD_EXP", "displayName": "Fecha Expiración", "ambiguous": true, "note": "nombre en log no confirmado" }
}
```

El `MandatoryFieldsConfig` consulta este glosario para traducir al escribir/leer JSONs. La UI usa `displayName` para mostrar; la validación usa `logName`.

### Schema JSON de reglas (confirmado)

```json
{
  "integrationType": "ECOMMERCE_TRADICIONAL",
  "manualVersion": "2.5",
  "displayName": "Comercio Electrónico Tradicional",
  "servlet": {
    "MERCHANT_ID": {
      "manualName": "ID_AFILIACION",
      "displayName": "ID Afiliación",
      "dataType": "numeric(9)",
      "ambiguous": false,
      "rules": {
        "AUTH": "R", "PREAUTH": "R", "POSTAUTH": "R",
        "REFUND": "R", "VOID": "R", "REVERSAL": "R", "VERIFY": "R"
      }
    },
    "USER": {
      "manualName": "USUARIO",
      "displayName": "Usuario",
      "dataType": "alphanum",
      "rules": { ... }
    }
  },
  "threeds": { ... },
  "cybersource": { ... },
  "an5822": { "CIT": {...}, "MIT": {...} },
  "subEsquemas": { "ESQ_1": {...}, "ESQ_4_SIN_AGP": {...}, "ESQ_4_CON_AGP": {...} }
}
```

---

## Ejes de implementación

### Eje 1 — Modelo de dominio

**`IntegrationType` (reescribir):**
```ts
export enum IntegrationType {
  ECOMMERCE_TRADICIONAL = 'ECOMMERCE_TRADICIONAL',
  MOTO = 'MOTO',
  CARGOS_PERIODICOS_POST = 'CARGOS_PERIODICOS_POST',
  VENTANA_COMERCIO_ELECTRONICO = 'VENTANA_COMERCIO_ELECTRONICO',
  AGREGADORES_COMERCIO_ELECTRONICO = 'AGREGADORES_COMERCIO_ELECTRONICO',
  AGREGADORES_CARGOS_PERIODICOS = 'AGREGADORES_CARGOS_PERIODICOS',
  API_PW2_SEGURO = 'API_PW2_SEGURO',
  INTERREDES_REMOTO = 'INTERREDES_REMOTO',
}
```
+ `getDisplayName()`, `getConfigFileName()`, `getManualVersion()`, `isTarjetaPresente()`, `supportsLayer(layer)`, `getSubSchemes()` (solo agregadores).

**`TransactionType` (extender):**
```ts
export enum TransactionType {
  AUTH = 'AUTH', VOID = 'VOID', REFUND = 'REFUND',
  PREAUTH = 'PREAUTH', POSTAUTH = 'POSTAUTH', VERIFY = 'VERIFY',
  REVERSAL = 'REVERSAL',        // NUEVO
  CASHBACK = 'CASHBACK',        // NUEVO
  REAUTH = 'REAUTH',            // NUEVO (solo Tarjeta Presente)
}
```
+ CMD_TRANS updates y `getProsaMessagePair()` para nuevos tipos.

**`ValidationLayer` (nuevo VO):**
```ts
export enum ValidationLayer {
  SERVLET = 'SERVLET',
  THREEDS = 'THREEDS',
  CYBERSOURCE = 'CYBERSOURCE',
  AGREGADOR = 'AGREGADOR',
  EMV = 'EMV',           // Tarjeta Presente
  AN5822 = 'AN5822',     // CIT/MIT MasterCard
}
```

**`AggregatorScheme` (nuevo VO):**
```ts
export enum AggregatorScheme {
  ESQ_1_TASA_NATURAL = 'ESQ_1',
  ESQ_4_SIN_AGP = 'ESQ_4_SIN_AGP',
  ESQ_4_CON_AGP = 'ESQ_4_CON_AGP',
}
```

**JSON schema por producto (formato):**
```json
{
  "integrationType": "ECOMMERCE_TRADICIONAL",
  "manualVersion": "2.5",
  "displayName": "Comercio Electrónico Tradicional",
  "manualDate": "2025-06-19",
  "servlet": {
    "ID_AFILIACION": {
      "logName": "MERCHANT_ID",
      "dataType": "numeric(9)",
      "rules": {
        "AUTH_VISA": "R", "AUTH_MC": "R",
        "PREAUTH_VISA": "R", ...
      }
    },
    ...
  },
  "threeds": { ... },       // si aplica
  "cybersource": { ... },   // si aplica
  "an5822": {               // CIT/MIT MasterCard
    "CIT": { "IND_PAGO": { "logName":"PAYMENT_IND","fixedValue":"U","rule":"R" }, ... },
    "MIT": { ... }
  },
  "subEsquemas": {          // solo agregadores
    "ESQ_1": { "required": [...] },
    "ESQ_4_SIN_AGP": { "required": [...] },
    "ESQ_4_CON_AGP": { "required": [...] }
  }
}
```

**Archivos a crear/modificar:**
- `src/core/domain/value-objects/IntegrationType.ts` (reescribir)
- `src/core/domain/value-objects/TransactionType.ts` (extender con REVERSAL, CASHBACK, REAUTH)
- `src/core/domain/value-objects/ValidationLayer.ts` (nuevo)
- `src/core/domain/value-objects/AggregatorScheme.ts` (nuevo)
- `src/config/mandatory-fields/*.json` — 8 archivos (borrar los 6 actuales y crear los 8 nuevos + 2 archivos para capas: `layer-3ds.json`, `layer-cybersource.json`, `layer-an5822.json`)
- `src/infrastructure/mandatory-rules/MandatoryFieldsConfig.ts` (registrar 8 matrices)
- `src/presentation/components/UploadCard.tsx` (8 cards + badges de "Tarjeta Presente")
- `src/app/resultados/[id]/page.tsx` (display names nuevos)

---

### Eje 2 — Parsers de logs

**Hallazgos por formato:**

| Capa | Formato | Identificador | Parser |
|---|---|---|---|
| Servlet TNP | `********` + `NOMBRE: [valor]` | `CONTROL_NUMBER` | ✅ Existente — confirmar acepta nuevos campos agregador |
| 3DS | Mismo formato que servlet | `FOLIO DE TRANSACCION` (ej. `9905419_140426_XXX`) | Nuevo: `ThreeDSLogParser` |
| Cybersource | `[INFO]` / `[WARN] campo: valor` (sin corchetes) | `OrderId` / `MerchantReferenceCode` | Nuevo: `CybersourceLogParser` |
| Servlet Tarjeta Presente | Mismo formato que TNP pero con EMV_TAGS, TVR, TSI extra | `CONTROL_NUMBER` | Extender el existente |

**Archivos nuevos:**
- `src/core/domain/ports/ThreeDSLogParserPort.ts` — `parseByFolio(content, folio)`
- `src/core/domain/ports/CybersourceLogParserPort.ts` — `parseByOrderId(content, orderId)`
- `src/core/domain/entities/ThreeDSLogEntity.ts` — `Map<string, string>` + `hasField/getField`
- `src/core/domain/entities/CybersourceLogEntity.ts` — idem
- `src/infrastructure/log-parsers/ThreeDSLogParser.ts`
- `src/infrastructure/log-parsers/CybersourceLogParser.ts`

**Extender existentes:**
- `src/core/domain/ports/LogRetrievalPort.ts` — agregar `getThreeDSLog(folio, date)` y `getCybersourceLog(orderId, date)`
- `src/infrastructure/log-retrieval/FileUploadLogRetrieval.ts` — `setThreeDSLog/setCybersourceLog`
- `src/core/application/use-cases/RunCertificationUseCase.ts` — cablear capas por flag del producto
- `src/infrastructure/di/DIContainer.ts` — registrar los 2 parsers

**UI:** `UploadCard.tsx` condiciona drag-drop adicional al producto seleccionado (3DS y Cybersource solo para productos 1, 4, 5; EMV para 7, 8).

**Fixtures de test** (ya disponibles):
- `LOG 3D SECURE.txt` → ThreeDSLogParser
- `LOG CYBERSOURCE.txt` → CybersourceLogParser
- `LOGS ZIGU - ESQUEMA 1.txt` → ServletParser (Esq.1 agregador)
- `LOG OPENLINEA - ESQUEMA 4 SIN AGP.txt` → ServletParser (Esq.4 Sin AGP)
- `LOG DLOCAL - ESQUEMA 4 CON AGP.txt` → ServletParser (Esq.4 Con AGP)

---

### Eje 3 — Afiliaciones cargadas por el usuario (CSV/TXT)

**Decisión de producto**: el usuario **NO controla la fuente** de la tabla `NPAYW.AFILIACIONES` y necesita trabajar con la versión más actualizada en cada corrida. Por tanto:

- **Fuente primaria**: el usuario sube un **CSV o TXT** (export del `SELECT * FROM NPAYW.AFILIACIONES`) en la misma pantalla donde sube la matriz Excel + logs.
- **NO se conecta a Oracle** (descartado como dependencia del bot). El usuario refresca el export cuando lo necesita.
- El archivo subido se procesa en memoria durante la sesión; no se persiste.

**Formato aceptado del CSV/TXT** (auto-detectado):
- **CSV**: primera fila = headers (tolerante a nombre en español o inglés), separador `,` o `;`, texto entre comillas opcional.
- **TXT**: export plano estilo SQL Plus (columnas con anchos fijos o separadas por pipes). Parser detecta formato heurísticamente.
- **Encoding**: UTF-8 o Latin-1 (auto-detect).

**Schema esperado** (columnas comunes — no todas obligatorias; el parser mapea por nombre):

| Columna (probable) | Uso en carta | Obligatoria |
|---|---|---|
| AFILIACION / ID_AFILIACION | Key de búsqueda | ✅ |
| NOMBRE_COMERCIO / RAZON_SOCIAL | Nombre en carta | ✅ |
| RFC | Carta | ✅ |
| NUMERO_CLIENTE / ID_CLIENTE | Carta | ✅ |
| GIRO / MCC_DESCRIPCION | Carta | recomendado |
| ESQUEMA / TIPO_INTEGRACION | Carta | recomendado |
| DIRECCION, CIUDAD, ESTADO, CP | Carta | opcional |
| EMAIL, TELEFONO | Carta | opcional |
| USUARIO | Referencia | opcional |
| STATUS | Validación (A=Activo) | opcional |

El parser es **tolerante**: si una columna no existe, la carta se genera con `—` en ese placeholder.

**Archivos:**
- `src/core/domain/entities/Afiliacion.ts` (nuevo) — entidad con todos los campos posibles (todos opcionales excepto ID).
- `src/core/domain/ports/AfiliacionRepositoryPort.ts` — `findByIdAfiliacion(id)`, `existsById(id)`, `loadFromFile(buffer: Buffer, filename: string)`.
- `src/infrastructure/repositories/InMemoryAfiliacionRepository.ts` — implementación única, se hidrata al cargar el archivo.
- `src/infrastructure/parsers/AfiliacionFileParser.ts` — auto-detecta CSV vs TXT, mapea headers flexibles a entidad.
- `src/presentation/components/UploadCard.tsx` — **drag-drop adicional** para archivo de afiliaciones (4to input junto a matriz, servlet, PROSA).
- `src/core/application/use-cases/RunCertificationUseCase.ts` — cachea afiliaciones del archivo cargado; consulta por `MERCHANT_ID` al validar.
- `src/app/resultados/[id]/page.tsx` — card "Datos de Afiliación" con datos consultados.

**NO se instala driver Oracle. NO hay ENV vars de BD.**

**Futuro** (fuera de alcance de este plan): si en algún momento se decide automatizar, se puede agregar un `OracleAfiliacionRepository` como segundo adaptador sin tocar el flujo actual.

---

### Eje 4 — Carta de Certificación Oficial

**Formato oficial** (extraído de `CE3DS-0003652_9885405 MUEVE CIUDAD.pdf`):

**Portada**: Título `CERTIFICACIÓN COMERCIO ELECTRONICO CON 3D SECURE` (adaptable por producto) + fecha + versión + logo Banorte + decoración rojo.

**Sección 1 — Datos del proceso**:
- Coordinador Certificación
- Datos afiliación (tabla): nombre comercio, RFC, número cliente, afiliación
- Información técnica: esquema, modo transmisión, mensajería, lenguaje, tarjetas procesadas, giro
- Modo lectura, versión aplicación
- Responsable (nombre, email, teléfono, dirección)

**Sección 2 — Matriz de pruebas** (tabla con transacciones validadas, veredicto por cada una).

**Sección 3 — Notas técnicas** (referencias a manuales + variables CIT/MIT + responsabilidades + aclaración modo PRD).

**Sección 4 — Logs técnicos completos** (SERVLET + PROSA + 3DS + Cybersource) en monoespaciado, uno por transacción.

**Sección 5 — Tabla resumen afiliación** (datos de BD).

**Firma**: Persona autorizada (Soporte Técnico Payworks) + número certificado `CEXXXX-NNNNNNN_AFILIACION`.

**22 placeholders identificados** — ver tabla completa en memoria/contexto de conversación previa.

**Implementación:**
- `src/config/templates/certification-letter-template.html` — template con placeholders `{{CODIGO_CERTIFICADO}}`, `{{NOMBRE_COMERCIO}}`, etc.
- `src/core/domain/value-objects/CertificationLetterData.ts` — DTO con los 22 campos
- `src/presentation/utils/certification-letter-generator.ts` — motor de sustitución; usar `@react-pdf/renderer` (instalar) o `puppeteer` para render
- `src/app/api/certificacion/carta/[id]/route.ts` — endpoint que descarga el PDF
- Hook UI: botón "Descargar Carta Oficial" en `src/app/resultados/[id]/page.tsx`
- Generador de código de certificado: `CE{PREFIJO_PRODUCTO}-{CONSECUTIVO}_{AFILIACION}` donde el consecutivo viene de tabla/sequence de BD (pendiente decidir).

**Dependencia nueva**: `npm i @react-pdf/renderer` (~300 KB) o `npm i puppeteer` (~300 MB — preferible pdf-renderer por tamaño).

---

## Orden de ejecución por fases (con commit por fase)

Cada fase termina con **1 commit autocontenido** (type-check limpio + tests verdes si hay cambios que los afecten). Formato de mensaje: `feat(payworks-bot): <descripción>` o `fix(payworks-bot): …`.

| Fase | Alcance | Commit |
|---|---|---|
| **F1** | Glosario maestro (`variable-glossary.json`) + entidad `VariableGlossary` + helper `GlossaryService`. | `feat(payworks-bot): add variable glossary ES↔EN for validation layer` |
| **F2** | Reescribir `IntegrationType` enum + `TransactionType` (añadir REVERSAL, CASHBACK, REAUTH) + VOs nuevos `ValidationLayer`, `AggregatorScheme`. | `feat(payworks-bot): align IntegrationType and TransactionType with official manuals` |
| **F3** | Nuevo schema JSON (logName-indexed) en `MandatoryFieldsConfig` + adaptar port `MandatoryFieldsPort` + actualizar `ValidateTransactionFieldsUseCase` para leer nombre `logName`. | `refactor(payworks-bot): index mandatory fields by logName` |
| **F4** | Generar **8 JSONs de productos** + **3 JSONs de capas** (3DS, Cybersource, AN5822) con matrices R/O/N/A oficiales. Borrar/migrar los 6 actuales. | `feat(payworks-bot): add official R/O/N/A matrices for 10 products + 3 layers` |
| **F5** | Parser `CybersourceLogParser` (formato distinto) + puerto + entidad + DI + fixtures test. | `feat(payworks-bot): add Cybersource log parser` |
| **F6** | Parser `ThreeDSLogParser` + puerto + entidad + DI + fixtures test. | `feat(payworks-bot): add 3D Secure log parser` |
| **F7** | `AfiliacionFileParser` (CSV/TXT) + entidad + repositorio in-memory + drag-drop en UploadCard. | `feat(payworks-bot): add affiliations file upload (CSV/TXT)` |
| **F8** | Cablear todo en `RunCertificationUseCase`: matriz + logs + afiliaciones + validación multi-capa. Actualizar UI de resultados (card afiliación + agrupación por `ValidationLayer`). | `feat(payworks-bot): wire end-to-end certification flow with all layers` |
| **F9** | Template HTML de carta + `CertificationLetterData` + generador PDF (`@react-pdf/renderer`) + endpoint `/api/certificacion/carta/[id]` + botón descarga en UI. | `feat(payworks-bot): generate official certification letter PDF` |
| **F10** | Actualizar `UploadCard` con los 8 productos (2 con badge "Tarjeta Presente") + drag-drops condicionales al producto. Ajustes finales de UI. | `feat(payworks-bot): update product selector with 10 integrations and conditional inputs` |

**Criterio de commit**: al final de cada fase, `npx tsc --noEmit` pasa limpio y `npm test` corre sin regresiones. Se valida la app en dev antes de committear si hay cambios de UI.

**Documento de pendientes para Ramsses**: se genera en paralelo como `docs/preguntas-ramsses.md` (ver sección siguiente); se actualiza incrementalmente cuando en cualquier fase aparece una ambigüedad.

---

## Verificación end-to-end

- `apps/payworks-bot && npx tsc --noEmit` — type-check limpio
- `apps/payworks-bot && npm test` — Jest + fixtures con los 5 logs + test de generador de carta
- `npm run dev` → http://localhost:3006:
  1. Seleccionar cada producto del selector actualizado (8 cards, con badge "TP" en 2 de ellos)
  2. Subir matriz Excel + logs correspondientes (UI condiciona los drag-drop al producto)
  3. Verificar tabla de resultados agrupa por `ValidationLayer`
  4. Verificar card "Datos de Afiliación" se rellena desde CSV/Oracle
  5. Descargar carta PDF y comparar visualmente con `CE3DS-0003652_9885405 MUEVE CIUDAD.pdf`
- Casos negativos: matriz con `ID_AFILIACION` no existente; log 3DS malformado; producto TP sin EMV_TAGS.

---

## Documento de pendientes para Ramsses

Se crea el archivo `docs/preguntas-ramsses.md` en el repo con todas las ambigüedades encontradas durante exploración + implementación. Vive al lado del código para que cualquiera del equipo pueda responder o agregar items.

### Estructura inicial del documento

```markdown
# Preguntas pendientes para Ramsses Bautista — Certificación Payworks Bot

> Última actualización: YYYY-MM-DD

## 1. Nomenclatura de variables

- **P1.1** — ¿Existe glosario oficial español↔inglés de variables Payworks? ¿Podemos tenerlo?
- **P1.2** — Confirmar mapeos ambiguos:
  - `FECHA_EXP` → ¿nombre en log? (hipótesis: `CARD_EXP`)
  - `LOTE` → ¿aparece en logs?
  - `MARKETPLACE_TX` → ¿nombre en log?
- **P1.3** — `ESTATUS_3D`: el manual dice `200`=exitoso, pero el log muestra `Cert3D: [03]`. ¿Cuál es el valor real validable?

## 2. Tarjeta Presente (API PW2 Seguro e Interredes Remoto)

- **P2.1** — ¿El comercio tiene acceso a los logs generados por el dispositivo PinPad? (Necesario para certificar estos productos.)
- **P2.2** — Para Interredes Remoto (API SDK), ¿qué formato tienen los logs? ¿Se usa el mismo formato que servlet TNP?
- **P2.3** — ¿Los campos EMV (TVR, TSI, AID, EMV_TAGS) son obligatorios en el log para validar, o solo informativos?

## 3. Mandato AN5822 CIT/MIT MasterCard

- **P3.1** — ¿Cómo distinguir transacciones CIT vs MIT para evaluar qué reglas aplican? ¿Viene del usuario en la matriz Excel, del log, o de histórico de la afiliación?
- **P3.2** — Confirmar aplicabilidad por producto: ¿aplica a todos los productos con MC o solo a algunos?

## 4. Esquemas de Agregadores

- **P4.1** — ¿Cómo identifica el bot automáticamente si una transacción es Esq.1, Esq.4 Sin AGP, o Esq.4 Con AGP? ¿Se declara en la matriz Excel?
- **P4.2** — ¿El "AGP" es un campo específico en el log o se deduce por presencia/ausencia de otros campos?

## 5. Carta de certificación

- **P5.1** — ¿Cuál es la regla de generación del **número de certificado** (`CE3DS-0003652_9885405`)?
  - Formato: `CE{PRODUCTO}-{CONSECUTIVO}_{AFILIACION}` ¿correcto?
  - ¿De dónde viene el consecutivo `0003652`? ¿Secuencia global? ¿Por afiliación? ¿Por producto?
- **P5.2** — ¿Bajo qué criterio se emite la carta?
  - ¿Solo si todas las transacciones son `APROBADO`?
  - ¿Se permite emitir con observaciones si hay `RECHAZADO`?
- **P5.3** — ¿Los logs técnicos embebidos en el PDF son siempre de **TODAS** las transacciones probadas o solo de las relevantes?
- **P5.4** — Firma del validador: ¿nombre fijo de coordinador por proyecto, o se captura cada vez?
- **P5.5** — ¿La carta tiene formato visual específico (prefijo, logos, márgenes) que deba replicarse pixel-perfect, o basta con la estructura y placeholders?

## 6. Campos opcionales especiales

- **P6.1** — **AMEX en Tradicional**: ¿los 20+ campos AMEX (DOMICILIO, TELEFONO, datos de entrega, productos, DATOS_BROWSER) son obligatorios en VENTA/PREAUTH AMEX, o siguen siendo opcionales?
- **P6.2** — `MARKETPLACE_TX`: ¿qué es? ¿En qué casos aplica?
- **P6.3** — Variables 3DS Ventana CE cifrada: el manual está cifrado en JSON; ¿hay un esquema público del JSON o hay que inferirlo?

## 7. Formato del archivo de afiliaciones

- **P7.1** — Cuando el usuario exporte `SELECT * FROM NPAYW.AFILIACIONES`, ¿qué formato usa típicamente (CSV, TXT con pipes, Excel)? ¿En qué encoding?
- **P7.2** — ¿Cuál es el separador y cuáles son los nombres reales de columnas? (Para afinar el auto-parser.)

## 8. Tipos de transacción nuevos

- **P8.1** — `REVERSAL`: ¿se comporta igual que `VOID`? ¿Cuándo se usa cada una?
- **P8.2** — `CASHBACK`: solo Tarjeta Presente. Confirmar que no aplica a productos TNP.
- **P8.3** — `REAUTH` (Reautorización): solo aparece en TP. Confirmar regla temporal (ej. "solo válida dentro de X días de la PREAUTH").

---

## Cómo usar este documento

- Cada pregunta tiene un ID (`PX.Y`) para poder referenciarla desde código o issues.
- Cuando se responda una pregunta, se marca con ✅ y se añade la respuesta inline.
- Se prioriza responder P5.* (carta) y P7.* (formato afiliaciones) porque son bloqueantes de F7-F9.
```

El archivo se crea en la **Fase 1** y se edita en cada fase posterior cuando surjan nuevas dudas.

---

## Riesgos y decisiones resueltas/pendientes

### Decididas
- ✅ **Fuente de afiliaciones**: CSV/TXT subido por el usuario (no Oracle).
- ✅ **Indexación JSON**: por `logName` con alias `manualName`/`displayName`.
- ✅ **3DS y Cybersource**: capas transversales (no productos independientes).
- ✅ **Esquemas de agregadores**: sub-variantes del mismo producto (no productos separados).
- ✅ **Commits granulares**: uno por fase (10 fases, 10 commits).

### Pendientes (ir a `docs/preguntas-ramsses.md`)
- **Regla de generación del código de certificado** (F9).
- **Criterio de emisión de carta** (solo APROBADO o con observaciones).
- **Formato real del CSV de afiliaciones** (para calibrar parser).
- **Mapeos ambiguos de variables** (FECHA_EXP, LOTE, MARKETPLACE_TX).
- **ESTATUS_3D**: valor real validable (200 vs 03).
- **AMEX, MARKETPLACE_TX, REAUTH** — casos de uso específicos.

---

## Archivos críticos

- Dominio: `src/core/domain/value-objects/{IntegrationType,TransactionType,FieldRequirement,ValidationLayer,AggregatorScheme}.ts`
- Matrices: `src/config/mandatory-fields/*.json` (8 productos + 3 capas = 11 archivos)
- Parsers: `src/infrastructure/log-parsers/{PayworksServletLogParser,PayworksProsaLogParser,ThreeDSLogParser,CybersourceLogParser}.ts`
- Use case validación: `src/core/application/use-cases/ValidateTransactionFieldsUseCase.ts`
- Use case orquestación: `src/core/application/use-cases/RunCertificationUseCase.ts`
- Repositorios: `src/infrastructure/repositories/{Oracle,Csv}AfiliacionRepository.ts`
- Template carta: `src/config/templates/certification-letter-template.html`
- Generador carta: `src/presentation/utils/certification-letter-generator.ts`
- UI: `src/presentation/components/UploadCard.tsx`, `src/app/resultados/[id]/page.tsx`
- DI: `src/infrastructure/di/DIContainer.ts`
- API: `src/app/api/certificacion/{validar,carta/[id]}/route.ts`
