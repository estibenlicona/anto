## Why

En la pantalla de Personas, el mismo nivel de seniority viste dos colores distintos a centímetros de distancia. El listado pinta los niveles con la escala de acento del sistema de diseño (la que trae `SeniorityCard`); la card "Distribución por seniority" del encabezado pinta esos mismos niveles con otro vocabulario — colores categóricos en la barra (`gray`/`amber`/`blue`/`purple`) y clases semánticas `-bold` en los puntos de la leyenda. "Avanzado" es un color en la fila y otro en la card, y el lector tiene que descubrir dos códigos de color para un solo dato.

El sistema de diseño está resolviendo su parte en el change `swap-accent-teal-for-gold` del repositorio `tuip`: `SegmentedBar` gana el vocabulario de tonos de acento, y de paso el tercer matiz de la escala deja de ser turquesa y pasa a ser ocre dorado — decisión del usuario que aterriza en el listado sola, con la actualización del paquete. Este change es el lado de la app: la card adopta la escala.

## What Changes

- **La barra de distribución pinta sus segmentos con los tonos de acento**, usando el vocabulario nuevo de `SegmentedBar` (`tone`) en vez del categórico (`color`). El mapeo por nivel pasa a ser el de la escala: 1 → `slate`, 2 → `blue`, 3 → `gold`, 4 → `purple` — el mismo que `SeniorityCard` usa en el listado.
- **Los puntos de la leyenda toman el mismo paso de relleno** (`bg-accent-<matiz>-fill`) en vez de las clases semánticas `-bold`, de modo que punto, segmento y medidor del listado sean literalmente el mismo color.
- **Se actualiza la dependencia del sistema de diseño** al `.tgz` que trae el matiz dorado y la rama `tone` de `SegmentedBar`.
- **Cambio visual esperado sin tocar este repo**: al reinstalar, "Avanzado" pasa de turquesa a ocre dorado también en el listado — es el efecto pedido del change de `tuip`, no un daño colateral.

### Fuera de alcance

- La estructura de la card (título, contador, barra, leyenda 2×2) no cambia: la "mejora" pedida es la adopción de colores.
- Las otras dos cards del resumen (Personas activas, FTE disponible) no cambian.
- El filtro de Seniority del listado y cualquier dato, mock o contrato HTTP.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: el requisito "Resumen del módulo de Personas" suma que la distribución por seniority usa los mismos colores por nivel que el listado (MODIFIED). El delta se escribe sobre el texto del delta pendiente de `add-identity-avatar-colors`, que modifica el mismo requisito — mismo criterio de unión que ya usa `adopt-neutral-name-link-in-people` para "Listar personas".

## Impact

- **Dependencias**: `@tuya-ui/components` y `@tuya-ui/tokens` se reinstalan desde el `.tgz` regenerado por `swap-accent-teal-for-gold`. Sin ese change publicado, éste no puede aplicarse.
- **Card**: `frontend/src/features/people/components/PeopleStatsCards.tsx` — `SENIORITY_COLORS` pasa de colores categóricos a tonos de acento, `LEGEND_DOT_CLASSES` pasa de clases `-bold` semánticas a `bg-accent-<matiz>-fill`, y los segmentos de la barra pasan de `color` a `tone`. Las clases de acento ya viajan en el CSS compilado del paquete (las emiten `LevelMeter` y la rama nueva de `SegmentedBar`).
- **Pruebas**: no existe suite propia de `PeopleStatsCards`; `PeopleContainer.test.tsx` asserta el resumen por textos y no por colores. Se suma cobertura de la correspondencia de colores card–listado.
- **Sin impacto**: backend, mocks, catálogos, las otras dos cards, el listado (que cambia de color por la actualización del paquete, no por este repo).
- **Orden de archivado**: después de `add-identity-avatar-colors`, cuyo delta define el texto de "Resumen del módulo de Personas" sobre el que éste se escribe.
