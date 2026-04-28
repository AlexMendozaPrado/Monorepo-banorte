# Bundle 03 — ZIGU · Esquema 1

**Fuente:** `Downloads/ConsolidadoManualesyLogs/manualdeintegracinagregadoresaliados/LOGS ZIGU - ESQUEMA 1.txt`

**Producto:** `AGREGADORES_COMERCIO_ELECTRONICO`

## Transacciones

| # | Tipo | Brand | Referencia | NUMERO_CONTROL | Monto | Flujo AN5822 |
|---|---|---|---|---|---|---|
| 1 | AUTH | MASTERCARD | 140559968829 | 6535824458 | 19.97 USD | subseqMIT |
| 2 | AUTH | MASTERCARD | 140559970854 | 6535827540 | 19.99 USD | subseqMIT |

Ambas tx llevan campos AN5822 explícitos (`COF=4`, `AMOUNT_TYPE=V/F`, `PAYMENT_INFO=2`, `PAYMENT_IND=U/R`) y campo `GATEWAY_ID`. Currency Campo 49 = `840` (USD).

## Capas que ejercita

- **SERVLET** — Esquema 1
- **PROSA** — 0200/0210 con Campo 49 = 840 (USD)
- **AGREGADOR** — datos del aggregator ZIGU
- **AN5822** — flujo `subseqMIT` declarado en matriz, `PAYMENT_INFO=2` consistente

## Curl de prueba

```bash
cd 03-zigu-esquema-1
curl -X POST http://localhost:3006/api/certificacion/validar \
  -F "matriz=@matriz.xlsx" \
  -F "integrationType=AGREGADORES_COMERCIO_ELECTRONICO" \
  -F "operationMode=semi" \
  -F "csvBD=@vtransacciones.csv" \
  -F "servletLog=@servlet.log" \
  -F "prosaLog=@prosa.log" \
  -F "afiliaciones=@afiliaciones.csv" \
  -F "merchantName=ZIGU"
```
