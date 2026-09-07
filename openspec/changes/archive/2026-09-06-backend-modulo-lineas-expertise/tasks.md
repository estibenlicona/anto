## 1. Domain

- [x] 1.1 Crear `ValueObjects/ExpertiseLineStatus.cs` (catálogo cerrado `Active`/`Archived`). Verificar con test: valores en el orden del contrato.
- [x] 1.2 Crear `Entities/ExpertiseLine.cs` (`AggregateRoot`): ctor `(string name, string code, string? description)` — nombre obligatorio ≤100, código obligatorio ≤10 normalizado a mayúsculas, descripción opcional ≤200; nace `Active` sin lead (la unicidad de nombre/código la exige el use case, no el agregado, igual que `Skill`/`Sprint`). `UpdateDetails(name, code, description)` con las mismas validaciones. `SetLead(Guid? personId)`. `Archive()` — lanza si ya está archivada. `Reactivate()` — lanza si no está archivada. Verificar con tests: nombre/código vacíos o que exceden su límite lanzan, código se normaliza a mayúsculas, nace `Active` sin lead, archivar dos veces lanza, reactivar una activa lanza.
- [x] 1.3 Crear `Interfaces/IExpertiseLineRepository.cs` (`IRepository<ExpertiseLine>` más `ExistsByNameAsync`/`ExistsByCodeAsync`, ambos con `excludeId` opcional). Verificar: build.

## 2. Application

- [x] 2.1 DTOs del contrato en `DataTransferObjects/ExpertiseLineDtos.cs`: `ExpertiseLineDto`, `ExpertiseLineDetailDto`, `LineLeadDto`, `LinePersonDto`/`LinePersonAllocationDto`, `LineCapacityDto`, `RosterPersonDto`, `UpsertExpertiseLineRequest`, `SetLineLeadRequest`, `AddLinePeopleRequest`. Verificar: un test que serializa a JSON y comprueba los nombres exactos del contrato (`peopleCount`, `availableFte`, `allocatedFte`, `freeFte`, `unallocatedPercentage`, `isLead`, `levelLabel`, `dedicationPercentage`).
- [x] 2.2 Crear `ExpertiseLines/LineCapacityCalculator.cs`: `peopleCount`/`availableFte` con `FteMath.AvailableFteOf`, `allocatedFte` con `FteMath.FteOfPercentages` sobre la dedicación vigente de cada persona (0 si no tiene asignación), `freeFte = Math.Max(0, disponible − asignado)` (acotado a 0, a diferencia de Torre de control) y `unallocatedPercentage` sin dividir por cero. Verificar con tests: línea sin personas responde ceros sin excepciones; personas con FTE disponible menor a 1.0 asignadas al 100 % dan `freeFte = 0`, no negativo.
- [x] 2.3 `GetExpertiseLinesUseCase` (`GET /expertise-lines`, sin parámetros, todas las líneas activas y archivadas) y `GetExpertiseLineUseCase` (`GET /expertise-lines/{id}`, 404 si no existe, con `people`/`capacity` completos). Verificar con tests: línea sin personas responde `people: []` y capacidad en cero; el lead aparece marcado `isLead: true` en su fila.
- [x] 2.4 `CreateExpertiseLineUseCase` (`POST /expertise-lines`): 400 si el nombre está repetido entre las activas, si el código está repetido entre todas (mayúsculas ya normalizado antes de comparar), o si algún campo excede su límite; 201 con la línea creada. Verificar con tests: cada 400, y que el código se guarda en mayúsculas aunque se envíe en minúsculas.
- [x] 2.5 `UpdateExpertiseLineUseCase` (`PUT /expertise-lines/{id}`): mismas validaciones que crear, excluyendo la propia línea de las comprobaciones de unicidad; 404 si no existe. Verificar con tests: editar sin cambiar nombre/código no dispara falso 400 por chocar consigo misma.
- [x] 2.6 `ArchiveExpertiseLineUseCase` (`POST .../archive`): 400 si la línea tiene personas (con la cuenta en el mensaje) o si ya está archivada; 404 si no existe. `ReactivateExpertiseLineUseCase` (`POST .../reactivate`): 400 si no está archivada; 404 si no existe. Verificar con tests: archivar con personas lanza y dice cuántas; reactivar deja la línea `Active` sin tocar nombre ni código.
- [x] 2.7 `SetExpertiseLineLeadUseCase` (`PUT .../lead`): 404 si la línea o la persona (cuando `personId` no es nulo) no existen; con `personId`, incorpora la persona a la línea (`AssignToChapter`) y limpia el lead de cualquier otra línea que lo tuviera; con `personId` nulo, quita el lead sin tocar la membresía. Verificar con tests: designar a alguien que lideraba otra línea le quita el lead a esa otra; quitar el lead deja a la persona en la línea.
- [x] 2.8 `AddExpertiseLinePeopleUseCase` (`POST .../people`): 404 si la línea o alguna persona no existen; incorpora a todas con `AssignToChapter`, moviéndolas desde la línea que tuvieran; responde el detalle actualizado. `RemoveExpertiseLinePersonUseCase` (`DELETE .../people/{personId}`): 404 si la línea o la persona no existen, o si la persona no pertenece a esa línea; 400 si la persona es el lead de la línea. Verificar con tests: incorporar mueve a alguien que estaba en otra línea; quitar al lead lanza 400 con el mensaje del spec.
- [x] 2.9 `GetExpertiseRosterUseCase` (`GET /expertise-lines/people`): todas las personas con su línea (`{id, name}`) o `null`, resuelto en una sola pasada sin N+1. Verificar con test: persona sin línea responde `line: null`.
- [x] 2.10 Registrar los nueve use cases y el calculador en `Application/DependencyInjection` bajo `// Líneas de expertise`. Verificar: build.

## 3. Infrastructure

- [x] 3.1 `ExpertiseLineConfiguration` (tabla `ExpertiseLines`; índice único por `Code`) y `ExpertiseLineRepository`. `DbSet` en `ApplicationDbContext`, migración nueva y registro en DI. Verificar con un test sobre Sqlite en memoria: guardar una línea con lead y releerla con los mismos valores.
- [x] 3.2 Semillas: dos o tres líneas de expertise sobre personas ya sembradas — una con lead y varias personas, una sin lead (incompleta), una archivada sin personas. Verificar: `dotnet run` y `GET /expertise-lines` devuelve las líneas sembradas con sus conteos coherentes.

## 4. WebApi

- [x] 4.1 `ExpertiseLinesEndpoints`: las 10 rutas con sus `Produces` (200/201, 400, 404 según el contrato). Verificar: Swagger lista las 10 operaciones bajo `/api/v1/expertise-lines`.
- [x] 4.2 `Swagger/Examples/ExpertiseLinesExamples.cs` con una línea completa (lead, varias personas, una con asignación a célula) y el roster con una persona sin línea. Verificar: Swagger muestra los ejemplos.

## 5. Verificación

- [x] 5.1 `dotnet build` + `dotnet test` en verde (sólo las fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 5.2 Smoke con Postgres local (`curl -sk`): `GET /expertise-lines` trae las líneas sembradas; `POST` con nombre o código repetido → 400; `PUT .../lead` mueve a la persona y le quita el lead a su línea anterior si tenía una; `POST .../archive` con personas → 400, sin personas → 200 y pasa a archivada; `POST .../reactivate` la vuelve `Active`; `DELETE .../people/{id}` del lead → 400; `GET /expertise-lines/people` trae a todas con su línea o `null`.
- [x] 5.3 `backend/ENDPOINTS.md`: las diez filas de Líneas de expertise a 🟢, total del resumen actualizado.
