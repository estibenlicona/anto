## Why

El catálogo mínimo garantizado no incluye ningún componente de fecha, pese a que la definición de diseño (`design-system/Componentes Tuya.dc.html`, sección "Date field") ya especifica su comportamiento: captura en formato ISO sin ambigüedad de día/mes, entrada manual siempre disponible con el calendario como ayuda opcional, y un modo de rango para casos como el de sprint. Sin este componente, cualquier formulario que pida una fecha o un rango termina resuelto con un `Input` de texto libre sin validación de formato ni calendario.

## What Changes

- Se agrega `DateField` al catálogo: campo de fecha única con entrada de texto en formato ISO (`YYYY-MM-DD`) y un calendario desplegable como ayuda, nunca como única vía de captura.
- Se agrega `DateRangeField` al catálogo: campo de rango de dos fechas (inicio y fin), con la misma entrada manual siempre disponible y el mismo calendario desplegable, que además muestra el rango en lectura con formato abreviado localizado (ej. «28 jul – 8 ago») en vez del ISO usado en captura.
- Ambos calendarios permiten deshabilitar un rango de días fuera de límite (`minDate`/`maxDate`) sin ocultarlos, para que el usuario entienda el límite en vez de chocarse con él.
- `DateField` y `DateRangeField` se construyen sobre primitivas headless de terceros en vez de a mano: `@radix-ui/react-popover` (ya declarado por `Combobox`) para el desplegable y `react-day-picker` para el cálculo y renderizado del calendario — la primera vez que el catálogo depende de `react-day-picker`.
- Se añade contenido de documentación completo para ambos: ejemplos, anatomía, notas de accesibilidad y guía de uso, siguiendo el mismo patrón que Select y Combobox.
- Ambos se publican como `stable`.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `DateField` y `DateRangeField`; se documentan sus opciones (formato ISO en captura, entrada manual siempre disponible, calendario como ayuda, días fuera de rango deshabilitados pero visibles, formato de lectura abreviado del rango) y la nueva dependencia de runtime `react-day-picker`.

## Impact

- `packages/components/package.json`: nueva dependencia `react-day-picker` (y `@radix-ui/react-popover`, ya presente por `combobox`).
- `packages/components/src/date-field.tsx`, `packages/components/src/date-range-field.tsx`: componentes nuevos.
- `packages/components/registry/definitions.ts`: dos entradas nuevas, categoría `forms`, con sus `npmDependencies` declaradas.
- `apps/docs/src/content/date-field.tsx`, `apps/docs/src/content/date-range-field.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/date-field/*.tsx`, `apps/docs/src/examples/date-range-field/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `DateField` y `DateRangeField`.
