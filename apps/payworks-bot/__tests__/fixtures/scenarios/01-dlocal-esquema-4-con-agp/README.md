# Bundle 01 — DLOCAL · Esquema 4 con AGP

**Fuente:** `Downloads/ConsolidadoManualesyLogs/manualdeintegracinagregadoresaliados/LOG DLOCAL - ESQUEMA 4 CON AGP.txt`

**Producto:** `AGREGADORES_COMERCIO_ELECTRONICO`

## Transacciones

| # | Tipo | Brand | Referencia | NUMERO_CONTROL | Monto |
|---|---|---|---|---|---|
| 1 | AUTH | MASTERCARD | 140374723108 | 94784155462025052722082685 | 37999.00 |
| 2 | PREAUTH | VISA | 190369542582 | 94719577962025052706332389 | 499.00 |
| 3 | POSTAUTH | VISA | 100370918744 | 22989775632025052706332526 | 499.00 (parea con PREAUTH) |

## Capas que ejercita

- **SERVLET** — todas las tx
- **PROSA** — 0200/0210 (AUTH), 0200/0210 (PREAUTH), 0220/0230 (POSTAUTH)
- **CROSS-FIELD** — REFERENCE↔Campo37, CONTROL_NUMBER unique, PREAUTH/POSTAUTH correlation

## Curl de prueba

```bash
cd 01-dlocal-esquema-4-con-agp
curl -X POST http://localhost:3006/api/certificacion/validar \
  -F "matriz=@matriz.xlsx" \
  -F "integrationType=AGREGADORES_COMERCIO_ELECTRONICO" \
  -F "operationMode=semi" \
  -F "csvBD=@vtransacciones.csv" \
  -F "servletLog=@servlet.log" \
  -F "prosaLog=@prosa.log" \
  -F "afiliaciones=@afiliaciones.csv" \
  -F "merchantName=DLOCAL"
```
