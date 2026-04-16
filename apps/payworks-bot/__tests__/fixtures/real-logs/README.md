# Fixtures basadas en logs reales (Ramsses Bautista)

Archivos de prueba construidos desde los logs reales proporcionados por el equipo de certificaciones Payworks.

## Archivos

### Logs

| Archivo | Producto | Transacciones | Fuente |
|---------|----------|---------------|--------|
| `servlet-agregadores-esq1.log` | Agregadores Esq.1 Tasa Natural | AUTH MC + VOID MC (ZIGU) | LOGS ZIGU |
| `servlet-agregadores-esq4-sin-agp.log` | Agregadores Esq.4 Sin AGP | AUTH VISA (OPENLINEA) | LOG OPENLINEA |
| `servlet-agregadores-esq4-con-agp.log` | Agregadores Esq.4 Con AGP | AUTH MC (DLOCAL) | LOG DLOCAL |
| **`servlet-agregadores-combined.log`** | **Los 3 esquemas juntos** | **4 AUTH + 1 VOID** | Concatenación de los 3 |
| `prosa-agregadores.log` | PROSA (ISO 8583) | 0200/0210 + 0220/0230 | Construido de los 3 logs |
| `threeds-real.log` | Capa 3D Secure | Request + Response 3DS VISA | LOG 3D SECURE |
| `cybersource-real.log` | Capa Cybersource Direct | Envío + Retorno | LOG CYBERSOURCE |
| `afiliaciones-test.csv` | N/A | 5 comercios | Ficticio con datos de logs |

### Matrices por escenario

| Archivo | Escenario | # Txs | Log servlet a usar |
|---------|-----------|-------|---------------------|
| **`matriz-solo-zigu.csv`** | Agregadores Esq.1 | 2 | `servlet-agregadores-esq1.log` |
| **`matriz-solo-openlinea.csv`** | Agregadores Esq.4 Sin AGP | 1 | `servlet-agregadores-esq4-sin-agp.log` |
| **`matriz-solo-dlocal.csv`** | Agregadores Esq.4 Con AGP | 1 | `servlet-agregadores-esq4-con-agp.log` |
| **`matriz-agregadores-combined.csv`** | Los 3 esquemas en una corrida | 4 | `servlet-agregadores-combined.log` |
| `matriz-pruebas-test.csv` | ⚠️ No usar solo — tiene todas las transacciones incluyendo 3DS/Cybersource | 6 | requiere varios logs |

## Cómo usar en el navegador

### ✅ Escenario 1 (recomendado) — ZIGU (Esquema 1 Tasa Natural)

1. Ir a **http://localhost:3006/nueva-certificacion**
2. **Paso 1 Matriz**: `matriz-solo-zigu.csv`
3. **Paso 2 Producto**: *Agregadores — Comercio Electrónico*
4. **Paso 3 Modo**: Semi-automatico
5. **Paso 4 Coordinador**: `Fabio Serrano`
6. **Paso 5 Archivos**:
   - CSV BD: `matriz-solo-zigu.csv` (mismo archivo)
   - Servlet: `servlet-agregadores-esq1.log`
   - PROSA: `prosa-agregadores.log`
   - Afiliaciones: `afiliaciones-test.csv`
7. **Iniciar Certificación** → 2 transacciones validadas (VTA + CAN)

### Escenario 2 — Combinado (los 3 esquemas de agregadores)

Igual que Escenario 1 pero:
- Matriz: `matriz-agregadores-combined.csv`
- CSV BD: `matriz-agregadores-combined.csv`
- Servlet: `servlet-agregadores-combined.log`
- Resto igual

→ 4 transacciones validadas: 1 VTA ZIGU + 1 CAN ZIGU + 1 VTA OPENLINEA + 1 VTA DLOCAL

### Escenario 3 — Solo OPENLINEA (Esquema 4 Sin AGP)

Muestra los 8 campos adicionales de agregador (AGGREGATOR_ID, SUB_MERCHANT, MERCHANT_MCC, ZIP_CODE, TERMINAL_CITY, ESTADO_TERMINAL, TERMINAL_COUNTRY, DOMICILIO_COMERCIO).

- Matriz: `matriz-solo-openlinea.csv`
- Servlet: `servlet-agregadores-esq4-sin-agp.log`
- PROSA: `prosa-agregadores.log`

### Escenario 4 — Solo DLOCAL (Esquema 4 Con AGP)

- Matriz: `matriz-solo-dlocal.csv`
- Servlet: `servlet-agregadores-esq4-con-agp.log`
- PROSA: `prosa-agregadores.log`

## MERCHANT_IDs en las fixtures

| MERCHANT_ID | Comercio | Esquema |
|-------------|----------|---------|
| 9607773 | ZIGU TECHNOLOGIES | Esq.1 Tasa Natural |
| 8016732 | OPENLINEA PAGOS | Esq.4 Sin AGP |
| 9342244 | DLOCAL MEXICO | Esq.4 Con AGP |
| 9905419 | BOLETERA RED MUSIC | 3D Secure |
| 8248847 | GRUPO ARIES IXE | Cybersource |
