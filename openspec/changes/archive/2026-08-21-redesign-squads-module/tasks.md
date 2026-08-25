## 1. Contrato y mocks

- [x] 1.1 En `squadService.ts`, agregar a `SquadDto` los campos calculados de sólo lectura (`memberCount`, `members: {id,name}[]`, `allocatedFte`, `bauFte`, `transformationFte`), el tipo `SquadsStats`, `list(page, pageSize, search?, criticalities?)` serializando `criticality` repetido como hace `personService` con `seniority`, y `getStats()` contra `GET /squads/stats`.
- [x] 1.2 En `allocations.handlers.ts` y `people.handlers.ts`, exportar accesores de sólo lectura al estado en memoria (`getAllocationsSnapshot()`, `getPeopleSnapshot()`), con el comentario de que son la única vía para que otro handler cruce estado.
- [x] 1.3 En `squads.handlers.ts`, enriquecer cada célula al responder `GET /squads` con los campos calculados desde las asignaciones en memoria (conteo, muestra de hasta 3 personas ordenadas por nombre, Σ dedicación/BAU/Transformación ÷ 100), y devolver ceros/`[]` en la célula creada por `POST`.
- [x] 1.4 En `squads.handlers.ts`, aceptar `search` (nombre o tribu, parcial, sin distinguir mayúsculas) y `criticality` (repetible) en `GET /squads`, filtrando antes de paginar, siguiendo `filterPeople` de `people.handlers.ts`.
- [x] 1.5 En `squads.handlers.ts`, agregar `GET /squads/stats` calculado sobre todas las células en memoria: total, sin equipo, tribus distintas, distribución por criticidad (los 4 niveles, incluso en cero), FTE asignado con desglose BAU/Transformación, y `chapterFte` como Σ `availableFte` de las personas en memoria. Documentar la dependencia unidireccional sobre los otros dos mocks.
- [x] 1.6 Ampliar las semillas: ~5 células cubriendo las 4 criticidades, al menos 2 tribus y una sin equipo; asignaciones suficientes para que una célula tenga más de 3 personas (para el "+N"), usando ids/nombres reales de `people.handlers.ts`. Confirmar que `resetSquadsMock()`/`resetAllocationsMock()` siguen restaurando el estado inicial.
- [x] 1.7 Tests de handlers (`src/mocks/handlers/__test__/`): filtros de búsqueda/criticidad, campos calculados reflejan una asignación creada y quitada en la misma sesión, stats con los 4 niveles y con `chapterFte = 0` cuando no hay personas.

## 2. Adapter y hooks

- [x] 2.1 En `SquadAdapter.ts`, agregar `CRITICALITY_LABELS` (Crítica/Alta/Media/Baja) y `CRITICALITY_ORDER`, y propagar a `Squad` `criticalityLabel` y los campos calculados, normalizando `undefined` a `0`/`[]` para tolerar el backend real.
- [x] 2.2 En `useSquads.ts`, agregar estado y callbacks de `search` y `criticalities` con vuelta a página 1, manteniendo `initialPageSize` como primer parámetro para no romper `AllocationsContainer`; unificar la carga en un solo camino (el `load` y el `useEffect` hoy duplican la misma petición).
- [x] 2.3 Crear `useSquadsStats.ts` (misma forma que `usePeopleStats`: `stats`, `loading`, `error`, `refetch`).
- [x] 2.4 Tests: `SquadAdapter.test.ts` (etiquetas, propagación, normalización), `useSquads.test.ts` (reset de página al buscar/filtrar, params enviados), nuevo `useSquadsStats.test.ts`, `squadService.test.ts` (serialización de `criticality` y `getStats`).

## 3. Encabezado y cards de resumen

