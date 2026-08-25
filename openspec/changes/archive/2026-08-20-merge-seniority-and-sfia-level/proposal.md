## Why

`Person` hoy tiene dos campos que representan lo mismo en la práctica: `Seniority` (Junior/MidLevel/Senior/StaffEngineer/Principal, texto libre sin orden) y nivel SFIA (1-4, con etiqueta Principiante/Competente/Avanzado/Experto). El Chapter Lead confirmó que en el chapter no existe una escalera de seniority independiente — lo que hoy se llama "seniority" es, en la práctica, el nivel SFIA. Mantener los dos campos duplica el dato, duplica el catálogo, duplica el filtro y duplica la columna en la tabla, sin aportar nada.

## What Changes

- **BREAKING**: se elimina el nivel SFIA como campo independiente. "Seniority" pasa a ser el nombre del campo único, con la escala de 4 niveles que hoy tiene SFIA (1 Principiante, 2 Competente, 3 Avanzado, 4 Experto) — no la lista de 5 valores que tenía antes (Junior/MidLevel/Senior/StaffEngineer/Principal).
- Backend: el value object `SfiaLevel` se convierte en el nuevo `Seniority` (mismo rango 1-4, mismas etiquetas); el value object `Seniority` viejo se elimina. `Person` pasa de tener `Seniority` + `SfiaLevel` a tener un solo `Seniority`. `Person.ChangeSeniority` pasa de recibir `(Seniority, SfiaLevel)` a recibir solo `(Seniority)`.
- API: se elimina el catálogo `/catalogs/sfia-levels` y el query param `sfiaLevel` de `GET /people`. El catálogo `/catalogs/seniorities` pasa a devolver los 4 niveles (`{value, label}`) en vez de la lista vieja de 5 strings. `PersonDto`/`CreatePersonRequest`/`UpdatePersonRequest` pierden `SfiaLevel`/`SfiaLevelLabel`; `Seniority` pasa a ser numérico con su etiqueta.
- Frontend: el formulario de alta/edición pierde el selector "Nivel SFIA"; el selector "Seniority" pasa a ofrecer los 4 niveles. La tabla de Personas pierde la columna "SFIA"; la columna "Seniority" muestra la etiqueta del nivel. El toolbar pierde el filtro "Nivel SFIA"; el filtro "Seniority" filtra por los 4 niveles.
- Mock: mismo cambio de forma que el backend real, sobre los datos en memoria. Los 3 registros de ejemplo migran su seniority al valor que hoy tiene su nivel SFIA (María González → Avanzado, Laura Ruiz → Competente, Carlos López → Experto) — se descarta el string viejo (Senior/MidLevel/Principal).
- Migración de datos real: fuera de alcance de este cambio (no hay migraciones EF ni BD real desplegada, brecha ya documentada); el mapeo antiguo-seniority → nuevo-seniority-numérico queda registrado en design.md para cuando exista una BD real que migrar.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: "Listar personas" (columna y filtro únicos de seniority, se quita nivel SFIA), "Crear persona"/"Editar persona" (un solo campo de seniority en vez de dos), "Selección de seniority, nivel SFIA y modalidad desde catálogo" → pasa a "Selección de seniority y modalidad desde catálogo" (se quita el catálogo de nivel SFIA).
- `api-mocking`: "Handler de mock para personas" (se quita el catálogo `sfia-levels` y el filtro `sfiaLevel`; el catálogo `seniorities` cambia de forma).

## Impact

- Backend: `Domain/ValueObjects/Seniority.cs` (nueva forma, 4 niveles), `Domain/ValueObjects/SfiaLevel.cs` (eliminado), `Domain/Entities/Person.cs`, `Infrastructure/Persistence/EntityConfigurations/PersonConfiguration.cs`, `Infrastructure/Repositories/PersonRepository.cs`, `Domain/Interfaces/IPersonRepository.cs`, `Application/UseCases/People/GetPeople/*`, `Application/UseCases/People/CreatePerson/*`, `Application/UseCases/People/UpdatePerson/*`, `Application/DataTransferObjects/PersonDto.cs`, `Application/Mappings/PersonMappings.cs`, `WebApi/Endpoints/PeopleEndpoints.cs`, `WebApi/Swagger/Examples/PeopleExamples.cs`, y los tests correspondientes (`TestDataFactory`, `CreatePersonValidatorTests`, `PersonRepositoryTests`, `GetPeopleUseCaseTests`, etc.).
- Frontend: `personService.ts`, `PersonAdapter.ts`, `useCatalogs.ts`, `usePeople.ts`, `PeopleList.tsx`, `PersonFormDrawer.tsx`, `personFormValidation.ts`, y sus tests.
- Mock: `people.handlers.ts` y sus tests.
- **Cambio pendiente aparte, fuera de este alcance**: `add-people-dashboard-cards` (todavía abierto, pausado en las tareas 4.3/4.4) tiene una card de "Distribución por seniority" y otra de "Distribución por nivel SFIA" en su proposal/specs — con este merge, esas dos cards se convierten en una sola. Ese change se revisa con `/opsx:update` después de que este archive.
- Sin cambios en `tuip`: la extensión de `SegmentedBar` con color categórico sigue siendo necesaria (para la única card de distribución que quedará), pero es un change aparte, ya identificado antes de este.
