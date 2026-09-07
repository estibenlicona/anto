# Backend: módulo Asignaciones completo al contrato

## Why

Tercer ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Asignaciones está 1🟢 3🟡: los cuatro endpoints existen pero el `AllocationDto` no trae los campos de persona que la fila del equipo muestra (`personPosition`, `personModality`, `personLevel/Label`, `personAvailablePercentage`), el listado por célula no acepta `search`/`level`, y la regla de unicidad es otra (hoy: única por persona+célula con tope 100% repartido; contrato: **una persona tiene una sola asignación**). Cerrarlo además le da datos reales a la `utilization` de Personas —hoy siempre 0 porque no hay asignaciones sembradas— y deja la materia prima para los agregados de Células, el siguiente módulo.

## What Changes

- **`AllocationDto` completo**: se agregan los cinco campos de persona derivados del maestro al responder (`personAvailablePercentage` = 100 − dedicación, porque una persona tiene una sola asignación; nunca negativo).
- **Regla de unicidad del contrato**: una persona con asignación no puede recibir otra (400 «ya está asignada a una célula»), en reemplazo del tope de 100% repartido entre células. La mezcla BAU + Transformación = dedicación ya la exige el dominio; los validadores la devuelven como 400.
- **`GET /squads/{squadId}/allocations`**: filtros `search` (nombre o cargo de la persona) y `level` (multivalor) + 404 si la célula no existe; el repositorio devuelve la persona completa (no sólo el nombre) para poder derivar los campos y filtrar.
- **`POST /squads/{squadId}/allocations`**: cuerpo del contrato (`personId` + 3 porcentajes; el `squadId` viaja en la ruta y la iniciativa nace nula).
- **`PUT /allocations/{id}`**: validaciones alineadas (dedicación 1–100, mezcla que cuadre) y respuesta con el DTO nuevo enriquecido.
- **Semillas**: las 5 células del mock (nombre, equipo, criticidad) y las 9 asignaciones (Backend Platform ×4, Canales ×2, Fraude ×1, Datos ×2; Pagos Instantáneos vacía a propósito), resueltas por nombre de persona. Con esto `GET /people` empieza a responder `utilization` real.
- Fuera de alcance: iniciativas (el `initiativeId/Name` sigue nulo hasta ese módulo), los agregados de Células (`memberCount`, `members`, FTEs — siguiente cambio), scope por chapter, y `GET /people/{personId}/allocations` (existe en .NET sin consumidor; no se toca).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract` y `backend/oas.json` ya exigen; el cambio declara `skip_specs`.)

## Impact

- `backend/src`: Application (`AllocationDto` + mappings con persona, requests/validadores, use cases GetBySquad/Create/Update), Infrastructure (repositorio: consulta por célula con persona completa y filtros; unicidad global por persona; seeder con células y asignaciones), WebApi (binding de filtros y cuerpo del contrato, ejemplos Swagger). Domain no cambia (la regla de mezcla ya vive ahí).
- `backend/tests`: use cases de asignaciones (unicidad global, mezcla, filtros, DTO enriquecido) y factories.
- `backend/ENDPOINTS.md` (Asignaciones hacia 4🟢). `backend/oas.json` no cambia.
- **BREAKING pre-productivo**: deja de aceptarse una segunda asignación para la misma persona aunque la suma no pase de 100; `CreateAllocationRequest` pierde `SquadId`/`InitiativeId` del cuerpo.
