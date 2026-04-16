# Fixtures basadas en logs reales (Ramsses Bautista)

Archivos de prueba construidos desde los logs reales proporcionados por el equipo de certificaciones Payworks.

## Archivos

| Archivo | Producto | Transacciones | Fuente original |
|---------|----------|---------------|-----------------|
| `servlet-agregadores-esq1.log` | Agregadores CE (Esq.1 Tasa Natural) | AUTH MC + VOID MC | LOGS ZIGU |
| `servlet-agregadores-esq4-sin-agp.log` | Agregadores CE (Esq.4 Sin AGP) | AUTH VISA | LOG OPENLINEA |
| `servlet-agregadores-esq4-con-agp.log` | Agregadores CE (Esq.4 Con AGP) | AUTH MC | LOG DLOCAL |
| `threeds-real.log` | Capa 3D Secure | Peticion + Respuesta 3DS VISA | LOG 3D SECURE |
| `cybersource-real.log` | Capa Cybersource Direct | Envio + Retorno | LOG CYBERSOURCE |
| `prosa-agregadores.log` | PROSA (ISO 8583) | 0200/0210 para las 3 ventas | Construido de ZIGU+OPENLINEA+DLOCAL |
| `afiliaciones-test.csv` | N/A | N/A | Ficticio (datos reales de logs) |
| `matriz-pruebas-test.csv` | N/A | 6 transacciones | Construido de los 5 logs |

## Cómo usar en el navegador

1. Ir a **http://localhost:3006/nueva-certificacion**
2. Seleccionar producto **Agregadores - Comercio Electrónico**
3. Subir:
   - **Matriz**: `matriz-pruebas-test.csv`
   - **Log Servlet**: `servlet-agregadores-esq1.log` (o esq4-sin-agp/esq4-con-agp)
   - **Log PROSA**: `prosa-agregadores.log`
   - **Afiliaciones**: `afiliaciones-test.csv`
4. Iniciar certificacion y verificar resultados

### Para probar capas transversales (3DS + Cybersource)
1. Seleccionar **Comercio Electronico Tradicional**
2. Subir `threeds-real.log` en el slot de 3DS
3. Subir `cybersource-real.log` en el slot de Cybersource

## MERCHANT_IDs en las fixtures

| MERCHANT_ID | Comercio | Esquema |
|-------------|----------|---------|
| 9607773 | ZIGU TECHNOLOGIES | Esq.1 Tasa Natural |
| 8016732 | OPENLINEA PAGOS | Esq.4 Sin AGP |
| 9342244 | DLOCAL MEXICO | Esq.4 Con AGP |
| 9905419 | BOLETERA RED MUSIC | 3D Secure |
| 8248847 | GRUPO ARIES IXE | Cybersource |
