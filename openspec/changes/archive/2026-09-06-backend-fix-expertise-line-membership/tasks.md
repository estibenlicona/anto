## 1. Domain

- [x] 1.1 `Person` gana `ExpertiseLineId` (`Guid?`, propiedad de sólo lectura) con `AssignToExpertiseLine(Guid expertiseLineId)`/`RemoveFromExpertiseLine()`, espejo exacto de `AssignToChapter`/`RemoveFromChapter` (valida `Guid.Empty`, `MarkUpdated()`). `ChapterId`/`AssignToChapter`/`RemoveFromChapter` quedan intactos. `IPersonRepository` gana `GetByExpertiseLineAsync(expertiseLineId)`, espejo de `GetByChapterAsync`. Verificar con tests: nace sin línea, asignar la fija, `Guid.Empty` lanza.

## 2. Application

- [x] 2.1 Sustituir en los nueve use cases de Líneas de expertise y en `ExpertiseLineMappings` cada uso de `Person.ChapterId`/`AssignToChapter`/`RemoveFromChapter`/`IPersonRepository.GetByChapterAsync` por `ExpertiseLineId`/`AssignToExpertiseLine`/`RemoveFromExpertiseLine`/`GetByExpertiseLineAsync`. Ningún otro cambio de comportamiento. Verificar: build; los tests existentes de Líneas de expertise (`ExpertiseLineUseCaseTests`) actualizados a los nuevos métodos siguen en verde sin cambiar sus aserciones.

## 3. Infrastructure

- [x] 3.1 Columna `ExpertiseLineId` (nula) e índice en la configuración EF de `Person`; `PersonRepository.GetByExpertiseLineAsync`; migración nueva. Semillas de Líneas de expertise (`SeedExpertiseLines`) pasan a `AssignToExpertiseLine`. Verificar: `dotnet build`, migración generada sin tocar `ChapterId`.

## 4. Verificación

- [x] 4.1 `dotnet build` + `dotnet test` en verde (sólo las fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 4.2 Smoke con Postgres local (`curl -sk`): recrear la base, `GET /expertise-lines` y `GET /expertise-lines/{id}` responden igual que antes (mismos conteos, mismo lead, misma capacidad); `GET /expertise-lines/people` sigue resolviendo la línea de cada persona.
