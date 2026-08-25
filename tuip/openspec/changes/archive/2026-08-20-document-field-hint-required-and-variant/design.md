## Context

La documentación de un componente en este repo tiene dos mitades con orígenes distintos, y sólo una se mantiene sola:

- **Automática**: la tabla de props (`PropsTable`) se arma desde `registry.json`, que `generate:registry` produce leyendo el JSDoc del source de cada componente. Al agregar `hint`, `required`, `prefix`, `suffix` y `variant`, esa tabla quedó al día en el mismo build que los implementó, sin tocar nada de `apps/docs`.
- **Escrita a mano**: `apps/docs/src/content/<componente>.tsx` — cuándo usarlo, pares do/dont, anatomía (partes con sus tokens y estados renderizados), y la tabla de accesibilidad. Nada de esto se deriva del source, así que no se entera de un prop nuevo.

Esa asimetría es la que dejó el hueco que este change cierra. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Que las props nuevas se puedan entender sin abrir el código: cuándo usarlas, cómo se ven, y qué resuelven en accesibilidad.
- Corregir la anatomía de `SegmentedControl`, que describe mal el componente desde que existe `variant`.

**Non-Goals:**
- No se toca `packages/components`: los componentes ya están implementados, publicados y en uso. Este change documenta lo que existe; si al escribirlo apareciera un defecto de implementación, sale en un change propio.
- No se reescriben las secciones que ya estaban bien. Sólo se suma lo que las props nuevas requieren y se corrige lo que quedó falso.

## Decisions

- **Los estados nuevos de `Input` se fuerzan pasando props reales (`required`, `hint`, `suffix`, `error`), no simulando el aspecto con `className`.** Es la misma regla que ya sigue el resto de `AnatomyState` y está escrita en el tipo: *"The state is forced onto the real component through `className` / `disabled` rather than redrawn, so the illustration cannot drift from the implementation."* Un estado dibujado a mano deja de ser cierto en cuanto el componente cambia; uno que pasa la prop real no puede mentir.
- **`Select` se documenta con el mismo texto y las mismas partes que `Input` para `hint` y `required`.** La implementación ya comparte esa lógica en un módulo interno (`field.tsx`); si la documentación divergiera, sugeriría una diferencia de comportamiento que no existe. La única asimetría documentada es real y vale la pena señalarla: el trigger de `Select` es un `<button>`, así que no hay validación nativa que heredar ni siquiera en teoría.
- **La parte "Separador entre segmentos" se parte en dos en vez de generalizarse.** Alternativa considerada: una sola parte que describa ambas variantes en abstracto ("la caja está en el contenedor o en el segmento"). Se descarta porque las partes de la anatomía existen para anclar cada rasgo visible a su token (`border-l` vs `rounded-control + gap-1.5`), y una descripción que valga para las dos no ancla ninguno.
- **La corrección de `SegmentedControl` se trata como parte de este change y no como bug aparte.** El texto se volvió falso al agregarse `variant`, en el mismo change que agregó la prop; arrastrar la corrección a otro lado dejaría documentación incorrecta publicada mientras tanto, por una separación que no le sirve a nadie.

## Risks / Trade-offs

- [La mitad escrita a mano se puede volver a desincronizar en el próximo prop que se agregue: nada la obliga a seguir al source] → Sin mitigación estructural en este change (agregar esa verificación sería otro alcance: un chequeo que cruce props del registry contra menciones en el contenido). Queda anotado acá como el modo de falla conocido, que es exactamente el que este change tuvo que reparar a mano.
- [`apps/docs` no tiene tests: su única verificación automática es `tsc --noEmit`, que confirma que el contenido compila y que las props usadas en los ejemplos existen, pero no que lo que dice el texto sea cierto] → La revisión visual de las tres páginas es la verificación real, y por eso es una tarea explícita y no un paso implícito.
