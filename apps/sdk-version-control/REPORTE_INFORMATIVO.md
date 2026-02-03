# Reporte Informativo: SDK Version Control

## 1. Resumen Ejecutivo

**SDK Version Control** es una plataforma interna de Banorte para el monitoreo centralizado, gestion y control de versiones de SDKs de terceros integrados en las aplicaciones del banco.

La herramienta proporciona visibilidad en tiempo real sobre el estado de cada SDK desplegado, las versiones instaladas por canal, los responsables de cada integracion y el ciclo de vida del proyecto, permitiendo a los equipos de TI y negocio tomar decisiones informadas sobre actualizaciones, riesgos de seguridad y compatibilidad.

---

## 2. Necesidad de Negocio

### Problema

Banorte opera multiples aplicaciones y canales digitales (Banorte Movil, Casa de Bolsa, Contrata, entre otros) que dependen de SDKs externos para funcionalidades criticas como:

- **Verificacion de identidad** (biometria, documentos, autenticacion)
- **Analitica y atribucion** (comportamiento de usuarios, campanas)
- **Monitoreo de rendimiento** (estabilidad, errores, performance)
- **Gestion de contenido** (experiencias personalizadas)
- **Pagos y servicios financieros**

Cada SDK se despliega en multiples canales, plataformas (Web, iOS, Android) y con versiones potencialmente distintas. Sin una herramienta centralizada, esto genera:

| Riesgo | Descripcion |
|--------|-------------|
| **Vulnerabilidades de seguridad** | Versiones desactualizadas pueden contener CVEs conocidos, exponiendo datos de clientes |
| **Incumplimiento regulatorio** | La banca esta sujeta a regulaciones estrictas (CNBV, PCI-DSS) que exigen control de dependencias |
| **Fragmentacion de versiones** | Diferentes canales ejecutando versiones distintas genera inconsistencias de experiencia y comportamiento |
| **Falta de visibilidad** | Sin un inventario centralizado, no hay forma rapida de saber quien es responsable de cada SDK ni su estado |
| **Riesgo operativo** | Actualizaciones criticas no aplicadas a tiempo pueden causar interrupciones de servicio |
| **Dependencia de conocimiento individual** | La informacion de cada SDK vive en la mente de personas especificas, no en un sistema accesible |

### Solucion

SDK Version Control resuelve estos problemas proporcionando:

1. **Inventario centralizado** de todos los SDKs con sus versiones por plataforma y canal
2. **Monitoreo automatico** de versiones mas recientes disponibles via web scraping
3. **Alertas de estado** clasificadas por severidad (al dia, pendiente, desactualizado, critico)
4. **Trazabilidad** de responsables por cada integracion (Negocio, TI, ERN)
5. **Cobertura por canal** para saber exactamente que version corre en cada aplicacion de Banorte
6. **Comparacion de servicios** para analizar diferencias entre SDKs lado a lado

---

## 3. SDKs Monitoreados

### Servicios de Identidad y Seguridad (activos en produccion)

| SDK | Descripcion | Plataformas |
|-----|-------------|-------------|
| **BioCatch** | Biometria conductual para deteccion de fraude | Web, iOS, Android |
| **IDlayr** | Capa de validacion y autenticacion de identidad | Web, iOS, Android |
| **Incode** | Verificacion biometrica y validacion de documentos | Web, iOS, Android |
| **MBIoM** | Modulo biometrico movil para autenticacion segura | Web, iOS, Android |
| **TruID** | Verificacion y autenticacion de identidad digital | Web, iOS, Android |

### Servicios externos configurados para scraping

| SDK | Categoria | Uso |
|-----|-----------|-----|
| **Firebase** | Analitica / Infraestructura | Push notifications, analytics, crashlytics |
| **Segment** | Analitica | Recopilacion y enrutamiento de datos de usuarios |
| **AppsFlyer** | Atribucion / Movil | Atribucion de campanas y deep linking |
| **Dynatrace** | Monitoreo | Observabilidad de performance y errores |
| **Stripe** | Pagos | Procesamiento de pagos |
| **Braze** | Engagement | Comunicacion multicanal con clientes |
| **Contentful** | CMS | Gestion de contenido headless |

---

## 4. Canales de Despliegue Banorte

Cada SDK se rastrea individualmente en los siguientes canales de negocio:

