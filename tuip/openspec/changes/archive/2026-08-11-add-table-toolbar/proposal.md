## Why

`add-table` entregó la estructura estática de Table y dejó explícitamente fuera —como Non-Goals para "un change posterior"— todo lo que el mockup de referencia (`design-system/Componentes Tuya.dc.html`, sección "Data table") ilustra alrededor de ella: búsqueda, filtros, densidad, orden, selección de filas y paginación. Ese change posterior es este: agregar los componentes que rodean a Table y la "robustecen" para el caso de uso real de una lista de datos — sin tocar la promesa ya hecha de que Table en sí es solo estructura estática, sin estado propio.

## What Changes

- Se agrega `Pagination`: navegación de páginas (anterior/siguiente, números de página con elipsis para rangos largos), controlada por el consumidor (`page`, `pageCount`, `onPageChange`). No incluye ningún texto de resumen ("N de M") — ese texto es contenido libre que el consumidor coloca junto a `Pagination` en el mismo renglón.
- Se agrega `Chip`: una etiqueta removible (label + botón de cerrar), para representar un filtro activo — distinta de `Badge`, que no es interactiva ni removible.
- Se agrega `SegmentedControl`: un grupo de opciones excluyentes mostradas como botones contiguos, controlado (`value`, `onChange`, `options`). Se usa para el toggle de densidad de Table en este change, pero es un componente genérico, no acoplado a Table.
- Se agrega `TableToolbar`: un contenedor de layout (fila con espaciado y borde) pensado para ubicarse arriba de `Table`, donde el consumidor compone campo de búsqueda, filtros y el `SegmentedControl` de densidad con los componentes ya existentes (`Input`, `Select`, `Chip`, `SegmentedControl`).
- **Table (MODIFICADO, aditivo, no rompe la API actual)**:
  - `Table` acepta una prop opcional `density?: "comfortable" | "compact"` (por defecto `"comfortable"`, el mismo espaciado que ya existe hoy), propagada a `TableRow`, `TableHead` y `TableCell` vía contexto de React.
  - `TableHead` acepta las props opcionales `sortDirection?: "asc" | "desc"` y `onSort?: () => void`. Cuando `onSort` está presente, la cabecera se vuelve interactiva (rol de botón, `aria-sort`) y muestra el ícono de orden; el ordenamiento real de los datos sigue siendo responsabilidad del consumidor.
- Selección de filas se documenta como patrón de composición con el `Checkbox` ya existente dentro de `TableHead`/`TableCell` — no se agrega ninguna prop de selección a Table ni un componente nuevo, siguiendo el mismo criterio que ya fijó `add-table` (Table no conoce la forma de los datos).
- **Explícitamente fuera de este change**: un componente de menú/dropdown para el "···" de acciones por fila (es una primitiva nueva y no trivial — overlay posicionado, teclado, foco — que merece su propio change), y cualquier campo de búsqueda con ícono embebido en `Input` (se resuelve componiendo el ícono a mano dentro de `TableToolbar`, sin tocar la API ya estable de `Input`).

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado incorpora `Pagination`, `Chip`, `SegmentedControl` y `TableToolbar`; se añaden los requisitos de comportamiento de cada uno; se modifican los requisitos de Table para cubrir densidad y cabeceras ordenables.

## Impact

- `packages/components/src/pagination.tsx`, `chip.tsx`, `segmented-control.tsx`, `table-toolbar.tsx`: componentes nuevos.
- `packages/components/src/table.tsx`: `Table` gana `density` vía contexto; `TableHead` gana `sortDirection`/`onSort`.
- `packages/components/registry/definitions.ts`: cuatro entradas nuevas (`pagination` en `actions`, `chip` en `feedback`, `segmented-control` en `forms`, `table-toolbar` en `layout`), todas `stable`.
- `apps/docs/src/content/pagination.tsx`, `chip.tsx`, `segmented-control.tsx`, `table-toolbar.tsx`: contenido de uso, anatomía y accesibilidad. `apps/docs/src/content/table.tsx` se actualiza con la nueva sección de densidad, orden y el patrón de selección de filas.
- `apps/docs/src/examples/pagination/*.tsx`, `chip/*.tsx`, `segmented-control/*.tsx`, `table-toolbar/*.tsx`: ejemplos en vivo. Se agregan ejemplos nuevos en `apps/docs/src/examples/table/*.tsx` para densidad, orden y selección de filas.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos nuevos/modificados.
