## Why

`Input` y `Select` ganaron `hint` y `required`, `Input` ganó `prefix`/`suffix`, y `SegmentedControl` ganó `variant`. La tabla de props de la documentación se genera desde el JSDoc del source (`generate:registry`), así que esa parte ya quedó al día sola — pero las secciones escritas a mano de `apps/docs/src/content/` no. Hoy la documentación muestra props que no explica cuándo usar, no ilustra visualmente, y en un caso **describe mal el componente**: la anatomía de `SegmentedControl` afirma que hay un separador `border-l` entre segmentos, que ahora sólo es cierto en la variante `joined`.

## What Changes

- `input.tsx` (docs): ilustrar `prefix`/`suffix`/`hint`/`required` en la anatomía; sumar partes para la celda de adorno y el texto de ayuda; sumar pares do/dont sobre `hint` vs `error` y sobre `required`; sumar las filas de accesibilidad de `aria-required` y del `aria-describedby` que ahora también apunta al hint.
- `select.tsx` (docs): el mismo tratamiento para `hint` y `required`, para que los dos controles de formulario se documenten igual.
- `segmented-control.tsx` (docs): **corregir** la parte "Separador entre segmentos", que hoy describe sólo el comportamiento de `joined` como si fuera el único; ilustrar `separated` como estado propio y explicar cuándo elegir cada variante.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
(ninguna — cambio sólo de contenido de documentación, sin cambio de comportamiento en ningún componente; el change declara `skip_specs: true`)

## Impact

- `tuip/apps/docs/src/content/input.tsx`
- `tuip/apps/docs/src/content/select.tsx`
- `tuip/apps/docs/src/content/segmented-control.tsx`
- Sin cambios en `packages/components`: los componentes ya están implementados y publicados; esto documenta lo que ya existe.