| Canal | Identificador | Descripcion |
|-------|---------------|-------------|
| Banorte Movil | `banorte-movil` | App movil principal para clientes persona fisica |
| Contrata | `banorte-contrata` | Canal de contratacion de productos |
| Casa de Bolsa | `casa-de-bolsa` | Plataforma de inversion y bolsa de valores |
| SGV1-UP-TDC | `sgv1-up-tdc` | Plataforma de tarjetas de credito |
| Autoservicio PM | `autoservicio-persona-moral` | Autoservicio para personas morales |
| MBio Web | `mbio-web` | Plataforma web biometrica |
| Banortec | `banortec` | Banca corporativa |
| Auto en Linea | `auto-en-linea` | Seguros de auto en linea |
| Banorte Movil Jovenes Sigma | `banorte-movil-jovenes-sigma` | App movil para segmento joven |

Cada canal mantiene su propia version del SDK con un estado de despliegue independiente (productivo, piloto o desarrollo), lo que permite estrategias de rollout escalonado.

---

## 5. Clasificacion de Estados

### Estado de Version del SDK

El sistema calcula automaticamente el estado de cada version comparando la version instalada contra la mas reciente disponible:

| Estado | Etiqueta | Criterio | Accion requerida |
|--------|----------|----------|------------------|
| **Current** | Al dia | Version actual coincide con la mas reciente | Ninguna |
| **Warning** | Actualizacion menor | 1-4 versiones minor por detras (mismo major) | Planificar actualizacion |
| **Outdated** | Desactualizado | 1 major por detras o 5+ minor por detras | Actualizar pronto |
| **Critical** | Actualizacion critica | 2+ versiones major por detras | Actualizacion urgente |
| **Unknown** | Desconocido | No se pudo determinar el estado | Investigar |

### Estado del Proyecto

Cada servicio/SDK tiene un estado de ciclo de vida dentro de Banorte:

