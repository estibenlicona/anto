## Context

Ver proposal.md - Why. `@radix-ui/react-dialog` es la primitiva que ya resuelve foco atrapado, Escape, retorno de foco al disparador y portal — el mismo tipo de problema que `@radix-ui/react-tooltip` y `@radix-ui/react-dropdown-menu` resolvieron para `Tooltip` y `Menu`. No hay una primitiva Radix separada para "drawer": Modal y Drawer son la misma primitiva (`Dialog`) con distinta posición y animación de su panel — el propio mockup lo trata como una sección compartida con una única regla de comportamiento para ambos.

`packages/tokens/src/layout.ts` ya declara `overlayWidth` (`modalSm/Md/Lg`, `drawerSm/Lg`, `popoverMin/Max`, `tooltip`) desde antes de este change, pero nunca se conectó al preset de Tailwind — hoy no existe ninguna clase `w-modal-sm` ni equivalente. `elevation.overlay` (`bg-neutral-default` + `shadow-lg`) y `layer.overlay` (z-index 400, por debajo de `layer.menu` en 600) están reservados de la misma forma en que `layer.notification` lo estuvo para `Toast` y la etiqueta `overlays` lo estuvo para `Tooltip`/`Menu`.

## Goals / Non-Goals

**Goals:**
- `Modal` y `Drawer` construidos sobre `@radix-ui/react-dialog`, compartiendo el mismo vocabulario compositivo que `Card` (`Header`/`Body`/`Footer`) para que quien ya conoce `Card` reconozca la forma de inmediato.
- Conectar `overlayWidth` al preset de Tailwind, para que `Modal`/`Drawer` (y cualquier componente futuro que necesite un ancho de superposición con nombre) dejen de tener que elegir entre un valor arbitrario o inventar una clase suelta.
- Que un `Select`/`Combobox` abierto desde dentro de un Modal o Drawer seguido funcione sin ajuste especial, apoyándose en que `layer.overlay` (400) ya está por debajo de `layer.menu` (600).

**Non-Goals:**
- Un gesto de arrastre para cerrar el Drawer en táctil (el patrón que resuelve una librería como Vaul). El mockup no lo pide, y agregar esa librería solo para un gesto no solicitado duplicaría lo que `@radix-ui/react-dialog` ya cubre para el resto del comportamiento.
- Impedir en código que un Modal abra otro Modal. La definición lo prohíbe como regla de uso — igual que Menu no reordena su ítem destructivo — pero Radix no ofrece (ni tiene sentido pedirle) una forma de "prohibir montar un segundo Dialog"; se documenta como guía de uso, no como una restricción en tiempo de ejecución.
- Retocar `Tooltip`, ya archivado, para que consuma `overlayWidth.tooltip` (240px) en vez de su `max-w-[240px]` arbitrario actual, aunque el valor coincide exacto. Es la misma cantidad, así que no hay ninguna diferencia observable; cambiarlo ahora sería tocar un componente fuera del alcance de este change para un renombre puramente interno. Si en algún momento se retoca `Tooltip` por otra razón, ese es el momento de migrarlo.
- Un `trigger` embebido en `Modal`/`Drawer` como el que tiene `Menu`. Ver Decisions.

## Decisions

### `Modal`/`Drawer` reciben `open`/`onOpenChange`, sin un prop `trigger` propio

A diferencia de `Menu` (donde el disparador siempre está pegado al menú, un botón "more" justo al lado), el caso de uso principal de `Modal` — confirmar una acción destructiva — casi nunca dispara desde un botón adyacente: dispara desde un `MenuItem.onSelect`, desde una fila de `Table`, o desde un flujo con un paso intermedio (una validación async antes de mostrar la confirmación). Forzar un prop `trigger` obligaría a artificios para esos casos. `Modal`/`Drawer` exponen `open`/`onOpenChange`/`defaultOpen`, el mismo shape que ya expone `Dialog.Root` de Radix, y el consumidor decide desde dónde dispara la apertura.

### Retorno de foco manual, porque no hay `Dialog.Trigger`

