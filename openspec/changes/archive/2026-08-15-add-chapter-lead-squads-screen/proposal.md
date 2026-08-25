## Why

La plataforma solo tiene hoy un esqueleto de interfaz para el rol Admin (`add-admin-interface-shell`); el rol Chapter Lead —el que efectivamente gestiona células, iniciativas y capacidades día a día— no tiene ninguna pantalla todavía. `add-squads-screen` (change activo, planificación completa) había diseñado la pantalla de Células, pero para un layout genérico (`MainLayout`) sin rol, y su código nunca llegó a implementarse (el repo no tiene ningún archivo de `squads` pese a que su `tasks.md` está marcado como 23/25 completo). Esta change retoma y reemplaza ese alcance: la primera pantalla real de Chapter Lead — "Gestionar Células" — con su propio shell de navegación (`ChapterLeadLayout`, análogo a `AdminLayout`), fiel al `NAV.lead` del mockup.

## What Changes

- Se agrega `ChapterLeadLayout` (sidebar + topbar + breadcrumb, mismo patrón que `AdminLayout`) para el rol Chapter Lead, con navegación limitada a lo que este change construye: "Inicio" (placeholder mínimo, sin la Torre de control completa del mockup — fuera de alcance) y, agrupada bajo "Gestión de Capacidad", "Gestionar Células".
- Se agrega la pantalla "Gestionar Células" bajo `/app/lead/celulas`: listado, alta, edición y baja de células (nombre, tribu, criticidad, descripción), con los mismos límites de validación que ya había diseñado `add-squads-screen` (nombre ≤200, tribu ≤100, descripción ≤500, criticidad desde catálogo).
- A diferencia del `add-squads-screen` original (que apuntaba al backend real), esta pantalla consume un **endpoint mockeado** (`squads.handlers.ts`, mismo patrón que `sprint-config.handlers.ts`) — consistente con el resto del esqueleto de interfaces construido hasta ahora, y sin depender de tener el backend levantado.
- Rutas bajo `/app/lead/*` **sin** `AuthGuard`, igual que `/app/admin/*` — la plataforma sigue sin autenticación real.
- **Se abandona `add-squads-screen`**: su alcance queda absorbido por este change (con las diferencias de shell/backend arriba). Se propone eliminar ese change sin archivarlo (nunca se implementó código) — se confirma con el usuario antes de borrarlo.

**Fuera de alcance de este change:**
- La pantalla "Inicio · Torre de control" completa del mockup (KPIs del chapter, tarjetas de células, alertas, pendientes) — el `ChapterLeadLayout` necesita una ruta índice, pero se deja como placeholder mínimo; se construye en un change posterior.
- El resto de la navegación de Chapter Lead (Evaluar iniciativa, Portafolio, Capacidad vs Demanda, Calibración, Gestionar Iniciativas, Gestionar Capacidades, Gestionar Backlogs, Reporte de Horas, Integraciones) — no se agregan entradas de navegación para pantallas que no existen todavía.
- Vista de detalle de célula (tabs Resumen/Backlog/Board/Equipo) y vínculo a DevOps — mismo no-goal que ya tenía `add-squads-screen`.
- Integración contra el backend real (`SquadsEndpoints.cs`) — queda pendiente para un change posterior que reemplace el mock por las llamadas reales, cuando corresponda.

## Capabilities

### New Capabilities
- `chapter-lead-shell`: esqueleto de layout y navegación para el rol Chapter Lead (sidebar, topbar, breadcrumb), mismo patrón que `admin-shell`.
- `squads`: pantalla de gestión de células (listar, crear, editar, eliminar) para el rol Chapter Lead, contra un endpoint mockeado. (`add-squads-screen` ya había declarado esta misma capability como nueva, pero nunca se implementó ni se archivó — este change la reemplaza.)

### Modified Capabilities
- `api-mocking`: se agrega un handler nuevo (CRUD de células + catálogo de criticidades) — como esa capability todavía no tiene spec principal (ningún change que la toca fue archivado aún), este delta usa `ADDED Requirements`, igual que hicieron los changes anteriores que la extendieron.

## Impact

- **Frontend**: nuevo `frontend/src/layouts/ChapterLeadLayout/`, nueva feature `frontend/src/features/squads/` (adapters, services, hooks, componentes — mismo patrón que `admin-shell`/`authentication`), nueva página `frontend/src/pages/LeadSquadsPage/` (o estructura equivalente), nuevas rutas `/app/lead/*` en `routes.tsx` (`lazy`, sin `AuthGuard`), nuevo `frontend/src/mocks/handlers/squads.handlers.ts`.
- **Backend**: ningún cambio — el backend real (`SquadsEndpoints.cs`) sigue sin consumirse desde el frontend en este change.
- **Sin cambios de contrato de API real** — el contrato de datos lo define este change únicamente para el mock (reflejando el `SquadDto`/`CreateSquadRequest`/`UpdateSquadRequest` reales, para que integrar contra el backend real después sea un cambio acotado).
- **`add-squads-screen`**: se elimina (pendiente de confirmación del usuario), no se archiva.
