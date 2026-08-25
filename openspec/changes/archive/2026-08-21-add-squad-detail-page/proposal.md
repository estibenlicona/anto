## Why

Gestionar el equipo de una célula hoy obliga a salir del módulo de Células: ir a Capacidades, elegir la célula en un selector y recién ahí asignar, editar o quitar personas. El listado de Células ya muestra equipo y capacidad por fila, pero no hay adónde "entrar". El mockup aprobado (artifact "Detalle de Célula") resuelve el flujo natural: en el listado, el nombre de la célula es un enlace a su página de detalle, y ahí vive la gestión del equipo junto con el resumen propio de esa célula.

## What Changes

- **Nueva página de detalle de célula** en `/app/lead/celulas/:id`, con:
  - Encabezado: enlace "← Células", nombre como título, badge de criticidad en español, tribu, descripción; acciones **Editar célula**, **Asignar persona** y menú con **Eliminar célula**.
  - Tres cards propias de la célula: **Equipo** (total, avatares, lectura de cuántos son Expertos y cuántos Principiantes), **Capacidad asignada** (FTE asignado frente al FTE disponible de las personas del equipo, barra y "libre"), **Mix BAU / Transformación** (barra segmentada, leyenda y lectura "% del esfuerzo va a operación").
  - Una sola tab, **Equipo** (con conteo): toolbar con búsqueda por nombre o cargo y filtro por seniority; tabla con Persona (avatar con color de identidad, nombre, cargo · modalidad), Seniority (componente de nivel del sistema), Dedicación en esta célula (barra + %), BAU / Transformación (mini barra segmentada + %), Disponible de la persona (% libre contando todas sus células, con lectura de sobreasignación), y menú de fila Editar / Quitar.
  - Las asignaciones se crean, editan y quitan desde esta página con los mismos formularios y diálogos que hoy viven en Capacidades.
- **El nombre de la célula en el listado pasa a ser un enlace** al detalle (tono neutro, como en Personas) y el menú de fila pierde "Ver equipo".
- **Se elimina la pantalla Capacidades** (`/app/lead/capacidades`, su ítem de menú y `LeadCapacityPage`); `?celula=<id>` en esa ruta redirige al detalle de esa célula, y sin id redirige al listado de Células.
- **Contrato de datos (sólo mock, backend real como brecha)**:
  - `GET /squads/:id` en el mock (hoy declarado en el spec pero no implementado), devolviendo la célula con sus campos calculados.
  - `AllocationDto` gana campos de sólo lectura para la fila: `personPosition`, `personModality`, `personSeniority`, `personSeniorityLabel`, `personAvailablePercentage` (100 − Σ dedicación de la persona en todas sus células) y `personOtherSquadsPercentage`.
  - Nuevo `GET /squads/:id/team-stats` con el resumen del equipo de la célula: `memberCount`, `members` (todos, id+nombre), `expertCount`, `beginnerCount`, `allocatedFte`, `bauFte`, `transformationFte`, `teamAvailableFte` (Σ `availableFte` de las personas del equipo).
  - `GET /squads/:id/allocations` acepta `search` (nombre o cargo) y `seniority` (repetible).
- **Shell**: la entrada "Células" queda activa en rutas hijas (`/app/lead/celulas/...`) y el breadcrumb suma un tercer nivel con el nombre de la célula cuando se está en el detalle.

### Supuestos registrados

- Tabs: se implementa sólo **Equipo**. Iniciativas, Resumen y Backlog del mockup no se muestran hasta tener dominio en el frontend (el usuario no expresó preferencia; se toma la opción recomendada).
- El denominador de "Capacidad asignada" en el detalle es el FTE disponible de las personas del equipo (no el del chapter), porque la pregunta de la card es cuánto de *su gente* está comprometida con esta célula.
- No hay página de detalle de persona; el nombre en la tabla del equipo no es enlace.

### Fuera de alcance

- Pantalla de detalle de persona, iniciativas, backlog, tablero DevOps.
- Migrar los formularios de asignación/célula de `Modal` a `Drawer`.
- Backend .NET real y cambios en `tuip`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `squads`: nuevo requisito "Detalle de célula" (encabezado, cards, equipo con gestión de asignaciones); "Listar células" cambia el nombre a enlace y quita "Ver equipo" del menú.
- `allocations`: la gestión de asignaciones pasa de la pantalla Capacidades al detalle de la célula; se elimina "Elegir una célula para administrar su equipo" y "Acceso sin autenticación a la pantalla de Capacidades"; "Listar las asignaciones" suma columnas de persona, seniority y disponibilidad, búsqueda y filtro.
- `chapter-lead-shell`: la navegación deja de listar Capacidades; la entrada Células permanece activa en sus rutas hijas y el breadcrumb muestra el nombre de la célula en el detalle; `/app/lead/capacidades` redirige.
- `api-mocking`: `GET /squads/:id` implementado; handler de asignaciones con campos de persona, disponibilidad, filtros, y `GET /squads/:id/team-stats`.

## Impact

- **Frontend — squads**: nuevos `SquadDetailContainer.tsx`, `components/SquadDetailHeader.tsx`, `components/SquadTeamStatsCards.tsx`, `hooks/useSquad.ts`, `hooks/useSquadTeamStats.ts`; `squadService.ts` (`getById`, `getTeamStats`); `SquadsList.tsx` (enlace, sin "Ver equipo"); `SquadsContainer.tsx` (sin `onViewTeam`).
- **Frontend — allocations**: `AllocationsContainer.tsx` pasa a recibir `squadId` por prop (sin selector ni `useSearchParams`); `AllocationsList.tsx` (columnas nuevas, toolbar); `useAllocations.ts` (search/seniority); `allocationService.ts` y `AllocationAdapter.ts` (campos nuevos).
- **Frontend — shell/router**: `routes.tsx` (ruta `celulas/:id`, redirect de `capacidades`), `chapter-lead-shell/navigation.ts` (sin Capacidades; `resolveLeadNavId` por prefijo), `ChapterLeadLayout.tsx` (tercer nivel del breadcrumb), eliminación de `pages/LeadCapacityPage`, nueva `pages/LeadSquadDetailPage`.
- **Mocks**: `squads.handlers.ts` (`GET /squads/:id`, `GET /squads/:id/team-stats`), `allocations.handlers.ts` (enriquecimiento desde personas, filtros).
- **Pruebas**: tests de los componentes/hooks nuevos, de `SquadsList`/`SquadsContainer` (enlace), `AllocationsContainer`/`AllocationsList` (nuevas columnas y filtros), `ChapterLeadLayout` y `navigation` (menú sin Capacidades, activo por prefijo, breadcrumb), handlers.
- **Sin impacto**: backend real (brecha documentada), `tuip`.
