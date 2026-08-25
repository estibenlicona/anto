## 1. Backend: sobre paginado compartido

- [x] 1.1 Crear `backend/src/GestionCapacidad.Application/DataTransferObjects/PagedResult.cs`: `public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount, int TotalPages)`.
- [x] 1.2 Crear un helper estático (por ejemplo `PagedResult.Create(items, totalCount, page, pageSize)`) que calcule `TotalPages` con `Math.Ceiling`, para no repetir la fórmula en los tres use cases.

## 2. Backend: paginar personas

- [x] 2.1 Agregar `Task<(IReadOnlyList<Person> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)` a `IPersonRepository`.
- [x] 2.2 Implementar `GetPagedAsync` en `PersonRepository`: `CountAsync()` + `OrderBy(p => p.Name).Skip((page-1)*pageSize).Take(pageSize).AsNoTracking().ToListAsync()`.
- [x] 2.3 Actualizar `GetPeopleUseCase`: acepta `page`/`pageSize`, llama a `GetPagedAsync`, devuelve `GetPeopleResponse` con un `PagedResult<PersonDto>` en vez de una lista plana.
- [x] 2.4 Actualizar `PeopleEndpoints.GetAllAsync` para leer `page`/`pageSize` de la query string (clamplear: `page<1→1`, `pageSize<1→1`, `pageSize>100→100`, defaults `page=1`, `pageSize=10`) y pasarlos al use case. Clamp centralizado en `PaginationQueryExtensions.ClampPagination`, reutilizado por los tres endpoints.
- [x] 2.5 Actualizar `GetPersonUseCaseTests.cs` a la nueva firma; agregar un caso que verifique `TotalCount`/`TotalPages`/recorte de página.

## 3. Backend: paginar células

- [x] 3.1 Agregar `GetPagedAsync(int page, int pageSize, CancellationToken)` a `ISquadRepository`, misma forma que en personas.
- [x] 3.2 Implementar en `SquadRepository` (`OrderBy(s => s.Name)`).
- [x] 3.3 Actualizar `GetSquadsUseCase` y `GetSquadsResponse` a `PagedResult<SquadDto>`.
- [x] 3.4 Actualizar `SquadsEndpoints.GetAllAsync` con los mismos query params y clamps que en 2.4.
- [x] 3.5 Actualizar `GetSquadsUseCaseTests.cs` a la nueva firma; agregar un caso de paginación.

## 4. Backend: paginar asignaciones por célula

- [x] 4.1 Agregar `GetBySquadPagedAsync(Guid squadId, int page, int pageSize, CancellationToken)` a `IAllocationRepository`, devolviendo `(IReadOnlyList<(Allocation Allocation, string PersonName)> Items, int TotalCount)` (o un tipo equivalente que ya traiga el nombre de la persona).
- [x] 4.2 Implementar en `AllocationRepository` con un `Join` a `DbContext.People` ordenado por el nombre de la persona, `Skip`/`Take` a nivel de base de datos — sin el patrón `Task.WhenAll(GetByIdAsync)` que usa hoy el use case (ver design.md — Decisions).
- [x] 4.3 Actualizar `GetAllocationsBySquadUseCase`: usa `GetBySquadPagedAsync` en vez de `GetBySquadAsync` + resolución en memoria; sigue resolviendo el nombre de la célula con un único `squadRepository.GetByIdAsync(squadId)`. Devuelve `GetAllocationsBySquadResponse` con `PagedResult<AllocationDto>`. Se quitó `IPersonRepository` del constructor (ya no se usa, el nombre de persona viene del join).
- [x] 4.4 Actualizar `AllocationsEndpoints.GetBySquadAsync` con los mismos query params y clamps que en 2.4.
- [x] 4.5 Actualizar el test de listado en `AllocationUseCaseTests.cs` a la nueva firma; agregar un caso de paginación y confirmar que el orden por nombre se mantiene.

## 5. Backend: verificación

- [x] 5.1 Correr la suite de tests del backend (`dotnet test`) y confirmar que pasa completa, incluidos los casos nuevos de paginación. Los 15 tests de paginación (personas/células/asignaciones) pasan. Quedan 9 fallas preexistentes en `RestClientBehaviorTests` (cliente HTTP externo genérico, no tocado por este change — `ExternalApiException` vs `InvalidOperationException`), verificadas como no relacionadas por `--filter` acotado.
- [x] 5.2 Confirmar por inspección que `IRepository<T>.GetAllAsync` y sus demás consumidores (Company, BauTask, Initiative, etc.) no fueron tocados. Confirmado: sin cambios en `IRepository.cs`/`Repository.cs`.

