## Why

Con Células y Personas ya construidas, falta el vínculo entre ambas: hoy no hay forma de asignar una persona a una célula. El backend ya modela esa asignación como `Allocation` (persona + célula + % de dedicación, con su desglose BAU/Transformación) con CRUD completo (`AllocationsEndpoints.cs`). Sin esta pantalla, ni "cuántas personas tiene cada célula" ni "cuánta capacidad libre queda" son preguntas que la plataforma pueda responder — es el siguiente eslabón, tal como se dejó anotado al construir Personas.

## What Changes

- Se agrega la pantalla **"Capacidades"** bajo `/app/lead/capacidades`: el Chapter Lead elige una célula (de las ya registradas) y ve/administra su equipo — asignar una persona existente con un % de dedicación (desglosado en BAU/Transformación), editar esa dedicación, o quitar la asignación.
- Nueva entrada de navegación **"Capacidades"** en `ChapterLeadLayout`, agrupada bajo "Capacidad" junto a "Células" y "Personas" (mismo grupo, ya existente).
- El formulario de asignación refleja el contrato real: `PersonId` (de una persona ya registrada), `SquadId` (de la célula elegida, fijo por contexto), % Dedicación (1-100), % BAU y % Transformación (0-100 cada uno, deben sumar el % Dedicación) — mismas reglas que `CreateAllocationValidator.cs`.
- Nuevo handler de mock (`allocations.handlers.ts`): `GET` de asignaciones por célula, `POST` alta, `PUT` edición, `DELETE` baja — mismo patrón que `squads.handlers.ts`/`people.handlers.ts`.

**Fuera de alcance de este change:**
- **Vista transversal "Capacidades del chapter"** del mockup (una tabla con las 24 personas de todas las células, utilización, alertas de sobreasignación, rebalanceo sugerido). El backend no tiene un endpoint que liste todas las asignaciones del chapter — sólo por célula (`GET /squads/{squadId}/allocations`) o por persona (`GET /people/{personId}/allocations`), y no existe un agregado `Chapter` del que "todas las células de mi chapter" pueda derivarse (mismo motivo por el que `ChapterId` quedó fuera de alcance en Personas). Esta pantalla es por-célula, no transversal; la vista agregada es un change posterior, y no necesariamente scoped a Chapter Lead.
- **Vincular una asignación a una Iniciativa** (`InitiativeId` en `Allocation`) — no existe todavía ninguna pantalla de Iniciativas (`Evaluar iniciativa` es su propio módulo, "Dimensionamiento", no "Gestión de Capacidad"). Las asignaciones se crean sin iniciativa.
- **Alertas de sobreasignación y rebalanceo sugerido** — dependen de la vista transversal de arriba.
- **Vincular usuario de Azure DevOps** — pertenece al módulo "Integraciones", mismo no-goal ya establecido para Personas.
- **Crear una persona nueva desde esta pantalla** — el selector de persona sólo lista personas ya registradas; darlas de alta es responsabilidad de la pantalla de Personas.
- Integración contra el backend real (`AllocationsEndpoints.cs`) — el mock refleja su contrato para que ese reemplazo sea, después, un change acotado.

## Capabilities

### New Capabilities
- `allocations`: pantalla de asignación de personas a células (listar por célula, crear, editar, eliminar) para el rol Chapter Lead, contra un endpoint mockeado.

### Modified Capabilities
- `chapter-lead-shell`: se agrega la entrada de navegación "Capacidades" al grupo "Capacidad", y su título correspondiente en el breadcrumb.
- `api-mocking`: se agrega un handler nuevo (CRUD de asignaciones por célula), como `ADDED Requirements` sobre la spec principal ya existente.

## Impact

- **Frontend**: nueva feature `frontend/src/features/allocations/` (adapters, servicio, hook, componentes — mismo patrón que `features/people/`), nueva página `frontend/src/pages/LeadCapacityPage/`, nueva ruta `capacidades` bajo `/app/lead` en `routes.tsx` (`lazy`, sin `AuthGuard`), nuevo `frontend/src/mocks/handlers/allocations.handlers.ts`, actualización de `frontend/src/features/chapter-lead-shell/navigation.ts`. Depende de `people` (selector de persona) y `squads` (selector/contexto de célula), ambas ya construidas.
- **Backend**: ningún cambio — `AllocationsEndpoints.cs` sigue sin consumirse desde el frontend en este change.
- **Sin cambios de contrato de API real** — el contrato de datos lo define este change únicamente para el mock, reflejando `AllocationDto`/`CreateAllocationRequest`/`UpdateAllocationRequest` reales.
