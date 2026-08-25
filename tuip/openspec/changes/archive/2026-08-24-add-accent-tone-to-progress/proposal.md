## Why

`Progress` (y `Meter`, que lo envuelve) sólo sabe pintar por severidad —éxito hasta el umbral, advertencia, peligro— o con el degradado de marca. La app quiere mostrar la utilización de una persona como **cantidad**, no como estado: azul de la escala de acento sobre la pista gris, sin cambiar de color por umbral. Hoy eso no se puede pedir sin componer la barra a mano.

## What Changes

- `Progress` gana `tone?: AccentTone`: cuando está, el relleno usa el paso de relleno de ese matiz (`bg-accent-<tone>-fill`, el mismo que LevelMeter y SegmentedBar) y **no** aplica severidad ni umbral; la pista sigue siendo `bg-neutral-subtle`. `brandFill` y `tone` son excluyentes (`tone` manda si llegan ambos, documentado).
- `Meter` traslada `tone` a `Progress`; la cifra no cambia.
- Docs de Progress y Meter: cuándo usar `tone` (una cantidad que no afirma estado) frente a severidad (un nivel que sí lo afirma).

## Capabilities

### Modified Capabilities
- `component-library`: "Opciones del componente Progress" y "Opciones del componente Meter" (relleno por tono de acento).

## Impact

- `packages/components/src/{progress.tsx, meter.tsx}` + tests; `apps/docs/src/content/{progress,meter}.tsx`. Consumidor: frontend `tint-utilization-blue`.
