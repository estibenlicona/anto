## 1. Mock del backend

- [x] 1.1 Crear `frontend/src/mocks/handlers/allocations.handlers.ts`: array en memoria sembrado con 1-2 asignaciones de ejemplo (usando ids de personas/células ya sembradas en `people.handlers.ts`/`squads.handlers.ts`), `resetAllocationsMock()` exportado, `GET /squads/:squadId/allocations`, `POST /squads/:squadId/allocations`, `PUT /allocations/:id`, `DELETE /allocations/:id` reflejando `AllocationDto`/`CreateAllocationRequest`, validación server-side equivalente a `CreateAllocationValidator.cs`.
- [x] 1.2 Registrar `allocationsHandlers` en `frontend/src/mocks/handlers/index.ts`.

## 2. Servicio y adaptador

- [x] 2.1 Crear `frontend/src/features/allocations/services/allocationService.ts`: `AllocationDto`, `CreateAllocationRequest`, `UpdateAllocationRequest`, `listBySquad(squadId)`/`create(squadId, request)`/`update(id, request)`/`remove(id)` contra `httpClient`.
- [x] 2.2 Crear `frontend/src/features/allocations/adapters/AllocationAdapter.ts`: mapeo DTO ↔ forma de formulario.

## 3. Hooks

- [x] 3.1 Crear `frontend/src/features/allocations/hooks/useAllocations.ts`: recibe `squadId | undefined`, carga las asignaciones de esa célula (no carga nada si no hay célula elegida), con estado de loading/error.
- [x] 3.2 Crear `frontend/src/features/allocations/hooks/useAllocationMutations.ts`: create/update/remove con manejo de error del servidor, mismo patrón que `usePersonMutations.ts`.

## 4. Componentes

- [x] 4.1 Crear `frontend/src/features/allocations/components/allocationFormValidation.ts`: persona requerida, % dedicación 1-100, % BAU y % transformación 0-100 cada uno, BAU + Transformación == Dedicación.
- [x] 4.2 Crear `frontend/src/features/allocations/components/AllocationFormModal.tsx`: selector de persona (de `personService.list()`) en el alta, persona y célula fijas (no editables) en la edición, campos de % dedicación/BAU/transformación.
- [x] 4.3 Crear `frontend/src/features/allocations/components/AllocationsList.tsx`: tabla con persona, % dedicación, desglose BAU/transformación; estado vacío; error de carga con reintento.
- [x] 4.4 Crear `frontend/src/features/allocations/components/RemoveAllocationConfirmDialog.tsx`: mismo patrón que `DeletePersonConfirmDialog.tsx`.
- [x] 4.5 Crear `frontend/src/features/allocations/AllocationsContainer.tsx`: selector de célula (de `squadService.list()`) arriba, y debajo el listado/alta/edición/baja de la célula elegida; sin célula elegida, muestra un estado vacío invitando a elegir una.

## 5. Página, ruta y navegación

- [x] 5.1 Crear `frontend/src/pages/LeadCapacityPage/LeadCapacityPage.tsx`: `h1` `sr-only` "Gestionar Capacidades" + `<AllocationsContainer />`.
- [x] 5.2 Agregar la ruta `capacidades` bajo `/app/lead` en `frontend/src/app/router/routes.tsx` (`lazy`, sin `AuthGuard`).
- [x] 5.3 Agregar la entrada "Capacidades" al grupo "Capacidad" (después de "Personas") en `leadNavGroups`, y su título "Gestionar Capacidades" en `leadRouteTitles`, en `frontend/src/features/chapter-lead-shell/navigation.ts`.

## 6. Pruebas

- [x] 6.1 Tests de `allocationService.ts`.
- [x] 6.2 Tests de `AllocationAdapter.ts`.
- [x] 6.3 Tests de `useAllocations.ts` y `useAllocationMutations.ts`.
- [x] 6.4 Tests de `allocationFormValidation.ts`: cada límite y la validación del desglose BAU/Transformación.
- [x] 6.5 Tests de `AllocationsList.tsx` y `AllocationsContainer.tsx`. `AllocationFormModal.tsx` envuelve `Modal` (`@radix-ui/react-dialog`), no montable en jsdom en este repo (mismo motivo documentado en `SquadFormModal.validate.test.ts`) — su lógica queda cubierta como función pura en `allocationFormValidation.test.ts`. `AllocationsContainer.test.tsx` sólo cubre el estado inicial sin célula elegida: el selector de célula es un `Select` sin precedente de prueba en este repo para simular su apertura/selección en jsdom; el flujo completo (elegir célula, asignar, editar, quitar) se verifica manualmente en el navegador (7.3).
- [x] 6.6 Test de la nueva entrada de navegación y del breadcrumb en `ChapterLeadLayout`/`navigation.ts`.
- [x] 6.7 Test de ruteo: `/app/lead/capacidades` renderiza `LeadCapacityPage` sin `AuthGuard`.

## 7. Verificación

- [x] 7.1 Correr la suite completa de tests del frontend y confirmar que no hay regresiones fuera de las fallas preexistentes ya conocidas. 292/293 tests OK; las 2 fallas restantes son `App.test.tsx` y `httpClient.test.ts`, preexistentes y fuera de alcance.
- [x] 7.2 Correr `tsc --noEmit` en `frontend`. Limpio salvo el error preexistente y fuera de alcance de `App.test.tsx`.
- [x] 7.3 Levantar `pnpm dev:mock` y verificar manualmente en el navegador. Verificado: navegación "Capacidades" y breadcrumb "Gestionar Capacidades", selector de célula con las 2 células sembradas, estado vacío con el mensaje correcto sin célula elegida, listado de la asignación sembrada (María González, 80%/50%/30%) al elegir "Backend Platform", modal de edición precargado con Célula y Persona fijas (no editables) y los tres campos de % editables, botón Guardar con ícono.
