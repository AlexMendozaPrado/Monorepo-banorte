# Bundles de fixtures de prueba

4 bundles auto-contenidos derivados de los **logs reales** que el equipo entregó (`Downloads/ConsolidadoManualesyLogs/`). Cada carpeta es un escenario subible directo desde `/nueva-certificacion` para auditar el aplicativo contra data productiva.

| Bundle | Producto | Fuente | Tx | Verdict observado | Capas activas |
|---|---|---|---|---|---|
| `01-dlocal-esquema-4-con-agp/` | `AGREGADORES_COMERCIO_ELECTRONICO` | `LOG DLOCAL - ESQUEMA 4 CON AGP.txt` | 3 | RECHAZADO (60 pass · 4 fail · 6 skip) | SERVLET + AGREGADOR |
| `02-openlinea-esquema-4-sin-agp/` | `AGREGADORES_COMERCIO_ELECTRONICO` | `LOG OPENLINEA - ESQUEMA 4 SIN AGP.txt` | 1 | RECHAZADO (20 pass · 3 fail) | SERVLET + AGREGADOR |
| `03-zigu-esquema-1/` | `AGREGADORES_COMERCIO_ELECTRONICO` | `LOGS ZIGU - ESQUEMA 1.txt` | 2 | RECHAZADO (44 pass · 3 fail) | SERVLET + AN5822 |
| `04-ecommerce-3ds-cybersource/` | `ECOMMERCE_TRADICIONAL` | `LOG 3D SECURE.txt` + `LOG CYBERSOURCE.txt` | 1 | RECHAZADO (32 pass · 20 fail) | SERVLET + THREEDS |

## Cómo se generan

Programáticamente desde `apps/payworks-bot/scripts/`:

```bash
pnpm --filter payworks-bot fixtures:generate    # genera y escribe
pnpm --filter payworks-bot fixtures:validate    # genera + valida contra los parsers
```

Los datos están transcritos literalmente de los logs del equipo en `scripts/scenarios/*.ts`. Si el equipo entrega logs nuevos, se agregan ahí y se regenera.

## Cómo usarlos

1. Levantar dev server: `pnpm --filter payworks-bot dev`
2. Ir a `http://localhost:3006/nueva-certificacion`
3. Subir los 5–7 archivos del bundle como inputs del form
4. Seleccionar el `IntegrationType` correspondiente (ver tabla)
5. Click "Iniciar Certificación" → ver árbol de validación en `/resultados/<id>`

Para automatizar el upload, ver `<bundle>/README.md` que trae el `curl` listo.

## Filosofía

Los logs vienen tal cual del equipo — **no se inventan happy paths ni se inyectan fallas sintéticas**. El verdict del aplicativo (APROBADO/RECHAZADO) y los conteos por capa reflejan lo que el dominio decide sobre esa data productiva. Eso es información valiosa para auditar el aplicativo.

## Bundle viejo (no tocado)

`__tests__/fixtures/matriz_pruebas_liverpool.xlsx` y los logs originales (`servlet_http.log`, `prosa_http.log`, etc.) siguen disponibles para los tests existentes que los usan.
