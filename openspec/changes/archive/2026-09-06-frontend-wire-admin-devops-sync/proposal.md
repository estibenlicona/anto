# Conectar el botón de ingesta de AdminDevOpsPage a la sincronización real

## Por qué

En la pantalla "Conexión y job de ingesta" de Administración (`AdminDevOpsPage`), el botón "Ejecutar ingesta ahora" es hoy un mockup deshabilitado, y la tarjeta "Conexión" muestra un campo "Secreto" enmascarado y de solo lectura. Se pidió revisar que el manejo de credenciales de Azure DevOps no viaje nunca por el frontend.

Investigación previa a este cambio: **ni el frontend, ni `backend/oas.json`, ni el backend .NET tienen hoy ningún campo, endpoint o DTO que reciba un PAT (Personal Access Token) por HTTP.** El PAT sólo existe del lado del backend (`AzureDevOpsOptions.Pat`, vía User Secrets en desarrollo; `DefaultAzureCredential`/Identidad Federada de Workload en producción — sin secreto alguno), construido en el cambio `backend-modulo-azure-devops-sync`. El campo "Secreto" de `AdminDevOpsPage` es un valor de ejemplo (`••••••••••••`), `readOnly` y `disabled` — nunca fue un formulario funcional (confirmado contra `openspec/specs/admin-shell/spec.md` y el historial de git).

Dado que la arquitectura ya cumple la regla ("toda la conexión a Azure DevOps la gestiona el backend"), este cambio hace dos ajustes concretos: (1) quita el campo "Secreto" de la UI para que ni siquiera visualmente sugiera que ahí se captura un PAT, y (2) activa el botón "Ejecutar ingesta ahora", reutilizando el mecanismo de sincronización que ya existe en el front (`useDedicationSync`, ya usado por el botón "Actualizar" de Dedicación real) en vez de construir uno nuevo.

## Qué cambia

- **`AdminDevOpsPage`**: se quita el input "Secreto" de la tarjeta "Conexión" (quedan Organización, Proyecto y Autenticación, todos de solo lectura, sin cambios). El botón "Ejecutar ingesta ahora" deja de estar deshabilitado y, al hacer clic, llama a `useDedicationSync().syncAll()` (mismo hook y mismo endpoint `POST /dedication/collaborators/sync` que ya usa el botón "Actualizar" de Dedicación real) — no se crea ningún endpoint, servicio ni contrato nuevo. Mientras la sincronización corre, el botón se deshabilita y muestra su estado de carga; al terminar, "Última ejecución" se actualiza con el `lastSyncedAt` real devuelto, o se muestra una alerta de error si falla (por ejemplo, 502 si Azure DevOps no respondió).
- El botón "Probar conexión" permanece deshabilitado — no existe ninguna capacidad de backend para probar la conexión, y no se agrega una en este cambio.
- Los contadores de espejo (tableros, work items, identidades espejadas, novedades de la última corrida) **permanecen como valores de ejemplo**: `SyncResultDto` sólo trae `lastSyncedAt`, y construir un espejo local real de boards/work items/identidades es una funcionalidad mucho mayor, fuera de alcance de este ajuste.
- `openspec/specs/admin-shell/spec.md`: se actualiza el requisito "Pantallas placeholder de Admin" para reflejar que la ingesta de DevOps deja de ser 100% marcador de posición.

## Fuera de alcance

- Backend y `backend/oas.json`: **no se tocan** — ya cumplen la regla de no exponer ningún PAT por HTTP; este cambio lo deja documentado, no lo modifica.
- El botón "Probar conexión".
- Cualquier espejo real de boards/work items/identidades de Azure DevOps en una base local — sigue siendo dato de ejemplo.
- Programar la ingesta diaria automática (el texto "diario 02:00" es descriptivo del proceso que en el futuro dispararía esto mismo, no algo que este cambio construya).

## Impacto

- `frontend/src/pages/AdminDevOpsPage/AdminDevOpsPage.tsx` y su test.
- `openspec/specs/admin-shell/spec.md`: una modificación de requisito.
- Sin cambios en `backend/` ni en `backend/oas.json`.
