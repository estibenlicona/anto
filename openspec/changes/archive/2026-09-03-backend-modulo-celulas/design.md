# Diseño — Backend: módulo Células completo

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`SquadDto` con agregados, `SquadMemberSampleDto {id,name}`, `SquadActiveInitiativeDto {id,name,talla}`, `SquadTeamStats`, `SquadsStats`, `CreateSquadRequest {name,team,criticality,description?}`); semántica en `frontend/src/mocks/handlers/squads.handlers.ts` (enrich, computeTeamStats, computeStats) y `frontend/src/mocks/handlers/fte.ts` (las fórmulas compartidas). Tras `backend-modulo-asignaciones` el seeder ya crea 5 células y 9 asignaciones; `Initiative` tiene `SquadId` y `Status` pero la talla vive en la evaluación (módulo pendiente).

## Goals / Non-Goals

**Goals**
- Los 7 endpoints de Células en 🟢, con agregados idénticos al mock sobre las mismas semillas.
- Fórmulas de FTE en un solo lugar reutilizable (Torre y Líneas las heredarán).

**Non-Goals**
- Scope por chapter, módulo de iniciativas (sólo lectura del estado Activo), Torre de control, migraciones SQL.

## Decisions

1. **Helper `FteMath` en Application** (espejo de `fte.ts`): `Round1(double)`, `FteOfPercentages(IEnumerable<int>)` = Σ p/100 redondeado a 1 decimal, `AvailableFteOf(IEnumerable<float>)` = Σ redondeado. Comentario que explica la asimetría deliberada del mock: el asignado **no** mira el `availableFte` de la persona (alguien de 0.8 al 100 % aporta 1.0), por eso el asignado puede superar al disponible y "al tope" se lee fácil con gente part-time.
2. **`SquadAggregates` construido una vez por request**: un builder en Application que recibe todas las asignaciones, las personas asignadas y las iniciativas Activas, y expone por célula los agregados (`memberCount`, muestra de 3 ordenada por nombre, FTEs, `peopleAvailableFte`, `activeInitiative`). GetSquads/GetSquadById/stats lo comparten — el mismo patrón de `PersonDerivedData`. Con InMemory y 5 células el fetch-all alcanza; en SQL será una proyección.
3. **`activeInitiative` derivada de `Initiative` real**: `Status == Active` para la célula (`find`, no `filter`: una activa o ninguna); `talla` = `""` hasta que exista la evaluación del módulo de iniciativas (anotado en ENDPOINTS.md). Sin semillas de iniciativas llega `null`, igual que el contrato lo permite.
4. **`SquadDto` renombra `Tribe`→`Team` y pierde `DevOpsBoardId`**; la entidad conserva `Tribe` internamente (renombrar la columna no aporta y el VO no cambia). `UpdatedAtUtc` responde `?? CreatedAtUtc` porque el contrato lo exige no nulo. `CreateSquadRequest.Team` reemplaza a `Tribe` en el cuerpo (breaking pre-productivo); `Create/UpdateSquadResponse` devuelven el `SquadDto` completo enriquecido (recién creada: agregados en cero).
5. **Filtros en el repositorio**: `GetPagedAsync(page, pageSize, search, criticalities)` — search por nombre o tribu (case-insensitive), criticidades con el patrón TryParse tolerante de Person/Allocation. Orden actual del repo se conserva.
6. **`GetSquadsStats` sobre el total**: `atCapacityCount` = con gente y `allocatedFte ≥ peopleAvailableFte`; `teamCount` = tribus distintas; `chapterFte` = Σ `availableFte` de **todas** las personas (no sólo asignadas); `byCriticality` en el orden Critical, High, Medium, Low con ceros incluidos.
7. **`GetSquadTeamStats`**: 404 si la célula no existe; miembros completos ordenados por nombre; `expertCount`/`beginnerCount` = personas asignadas con nivel 4/1.

## Risks / Trade-offs

- **BREAKING pre-productivo**: `tribe`→`team` en cuerpo y respuesta; `devOpsBoardId` deja de viajar. Tests y ejemplos se actualizan.
- Cargar todo (asignaciones + personas + iniciativas) por request no escala — aceptado con InMemory, se reescribe como consulta al llegar SQL (misma nota que PersonDerivedData).
- Doble redondeo: los totales de stats suman los FTE ya redondeados por célula (como el mock, que redondea con `total(...)` sobre `enriched`) — se copia esa semántica para que las cifras coincidan con MSW.

## Migration Plan

Sin datos que migrar (las semillas ya existen). Orden: Application (FteMath + agregados + DTOs/mappings/requests/use cases) → Infrastructure (repo con filtros) → WebApi (endpoints + ejemplos) → tests → smoke InMemory comparando contra las cifras del mock (Backend Platform: 4 miembros, allocatedFte 2.8, bauFte 1.6, transformationFte 1.2, peopleAvailableFte 3.3) → coverage 88/88 + semáforo.

## Open Questions

(ninguna)
