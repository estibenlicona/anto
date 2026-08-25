## Why

En el listado de Células la columna Capacidad es texto plano ("2.7 FTE / BAU 1.7 · Transf. 1.0"): dice cuánto hay asignado pero no cuánto falta ni cómo se reparte, y obliga a leer número por número para comparar filas. La card "Distribución por criticidad", además, pinta "Baja" con el gris casi negro del rol neutro, que domina visualmente la barra. El mockup aprobado (artifact "Listado de Células", artboard principal) resuelve ambas cosas.

## What Changes

- **Columna Capacidad gráfica** por fila: `FTE asignado / FTE disponible del equipo` con el porcentaje de ocupación coloreado por estado (éxito por debajo de 100, advertencia en rango alto, peligro "Al tope" al 100 %), una barra apilada BAU + Transformación sobre el FTE disponible del equipo (tonos de acento slate/blue, los mismos que el detalle de la célula), una leyenda compacta con las cifras y la lectura "N libre". Una célula sin equipo muestra `0.0 FTE`, la barra vacía y "Sin capacidad asignada".
- **Nueva paleta de la card de distribución por criticidad**: escala de calor sobre la marca — Crítica en peligro intenso, Alta en rojo de marca, Media en rojo de marca atenuado, Baja en el gris de borde neutro — tanto en los segmentos como en los puntos de la leyenda; y un pie con la lectura "N de M células en criticidad alta o crítica". Los badges de criticidad del listado y del detalle **no cambian** (siguen con los roles semánticos): la card deja de compartir color con el badge a propósito, es una escala de intensidad, no un estado por fila.
- **Contrato (sólo mock)**: `SquadDto` gana `teamAvailableFte` (Σ `availableFte` de las personas asignadas a la célula), para que la fila pueda mostrar ocupación y libre sin otra llamada. El backend real sigue como brecha documentada.

### Supuestos registrados

- Se implementa el artboard principal (A). Las alternativas del canvas (paleta B semántica suavizada, paleta C ordinal, anillo) quedan descartadas.
- Umbrales del porcentaje de ocupación: `< 85` éxito, `85–99` advertencia, `≥ 100` peligro con la palabra "Al tope" en lugar de "N libre". Son los umbrales del mockup; si se quiere otro corte se ajusta una constante.
- "Media" usa el rojo de marca al 45 % de opacidad sobre blanco, porque `tuip` no tiene un paso intermedio de la escala de marca; se documenta como candidato a token.

### Fuera de alcance

- Cambiar los colores de los badges de criticidad o de la card de distribución del detalle de célula.
- Backend real y `tuip`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `squads`: "Listar células" cambia la columna Capacidad (barra apilada, ocupación y libre); "Resumen del módulo de Células" cambia la paleta de la card de distribución (escala de intensidad propia, ya no el rol del badge) y suma la lectura de alta/crítica.
- `api-mocking`: el handler de células devuelve `teamAvailableFte` por célula.

## Impact

- **Frontend**: `squadService.ts` (`SquadDto.teamAvailableFte`), `SquadAdapter.ts`, `SquadsList.tsx` (celda Capacidad), nuevo `components/capacity.ts` (umbral → rol, exportado para tests), `SquadsStatsCards.tsx` (barra local con la nueva paleta, pie nuevo), `SquadDetailContainer`/`SquadTeamStatsCards` sin cambios.
- **Mocks**: `squads.handlers.ts` (`enrich` suma el `availableFte` de las personas asignadas).
- **Pruebas**: `SquadsList.test`, `SquadsStatsCards.test`, `squads.handler.test`, `SquadAdapter.test`, fixtures que construyen `SquadDto`/`Squad`.
- **Sin impacto**: detalle de célula, `tuip`, backend real.
