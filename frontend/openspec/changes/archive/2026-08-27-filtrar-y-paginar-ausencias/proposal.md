## Why

La tabla de ausencias (`/app/lead/ausencias`) muestra todas las filas del mes de una, sin buscador, sin filtros y sin paginación: es la única tabla de listado del chapter lead sin barra de herramientas. En un mes cargado —un chapter grande en temporada de vacaciones— eso es una lista larga que sólo se recorre con scroll, y no hay forma de responder "¿qué me queda por aprobar?" o "¿cuántas incapacidades hubo?" sin leerla entera. Personas y Células ya resuelven esto con el mismo patrón (`SearchField` + `FilterButton` en el `toolbar` de la `Table`, `PaginationBar` en el `footer`).

## What Changes

- La tabla gana una barra de herramientas con un buscador por persona y dos filtros: **Tipo** (Vacaciones, Permiso, Incapacidad) y **Estado** (Solicitada, Aprobada, Rechazada).
- La tabla gana paginación en el pie, con tamaños de página 10/20/50 y arranque en 10, como las otras tablas.
- Buscador, filtros y paginación operan **sobre las filas del mes ya cargado**, en el cliente: el endpoint del mes (`GET /absences?month=`) devuelve el mes entero y no cambia. Las cards del resumen siguen leyendo el mes completo, no lo filtrado.
- Los estados de carga, error y "sin resultados" pasan a mostrarse como fila dentro de la tabla, para que la barra no se desmonte y el buscador no pierda el foco (mismo arreglo que ya tiene `PeopleList`).
- El estado vacío inicial del mes ("Sin ausencias en …") sigue reemplazando la tabla entera cuando el mes no tiene ninguna ausencia: sin filas no hay nada que filtrar.

## Capabilities

### New Capabilities
- `absences-table-filtering`: buscador, filtros y paginación de la tabla de ausencias — qué acota cada control, sobre qué conjunto operan, cómo se combinan y qué pasa cuando no queda ninguna fila.

### Modified Capabilities
<!-- Ninguna. `absences-month-view` (del change `compactar-vista-ausencias`, aún
     sin archivar) sigue cumpliéndose tal cual: el resumen sigue siendo el primer
     bloque, la tabla va detrás, los controles de la franja siguen presentes en
     carga y error, y el mes sin ausencias sigue mostrando su estado vacío. Esta
     capability sólo añade comportamiento dentro de la tabla. -->

## Impact

- `src/features/absences/components/AbsencesTable.tsx`: pasa a recibir buscador, filtros y paginación, y a renderizar carga/error/sin-resultados como fila (`TableStatusRow`), igual que `PeopleList`.
- `src/features/absences/hooks/useAbsencesFilters.ts` (nuevo): acota y pagina en memoria las filas del mes; devuelve las visibles, el total filtrado y el número de páginas.
- `src/features/absences/AbsencesContainer.tsx`: cablea el hook con la tabla y decide entre estado vacío del mes y tabla.
- Tests: `AbsencesTable`/`AbsencesContainer` (buscar, filtrar, combinar, paginar, "Sin resultados", cambio de mes) y el hook nuevo.
- No se toca `absenceService`, el handler del mock, el adaptador, `AbsencesStatsCards`, los drawers ni el diálogo de aprobación. La franja del breadcrumb con el navegador de mes y "Registrar ausencia" no cambia.
- Depende de `compactar-vista-ausencias`, que dejó la vista sin encabezado y con el mes en la franja; este change se aplica encima.
- Fuera de alcance: filtrar por célula, ordenar columnas, llevar los filtros a la URL y paginar en el servidor.
