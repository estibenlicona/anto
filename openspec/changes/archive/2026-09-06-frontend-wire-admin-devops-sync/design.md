# Design

## Contexto

`AdminDevOpsPage.tsx` (`frontend/src/pages/AdminDevOpsPage`) es hoy 100% estático: `pipeline`, `conexion` y `jobStatus` son arreglos hardcodeados, y los dos botones (`Probar conexión`, `Ejecutar ingesta ahora`) están `disabled` sin `onClick`. El mecanismo de sincronización real ya existe y está probado en producción de código: `useDedicationSync()` (`frontend/src/features/dedication/hooks/useDedicationSync.ts`), usado hoy por el botón "Actualizar" de `DedicationContainer.tsx` y `CollaboratorDashboardContainer.tsx`. Llama a `dedicationService.syncAll()` → `POST /dedication/collaborators/sync`, que en el backend ya sincroniza sin pedir ningún secreto (ver `backend-modulo-azure-devops-sync`).

## Decisiones

1. **Reusar `useDedicationSync`, no crear un hook ni un servicio nuevo.** El botón "Ejecutar ingesta ahora" llama a `sync.syncAll()` exactamente igual que el botón "Actualizar" de Dedicación real — mismo endpoint, mismo contrato (`SyncResultDto { lastSyncedAt }`), mismo manejo de error. Que el botón viva en una pantalla distinta (Admin en vez de Dedicación) no cambia qué dispara ni qué endpoint llama.
2. **Patrón de UI idéntico al ya usado en `CollaboratorDashboardContainer`**: `sync.syncing` controla `isLoading`/el texto del botón ("Ejecutar ingesta ahora" → "Ejecutando…"); `sync.error` renderiza un `Alert variant="danger"` con acción "Reintentar"; el éxito dispara un `toast` ("Actualizado desde Azure DevOps") igual que en `DedicationContainer`.
3. **"Última ejecución" pasa a ser estado local, formateado con `syncedAtLabel`** (ya existente en `dedication/adapters/DedicationAdapter.ts`) — arranca en `null` (nunca sincronizado en esta sesión de la pantalla) y se actualiza con el `lastSyncedAt` real que devuelve `syncAll()`. El resto de `jobStatus` (próxima programada, tableros/work items/identidades espejados, novedades) sigue siendo dato de ejemplo — no hay ningún endpoint que los respalde y construirlo es una funcionalidad mucho mayor (espejo real de Azure DevOps), fuera de alcance.
4. **Se quita el campo "Secreto" de la tarjeta "Conexión", no se reemplaza por nada.** Los otros tres campos (Organización, Proyecto, Autenticación) siguen de solo lectura y sin cambios — no representan una credencial, sólo configuración descriptiva.
5. **"Probar conexión" queda fuera de alcance, se deja `disabled` tal cual.** No existe ninguna capacidad de backend para probarla y agregar una es un cambio distinto.
6. **`admin-shell/spec.md` se actualiza con una modificación de requisito**, no un requisito nuevo: el requisito "Pantallas placeholder de Admin" ya enumera excepciones a "sin llamadas a backend" (Sprints, bandas de talla, mix de capacidades); este cambio agrega la ingesta de DevOps a esa misma lista de excepciones, y ajusta el escenario "Ver el esqueleto de 'Conexión y job de ingesta'" para reflejar que el botón de ingesta ya no es puro marcador de posición.

## Plan de migración

Sin datos ni endpoints nuevos. Orden: `admin-shell/spec.md` (delta) → `AdminDevOpsPage.tsx` → `AdminDevOpsPage.test.tsx` → verificación (`pnpm test`, `pnpm build`) → smoke manual con `pnpm dev:mock` (el handler de `POST /dedication/collaborators/sync` ya existe en `src/mocks/handlers/dedication.handlers.ts`, no hace falta agregar ninguno). Rollback: revertir `AdminDevOpsPage.tsx` a su versión estática anterior.
