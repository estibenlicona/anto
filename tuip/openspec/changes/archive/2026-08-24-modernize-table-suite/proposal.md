## Why

El catálogo hoy resuelve una tabla con datos, pero no la experiencia completa alrededor de ella — buscar, filtrar y paginar quedan librados a que cada pantalla los arme a mano, con un único contenedor (`TableToolbar`) que impone una caja con borde y fondo propio. La referencia visual que motiva este change (una tabla de Personas moderna: buscador y filtros sueltos sobre el fondo de la página, avatares con color por persona, una barra de paginación que junta el resumen de resultados con la navegación) muestra que las piezas que faltan no son de la tabla en sí —sus celdas y encabezados ya están cerca del objetivo— sino de su alrededor.

## What Changes

- **`Avatar` acepta un color categórico.** Nuevo prop `color` con el mismo vocabulario de seis tonos que ya usan `Tag` y `Slider` (`gray`/`green`/`blue`/`amber`/`red`/`purple`), asignado explícitamente por el consumidor — nunca derivado del nombre ni de ningún otro dato variable. **BREAKING**: reemplaza el requisito actual de `Avatar` ("color siempre neutro, sin excepción").
- **Se retira `TableToolbar`.** El contenedor con borde y fondo propio no tiene lugar en el objetivo visual, que muestra los controles sueltos directamente sobre el fondo de la página. **BREAKING**: el componente deja de exportarse.
- **Nuevo `SearchField`**: campo de búsqueda con ícono de lupa integrado, pensado para el buscador acotado a una tabla (por ejemplo "Buscar por nombre o cargo") — distinto del buscador global de `Navbar` (`NavbarSearch`, con atajo Ctrl+K), que no cambia en este change.
- **Nuevo `FilterButton`**: botón con etiqueta y chevron que abre un listado de opciones marcables (por ejemplo "Seniority", "Nivel SFIA"), con estado visualmente distinto cuando tiene alguna opción activa.
- **Nuevo `PaginationBar`**: compone en una sola fila el resumen de resultados ("Mostrando 1–5 de 10") a la izquierda y, a la derecha, un selector de tamaño de página junto al `Pagination` ya existente — sin modificar `Pagination`, cuyo propio requisito ya le prohíbe llevar texto de resumen o estado propio.
- **La cabecera y el pie de `Table` comparten un fondo casi blanco, y el cuerpo pasa a blanco explícito.** Segunda corrección sobre el mismo punto: la primera revisión había puesto un gris sólido medio (`#A0A0A8`, vía un token nuevo); el color correcto es `#FAFAFB`, prácticamente idéntico (1/255 de diferencia) al token que ya existe `background.neutral.subtlest` (`#FAFAFA`) — no hace falta ningún token nuevo esta vez, y el que se había agregado (`background.neutral.muted`) se retira por quedar sin ningún consumidor. Cabecera y pie usan ese mismo `bg-neutral-subtlest`; el cuerpo, que hoy no dibuja fondo propio (hereda el de lo que lo rodea), pasa a `bg-neutral-default` (blanco) explícito en el contenedor de `Table`. El texto de la cabecera (`text-neutral-default`, mayúsculas, negrita) no cambia — sigue midiendo contraste de sobra (~14:1) contra el nuevo fondo, más claro que el anterior. **BREAKING**: cambia el aspecto por defecto de toda tabla existente, sin opt-out. A diferencia de `Avatar` y `TableToolbar`, `Table` sí tiene consumidores reales hoy: `frontend` la usa en `AllocationsList.tsx`, `PeopleList.tsx`, `SquadsList.tsx`, `AdminHomePage.tsx` y `AdminParametersPage.tsx` — cada revisión de este change ya llegó a `frontend` vía `pnpm pack` + reinstalación; esta corrección requiere repetir ese paso una vez más.

**Fuera de alcance de este change:**
- El buscador global de `Navbar` (`NavbarSearch`) — ya existe y no cambia; el usuario lo señaló explícitamente aparte del alcance de este change.
- Aplicar este rediseño a una pantalla real de la app (por ejemplo, Personas en `frontend`) — este change es sólo del sistema de diseño; consumirlo es un change posterior, en el repo de la app.
- Las tarjetas de KPI (personas activas, FTE disponible, distribución por seniority/SFIA) de la referencia visual — son un patrón de tarjetas de panel, no de tabla.
- Un patrón nuevo para el menú de acciones por fila (el "⋮" al final de cada fila) — ya se resuelve componiendo `Button` (`variant="subtle"`), `Icon` (`more`) y `Menu`, todos existentes; queda como un ejemplo documentado, no como componente nuevo.
- Selección múltiple de filas (checkboxes en la primera columna) — no está en la referencia visual de este change.

## Capabilities

### Modified Capabilities
- `component-library`: `Avatar` gana un color categórico (MODIFIED, breaking), `TableToolbar` se retira (REMOVED), se agregan `SearchField`, `FilterButton` y `PaginationBar` (ADDED), y la cabecera/pie/cuerpo de `Table` cambian de fondo (MODIFIED, breaking).

## Impact

- **Tokens**: `packages/tokens/src/semantic-colors.ts` — se retira `background.neutral.muted` (sin consumidores tras esta corrección) y su caso en `packages/tokens/scripts/verify-tokens.ts`; no se agrega ningún token nuevo, esta corrección usa `background.neutral.subtlest`, que ya existía.
- **Paquete**: `packages/components/src/avatar.tsx` (modificado), `packages/components/src/table.tsx` (modificado, cabecera/pie/cuerpo), `packages/components/src/table-toolbar.tsx` (eliminado), nuevos `packages/components/src/search-field.tsx`, `packages/components/src/filter-button.tsx`, `packages/components/src/pagination-bar.tsx`, y sus barrels/exports en `packages/components/src/index.ts`.
- **Docs** (`apps/docs`): nueva referencia y ejemplos para `SearchField`, `FilterButton` y `PaginationBar`; actualización de los ejemplos de `Avatar` y `Table`, y de cualquier página que use `TableToolbar` hoy.
- **Breaking (`TableToolbar`/`Avatar`)**: cualquier consumidor de `TableToolbar` o del `Avatar` sin color pierde compatibilidad — dentro de este monorepo, sólo `apps/docs` lo usa; ningún cambio de contrato afecta a `frontend` (la app), que no importa ninguno de los dos hoy.
- **Breaking (`Table`)**: cambia el aspecto visual de la cabecera para todo consumidor existente de `Table`, sin flag de opt-in — dentro de este monorepo eso incluye a `frontend`, que sí usa `Table` en varias pantallas (ver "What Changes"). El cambio no llega a `frontend` hasta que actualice su dependencia de `@tuya-ui/components`, pero cuando lo haga, no hay forma de mantener el header gris anterior.
