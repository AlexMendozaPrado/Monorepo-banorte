# Preguntas pendientes para Ramsses Bautista — Certificación Payworks Bot

> Última actualización: 2026-04-15
> Propósito: registrar ambigüedades y decisiones abiertas encontradas mientras se implementa la automatización de certificaciones Payworks. Cada pregunta tiene un ID para referenciarla desde código o issues.

## Cómo usar este documento

- Cada pregunta tiene ID `PX.Y` (prioridad + consecutivo).
- Cuando se responda una pregunta: marcar con ✅ y pegar la respuesta inline abajo de la pregunta.
- **Prioridad**: P5 (carta) y P7 (formato afiliaciones) bloquean F7-F9.

---

## 1. Nomenclatura de variables

- **P1.1** — ¿Existe glosario oficial español↔inglés de variables Payworks que podamos usar como fuente autoritativa (en lugar de construirlo desde logs)?
- **P1.2** — Confirmar mapeos ambiguos detectados en los logs:
  - `FECHA_EXP` → ¿cuál es el nombre en el log? (hipótesis actual: `CARD_EXP`)
  - `LOTE` → ¿aparece en los logs? Con qué nombre.
  - `MARKETPLACE_TX` → ¿cuál es el nombre en el log?
- **P1.3** — `ESTATUS_3D`: el manual dice que `200` significa autenticación exitosa, pero el `LOG 3D SECURE.txt` de ejemplo muestra `Cert3D: [03]`. ¿Cuál es el valor real validable? ¿Son dos campos distintos o el mismo con representaciones diferentes?

## 2. Tarjeta Presente (API PW2 Seguro e Interredes Remoto)

- **P2.1** — ¿El comercio tiene acceso a los logs generados por el dispositivo PinPad? Si no, ¿cómo se certifican estos productos?
- **P2.2** — Para Interredes Remoto (API SDK basada en funciones `PPSet*/PPGet*`), ¿qué formato tienen los logs generados? ¿Usan el mismo formato que servlet TNP?
- **P2.3** — ¿Los campos EMV (`TVR`, `TSI`, `AID`, `EMV_TAGS`, `APN`, `AL`) son obligatorios en el log para validar una transacción CHIP, o solo informativos?

## 3. Mandato AN5822 CIT/MIT MasterCard

- **P3.1** — ¿Cómo se distingue una transacción **CIT** (primera) de una **MIT** (subsecuente) para aplicar las reglas correctas? Opciones posibles:
  - a) El usuario lo declara en la matriz Excel.
  - b) Se deduce del contenido del log (campo `CIF` o `PAYMENT_INFO` = 3).
  - c) Se consulta el histórico de transacciones por afiliación/tarjeta.
- **P3.2** — Confirmar aplicabilidad por producto. ¿AN5822 aplica a todos los productos con MasterCard o solo a algunos (ej. solo Cargos Periódicos)?

## 4. Esquemas de Agregadores

- **P4.1** — ¿Cómo identifica el bot automáticamente si una transacción corresponde a Esq. 1 Tasa Natural, Esq. 4 Sin AGP, o Esq. 4 Con AGP? ¿Se declara en la matriz Excel o se deduce del log?
- **P4.2** — El "AGP" (Autorización de Garantía de Pago / Agregador General de Pagos — ¿cuál es la expansión oficial?) ¿es un campo específico en el log o se deduce por presencia/ausencia de otros campos?

## 5. Carta de certificación (bloqueante F9)

- **P5.1** — ¿Cuál es la regla de generación del **número de certificado**? Formato observado en ejemplo: `CE3DS-0003652_9885405`.
  - Hipótesis: `CE{PREFIJO_PRODUCTO}-{CONSECUTIVO}_{AFILIACION}` ¿correcto?
  - ¿De dónde viene el consecutivo `0003652`? ¿Secuencia global, por afiliación, por producto?
  - ¿Lo genera el bot o lo asigna un sistema central?
- **P5.2** — ¿Bajo qué criterio se **emite** la carta?
  - Solo si **todas** las transacciones son `APROBADO`.
  - Se permite emitir con observaciones si hay `RECHAZADO`.
  - El validador humano decide caso a caso.
- **P5.3** — ¿Los logs técnicos embebidos en el PDF son siempre de **TODAS** las transacciones probadas o solo de las "representativas" (ej. 1 por tipo)?
- **P5.4** — Firma del validador: ¿nombre fijo por proyecto/equipo, o se captura en cada corrida?
- **P5.5** — ¿El formato visual debe replicarse pixel-perfect con el PDF ejemplo, o basta con respetar la estructura y placeholders?

## 6. Campos opcionales especiales

- **P6.1** — **AMEX en Comercio Electrónico Tradicional**: los ~20 campos AMEX (`DOMICILIO`, `TELEFONO`, `CORREO_ELECTRONICO`, datos de entrega, productos 1-3 con cantidad/precio, `DATOS_BROWSER`) ¿son obligatorios en VENTA/PREAUTH cuando la marca es AMEX, o siempre opcionales?
- **P6.2** — `MARKETPLACE_TX`: ¿qué representa? ¿En qué casos aplica y qué valores acepta?
- **P6.3** — Variables de Ventana CE Cifrada: el manual describe JSON cifrado. ¿Hay un esquema público del JSON pre-cifrado, o debe inferirse?

