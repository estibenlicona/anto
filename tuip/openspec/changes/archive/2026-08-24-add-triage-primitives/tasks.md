## 1. Kbd

- [x] 1.1 Crear `packages/components/src/kbd.tsx`: `<kbd>` con `size` (`sm` | `md`), mono, `bg-neutral-subtle`, `border-neutral-default`, `rounded-control`, `select-none`, sin foco ni rol; exportar desde `index.ts`.
- [x] 1.2 `kbd.test.tsx`: elemento `kbd`, sin `tabIndex`, clases por tamaño.

## 2. Textarea

- [x] 2.1 La anatomía ya vivía en `field.tsx` (FieldLabel, FieldHint, useFieldDescription); se sumaron ahí `fieldStateClasses` y `fieldFocusRingClasses`, que `Input` pasa a consumir. No hizo falta `lib/field-chrome.ts`; la suite completa sigue verde.
- [x] 2.2 Crear `textarea.tsx` (`Textarea`: `label`, `hint`, `error`, `required`, `rows`, `resize` vertical | none) sobre `field-chrome`; exportar.
- [x] 2.3 `textarea.test.tsx`: label asociada, hint, error reemplaza hint y marca inválido, `rows`, `resize-y` por defecto y `resize-none` opcional.

## 3. Chip seleccionable

- [x] 3.1 En `chip.tsx`, unión discriminada de props (`onRemove` | `selectable` + `selected` + `onSelectedChange` + `count?`); modo seleccionable como `<button aria-pressed>`, encendido `bg-neutral-bold text-neutral-on-bold`, contador en `tabular-nums` incluido en el nombre accesible.
- [x] 3.2 `chip.test.tsx`: el modo removible no cambia; seleccionable notifica y expone `aria-pressed`; contador en el nombre accesible; el tipado rechaza ambos modos (test de tipos con `// @ts-expect-error`).

## 4. OptionCard

- [x] 4.1 Crear `option-card.tsx` con `OptionCardGroup` (`value`/`defaultValue`/`onValueChange`, `name`, `label`, `columns` | apilado, `className`) y `OptionCard` (`value`, `title`, `description?`, `shortcut?` → `Kbd`, `disabled?`, `children` = contenido propio): patrón ARIA radiogroup con roving tabindex según design D1; selección en neutro según D2; exportar ambos.
- [x] 4.2 `option-card.test.tsx`: click selecciona y notifica; flechas mueven foco y selección con wrap y saltan deshabilitadas; Espacio/Enter seleccionan; Tab alcanza el contenido de la tarjeta elegida y operarlo no cambia la selección; la tarjeta elegida no cambia de tamaño (mismo box por padding compensado); sin color de marca en las clases de selección.

## 5. Documentación y publicación

- [x] 5.1 Páginas de docs `kbd.tsx`, `textarea.tsx`, `option-card.tsx` (con la guía OptionCard / RadioGroup / SegmentedControl) y `chip.tsx` actualizada (modo seleccionable + guía frente a FilterButton), con ejemplos tomados de la cola de triage y del drawer de rechazo.
- [x] 5.2 `pnpm build` en `packages/components` (tsup, css, registry, skill): los cuatro aparecen en `registry.json` y en el skill; `verify-tokens` y lint sin errores.
- [x] 5.3 `pnpm run publish:local` y confirmar que el `.tgz` exporta `OptionCard`, `OptionCardGroup`, `Textarea`, `Kbd` y el `Chip` con ambos modos.
