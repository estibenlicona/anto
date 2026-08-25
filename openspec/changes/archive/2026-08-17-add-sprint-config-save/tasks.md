## 1. Handler de mock

- [x] 1.1 Crear `frontend/src/mocks/handlers/sprint-config.handlers.ts`: `GET /admin/sprint-config` (sirve la configuración en memoria) y `PUT /admin/sprint-config` (valida rangos — semanas 1–4, horas 20–48, sprints por quarter 4–8, tolerancia 0–16 — y actualiza la configuración en memoria, o responde 400 si no valida). Exportar `resetSprintConfigMock()` para tests.
- [x] 1.2 Sumar `sprintConfigHandlers` a `frontend/src/mocks/handlers/index.ts`.

## 2. Servicio y hook

- [x] 2.1 Crear `frontend/src/features/admin-shell/services/sprintConfigService.ts` con `getConfig()`/`saveConfig(config)` contra `httpClient` (`/admin/sprint-config`).
- [x] 2.2 Crear `frontend/src/features/admin-shell/hooks/useSprintConfig.ts`: carga la configuración al montar (`loading`), expone `values`/`errors`/`saving`/`setField`/`save`, valida los mismos rangos que el handler antes de llamar al servicio.
- [x] 2.3 Tests unitarios de `sprintConfigService` (mockeando `httpClient`, éxito y error) y de `useSprintConfig` (carga inicial, validación de campo inválido, guardado exitoso, guardado con error del servidor).

## 3. Toast de feedback

- [x] 3.1 Montar `ToastProvider` (`@tuya-ui/components`) en `frontend/src/layouts/AdminLayout/AdminLayout.tsx` — no en `App.tsx`, para no reintroducir `@tuya-ui/components` al bundle principal (ver design.md, Decisión 5, revisada durante la implementación).
- [x] 3.2 En `AdminSprintsPage`, usar `useToast()` para mostrar confirmación al guardar exitosamente y error al fallar.

## 4. Formulario controlado

- [x] 4.1 Actualizar `AdminSprintsPage` para usar `useSprintConfig` en vez del arreglo `sprintFields` hardcodeado: inputs controlados, mensaje de error de validación por campo, estado de carga inicial (skeleton o placeholder mientras `loading`).
- [x] 4.2 El botón "Guardar configuración" deja de tener `disabled` fijo: se deshabilita solo cuando el formulario es inválido, no tiene cambios, o hay un guardado en curso (`saving`).
- [x] 4.3 Actualizar `AdminSprintsPage.test.tsx` para los nuevos escenarios: carga inicial desde el mock, edición y guardado exitoso (vía servidor de mocks, no mockeando el servicio — mismo patrón que `useLogin.e2e.test.ts`), validación de un campo inválido, y error de guardado (usando `server.use(...)` para forzar el error).

## 5. Verificación final

- [x] 5.1 Ejecutar `npm run lint` y `npx vitest run` en `frontend/` y confirmar que pasan sin regresiones nuevas.
- [x] 5.2 Levantar `pnpm dev:mock`, entrar a `/app/admin/sprints`, editar un valor válido y guardar (ver el toast de éxito), luego editar con un valor inválido (ver el error de validación y el botón deshabilitado), y forzar un error de guardado si aplica.
