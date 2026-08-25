## Why

La pantalla de Células quedó en su versión inicial: un botón "Crear célula" suelto y una tabla plana de cuatro columnas (nombre, tribu, criticidad, descripción) que no responde ninguna pregunta operativa del Chapter Lead — cuántas células hay, cuáles tienen equipo, cuánta capacidad del chapter está puesta en cada una. Mientras tanto, el módulo de Personas evolucionó a un patrón más rico (encabezado con título/descripción, cards de resumen, búsqueda y filtros, filas con jerarquía visual e información derivada como FTE y utilización) que hoy es el estándar de presentación de la app. Células debe alcanzar ese mismo nivel, usando la información que el dominio ya maneja para las células: su equipo y su capacidad asignada (vía asignaciones), su criticidad y su tribu.

## What Changes

- **Encabezado del módulo**: título "Células", descripción corta y el botón de alta —renombrado a "Nueva célula"— a la derecha, igual que `PeopleHeader`. Se quita la fila suelta con el botón "Crear célula" que hoy vive dentro del listado. El `h1` `sr-only` de la página se reemplaza por el título visible del encabezado.
- **Tres cards de resumen** debajo del encabezado, calculadas sobre el total de células registradas (no sobre la página/filtro actual):
  - **Células**: total de células, con la lectura de cuántas están sin equipo asignado y cuántas tribus distintas agrupan.
  - **Capacidad asignada**: FTE total asignado a células frente al FTE disponible del chapter (suma del FTE de las personas), con barra de progreso y el desglose BAU / Transformación.
  - **Distribución por criticidad**: barra segmentada + leyenda con la cuenta de células por cada nivel (Crítica, Alta, Media, Baja), con los mismos colores semánticos que usa el badge de criticidad en las filas.
- **Búsqueda y filtros** sobre el listado: búsqueda por nombre o tribu (parcial, sin distinguir mayúsculas) y filtro múltiple por criticidad, combinables con la paginación; cambiar búsqueda o filtro vuelve a la primera página. Estado vacío diferenciado cuando hay filtros activos y no hay resultados.
- **Filas con información de capacidad**, no sólo atributos del formulario:
  - **Célula**: nombre como texto principal y la descripción debajo, con menor jerarquía y truncada a una línea (hoy la descripción es una columna propia que, con hasta 500 caracteres, deforma la tabla).
  - **Criticidad**: el badge semántico actual, pero con la etiqueta en español (Crítica/Alta/Media/Baja) en vez del código del backend (`Critical`/`High`…); la misma etiqueta se usa en el filtro, en el formulario y en la card de distribución.
  - **Equipo** (nueva): avatares de las personas asignadas (mismas iniciales y mismo color por persona que usa el módulo de Personas) con el conteo, o "Sin equipo" cuando no hay asignaciones.
  - **Capacidad** (nueva): FTE asignado a la célula (suma de % de dedicación / 100) con el desglose BAU / Transformación debajo.
  - Se elimina la columna Descripción como columna independiente.
- **Acción "Ver equipo"** en el menú de cada fila, que lleva a la pantalla de Capacidades con esa célula ya seleccionada. Para eso la pantalla de Capacidades acepta la célula preseleccionada por URL (`?celula=<id>`).
- **Contrato de datos**: `SquadDto` gana campos calculados de sólo lectura (`memberCount`, `members` muestra para avatares, `allocatedFte`, `bauFte`, `transformationFte`), y aparece `GET /squads/stats` con el resumen agregado. `GET /squads` acepta `search` y `criticality` (uno o más). **Alcance sólo mock**: como en `GET /people/stats`, los mocks de MSW lo calculan de verdad —cruzando las asignaciones y personas en memoria— y el backend .NET real queda como brecha documentada.

### Fuera de alcance

- Pantalla de detalle de célula (tabs Resumen/Backlog/Board/Equipo del mockup v7): el nombre de la fila no es un enlace todavía.
- Iniciativa activa y tablero de DevOps vinculado, que el mockup v7 muestra como columnas: no existe módulo de iniciativas ni vínculo de tableros en el frontend; se agregan cuando exista su pantalla.
- Migrar el formulario de célula de `Modal` a `Drawer` (como hizo `modernize-person-form`): es el flujo de captura, no la presentación de la información, y merece su propio change.
- Backend .NET real y cambios en `tuip`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `squads`: nuevo requisito de resumen del módulo (encabezado + 3 cards); "Listar células" cambia sus columnas (célula con descripción, criticidad en español, equipo, capacidad), suma búsqueda/filtro por criticidad y la acción "Ver equipo" por fila; "Selección de criticidad desde catálogo" muestra etiquetas en español.
- `allocations`: "Elegir una célula para administrar su equipo" acepta la célula preseleccionada desde la URL.
- `api-mocking`: el handler de células acepta `search`/`criticality`, devuelve los campos calculados de equipo y capacidad desde las asignaciones en memoria, y expone `GET /squads/stats`.

## Impact

- **Frontend — squads**: `SquadsContainer.tsx` (encabezado + cards + búsqueda/filtro), nuevos `SquadsHeader.tsx` y `SquadsStatsCards.tsx`, `SquadsList.tsx` (toolbar, columnas nuevas, menú con "Ver equipo"), `squadService.ts` (campos calculados, `list` con filtros, `getStats`), `SquadAdapter.ts` (etiqueta de criticidad, campos derivados), `useSquads.ts` (search/criticality, vuelta a página 1), nuevo `useSquadsStats.ts`, `SquadFormModal.tsx` (etiquetas del selector).
- **Frontend — allocations**: `AllocationsContainer.tsx` lee `?celula=` para preseleccionar la célula.
- **Frontend — página**: `LeadSquadsPage.tsx` deja de imprimir el `h1` oculto.
- **Mocks**: `squads.handlers.ts` (filtros, campos calculados, `GET /squads/stats`), `allocations.handlers.ts` y `people.handlers.ts` exponen un accesor de sólo lectura a su estado en memoria para que el handler de células cruce los datos; las semillas ganan asignaciones suficientes para que las cards y columnas muestren datos reales.
- **Pruebas**: tests de `SquadsList`, `SquadsContainer`, `useSquads`, `SquadAdapter`, `squadService`, handlers de mock, y `AllocationsContainer` (preselección por URL).
- **Sin impacto**: backend real (brecha documentada), `tuip` (todos los componentes necesarios —`Card`, `Progress`, `SegmentedBar`, `AvatarGroup`, `SearchField`, `FilterButton`, `Badge`— ya existen), formulario de alta/edición más allá de las etiquetas.