Radix solo restaura el foco al cerrar si hay un `Dialog.Trigger` — sin él (la decisión anterior), el foco cae a `document.body`, incumpliendo el requisito compartido de la definición. `Modal`/`Drawer` capturan `document.activeElement` en `onOpenAutoFocus` de `Dialog.Content` — que se dispara antes de que Radix mueva el foco hacia adentro, así que todavía apunta a quien disparó la apertura — y lo restauran a mano en `onCloseAutoFocus`, con `event.preventDefault()` para reemplazar el intento por defecto de Radix (que no tiene a quién restaurar). Se detectó verificando el comportamiento real con un clic (no con `element.click()` sintético, que no siempre mueve el foco igual que un clic real) antes de dar la tarea por completa.

### `ModalHeader`/`DrawerHeader` resuelven `Dialog.Title` y `Dialog.Close` internamente

Radix requiere un `Dialog.Title` accesible dentro de `Dialog.Content` — sin él, emite una advertencia en desarrollo porque un lector de pantalla no tendría qué anunciar al abrir. En vez de pedirle a cada consumidor que importe `Dialog.Title` aparte (como si fuera una pieza más), `ModalHeader`/`DrawerHeader` reciben un prop `title` y lo renderizan como `Dialog.Title` por dentro, junto con el botón de cerrar (`Dialog.Close asChild` + ícono `close`, el mismo que ya usa el chip de Combobox). Así el título accesible nunca puede faltar por descuido.

### Sin `Dialog.Description` obligatorio

El cuerpo de un Modal o Drawer no siempre es una frase descriptiva — en el mockup del Drawer es una lista de pares clave-valor, no un párrafo. Forzar un prop `description` para satisfacer `aria-describedby` sería inventar contenido que no siempre existe. `ModalBody`/`DrawerBody`, al montarse, pasan `aria-describedby={undefined}` a `Dialog.Content` — la forma que Radix documenta para declarar deliberadamente que no hay descripción, en vez de dejar que la advertencia de desarrollo quede sin resolver.

### `size` en vez de un valor fijo de 480px

`overlayWidth` ya nombra los pasos (`modalSm/Md/Lg` = 480/640/880px, `drawerSm/Lg` = 480/720px) — se activan en el preset de Tailwind como clases de ancho (`w-modal-sm`, etc.) y `Modal`/`Drawer` exponen un prop `size` que elige entre ellos, en vez de fijar el único valor que ilustra el mockup. Sigue el mismo criterio que `ComboboxSize`/`controlHeight`: cuando el sistema ya nombra los pasos, el componente los expone como variante en vez de improvisar un valor.

### Backdrop: `bg-neutral-bold/40`

El mockup no dibuja el fondo oscurecido (es una captura estática sin backdrop), así que no hay un hex de referencia. Se reusa `neutral.bold` — el mismo tono oscuro que ya validan `Toast` y `Tooltip` para una superficie siempre invertida — a una opacidad del 40%, en vez de declarar un color nuevo solo para el backdrop.

### `Drawer` nunca se desmonta detrás de la tabla

El requisito "cierre sin perder la posición de la tabla" (specs delta) se cumple porque `Drawer` no toca el DOM de lo que hay detrás — a diferencia de una navegación de página completa, la tabla nunca se desmonta mientras el Drawer está abierto o se cierra. Esto es una propiedad natural del propio Dialog (portal superpuesto, no reemplazo de ruta) y no requiere código adicional; se documenta como comportamiento verificable, no como una implementación aparte.

## Risks / Trade-offs

- [`overlayWidth` pasa de "declarado pero no usado" a expuesto en Tailwind, ampliando la superficie del preset] → Mitigación: es aditivo — ninguna clase existente cambia de valor, solo aparecen clases nuevas (`w-modal-sm`, etc.) que hoy no existen.
- [Sin trigger embebido, el consumidor es responsable de manejar su propio estado `open`] → Mitigación: es el mismo costo que ya paga quien usa `Dialog.Root` de Radix directamente; a cambio, `Modal`/`Drawer` funcionan igual de bien disparados desde un `MenuItem`, un botón adyacente, o un flujo async, sin un caso especial para ninguno.
