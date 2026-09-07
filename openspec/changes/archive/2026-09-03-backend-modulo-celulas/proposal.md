# Backend: módulo Células completo al contrato

## Why

Cuarto ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Células está 3🟢 2🟡 2🔴: el `SquadDto` no trae los agregados calculados que el listado muestra (`memberCount`, `members`, FTEs, `activeInitiative`), el listado no filtra por `search`/`criticality`, y faltan `GET /squads/{id}/team-stats` y `GET /squads/stats`. Las asignaciones sembradas en el cambio anterior son justamente la materia prima de estos agregados: hoy el backend ya sabe quién está en cada célula y con qué dedicación, pero el DTO no lo cuenta.

## What Changes

- **`SquadDto` del contrato**: `team` (hoy viaja como `tribe`), sin `devOpsBoardId`, `updatedAtUtc` no nulo (cae en `createdAtUtc` si nunca se editó), y los agregados de sólo lectura calculados desde las asignaciones: `memberCount`, `members` (muestra de 3 por nombre), `allocatedFte`/`bauFte`/`transformationFte` (Σ porcentaje/100, a un decimal), `peopleAvailableFte` (Σ `availableFte` de las personas asignadas) y `activeInitiative` (la iniciativa Activa de la célula; `talla` queda `""` hasta que el módulo de iniciativas traiga la evaluación — anotado).
- **`GET /squads`**: filtros `search` (nombre o equipo) y `criticality` (multivalor) + DTO enriquecido; `GET /squads/{id}` igual.
- **`GET /squads/{id}/team-stats`** (404 si no existe): equipo completo (sin recorte), `expertCount` (nivel 4), `beginnerCount` (nivel 1) y los mismos FTEs.
- **`GET /squads/stats`**: sobre el total — `totalCount`, `withoutPeopleCount`, `atCapacityCount` (con gente y `allocatedFte ≥ peopleAvailableFte`), `teamCount` (equipos distintos), Σ FTEs, `chapterFte` (Σ `availableFte` de todas las personas) y `byCriticality` con los 4 niveles siempre presentes (Critical, High, Medium, Low).
- **Fórmulas de FTE compartidas** en un helper de Application (redondeo a un decimal, Σ porcentajes/100, Σ disponibles): la Torre de control y Líneas de expertise responderán la misma cuenta después.
- **Requests del contrato**: `CreateSquadRequest {name, team, criticality, description?}` (hoy el campo se llama `Tribe` en el cuerpo — breaking pre-productivo).
- Fuera de alcance: scope por chapter, el módulo de iniciativas (sólo se lee su estado Activo), la Torre de control y `/criticalities` (ya servido).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract` y `backend/oas.json` ya exigen; el cambio declara `skip_specs`.)

## Impact

- `backend/src`: Application (SquadDto + DTOs de stats, helper de FTE, mappings, requests, use cases GetSquads/GetSquadById + nuevos GetSquadsStats/GetSquadTeamStats), Infrastructure (repositorio con filtros), WebApi (bindings, endpoints nuevos, ejemplos Swagger). Domain no cambia.
- `backend/tests`: use cases de células (agregados, filtros, stats) y factories.
- `backend/ENDPOINTS.md` (Células hacia 7🟢). `backend/oas.json` no cambia.
- Supuesto anotado: `activeInitiative.talla` = `""` hasta el módulo de iniciativas (sin semillas de iniciativas, en la práctica llega `null`).