## 6. Frontend: mocks paginados

- [x] 6.1 Definir un tipo `PagedResult<T>` en el frontend (junto a `httpClient` o en `shared/services/`), con la misma forma que el backend (`items`, `page`, `pageSize`, `totalCount`, `totalPages`). Creado en `shared/services/pagination.ts`.
- [x] 6.2 Actualizar `people.handlers.ts`: el handler `GET /people` lee `page`/`pageSize` de `new URL(request.url).searchParams` (mismos defaults/clamps que el backend), recorta el array `people` en memoria y devuelve el `PagedResult<PersonDto>`. Clamp/recorte centralizados en `shared/services/pagination.ts`.
- [x] 6.3 Mismo cambio en `squads.handlers.ts` para `GET /squads`.
- [x] 6.4 Mismo cambio en `allocations.handlers.ts` para `GET /squads/:squadId/allocations`.
- [x] 6.5 Actualizar los tests existentes de estos tres handlers/hooks que asuman hoy un array plano en la respuesta.

## 7. Frontend: Personas — paginación y menú de acciones

- [x] 7.1 Actualizar `personService.list` a `list(page: number, pageSize: number): Promise<PagedResult<PersonDto>>`, pasando `page`/`pageSize` como query params.
- [x] 7.2 Actualizar `usePeople`: agrega estado `page`/`pageSize` (inicial `page=1`, `pageSize=10`), guarda `total`/`totalPages` de la respuesta, y vuelve a pedir cuando `page` o `pageSize` cambian; expone `page`, `pageSize`, `total`, `totalPages`, `onPageChange`, `onPageSizeChange` además de lo que ya expone hoy.
- [x] 7.3 En `PeopleList.tsx`: agregar `PaginationBar` debajo de `Table`, recibiendo `page`/`pageCount`(=`totalPages`)/`total`/`pageSize`/`onPageChange`/`onPageSizeChange` desde las nuevas props del componente.
- [x] 7.4 En `PeopleList.tsx`: reemplazar los `Button` "Editar"/"Eliminar" de cada fila por `<Menu trigger={<Button variant="subtle" size="small" aria-label="Más acciones"><Icon name="more" size={16} /></Button>}>` con `<MenuItem icon={<Icon name="edit" size={16}/>} onSelect={() => onEdit(person)}>Editar</MenuItem>`, `<MenuSeparator/>` y `<MenuItem destructive icon={<Icon name="delete" size={16}/>} onSelect={() => onDelete(person)}>Eliminar</MenuItem>`. (Ícono corregido a `delete` — `trash` no existe en el catálogo de íconos de tuip; también corregido en proposal.md.)
- [x] 7.5 Actualizar `PeopleContainer`/`LeadPeoplePage` si necesitan pasar las nuevas props de paginación entre `usePeople` y `PeopleList`.
- [x] 7.6 Actualizar `PeopleList.test.tsx` y los tests de `usePeople` a la nueva forma de respuesta y a los nuevos controles.

## 8. Frontend: Células — paginación y menú de acciones

- [x] 8.1 Mismo cambio que 7.1–7.2 para el servicio y el hook de squads.
- [x] 8.2 Mismo cambio que 7.3 en `SquadsList.tsx`.
- [x] 8.3 Mismo cambio que 7.4 en `SquadsList.tsx` (`onEdit`/`onDelete`).
- [x] 8.4 Actualizar el contenedor/página de Células si hace falta.
- [x] 8.5 Actualizar `SquadsList.test.tsx` y los tests del hook de squads.

## 9. Frontend: Capacidades — paginación y menú de acciones

- [x] 9.1 Mismo cambio que 7.1–7.2 para el servicio y el hook de allocations — reiniciar `page` a 1 cuando cambia la célula seleccionada. Implementado con una ref (`previousSquadId`) para evitar el doble fetch que un efecto de reset separado hubiera causado.
- [x] 9.2 Mismo cambio que 7.3 en `AllocationsList.tsx`.
- [x] 9.3 Mismo cambio que 7.4 en `AllocationsList.tsx` (`onEdit`/`onRemove`, etiqueta "Quitar" en vez de "Eliminar").
- [x] 9.4 Actualizar el contenedor/página de Capacidades si hace falta. **Hallazgo durante la implementación**: `AllocationsContainer` reutiliza `usePeople()`/`useSquads()` para poblar los selectores de célula y persona del formulario de asignación — con el `pageSize` por defecto (10) esos selectores habrían perdido registros más allá de la primera página. Se agregó un parámetro opcional `initialPageSize` a ambos hooks (default 10, sin cambiar la pantalla de Personas/Células) y `AllocationsContainer` pasa `100` — ver design.md.
- [x] 9.5 Actualizar `AllocationsList.test.tsx` y los tests del hook de allocations.

