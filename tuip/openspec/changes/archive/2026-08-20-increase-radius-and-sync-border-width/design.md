## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- `packages/tokens/src/tokens.ts` define `radius = { none: "0px", control: "3px", surface: "6px", pill: "9999px" }`, con un docblock explícito: "Contained corners: heavy rounding reads as consumer software rather than as a tool. The difference in radius already hints at what is clickable." — una decisión de diseño deliberada de mantener el radio contenido y de conservar dos niveles distintos. Este change revierte la magnitud (valores más grandes) pero no la forma (sigue habiendo dos niveles, `control` más chico que `surface`) — la razón documentada para separar ambos ("la diferencia ya insinúa qué es clickeable") sigue aplicando a cualquier escala.
- `packages/tokens/src/border.ts` define `borderWidth = { default: "1px", bold: "2px" }`, ya cableado en el preset de Tailwind (`theme.extend.borderWidth = borderWidth`) — las clases `border-default`/`border-bold` ya existen y funcionan, sólo que ningún componente las escribe.
- El radio ya está 100% sincronizado hoy: cada uno de los ~75 usos de `rounded-*` en `packages/components/src` es `rounded-control`, `rounded-surface`, `rounded-pill`, `rounded-none` o una variante direccional (`rounded-r-control`, etc.) — cero valores nativos o arbitrarios. Este change no migra nada de radio, sólo cambia los dos valores en la fuente.
- El ancho de borde no está sincronizado: 31 archivos en `packages/components/src` usan la clase nativa `border` (1px, sin token) y 2 (`button.tsx`, `slider.tsx`) usan `border-2` (2px, sin token) nativo. Ninguno referencia `border-default`/`border-bold` por nombre.
- `apps/docs/src/content/fundamentos.tsx` ya renderiza tanto la escala de radio como la de ancho de borde iterando los objetos de tokens directamente (`Object.entries(radius)`, `Object.entries(borderWidth)`) — los valores nuevos se reflejan solos, sin editar la página.

## Goals / Non-Goals

**Goals:**
- Subir el radio de esquinas a una escala más marcada, sin romper la distinción de dos niveles que ya documenta el sistema.
- Cerrar el gap real de sincronización: que todo borde del catálogo pase por `border-default`/`border-bold`, no por la clase nativa del framework de estilos.

**Non-Goals:**
- No se agrega un tercer nivel de radio ni se cambia `pill`/`none`.
- No se cambian los valores de `border.width.default`/`border.width.bold` — sólo se sincroniza qué los consume.
- No se re-decide qué componentes deberían llevar `border-bold` en vez de `border-default` más allá de los dos casos que ya lo usan hoy (`button.tsx`, `slider.tsx`) — la migración es 1:1 sobre el ancho que cada uno ya tenía, no una revisión de qué debería destacarse más.

## Decisions

- **`radius.control` termina en 8px y `radius.surface` en 12px, después de cuatro pasos.** 6px/10px (el doble aproximado del valor original) → 8px/12px → 10px/14px — cada uno verificado visualmente contra la referencia antes del siguiente — y en el último paso, una vez visto 10px/14px aplicado, resultó demasiado marcado; se volvió a 8px/12px, el valor del segundo paso, que ya había quedado confirmado como el punto correcto. Mantiene la proporción relativa entre ambos pasos (control siempre menor que surface) en vez de igualarlos en un solo valor — la opción de un único radio compartido se descartó explícitamente porque colapsaría la distinción "un control se ve distinto de una tarjeta", que el propio código ya documenta como intencional.
- **La migración de ancho de borde es una búsqueda y reemplazo mecánica, no una revisión de diseño.** `border` (clase nativa de ancho, 1px) → `border-default` (mismo 1px, con nombre). `border-2` → `border-bold` (mismo 2px, con nombre). Ningún componente cambia de aspecto — sólo cambia qué clase produce ese mismo aspecto. Esto es deliberado: mezclar "sincronizar nombres" con "reconsiderar qué debería verse distinto" en el mismo change haría más difícil revisar cuál de los dos cambios rompió algo si algo se ve distinto.
- **El requisito "Ancho de borde" se extiende (no se reemplaza) para cubrir también el caso estándar, no sólo el destacado.** El texto original sólo obligaba a usar `border.width.bold` "en vez de un valor de píxeles hardcoded" — nunca mencionó `default`. Es la misma exigencia, aplicada al otro token de la misma pareja.
- **Se agrega un requisito nuevo para la escala de radio en vez de ampliar uno existente.** Hoy el radio sólo aparece nombrado de pasada, como una entrada dentro de la lista de categorías que cubre "Tokens definidos como fuente única" — no hay ningún requisito que documente sus pasos ni sus valores, a diferencia del ancho de borde, que ya tenía el suyo. Corregirlo ahora, en vez de dejarlo para un change futuro, evita que la escala nueva (8px/12px) quede sin ningún requisito que la respalde.

## Risks / Trade-offs

- [Subir el radio es breaking y sin opt-in, y afecta a todo el catálogo de una sola vez] → Es un cambio puramente visual (radio de esquinas), no de props ni de comportamiento — ningún consumidor existente rompe en tiempo de compilación, sólo cambia de aspecto. Mismo criterio ya aplicado a los cambios de color de fondo de `Table` en `modernize-table-suite`.
- [Reescalar sin agregar un tercer paso puede no alcanzar para casos futuros que necesiten algo entre `surface` (12px) y `pill` (círculo completo)] → No hay ningún caso así hoy en el catálogo; agregar un paso especulativo sin un consumidor real violaría el mismo criterio que ya aplican `spacing`/`typography` (escala cerrada, sin valores intermedios sin uso).
- [Subir el radio en varios pasos dentro del mismo change, en vez de acertar el valor final de una — el mismo patrón ya visto con el color de la cabecera de `Table` en `modernize-table-suite`] → Cada valor se verificó contra la referencia antes de aplicarlo, pero "más pronunciado" es un juicio visual que sólo se termina de calibrar viendo el resultado real en la app. El cuarto paso confirma esto: 10px/14px se había verificado visualmente y se veía bien en ese momento, pero una vez usado un rato en la app se sintió excesivo — el ida y vuelta terminó en el mismo valor del segundo paso (8px/12px), que en retrospectiva era el punto correcto.
- [La migración toca 31 archivos, un radio de cambio grande para un ajuste "sólo de nombre"] → Cada archivo cambia una palabra (`border`→`border-default` o `border-2`→`border-bold`), sin tocar ninguna otra clase — el riesgo de introducir un efecto visual no intencional es bajo, y se verifica con un build + revisión visual de la documentación, no archivo por archivo.
