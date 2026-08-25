## Why

El listado de Personas solo permite paginar; con más de una página no hay forma de encontrar a alguien puntual ni de acotar la vista por seniority o nivel SFIA. Un toolbar con búsqueda y filtros (según la imagen de referencia) resuelve eso.

## What Changes

- Se agrega un toolbar arriba de la tabla de Personas, en una fila propia (el botón "Crear persona" mantiene su fila y ubicación actuales — su reubicación futura sobre unas cards tipo dashboard es un cambio aparte, fuera de alcance aquí), con:
  - Un `SearchField` que busca por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas).
  - Un `FilterButton` "Seniority" con checklist multi-selección sobre el catálogo de seniorities.
  - Un `FilterButton` "Nivel SFIA" con checklist multi-selección sobre el catálogo de niveles SFIA.
- Búsqueda y filtros son combinables entre sí y con la paginación existente; al cambiar cualquiera, el listado vuelve a la página 1.
- **Alcance full-stack**: el filtrado se implementa tanto en el mock (`people.handlers.ts`) como en el backend real (.NET) — `GetPeopleRequest`/`GetPeopleUseCase`/`PersonRepository.GetPagedAsync`/`PeopleEndpoints` — para que el contrato de la API sea el mismo en ambos.
- Nuevo estado vacío específico: cuando la búsqueda o los filtros no encuentran resultados, se muestra un mensaje de "sin resultados" distinto del estado vacío actual (que invita a crear la primera persona) — ese solo aplica cuando no hay ninguna persona registrada, no cuando los filtros descartan todo.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: el requisito "Listar personas" ahora exige búsqueda por nombre/cargo y filtro por seniority y nivel SFIA, combinables con la paginación, y un estado vacío distinto cuando la búsqueda/filtro no encuentra resultados.
- `api-mocking`: el requisito "Handler de mock para personas" ahora exige que el `GET` de listado acepte los mismos parámetros de búsqueda y filtro que el backend real.

## Impact

- Frontend: `PeopleList.tsx` (toolbar nuevo), `PeopleContainer.tsx` (wiring de estado), `usePeople.ts` (nuevos parámetros de búsqueda/filtro, reset de página), `personService.ts` (query params nuevos en `list`).
- Mock: `people.handlers.ts` (filtrado sobre `search`, `seniority[]`, `sfiaLevel[]` antes de paginar).
- Backend: `GetPeopleRequest.cs`, `GetPeopleUseCase.cs`, `IPersonRepository.cs`/`PersonRepository.cs` (filtrado en la consulta EF), `PeopleEndpoints.cs` (nuevos query params `search`, `seniority`, `sfiaLevel`). Sin cambios de esquema/migraciones — los filtros son solo de lectura sobre columnas existentes.
- No hay cambios en `tuip`: `SearchField` y `FilterButton` ya existen y cubren el diseño de referencia tal cual, compuestos directamente donde se necesiten (sin un componente de layout compartido).
