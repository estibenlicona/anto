# Tasks

## 1. Frontend

- [x] 1.1 `AdminDevOpsPage.tsx`: quitar el input "Secreto" de la tarjeta "Conexión" (quedan Organización, Proyecto, Autenticación).
- [x] 1.2 `AdminDevOpsPage.tsx`: importar `useDedicationSync` y `useToast`; estado local para "Última ejecución" (inicial: valor de ejemplo actual, `"Hoy 02:00 · OK"`, hasta la primera sincronización real de la sesión). El botón "Ejecutar ingesta ahora" deja de estar `disabled`, llama a `sync.syncAll()` al hacer clic:
  - mientras `sync.syncing`: `isLoading` en el botón, texto "Ejecutando…".
  - éxito: `toast` ("Actualizado desde Azure DevOps"), actualizar "Última ejecución" con `syncedAtLabel(result.lastSyncedAt)` (de `dedication/adapters/DedicationAdapter`).
  - error: `Alert variant="danger"` con `sync.error` y botón "Reintentar" (mismo patrón que `CollaboratorDashboardContainer`).
- [x] 1.3 "Probar conexión" permanece `disabled`, sin cambios.
- [x] 1.4 `AdminDevOpsPage.test.tsx`: actualizar los 3 tests existentes ("Probar conexión" sigue deshabilitado; "Ejecutar ingesta ahora" ya no lo está) y agregar: clic en "Ejecutar ingesta ahora" muestra estado de carga y luego actualiza "Última ejecución" (mock del endpoint vía MSW, reusando el handler ya existente en `src/mocks/handlers/dedication.handlers.ts`); un caso de error (handler que responde 502) muestra la alerta con "Reintentar".

## 2. Verificación y cierre

- [x] 2.1 `pnpm test` (o el runner de tests del frontend) sin errores.
- [x] 2.2 `pnpm build` sin errores de tipos.
- [x] 2.3 Smoke manual con `pnpm dev:mock`: navegar a Admin → Ingesta, quitar el foco del campo "Secreto" (ya no existe), hacer clic en "Ejecutar ingesta ahora" y confirmar que "Última ejecución" cambia con la hora real del mock.
