## Why

La matriz del span funciona pero no cabe: cada columna mide lo que mide el nombre completo de su habilidad y la celda lleva un medidor de 48 px, así que con nueve habilidades pide 1260 px y hay que desplazarla a lo ancho. Con doce ya no entra en ninguna pantalla, y la contra conocida de esta lectura —que escala mal a lo ancho— se cumplió antes de lo previsto.

El diseño aprobado (canvas "Mapa de calor del span") la convierte en un mapa: **el color deja de decir el nivel y pasa a decir cuánto le falta a esa persona para lo que su rol le pide**, y todo lo demás pasa a un detalle que se abre al hacer clic en la celda. Con eso las nueve habilidades entran en 270 px y la matriz completa cabe sin desplazarse.

## What Changes

- **La celda pasa a ser un cuadro de color**: sin medidor, sin número y sin marca. El color sale de una escala de atención de tres pasos según cuántos niveles falten, y los tres estados que no son brecha —al nivel, sin nivel exigido, sin evaluar— se distinguen entre sí con la familia neutra.
- **Detalle al hacer clic**: un popover sobre la celda con quién es, cuándo se evaluó, el nivel alcanzado contra el que su rol pide, los criterios exactos que le faltan, **cuántas personas más del span tienen brecha en esa misma habilidad**, y qué acción del plan hay sobre esa brecha si la hay. Desde ahí se llega al plan de la persona y al detalle de la habilidad.
- **El nivel deja de leerse en la matriz** y se lee en el popover. Es el precio explícito del cambio: la matriz responde una sola pregunta —dónde enfocarse— en lugar de tres a medias.
- Se conservan sin cambios el acotado por grupo, el orden por brechas, los totales por fila y por columna, el conteo de pendientes de evaluar y el panel por habilidad.

### Fuera de alcance

- Cambiar qué es una fila: sigue siendo una persona.
- El plan individual y la evaluación.
- Un color para "está por encima de lo que su rol pide": el dato queda en el popover, no en el mapa.

## Capabilities

### Modified Capabilities

- `career-plan`: cambia cómo se representa una celda de la matriz y qué muestra al activarla; los totales, el acotado, el orden y el panel por habilidad se mantienen.

## Impact

- Frontend: `src/features/career-plan` — la celda, la tabla y el contenedor de la matriz; adapter con el paso de atención por celda y el conteo por columna que el popover necesita.
- Datos: ninguno nuevo. El popover se arma con lo que el snapshot del span y las evaluaciones cerradas ya exponen.
- **tuip**: depende de `add-heatmap-primitives` (escala de atención, `PopoverAnchor`, `LevelMeter` con umbral). Ese change debe estar publicado y reinstalado en la app antes de aplicar éste.
- **Orden**: después de `add-span-skill-matrix`, cuya capacidad `career-plan` este change modifica.
