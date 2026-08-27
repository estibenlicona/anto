## Why

Los cinco listados con búsqueda y filtros (Células, Personas, Iniciativas, Asignaciones de una célula, Facturación) arman la card de la tabla a mano: un `div` con `overflow-hidden rounded-surface border` alrededor de `<Table flush>` y una `PaginationBar` con clases de borde y fondo copiadas en cada archivo, y la fila de búsqueda y filtros suelta encima, sobre el lienzo. Tres de ellos (Personas, Iniciativas, Asignaciones) además desmontan esa fila mientras cargan o cuando hay error, el mismo defecto que Células ya corrigió. Con los slots `toolbar` y `footer` que `@tuya-ui/components` incorpora en el change `table-slots-toolbar-footer` de tuip, la card la dibuja Table y los listados sólo dicen qué va en cada zona.

## What Changes

- Se actualiza `@tuya-ui/components` (y `@tuya-ui/tokens` si el empaquetado los sube juntos) al tarball local que incluye los slots.
- Los cinco listados pasan la fila de búsqueda/filtros como `toolbar` y la `PaginationBar` como `footer` de `Table`, y dejan de envolver la tabla en su propio `div` con borde. Se borran las clases de borde/fondo que cada uno le pasaba a `PaginationBar`.
- Los estados de carga, error y "Sin resultados" pasan a mostrarse **dentro de la card**, bajo la barra y con las cabeceras de columna visibles, mediante una fila de ancho completo. La barra de filtros queda montada en todos esos estados, en los cinco listados (hoy sólo en Células).
- El estado vacío inicial (sin datos y sin filtro) no cambia: sigue siendo un `EmptyState` a pantalla completa sin barra ni tabla.
- Se añade un componente compartido pequeño para esa fila de estado (`TableStatusRow`), para no repetir el `colSpan` y el centrado en cinco archivos.

## Capabilities

### New Capabilities
- `list-table-frame`: cómo se componen los listados con búsqueda y filtros — una sola card con barra, cabeceras, filas o estado, y paginación — y qué se ve en cada estado de datos.

### Modified Capabilities
<!-- `squads-list` no cambia de requisitos: sus escenarios hablan del resumen, el h1 y la acción de crear, no de la card. -->

## Impact

- `package.json` / `pnpm-lock.yaml`: nueva ruta del tarball de `@tuya-ui/components`.
- `src/shared/components/TableStatusRow.tsx` (nuevo).
- `src/features/squads/components/SquadsList.tsx`, `src/features/people/components/PeopleList.tsx`, `src/features/initiatives/components/InitiativesList.tsx`, `src/features/allocations/components/AllocationsList.tsx`, `src/features/billing/components/BillingList.tsx`.
- Tests de esos cinco componentes: los que afirman que la barra desaparece durante la carga (si los hay) se invierten; los que buscan textos de carga/error/sin resultados siguen valiendo porque el texto es el mismo.
- Fuera de alcance: las tablas sin barra de filtros (Ausencias, matriz de plan de carrera, paneles de la torre de control, tablas de Admin) y el detalle de célula/persona. Si alguna quiere la card, es un cambio de una línea cuando toque.
- Depende de que `table-slots-toolbar-footer` (tuip) esté implementado y empaquetado con `pnpm publish:local`.
