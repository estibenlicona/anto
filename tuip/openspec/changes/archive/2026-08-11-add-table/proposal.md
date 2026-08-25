## Why

El catálogo no tiene forma de mostrar datos tabulares — hoy solo hay `Card` para agrupar contenido en un contenedor, ninguno con semántica de fila/columna. Es el componente de mayor alcance de la definición del sistema ("el componente más caro del sistema": búsqueda, filtros, densidad, orden, selección, columnas fijas, paginación, virtualización), así que se introduce en dos pasos en vez de uno: primero la estructura estática que ya cubre el caso más común — mostrar una lista de datos en filas y columnas —, y las capacidades interactivas (orden, selección, paginación, filtros, densidad, fijado, virtualización) quedan para un change posterior, cuando haya un caso real que las necesite.

## What Changes

- Se agrega el componente `Table` al catálogo, como conjunto compuesto: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`.
- Se construye sobre los elementos nativos `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>` y `<td>` — misma familia de decisión que Checkbox y Radio: el HTML nativo ya resuelve la semántica de tabla para lectores de pantalla, sin necesitar una librería headless.
- Se documenta la convención de alineación de la definición: texto a la izquierda, columnas numéricas a la derecha con cifras tabulares, y un dato ausente se muestra como "—" en vez de una celda vacía.
- Nace como `stable`: no introduce un patrón de accesibilidad nuevo sin resolver — hereda la semántica nativa de `<table>`.
- Se añade contenido de documentación: ejemplos, anatomía de las siete partes compuestas y notas de accesibilidad.
- Explícitamente **no** incluye: orden por columna, selección de filas, paginación, búsqueda/filtros, densidad cómoda/compacta, cabecera o columnas fijas al scroll, ni virtualización — quedan fuera de este change (ver `design.md`).

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Table`; se añade el requisito de estructura y accesibilidad de la tabla.

## Impact

- `packages/components/src/table.tsx`: componente nuevo (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`).
- `packages/components/registry/definitions.ts`: nueva entrada `table`, categoría `layout`, `status: "stable"`.
- `apps/docs/src/content/table.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/table/*.tsx`: ejemplos en vivo.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y el requisito de comportamiento nuevo.
