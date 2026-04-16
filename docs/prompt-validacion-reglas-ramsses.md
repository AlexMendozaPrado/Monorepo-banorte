# Prompt para generar documento de validación con Ramsses

> Pega este prompt en Claude / Cowork / ChatGPT para generar un documento **directo, conciso y con referencias verificadas** a los manuales oficiales. El equipo de Ramsses Bautista podrá confirmar regla por regla abriendo el PDF exacto citado.

---

## Prompt

```
Genera un documento de REVISIÓN Y CONFIRMACIÓN para el equipo de Certificaciones
Banorte (Ramsses Bautista y equipo). El documento debe ser DIRECTO, CONCISO,
NO técnico. El objetivo es que puedan marcar cada regla como ✅ (correcta),
❌ (incorrecta, con comentario), o ⚠️ (revisar).

CRÍTICO: cada regla debe incluir una REFERENCIA VERIFICADA al manual oficial
(nombre del manual + página + quote literal cuando aplica). Estas citas
fueron extraídas leyendo directamente los PDFs. El equipo podrá abrir el
manual en la página indicada para confirmar.

FORMATO: documento Word (.docx) o PDF, listo para imprimir o compartir por
email. Máximo 10 páginas.

AUDIENCIA: Coordinadores de certificación Banorte. Conocen los manuales.
No usar jerga técnica (no mencionar JSON, regex, enum, TypeScript).

═══════════════════════════════════════════════════════════════════
PÁGINA 1 — PORTADA
═══════════════════════════════════════════════════════════════════
Título: "Revisión de Reglas de Validación — Bot de Certificación Payworks"
Subtítulo: "Confirmación del equipo de Certificaciones Banorte"
Fecha: [actual]

Párrafo breve (5 líneas):
"El bot automatiza la validación de 10 productos Payworks contra los manuales
oficiales compartidos por su equipo. Cada regla lista abajo incluye la página
exacta del manual de donde se extrajo. Por favor revise cada regla y marque
✅ si coincide con su proceso, ❌ si NO (con comentario) o ⚠️ para revisar
en reunión. Al final encontrará 15 preguntas abiertas que bloquean la
finalización del proyecto."

Instrucciones de uso:
- ✅ Regla correcta, coincide con manual y proceso
- ❌ Regla incorrecta — anotar cómo debe ser
- ⚠️ Revisar, requiere discusión

═══════════════════════════════════════════════════════════════════
PÁGINA 2 — PRODUCTOS Y MANUALES UTILIZADOS
═══════════════════════════════════════════════════════════════════
Tabla con 4 columnas:

| Producto | Manual (nombre exacto) | Versión / Fecha | ¿Correcto? |
|---|---|---|---|
| Comercio Electrónico Tradicional | ManualDeIntegración_ComercioElectrónicoTradicional_V2.5.pdf | V2.5 / 19-Jun-2025 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| MOTO | ManualDeIntegración_MOTO_V1.5.pdf | V1.5 / 19-Jun-2025 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| Cargos Periódicos Post | ManualDeIntegración_CargosPeriódicosPost_V2.1.pdf | V2.1 / 19-Jun-2025 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| Ventana de Comercio Electrónico | Manual de Integración Ventana de Comercio Electrónico_v1.8.pdf | v1.8 / 24-Mar-2026 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| Agregadores y Aliados (CE) | ManualDeIntegracion_ComercioElectrónico Agregadores y Aliados_V2.6.4.pdf | V2.6.4 / 23-Ene-2026 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| Agregadores Cargos Periódicos | ManualDeIntegración_CargosPeriódicos_Agregadores_V2.6.4.pdf | V2.6.4 / Ene-2026 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| API PW2 Seguro (Tarjeta Presente) | Manual de Integración API PW2 Seguro V2.4.pdf | V2.4 / Mar-2023 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| Interredes Remoto (Tarjeta Presente) | Manual de Integración Interredes Remoto V1.7.pdf | V1.7 / Jul-2025 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| 3D Secure (capa) | ManualDeIntegración_3DSecure_Banorte_V1.4.pdf | V1.4 / 29-Oct-2024 | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| Cybersource Direct (capa) | ManualIntegracion_Cybersource_Direct_V1.10.pdf | V1.10 / 18-Ene-2021 | ☐ ✅ ☐ ❌ ☐ ⚠️ |

Pregunta al pie: "¿Falta algún producto o se actualizó alguna versión del manual?"
Espacio de respuesta: _______________________________

═══════════════════════════════════════════════════════════════════
PÁGINAS 3–7 — REGLAS DE VALIDACIÓN (por grupo, con cita)
═══════════════════════════════════════════════════════════════════

Cada fila de las siguientes tablas debe incluir: descripción de la regla +
📖 referencia al manual + página + (quote literal cuando está disponible).

──── GRUPO A — Presencia de campos (R/O/N/A) ────

| # | Regla | 📖 Fuente | Correcto |
| A1 | Campos marcados como R (Requerido) deben existir en el log y tener valor no vacío | MOTO V1.5, p.6-7 (columna "¿ES REQUERIDO?") + idem en todos los manuales | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| A2 | Campos marcados como O (Opcional) pueden faltar sin impactar | MOTO V1.5, p.7 "Opcional para cualquier transacción o comando" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| A3 | Campos N/A no se validan para esa combinación transacción/marca | Ej. AMOUNT "Requerida, excepto para la CANCELACIÓN y la REVERSA" (MOTO V1.5, p.6) | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| A4 | Reglas R/O/N/A varían por tipo de transacción (VENTA, CANCELACIÓN, etc.) | MOTO V1.5, p.6-7 (columna "¿ES REQUERIDO?" lista transacciones específicas) | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| A5 | Reglas varían por marca de tarjeta (VISA/MC/AMEX) para mandato AN5822 | MOTO V1.5, p.8 "Mandato AN5822 - MIT/CIT Master Card" | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO B — Caracteres prohibidos ────

| # | Regla | 📖 Fuente + quote | Correcto |
| B1 | Para Ventana CE rechazar: < > \| ¡ ! ¿ ? * + ' á é í ó ú / \ { } [ ] ¨ * Ñ ; : " # $ % & / ( ) = | Ventana CE v1.8, p.7: "no enviar los siguientes caracteres especiales los cuales NO son soportados por el servicio" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| B2 | Para 3D Secure rechazar la misma lista (idéntica a Ventana CE) | 3D Secure V1.4, p.6: "evite los siguientes caracteres especiales que NO son soportados por el servicio 3D Secure" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| B3 | Para MOTO rechazar: " , / \ & % $ ! ¡ \| ? ¿ ' * - _ # ( ) | MOTO V1.5, p.8: "Caracteres especiales: Comillas ("), coma (,), diagonales (/, \), ampersand (&), porciento (%), pesos ($), símbolos admiración (!, ¡), barra vertical (\|), símbolos de interrogación (?, ¿), comilla simple ('), asterisco (*), guion medio (-), guion bajo (_), almohadilla o numeral (#) y paréntesis (())" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| B4 | La lista de caracteres prohibidos es DIFERENTE entre productos (MOTO vs Ventana CE / 3DS) — ¿el bot debe tener 3 listas o una lista unificada? | Comparar MOTO V1.5 p.8 vs Ventana CE v1.8 p.7 | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO C — Formato y longitud de campos ────

| # | Regla | 📖 Fuente + quote | Correcto |
| C1 | MONTO: Numérico, 18 dígitos y 2 decimales. Ejemplo: 1.00 | MOTO V1.5, p.6 "Especifica el monto de la transacción. Ejemplo: 1.00" · también Ventana CE v1.8 p.8 (allí es 15 + 2 dec) — ⚠️ diferencia entre productos | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C2 | FECHA_EXP: Numérico, formato MMAA, 4 dígitos exactos | MOTO V1.5, p.7: "Fecha de expiración de la tarjeta con la que se realiza la transacción. El formato debe ser MMAA" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C3 | CÓDIGO_SEGURIDAD / SECURITY_CODE: 3 dígitos para VISA y MasterCard; 4 para AMEX | MOTO V1.5, p.7: "VISA y MasterCard: 3 dígitos" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C4 | MERCHANT_ID / ID_AFILIACION: Numérico, longitud máxima 7 | Ventana CE v1.8, p.8 "Numérico 7" · 3DS V1.4 p.6 "ID_AFILIACION / MERCHANT_ID 7" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C5 | TERMINAL_ID / ID_TERMINAL: Alfanumérico, longitud máxima 10-15 según producto | MOTO V1.5, p.6 "10" · Ventana CE v1.8 p.8 "15" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C6 | CONTROL_NUMBER / NUMERO_CONTROL: Alfanumérico máximo 30 | MOTO V1.5, p.7 "Alfanumérico 30" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C7 | REFERENCIA / REFERENCE: Numérico 12 (MOTO) ó Alfanumérico 30 (CE/3DS) | MOTO V1.5, p.7 "Numérico 12" · 3DS V1.4 p.7 "REFERENCE3D Alfa-num 30" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| C8 | CARD_NUMBER en logs: enmascarada (contiene ****) — regla de PCI-DSS | PCI-DSS estándar; los manuales no lo especifican explícitamente pero es práctica estándar en logs Payworks (visible en LOGS reales ZIGU/OPENLINEA/DLOCAL) | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO D — Valores fijos y enumerados ────

| # | Regla | 📖 Fuente + quote | Correcto |
| D1 | MODE / MODO: solo PRD, AUT, DEC, RND (Alfa-num 3) | MOTO V1.5, p.6: "PRD = Modo Producción, AUT = Modo de prueba autorizando siempre, DEC = Modo de prueba declinando siempre, RND = Modo de prueba con autorización aleatoria" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D2 | ENTRY_MODE / MODO_ENTRADA: valor fijo "MANUAL" para TNP (MOTO, CE sin chip) | MOTO V1.5, p.7: "Valor: MANUAL" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D3 | RESPONSE_LANGUAGE / IDIOMA_RESPUESTA: ES (Español) o EN (Inglés), Alfa-num 2 | MOTO V1.5, p.7: "ES - Español, EN - Inglés" · 3DS V1.4 p.7 idem | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D4 | CMD_TRANS valores enum: VENTA/AUTH, PREAUTORIZACION/PREAUTH, POSTAUTORIZACION/POSTAUTH, DEVOLUCION/REFUND, CANCELACION/VOID, REVERSA/REVERSAL, VERIFICACION/VERIFY | MOTO V1.5, p.6: "Posibles valores: VENTA / AUTH, PREAUTORIZACION / PREAUTH, POSTAUTORIZACION / POSTAUTH, DEVOLUCION / REFUND, CANCELACION / VOID, REVERSA / REVERSAL, VERIFICACION / VERIFY" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D5 | 3D_CERTIFICATION / CERTIFICACION_3D: valor fijo "03" (campo de envío) | 3D Secure V1.4, p.7: "Valor fijo requerido: 03" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D6 | THREED_VERSION / VERSION_3D: valor fijo "2" (campo de envío) | 3D Secure V1.4, p.7: "Versión de 3D Secure. Valor fijo requerido: 2" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D7 | ECI valores retorno: 01, 02, 05, 06, 07 (2 caracteres) | 3D Secure V1.4, p.9: "ECI, Código de seguridad, 2 caracteres, Valores posibles: 05, 06, 07, 01, 02" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D8 | Status 3DS retorno: 200 = éxito; ≠200 = fallo (campo distinto a 3D_CERTIFICATION) | 3D Secure V1.4, p.9: "Status = 200 Autenticación exitosa, Status <> 200 Autenticación NO exitosa" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D9 | MARCA_TARJETA / CARD_TYPE: VISA, MC, AMEX (5 caracteres max) | 3D Secure V1.4, p.6: "Visa: VISA, Mastercard: MC, American Express: AMEX" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D10 | CREDIT_TYPE: CR (Crédito) o DB (Débito) | 3D Secure V1.4, p.7: "CR: Tarjeta de Crédito, DB: Tarjeta de Débito" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D11 | MARKETPLACE_TX: valor fijo "1", solo condicional | MOTO V1.5, p.7: "Valor fijo: 1" + p.8 Condiciones: "producto adquirido fuera de México, tarjetas Visa, Venta o Preautorización" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D12 | Cybersource Decision: ACCEPT, REVIEW, REJECT, ERROR | Cybersource V1.10, p.5-7 (pendiente confirmar página exacta) | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D13 | Cybersource Card_cardType: 001 (VISA), 002 (MC) | Cybersource V1.10 (pendiente confirmar página exacta) | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| D14 | RESULTADO_PAYW (respuesta): A (Aprobada), D (Declinada), R (Rechazada), T (Sin respuesta) | Consistente en todos los manuales (pendiente confirmar página exacta por producto) | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO E — Reglas específicas de 3D Secure ────

| # | Regla | 📖 Fuente + quote | Correcto |
| E1 | XID/CAVV: si retornan valor Nulo o Blanco, NO enviar en el POST hacia Payworks | 3D Secure V1.4, p.9: "NOTA: Si las Variables XID y/o CAVV retornaron valor Nulo o Blanco en la respuesta de la autenticación 3D Secure, no enviar en el post hacia Payworks" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| E2 | XID: VISA 40 caracteres, AMEX 28 caracteres, MC: No se retorna | 3D Secure V1.4, p.9: "XID: VISA 40 caracteres, AMEX 28 caracteres, MC: No se retorna" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| E3 | CAVV: VISA 40 caracteres, AMEX 28, MC 28 caracteres | 3D Secure V1.4, p.9: "CAVV: VISA 40 caracteres, AMEX 28 caracteres, MC: 28 caracteres" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| E4 | 3DS solo aplica a VENTA, PREAUTORIZACION y POSTAUTORIZACION (no a CANCELACIÓN, DEVOLUCIÓN, REVERSA, VERIFICACIÓN) | Implícito en manual 3DS — aplica solo a transacciones de cobro | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| E5 | REFERENCE3D debe enviarse en el segundo POST hacia Payworks en la variable NUMERO_CONTROL o CONTROL_NUMBER | 3D Secure V1.4, p.7: "Referencia única por cada operación. Esta misma referencia se manda en el segundo Post hacia Payworks en la variable NUMERO_CONTROL o CONTROL_NUMBER" | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO F — Mandato AN5822 MasterCard (CIT/MIT) ────

| # | Regla | 📖 Fuente + quote | Correcto |
| F1 | AN5822 aplica solo a MasterCard en transacciones VENTA, PREAUTORIZACION y POSTAUTORIZACION | MOTO V1.5, p.8: "La marca Mastercard a través del mandato AN5822 - MIT/CIT solicita el envío de variables adicionales en transacciones de tipo VENTA, PREAUTORIZACION / PREAUTH Y POSTAUTORIZACION / POSTAUTH" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| F2 | CIT = "Customer Initiated Transaction" (iniciada por el cliente con presencia); MIT = "Merchant Initiated Transaction" (iniciada por el comercio sin cliente presente) | MOTO V1.5, p.8: "CIT: Transacciones iniciadas por el cliente. MIT: Transacciones iniciadas por el comerciante" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| F3 | AN5822 solo aplica si el comercio almacena credenciales bajo PCI-DSS | MOTO V1.5, p.8: "Esta parte de la implementación se realiza sólo si el comercio almacena las credenciales de sus clientes... según los estándares PCI DSS" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| F4 | CIT primera transacción: IND_PAGO="U", TIPO_MONTO="F" o "V", INFO_PAGO="0" | Tabla de primera transacción AN5822 (pendiente confirmar página exacta, típicamente p.9-10 de cada manual con MC) | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| F5 | MIT subsecuente: IND_PAGO="8" o "R", TIPO_MONTO="F" o "V", INFO_PAGO="2" o "3", COF="4" | Tabla subsecuente AN5822 (pendiente confirmar página exacta) | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO G — Reglas específicas de Agregadores ────

| # | Regla | 📖 Fuente | Correcto |
| G1 | Esquema 1 (Tasa Natural): sin campos adicionales de agregador | Manual Agregadores V2.6.4 (CE) sección "Esquema 1" — pendiente confirmar página exacta | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| G2 | Esquema 4 Con AGP: campos R adicionales SUB_MERCHANT (alfa-num 18) + AGGREGATOR_ID (num 19) | Manual Agregadores V2.6.4 (CE) sección "Esquema 4 Con AGP" — pendiente confirmar página | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| G3 | Esquema 4 Sin AGP: 8 campos R adicionales (SUB_MERCHANT, AGGREGATOR_ID, MERCHANT_MCC num 4, DOMICILIO_COMERCIO alfa-num 25, CODIGO_POSTAL num 10, CIUDAD_TERMINAL alfa-num 13, ESTADO_TERMINAL alfa-num 3, PAIS_TERMINAL alfa-num 2) | Manual Agregadores V2.6.4 (CE) sección "Esquema 4 Sin AGP" — pendiente confirmar página | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| G4 | Cargos Periódicos Agregadores: REF_CLIENTE3 es R (obligatorio) para todas las transacciones | Manual Cargos Periódicos Agregadores V2.6.4 — pendiente confirmar página | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| G5 | El bot detecta automáticamente el esquema según presencia de AGGREGATOR_ID, SUB_MERCHANT, MERCHANT_MCC en el log | Regla de implementación (no en manual). Pregunta P6 al final. | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO H — Validaciones cruzadas entre capas ────

| # | Regla | 📖 Fuente | Correcto |
| H1 | POSTAUTH requiere AUTH_CODE obtenido de PREAUTH previa | Implícito: MOTO V1.5 p.7 "REFERENCIA... requerida para POSTAUTORIZACION" — la referencia es el output de PREAUTH | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| H2 | REFERENCIA del servlet debe coincidir con Campo 37 de PROSA (ISO 8583) | Estándar ISO 8583 + REFERENCE3D se envía como NUMERO_CONTROL (3DS V1.4 p.7) | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| H3 | Unicidad: combinación MERCHANT_ID + CONTROL_NUMBER debe ser única e irrepetible | MOTO V1.5, p.7: "La combinación del número de afiliación con este número de control deberá ser único e irrepetible por cada transacción" | ☐ ✅ ☐ ❌ ☐ ⚠️ |

──── GRUPO I — PCI-DSS (datos sensibles) ────

| # | Regla | 📖 Fuente | Correcto |
| I1 | CLAVE_USR / PASSWORD no se valida contra log (nunca se logea por PCI) | Práctica estándar PCI-DSS + MOTO V1.5 p.6 lo marca como R en envío pero observado que no aparece en logs | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| I2 | CÓDIGO_SEGURIDAD / SECURITY_CODE no se valida contra log (PCI-DSS prohíbe su almacenamiento) | PCI-DSS Requirement 3.2.2: "Do not store the card verification code/value after authorization" | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| I3 | FECHA_EXP en Agregadores: se relajó de R a O porque no aparece en logs reales (ZIGU/OPENLINEA/DLOCAL) aunque el manual la exija | Observación empírica de logs reales de agregadores | ☐ ✅ ☐ ❌ ☐ ⚠️ |
| I4 | CARD_NUMBER en log debe aparecer enmascarada (ej. 542418******1734) | PCI-DSS Requirement 3.3 + observado en todos los logs reales | ☐ ✅ ☐ ❌ ☐ ⚠️ |

═══════════════════════════════════════════════════════════════════
PÁGINA 8 — FLUJO DEL BOT
═══════════════════════════════════════════════════════════════════
Diagrama simple o lista:

1. Usuario sube: matriz Excel + logs + CSV de afiliaciones
2. Usuario captura: Coordinador, Lenguaje, Versión aplicación, URL subdominio
3. Bot valida cada transacción contra las reglas de los grupos A-I
4. Bot genera dashboard de resultados (aprobado/rechazado por capa)
5. Bot genera carta oficial PDF con código CEXXXX-NNNNNNN_AFILIACION

Pregunta: "¿El flujo refleja su proceso actual? ¿Falta algún paso?"
Espacio: _______________________________

═══════════════════════════════════════════════════════════════════
PÁGINAS 9–10 — PREGUNTAS ABIERTAS PARA RESPONDER
═══════════════════════════════════════════════════════════════════
Tabla con 3 columnas:

| # | Pregunta | Respuesta de Ramsses |
| P1 | ¿Existe un glosario oficial español↔inglés de variables Payworks que podamos usar? | ___________ |
| P2 | FECHA_EXP no aparece en logs de agregadores reales. ¿En qué productos SÍ aparece? ¿Con qué nombre en el log? | ___________ |
| P3 | Clarificación: 3D_CERTIFICATION=03 (envío) vs Status=200 (retorno). ¿Confirma que son DOS campos distintos y ambos deben validarse? | ___________ |
| P4 | ¿El comercio tiene acceso a los logs del PinPad (API PW2 e Interredes Remoto)? | ___________ |
| P5 | ¿Cómo distinguir CIT vs MIT automáticamente? ¿Viene de la matriz, del log, o del histórico? | ___________ |
| P6 | ¿Cómo identificar automáticamente el esquema de agregador (1, 4 Sin AGP, 4 Con AGP) desde el log? | ___________ |
| P7 | Regla de generación del número de certificado (ej. CE3DS-0003652): ¿consecutivo global, por afiliación, por producto? ¿Secuencia Oracle? | ___________ |
| P8 | ¿Bajo qué criterio se emite la carta? ¿Solo si todo APROBADO, o permite observaciones con rechazos? | ___________ |
| P9 | AMEX en Tradicional: ¿los ~20 campos AMEX opcionales (DOMICILIO, TELEFONO, DATOS_BROWSER, datos de entrega, productos) son R para VENTA/PREAUTH AMEX o siempre O? | ___________ |
| P10 | MARKETPLACE_TX: ¿Banorte valida las condiciones (producto fuera de México + VISA + VENTA/PREAUTH) o el comercio? | ___________ |
| P11 | NUMERO_BIN aparece en logs de agregadores (6 dígitos) pero NO en los manuales. ¿Se debe validar? ¿Es R u O? | ___________ |
| P12 | REVERSAL vs VOID: ¿se comportan igual? ¿Cuándo se usa cada una? | ___________ |
| P13 | ¿Qué formato usan para exportar NPAYW.AFILIACIONES (CSV, TXT con pipes, Excel)? ¿Qué encoding? ¿Cuáles son los nombres exactos de las columnas? | ___________ |
| P14 | ¿Pueden compartir el archivo Word (.docx) original de la carta de certificación para generar PDFs visualmente idénticos? | ___________ |
| P15 | Coordinador de certificación: ¿es un valor fijo por equipo o cambia por proyecto? ¿Lo captura el usuario en cada corrida? | ___________ |

Pie:
- Firma del revisor: _______________________________
- Fecha de revisión: _______________________________
- Devolver a: [correo del equipo de desarrollo]

═══════════════════════════════════════════════════════════════════

FORMATO VISUAL:
- Tipografía: Gotham/Montserrat para títulos, Roboto para cuerpo
- Paleta Banorte: rojo #EB0029 en encabezados de tabla, gris oscuro #323E48 texto
- Tablas con bordes finos, encabezado fondo rojo + texto blanco
- Casillas ☐ ✅ ☐ ❌ ☐ ⚠️ para marcar
- Logo Banorte en portada y esquina superior derecha
- Numeración de página abajo centrada
- Columnas "📖 Fuente" con tipografía más pequeña (8-9pt) y cursiva

ENTREGA: Word (.docx) editable o PDF imprimible.

CALIDAD: todas las citas con páginas específicas son verificadas por
lectura directa de los PDFs oficiales. Las citas marcadas como
"(pendiente confirmar página)" deben ser completadas por Ramsses o
por lectura adicional antes de la entrega final.
```

