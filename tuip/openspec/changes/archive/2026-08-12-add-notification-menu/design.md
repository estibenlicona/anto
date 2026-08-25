## Context

Ver proposal.md - Why. La sección fuente (`design-system/Componentes Compuestos Tuya.dc.html:494-521`, datos en `:608-613`) es la primera de esta serie escrita como plantilla sobre datos en vez de marcado estático repetido — lo que de hecho la vuelve más confiable, no menos: los cuatro colores de punto y los dos colores de texto de acción no son literales sueltos en el markup, son valores de un arreglo, y calzan exacto contra primitivos ya nombrados:

| Elemento | Valor en la fuente | Primitivo | Token que lo resuelve |
|---|---|---|---|
| Punto, notificación crítica | `#8E0F18` | `p.danger[600]` | `bg-danger-bold` |
| Punto, notificación de aprobación | `#8A5A00` | `p.warning[600]` | `bg-warning-bold` |
| Punto, notificación informativa | `#C9C9CE` | `p.neutral[300]` | ver Decisions — no se usa tal cual |
| "Marcar todas leídas" / "Ver todas" | `#C9151F` | `p.brand[600]` | `text-brand-default` — el propio código fuente de los tokens ya comenta por qué: *"Red text on white takes the deeper step; 500 does not hold contrast"* |
| Fondo de fila no leída | `#FFFFFF` | `p.neutral[0]` | `bg-neutral-default` |
| Fondo de fila leída | `#FAFAFA` | `p.neutral[25]` | `bg-neutral-subtlest` |
| Divisor entre filas | `#EFEFF0` | `p.neutral[100]` | ver Decisions — no se usa tal cual |
| Divisor bajo el encabezado | `#E3E3E6` | `p.neutral[200]` | `border-neutral-default` |

El punto informativo (`#C9C9CE`, `neutral[300]`) no coincide con el que ya usa `ActivityTimeline` para su propio punto neutral (`text-neutral-subtle`, que resuelve a `neutral[600]`) — y tampoco con el que la sección de `ActivityTimeline` en este mismo archivo usa para el suyo (`#8B8B93`, que no coincide con ningún paso exacto de la escala). La fuente, en dos secciones distintas, usa dos grises distintos para el mismo concepto. Eso importa para la decisión de qué gris reusar acá — ver Decisions.

## Goals / Non-Goals

**Goals:**
- Un panel construido sobre la misma primitiva que ya resolvió `Menu` (`@radix-ui/react-dropdown-menu`), sin duplicar la lógica de ancla, teclado y cierre.
- Que el estado leído/no leído sea una sola prop booleana, no dos props que puedan quedar desincronizadas.

**Non-Goals:**
- Envolver o reutilizar `Menu`/`MenuItem` directamente. Ver Decisions — mismo criterio que ya separó `Modal` de `Drawer` a pesar de compartir primitiva.
- Un contador de no leídas sobre el disparador (el clásico punto rojo sobre una campana). La sección de la fuente muestra el panel ya abierto, nunca el disparador cerrado — no hay nada que copiar, y el disparador es un nodo opaco que el consumidor aporta, igual que en `Menu`.
- Que `NotificationMenu` filtre o valide que sus notificaciones sean "accionables". La regla de contenido de la definición ("solo eventos sobre los que la persona puede actuar") es una guía editorial para quien arma el panel, no algo que el componente pueda verificar — ninguna otra guía de contenido de esta serie (el orden del ítem destructivo de Menu, la cantidad de pestañas de Tabs) se hizo cumplir en código tampoco.
- Truncar automáticamente a 5 notificaciones. "máx. 5 visibles" describe cuántas entran sin scroll en el alto del panel, no un límite de cuántas puede recibir — ver Decisions.

## Decisions

### Primitiva compartida con `Menu`, componente propio — mismo criterio que `Modal`/`Drawer`

El contenido de una notificación (punto + título + detalle + hora, con dos señales de leído/no-leído) no entra en la fila de una sola línea que `MenuItem` ya resuelve. En vez de forzar ese contenido dentro de `MenuItem` o de bifurcar su implementación con props condicionales, `NotificationMenu` se construye sobre `@radix-ui/react-dropdown-menu` de forma independiente — la misma relación que ya tienen `Modal` y `Drawer` con `@radix-ui/react-dialog`: mismo primitivo, comportamiento de foco/teclado/cierre heredado gratis, cero código nuevo para eso, pero archivos y componentes propios porque la forma del contenido difiere lo suficiente.

### `unread` como una sola prop, deriva fondo y peso juntos

La fuente cambia `bg` y `weight` siempre a la vez — nunca aparece una combinación de fondo no-leído con peso regular, o viceversa. Exponerlos como dos props separadas permitiría una combinación que la propia fuente nunca contempla. `NotificationMenuItem` recibe `unread?: boolean` y resuelve ambas señales internamente: `true` → `bg-neutral-default` + `font-semibold`; `false` (default) → `bg-neutral-subtlest`, peso regular.

### Punto neutral: se alinea con `ActivityTimeline`, no con el gris propio de esta sección

