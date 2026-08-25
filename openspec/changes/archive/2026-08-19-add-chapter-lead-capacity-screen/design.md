## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- El backend real ya modela `Allocation` (`backend/src/GestionCapacidad.Domain/Entities/Allocation.cs`) y lo expone en `AllocationsEndpoints.cs`: `GET api/v{v}/squads/{squadId}/allocations`, `POST api/v{v}/squads/{squadId}/allocations`, `GET api/v{v}/people/{personId}/allocations`, `PUT api/v{v}/allocations/{id}`, `DELETE api/v{v}/allocations/{id}`. No hay un endpoint que liste todas las asignaciones del chapter — sólo por célula o por persona. `CreateAllocationRequest`/`UpdateAllocationRequest`/`CreateAllocationValidator` fijan el contrato: `PersonId`, `SquadId` (de la URL, no del cuerpo, en el alta), `InitiativeId` opcional, `DedicationPercentage` (1-100), `BauPercentage` y `TransformationPercentage` (0-100 cada uno, deben sumar `DedicationPercentage`). `UpdateAllocationRequest` no incluye `PersonId`/`SquadId` — sólo se edita el desglose de dedicación y, opcionalmente, la iniciativa.
- `AllocationDto` ya trae `PersonName`, `SquadName` e `InitiativeName` desnormalizados — no hace falta cruzar contra `people`/`squads` para mostrar nombres en el listado.
- `features/people/` y `features/squads/` son los precedentes directos: ambos ya tienen servicio, adaptador, hooks y componentes construidos y probados. Esta capacidad depende de sus servicios (`personService.list()`, `squadService.list()`) para poblar los selectores, sin duplicar esa lógica.
- A diferencia del formulario de Personas (13 campos, requirió pasar de `Modal` a `Drawer` por un bug real de scroll en `Modal`/`ModalBody` con contenido alto), el formulario de una asignación tiene 4 campos (persona, % dedicación, % BAU, % transformación) — cabe cómodo en un `Modal`, mismo patrón que `SquadFormModal`.

## Goals / Non-Goals

**Goals:**
- Elegir una célula y administrar su equipo (asignar, editar, quitar) contra un mock que refleja el contrato real.

**Non-Goals:**
- Vista transversal del chapter, utilización, alertas, rebalanceo, iniciativas, vínculo DevOps — todos fuera de alcance, ver proposal.md.
- Tocar `features/people/` o `features/squads/` — esta capacidad los consume, no los modifica.

## Decisions

- **La pantalla es por-célula: un selector de célula arriba, y debajo el equipo de la célula elegida.** Refleja el contrato real (`GET /squads/{squadId}/allocations`, sin equivalente transversal) en vez de simular una agregación que el backend no ofrece. `frontend/src/features/allocations/AllocationsContainer.tsx` mantiene el `squadId` elegido como estado local; sin selección, muestra un estado vacío invitando a elegir una célula.
- **Estructura de `features/allocations/` idéntica a `features/people/`, con las mismas siete piezas:**
  - `services/allocationService.ts` — `AllocationDto`/`CreateAllocationRequest`/`UpdateAllocationRequest`, mismos nombres de campo que el DTO real, `listBySquad(squadId)`/`create(squadId, request)`/`update(id, request)`/`remove(id)` contra `httpClient`.
  - `adapters/AllocationAdapter.ts` — mapeo DTO ↔ forma de UI.
  - `hooks/useAllocations.ts` — recibe `squadId`, carga sus asignaciones (no carga nada mientras no haya célula elegida).
  - `hooks/useAllocationMutations.ts` — create/update/remove, mismo patrón que `usePersonMutations.ts`.
  - `components/AllocationsList.tsx`, `components/AllocationFormModal.tsx`, `components/allocationFormValidation.ts`, `components/RemoveAllocationConfirmDialog.tsx` — mismo rol que sus pares en Personas/Squads.
- **El selector de persona lista todas las personas registradas (`personService.list()`), sin excluir a las ya asignadas a la célula elegida.** El backend no impone unicidad persona+célula en el dominio revisado, y filtrar duplicados es una mejora de UX, no un requisito de esta capacidad — se puede agregar después sin tocar el contrato.
- **`allocationFormValidation.ts` reimplementa los límites de `CreateAllocationValidator.cs`**: persona requerida, % dedicación 1-100, % BAU y % transformación 0-100 cada uno, y BAU + Transformación == Dedicación — mismo criterio que `personFormValidation.ts`: bloquea el envío en cliente, no reemplaza al validador real.
- **Editar no permite cambiar persona ni célula**, reflejando que `UpdateAllocationRequest` no los acepta: `AllocationFormModal` en modo edición muestra ambos como texto fijo, no como campos editables.
- **Página y ruta siguen el patrón ya establecido**: `pages/LeadCapacityPage/LeadCapacityPage.tsx` (mismo shape que `LeadPeoplePage.tsx`), ruta `capacidades` bajo `/app/lead` en `routes.tsx` (`lazy`, sin `AuthGuard`).
- **Navegación**: nueva entrada en `leadNavGroups` (grupo "Capacidad", después de "Personas") y en `leadRouteTitles`, mismo archivo `features/chapter-lead-shell/navigation.ts`.
- **Mock handler `allocations.handlers.ts`**: array en memoria por célula, `resetAllocationsMock()` exportado, `GET /squads/:squadId/allocations`, `POST /squads/:squadId/allocations`, `PUT /allocations/:id`, `DELETE /allocations/:id` — mismo patrón que `squads.handlers.ts`/`people.handlers.ts`. Sembrado con un par de asignaciones de ejemplo usando los ids de las personas y células ya sembradas en sus propios mocks, para que la pantalla muestre datos reales al abrir.

## Risks / Trade-offs

- [La pantalla por-célula no responde "cuánta capacidad libre tiene el chapter" de un vistazo, que es lo que el mockup completo sí resuelve] → Es la limitación real del backend hoy (sin endpoint transversal), documentada en proposal.md como no-goal explícito, no un recorte arbitrario de esta pantalla.
- [Sin excluir personas ya asignadas del selector, nada impide asignar la misma persona dos veces a la misma célula] → El dominio revisado no lo prohíbe tampoco; si en el futuro se decide prohibirlo, es una regla de validación acotada de agregar, no un cambio de forma.
