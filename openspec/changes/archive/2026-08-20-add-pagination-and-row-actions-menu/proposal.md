## Why

Las tres listas del Chapter Lead (Personas, Células, Capacidades) traen hoy todos los registros de una sola vez — sin paginación, ni en el backend ni en el cliente — y las acciones por fila son dos botones de texto sueltos ("Editar"/"Eliminar" o "Quitar"). Ninguno de los tres endpoints de listado del backend (`GET /people`, `GET /squads`, `GET /squads/{id}/allocations`) pagina: devuelven la colección completa. A medida que estas listas crecen más allá de los datos de ejemplo, esto deja de escalar — y el patrón de menú "⋮" por fila, que ya quedó documentado como ejemplo compuesto en el design system (`Button` + `Icon` + `Menu`) pero nunca se implementó en una pantalla real, es el reemplazo natural de los dos botones sueltos.

## What Changes

- **Paginación real de backend en los tres endpoints de listado.** `GET /people`, `GET /squads` y `GET /squads/{id}/allocations` aceptan `page` (1-based, default 1) y `pageSize` (default 10, máximo 100) como query params, y devuelven un sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) en vez de un array plano. **BREAKING**: cambia la forma de la respuesta de los tres endpoints — todo consumidor que espere hoy un array plano deja de funcionar sin actualizarse. Es la primera paginación de todo el backend; no reemplaza `IRepository<T>.GetAllAsync` (compartido por otras entidades que no pagina), sino que agrega un método nuevo por repositorio.
- **Los tres mocks (MSW) reflejan la misma forma paginada.** `people.handlers.ts`, `squads.handlers.ts` y `allocations.handlers.ts` leen `page`/`pageSize` de la URL interceptada y devuelven el mismo sobre, recortando el array en memoria — así el frontend consume una forma idéntica sin importar si pega contra el mock o el backend real.
- **Las tres pantallas (Personas, Células, Capacidades) usan `PaginationBar`** (ya existe en `@tuya-ui/components` desde `modernize-table-suite`, nunca antes consumido en la app) para navegar entre páginas y ver el resumen de resultados, con el tamaño de página inicial en 10.
- **El menú "⋮" por fila reemplaza los dos botones de texto sueltos**, en las tres listas. Compone `Button` (`variant="subtle"`, sólo ícono, `aria-label="Más acciones"`) + `Icon` (`name="more"`) como disparador de un `Menu` con `MenuItem` "Editar" (`icon="edit"`) y `MenuItem` destructivo "Eliminar"/"Quitar" (`icon="delete"`) — el mismo patrón que ya quedó documentado como ejemplo en `modernize-table-suite`, ahora aplicado por primera vez.

**Fuera de alcance:**
- No se toca ningún otro endpoint del backend (BAU tasks, Initiatives, Companies) — sólo los tres de esta propuesta.
- No se agrega búsqueda ni filtros a estas tres pantallas — sólo paginación y el menú de acciones, que fue lo pedido.
- `GET /people/{id}/allocations` (asignaciones por persona, no por célula) no se pagina — no tiene ninguna pantalla que lo consuma hoy.

## Capabilities

### Modified Capabilities
- `people`: "Listar personas" pasa a describir un listado paginado, no el listado completo; y las filas ganan un menú de acciones en vez de botones sueltos.
- `squads`: mismo cambio que `people`, sobre "Listar células".
- `allocations`: mismo cambio que `people`, sobre "Listar las asignaciones de una célula".
- `api-mocking`: los tres handlers de mock afectados (personas, células, asignaciones) pasan a devolver el sobre paginado en vez del array plano.

## Impact

- **Backend** (`backend/src/GestionCapacidad.*`):
  - `Domain/Interfaces/IPersonRepository.cs`, `ISquadRepository.cs`, `IAllocationRepository.cs`: un método paginado nuevo por interfaz (no se toca `IRepository<T>.GetAllAsync`, compartido con otras entidades).
  - `Infrastructure/Repositories/PersonRepository.cs`, `SquadRepository.cs`, `AllocationRepository.cs`: implementación de esos métodos (`Skip`/`Take` + conteo total).
  - `Application/UseCases/People/GetPeople/`, `Squads/GetSquads/`, `Allocations/GetAllocationsBySquad/`: sus `Request`/`Response`/`UseCase` pasan a aceptar `page`/`pageSize` y devolver el sobre paginado.
  - Un DTO/envoltorio paginado nuevo y compartido (`PagedResult<T>` o equivalente) en `Application/DataTransferObjects/`.
  - `WebApi/Endpoints/PeopleEndpoints.cs`, `SquadsEndpoints.cs`, `AllocationsEndpoints.cs`: los tres `GET` de listado leen `page`/`pageSize` de query string.
  - Tests existentes de estos tres use cases (`GetPersonUseCaseTests.cs`, `GetSquadsUseCaseTests.cs`, y el de allocations en `AllocationUseCaseTests.cs`) se actualizan a la nueva firma; se agregan casos de paginación.
- **Frontend** (`frontend/src/`):
  - `mocks/handlers/people.handlers.ts`, `squads.handlers.ts`, `allocations.handlers.ts`: sobre paginado.
  - `features/people/services/personService.ts` (+ adapters/hooks), y sus equivalentes en `features/squads` y `features/allocations`: pasan `page`/`pageSize`, parsean el sobre paginado.
  - `features/people/components/PeopleList.tsx`, `features/squads/components/SquadsList.tsx`, `features/allocations/components/AllocationsList.tsx`: agregan `PaginationBar` y reemplazan los botones Editar/Eliminar por el menú `Menu`.
  - Tests existentes de estos tres hooks/listas se actualizan a la nueva forma de respuesta y a los nuevos controles de acción.
- Ningún cambio en `tuip` — `PaginationBar` y `Menu` ya existen y están publicados; este change sólo los consume.