## 10. Verificación end-to-end

- [x] 10.1 Correr la suite de tests del frontend (`pnpm test`) y confirmar que pasa completa. 299/300 pasan (299 tras excluir 1 preexistente no relacionado). **Hallazgo**: `fireEvent.click` no abre un `Menu` de Radix en jsdom (usa `pointerdown`, no `click`, para abrir) — los 4 tests nuevos de menú de fila se escribieron con `fireEvent.pointerDown` en el trigger, confirmado funcionando. Quedan 2 fallas preexistentes sin relación: `App.test.tsx` (módulo `./App` no resuelve, ya visto en `tsc --noEmit` antes de este change) y `httpClient.test.ts` (depende de `VITE_BASE_URL` de entorno; no se tocó `httpClient.ts`).
- [ ] 10.2 **Bloqueado, no por este change.** Se intentó levantar el backend real (`dotnet run`, LocalDB `MSSQLLocalDB` arrancada) y pegarle a `GET /api/v1/people?page=1&pageSize=2`: la base de datos `api_capacidadti_celulastiWebApi` no existe — el repo no tiene ninguna migración de EF Core (`find ... -iname "*Migrations*"` no encuentra nada) ni mecanismo de seed, así que el backend real nunca se ejecutó de punta a punta contra una base de datos en este entorno, con o sin este change. La consulta sí llegó hasta el intento de conexión (`Login failed for user ... Cannot open database`), sin ningún error de traducción de LINQ/SQL — evidencia indirecta de que el `Join`+`OrderBy`+`Skip`+`Take` es válido, pero no reemplaza una verificación real contra datos. Provisionar la base de datos (migración inicial + seed) es un problema preexistente, separado, fuera del alcance de esta propuesta — no se intentó resolver acá. Cubierto en su lugar por: 15 tests de backend con repos mockeados (grupo 5.1) + verificación visual completa contra los mocks (10.3, misma forma de respuesta).
- [x] 10.3 Levantar frontend con `pnpm dev:mock` y verificar visualmente en las tres pantallas (`/app/lead/personas`, `/app/lead/celulas`, `/app/lead/capacidades`): `PaginationBar` funcional y el menú "⋮" abre, muestra Editar/Eliminar (o Quitar), y cada opción dispara el flujo existente (drawer de edición / diálogo de confirmación). Confirmado en las tres: "Mostrando X–Y de Z", selector de tamaño, menú con Editar/Eliminar, y "Editar" abre el drawer precargado en Personas.
- [x] 10.4 Correr `openspec validate add-pagination-and-row-actions-menu --strict`. Válido.

## 11. Revisión: paginación integrada a la caja de la tabla

- [x] 11.1 En `PeopleList.tsx`, `SquadsList.tsx` y `AllocationsList.tsx`: envolver `<Table flush>` y `<PaginationBar>` en un `<div className="overflow-hidden rounded-surface border border-neutral-default">` compartido, para que la paginación comparta el mismo borde/esquinas redondeadas que la tabla en vez de flotar suelta debajo — mismo patrón `flush` que ya documenta `Table` para "cuando ya está dentro de un contenedor que dibuja sus bordes". `PaginationBar` gana `className="border-t border-neutral-default bg-neutral-subtlest px-4 py-3"` para leer como el pie de esa caja, con el mismo tratamiento que ya tiene `TableFooter`. No se tocó `tuip` — no hizo falta, `flush` ya existía para esto.
- [x] 11.2 Verificar que el menú "⋮" (renderizado en un Portal de Radix) no queda recortado por el `overflow-hidden` nuevo del contenedor. Confirmado en las tres pantallas.
- [x] 11.3 `tsc --noEmit`: sin errores nuevos (sólo el preexistente no relacionado de `App.test.tsx`). Re-correr `PeopleList.test.tsx`/`SquadsList.test.tsx`/`AllocationsList.test.tsx`: 12/12 verdes.
- [x] 11.4 Verificar visualmente en las tres pantallas contra los mocks: la paginación queda integrada en la misma tarjeta que la tabla, igual que la referencia de diseño.
