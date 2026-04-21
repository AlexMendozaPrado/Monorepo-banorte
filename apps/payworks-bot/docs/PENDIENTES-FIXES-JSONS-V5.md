# Pendientes tras aplicar fixes JSONs v5

**Fecha**: 2026-04-21
**Contexto**: Se aplicó la opción A del rollout de correcciones v5 sobre los 12 JSONs de `apps/payworks-bot/src/config/mandatory-fields/`, más el parche `PROHIBITED` en `FieldRequirement.ts`. Este documento lista el trabajo que quedó fuera del commit y que hay que programar.

---

## ✅ Qué SÍ se aplicó en este commit

- Se eliminaron 5 JSONs legacy sin imports:
  - `agregadores-cargos-auto.json`
  - `agregadores-ecomm.json`
  - `ventana-comercios.json`
  - `cybersource-directo.json`
  - `ecommerce-tokenizacion.json`
- Se reemplazaron los 12 JSONs activos con las versiones v5 (cobertura global ~65% → ~87%).
- Se parchó `apps/payworks-bot/src/core/domain/value-objects/FieldRequirement.ts` para soportar la regla `PROHIBITED`:
  - Añadido a `FieldRule`, `FailReason`, `validate()` y `getDisplayName()`.
  - Rama nueva en `evaluateDetailed()`: si el campo está presente con valor → `FAIL reason=prohibited`; si está ausente → `PASS`.
- Typecheck limpio (0 errores).
- 180/181 tests pasando (la regresión se explica en §2).

---

## 1. Wiring pendiente en el motor (P0 — bloqueante para usar los JSONs nuevos)

### 1.1 Cargar `layer-an5822.json` y `response-rules.json` en `DIContainer`

**Archivo**: `apps/payworks-bot/src/infrastructure/di/DIContainer.ts`

Actualmente sólo se importan `layer-3ds.json` y `layer-cybersource.json`. Los dos nuevos fueron reemplazados pero nada los consume todavía. Falta:

- Añadir imports para `layer-an5822.json` y `response-rules.json`.
- Inyectarlos en `RunCertificationUseCase` (o crear un nuevo use case para reglas de respuesta).
- Propagar el uso en `ValidateTransactionFieldsUseCase` según el flujo de producto.

### 1.2 Declaración de flujo AN5822 (firstCIT / subseqCIT / subseqMIT)

`layer-an5822.json` modela los 3 flujos y necesita saber en qué está la transacción para elegir la regla de `IND_PAGO`.

Opciones (requiere decisión de negocio):

- Agregar columna `flujo_an5822` a la matriz Excel con valores controlados `firstCIT | subseqCIT | subseqMIT | N/A` (N/A cuando no es MC o es VOID/REVERSAL).
- Validación cruzada (recomendada por Ramsses): además de declaración, inferir por `INFO_PAGO` observado (`0`=first, `3`=subseqCIT, `2`=subseqMIT) y marcar inconsistencia si declaración ≠ observación. Implementar como regla cruzada **C10**.

### 1.3 Sección `emvVoucher` excluida de validación servlet

`api-pw2-seguro.json` e `interredes-remoto.json` ahora exponen una sección nueva `emvVoucher` con TVR/TSI/AID/APN/AL. Es **solo documental** (tags EMV que el SDK imprime en voucher, **no se envían** al POST a Banorte).

**Acción**: asegurar que `ValidateTransactionFieldsUseCase` NO itere `emvVoucher` al validar contra el log servlet. La única clave EMV de envío real es `EMV_TAGS` (TLV hex concatenado).

---

## 2. Regresión de test conocida (P1 — fixture)

### `ValidateTransactionFieldsUseCase.test.ts` — `MERCHANT_ID` AUTH_VISA

El test en `__tests__/unit/use-cases/ValidateTransactionFieldsUseCase.test.ts:48-63` espera `verdict: 'PASS'` para `MERCHANT_ID='7004145530'` (10 dígitos). La v5 de `ecommerce-tradicional.json` tightening:

- antes: `maxLength: 15`, sin `format`
- ahora: `maxLength: 7`, `format: "^\\d{1,7}$"`

Resultado: `FAIL reason=exceeds_max_length` sobre una afiliación Banorte realista de 10 dígitos.

**Decisión pendiente con Ramsses / equipo manual**:

- ¿El `maxLength: 7` de la v5 es correcto según manual v2.6.4? (cambiar el fixture del test a ID de ≤7 dígitos).
- ¿O es un ajuste de más? (relajar en el JSON a 10 o 15 para coincidir con afiliaciones reales).

No se tocó ninguno de los dos hasta que haya decisión.

---

## 3. Reglas cruzadas pendientes (P1-P2)

Del README v5 §"Reglas cruzadas pendientes de implementar". Ninguna está wired:

