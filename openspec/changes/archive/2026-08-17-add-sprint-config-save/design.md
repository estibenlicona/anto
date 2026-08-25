## Context

Ver proposal.md - Why. `AdminSprintsPage` hoy usa `Input` no controlados (`defaultValue`) y datos hardcodeados en el componente (`sprintFields`). `authService` es el único precedente de servicio HTTP en el repo (`frontend/src/features/authentication/services/authService.ts`), y sus handlers de mock (`auth.handlers.ts`) usan un path relativo `"/"` para las 3 operaciones — este change necesita un path **distinto** para no colisionar con esos handlers. No existe ningún `ToastProvider` montado todavía en el árbol de la app (`@tuya-ui/components` lo expone pero nadie lo usa aún).

## Goals / Non-Goals

**Goals:**
- Definir el contrato del endpoint mockeado de configuración de sprints (path, forma del `GET`/`PUT`, validación, errores).
- Definir cómo el formulario pasa de no controlado a controlado, con validación de cliente y estados de carga/guardado/error.
- Definir dónde vive el feedback de éxito/error (Toast) y dónde se monta su Provider.

**Non-Goals:**
- No se define el contrato del futuro endpoint real del backend — el mock es la única fuente de verdad de este change.
- No se habilitan los botones de las otras 2 pantallas de Admin (Parámetros, DevOps) — fuera de alcance (ver proposal.md).
- No se agrega una librería de validación de esquemas (zod/yup) — no hay precedente en el repo; se sigue el mismo patrón manual que ya usa `LoginForm`.

## Decisions

**1. Path del mock: `/admin/sprint-config`, distinto del `"/"` que usa auth.**
`auth.handlers.ts` intercepta `GET`/`POST` en `"/"` — un handler nuevo en el mismo path colisionaría o requeriría lógica adicional para diferenciar operaciones por body, como ya hace el de auth (frágil, y sin necesidad aquí). `sprintConfigService` llama `httpClient.get("/admin/sprint-config")` / `httpClient.put("/admin/sprint-config", body)` con paths explícitos, a diferencia de `authService` (que depende de que `baseURL` ya apunte al recurso completo).

**2. Estado del mock: variable en memoria dentro del módulo de handlers, reseteada por `server.resetHandlers()` en tests.**
```ts
let sprintConfig: SprintConfig = { weeks: 2, hoursPerWeek: 40, sprintsPerQuarter: 6, toleranceHours: 4 };
```
`resetHandlers()` (ya configurado en `vitest-setup.ts`, `add-api-mocking`) reinstala los handlers originales en cada test — pero **no** reinicia esta variable de módulo automáticamente entre tests si el módulo no se reimporta. Se resuelve exportando una función `resetSprintConfigMock()` desde el handler y llamándola explícitamente en un `afterEach` del archivo de test que ejercite el guardado (no en el `vitest-setup.ts` global, para no acoplar el setup global a los detalles de un handler específico).

**3. Validación en el propio handler de mock, no solo en el cliente.**
El `PUT` valida rangos (semanas 1–4, horas 20–48, sprints por quarter 4–8, tolerancia 0–16 — los mismos límites que sugiere el mockup) y responde 400 si no se cumplen, replicando el patrón ya usado por `authService`/`auth.handlers.ts` (el cliente valida para dar feedback inmediato, pero el mock es quien decide qué es válido, igual que lo sería un backend real).

**4. Formulario controlado con un hook (`useSprintConfig`), no estado local en el componente.**
Mismo patrón que `useLogin`: un hook en `frontend/src/features/admin-shell/hooks/useSprintConfig.ts` que expone `values`, `errors`, `loading` (carga inicial), `saving`, `setField`, `save`. `AdminSprintsPage` queda como componente de presentación que consume el hook, consistente con la separación ya establecida en `authentication`.

**5. Feedback con `Toast` de `@tuya-ui/components`; `ToastProvider` montado en `AdminLayout`, no en `App.tsx` (revisado durante la implementación).**
La intención original era montarlo en `App.tsx` por ser infraestructura transversal, pero eso reintroduce `@tuya-ui/components` (232 KB, con sus dependencias de Radix UI) al bundle principal para *todas* las rutas — exactamente lo que `add-browser-mock-mode` evitó al hacer `lazy()` de `AdminLayout` (570 KB → 336 KB, ver ese design.md, tarea 7.5). `AdminLayout` ya importa `@tuya-ui/components` y ya está detrás de ese mismo `lazy()`, así que montar `ToastProvider` ahí no cuesta nada adicional. Cuando una pantalla fuera de Admin necesite toasts, se decide en ese momento si vale la pena mover el provider a un nivel más alto (y pagar el costo de bundle) o replicarlo localmente.

## Risks / Trade-offs

- **[Riesgo] Estado del mock en memoria de módulo puede "filtrarse" entre tests** si no se resetea explícitamente → Mitigación: Decisión 2 (`resetSprintConfigMock()` explícito en el test que lo necesita).
- **[Trade-off] Validación duplicada (cliente + handler de mock)** → mismo trade-off ya aceptado en `add-squads-screen`/`authService`: el cliente da feedback inmediato, la fuente de verdad de qué es válido queda del lado servidor (acá, el mock).
