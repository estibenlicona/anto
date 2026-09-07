# Tareas — Backend: módulo Células completo

## 1. Application

- [x] 1.1 Crear `Common/FteMath.cs` (Round1, FteOfPercentages = Σ p/100 a 1 decimal, AvailableFteOf) con la nota de la asimetría del asignado vs disponible.
- [x] 1.2 `SquadDto` del contrato (`Team`, sin `DevOpsBoardId`, `UpdatedAtUtc` no nulo con `?? CreatedAtUtc`, agregados) + `SquadMemberSampleDto`, `SquadActiveInitiativeDto`, `SquadTeamStatsDto`, `SquadsStatsDto`.
- [x] 1.3 `SquadAggregates` (builder por request desde asignaciones + personas + iniciativas Activas; muestra de 3 por nombre, FTEs con FteMath, activeInitiative con talla "") y `SquadMappings.ToDto(squad, aggregates)`.
- [x] 1.4 `CreateSquadRequest`/`UpdateSquadRequest`: `Team` en lugar de `Tribe`; respuestas Create/Update devuelven el `SquadDto` enriquecido; validadores ajustados si nombran Tribe.
- [x] 1.5 `GetSquadsRequest(+Search,+Criticalities)` y use cases GetSquads/GetSquadById con agregados; nuevos `GetSquadsStatsUseCase` (total, sin gente, al tope, equipos, Σ FTEs sobre valores por célula ya redondeados, chapterFte, byCriticality con los 4 niveles) y `GetSquadTeamStatsUseCase` (404; miembros completos; expert/beginner por nivel 4/1). Registrar en DI.

## 2. Infrastructure

- [x] 2.1 `ISquadRepository`/`SquadRepository`: `GetPagedAsync(page, pageSize, search, criticalities)` (search nombre/tribu, criticidades TryParse tolerante).

## 3. WebApi

- [x] 3.1 `SquadsEndpoints`: binding `search` + `criticality[]` en GET /squads; nuevos `GET /squads/stats` y `GET /squads/{id:guid}/team-stats` (rutas literales antes de `/{id:guid}`); `Produces` actualizados.
- [x] 3.2 Ejemplos Swagger de células con el DTO completo, team-stats y stats.

## 4. Tests

- [x] 4.1 Actualizar tests de squads existentes (DTO nuevo, requests con Team) y agregar: agregados por célula (conteos, FTEs, muestra de 3, activeInitiative null sin iniciativas), filtros pasados al repo, stats (al tope, sin gente, byCriticality con ceros), team-stats (expert/beginner, 404).
- [x] 4.2 `TestDataFactory`: requests de squad con `Team`.

## 5. Verificación

- [x] 5.1 `dotnet build` + `dotnet test` en verde (solo las 9 fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 5.2 Smoke con InMemory: GET /squads muestra Backend Platform con 4 miembros, allocatedFte 2.8, bauFte 1.6, transformationFte 1.2, peopleAvailableFte 3.3 y muestra de 3; filtros `search`/`criticality`; `/squads/stats` (5 células, 1 sin gente, chapterFte 17.3, byCriticality 2/1/1/1); `/squads/{id}/team-stats` de Backend Platform (4 miembros, 2 expertos con nivel 4 — Carlos… verificar, beginners 0) y 404.
- [x] 5.3 `node backend/tools/contract-coverage.mjs` sigue 88/88; `backend/ENDPOINTS.md`: Células 7🟢 y total actualizado.