- [x] 3.1 Crear `SquadsHeader.tsx` (título "Células", descripción corta, botón primario "Nueva célula" con icono `cell`), espejo de `PeopleHeader`.
- [x] 3.2 Crear `SquadsStatsCards.tsx` con las 3 cards: "Células" (total, pie "N sin equipo · M tribus"), "Capacidad asignada" (`allocatedFte / chapterFte`, `Progress brandFill`, pie con % y desglose BAU/Transformación, sin división por cero), "Distribución por criticidad" (`SegmentedBar separated` con roles danger/warning/info y gris categórico para Baja, leyenda a 2 columnas con punto/etiqueta/conteo, total en el header). Devuelve `null` en carga o error.
- [x] 3.3 En `LeadSquadsPage.tsx`, quitar el `h1 sr-only` para que el único `h1` sea el del encabezado.
- [x] 3.4 Tests: `SquadsStatsCards.test.tsx` (null en carga/error, % con `chapterFte = 0`, los 4 niveles en la leyenda incluso en cero, mismas clases de color que usa el badge por nivel).

## 4. Listado

- [x] 4.1 En `SquadsList.tsx`, quitar la fila del botón "Crear célula" y agregar el toolbar con `SearchField` ("Buscar por nombre o tribu") y `FilterButton` ("Criticidad", opciones de `CRITICALITY_ORDER` con sus etiquetas).
- [x] 4.2 Reemplazar las columnas por: Célula (nombre + descripción truncada a una línea con `title`), Tribu, Criticidad (`Badge` con `criticalityLabel`), Equipo (`AvatarGroup max={3}` con `Avatar colorId` e iniciales de `getPersonInitials` + "N personas", o "Sin equipo"), Capacidad (`allocatedFte` con un decimal + "FTE", y "BAU a.a · Transf. b.b" debajo), acciones.
- [x] 4.3 Agregar "Ver equipo" al menú de acciones (entre Editar y Eliminar) que llama a `onViewTeam(squad)`.
- [x] 4.4 Diferenciar los estados vacíos: sin filtros → "Todavía no hay células" con botón "Nueva célula"; con búsqueda/filtro activos → "Sin resultados" con el toolbar visible.
- [x] 4.5 Tests en `SquadsList.test.tsx`: columnas nuevas, "Sin equipo" y 0.0 FTE, "+N" con más de 3 miembros, `title` en la descripción, etiqueta en español del badge, estados vacíos diferenciados, "Ver equipo" dispara `onViewTeam`, búsqueda y filtro disparan sus callbacks.

## 5. Contenedor y formulario

- [x] 5.1 En `SquadsContainer.tsx`, componer `SquadsHeader` + `SquadsStatsCards` + `SquadsList` en un `flex flex-col gap-6`, pasar búsqueda/filtro desde `useSquads`, refetchear listado y stats tras cada mutación exitosa, e implementar `onViewTeam` con `useNavigate` hacia `/app/lead/capacidades?celula=<id>`.
- [x] 5.2 En `SquadFormModal.tsx`, mostrar las opciones de criticidad con su etiqueta en español manteniendo el código como valor.
- [x] 5.3 Tests: `SquadsContainer.test.tsx` (encabezado visible, cards presentes, refetch de stats tras crear/editar/eliminar, navegación de "Ver equipo"), `SquadFormModal.validate.test.ts` sin regresiones.

## 6. Preselección de célula en Capacidades

- [x] 6.1 En `AllocationsContainer.tsx`, reemplazar el `useState` de `squadId` por `useSearchParams` (`celula`): leer al montar, escribir con `replace: true` al cambiar el `Select`, y tratar un id que no está entre las células cargadas como "sin selección".
- [x] 6.2 Tests en `AllocationsContainer.test.tsx`: preselección por `?celula=`, id desconocido no rompe ni llama a asignaciones, cambiar la célula actualiza la URL.

## 7. Verificación

- [x] 7.1 Correr `npx vitest run src/features/squads src/features/allocations src/mocks` y el lint/typecheck del frontend sin regresiones frente al baseline.
- [x] 7.2 Levantar la app en modo mock y revisar en `/app/lead/celulas`: encabezado, 3 cards con datos de las semillas, búsqueda y filtro con vuelta a página 1, filas con descripción truncada, badge en español, avatares con los mismos colores que en Personas, capacidad con desglose, "Ver equipo" aterrizando en Capacidades con la célula elegida; luego asignar una persona en Capacidades y confirmar que Células refleja el cambio.
- [x] 7.3 Verificar el tema oscuro y que la tabla no desborda el contenedor con las columnas nuevas.
