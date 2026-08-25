## Why

Tras dos iteraciones sobre la card "Distribución por seniority" (el rediseño a filas con barras por nivel, y su compactación), el usuario pidió volver **al diseño inicial de las líneas** — la barra segmentada separada con su leyenda 2×2 — conservando lo que la iteración sí aportó: **la lectura rápida de cómo está el equipo a nivel general**, que son las dos cifras calculadas del pie ("X% en avanzado o superior" y "N requieren acompañamiento").

**Interpretación registrada** (el pedido fue breve): "el diseño anterior de las líneas / el diseño inicial" = la barra segmentada con segmentos separados y la leyenda de puntos con conteos, tal como existía antes del rediseño de hoy; "esa comparación donde sé cómo estamos a nivel general" = las dos lecturas del pie introducidas por el rediseño. Lo que se va con las filas: los descriptores por nivel, el eje numérico y los porcentajes por fila.

## What Changes

- **La card vuelve a su forma inicial**: encabezado, `SegmentedBar` con segmentos separados pintados con los tonos de acento, y la leyenda 2×2 (punto del color del nivel + nombre + conteo).
- **El pie con las dos lecturas se queda**: "X% en avanzado o superior" (niveles 3 y 4 sobre el total) y "N requieren acompañamiento" (nivel 1), separado por su filete — es el único elemento del rediseño que sobrevive, porque es el que responde "¿cómo estamos?" de un vistazo.
- **Se retiran** las filas por nivel, los descriptores, el eje numérico y los porcentajes por fila, junto con sus constantes y helpers (`SENIORITY_DESCRIPTORS`, `axisMaxFor`, `axisMarksFor`, la plantilla de grilla).
- **`SegmentedBar` recupera su consumidor**: la rama `tone` que `tuip` publicó para esta card vuelve a usarse.

### Fuera de alcance

- Las otras dos cards del resumen (conservan la densidad `gap-2` del change de compactación, que sigue vigente).
- `tuip`, el listado, datos y mocks.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: "Resumen del módulo de Personas" suma las dos lecturas calculadas del pie a la descripción vigente de la distribución (barra segmentada + leyenda), con sus dos escenarios (MODIFIED). **El delta se escribe directamente contra el spec principal**, que nunca recibió el texto de las filas: el rediseño (`redesign-seniority-distribution-card`) sigue sin archivar.

## Impact

- **Card**: `frontend/src/features/people/components/PeopleStatsCards.tsx` — la tercera card vuelve a la composición inicial más el pie; se recuperan `SegmentedBar` en imports y el mapeo de tonos.
- **Pruebas**: `PeopleStatsCards.test.tsx` se reescribe otra vez: leyenda con clases de acento por nivel, segmentos con `tone`, y las dos lecturas del pie. Caen las aserciones de filas, anchos y eje.
- **Archivado — decisión que este change fija**: los dos changes intermedios de hoy sobre esta card, `redesign-seniority-distribution-card` y `compact-people-stats-cards`, deben archivarse **sin sincronizar** su delta (el primero; el segundo es `skip_specs`): describen un estado intermedio que este change retira antes de que llegara al spec principal. Sincronizarlos y después sincronizar éste dejaría en el historial del spec un vaivén que ninguna versión publicada tuvo — y obligaría a heredar como inmortales los títulos de escenarios del eje, que el validador no deja retirar de un MODIFIED.
- **Sin impacto**: backend, mocks, catálogos, `tuip`.
