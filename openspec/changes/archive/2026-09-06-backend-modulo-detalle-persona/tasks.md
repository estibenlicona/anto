## 1. Domain

- [x] 1.1 Crear `ValueObjects/CostReading.cs` (catálogo cerrado `InRange`/`High`/`Low`). `IPersonRepository` gana `GetByDevOpsUserIdAsync(devOpsUserId)`. Verificar con tests: valores en el orden del contrato; build.

## 2. Application

- [x] 2.1 Crear `PersonDetail/CostReadingCalculator.cs`: las bandas fijas por nivel (1: 4.000.000–6.500.000, 2: 5.500.000–8.500.000, 3: 7.000.000–11.000.000, 4: 9.000.000–15.000.000), `> max → High`, `< min → Low`, cualquier otro caso (bordes incluidos) → `InRange`. Verificar con tests: los cuatro niveles en sus tres lecturas, y un nivel fuera de 1-4 responde `InRange` sin lanzar.
- [x] 2.2 Crear `PersonDetail/SuggestedSquadCalculator.cs`: las dos tablas fijas por *nombre* de célula (cargos deseados; nivel exigido por célula y cargo, respaldo 2 si no está en la tabla) sobre las cinco células ya sembradas; sólo se calcula sin célula; una célula se sugiere cuando su tabla de cargos incluye el cargo de la persona y nadie con ese cargo ya está en su equipo; `reason` "Sin equipo" o "Sin {cargo} en el equipo"; `allocatedFte`/`teamAvailableFte` con `FteMath` sobre el equipo actual. Verificar con tests: persona con célula no sugiere ninguna; cargo ya cubierto en el equipo no sugiere esa célula; célula sin nadie sugiere con "Sin equipo".
- [x] 2.3 DTOs del contrato en `DataTransferObjects/PersonDetailDtos.cs`: `PersonDetailDto`, `PersonDetailAllocationDto`, `DevOpsIdentityDto`, `CurrentSprintBalanceDto` (reutilizando `SprintRefDto`/`CapacityDto` ya existentes de Capacidad), `PersonStackDetailDto`, `SuggestedSquadDto`, `LinkDevOpsIdentityRequest`. Verificar: un test que serializa a JSON y comprueba los nombres exactos del contrato (`chapterName`, `expertiseLineName`, `dedicationPercentage`, `otherCoverers`, `evidenceCount`, `identityId`).
- [x] 2.4 `GetPersonDetailUseCase` (`GET /people/{id}/detail`): 404 si no existe; cruza `PersonMappings`/`PersonDerivedData` (Personas), `IAllocationRepository`/`ISquadRepository` con `teammates` de la misma célula, `IChapterCatalog` y el maestro de líneas de expertise para nombre y lead de cada uno, `DedicationContext.BuildRowAsync` para `currentSprint` (sólo con identidad y sprint vigente), `CostReadingCalculator`, `SuggestedSquadCalculator` (sólo sin célula), y la cobertura de stacks sobre todas las personas. Verificar con tests: persona externa trae `providerName`; persona interna no; persona sin identidad responde `devOpsIdentity: null`; persona con identidad pero sin sprint vigente responde `currentSprint: null`; persona sin chapter/línea responde ambos pares en `null`.
- [x] 2.5 `LinkDevOpsIdentityUseCase` (`POST /people/{id}/devops-identity`): 404 si la persona no existe; 409 si el `identityId` ya es de otra persona, nombrándola; si no, `person.LinkDevOpsIdentity(identityId)`. Verificar con tests: 409 con el nombre de la otra persona en el mensaje; vincular a la misma persona que ya lo tenía no lanza.
- [x] 2.6 Registrar los dos use cases y los dos calculadores en `Application/DependencyInjection` bajo `// Detalle de persona`. Verificar: build.

## 3. Infrastructure

- [x] 3.1 `IChapterCatalog`/`ChapterDirectoryCatalog` (mismo patrón que `IStackCatalog`/`ChapterStackCatalog`), sembrado con los tres chapters del mock (uno sin gente, a propósito). `PersonRepository.GetByDevOpsUserIdAsync`. Registro en DI. Verificar: build.
- [x] 3.2 Semillas: asignar `ChapterId` a algunas personas ya sembradas sobre los dos primeros chapters (el tercero queda sin nadie). Verificar: `dotnet run` y `GET /people/{id}/detail` de una persona asignada devuelve su chapter con nombre y lead.

## 4. WebApi

- [x] 4.1 `PersonDetailEndpoints`: `GET /people/{id}/detail` y `POST /people/{id}/devops-identity` (204) con sus `Produces` (200, 404 / 204, 404, 409). Verificar: Swagger lista las dos operaciones bajo `/api/v1/people`.
- [x] 4.2 `Swagger/Examples/PersonDetailExamples.cs` con una persona interna con célula, identidad y balance del sprint, y una externa sin célula con una célula sugerida. Verificar: Swagger muestra los ejemplos.

## 5. Verificación

- [x] 5.1 `dotnet build` + `dotnet test` en verde (sólo las fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 5.2 Smoke con Postgres local (`curl -sk`): `GET /people/{id}/detail` de una persona con célula, identidad y chapter trae todo coherente con las semillas; de una sin célula trae `suggestedSquads` no vacío si su cargo está en alguna tabla; persona inexistente → 404. `POST /people/{id}/devops-identity` vincula y el detalle refleja `devOpsIdentity`; vincular el mismo `identityId` a otra persona → 409 nombrando a la primera.
- [x] 5.3 `backend/ENDPOINTS.md`: las dos filas internas de Detalle de persona a 🟢, `GET /devops/users` con nota del segundo cambio, total actualizado.
