## Why

El diseño aprobado del módulo de Backlog de la app de Gestión de Capacidad (canvas "Backlog y Curación": cola de triage para clasificar historias, una a la vez, con tres opciones grandes y un drawer de rechazo con motivo) se apoya en cuatro piezas que `tuip` no tiene, y que no son específicas de esa pantalla:

- Una **tarjeta de opción seleccionable** (radio con contenido rico: título, descripción, un control interno y estado de selección visible como tarjeta). `RadioGroup` sólo admite etiquetas de texto; la app ya la necesita también para elegir el modo del drawer de reasignación.
- Un **campo de texto multilínea**. `Input` envuelve `<input>`; las descripciones de célula, persona, y el "detalle" del motivo de rechazo vienen resolviéndose con `<textarea>` suelto o sin campo.
- Una **tecla** (`Kbd`) para mostrar atajos de teclado, que la cola de triage usa para despachar historias sin soltar el teclado.
- Un **Chip seleccionable** (filtro visible que se enciende y apaga, con contador). `Chip` hoy es sólo removible; `FilterButton` resuelve el filtro pero esconde las opciones en un menú, y la cola necesita las células a la vista.

Sin estas piezas, la app las compondría a mano con tokens, que es la brecha que venimos cerrando change a change (ver `extend-bars-for-capacity-views`, `add-seniority-card-component`, `add-app-shell-component`).

## What Changes

- **`OptionCard` + `OptionCardGroup`** (nuevos): un grupo de tarjetas mutuamente excluyentes, cada una con título, descripción opcional, un atajo opcional (`Kbd`) y contenido opcional (un `Select`, chips) que sólo tiene sentido cuando la tarjeta está elegida. La tarjeta seleccionada SHALL marcarse con borde `neutral-bold` y el radio lleno, nunca con el color de marca; navegación por teclado como un radio group (flechas mueven foco y selección); el contenido interno es alcanzable con Tab desde la tarjeta. Admite `disabled` por tarjeta y una disposición en fila (`columns`) o apilada.
- **`Textarea`** (nuevo): el par multilínea de `Input`, con la misma anatomía (`label`, `hint`, `error`, `required`), altura por `rows` y redimensionado vertical opcional; mismo foco, borde y tratamiento de error que `Input`.
- **`Kbd`** (nuevo): una tecla en mono sobre fondo neutro con borde, para atajos; con `size` (`sm` para pies de panel, `md` para tarjetas); nunca interactiva.
- **`Chip` gana `selectable`**: modo *toggle* — `selected` + `onSelectedChange` en lugar de `onRemove` — con estado encendido en `neutral-bold` sobre texto invertido, `aria-pressed`, y un `count` opcional alineado a la derecha. El modo removible actual no cambia.
- Documentación de los cuatro en el docs site y en el skill, incluida la regla de cuándo usar `OptionCard` frente a `RadioGroup`/`SegmentedControl`, y `Chip selectable` frente a `FilterButton`.
- Publicación local (`.tgz`) para que la app los adopte.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `component-library`: "Catálogo inicial de componentes" suma OptionCard, Textarea y Kbd; "Opciones del componente Chip" gana el modo seleccionable; tres requisitos nuevos con las opciones de OptionCard, Textarea y Kbd, y uno de distinción de uso (OptionCard frente a RadioGroup y SegmentedControl; Chip seleccionable frente a FilterButton).

## Impact

- `packages/components/src`: `option-card.tsx`, `textarea.tsx`, `kbd.tsx` (nuevos, con tests), `chip.tsx` (variante), `index.ts` (exports); el registry y el skill se regeneran en el build.
- `apps/docs/src/content`: páginas nuevas `option-card.tsx`, `textarea.tsx`, `kbd.tsx`; `chip.tsx` actualizada.
- Tokens: ninguno nuevo — todo se resuelve con `neutral-bold`, `neutral-subtle`, `neutral-inverse` y la escala de radio/foco existentes.
- Consumidor: la app (`frontend/`) reinstala el `.tgz`; sin cambios de API para lo que ya usa (`Chip` removible sigue igual).
