## Context

Ver proposal.md - Why. El catálogo ya resuelve un patrón similar de desplegable-más-entrada-de-texto en `Combobox`, construido sobre `@radix-ui/react-popover` (posicionamiento del desplegable) y `cmdk` (lista filtrable). `DateField` y `DateRangeField` necesitan el mismo desplegable posicionado, pero la parte que cambia — un calendario con navegación de mes, rango de dos extremos y días deshabilitados — no tiene equivalente en el catálogo ni conviene calcularla a mano (cálculo de semanas, meses con distinta cantidad de días, locale de nombres de mes/día).

## Goals / Non-Goals

**Goals:**
- Reusar `@radix-ui/react-popover`, ya declarado por `Combobox`, para el desplegable de ambos componentes.
- Delegar el cálculo del calendario (grilla de días, navegación de mes, selección de rango, deshabilitado por límite) en una librería headless probada, en vez de reimplementarlo.
- Mantener la entrada de texto como la vía principal y siempre disponible, con el calendario como una ayuda estrictamente opcional — ninguna de las dos SHALL depender de la otra para funcionar.

**Non-Goals:**
- Selección de hora (time picker). El componente cubre solo fecha, tal como lo especifica la definición de diseño.
- Formatos de entrada distintos del ISO. La captura es siempre ISO; el formato localizado abreviado es exclusivo del modo lectura de `DateRangeField`.
- Validación de reglas de negocio sobre el rango (ej. duración máxima). Eso queda del lado del consumidor, igual que `Select`/`Combobox` delegan la resolución de datos.

## Decisions

### Calendario: `react-day-picker` sobre construirlo a mano o adoptar un date picker compuesto

`react-day-picker` es headless (se estiliza con las clases del propio sistema, igual que se hizo con Radix), soporta selección simple y de rango con la misma API, deshabilitado de días por función (`disabled={{ before: minDate, after: maxDate }}`) sin ocultarlos, y no impone su propio input ni popover — se combina con `@radix-ui/react-popover` igual que `cmdk` se combina hoy para `Combobox`. Alternativas consideradas:
- Calcular la grilla de calendario a mano: descartado, es lógica de fechas no trivial (semanas parciales, meses de distinta longitud, primer día de semana según locale) que ya resuelve una librería madura sin traer un date picker "todo en uno" que imponga su propio input.
- Un date picker compuesto (input + calendario + popover en un solo paquete, ej. una librería de UI de fechas completa): descartado porque el catálogo distribuye código fuente editable (`component-library` - Componentes distribuidos como código fuente); un paquete todo en uno dificulta separar la parte de input (siempre visible y editable a mano) de la parte de calendario (ayuda opcional), que es justamente la distinción que pide la definición de diseño.

### Dos componentes (`DateField`, `DateRangeField`) en vez de uno con modo

Mismo criterio que separó `Select` de `Combobox`: cada uno con su propia forma de props (`value`/`onChange` para `DateField`; `startValue`/`endValue`/`onRangeChange` para `DateRangeField`) en vez de una unión discriminada por un prop `range` que obligaría a tipar ambas formas de valor en un mismo componente. `DateRangeField` reexporta e internamente compone la misma pieza de calendario que `DateField`, sin duplicar la lógica de grilla o de límites.

### Formato ISO en captura, formato abreviado localizado solo en lectura del rango

Firmado por la propia definición de diseño: "Formato ISO en captura: sin ambigüedad entre día y mes" para `DateField`, y "En lectura se muestra «28 jul – 8 ago»" para el rango. `DateField` no tiene un modo de lectura separado — su único valor mostrado es el ISO editable —, por lo que el formato abreviado aplica exclusivamente a `DateRangeField` fuera de edición.

## Risks / Trade-offs

- [Nueva dependencia de runtime (`react-day-picker`) además de las ya declaradas] → Mitigación: se distribuye como paquete de npm que el consumidor instala, igual que `@radix-ui/react-select` o `cmdk`; el catálogo ya declara ese mecanismo (`component-library` - Componentes distribuidos como código fuente) para dependencias más allá de `react`.
- [Divergencia entre lo que el usuario escribe a mano y lo que el calendario puede representar, ej. un texto con formato inválido] → Mitigación: mismo patrón que `Input` — el campo de texto valida el formato ISO y expone el estado de error existente del sistema; el calendario nunca bloquea la escritura manual, solo dejar de reflejar una selección hasta que el texto vuelva a ser una fecha válida.
