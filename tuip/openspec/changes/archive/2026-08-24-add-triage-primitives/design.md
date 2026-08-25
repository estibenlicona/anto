## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **`RadioGroup`** es un `<fieldset>` de `<input type="radio">` nativos con un `name` compartido: el navegador resuelve exclusión y flechas. `OptionCard` quiere esa misma semántica pero con una tarjeta como superficie y contenido interno enfocable — un radio nativo dentro de una tarjeta no puede contener un `Select` (los `<label>` no anidan controles), así que hace falta el patrón ARIA `radiogroup`/`radio` con roving tabindex.
- **`Input`** (`input.tsx`) ya tiene la anatomía de campo (label, hint, error, required, prefix/suffix) y las clases de borde/foco/error; `Textarea` debe repetirlas sin duplicarlas.
- **`Chip`** es un `span` con un botón de cierre; no hay estado. `SegmentedControl` ya tiene la receta de "encendido" en neutro intenso (`bg-neutral-bold` + `text-neutral-on-bold`).
- El build regenera `registry.json` y el skill desde `index.ts` y las páginas de `apps/docs/src/content`; el verificador de tokens falla ante colores literales.
- El change `add-app-shell-component` sigue activo en este repo y también toca "Catálogo inicial de componentes" (suma AppShell). El delta de este change ya lista AppShell para que el texto final sea el mismo con cualquier orden de archivo.

## Goals / Non-Goals

**Goals:**
- Cuatro piezas pequeñas, genéricas y accesibles, con la misma disciplina de tokens que el resto (sin colores literales, sin color de marca en estados de selección).
- Que la app pueda reemplazar sus composiciones a mano sin cambiar de API lo que ya usa (`Chip` removible intacto).

**Non-Goals:**
- Un `RadioGroup` con contenido rico: `OptionCard` es otro componente, no una extensión.
- Manejo de atajos de teclado: `Kbd` sólo documenta; quién escucha la tecla es el consumidor.
- `Textarea` con autoresize por contenido: `rows` + resize vertical alcanza; autoresize queda para cuando alguien lo pida.

## Decisions

1. **`OptionCardGroup` implementa el patrón ARIA radiogroup con roving tabindex**, no radios nativos. Cada tarjeta es un `div role="radio" aria-checked tabIndex={0|-1}`; flechas ↑/↓/←/→ mueven foco y selección (saltando `disabled`), Espacio/Enter seleccionan; el radio visual es un `span` decorativo (`aria-hidden`). El contenido interno va fuera del nodo `role="radio"` (hermano dentro de la tarjeta), con `tabIndex` natural, para que Tab lo alcance y sus teclas no burbujeen al grupo (`stopPropagation` en el contenedor de contenido). Alternativa: `<label>` + radio nativo — descartada porque no admite controles anidados. Valor controlado (`value`/`onValueChange`) + `defaultValue` no controlado, como `RadioGroup`.

2. **Selección en neutro, no en marca.** Tarjeta elegida: `border-neutral-bold` con `border-2` compensado por padding (`p-[15px]` vs `p-4`) para no cambiar de tamaño; radio lleno `border-[6px] border-neutral-bold`. Es la regla que el usuario fijó: la marca es para la acción principal de la pantalla.

3. **`Textarea` reutiliza la anatomía de `Input` extrayéndola a `lib/field-chrome.ts`** (clases de contenedor, label, hint, error; ids y `aria-describedby`/`aria-invalid`). `Input` pasa a consumirla; su salida no cambia (los tests existentes lo prueban). Alternativa: copiar las clases — descartada por duplicar la única fuente del tratamiento de campo.

4. **`Kbd` es `<kbd>` con `font-mono`, `bg-neutral-subtle`, `border-neutral-default`, `rounded-control`**, `text-label` (sm) / `text-body-sm` (md), `select-none`, sin `tabIndex`. Sin `role` extra: el elemento ya es semántico.

5. **`Chip` con unión discriminada de props**: `{ onRemove } | { selectable: true; selected; onSelectedChange; count? }`. En modo seleccionable se renderiza como `<button type="button" aria-pressed>`; encendido `bg-neutral-bold text-neutral-on-bold`, apagado igual que hoy (`bg-neutral-selected`). `count` en `tabular-nums` con `aria-label` compuesto ("Backend Platform, 5"). Alternativa: un componente `FilterChip` aparte — descartada: es el mismo objeto visual con otro comportamiento, y el tipado excluyente evita el mal uso.

6. **Docs y skill**: tres páginas nuevas + `chip.tsx` actualizada, con la guía de distinción (OptionCard/RadioGroup/SegmentedControl; Chip seleccionable/FilterButton) en las páginas de `OptionCard` y `Chip`.

## Risks / Trade-offs

- [Roving tabindex a mano puede divergir de lo que hace el navegador con radios nativos] → tests de teclado explícitos (flechas con wrap, salto de deshabilitadas, Tab entra al contenido, teclas del contenido no cambian la selección).
- [`field-chrome` toca `Input`, la pieza más usada] → refactor sin cambio de salida, cubierto por los tests actuales de `Input`; si algo difiere, se revierte a copiar clases.
- [Dos changes activos modifican "Catálogo inicial de componentes"] → el delta de este change incluye AppShell; al archivar el segundo, la lista resultante es la misma. Verificar en el sync.
- [Versión del paquete] → misma política que los changes anteriores: publicar el `.tgz` local; la app reinstala.

## Migration Plan

1. Componentes + tests; 2. docs; 3. `pnpm build` (registry + skill + css); 4. `pnpm run publish:local`; 5. la app adopta en su propio change (Backlog).

Rollback: ninguna API existente cambia; `Chip` removible queda idéntico.
