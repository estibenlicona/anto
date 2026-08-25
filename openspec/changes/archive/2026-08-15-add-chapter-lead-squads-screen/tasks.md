## 1. Handler de mock de células

- [x] 1.1 Crear `frontend/src/mocks/handlers/squads.handlers.ts`: `GET`/`POST`/`PUT`/`DELETE` de células con estado en memoria (2-3 células de ejemplo iniciales) y validación (nombre ≤200, tribu ≤100, descripción ≤500, criticidad del catálogo). Exportar `resetSquadsMock()`.
- [x] 1.2 Agregar el handler de criticidades (`GET`, estático: `Critical`, `High`, `Medium`, `Low`) al mismo archivo o uno separado (`criticalities.handlers.ts`) — se agregó al mismo archivo.
- [x] 1.3 Sumar ambos a `frontend/src/mocks/handlers/index.ts`.

## 2. Capa de datos de la feature squads

- [x] 2.1 Crear `frontend/src/features/squads/adapters/SquadAdapter.ts` (DTO ↔ modelo de UI, datos de formulario ↔ request de creación/edición).
- [x] 2.2 Crear `frontend/src/features/squads/services/squadService.ts` (`list`, `create`, `update`, `remove`, `getCriticalities`).
- [x] 2.3 Tests unitarios de `SquadAdapter` y `squadService`.

## 3. Hooks de la feature squads

- [x] 3.1 Crear `useSquads` (listado + refetch), `useSquadMutations` (create/update/remove), `useCriticalities`.
- [x] 3.2 Tests unitarios de cada hook (éxito, error, estados de carga).

## 4. Componentes de la feature squads

- [x] 4.1 Crear `SquadsList` (tabla con nombre/tribu/criticidad/descripción, estado vacío, estado de error con reintento).
- [x] 4.2 Crear `SquadFormModal` (alta/edición unificada, `Select` de criticidad desde `useCriticalities`, validación de cliente, conserva datos ingresados ante error de servidor).
- [x] 4.3 Crear `DeleteSquadConfirmDialog` (confirmación explícita antes de eliminar).
- [x] 4.4 Crear `SquadsContainer` conectando los hooks con los 3 componentes.
- [x] 4.5 Tests de componentes — **adaptado**: `SquadsList` cubre listado vacío/con datos/error+reintento (mismo patrón que `AdminSprintsPage.test.tsx`). Los escenarios que requieren abrir `SquadFormModal`/`DeleteSquadConfirmDialog` (alta, edición, error de servidor al guardar/eliminar, confirmación/cancelación de borrado) **no se pudieron montar en jsdom**: `Modal` cuelga de `@radix-ui/react-dialog` → `react-remove-scroll` (paquete CJS sin mapa de `exports`) que, dentro de este monorepo (tuip vinculado por `link:`), resuelve "react" por Node puro en vez del resolver de Vite y rompe los hooks ("Invalid hook call") — no se encontró combinación de config de Vitest que lo evite (ver design.md, Riesgo nuevo). En su lugar: `validate()` de `SquadFormModal` se exportó y se probó como función pura (9 casos), y los flujos completos con el modal se verifican manualmente en el navegador (tarea 7.2).

## 5. Shell de Chapter Lead

- [x] 5.1 Crear `frontend/src/features/chapter-lead-shell/navigation.ts` con las entradas de `NAV.lead` construidas hasta el momento (Inicio, Gestionar Células agrupada bajo "Gestión de Capacidad").
- [x] 5.2 Crear `frontend/src/layouts/ChapterLeadLayout/ChapterLeadLayout.tsx` (Sidebar/Navbar/Breadcrumb + `ToastProvider`, mismo patrón que `AdminLayout`).
- [x] 5.3 Crear `frontend/src/pages/ChapterLeadHomePage/ChapterLeadHomePage.tsx` (placeholder mínimo).
- [x] 5.4 Crear `frontend/src/pages/LeadSquadsPage/LeadSquadsPage.tsx` renderizando `SquadsContainer`.
- [x] 5.5 Tests de `ChapterLeadLayout` (navegación, entrada activa, breadcrumb) — mismo patrón que `AdminLayout.test.tsx`.

## 6. Enrutamiento

- [x] 6.1 Agregar el grupo `/app/lead` en `frontend/src/app/router/routes.tsx` con `ChapterLeadLayout` como elemento padre (`lazy`, sin `AuthGuard`) y las 2 páginas como hijas, sin modificar los grupos existentes.
- [x] 6.2 Tests de `routes.tsx` cubriendo el nuevo grupo.

## 7. Verificación final

- [x] 7.1 Ejecutar `npm run lint` y `npx vitest run` en `frontend/` y confirmar que pasan sin regresiones nuevas.
- [x] 7.2 Levantar `pnpm dev:mock`, entrar a `/app/lead/celulas` y recorrer manualmente: listar, crear, editar y eliminar una célula, y los estados vacío/error. Verificado en Chrome real: listado inicial, validación de cliente en el formulario, alta (toast "Célula creada"), edición (modal precargado con los valores correctos), y baja con confirmación (toast, fila removida). El estado vacío queda cubierto por `SquadsList.test.tsx`; no se forzó manualmente (requeriría vaciar el mock).
- [x] 7.3 Confirmar con el usuario si se elimina `openspec/changes/add-squads-screen` (superseded, sin código implementado) y, si confirma, eliminarlo. Confirmado — eliminado.
