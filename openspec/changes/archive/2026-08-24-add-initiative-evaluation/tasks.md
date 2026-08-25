## 1. Modelo, cálculo y mocks

- [x] 1.1 `features/initiatives/services/evaluationModel.ts`: tipos `EvaluationModel`, `EvaluationInput`, `EvaluationResult` y `computeEvaluation(model, input)` (puntaje, %, talla por bandas, PM, FTE esperado/optimista/pesimista, por dimensión, mix, recomendación del tamizaje). Tests de tabla: vacío → XS/0%; plazo no cambia talla; frontera de banda; mix suma composición 100%.
- [x] 1.2 `features/initiatives/services/initiativeService.ts`: `InitiativeDto`, `InitiativeStatus`, `InitiativeEvaluationDto`, `InitiativesStats`; `list(page,pageSize,{search,status[],squadId[],talla[]})`, `get`, `create`, `update`, `setStatus`, `saveEvaluation`, `getStats`, `getEvaluationModel`.
- [x] 1.3 Snapshots de sólo lectura en los mocks de Admin: `getQuestionPoolSnapshot`, `getTallaBandsSnapshot`, `getCapabilityMixSnapshot`.
- [x] 1.4 `mocks/handlers/initiatives.seeds.ts` (7 iniciativas con ids actuales, respuestas de ejemplo; evaluaciones calculadas con `computeEvaluation` al sembrar) y `initiatives.handlers.ts` (listado con filtros y paginación, get, post, put, put estado con reglas, put evaluación con validación, stats, modelo armado por petición con `QUESTION_KINDS` y `TRIAGE`, `getInitiativesSnapshot`, `resetInitiativesMock`); registrar en `index.ts`.
- [x] 1.5 `backlog.seeds.ts` deriva `INITIATIVES` del snapshot; `allocations.handlers.ts` resuelve `initiativeName` por id. Suites de backlog y asignaciones siguen en verde.
- [x] 1.6 Tests `initiatives.handler.test.ts`: filtros, crear/editar (plazo recalcula FTE), estado (400s), evaluación válida/400/404, stats, modelo sigue a un cambio de Admin (peso y banda), catálogos derivados.

## 2. Adapters y hooks

- [x] 2.1 `InitiativeAdapter` (`Initiative` con `statusLabel`, `tallaLabel`, `fteText`, `plazoText`) y `EvaluationAdapter` (etiquetas de recomendación, colores de talla, textos de pasos).
- [x] 2.2 `useInitiatives` (paginación, búsqueda con debounce, filtros → página 1), `useInitiativesStats`, `useInitiativeMutations` (create/update/setStatus con `MutationResult`), `useEvaluation(id)` (iniciativa + modelo, `draft`, `result` memoizado, `step`, `save`).
- [x] 2.3 Tests de adapters y hooks (filtros vuelven a página 1; `useEvaluation` inicia desde lo guardado; cambiar plazo no cambia talla).

## 3. Listado y alta

- [x] 3.1 `InitiativesStatsCards` (sin evaluar · activas por talla con `Badge` · FTE demandado), `InitiativesList` (`Table flush`, nombre como `Link` neutro, `Badge` de estado y talla, enlace neutro "Evaluar" sin talla, `Menu` por fila con Editar/Activar/Cerrar deshabilitados según estado, `PaginationBar`, `SearchField`, `FilterButton` × 3, `EmptyState`).
- [x] 3.2 `InitiativeFormDrawer` + `initiativeValidation.ts` (nombre, célula `Select`, PO, plazo 1–36); diálogos de confirmación de activar/cerrar.
- [x] 3.3 `InitiativesContainer` + `LeadInitiativesPage`; ruta `iniciativas`; nav grupo "Iniciativas" + `leadRouteTitles`.
- [x] 3.4 Tests: lista (fila con/sin talla, menú deshabilitado, filtro llama con la selección), validación, container con el mock real (crear aparece; activar evaluada cambia card), layout/nav (grupo y entrada activa en ruta hija).

## 4. Evaluación

- [x] 4.1 `EvaluationHeader` (nombre, estado, célula/PO; `Card` de métricas en vivo; `SegmentedControl` de plazo) y `EvaluationSteps` (tamizaje, 7 dimensiones, resultado; respondidas y %; complejidad acumulada con `Progress`).
- [x] 4.2 `TriageStep` (`SegmentedControl` No/Sí, `Badge` crítica, `Alert` de recomendación, "Guardar como vía rápida" sólo en vía rápida, "Comenzar evaluación" primario).
- [x] 4.3 `DimensionStep` (encabezado con N preguntas y aporte; pregunta con código, `Tag` tipo y peso; 5 `Chip selected count` por pregunta; Anterior/Siguiente, "Ver resultado" en la 7ª).
- [x] 4.4 `ResultStep` (talla + lectura + escala con marcador, `Card` × 3 de FTE, `Alert` acción recomendada, `Progress` por dimensión + `Alert` de la que más pesa, `Table` del mix con total, "Revisar respuestas" y "Guardar evaluación" primario).
- [x] 4.5 `InitiativeEvaluationContainer` + `LeadInitiativeEvaluationPage`; ruta `iniciativas/:id/evaluacion`; breadcrumb trailing "<nombre> / Evaluación"; estado vacío para id inexistente; toast y vuelta al listado al guardar.
- [x] 4.6 Tests: cada paso (recomendación cambia con una crítica; elegir chip reemplaza; resultado muestra talla/FTE/mix), container con el mock real (responder cambia la talla del encabezado; cambiar plazo no; guardar persiste y el listado muestra la talla).

## 5. Verificación

- [x] 5.1 `npx vitest run`, typecheck y lint (sólo baseline); prettier en archivos tocados.
- [x] 5.2 Navegador: listado (cards, filtros, menú), crear iniciativa, evaluación completa de una nueva (tamizaje → 7 dimensiones → resultado → guardar), cambio de plazo, activar desde el listado; cambiar un peso en Admin y ver el modelo reflejado.
- [x] 5.3 Anotar en `proposal.md` (Impact) las brechas de tuip detectadas (stepper, escala de tallas, chip de opción).