## 7. Formato del archivo de afiliaciones (bloqueante F7)

- **P7.1** — Cuando el usuario exporta `SELECT * FROM NPAYW.AFILIACIONES`, ¿qué formato típico se usa?
  - CSV con `,` o `;`
  - TXT con columnas de ancho fijo
  - TXT con pipes `|`
  - Excel (.xlsx)
- **P7.2** — ¿Qué encoding usa el export? (UTF-8, Latin-1, Windows-1252)
- **P7.3** — ¿Cuáles son los **nombres reales de las columnas** en la tabla `NPAYW.AFILIACIONES`? (Para afinar el auto-parser tolerante).

## 8. Tipos de transacción nuevos

- **P8.1** — `REVERSAL` (Reversa): ¿se comporta igual que `VOID`? ¿Cuándo se usa cada una?
- **P8.2** — `CASHBACK`: ¿aplica solo a Tarjeta Presente o también a algún producto TNP?
- **P8.3** — `REAUTH` (Reautorización): ¿tiene regla temporal (ej. "solo válida dentro de X días de la PREAUTH")? ¿Cómo se valida?

## 9. Transacciones adicionales de Tarjeta Presente

- **P9.1** — Los manuales de API PW2 Seguro e Interredes Remoto listan transacciones adicionales (`CIERRE_AFILIACION`, `CIERRE_LOTE`, `SUSPENSION`, `REACTIVACION`, `OBTENER_LLAVE`, `VENTA_FORZADA`). ¿Forman parte del scope de certificación o son operativas?

---

## Índice de prioridades

| ID | Tema | Bloquea fase |
|---|---|---|
| P5.1, P5.2 | Código certificado + criterio emisión | F9 (carta) |
| P7.1, P7.2, P7.3 | Formato CSV afiliaciones | F7 |
| P3.1, P3.2 | CIT/MIT detección | F4 (matrices) |
| P4.1, P4.2 | Detección de esquema agregador | F4 (matrices) + F8 (cableado) |
| P1.2, P1.3 | Mapeos ambiguos | F4 (se pueden marcar `ambiguous: true`) |
| P2.1, P2.2 | Logs Tarjeta Presente | F5/F6/F7 |
| P6.1 | AMEX en Tradicional | F4 (se puede modelar como subEsquema AMEX) |
| P10.1, P10.2, P10.3 | **3% restante de cobertura** — AMEX, MerchantDefinedData, validValues | Incremental |

---

## 10. Campos para el 3% restante de cobertura (~97% → 100%)

> Estos campos ya están identificados pero no implementados porque son opcionales, dinámicos o requieren confirmación de negocio. Se agregan incrementalmente cuando haya un caso de uso real.

- **P10.1** — **Campos AMEX en Comercio Electrónico Tradicional** (~20 campos opcionales):
  - `DOMICILIO`, `CODIGO_POSTAL`, `TELEFONO`, `CORREO_ELECTRONICO`
  - `DOMICILIO_ENTREGA`, `CODIGO_POSTAL_ENTREGA`, `TELEFONO_ENTREGA`, `CORREO_ELECTRONICO_ENTREGA`
  - `NOMBRE_CLIENTE_FACTURA`, `NOMBRE_CLIENTE_ENTREGA`
  - `EQUIPO_NOMBRE_CLIENTE`, `DATOS_BROWSER`, `DEPARTAMENTO_TIENDA`
  - `PRODUCTO_1..3`, `CANTIDAD_1..3`, `PRECIO_UNITARIO_1..3`
  - **Pregunta**: ¿Son obligatorios (`R`) cuando la marca es AMEX para VENTA/PREAUTH, o siguen siendo `O` siempre? El manual los lista como opcionales pero algunos comercios los necesitan para aprobación.
  - **Impacto**: +20 campos al JSON de Tradicional (solo para `AUTH_AMEX`/`PREAUTH_AMEX`).

- **P10.2** — **Campos MerchantDefinedData de Cybersource** (dinámicos):
  - El log real de Cybersource (`LOG CYBERSOURCE.txt`) muestra: `MerchantDefinedData_field1`, `field2`, `field8`, `field9`, `field12`, `field17`.
  - Estos son **campos personalizados por comercio** — no estandarizables en un JSON fijo.
  - **Pregunta**: ¿Se deben validar como `R` (si el comercio los declara en su integración) o ignorarlos siempre? ¿Hay un catálogo de qué `field[N]` es obligatorio por giro/producto?
  - **Impacto**: requiere un mecanismo de "campos dinámicos declarados por el usuario" (fuera del JSON estático actual).

- **P10.3** — **Validación de dominios (validValues)** para campos enum:
  - El glosario ya tiene `validValues` para `MODE` (PRD/AUT/DEC/RND), `RESPONSE_LANGUAGE` (ES/EN), `Card_cardType` (001/002), `ECI` (01/02/05/06/07), etc.
  - **Pregunta**: ¿El bot debe **rechazar** transacciones con valores fuera del dominio (ej. `MODE=TEST`), o solo **advertir**?
  - **Impacto**: cambio en `FieldRequirementValueObject.evaluateDetailed()` para validar contra `validValues` cuando estén definidos. Bajo esfuerzo técnico, alto impacto en calidad de validación.
