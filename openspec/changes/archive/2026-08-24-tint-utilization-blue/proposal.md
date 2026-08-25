## Why

En Personas, la utilización de cada fila se pinta por severidad (verde / ámbar / rojo) y la card de stacks usa éxito / advertencia. El resto de la pantalla ya habla en la familia de azules (seniority en la escala de acento, BAU/Transformación en celeste y violeta); los verdes y ámbares quedan desencajados. Se adopta la opción A del canvas "Utilización en Azules", con los ajustes pedidos: **sólo azul sobre gris claro** en la utilización (sin umbrales) y **gris claro** para "sin respaldo" en la card de stacks, sin cambiar la anatomía de la card.

## What Changes

- **Utilización en el listado de Personas**: `Meter tone="blue"` — relleno en el azul de la escala de acento sobre la pista gris; sin `warningFrom`, el color no cambia al 85 % ni al 100 %; la cifra sigue siendo la señal numérica. (Requiere `add-accent-tone-to-progress` de tuip.)
- **Card "Stacks sin respaldo"**: el tramo con respaldo pasa de `role: success` a `tone: blue`; el tramo sin respaldo pasa de `role: warning` a `heat: low` (gris claro del sistema, con el aro en la leyenda para que no desaparezca). Misma cifra, misma lectura, misma leyenda en línea.
- El listado de Asignaciones, que también usa `Meter` con umbrales, **no cambia**: ahí la dedicación sí se lee como estado frente al tope (fuera de alcance salvo que se pida).

## Capabilities

### Modified Capabilities
- `people`: "Listar personas" (utilización como cantidad en acento, sin estado por umbral) y "Resumen del módulo de Personas" (card de stacks en azul / gris claro).

## Impact

- `features/people/components/PeopleList.tsx` (+ test del `meter`), `features/people/components/PeopleStatsCards.tsx` (+ test). Paquete de tuip reinstalado.
