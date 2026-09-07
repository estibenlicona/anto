# Backend: módulo Torre de control al contrato

## Why

Duodécimo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Torre de control está 0🟢 1🔴: es la pantalla de inicio del Chapter Lead y depende de un solo endpoint de lectura agregada — el resto de la capability (asignar, reasignar) ya lo cubren los endpoints de Asignaciones, ya 🟢. Es el módulo más pequeño que queda: sin agregado nuevo, sin migración, reutilizando por completo `SquadAggregates`/`FteMath` (Células) y el maestro de Personas.

## What Changes

- **Un solo endpoint, sin persistencia nueva**: `GET /chapter/capacity-overview` responde `CapacityOverviewDto` calculado en cada petición sobre las personas, células y asignaciones vigentes — igual que Células, sin guardar nada propio.
- **`FteMath` se reutiliza tal cual**: el propio comentario del helper ya anticipaba este módulo ("la Torre de control... responderá la misma pregunta"). El FTE del chapter, el asignado a BAU y a Transformación salen de las mismas fórmulas asimétricas que ya usa Células (el asignado suma `dedicación/100` sin mirar el `availableFte` de la persona; el disponible sí lo suma) — no se reinterpretan.
- **Personas con margen**: una persona tiene margen sin célula o con dedicación menor al 100 %; las al 100 % no aparecen en la lista. Orden: primero sin célula, luego por margen descendente.
- **Células, todas, ordenadas por necesidad**: sin equipo primero, luego al tope (asignado ≥ disponible del equipo), luego el resto por menor margen — reutilizando `SquadAggregates.Build` para cada una, igual que ya hace Células.
- **Sin filtros ni paginación**: el contrato no los declara — es una vista de resumen, no un listado paginado.
- Fuera de alcance: el drawer de reasignación en sí (aplica sobre los endpoints de Asignaciones, ya 🟢) y el scope por chapter (claims), igual que el resto de los módulos.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/control-tower/spec.md` ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Application (`ChapterCapacityOverviewCalculator` sobre `SquadAggregates`/`FteMath`, DTOs del contrato, un use case), WebApi (`ControlTowerEndpoints` y ejemplos Swagger). Sin cambios en Domain ni en Infrastructure — no hay agregado nuevo ni migración.
- `backend/tests`: los umbrales de margen y "al tope", el orden de personas y de células, y los casos vacíos (chapter sin personas, nadie con margen, todas las células con equipo).
- `backend/ENDPOINTS.md`: Torre de control hacia 1🟢, total actualizado.
- Sin cambios al contrato: `backend/oas.json` ya tiene la ruta y su esquema.
- Sin migración: no hay tabla nueva.
