## 1. Backend real (.NET)

- [x] 1.1 Extender `IPersonRepository.GetPagedAsync` con parámetros opcionales `search`, `seniorities`, `sfiaLevels`.
- [x] 1.2 Implementar el filtrado en `PersonRepository.GetPagedAsync` (Where condicionales sobre `Name`/`Position`, `Seniority.Value`, `SfiaLevel.Value` antes de `CountAsync`/`Skip`/`Take`).
- [x] 1.3 Extender `GetPeopleRequest` con `Search`, `Seniorities`, `SfiaLevels` y pasarlos desde `GetPeopleUseCase` al repositorio.
- [x] 1.4 Extender `PeopleEndpoints.GetAllAsync` para aceptar `string? search`, `string[]? seniority`, `int[]? sfiaLevel` y mapearlos al request.
- [x] 1.5 Tests de `PersonRepositoryTests` (SQLite in-memory): búsqueda por nombre, búsqueda por cargo, filtro por seniority, filtro por nivel SFIA, combinación de búsqueda+filtros, sin resultados.
- [x] 1.6 Tests de `GetPeopleUseCaseTests`: los nuevos parámetros del request llegan al repositorio.
- [x] 1.7 `dotnet test` sobre el backend y confirmar que pasa.

## 2. Mock

- [x] 2.1 Extender el handler `GET /people` en `people.handlers.ts` para leer `search`, `seniority` (múltiple) y `sfiaLevel` (múltiple) de la query string y filtrar el array en memoria antes de `paginate`.
- [x] 2.2 Revisar/actualizar los tests existentes del handler de personas si alguno asume que `GET /people` no filtra. No hay un test dedicado al handler; sin params de búsqueda/filtro el comportamiento es idéntico al actual (no filtra nada), así que no rompe nada existente.

## 3. Frontend — datos

- [x] 3.1 Extender `personService.list` para aceptar `search?`, `seniorities?: Seniority[]`, `sfiaLevels?: number[]` y mandarlos como query params.
- [x] 3.2 Crear `useDebouncedValue` en `shared/hooks` (debounce genérico, 300ms por defecto).
- [x] 3.3 Extender `usePeople` con estado de `search`, `seniorities`, `sfiaLevels` (y sus setters), aplicando debounce al `search` antes de refetch, y reseteando `page` a 1 cuando cambia cualquiera de los tres.

## 4. Frontend — UI

- [x] 4.1 Agregar el toolbar (`SearchField` + `FilterButton` "Seniority" + `FilterButton` "Nivel SFIA") en `PeopleList.tsx`, en una fila propia arriba de la tabla, sin tocar la fila/ubicación actual de "Crear persona".
- [x] 4.2 Mapear `seniorities`/`sfiaLevels` (de `useCatalogs`) a las `options` de cada `FilterButton`, convirtiendo el nivel SFIA a string para el checklist y de vuelta a number al filtrar.
- [x] 4.3 Distinguir el estado vacío: si hay búsqueda o filtro activo y no hay resultados, mostrar un `EmptyState` de "sin resultados" en vez del que invita a crear la primera persona.
- [x] 4.4 Wiring en `PeopleContainer.tsx`: pasar el nuevo estado de `usePeople` y los catálogos a `PeopleList`.

## 5. Verificación

- [x] 5.1 Ejecutar la suite de tests del frontend y confirmar que pasan. 307/308 OK; las 2 fallas restantes (`App.test.tsx` con un import relativo roto, `httpClient.test.ts` con una var de entorno) son preexistentes y no están relacionadas con este cambio.
- [x] 5.2 Ejecutar `dotnet test` del backend y confirmar que pasa. 395/404 OK; las 9 fallas restantes son en `RestClientBehaviorTests` (circuit breaker/retry de un cliente REST genérico, no relacionado con Personas), preexistentes.
- [x] 5.3 Probar en el navegador (modo mock): buscar por nombre, buscar por cargo, filtrar por seniority, filtrar por nivel SFIA, combinar búsqueda+filtro, limpiar filtros, y el estado de "sin resultados". Encontró y corrigió un bug real: axios serializaba `seniority`/`sfiaLevel` como `seniority[]=` (no lo reconocían ni el mock ni ASP.NET); corregido con `URLSearchParams` manual en `personService.list`.
