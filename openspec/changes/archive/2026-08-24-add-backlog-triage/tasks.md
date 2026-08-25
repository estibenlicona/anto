## 0. Prerrequisito

- [x] 0.1 Reinstalar `@tuya-ui/components` en `frontend/` desde `tuip/.local-packages` y confirmar que `OptionCard`, `OptionCardGroup`, `Textarea`, `Kbd` y el `Chip` seleccionable tipan; borrar `node_modules/.vite` si el dev server cacheó el paquete anterior.

## 1. Mock del backlog

- [x] 1.1 Exportar `getDevOpsIdentitiesSnapshot()` desde `personDetail.handlers.ts` (lectura en un solo sentido de `identities`).
- [x] 1.2 Crear `mocks/handlers/backlog.seeds.ts`: iniciativas activas por célula, categorías BAU (9), motivos de rechazo, ~24 historias de usuario referenciando usuarios DevOps (vinculados y no vinculados), con Epics (algunos mapeados a iniciativa), estados, puntos, sprint, tablero, fecha de ingesta, y al menos dos con cambio de asignado.
- [x] 1.3 Crear `mocks/handlers/backlog.handlers.ts`: `GET /backlog/queue` (filtros `squadId`, `personId`, `status`; orden cambio-de-asignado → ingesta; resumen con pendientes por célula, clasificadas hoy y excluidas), `GET /backlog/catalogs`, `POST …/classify` (400 si falta iniciativa/categoría), `POST …/skip`, `POST …/undo` (409 si no está clasificada), `POST …/reject` (400 sin motivo; crea la pendiente a nombre de `reassignToPersonId`); `resetBacklogMock()`; registrar en `index.ts`.
- [x] 1.4 Tests `backlog.handler.test.ts`: cola y resumen coherentes; filtros; clasificar y avanzar (y 400); saltar/deshacer/rechazar (409/400; nueva pendiente); excluidas por identidad y aparición tras vincular con `personDetailService.linkDevOpsIdentity`.

## 2. Servicio, adapter y hooks

- [x] 2.1 `features/backlog/services/backlogService.ts` (DTOs; `getQueue(filters)`, `getCatalogs()`, `classify`, `skip`, `undo`, `reject`).
- [x] 2.2 `features/backlog/adapters/BacklogAdapter.ts`: entidad de historia (iniciales y célula de la persona, `changedAssignee`, `suggestedInitiativeId`, etiquetas en español de estado y tipo, `classificationLabel`), resumen con porcentaje de progreso, y `components/backlogValidation.ts` (`validateDecision`).
- [x] 2.3 Hooks: `useBacklogQueue(filters)` (`items`, `summary`, `current`, `loading`, `error`, `refetch`), `useBacklogCatalogs()`, `useBacklogMutations()` (classify/skip/undo/reject con `MutationResult`), `useBacklogPendingCount()` + `backlogEvents`.
- [x] 2.4 Tests del adapter, de `validateDecision` y de los hooks con el mock real.

## 3. Componentes

- [x] 3.1 `BacklogHeader` (título, frase, progreso del día con `Progress`), `BacklogQueueFilters` (chips seleccionables por célula con contador, "Todas", alternancia Por clasificar / Clasificadas con `SegmentedControl`, chip removible de persona cuando hay `?persona`).
- [x] 3.2 `BacklogQueue` + `QueueRow` (posición, título, número · célula · persona, avatar; en curso resaltada; aviso ámbar de cambio de asignado; pie de excluidas con enlace a Personas) y su estado vacío (`EmptyState`).
- [x] 3.3 `CurrentStoryPanel` (zona qué es y zona de quién es con la acción "No es de <nombre>…"), `DecisionCards` (`OptionCardGroup` Iniciativa / BAU / Descartar con `Select` interno y atajos `Kbd`; errores de validación), `StoryFooter` (`Kbd` de atajos, Saltar por ahora, Guardar y siguiente primario).
- [x] 3.4 Vista Clasificadas integrada en `BacklogQueue` (misma lista con el resultado y la acción deshacer) en vez de un `ClassifiedList` aparte; `BacklogQueueFilters` también quedó dentro de `BacklogQueue`.
- [x] 3.5 `RejectItemDrawer` (item, motivo obligatorio con chips excluyentes, "¿De quién es, entonces?" con `Select`, detalle con `Textarea`, "Así queda", Rechazar primario, error de validación).
- [x] 3.6 Tests de componentes con fixtures: filtros y contadores; cola (orden, resaltado, ámbar, vacío); tarjetas (sugerida preseleccionada, errores de validación, atajos visibles); drawer (motivo obligatorio, reasignación en "Así queda"); clasificadas (deshacer).

## 4. Container, página, navegación

- [x] 4.1 `features/backlog/BacklogContainer.tsx`: filtros desde la URL (`?persona`), cola + en curso, formulario de decisión con `key={item.id}`, atajos globales con guard (campos y drawer), guardar/saltar/deshacer/rechazar con toast y refetch, `backlogEvents` tras cada mutación, `useLeadBreadcrumbTrailing` no aplica (pantalla raíz).
- [x] 4.2 `pages/LeadBacklogPage/LeadBacklogPage.tsx`, ruta `backlog` en `routes.tsx`; `navigation.ts` con `lead-backlog` ("Backlog", icono `backlog`, título "Gestionar Backlog"); `ChapterLeadLayout` pasa `badge` desde `useBacklogPendingCount()`.
- [x] 4.3 `PersonDetailStatsCards`: "Ir a la bandeja" → `/app/lead/backlog?persona=<id>`; ajustar su test.
- [x] 4.4 Tests: rutas (nueva ruta, 7 hijas), navegación (entrada y título), layout (badge presente con pendientes y ausente en cero), `BacklogContainer.test.tsx` con el mock real (render, guardar avanza y suma progreso, saltar reordena, filtro por persona desde la URL, atajos `2`+`↵`, rechazar con reasignación, deshacer desde Clasificadas, cola vacía).

## 5. Verificación

- [x] 5.1 `npx vitest run`, typecheck y lint (sólo los fallos baseline conocidos); prettier en archivos tocados.
- [x] 5.2 Navegador: `/app/lead/backlog` contra el canvas "Backlog y Curación" — cola y zonas, tarjetas con sugerida, guardar con `↵`, saltar con `S`, filtro por célula, Clasificadas + deshacer, drawer de rechazo con motivo y reasignación, badge en el sidebar, enlace desde el detalle de persona.
- [x] 5.3 Anotar en `proposal.md` (Impact) cualquier brecha nueva de tuip detectada al implementar.
