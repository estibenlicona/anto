## Context

Ver `proposal.md` - Why. `@radix-ui/react-popover` ya está instalado y en uso dentro de `combobox.tsx`, `date-field.tsx` y `date-range-field.tsx`, así que no hay dependencia nueva que evaluar — solo la decisión de cómo exponer el mismo patrón como componente propio del catálogo, coherente con la anatomía que ya usan `Tabs`, `Table`, `Menu` y `Accordion`.

## Goals / Non-Goals

**Goals:**
- Definir la anatomía de `Popover`, `PopoverTrigger` y `PopoverContent`, y qué props propias expone cada parte más allá de lo que ya trae la primitiva de Radix.
- Fijar el ancho, padding y capa de z-index de `PopoverContent` según los valores exactos que ya define `Fundamentos Tuya DS.dc.html` para "Popover" (280–360px, padding 16, capa compartida con Menu).

**Non-Goals:**
- No se agrega una flecha (`Popover.Arrow`) apuntando al disparador: ningún otro componente superpuesto del catálogo (`Menu`, `Tooltip`, `Select`, `Combobox`) la usa hoy, así que introducirla solo para Popover rompería la consistencia visual entre superficies anchadas del mismo tipo.
- No se agrega una prop de tamaño con pasos nombrados (`sm`/`md`/`lg`) como tiene `Modal`: la propia definición da un rango continuo (280–360), no pasos discretos, así que un único ancho mínimo por defecto, ensanchable por `className`, es más fiel a la fuente que inventar escalones que la definición no pide.

## Decisions

**Anatomía en tres partes, espejo directo de `Popover.Root`/`Trigger`/`Content` de Radix.**
Mismo criterio que `Tabs` y `Accordion`: cada parte es un envoltorio delgado sobre la primitiva correspondiente, sin una prop de datos que reemplace JSX libre — el contenido de un Popover es tan variable (un formulario de filtros, una lista de opciones, una vista previa) como el de `ModalBody`, así que no puede colapsarse en una prop `content` como sí alcanza para `Tooltip` (una frase corta y nada más).

**`PopoverContent` no exige un `PopoverTrigger` con `asChild` implícito oculto — se declara explícito, como `Dialog.Trigger` en `Modal` no existe pero `DropdownMenu.Trigger` en `Menu` sí.**
A diferencia de `Modal` (que no expone trigger porque casi nunca abre desde un botón contiguo), el caso de uso principal de Popover — "filtros de columna, selectores múltiples" — sí abre desde un control junto al contenido que filtra, igual que `Menu`. Se sigue entonces el patrón de trigger explícito de `Menu`/`Tabs`, no el de `Modal`.

**Ancho: `w-popover-min` (280px) por defecto, sin combinarlo con un `max-w-popover-max` automático.**
El token `overlayWidth.popoverMin`/`popoverMax` ya está definido en `packages/tokens/src/layout.ts` y wireado a Tailwind como utilidades de `width` (`w-popover-min`, `w-popover-max`), pero no a `minWidth`/`maxWidth` — igual que `Tooltip` ya resuelve su propio ancho máximo con una clase fija en vez de una combinación min/max. `PopoverContent` aplica `w-popover-min` como ancho por defecto; un consumidor cuyo contenido necesita más espacio pasa `className="w-popover-max"` o un ancho propio, en vez de que el componente intente adivinar cuánto contenido va a recibir.

**Capa de apilamiento: reutiliza `z-menu`.**
La propia definición agrupa "Popover y menú" en la misma capa (600) — no hay una capa `z-popover` separada en `packages/tokens/src/layout.ts` (`layer.menu`), así que `PopoverContent` usa la misma clase `z-menu` que ya usan `Menu`, `Tooltip` y el contenido de `Select`/`Combobox`.

## Risks / Trade-offs

- [Sin flecha visual apuntando al disparador, un Popover ensanchado bien a la izquierda o derecha del disparador puede leerse ambiguo sobre qué lo abrió] → Riesgo aceptado: es la misma decisión ya tomada para `Menu` y `Select`, que tampoco usan flecha, y `sideOffset` mantiene la superficie pegada al disparador.
- [Un consumidor podría usar Popover para lo que en rigor es un Modal (contenido que bloquea la decisión) porque Popover es más liviano de montar] → Se documenta en el contenido de uso de `apps/docs` que Popover es para consultar u operar sin bloquear el flujo (filtros, selección), y que una decisión que debe resolverse antes de continuar sigue siendo Modal.
