# Backend: módulo Líneas de expertise al contrato

## Why

Décimo tercer ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Líneas de expertise está 0🟢 10🔴, pero no parte de cero: `Person` ya tiene `ChapterId` (nulo), `AssignToChapter`/`RemoveFromChapter` y `IPersonRepository.GetByChapterAsync` — construidos de antemano para este módulo, sólo sin el agregado `ExpertiseLine` que les da nombre, código, lead y estado. Es autocontenido: sin agregado externo por construir, sin integración externa — el candidato natural después de Torre de control.

## What Changes

- **Domain — agregado `ExpertiseLine`**: nombre (único entre las no archivadas, ≤100), código (único entre **todas**, incluidas archivadas, ≤10, normalizado a mayúsculas), descripción opcional (≤200), lead opcional (`Guid?`, sin FK — mismo patrón que `Allocation.SquadId`) y estado (`Active`/`Archived`). Nace activa, sin lead.
- **La pertenencia de una persona a una línea reutiliza `Person.ChapterId` tal cual existe hoy** — no se crea un campo ni una tabla puente nueva. `POST /expertise-lines/{id}/people` y `DELETE .../people/{personId}` llaman a `Person.AssignToChapter`/`RemoveFromChapter`, exactamente los métodos ya escritos; `PersonRepository.GetByChapterAsync` arma el listado de personas de una línea.
- **Designar lead incorpora a la persona a la línea**, moviéndola desde la que tuviera (`AssignToChapter` sencillamente reemplaza el `ChapterId` — "mover" no es una operación aparte). Si esa persona ya lideraba otra línea, esa otra línea pierde su lead en la misma operación — la pantalla ya impide elegir a alguien así, pero el servidor no confía en que el cliente lo respete.
- **Archivar exige cero personas** (400 si tiene) y **reactivar** vuelve la línea a activa — con cero personas por construcción, siempre sin lead. Igual que "cerrar dos veces" en otros agregados (`Assessment.Close`, `SprintSnapshot.Seal`), archivar una ya archivada o reactivar una activa es 400: el contrato no la enumera, pero el resto de agregados del backend sí trata la doble transición como error, y acá no hay motivo para tratarla distinto.
- **Quitar al lead de su propia línea es 400**: el contrato no enumera esta respuesta, pero el spec la pide explícita ("primero hay que designar otro lead o quitarle el rol"), y dejarla pasar en silencio dejaría una línea con lead fantasma (una persona que ya no pertenece a la línea que figura liderando).
- **La capacidad de una línea reutiliza `FteMath`**, igual que Torre de control y Células — mismas fórmulas, mismo criterio, ninguna cifra propia. A diferencia de Torre de control, acá el FTE libre **sí se acota a 0** (`freeFte = max(0, disponible − asignado)`) — literal del spec de esta capability, distinto del de Torre de control a propósito.
- **Endpoints del contrato**: `GET/POST /expertise-lines`, `GET/PUT /expertise-lines/{id}`, `POST .../archive`, `POST .../reactivate`, `PUT .../lead`, `POST .../people`, `DELETE .../people/{personId}`, `GET /expertise-lines/people` (roster: todas las personas con su línea o ninguna).
- Fuera de alcance: scope por chapter (claims), igual que el resto de los módulos — irónico acá porque la capability se llama justo así, pero es el mismo scope pendiente de siempre.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/expertise-lines/spec.md` ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregado `ExpertiseLine`, value object `ExpertiseLineStatus`, contrato de repositorio — sin tocar `Person`, que ya tiene todo lo que este módulo necesita), Application (`LineCapacityCalculator` sobre `FteMath`, DTOs del contrato, ocho use cases), Infrastructure (configuración EF, repositorio, migración de una tabla nueva, semillas), WebApi (`ExpertiseLinesEndpoints` y ejemplos Swagger).
- `backend/tests`: invariantes del agregado (nombre/código únicos según su alcance, código siempre en mayúsculas, archivar con personas lanza, reactivar exige estar archivada), el use case de cada 400/404, la transferencia de lead entre líneas, y la capacidad calculada con `freeFte` acotado a 0.
- `backend/ENDPOINTS.md`: Líneas de expertise hacia 10🟢, total actualizado.
- Sin cambios al contrato: `backend/oas.json` ya tiene las 10 rutas y sus esquemas.
- Migración nueva (tabla `ExpertiseLines`, vacía salvo semillas de desarrollo); ninguna migración sobre `People` — `ChapterId` ya existe.
