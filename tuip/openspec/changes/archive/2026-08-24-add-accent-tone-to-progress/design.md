## Decisions

1. `tone` reutiliza `accentToneClasses` de `progress.tsx` (ya existe para SegmentedBar): misma clase que el medidor de seniority, así la barra de utilización y los medidores de la misma fila comparten paleta por construcción.
2. Con `tone`, `warningFrom` se ignora: una cantidad en acento no afirma estado; si un consumidor quiere umbrales, no pasa `tone`. Se documenta en el prop, no se lanza.
3. La pista no cambia (`bg-neutral-subtle`): es el "gris claro" pedido y el que ya usan todas las barras.
