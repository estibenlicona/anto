## Why

En Células el resumen ocupa toda la primera pantalla y la tabla no se ve. Dos causas: las tres cards se apilan en una columna porque el `grid-cols-1` de tuip pisa el breakpoint (el mismo bug ya corregido en Personas e Iniciativas), y cada card gasta ~120 px en cifra + barra + leyenda en dos columnas + pie. Se adopta el diseño "Resumen de Células": el patrón de Personas (cifra titular + barra + leyenda en línea), tres en fila, y en la columna Capacidad del listado la barra con los tramos separados como en la card.

## What Changes

- **Grid**: sin `grid-cols-1`; `sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1.2fr]`.
- **Células**: `5` con "en N tribus"; leyenda en línea: `N sin equipo · N al tope`. El mock de stats de células gana `atCapacityCount` (células con equipo cuyo FTE asignado ≥ disponible).
- **Capacidad asignada** (`DistributionCard` con `headline`): `7,0` "de 17,8 FTE · 39 % del chapter"; barra con BAU (`tone: sky`), Transformación (`tone: violet`) y Libre (`heat: low`), leyenda en línea con las tres cifras. Sin `Progress` de marca ni pie.
- **Distribución por criticidad**: abre con `3` "de 5 en criticidad alta o crítica" (la lectura que era pie); barra y leyenda en línea con la misma escala de intensidad (`heat`) de hoy.
- **Columna Capacidad del listado**: `CapacityBar separated` (change `add-separated-to-capacity-bar` de tuip); cifras y leyenda iguales.

## Capabilities

### Modified Capabilities
- `squads`: "Resumen del módulo de Células" (anatomía de las tres cards, al tope en la leyenda) y "Listar células" (barra de capacidad separada).
- `api-mocking`: "Handler de mock para células" — el resumen incluye `atCapacityCount`.

## Impact

- `features/squads/components/SquadsStatsCards.tsx` (+ test), `SquadsList.tsx` (+ test), `services/squadService.ts` (`SquadsStats.atCapacityCount`), `mocks/handlers/squads.handlers.ts` (+ test).
