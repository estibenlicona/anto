## 1. Contrato y mocks

- [x] 1.1 En `allocationService.ts`, agregar a `AllocationDto` los campos de sólo lectura `personPosition`, `personModality`, `personSeniority`, `personSeniorityLabel`, `personAvailablePercentage`, `personOtherSquadsPercentage`, y extender `listBySquad(squadId, page, pageSize, search?, seniorities?)` serializando `seniority` repetido como `personService`.
- [x] 1.2 En `squadService.ts`, agregar `getById(id)` (`GET /squads/:id`), el tipo `SquadTeamStats` y `getTeamStats(id)` (`GET /squads/:id/team-stats`).
- [x] 1.3 En `allocations.handlers.ts`, importar `getPeopleSnapshot`, enriquecer cada asignación (campos de persona + disponibilidad calculada sobre todas las asignaciones de la persona) en `GET`, `POST` y `PUT`, reemplazar `PERSON_NAMES` por la persona en memoria, y aplicar `search`/`seniority` antes de paginar. Documentar la dependencia unidireccional.
- [x] 1.4 En `squads.handlers.ts`, agregar `GET /squads/:id` (enriquecido, 404) y `GET /squads/:id/team-stats` (conteos, expertos/principiantes, FTE, `teamAvailableFte`, 404), registrados después de `/squads/stats`.
- [x] 1.5 Ajustar semillas para cubrir "0% libre · N% en otras células" (Paula Ramírez 40% en Backend Platform + 60% en Plataforma de Datos) sin violar RN-12; verificar que los tests de handlers existentes siguen verdes.
- [x] 1.6 Tests de handlers: `GET /squads/:id` 200/404; `team-stats` con conteos y FTE derivados, célula sin equipo, 404; asignaciones con campos de persona y el caso 40/60; búsqueda por nombre/cargo y filtro por seniority.

## 2. Adapters y hooks

- [x] 2.1 `AllocationAdapter`: propagar los campos nuevos al modelo `Allocation`, normalizando ausencias (`?? 0`, `?? ""`).
- [x] 2.2 `useAllocations`: agregar `search` (debounced) y `seniorities` con vuelta a página 1, manteniendo la firma `useAllocations(squadId)` como primer parámetro.
- [x] 2.3 Crear `useSquad(squadId)` (`squad`, `loading`, `error`, `notFound`, `refetch`) y `useSquadTeamStats(squadId)` (`stats`, `loading`, `error`, `refetch`).
- [x] 2.4 Tests: `AllocationAdapter`, `useAllocations` (params y reset de página), `useSquad` (200/404/error), `useSquadTeamStats`.

## 3. Shell y rutas

- [x] 3.1 `chapter-lead-shell/navigation.ts`: quitar la entrada Capacidades; `resolveLeadNavId` resuelve por ruta exacta o prefijo (`href + "/"`), eligiendo el más largo.
- [x] 3.2 `ChapterLeadLayout.tsx`: crear `LeadBreadcrumbContext` (`trailing`, `setTrailing`) y renderizar el tercer nivel (`Gestionar Células` con enlace + nombre) cuando hay `trailing`.
- [x] 3.3 `routes.tsx`: agregar `celulas/:id` → `LeadSquadDetailPage`; reemplazar `capacidades` por `CapacityRedirect` (`?celula=` → detalle; sin id → listado); eliminar `pages/LeadCapacityPage` y referencias (incluido `dev/auth-simulator/profiles.ts` si menciona Capacidades como pantalla).
- [x] 3.4 Tests: `navigation` (sin Capacidades, activo por prefijo), `ChapterLeadLayout` (breadcrumb de tres niveles y vuelta a dos al limpiar), `CapacityRedirect` (con y sin `celula`).

## 4. Detalle de célula

