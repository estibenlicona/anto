## 1. Backend — dominio

- [x] 1.1 Reescribir `Domain/ValueObjects/Seniority.cs` con la escala de 4 niveles (1 Principiante, 2 Competente, 3 Avanzado, 4 Experto), mismo patrón que tenía `SfiaLevel` (`From(int)`, `Value`, `Label`).
- [x] 1.2 Eliminar `Domain/ValueObjects/SfiaLevel.cs`.
- [x] 1.3 `Domain/Entities/Person.cs`: quitar la propiedad `SfiaLevel`; `ChangeSeniority` pasa a un solo parámetro `Seniority`.
- [x] 1.4 Revisar `Domain/Events/PersonEvents.cs` (`PersonSeniorityChangedEvent`) — confirmar que sigue siendo válido con el `Seniority` nuevo, sin referencias a `SfiaLevel`. Ya solo referenciaba `Seniority`, sin cambios necesarios.

## 2. Backend — persistencia y repositorio

- [x] 2.1 `Infrastructure/Persistence/EntityConfigurations/PersonConfiguration.cs`: quitar la configuración de `SfiaLevel`; `Seniority` pasa a conversión `int` (en vez de `string`, ancho 50).
- [x] 2.2 `Infrastructure/Repositories/PersonRepository.cs` / `Domain/Interfaces/IPersonRepository.cs`: quitar el parámetro `sfiaLevels` de `GetPagedAsync`; `seniorities` pasa a `IReadOnlyCollection<int>?`.

## 3. Backend — casos de uso y API

- [x] 3.1 `Application/UseCases/People/CreatePerson/*` y `Application/UseCases/People/UpdatePerson/*`: quitar `SfiaLevel` de los requests; el validador valida `Seniority` en 1-4 en vez del string del catálogo viejo.
- [x] 3.2 `Application/UseCases/People/GetPeople/*`: quitar `SfiaLevels` del request/use case.
- [x] 3.3 `Application/DataTransferObjects/PersonDto.cs` y `Application/Mappings/PersonMappings.cs`: quitar `SfiaLevel`/`SfiaLevelLabel`; `Seniority` pasa a `int` + `SeniorityLabel: string`.
- [x] 3.4 `WebApi/Endpoints/PeopleEndpoints.cs`: quitar el endpoint `/catalogs/sfia-levels` y el query param `sfiaLevel`; `/catalogs/seniorities` devuelve los 4 niveles con etiqueta.
- [x] 3.5 `WebApi/Swagger/Examples/PeopleExamples.cs`: actualizar los payloads de ejemplo.

## 4. Backend — tests

- [x] 4.1 `TestDataFactory.cs`: `CreatePerson`/`CreatePersonRequest`/`UpdatePersonRequest` usan el `Seniority` nuevo, sin `SfiaLevel`.
- [x] 4.2 Actualizado `CreatePersonValidatorTests`, `UpdatePersonUseCaseTests`, `CreatePersonUseCaseTests`, `PersonRepositoryTests`, `GetPeopleUseCaseTests`, `PersonTests`, `AllocationUseCaseTests` para el nuevo modelo; `SeniorityTests` reescrito con la escala de 4 niveles (antes era `SfiaLevelTests`, eliminado por duplicado).
- [x] 4.3 `dotnet test` sobre el backend y confirmar que pasa. 372/381 OK; las 9 fallas son de `RestClientBehaviorTests`, preexistentes y no relacionadas.

## 5. Mock

- [x] 5.1 `people.handlers.ts`: `SENIORITIES` pasa a los 4 niveles (`{value, label}[]`), se quita `SFIA_LEVELS`/`SFIA_LABELS`; los 3 registros de ejemplo migran su seniority según la tabla de design.md; `isValidCreateRequest` valida seniority en 1-4; se quita el filtro/parseo de `sfiaLevel` en `GET /people` y en `filterPeople`; se quita el handler `/catalogs/sfia-levels`.
- [x] 5.2 Actualizar los tests existentes del mock/handler de personas que referencien `sfiaLevel`/`SFIA_LEVELS`. `peopleStats.handler.test.ts` ya usa el catálogo/seniority nuevo; confirmado sin coincidencias de `sfiaLevel`/`SfiaLevel`/`SFIA_LEVEL` en `frontend/src/mocks`.

## 6. Frontend

- [x] 6.1 `personService.ts`: `Seniority` pasa a `number`; `SfiaLevelOption` renombrado a `SeniorityOption`, `getSfiaLevels` eliminado; `PersonDto`/`CreatePersonRequest` pierden `sfiaLevel(Label)`, `seniority` pasa a `number` + `seniorityLabel`; `list()` pierde el parámetro `sfiaLevels`.
- [x] 6.2 `PersonAdapter.ts`: `Person`/`PersonFormValues` sin `sfiaLevel`; `seniority` pasa a `number`.
- [x] 6.3 `useCatalogs.ts`: quitar `getSfiaLevels`.
- [x] 6.4 `usePeople.ts`: quitar el estado/parámetro `sfiaLevels`.
- [x] 6.5 `PersonFormDrawer.tsx`: quitar el Select "Nivel SFIA"; el Select "Seniority" usa el catálogo nuevo con el formato `"${value} · ${label}"`.
- [x] 6.6 `personFormValidation.ts`: quitar la validación de `sfiaLevel`; `SENIORITY_OPTIONS` pasa a los 4 niveles.
- [x] 6.7 `PeopleList.tsx`: quitar la columna "SFIA" y el `FilterButton` "Nivel SFIA"; la columna "Seniority" muestra la etiqueta; el `FilterButton` "Seniority" usa el catálogo nuevo.
- [x] 6.8 `PeopleContainer.tsx`: wiring — quitar `sfiaLevels`/`selectedSfiaLevels`/`onSfiaLevelsChange` que ya no existen en `usePeople`/`useCatalogs`/`PeopleList`.

## 7. Verificación

- [x] 7.1 Ejecutar la suite de tests del frontend y confirmar que pasan. 314/315 OK; las 2 fallas (`App.test.tsx`, `httpClient.test.ts`) son preexistentes y no relacionadas.
- [x] 7.2 Probar en el navegador (modo mock): alta/edición con el nuevo selector único de seniority, tabla sin columna SFIA, filtro de seniority con los 4 niveles, los 3 registros de ejemplo muestran su seniority migrado correctamente. Verificado: header y tabla sin columna SFIA; María/Laura/Carlos muestran Avanzado/Competente/Experto; único filtro "Seniority" con las 4 opciones; drawer "Nueva persona" con un solo Select "Seniority" (1 · Principiante … 4 · Experto); al filtrar por "Avanzado" la tabla se redujo correctamente a María González.
