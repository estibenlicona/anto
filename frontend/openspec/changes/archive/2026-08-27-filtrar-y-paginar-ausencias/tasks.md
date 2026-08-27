## 1. Hook: acotar y paginar en memoria

- [x] 1.1 Crear `src/features/absences/hooks/useAbsencesFilters.ts` que reciba las filas del mes y la clave del mes, y devuelva `visible`, `total`, `page`, `pageSize`, `totalPages`, `search`, `types`, `statuses` y sus setters; página inicial 1 y tamaño inicial 10
- [x] 1.2 En ese hook, normalizar el texto de búsqueda y el nombre de la persona quitando mayúsculas y acentos (`normalize("NFD")`), y combinar búsqueda + tipos + estados con AND entre controles y OR dentro de cada filtro
- [x] 1.3 En ese hook, volver a la página 1 ante cualquier cambio de búsqueda, de filtros o de tamaño de página, y reiniciar búsqueda, filtros y página cuando cambia la clave del mes
- [x] 1.4 Crear `src/features/absences/hooks/__test__/useAbsencesFilters.test.ts`: búsqueda parcial e insensible a acentos, filtros por tipo y por estado, combinación de ambos, paginación y tamaño de página, vuelta a página 1 y reinicio al cambiar de mes

## 2. Tabla: barra, paginación y estados

- [x] 2.1 En `AbsencesTable.tsx`, añadir el slot `toolbar` con `SearchField` ("Buscar por persona") y dos `FilterButton` —"Tipo" y "Estado"— con opciones fijas armadas desde `TYPE_LABELS` y `STATUS_LABELS` (valor crudo como `value`)
- [x] 2.2 En `AbsencesTable.tsx`, añadir el slot `footer` con `PaginationBar` (tamaños 10/20/50), visible sólo cuando hay filas
- [x] 2.3 En `AbsencesTable.tsx`, mover carga, error y "Sin resultados" al cuerpo con `TableStatusRow` (colSpan de la tabla), siguiendo `PeopleList`
- [x] 2.4 Ampliar las props de `AbsencesTable` con `loading`, `error`, `onRetry`, la paginación y el estado de los controles, en el mismo orden y con los mismos nombres que `PeopleList`

## 3. Contenedor

- [x] 3.1 En `AbsencesContainer.tsx`, montar `useAbsencesFilters` con las filas del mes y la clave del mes, y pasarle a `AbsencesTable` las filas visibles y el resto de props
- [x] 3.2 En `AbsencesContainer.tsx`, dejar de renderizar los bloques de carga y error como hermanos de la tabla, y reservar el estado vacío del mes para cuando el mes no tenga ninguna ausencia
- [x] 3.3 Confirmar que las cards del resumen siguen recibiendo el mes completo, sin lo filtrado

## 4. Tests de la vista

- [x] 4.1 En `AbsencesContainer.test.tsx`, añadir: buscar por persona deja sólo sus filas; filtrar por estado deja sólo ese estado; búsqueda + filtro se combinan; un filtro sin resultados muestra "Sin resultados" con la barra visible
- [x] 4.2 En `AbsencesContainer.test.tsx`, añadir que las cifras del resumen no cambian al filtrar, y que al cambiar de mes se reinician búsqueda y filtros
- [x] 4.3 Revisar los tests existentes que buscan filas, carga o error por texto y ajustarlos si la mudanza a `TableStatusRow` movió lo que afirman

## 5. Verificación

- [x] 5.1 `pnpm test` (suites de absences y de páginas) en verde y `pnpm lint` sin errores nuevos (siguen los dos fallos previos y ajenos: `App.test.tsx` y `httpClient`)
- [x] 5.2 Revisar en el navegador `/app/lead/ausencias`: buscar, filtrar por tipo y por estado, combinarlos, paginar y cambiar el tamaño de página; comprobar "Sin resultados" con la barra montada, el mes sin ausencias con su estado vacío, y que el resumen no se mueve al filtrar
- [x] 5.3 En el navegador, con el foco en el buscador aprobar o rechazar una ausencia y confirmar que el foco y lo escrito sobreviven a la recarga; cambiar de mes con un filtro puesto y ver que se reinicia
