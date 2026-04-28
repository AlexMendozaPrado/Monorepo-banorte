# Bundle 04 — Ecommerce Tradicional · 3DS + Cybersource

**Fuentes:**
- `Downloads/ConsolidadoManualesyLogs/manualdeintegracintarjetanopresente/LOG 3D SECURE.txt`
- `Downloads/ConsolidadoManualesyLogs/manualdeintegracintarjetanopresente/LOG CYBERSOURCE.txt`

**Producto:** `ECOMMERCE_TRADICIONAL`

## Transacción

| Tipo | Brand | Referencia | NUMERO_CONTROL | Monto |
|---|---|---|---|---|
| AUTH | VISA | 321000000001 | 99054191404261776156193609 | 4156.00 |

## Licencia tomada

Los logs `LOG 3D SECURE.txt` y `LOG CYBERSOURCE.txt` del equipo son de **transacciones distintas** (FOLIO `9905419_140426_...` en 3DS; OrderId `F465EEC19C1941...` en Cybersource). Para armar un bundle coherente:

- 3DS: replica literal del log (FOLIO, ECI=05, XID/CAVV, MerchantId, monto 4156).
- Cybersource: replica literal del log (OrderId, decision=ACCEPT, MerchantID `banorteixe`, monto 165 USD).
- **Servlet+PROSA: construidos sintéticamente** con campos mínimos requeridos por `ECOMMERCE_TRADICIONAL`, REFERENCE/CONTROL_NUMBER coherentes con la matriz, e `ID_CYBERSOURCE` = OrderId del log Cybersource.

Esta es la única licencia del PR. Todos los demás bundles son transcripción literal.

## Capas que ejercita

- **SERVLET** — campos mínimos válidos
- **PROSA** — 0200/0210
- **THREEDS** — folio, ECI, XID, CAVV, Version3D=2
- **CYBERSOURCE** — decision ACCEPT, BIN VISA (`Card_cardType=001`)
- **CROSS-FIELD** — ID_CYBERSOURCE↔requestID, ShipTo_country↔TERMINAL_COUNTRY

## Curl de prueba

```bash
cd 04-ecommerce-3ds-cybersource
curl -X POST http://localhost:3006/api/certificacion/validar \
  -F "matriz=@matriz.xlsx" \
  -F "integrationType=ECOMMERCE_TRADICIONAL" \
  -F "operationMode=semi" \
  -F "csvBD=@vtransacciones.csv" \
  -F "servletLog=@servlet.log" \
  -F "prosaLog=@prosa.log" \
  -F "threeDSLog=@threeds.log" \
  -F "cybersourceLog=@cybersource.log" \
  -F "afiliaciones=@afiliaciones.csv" \
  -F "merchantName=BOLETERA RED MUSIC"
```
