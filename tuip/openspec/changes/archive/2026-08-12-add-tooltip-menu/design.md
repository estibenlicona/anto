## Context

Ver proposal.md - Why. `@radix-ui/react-tooltip` y `@radix-ui/react-dropdown-menu` son las piezas equivalentes a las que ya resuelven temporizador, posicionamiento, foco y teclado para el resto de los componentes con comportamiento no trivial del catálogo (`Select`, `Combobox`, `Switch`, `Tabs`, `Toast`). Ninguna de las dos primitivas está instalada todavía.

`apps/docs/src/data/navigation.ts` ya declara la etiqueta `overlays: "Superposiciones"` en `CATEGORY_LABELS`, sin que ningún componente del registro use esa categoría — la misma situación que tenía `layer.notification` antes de `Toast`.

## Goals / Non-Goals

**Goals:**
- `Tooltip` y `Menu` construidos sobre sus primitivas de Radix respectivas, reusando tokens ya validados en vez de declarar nuevos.
- Agregar `"overlays"` al tipo de categoría del registro, para que `Tooltip` y `Menu` (y lo que venga después con esta misma naturaleza) tengan un lugar propio en la navegación en vez de forzarse dentro de `feedback` o `actions`.

**Non-Goals:**
- Un `TooltipProvider` compartido para coordinar el retraso entre varios tooltips a la vez (la optimización que Radix ofrece para saltar el delay al moverse rápido entre tooltips adyacentes). La definición no pide ese comportamiento, y agregarlo obligaría a todo consumidor a montar un Provider extra para un componente que, a diferencia de Toast, no tiene ningún estado que deba compartirse entre instancias.
- Que `Menu` reordene sus ítems o inserte un separador automáticamente antes del primer ítem destructivo. La definición pide que lo destructivo vaya último y separado, pero `Menu` no sabe cuántos ítems tiene ni cuáles son sin iterarlos de una forma que lo volvería más rígido que simplemente componerlo en el orden correcto — se documenta como guía de uso, igual que la convención de alineación de `Table` o el umbral entre radios/Select/Combobox.
- Un componente `MenuTrigger` separado. El disparador es cualquier elemento que el consumidor ya tiene (típicamente un `Button` con ícono `more`); `Menu` lo recibe como `trigger`, siguiendo el mismo patrón que `Combobox` no reinventa su propio botón de apertura.

## Decisions

### `Tooltip` autocontenido, sin Provider que el consumidor deba montar

A diferencia de `Toast` (cuyo comportamiento — cola de uno, posición fija global — es necesariamente compartido entre todos los puntos de la app que lo disparan), el estado de un Tooltip es enteramente local a su propia instancia: abierto/cerrado y el temporizador de 500ms no se coordinan con ningún otro Tooltip de la pantalla para cumplir la definición. `Tooltip` monta su propio `Tooltip.Provider` internamente, así que se usa exactamente como `Alert` o `Badge` — un componente que se renderiza donde hace falta, sin un paso de integración previo.

### Retraso de 500ms al aparecer, sin retraso al desaparecer

Mapea directo al `delayDuration` (500) y `skipDelayDuration` que expone `@radix-ui/react-tooltip`; Radix ya resuelve por defecto que el cierre no tenga el mismo retraso que la apertura, así que no hace falta ninguna lógica propia — solo fijar el valor de apertura que pide la definición.

### Ancho máximo: valor arbitrario `max-w-[240px]`, no un paso de la escala

240px no coincide con ningún paso de la escala de anchos del sistema (los `maxWidth` documentados son por tipo de contenido de página, no para una burbuja de tooltip). Se usa como valor arbitrario en vez de forzar un paso cercano de la escala, porque la propia definición fija ese número como una regla de legibilidad (una frase corta, no un párrafo) y no como una medida decorativa aproximable.

### Estilo de Tooltip: mismo par `bg-neutral-bold` / `text-neutral-inverse` que Toast

El tooltip del mockup es oscuro sobre claro (`#17171B` / `#FAFAFA`), la misma superficie "siempre invertida respecto del canvas" que ya resolvió `Toast` reusando `background.neutral.bold` + `text.neutral.inverse` (validado en ese change: alto contraste en las dos direcciones de tema). Se reusa el mismo par en vez de recalcular la decisión desde cero.

### `Menu` como familia compuesta (`Menu`, `MenuItem`, `MenuSeparator`), no una prop `items`

Sigue el mismo patrón que ya establece `Table` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) para listas de partes heterogéneas: cada `MenuItem` es JSX normal, así que puede llevar ícono, texto, `onSelect` y la marca `destructive` sin que `Menu` necesite conocer la forma de un objeto de configuración. Una prop `items: MenuItemConfig[]` fue descartada por la misma razón que Table no tiene una prop `rows`.

### `MenuItem` destructivo: `text-danger-default`, sin fondo propio

El color del ítem destructivo en el mockup (`#700C13`) coincide exacto con `text-danger-default` (`p.danger[800]`), así que no hace falta ningún cálculo de contraste nuevo — ya está verificado por el resto del catálogo que lo usa (Alert, badges de estado). El divisor antes del ítem destructivo usa `border-neutral-default`, el mismo tono que ya separa filas en `Table` y segmentos en `SegmentedControl`, en vez del tono más claro que dibuja el mockup (`#EFEFF0`), para no introducir un segundo tono de divisor en el sistema.

### Nueva categoría de registro: `"overlays"`

Se agrega `"overlays"` a la unión de categorías de `ComponentDefinition` en `packages/components/registry/definitions.ts`. `apps/docs/src/data/navigation.ts` ya la declara en `CATEGORY_LABELS` como "Superposiciones"; el sidebar de la documentación agrupa por categoría automáticamente (`componentsByCategory()`), así que no hace falta ningún cambio ahí — alcanza con que el registro empiece a emitir componentes con esa categoría.

## Risks / Trade-offs

- [Sin Provider compartido, cada Tooltip monta su propia instancia de `Tooltip.Provider`] → Mitigación: es el mismo costo que ya paga cada `Select`/`Combobox` al montar su propio `Popover`/`Command`; no hay evidencia de que la definición necesite la optimización de delay compartido, y agregarla después (exportando un `TooltipProvider` opcional) no sería un cambio incompatible si hiciera falta más adelante.
- [El divisor de Menu usa un tono distinto al que dibuja el mockup] → Mitigación: decisión deliberada de consistencia con el resto del catálogo (ver Decisions), no un error — el propio mockup ya usa tonos ligeramente distintos de divisor en distintas secciones sin que eso implique una regla por componente.