| Estado | Color | Descripcion |
|--------|-------|-------------|
| **Productivo** | Verde (#6CC04A) | SDK en produccion, operando normalmente |
| **Piloto** | Naranja (#FFA400) | En fase de pruebas controladas |
| **Desarrollo** | Azul (#3B82F6) | En fase de desarrollo e integracion |
| **Iniciativa** | Gris (#9CA3AF) | Propuesta o evaluacion inicial |

### Tipo de Entidad

| Entidad | Color | Descripcion |
|---------|-------|-------------|
| **Banco** | Rojo Banorte (#EC0029) | SDK utilizado por el banco principal |
| **Filial** | Azul (#3B82F6) | SDK utilizado por una filial del grupo |

---

## 6. Datos Capturados por Servicio

Para cada SDK registrado, el sistema almacena:

### Informacion General
- Nombre del servicio
- Categoria (Identidad, Analitica, Monitoreo, etc.)
- Descripcion
- URL de documentacion oficial
- Logo

### Versiones por Plataforma
- Version actual instalada (Web, iOS, Android)
- Ultima version disponible (obtenida por scraping)
- Estado calculado (current, warning, outdated, critical)
- Fecha de release
- Changelog y breaking changes

### Informacion del Proyecto Banorte
- Estado del proyecto (productivo, piloto, desarrollo, iniciativa)
- Tipo de entidad (banco, filial)
- Indicador ASM (Asset Security Management)
- Fecha de implementacion (con indicador de confirmacion)

### Responsables
- **Responsable de Negocio**: Lider del area que requiere el SDK
- **Responsable de TI**: Lider tecnico de la integracion
- **Responsable ERN**: Encargado de riesgo y cumplimiento

### Canales
- Version desplegada por canal
- Estado de despliegue por canal (productivo, piloto, desarrollo)

---

## 7. Capacidades del Dashboard

### Vista Principal
- Tarjetas de servicio con informacion resumida
- Indicadores visuales de estado por colores
- Badges de canales agrupados por estado de despliegue
- Avatares de responsables
- Conteo de canales activos

### Panel de Estadisticas
| Metrica | Descripcion |
|---------|-------------|
| Total Servicios | Cantidad total de SDKs registrados |
| Actualizados | SDKs con versiones al dia |
| Pendientes | SDKs con actualizaciones menores o mayores disponibles |
| Criticos | SDKs con actualizaciones criticas requeridas |

### Filtros Avanzados
- Por categoria del SDK
- Por plataforma (Web, iOS, Android)
- Por estado de version (current, warning, outdated, critical)
- Por estado del proyecto (productivo, piloto, desarrollo, iniciativa)
- Por entidad (banco, filial)
- Por ASM (con/sin)
- Busqueda por texto libre (nombre, descripcion)

### Comparacion de Servicios
- Seleccion de 2 a 4 servicios para comparacion lado a lado
- Desglose por plataforma y version
- Comparacion de estados de proyecto, entidades y responsables
- Comparacion de fechas de implementacion

### Verificacion de Versiones
- Scraping automatico de documentacion oficial de cada SDK
- Deteccion de versiones mas recientes disponibles
- Actualizacion bajo demanda o programada
- Soporte para multiples fuentes (npm, GitHub releases, docs oficiales)

---

## 8. Arquitectura Tecnica

### Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 14, React 18, TypeScript 5.4 |
| Estilos | Tailwind CSS 3.4, @banorte/ui (design system) |
| Validacion | Zod |
| Scraping | Cheerio |
| HTTP | Axios |
| Persistencia | GitHub API (commits automaticos) o memoria |

### Patron Arquitectonico

La aplicacion implementa **Clean Architecture** con **Domain-Driven Design (DDD)**, separando responsabilidades en capas:

```
┌─────────────────────────────────────────────┐
│            UI Layer (React/Next.js)          │
│   Dashboard, Cards, Filters, Modals, Hooks  │
├─────────────────────────────────────────────┤
│              API Layer (REST)                │
│   /api/services, /api/health                │
├─────────────────────────────────────────────┤
│          Application Layer (Use Cases)       │
│   CRUD, CheckVersions, CompareServices      │
├─────────────────────────────────────────────┤
│            Domain Layer (Entidades)          │
│   Service, SDKVersion, Value Objects        │
├─────────────────────────────────────────────┤
│        Infrastructure (Repositorios)         │
│   GitHub, InMemory, Scrapers, DI Container  │
└─────────────────────────────────────────────┘
```

### Modos de Persistencia

| Modo | Uso | Comportamiento |
|------|-----|---------------|
| **Memory** | Desarrollo local | Datos en memoria, no persisten entre reinicios |
| **GitHub** | Produccion | Cada operacion CRUD genera un commit automatico al repositorio |

---

## 9. API REST

| Endpoint | Metodo | Operacion |
|----------|--------|-----------|
| `GET /api/services` | GET | Listar servicios con filtros |
| `POST /api/services` | POST | Crear nuevo servicio |
| `GET /api/services/:id` | GET | Obtener servicio por ID |
| `PUT /api/services/:id` | PUT | Actualizar servicio completo |
| `PATCH /api/services/:id` | PATCH | Actualizar solo version |
| `DELETE /api/services/:id` | DELETE | Eliminar servicio |
| `POST /api/services/check-updates` | POST | Verificar actualizaciones disponibles |
| `GET /api/services/compare` | GET | Comparar multiples servicios |
| `GET /api/health` | GET | Health check del sistema |

---

## 10. Valor para Banorte

### Beneficios Operativos

- **Reduccion de riesgo de seguridad**: Identificacion temprana de SDKs con versiones vulnerables
- **Cumplimiento regulatorio**: Inventario auditable de dependencias externas con responsables asignados
- **Eficiencia operativa**: Eliminacion de hojas de calculo y seguimiento manual
- **Visibilidad ejecutiva**: Dashboard con metricas claras del estado de salud de las integraciones
- **Trazabilidad**: Historial de cambios via commits automaticos en GitHub

### Beneficios Tecnicos

- **Deteccion automatica de actualizaciones**: Web scraping contra documentacion oficial
- **Multi-plataforma**: Seguimiento unificado de Web, iOS y Android
- **Multi-canal**: Visibilidad de versiones por cada canal de negocio de Banorte
- **Escalable**: Arquitectura DDD preparada para agregar nuevos SDKs y canales
- **Integrado al monorepo**: Comparte design system (@banorte/ui) y configuraciones con el resto del ecosistema

### KPIs que habilita

| KPI | Descripcion |
|-----|-------------|
| % SDKs actualizados | Porcentaje de SDKs con version al dia |
| Tiempo de actualizacion | Tiempo entre release de nueva version y su despliegue |
| Cobertura de canales | Porcentaje de canales con versiones actualizadas |
| SDKs criticos | Cantidad de SDKs que requieren actualizacion urgente |
| Consistencia de versiones | Grado de uniformidad de versiones entre canales |

---

## 11. Estado Actual del Sistema

### Servicios Activos en Produccion

Todos los servicios de identidad estan activos en estado **productivo** con despliegue en los 9 canales de Banorte:

| SDK | Estado | Entidad | ASM | Canales Activos |
|-----|--------|---------|-----|-----------------|
| BioCatch | Productivo | Banco | Si | 9/9 |
| IDlayr | Productivo | Banco | Si | 9/9 |
| Incode | Productivo | Banco | Si | 9/9 |
| MBIoM | Productivo | Banco | Si | 9/9 |
| TruID | Productivo | Banco | Si | 9/9 |

### Infraestructura

- **Entorno**: Next.js sobre Vercel (produccion) / local (desarrollo)
- **Puerto**: 3005
- **Persistencia**: GitHub API con commits automaticos
- **Monorepo**: Integrado en Monorepo-banorte con Turborepo

---

*Reporte generado a partir del analisis del codigo fuente y configuracion del proyecto SDK Version Control v1.0.0.*
