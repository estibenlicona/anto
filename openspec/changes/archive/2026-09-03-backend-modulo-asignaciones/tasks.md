# Tareas — Backend: módulo Asignaciones completo

## 1. Application

- [x] 1.1 `AllocationDto`: agregar `PersonPosition`, `PersonModality`, `PersonLevel`, `PersonLevelLabel`, `PersonAvailablePercentage`; `AllocationMappings.ToDto` pasa a recibir la `Person` y deriva el margen (`Max(0, 100 − dedicación)`).
- [x] 1.2 `CreateAllocationRequest` queda como el contrato (`SquadId` desde la ruta, `PersonId` + 3 porcentajes, sin `InitiativeId`); `UpdateAllocationRequest(Id, 3 porcentajes)`. Validadores: dedicación 1–100, BAU/Transf 0–100, `bau + transf == dedication` con mensaje claro.
- [x] 1.3 `CreateAllocationUseCase`: unicidad global (`ExistsByPersonAsync` → 400 «La persona ya está asignada a una célula»), sin tope repartido; respuesta con DTO enriquecido.
- [x] 1.4 `UpdateAllocationUseCase`: validaciones alineadas y respuesta enriquecida (carga persona y célula para el mapeo).
- [x] 1.5 `GetAllocationsBySquadUseCase`: 404 si la célula no existe; pasa `search`/`levels` al repositorio y mapea con la persona del join.

## 2. Infrastructure

- [x] 2.1 `IAllocationRepository`/`AllocationRepository`: `ExistsByPersonAsync(personId)`; `GetBySquadPagedAsync(squadId, page, pageSize, search, levels)` devolviendo `(Allocation, Person)`; retirar `ExistsByPersonAndSquadAsync`/`GetTotalDedicationForPersonAsync` si nadie más los usa (verificar con grep).
- [x] 2.2 `DevelopmentDataSeeder`: sembrar las 5 células del mock (nombre, equipo, criticidad) y las 9 asignaciones por nombre de persona (transformación = dedicación − BAU), después de las personas.

## 3. WebApi

- [x] 3.1 `AllocationsEndpoints`: GET por célula con `search` + `level[]`; POST con cuerpo del contrato (`request with { SquadId = squadId }`); PUT con `Id` de la ruta; `Produces` actualizados.
- [x] 3.2 Ejemplos Swagger de asignaciones con el DTO completo y los requests nuevos.

## 4. Tests

- [x] 4.1 Actualizar `AllocationUseCaseTests` a la regla nueva: crear con persona ya asignada → 400; mezcla que no cuadra → 400 (validador); DTO trae los campos de persona y el margen; GetBySquad pasa filtros y 404 de célula.
- [x] 4.2 `TestDataFactory`: requests de asignación alineados al contrato.

## 5. Verificación

- [x] 5.1 `dotnet build` + `dotnet test` en verde (solo las 9 fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 5.2 Smoke con InMemory (`curl -sk`, con `Idempotency-Key` en POST/PUT): GET por célula con y sin filtros, POST 201 y 400 (persona ya asignada, mezcla), PUT 200/400/404, DELETE 204; `GET /people` muestra `utilization` real (María 80, Carlos 100…).
- [x] 5.3 `node backend/tools/contract-coverage.mjs` sigue 88/88; `backend/ENDPOINTS.md`: Asignaciones 4🟢 y actualizar el total.
