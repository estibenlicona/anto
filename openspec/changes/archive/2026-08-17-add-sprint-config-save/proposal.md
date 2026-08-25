## Why

La pantalla "Calendario de sprints" (`AdminSprintsPage`, parte del esqueleto `admin-shell`) hoy es un formulario editable pero con el botón "Guardar configuración" deshabilitado — no persiste nada, tal como fue planificado en `add-admin-interface-shell` ("sin persistir ni cargar datos reales"). El backend no expone todavía un endpoint real de configuración de sprints. Ahora que existe infraestructura de mocking de API (`add-api-mocking`, `add-browser-mock-mode`), se puede habilitar el guardado real del formulario contra un endpoint mockeado — funcional de punta a punta (validación, guardado, feedback de éxito/error) sin depender de que el backend lo implemente todavía.

## What Changes

- El botón "Guardar configuración" deja de estar `disabled`: se habilita cuando el formulario tiene cambios válidos.
- Los 4 campos del formulario (Semanas por sprint, Horas por semana, Sprints por quarter, Tolerancia de reporte) pasan de no controlados (`defaultValue`) a controlados, con validación básica de cliente (numéricos, dentro de rangos razonables — mismos rangos que ya sugiere el mockup: semanas 1–4, horas 20–48, sprints por quarter 4–8, tolerancia 0–16).
- Al guardar: se llama a un servicio nuevo (`sprintConfigService`) contra un endpoint mockeado (`GET/PUT` configuración de sprint), y se muestra feedback de éxito o error (toast/alert de `@tuya-ui/components`).
- Se agrega un nuevo handler de mock (`sprint-config.handlers.ts`) que sirve la configuración actual y persiste el `PUT` en memoria durante la sesión del mock (un `GET` posterior refleja el último `PUT`), siguiendo el mismo patrón ya documentado en `frontend/src/mocks/README.md`.
- Los datos iniciales del formulario pasan de ser un arreglo hardcodeado en el componente a cargarse desde el mock al entrar a la pantalla (estado de carga mientras tanto).

**Fuera de alcance de este change:**
- Backend real — el endpoint sigue sin existir ahí; este change solo lo cubre vía mock.
- El resto de las pantallas de Admin (Parámetros del modelo, Conexión y job de ingesta) — sus botones ("Editar parámetros", "Probar conexión", "Ejecutar ingesta ahora") siguen deshabilitados; se habilitan en changes futuros si corresponde.
- Autenticación/autorización — sigue sin existir, esta pantalla sigue siendo accesible sin sesión (sin cambios sobre eso).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `admin-shell`: el requisito "Pantallas placeholder de Admin" cambia para la pantalla de Calendario de sprints — deja de ser un formulario puramente estático y pasa a ser funcional (editable, validado y persistido contra el mock).
- `api-mocking`: se agrega un handler nuevo (configuración de sprint) — como `api-mocking` todavía no tiene spec principal (`add-api-mocking`/`add-browser-mock-mode` completos pero sin archivar), este delta usa `ADDED Requirements`, igual que hizo `add-browser-mock-mode`.

## Impact

- **Frontend**: `frontend/src/pages/AdminSprintsPage/AdminSprintsPage.tsx` (formulario controlado, estados de carga/guardado/error), nuevo `frontend/src/features/admin-shell/services/sprintConfigService.ts` (o ubicación equivalente), nuevo `frontend/src/mocks/handlers/sprint-config.handlers.ts`, sumado a `frontend/src/mocks/handlers/index.ts`.
- **Backend**: ningún cambio.
- **Sin cambios de contrato de API real** — el contrato lo define este change únicamente para el mock; si el backend lo implementa después, se ajusta ahí.