| ID | Descripción | Prioridad |
|---|---|---|
| C3 | `REFERENCE` respuesta = Campo 37 PROSA (RRN) | P1 |
| C5 | `ShipTo_country` = `TERMINAL_COUNTRY` (servlet agregadores) | P2 |
| C7 | `MERCHANT_ID` + `CONTROL_NUMBER` únicos por comercio | P1 |
| C8 | `CUSTOMER_REF2` coincide entre PREAUT y POSTAUT | P2 |
| C9 | `ECI validValues` según `CARD_BRAND` (VISA/AMEX→[05,06,07], MC→[01,02]) | P1 |
| C10 | Coherencia AN5822 flujo declarado vs `INFO_PAGO` observado | P1 |
| C11 | `ID_CYBERSOURCE` = requestID retorno CS; BIN vs `Card_cardType` | P1 |
| C12 | Códigos error PinPad válidos en Interredes | P2 |
| — | Rate limit Cargos Periódicos: 200 tx/min | P2 |
| R_PCI | `EXP_DATE`/`SECURITY_CODE` nunca en logs | P1 |

### 3.1 Nota específica sobre C9 — `validValuesByBrand` en ECI

`layer-3ds.json` ahora trae `validValues` global **y** `validValuesByBrand`. El motor actual (`FieldRequirement.evaluateDetailed`) sólo lee `validValues`. Para aplicar la regla por marca hay que implementarlo como regla cruzada en `CrossFieldValidator`:

```
Si CARD_BRAND=VISA|AMEX y ECI ∉ [05,06,07] → FAIL
Si CARD_BRAND=MC y ECI ∉ [01,02] → FAIL
```

---

## 4. Fix de regex de caracteres prohibidos (P1 — defecto conocido)

**Archivo**: `apps/payworks-bot/src/core/domain/value-objects/FieldRequirement.ts:5`

Regex actual:

```ts
const FORBIDDEN_CHARS_REGEX = /[<>|\\{}[\]"*;:#$%&()=éúóü?+'\/]/;
```

Contiene literales `é`, `ú`, `ó`, `ü` (y en revisiones previas `e`, `u`, `o`) que rechazan palabras válidas como "MUEVE CIUDAD". El set oficial de los manuales es:

```
<, >, |, ¡, !, ¿, ?, *, +, ', á, é, í, ó, ú, /, \, {, }, [, ], ¨, Ñ, ;, :, ", #, $, %, &, (, ), =, ,
```

Acciones:

- Reemplazar el literal actual por un set completo y bien documentado.
- Considerar si el set debe ser configurable por tipo de campo (nombre vs. domicilio).

---

## 5. Anexo D Agregadores (P2 — capa nueva)

Manual Agregadores v2.6.4 §Anexo D define reglas de contenido para `SUB_MERCHANT`, `DOMICILIO_COMERCIO`, `CIUDAD_TERMINAL`, etc:

- Permitidos: A-Z, 0-9, `&`, espacio
- `*`: sólo subafiliados formato `7*14`
- `.`: sólo en domicilio
- Prohibidos: dobles espacios, `Ñ`, acentos

**Diseño sugerido**: sección nueva `contentRules` en `agregadores-*.json` con regex por campo, validada tras las reglas básicas.

---

## 6. Preguntas abiertas (Q-series)

Sin bloquear implementación, documentar decisión y luego wire:

- **Q3** — ¿Cómo saber si un comercio es retail/restaurante/hotel para validar si Postautorización aplica? Posibles fuentes: MCC o columna declarada en matriz.
- **Q6** — CIT vs MIT: ¿el comercio declara explícitamente o el bot infiere? Recomendación Ramsses: declaración + C10.
- **Q7** — `validValues` inválido: ¿FAIL o WARN? Recomendación: FAIL si el campo es `R`, WARN si es `O`.

---

## 7. Tests de regresión contra logs reales

Correr el bot contra los 4 logs operativos que se identificaron en la revisión:

- MUEVE CIUDAD 3DS → debe PASAR (antes fallaba por regex de caracteres).
- DLOCAL Esq.4 AGP → validar que Esq.4 se detecta por `CUSTOMER_REF5`.
- OPENLINEA Esq.4 sin AGP → validar `ENTRY_MODE=MANUAL` (antes aceptaba CHIP).
- ZIGU Esq.1 Gateway → validar que `ID_GATEWAY` sólo se acepta en MC.

---

## 8. Validación VCE (post-MVP)

Manual VCE v1.8: `AES/CTR/NOPADDING` con `passphrase(16) + viHex(32) + saltHex(32) + Key derivada por Rfc2898DeriveBytes SHA1`. El bot no valida estructura del JSON cifrado antes de decodificarlo. Requiere credenciales de cifrado para implementar.

---

## Orden sugerido de siguientes commits

1. Ajustar fixture de test `MERCHANT_ID` (§2) — unblocks CI.
2. Fix regex de caracteres prohibidos (§4).
3. Wiring `response-rules.json` en DIContainer (§1.1, parte aislada).
4. Columna `flujo_an5822` + wiring `layer-an5822.json` + regla C10 (§1.1 + §1.2 + §3).
5. Excluir `emvVoucher` de servlet (§1.3).
6. Reglas cruzadas restantes C3/C7/C9/C11/R_PCI.
7. Anexo D agregadores (§5).