Ver Context — la fuente no es consistente consigo misma para este gris entre sus dos secciones (`#C9C9CE` acá, `#8B8B93` en Activity timeline, ninguno de los dos calzando exacto con el mismo paso). Ante esa inconsistencia de origen, se prioriza la consistencia dentro del catálogo: el punto `neutral` de `NotificationMenuItem` reusa exacto la misma resolución que ya fijó `ActivityTimelineItem` (`bg-current text-neutral-subtle`) — dos componentes con puntos de color debieran verse iguales entre sí antes que perseguir cada uno el gris ligeramente distinto de su propia sección de origen.

### Divisor de fila: `border-neutral-default`, no el `#EFEFF0` literal de la fuente

Mismo caso ya resuelto para el divisor de `MenuSeparator`: la fuente dibuja un tono más claro (`neutral[100]`) que el que ya separa filas en `Table` y ahora también notificaciones en este panel si se sigue el criterio general (`neutral[200]`, `border-neutral-default`). Se prioriza el tono ya establecido como el divisor estándar del catálogo por la misma razón documentada entonces: no introducir un segundo tono de divisor en el sistema.

### Capa `z-menu` y `shadow-md`, no `z-overlay`/`shadow-lg`

La fuente presenta el panel sobre un fondo oscuro (`#26262C`) con una sombra dramática (`0 16px 40px rgba(0,0,0,.35)`) — puesta en escena del propio mockup para mostrar un panel flotante fuera de contexto, no evidencia de que este componente necesite una elevación mayor a la ya establecida. Funcionalmente, `NotificationMenu` es un dropdown anclado sin telón de fondo que bloquee la página — la misma familia que `Menu`, `Select` y `Combobox`, todos en `z-menu` con `shadow-md`. Se lo trata igual: ni la capa ni la sombra de `Modal`/`Drawer` (que sí bloquean la página) le corresponden.

### Ancho fijo 380px, sin variante de tamaño

A diferencia de `Modal`/`Drawer` (que sí exponen `size` porque `overlayWidth` ya nombra varios pasos para modales y drawers), la fuente no sugiere que un panel de notificaciones necesite más de un ancho — no hay `overlayWidth.notification*` para elegir entre. Se usa `w-[380px]` como valor arbitrario documentado, mismo criterio que el ancho de `Menu` (220px) o el `max-width` de `Tooltip` (240px): la fuente fija ese número exacto y no hay paso de escala equivalente.

Por el mismo criterio quedan como arbitrarios otros dos valores exactos de la fuente sin paso de escala equivalente: el padding horizontal de cada fila (`18px` — entre `px-4` y `px-5` por igual, sin un paso intermedio) y el diámetro del punto (`7px` — más chico que `w-2`, sin un paso entre `w-1.5` y `w-2`). El grid de dos columnas de cada fila (`8px 1fr`) también es arbitrario por necesidad, no por falta de paso: Tailwind no tiene una utilidad `grid-cols-*` para "una columna fija más una flexible", con o sin token de por medio. El padding vertical (`14px`), en cambio, sí calza con un paso ya existente — `py-3.5` — y no es arbitrario.

### Alto máximo con scroll, no un límite de cantidad — en una quinta pieza, `NotificationMenuList`

"máx. 5 visibles" describe cuánto entra en el panel sin desplazarse, no cuántas notificaciones puede recibir el componente. El `max-h-[500px] overflow-y-auto` — un valor arbitrario que aproxima cinco filas de alto típico, documentado como tal — no puede vivir en `NotificationMenu` mismo: ahí adentro scrollearía también el header y el footer, que la fuente muestra siempre fijos. Hace falta una pieza que envuelva solo las notificaciones — `NotificationMenuList` — el mismo lugar que ocupan `CardBody`, `ModalBody` y `DrawerBody` en sus respectivas familias. La familia queda entonces en cinco piezas (`NotificationMenu`, `NotificationMenuHeader`, `NotificationMenuList`, `NotificationMenuItem`, `NotificationMenuFooter`), no cuatro.

### `NotificationMenuHeader`/`NotificationMenuFooter` con acción opcional

`action` en el header (p. ej. "Marcar todas leídas") y el footer completo ("Ver todas") son opcionales: un panel sin backend de leído/no-leído no necesita la acción de marcar todo, y no todo consumidor necesita un enlace a un historial completo. Ambos, cuando están presentes, se resuelven como `DropdownMenu.Item` — participan de la misma navegación por flechas que las notificaciones, porque son igual de accionables.

## Risks / Trade-offs

- **El punto neutral no coincide con el gris literal de esta sección de la fuente** → Mitigación: coincide exacto con el que ya usa `ActivityTimeline`, y la fuente misma no es internamente consistente en ese gris entre sus propias dos secciones — ver Context. La consistencia entre componentes del catálogo pesa más que perseguir un valor que ni la fuente sostiene de forma pareja.
- **`max-h-[500px]` es una aproximación, no una medida exacta de "5 filas"** → Mitigación: el alto real de una fila varía con el largo del detalle, así que ninguna medida fija sería exacta para todo contenido; 500px se documenta como aproximación deliberada, no como el cálculo preciso de cinco filas de un contenido específico.
