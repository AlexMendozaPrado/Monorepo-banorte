# Bundle 02 — OPENLINEA · Esquema 4 sin AGP

**Fuente:** `Downloads/ConsolidadoManualesyLogs/manualdeintegracinagregadoresaliados/LOG OPENLINEA - ESQUEMA 4 SIN AGP.txt`

**Producto:** `AGREGADORES_COMERCIO_ELECTRONICO`

## Transacción

| Tipo | Brand | Referencia | NUMERO_CONTROL | Monto |
|---|---|---|---|---|
| AUTH | VISA | 821545843260 | 3814--a51411e042b5404394c9 | 1650.00 |

Tx con `EMV_TAGS` largo (~250 hex chars) y campos `MERCHANT_MCC`, `BANORTE_URL`, `TERMINAL_CITY`, `ESTADO_TERMINAL`, `ZIP_CODE`, `DOMICILIO_COMERCIO`, `SUB_MERCHANT`, `AGGREGATOR_ID`.

## Capas que ejercita

- **SERVLET** — campos extendidos del Anexo D
- **PROSA** — 0200/0210, Campo 43 con datos de aggregador (`OPLINEA*ESSENTIALMASSA...`)
- **AGREGADOR** — formato Anexo D
- **EMV** — campo EMV_TAGS presente

## Curl de prueba

```bash
cd 02-openlinea-esquema-4-sin-agp
curl -X POST http://localhost:3006/api/certificacion/validar \
  -F "matriz=@matriz.xlsx" \
  -F "integrationType=AGREGADORES_COMERCIO_ELECTRONICO" \
  -F "operationMode=semi" \
  -F "csvBD=@vtransacciones.csv" \
  -F "servletLog=@servlet.log" \
  -F "prosaLog=@prosa.log" \
  -F "afiliaciones=@afiliaciones.csv" \
  -F "merchantName=OPENLINEA"
```