---

## Cómo usar este prompt

1. **Herramienta**: Claude (web), Claude Cowork, ChatGPT, Gamma, Beautiful.ai.
2. **Copia** el bloque completo (desde `Genera un documento...` hasta `...antes de la entrega final.`).
3. **Pégalo** en el campo de prompt.
4. **Pide** formato Word (.docx) editable o PDF imprimible.
5. **Personaliza**: ajusta el correo del equipo al final del documento antes de enviarlo a Ramsses.

## Citas verificadas (nivel de confianza)

### ✅ Alta confianza — páginas leídas directamente
- Ventana CE v1.8, p.6-8 (variables + caracteres prohibidos)
- MOTO v1.5, p.6-8 (variables + caracteres prohibidos + AN5822 CIT/MIT)
- 3D Secure v1.4, p.6-9 (variables envío + retorno + nota XID/CAVV)

### ⚠️ Mediana confianza — página estimada por estructura paralela
- Comercio Electrónico Tradicional v2.5 (asumido mismo formato que MOTO)
- Cargos Periódicos Post v2.1 (asumido mismo formato)
- Agregadores v2.6.4 (páginas de esquemas 1/4 Sin AGP/4 Con AGP)

### ❌ Pendiente de verificar
- Cybersource Direct v1.10 (Decision enum, Card_cardType en p.5-7 sin confirmar)
- API PW2 Seguro v2.4 (Tarjeta Presente, EMV)
- Interredes Remoto v1.7 (EMV, SDK PPSet/PPGet)
- Valores exactos de AN5822 CIT/MIT (IND_PAGO/TIPO_MONTO/INFO_PAGO/COF) en cada producto

El equipo de Ramsses puede completar las páginas pendientes durante la revisión.
