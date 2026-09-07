## 1. Mock: retirar la regla y transportar la demanda

- [x] 1.1 `frontend/src/mocks/handlers/initiatives.handlers.ts`: eliminar el rechazo 400 de "la célula ya tiene una activa", la función `squadHasOtherActive` y el campo derivado en `respond` (queda el rechazo por falta de evaluación); actualizar `initiativeService.ts` (DTO sin `squadHasOtherActive`). Verificar: tests de handlers de iniciativas ajustados — activar una segunda iniciativa en la misma célula responde 200 y ambas quedan `Active`.
- [x] 1.2 `frontend/src/mocks/handlers/squads.handlers.ts`: reemplazar `activeInitiativeOf` por `activeInitiativesOf(squadId)` (todas las `Active` de la célula, ordenadas por nombre, proyectadas como `{ id, name, talla, fteMin, fteMax }` desde su evaluación; sin evaluación → se omite) y exponer `activeInitiatives` en `enrich`; actualizar `squadService.ts` (`SquadActiveInitiativeDto` con `fteMin`/`fteMax`, `SquadDto.activeInitiatives: []`). Verificar: test de handlers — una célula con dos activas devuelve las dos con sus rangos; con ninguna, lista vacía.
- [x] 1.3 `frontend/src/features/dedication/services/dedicationService.ts`: alinear el tipo de célula (`activeInitiative` → `activeInitiatives`) y su uso en los mocks de dedicación si existe. Verificar: `pnpm typecheck` en verde y ninguna pantalla de dedicación cambia (no hay consumidores).

## 2. Contratos y adapters

- [x] 2.1 `frontend/src/features/initiatives/adapters/InitiativeAdapter.ts`: `canActivate = status !== "Active" && evaluation !== null`, sin `squadHasOtherActive`. Verificar con tests: iniciativa evaluada en célula con otra activa → `canActivate: true`; sin evaluación → `false`.
- [x] 2.2 `frontend/src/features/squads/adapters/SquadAdapter.ts`: entidad con `activeInitiatives` (tolerando ausencia con `?? []`) y `assignmentStatus` derivado: `{ kind: "sin-demanda" | "sub" | "en-rango" | "sobre", demandMin, demandMax, deltaFte }` — `sub` si `allocatedFte < Σ fteMin`, `sobre` si `> Σ fteMax`, extremos dentro del rango, cifras con `round1` y comparación sin redondear. Verificar con tests: los escenarios de la spec (sub con faltante 0.5, en rango, extremo exacto → en rango, sobre con sobrante 0.5, sin activas → sin demanda, demanda sin personas → sub con faltante = Σ fteMin).

## 3. UI del listado de Células

- [x] 3.1 `SquadsList`: columna de iniciativas con una línea por activa (talla con el mapa de colores compartido + nombre truncado como enlace neutro a su evaluación); sin activas, guion + "Sin iniciativa" como hoy. Verificar con tests: célula con dos activas muestra ambas líneas; las en evaluación no aparecen ni suman contador.
- [x] 3.2 `SquadsList`: columna "Asignación" contigua a Capacidad con `Badge` (`danger` Sub-asignada / `success` En rango / `info` Sobre-asignada / `neutral` Sin demanda), cifra secundaria "Faltan/Sobran N FTE" sólo en sub/sobre, y `title` "Demanda X–Y FTE · Asignado Z FTE"; ajustar `colSpan` de las filas de estado. Verificar con tests: cuatro estados renderizados con su rol y su cifra; el tooltip presente en el estado.
- [x] 3.3 Tests de `InitiativesList`/`StatusConfirmDialog` que codificaban la regla vieja: reescribir contra la nueva (menú con "Activar" habilitado aunque la célula tenga otra activa). Verificar: `grep -r "squadHasOtherActive" frontend/src` sin resultados.

## 4. Verificación

- [x] 4.1 Suites completas del front: `pnpm test`, `pnpm lint`, `pnpm typecheck` en verde. Verificar: los tres comandos en 0.
- [x] 4.2 Verificación visual con mocks bajo el host (trío emulador+host+remote o builds+preview): el listado de Células muestra los cuatro estados con las semillas (ajustar semillas de iniciativas si hace falta para cubrir sub/en rango/sobre/sin demanda) y activar una segunda iniciativa sobre una célula desde Iniciativas actualiza su fila. Verificar: captura de la pantalla con los cuatro estados visibles.
- [x] 4.3 Registrar la deuda de alineación backend: nota en `backend/ENDPOINTS.md` (semáforo) de que `ChangeInitiativeStatusUseCase` aún impone una sola activa y de los campos nuevos de `SquadDto`, para el change `backend-modulo-*` que lo alinee. Verificar: la nota nombra este change.
