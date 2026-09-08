## Why

Hoy "equipo" es un campo de texto libre de la célula (`Squad.Tribe` en el backend, `team: string` en el front): cada quien lo escribe a mano, y valores como "Ecosistema Digital" o "Ecosistema digital" conviven como cosas distintas. No hay una pantalla que diga qué equipos existen ni cuántas células tiene cada uno. El Chapter Lead necesita agrupar sus células en equipos reales —un equipo contiene varias células—, gestionarlos como una entidad propia y elegirlos de una lista al crear o editar una célula, no volver a tipearlos.

## What Changes

- **Nuevo módulo "Equipos"**: catálogo con el mismo estilo que Células — resumen con cards, listado paginado con búsqueda, alta y edición en panel lateral, eliminación con confirmación. Un equipo tiene nombre y descripción opcional, y agrupa cero o más células.
- **BREAKING: el campo `team` de célula deja de ser texto libre.** Pasa a ser una referencia a un equipo del catálogo nuevo (`teamId`, con `teamName` de sólo lectura para mostrar). El formulario de célula reemplaza el campo de texto "Equipo" por un selector de equipos existentes, con el mismo patrón que ya usa Criticidad.
- **No se puede eliminar un equipo que todavía tiene células**: el sistema lo impide y explica que hay que reasignar o eliminar esas células primero, mismo tratamiento que el catálogo de habilidades da a un valor en uso.
- Las 4 células sembradas mantienen su equipo actual, ahora contra el catálogo nuevo (Ecosistema Digital, Riesgo y Fraude, Pagos, Datos y Analítica).
- Nuevo permiso de sección `Capacidad.Equipos`, con su entrada en el menú del módulo dentro del grupo Capacidad (junto a Células y Personas): Equipos agrupa células, así que es parte de la gestión de capacidad y no una sección de Configuración. Lo tienen el Administrador, el Líder de Expertise y el Líder Técnico.
- **Backend .NET real incluido**: nueva entidad `Team` (con su tabla, migración de EF Core y endpoints `/teams`), y `Squad.Tribe` (texto libre) se reemplaza por `Squad.TeamId` (referencia a `Team`). El front sigue desarrollándose sobre MSW mientras tanto —cablearlo contra el backend real es un change `frontend-wire-*` aparte, como ya es la convención del repo (p. ej. `frontend-wire-admin-devops-sync`)—, pero el contrato y su implementación .NET quedan completos en este change, no diferidos.

## Capabilities

### New Capabilities
- `teams`: el catálogo de equipos — su CRUD, el resumen de cuántos hay y cuántas células agrupan, y la regla de que no se elimina un equipo con células asociadas.

### Modified Capabilities
- `squads`: el campo `team` pasa de texto libre a una referencia al catálogo de equipos; el formulario de alta/edición cambia el campo de texto por un selector, con las mismas reglas de obligatoriedad que tenía antes.

## Impact

**Frontend** (sigue sobre MSW; ver Non-Goals en `design.md`):
- **`frontend/src/features/teams/`** (nuevo): adapter, componentes (cards de resumen, listado, drawer de alta/edición, diálogo de eliminación), hooks y servicio — misma estructura que `features/squads/`.
- **`frontend/src/features/squads/`**: `squadService.ts` (`SquadDto.team: string` → `teamId: string` + `teamName: string`; `CreateSquadRequest`/`UpdateSquadRequest` con `teamId`), `SquadAdapter.ts`, `SquadFormDrawer.tsx` (texto → selector), `squadFormValidation.ts`, `SquadsList.tsx` (columna Equipo desde `teamName`).
- **`frontend/src/mocks/handlers/`**: nuevo `teams.handlers.ts` (CRUD + guard de eliminación) y ajuste de `squads.handlers.ts` para resolver `teamId`/`teamName` y migrar las 4 semillas.
- **`frontend/src/features/auth-session/capacityPermissions.ts`**: nuevo permiso `Equipos`.
- **`frontend/src/features/capacity-shell/navigation.ts`**: nueva entrada "Equipos" en el grupo Capacidad, antes de Células.
- **`frontend/src/module/routes.tsx`**: nueva ruta `equipos` detrás de `RequirePermission`.
- Tests nuevos para `teams` y ajustados en `squads` (formulario, adapter, mocks) por el cambio de `team` a `teamId`.

**Backend .NET** (Clean Architecture, calcado de Célula):
- **Domain**: `Entities/Team.cs` (Name, Description, `Rename`/`UpdateDescription`), `Events/TeamEvents.cs`; `Squad.cs` cambia `Tribe: string` por `TeamId: Guid`; `Interfaces/ITeamRepository.cs` y un método nuevo `ExistsByTeamIdAsync` en `ISquadRepository`.
- **Infrastructure**: `EntityConfigurations/TeamConfiguration.cs`, `Repositories/TeamRepository.cs`; ajuste de `SquadConfiguration.cs`/`SquadRepository.cs` por el cambio de `Tribe` a `TeamId`; una migración de EF Core nueva (`Teams` + `Squads.TeamId`); `DevelopmentDataSeeder.cs` siembra los 4 equipos y crea las células con `TeamId`.
- **Application**: `UseCases/Teams/{CreateTeam,UpdateTeam,DeleteTeam,GetTeams,GetTeamById}` (con el guard de eliminación por `ConflictException` → 409 si el equipo tiene células), `Mappings/TeamMappings.cs`, `DataTransferObjects/TeamDto.cs`; ajuste de los casos de uso de Squad que tocan `Tribe`.
- **WebApi**: `Endpoints/TeamsEndpoints.cs` (rutas `/teams`, mismo patrón que `SquadsEndpoints.cs`, se auto-registra por `IEndpointDefinition`).
- **Contrato y documentación**: `backend/oas.json` (paths y schemas de `/teams`, ajuste de `SquadDto`/`CreateSquadRequest`), `backend/ENDPOINTS.md` (nueva sección "Equipos", ajuste de la fila de Células).
- **Tests**: `tests/GestionCapacidad.WebApi.Tests/{Domain,Application,Infrastructure,Validators}` para Team, clonando la cobertura de Squad.