- [x] 4.1 Crear `pages/LeadSquadDetailPage` (lee `useParams().id`) y `features/squads/SquadDetailContainer.tsx` con `useSquad`, `useSquadTeamStats`, `useSquadMutations`, `useCriticalities`; estados not-found (EmptyState con enlace al listado) y error (Alert + Reintentar); publica el nombre en `LeadBreadcrumbContext` y lo limpia al desmontar.
- [x] 4.2 Crear `components/SquadDetailHeader.tsx`: enlace "← Células" (RouterLink), h1 con el nombre, `Badge` de criticidad con etiqueta en español, tribu con icono, descripción; botones "Editar célula" (secondary) y "Asignar persona" (primary), y `Menu` con "Eliminar célula" (destructive).
- [x] 4.3 Crear `components/SquadTeamStatsCards.tsx` con las 3 cards del mockup (Equipo, Capacidad asignada, Mix BAU / Transformación) según design D5; `null` en carga o error; sin división por cero.
- [x] 4.4 En `SquadDetailContainer`, componer encabezado + cards + `Tabs` con la única tab "Equipo" (count = `memberCount`) + `AllocationsContainer squadId onChanged createRequestKey`; cablear editar (SquadFormModal, refetch de `useSquad`) y eliminar (DeleteSquadConfirmDialog → `navigate("/app/lead/celulas")`).
- [x] 4.5 Tests: `SquadDetailHeader` (acciones disparan callbacks, badge en español), `SquadTeamStatsCards` (null, lecturas del escenario 4/2.7/3.8, división por cero), `SquadDetailContainer` con el mock real (encabezado, cards, tabla del equipo, not-found, breadcrumb publicado, eliminar navega al listado).

## 5. Equipo (allocations) en el detalle

- [x] 5.1 `AllocationsContainer`: recibir `squadId`, `onChanged?` y `createRequestKey?` por props; quitar `Select`, `useSquads`, `useSearchParams`; abrir el formulario de alta cuando `createRequestKey` cambia; llamar `onChanged` tras crear/editar/quitar con éxito.
- [x] 5.2 `AllocationsList`: toolbar (`SearchField` "Buscar por nombre o cargo" + `FilterButton` "Seniority" con el catálogo de `useCatalogs`); columnas Persona (Avatar + nombre + "cargo · modalidad"), Seniority (`SeniorityCard compact`), Dedicación (barra + %), BAU / Transformación (`SegmentedBar` slate/blue + texto), Disponible (tres variantes de design D5), menú Editar/Quitar; estados vacíos "todavía no hay equipo" vs "sin resultados".
- [x] 5.3 Tests: `AllocationsList` (columnas, umbrales de la barra, variantes de disponibilidad, estados vacíos, callbacks de búsqueda/filtro), `AllocationsContainer` (sin selector, `createRequestKey` abre el alta, `onChanged` tras mutación exitosa vía mock).

## 6. Listado de células

- [x] 6.1 `SquadsList`: nombre como `Link asChild tone="neutral"` → `RouterLink` a `/app/lead/celulas/:id`; quitar "Ver equipo" y la prop `onViewTeam`. `SquadsContainer`: quitar `viewTeam`/`useNavigate`.
- [x] 6.2 Tests: `SquadsList` (enlace con href correcto, menú sin "Ver equipo"), `SquadsContainer` (clic en el nombre navega al detalle).

## 7. Verificación

- [x] 7.1 Correr `npx vitest run src/features/squads src/features/allocations src/features/chapter-lead-shell src/layouts src/mocks src/app` y el typecheck sin regresiones frente al baseline (fallos pre-existentes conocidos: `App.test.tsx`, `httpClient.test.ts`).
- [x] 7.2 Levantar la app en modo mock: desde Células, clic en "Backend Platform" → detalle con breadcrumb de tres niveles y entrada activa; cards con 4 personas / 2.7 FTE; tabla del equipo con seniority, dedicación, BAU/Transf. y disponibilidad (Paula "0% libre · 60% en otras células"); asignar una persona desde el encabezado y confirmar que cards y listado de Células se actualizan; editar y eliminar desde el detalle; `/app/lead/capacidades?celula=<id>` redirige; el menú ya no muestra Capacidades.
- [x] 7.3 Revisar fidelidad contra el artifact "Detalle de Célula" (jerarquía del encabezado, cards, tabs, tabla) y que la tabla no desborda a 1280 px.
