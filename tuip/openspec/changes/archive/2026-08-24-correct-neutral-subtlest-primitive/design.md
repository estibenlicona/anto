## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- `packages/tokens/src/primitives.ts` es la única fuente de valores hex crudos; `semantic-colors.ts` sólo referencia pasos de esa escala, nunca un hex propio. Cambiar `neutral[25]` ahí cascada automáticamente a todo lo que lo referencia, sin tocar `semantic-colors.ts`.
- `neutral[25]` no sólo alimenta `background.neutral.subtlest` en modo claro (el que motivó este change, vía `modernize-table-suite`). En modo oscuro, el mismo primitivo alimenta dos tokens más: `text.neutral.default` (el texto principal, "nunca blanco puro") y `background.neutral.boldPressed` (el fondo presionado de la variante bold). Los tres cambian de valor exacto con esta corrección, aunque sólo uno motivó el pedido.
- `verify-tokens.ts` es la fuente de verdad para contraste, no el cálculo a mano — lección ya aplicada dos veces en `modernize-table-suite` (una vez detectó una falla real en modo oscuro).

## Goals / Non-Goals

**Goals:**
- Corregir el valor de `neutral[25]` sin que ningún consumidor —semántico o de componente— necesite saber que cambió.

**Non-Goals:**
- No se re-evalúa si `neutral[25]` es el primitivo correcto para cada uno de los tres tokens semánticos que lo usan hoy — eso es una decisión de asignación ya tomada en `semantic-colors.ts`, fuera del alcance de esta corrección de valor.

## Decisions

- **Se corrige el primitivo, no se agrega uno nuevo.** La escala `neutral` ya tiene un paso en esa posición (`25`); la diferencia entre `#FAFAFA` y `#FAFAFB` es de 1/255 en el canal azul, imperceptible — no hay ninguna razón de diseño para que convivan como dos pasos distintos de la misma escala. Corregir el valor existente es el cambio mínimo que refleja el dato correcto.
- **No se re-verifica el contraste a mano — se corre `verify-tokens.ts`.** Los tres consumidores de `neutral[25]` participan hoy en pares de contraste ya cubiertos por el script (`subtlest text on page background`, y los pares que usan `text.neutral.default`/`background.neutral.boldPressed` en oscuro). Un cambio de 1/255 no debería mover ningún resultado de forma perceptible, pero "no debería" no es el criterio de aceptación de este catálogo — correr el script sí lo es.

## Risks / Trade-offs

- [Un cambio de 1/255 puede parecer demasiado pequeño para justificar un change formal] → El valor incorrecto ya se documentó como una aproximación en `modernize-table-suite` ("prácticamente idéntico, 1/255 de diferencia"); dejarlo sin corregir perpetúa esa aproximación en la fuente de verdad en vez de en un comentario. El costo de corregirlo es mínimo (un valor, sin tokens ni componentes afectados en su propio código).
- [`neutral[25]` alimenta tres tokens semánticos, no sólo el que motivó el pedido — el cambio en modo oscuro (`text.neutral.default`, `background.neutral.boldPressed`) no fue pedido explícitamente] → Es la consecuencia esperada de la arquitectura de dos capas: corregir un primitivo corrige todo lo que deriva de él, en ambos modos. No aplicar la corrección de forma selectiva evitaría justamente la garantía que la arquitectura ofrece (un solo lugar de verdad); `verify-tokens.ts` cubre los tres pares antes de dar el cambio por bueno.
