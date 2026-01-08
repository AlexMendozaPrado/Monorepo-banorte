# Plan de Implementacion - Nuevo Modelo de Datos SDK Version Control

## Estado Actual

### Value Objects Creados
- [x] `ProjectStatus.ts` - Estados: productivo, piloto, desarrollo, iniciativa
- [x] `EntityType.ts` - Tipos: banco, filial
- [x] `ResponsiblePerson.ts` - Roles: negocio, ti, ern
- [x] `index.ts` - Exportaciones actualizadas

### Componentes Existentes
- [x] `DashboardPage.tsx` - Pagina principal con CRUD
- [x] `ServiceFormModal.tsx` - Modal crear/editar (campos basicos)
- [x] `DeleteConfirmationModal.tsx` - Modal confirmacion eliminar
- [x] `ServiceCard.tsx` - Tarjeta de servicio
- [x] `ComparisonPanel.tsx` - Panel comparacion
- [x] `FilterBar.tsx` - Barra de filtros
- [x] `SummaryStats.tsx` - Estadisticas

---

## Tareas Pendientes

### 1. Actualizar Entidad Service (Domain Layer) - COMPLETADO
- [x] Agregar campos nuevos a `Service.ts`:
  - `projectStatus: ProjectStatus`
  - `entity: EntityType`
  - `hasASM: boolean`
  - `implementationDate: string`
  - `dateConfirmed: boolean`
  - `responsibleBusiness: string`
  - `responsibleIT: string`
  - `responsibleERN: string`
- [x] Actualizar `CreateServiceData` interface
- [x] Actualizar metodo `create()` y `reconstitute()`
- [x] Actualizar `toJSON()`
- [x] Agregar metodos `getResponsibles()` y `getFormattedImplementationDate()`

### 2. Actualizar DTOs (Application Layer) - COMPLETADO
- [x] Actualizar `ServiceDTO.ts` con campos nuevos
- [x] Actualizar `toServiceDTO()` para incluir campos Banorte
- [x] Actualizar `useServiceMutations.ts` interfaces

### 3. Actualizar Repositorios (Infrastructure Layer) - COMPLETADO
- [x] Actualizar `JSONConfigLoader.ts` para leer campos Banorte
- [x] Actualizar `services.config.json` con datos de prueba

### 4. Actualizar ServiceFormModal (UI Layer) - COMPLETADO
- [x] Agregar seccion "Informacion del Proyecto":
  - Radio buttons para ProjectStatus
  - Radio buttons para EntityType (banco/filial)
  - Checkbox para ASM
  - Date picker para fecha implementacion
  - Checkbox "Por confirmar"
- [x] Agregar seccion "Responsables":
  - Input Responsable Negocio
  - Input Responsable TI
  - Input Responsable ERN
- [x] Actualizar `ServiceFormData` interface
- [x] Actualizar inicializacion del formulario
- [x] Actualizar `DashboardPage.tsx` handleFormSubmit

### 5. Actualizar ServiceCard - COMPLETADO
- [x] Mostrar badges: ProjectStatus, Entity, ASM
- [x] Mostrar avatares de responsables (overlapping circles)
- [x] Mostrar fecha implementacion

### 6. Actualizar ComparisonPanel - COMPLETADO
- [x] Agregar seccion "Informacion del Proyecto" en tabla
- [x] Mostrar comparacion de Project Status, Entity, ASM
- [x] Mostrar comparacion de fechas implementacion
- [x] Mostrar comparacion de responsables

### 7. Actualizar FilterBar - COMPLETADO
- [x] Agregar filtros por ProjectStatus (dropdown con opciones)
- [x] Agregar filtros por Entity (dropdown banco/filial)
- [x] Agregar filtro por ASM (dropdown Con ASM/Sin ASM)
- [x] Agregar badges de filtros activos con botón para remover
- [x] Agregar botón "Limpiar filtros"
- [x] Actualizar ServiceFilters interface con campos Banorte
- [x] Actualizar GitHubServiceRepository.findAll() para filtrar por campos Banorte

### 8. Actualizar SummaryStats
- [x] Ya muestra conteo por ProjectStatus (productivo, piloto, desarrollo, iniciativa)

### 9. Actualizar Use Cases (Application Layer) - COMPLETADO
- [x] Actualizar `CreateServiceUseCase.ts` con campos Banorte
- [x] Actualizar `UpdateServiceUseCase.ts` con campos Banorte

### 10. Actualizar Repositorios CRUD (Infrastructure Layer) - COMPLETADO
- [x] Actualizar `IServiceRepository.ts` interface con campos Banorte
- [x] Actualizar `GitHubServiceRepository.ts`:
  - [x] Agregar imports de ProjectStatus y EntityType
  - [x] Actualizar ServiceJSON interface
  - [x] Actualizar jsonToService() para leer campos Banorte
  - [x] Actualizar serviceToJson() para serializar campos Banorte
  - [x] Actualizar update() con campos Banorte

---

## Orden de Implementacion

1. **Domain Layer** - Actualizar Service.ts
2. **Application Layer** - Actualizar DTOs
3. **Infrastructure Layer** - Actualizar repositorios y config
4. **UI Layer** - Actualizar componentes en orden:
   - ServiceFormModal (para poder crear con nuevos campos)
   - ServiceCard (para visualizar)
   - ComparisonPanel (para comparar)
   - FilterBar (para filtrar)

---

## Notas Tecnicas

### Colores por ProjectStatus
```typescript
productivo: '#6CC04A' // Verde
piloto: '#FFA400'     // Naranja
desarrollo: '#3B82F6' // Azul
iniciativa: '#9CA3AF' // Gris
```

### Colores por EntityType
```typescript
banco: '#EC0029' // Rojo Banorte
filial: '#3B82F6' // Azul
```

### Formato Fecha Implementacion
- Si `dateConfirmed === false`: mostrar "Por confirmar"
- Si `dateConfirmed === true`: mostrar fecha en formato DD/MM/YYYY

---

## Pendiente: Integración GitHub para Producción

### Estado Actual
- `REPOSITORY_TYPE=memory` → InMemoryServiceRepository (datos no persisten)
- `REPOSITORY_TYPE=github` → GitHubServiceRepository (commits a GitHub)

### Para habilitar persistencia en Vercel

1. **Crear GitHub Personal Access Token**
   - URL: https://github.com/settings/tokens/new
   - Scope requerido: `repo` (Full control of private repositories)

2. **Configurar variables en Vercel**
   ```env
   REPOSITORY_TYPE=github
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   GITHUB_OWNER=AlexMendozaPrado
   GITHUB_REPO=proyecto-app-sdk
   GITHUB_BRANCH=main
   ```

3. **Re-deploy** la aplicación

### Archivos involucrados
- `src/infrastructure/di/modules/sdkModule.ts` - Selección de repositorio
- `src/infrastructure/services/GitHubApiClient.ts` - Cliente GitHub API
- `src/infrastructure/repositories/GitHubServiceRepository.ts` - Repositorio con commits
- `.env.example` - Template de variables

### Comportamiento esperado
Cuando un usuario crea/edita/elimina un servicio:
- Se genera un commit automático al repositorio
- Mensajes de commit:
  - `feat(services): add NombreServicio`
  - `chore(services): update NombreServicio`
  - `chore(services): remove NombreServicio`
