## Why

La pantalla de Personas hoy arranca directo en el toolbar y la tabla, sin ningún encabezado ni resumen. Un encabezado con título/descripción del módulo, el botón de alta reubicado, y 3 cards de resumen (personas activas, FTE disponible, distribución por seniority) le dan al Chapter Lead una vista general antes de entrar al detalle fila por fila.

## What Changes

- Se agrega un encabezado arriba del toolbar de Personas: título "Personas", descripción del módulo, y el botón de alta —renombrado a "Nueva persona"— a la derecha del título. Se quita la fila donde vive hoy el botón "Crear persona".
- Se agregan 3 cards de resumen debajo del encabezado, arriba del toolbar de búsqueda/filtros:
  - **Personas activas**: total de personas registradas + avatares de las primeras (con overflow "+N más"). Sin indicador de tendencia trimestral — no hay datos históricos para calcularlo.
  - **FTE disponible**: FTE disponible / capacidad objetivo, con barra de progreso mostrando el % de capacidad asignada.
  - **Distribución por seniority**: barra segmentada por categoría + total, con la cuenta de personas por cada uno de los 4 niveles de seniority. Originalmente se planeaban 2 cards separadas (seniority y nivel SFIA); el change `merge-seniority-and-sfia-level` fusionó ambos conceptos en un solo dato de 4 niveles, así que ahora es una sola card.
- Nuevo endpoint `GET /people/stats` que agrega estos datos sobre el total de personas registradas (no sobre la página/filtro actual de la tabla). El mock lo calcula de verdad sobre las personas en memoria; la capacidad objetivo (para FTE disponible) es un valor que el mock asume, ya que su cálculo real es responsabilidad del backend y queda fuera de alcance de este cambio (mismo tipo de brecha ya documentada para la paginación).
- **Alcance solo mock**: a diferencia del cambio de búsqueda/filtros, este `GET /people/stats` no se implementa en el backend .NET real en este cambio — el backend real queda como brecha documentada.
- **Dependencia en `tuip` (resuelta)**: la card de distribución necesita que `SegmentedBar` acepte colores categóricos (el mismo vocabulario de 6 tonos que ya usan `Tag`/`Avatar` — gris/verde/azul/ámbar/rojo/morado), no solo los 4 roles de estado que soportaba antes (info/warning/success/danger). El change `add-segmented-bar-categorical-color`, en el root de OpenSpec de `tuip`, ya se implementó y archivó, y el paquete se publicó localmente (`pnpm run publish:local`) — la dependencia ya no bloquea la tarea de esta card.
- **Ajuste de fidelidad con el mockup**: comparadas las cards implementadas contra el mockup HTML de referencia, se cierran las diferencias de presentación detectadas (peso visual de la métrica principal, alineación inferior de las cards, leyenda a dos columnas, total en el header de la card de distribución). Tres de esas diferencias viven en componentes/tokens de `tuip` (separación entre segmentos de `SegmentedBar`, relleno con degradado en `Progress`, y un token tipográfico para la métrica) y necesitan un change propio en ese root, todavía sin proponer, que debe ir primero.
- Fuera de alcance: buscador global, botón de exportar, y el breadcrumb de 3 niveles que también aparecen en la imagen de referencia — son cambios más grandes que afectan el layout compartido de todas las pantallas de Chapter Lead, no solo Personas.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: nuevo requisito de resumen/dashboard sobre el listado de Personas (encabezado + 4 cards de resumen).
- `api-mocking`: el handler de mock de personas expone además `GET /people/stats`.

## Impact

- Frontend: `PeopleContainer.tsx` (encabezado + cards nuevas), `PeopleList.tsx` (se quita la fila de "Crear persona"), nuevo `PersonStatsCards.tsx` (o similar), `personService.ts` (nuevo `getStats`), nuevo hook para consumir el stats endpoint.
- Mock: `people.handlers.ts` (nuevo handler `GET /people/stats`).
- Backend real: fuera de alcance, brecha documentada.
- `tuip`: `SegmentedBar` necesita soporte de color categórico — dependencia externa, change aparte en el root de tuip.
