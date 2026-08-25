## Context

Ver proposal.md - Why. Precedentes directos: `AdminLayout` (sidebar/topbar/breadcrumb con `Sidebar`/`Navbar`/`Breadcrumb` de `@tuya-ui/components`, `lazy()` en `routes.tsx` para no arrastrar tuip al bundle principal) y `add-sprint-config-save` (servicio + hook + handler de mock con estado en memoria, validación duplicada cliente/mock, `ToastProvider` montado en el layout de rol, no en `App.tsx`, por el mismo motivo de bundle). `add-squads-screen` ya había diseñado el dominio (`SquadDto`: `Id, Name, Criticality, Tribe, Description, DevOpsBoardId, CreatedAtUtc, UpdatedAtUtc`; `CreateSquadRequest`/`UpdateSquadRequest`: `Name, Criticality, Tribe, Description`; catálogo de criticidades `Critical, High, Medium, Low`) contra el backend real — este change reutiliza ese mismo contrato de datos, pero contra un mock.

## Goals / Non-Goals

**Goals:**
- Definir `ChapterLeadLayout` y su navegación, mismo patrón que `AdminLayout`.
- Definir la estructura de la feature `squads` (adapters/services/hooks/componentes) y su handler de mock.
- Definir dónde vive el modal de alta/edición y el diálogo de confirmación de borrado.

**Non-Goals:**
- No se diseña la Torre de control ni el resto de `NAV.lead` — ver proposal.md.
- No se integra contra el backend real — el mock es la única fuente de verdad de este change.
- No se introduce Redux ni paginación/búsqueda — mismos non-goals que ya tenía `add-squads-screen`, siguen aplicando.

## Decisions

**1. `ChapterLeadLayout` nuevo, estructuralmente igual a `AdminLayout`, no compartido con él todavía.**
Mismo trade-off que `AdminLayout` vs `MainLayout` (ver `add-admin-interface-shell`, Decisión 1): dos roles con navegación distinta hoy no justifican una abstracción común; se reconsidera cuando exista un tercer rol o cuando ambos layouts diverjan menos. `ChapterLeadLayout` monta `ToastProvider` igual que `AdminLayout` (Decisión de `add-sprint-config-save`), por la misma razón de bundle.

**2. Ruta base `/app/lead`, montada sin `AuthGuard`, `lazy()` igual que `AdminLayout`.**
`/app/lead` (índice: placeholder de inicio) y `/app/lead/celulas` (pantalla de Células). El grupo `/app` existente (con `AuthGuard` + `MainLayout`) y `/app/admin` no se tocan.

**3. Feature `squads` en `frontend/src/features/squads/`, mismo patrón de capas que `authentication`/`admin-shell`: `adapters/`, `services/`, `hooks/`, `components/`.**
- `adapters/SquadAdapter.ts`: DTO (`SquadDto`) ↔ modelo de UI, y datos de formulario ↔ `CreateSquadRequest`/`UpdateSquadRequest` — mismo mapeo que ya había diseñado `add-squads-screen`.
- `services/squadService.ts`: `list`, `create`, `update(id)`, `remove(id)` vía `httpClient` contra `/squads` (mock) y `getCriticalities()` contra `/criticalities` — paths relativos y distintos de `/admin/sprint-config` y de `/` (auth), para no colisionar (mismo criterio que `add-sprint-config-save`, Decisión 1).
- `hooks/useSquads.ts` (listado + refetch), `hooks/useSquadMutations.ts` (`create`/`update`/`remove`, cada uno con su propio `loading`/`error`), `hooks/useCriticalities.ts` (catálogo, una sola carga).

**4. Alta y edición en un único `SquadFormModal` (`Modal` de `@tuya-ui/components`), edición vía `PUT`, confirmación de borrado con `Modal` también (no un segundo tipo de diálogo).**
Mismo diseño que ya tenía `add-squads-screen` (Decisiones 4/5 de ese change): un solo formulario reutilizable (squad opcional = alta vs. edición) evita duplicar el layout de campos; un modal de confirmación simple evita una ruta aparte para una acción de un único registro. `Criticality` se captura con `Select` (`@tuya-ui/components`), opciones cargadas desde `useCriticalities`.

**5. Handler de mock con estado en memoria por módulo (`squads.handlers.ts`), mismo patrón que `sprint-config.handlers.ts`.**
Arreglo en memoria con 2-3 células de ejemplo (`Backend Platform`, `Canales Digitales`, del mismo mockup que ya usaron otras pantallas), `GET`/`POST`/`PUT`/`DELETE` operando sobre ese arreglo, `resetSquadsMock()` exportado para tests. El `POST` genera un id nuevo (`crypto.randomUUID()`); el handler de criticidades es estático (no depende de estado).

**6. Validación en el cliente espeja las reglas del mock, sin duplicarlas como fuente de verdad.**
Mismo trade-off ya aceptado en `add-squads-screen` y `add-sprint-config-save`: el cliente valida para feedback inmediato (nombre ≤200, tribu ≤100, descripción ≤500, criticidad del catálogo), pero cualquier error que devuelva el mock se muestra tal cual.

## Risks / Trade-offs

- **[Riesgo] Divergencia entre el contrato mockeado y el contrato real del backend** si `SquadsEndpoints.cs` cambia sin que alguien actualice el mock → Mitigación: aceptado explícitamente (ver proposal.md, fuera de alcance la integración real); el día que se integre contra el backend real, es cuando se verifica y ajusta el contrato.
- **[Trade-off] Segunda instancia de `ToastProvider`/patrón de layout duplicado** (una por rol) → mismo trade-off ya aceptado en `AdminLayout`/`add-sprint-config-save`; se reconsidera si un tercer rol lo justifica.
- **[Riesgo, descubierto durante la implementación] `Modal` (`@radix-ui/react-dialog`) no se puede montar en los tests de Vitest/jsdom de este repo.** `react-dialog` depende de `react-remove-scroll` (bloqueo de scroll), un paquete CJS sin mapa de `exports`; dentro de este monorepo (tuip vinculado por `link:` desde `frontend`), esa dependencia termina resuelta por Node puro en vez de por el resolver de Vite, cargando una copia de React distinta a la del test y rompiendo los hooks ("Invalid hook call"/"Element from an older version of React"). Se probaron múltiples configuraciones de Vitest (`server.deps.inline` ampliado, `ssr.noExternal`, `ssr.resolve.conditions` forzando `"import"`, deshabilitar el optimizador de deps) sin éxito — el problema persiste igual con cualquier combinación, lo que indica que ocurre en un punto de la resolución de Vitest que ninguna de esas opciones cubre. Se corrigió de paso una causa real (aunque no suficiente): `tuip/packages/components` y `tuip/apps/docs` tenían React 18 como devDependency mientras el resto usa React 19 — se alinearon a 19.2.0. Mitigación adoptada: `SquadFormModal` exporta su función `validate()` para probarla como lógica pura sin montar el `Modal`; los flujos que sí requieren abrirlo (alta, edición, confirmación/cancelación de borrado, errores de servidor en esos flujos) se verifican manualmente en el navegador (tasks.md, tarea 7.2) en vez de con tests automatizados. Si esto se vuelve a necesitar en un change futuro, vale la pena investigar más a fondo (o reportarlo como issue en tuip) antes de repetir el mismo diagnóstico.
