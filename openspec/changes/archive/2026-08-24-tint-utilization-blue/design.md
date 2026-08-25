## Decisions

1. `Meter tone="blue"` y sin `warningFrom`: el usuario eligió que la utilización no cambie de color por umbral; queda como cantidad. El valor > 100 se sigue mostrando en la cifra (Progress satura el ancho, no el color).
2. Stacks: `tone: "blue"` + `heat: "low"` en la misma `SegmentedBar`. Cada segmento declara su propio vocabulario (lo permite el tipo) y `heat: low` ya es el gris claro con aro en la leyenda que DistributionCard contempla; no se inventa un gris.
3. `AllocationsList` conserva severidad: la dedicación sobre el tope sí es un estado. Si se quiere unificar, es otro change.
