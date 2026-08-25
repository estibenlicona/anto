## Why

El catálogo sabe dibujar cuánto —`Progress`, `Meter`, `SegmentedBar`, `CapacityBar`— pero no sabe dibujar **cómo viene cambiando**. Una card de resumen que dice "−6 brechas" contra el ciclo anterior no distingue una caída sostenida de un rebote después de dos semestres en subida, y esa diferencia es justamente la que hace que la cifra signifique algo.

El caso concreto: la pantalla de Competencias de la aplicación de gestión de capacidad tiene un indicador de variación contra el ciclo anterior con la serie de los últimos ciclos. Hoy no hay con qué dibujarla. `Meter` y `Progress` describen un valor, y `SegmentedBar` reparte un total entre categorías en una barra horizontal: ninguno es una serie.

Es un vacío del catálogo, no un pedido de esa pantalla. Cualquier card de resumen que compare contra un período anterior se choca con lo mismo.

## What Changes

- **Un componente `Sparkline`**: una serie de valores como barras verticales, del más viejo al más reciente, dentro de un alto fijo y sin ejes, cifras ni cuadrícula. Se lee como forma, no como tabla.
- **El último punto es el presente y se distingue de los demás**, porque toda serie de esta clase se lee desde el ahora hacia atrás.
- **El significado del color lo pone quien la usa**: la serie no sabe si bajar es bueno. El componente ofrece el tono; la lectura es del consumidor.
- **Un valor en cero se sigue viendo**: una barra que desaparece se lee como un dato que falta, no como un cero.

### Fuera de alcance

- Líneas, áreas, puntos o cualquier otra forma de serie: se agregan si aparece el caso.
- Ejes, cuadrícula, leyenda o etiquetas de valor: eso ya no es un sparkline, es un gráfico.
- Interacción: no es un control.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo suma un componente para leer la evolución de una serie corta, con sus opciones públicas documentadas.

## Impact

- `packages/components/src/sparkline.tsx` y su prueba; export en `src/index.ts`.
- `packages/components/registry/definitions.ts` — la entrada del componente.
- `apps/docs` — su módulo de contenido, un ejemplo y el índice.
- Consumidor: la aplicación de gestión de capacidad lo usa en la card de variación de Competencias, después de empacar y reinstalar.
