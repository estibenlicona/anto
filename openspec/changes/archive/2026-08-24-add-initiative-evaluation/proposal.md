## Why

Cuando nace una iniciativa hay que decidir cuánta gente, con qué capacidades y en qué plazo **antes** de que exista backlog o arquitectura (módulo 1.1 de la especificación: triaje → 30 preguntas en 7 dimensiones → puntaje → talla → PM → FTE → mix). Hoy la plataforma tiene los parámetros del modelo en Admin (bandas de talla, pool de preguntas, mix de capacidades) y las iniciativas sólo aparecen como catálogo de ejemplo en el backlog y las asignaciones: no hay dónde crearlas ni evaluarlas, y nada alimenta la demanda de capacidad.

Se implementa el diseño "Evaluación de Iniciativas" (canvas de esta sesión) como un **módulo nuevo de Iniciativas** para el Chapter Lead, **adaptado a lo que tuip ofrece hoy**: `Table`/`PaginationBar`, `Card`, `Badge`, `Tag`, `SegmentedControl`, `Chip` seleccionable, `Progress`, `Alert`, `Drawer`, `Menu`. Sin "Capacidad vs demanda" (queda para otro change).

## What Changes

- **Navegación**: grupo nuevo **Iniciativas** en el sidebar del Chapter Lead, antes de "Capacidad", con una sola entrada: **Iniciativas** (`/app/lead/iniciativas`). Breadcrumb "Gestionar Iniciativas"; en la evaluación, "Gestionar Iniciativas / <nombre> · Evaluación".
- **Listado de Iniciativas**: tres cards (sin evaluar, activas con su distribución por talla, FTE demandado = suma del FTE esperado de las activas) y una tabla con nombre (enlace a la evaluación), célula y PO, estado (`Badge`), talla (`Badge` por talla, o enlace neutro **Evaluar** si no tiene), FTE esperado, plazo, y un menú ⋮ por fila (Editar · Activar · Cerrar). Búsqueda y `FilterButton` por estado, célula y talla. Único primario: **Nueva iniciativa**.
- **Alta/edición de iniciativa** (`Drawer`): nombre, célula (`Select` de las células del mock), Product Owner (texto), plazo objetivo en meses. Estados: `Evaluating` (recién creada o con evaluación guardada sin activar), `Active`, `Closed`. Activar exige talla (evaluación guardada); cerrar sólo desde activa.
- **Evaluación** (pantalla propia `/app/lead/iniciativas/:id/evaluacion`): encabezado con el resultado en vivo (talla, complejidad, esfuerzo PM, FTE esperado) y el **plazo objetivo** como `SegmentedControl` (3 · 6 · 9 · 12 meses; RN-34: cambia el FTE, nunca la talla); panel de pasos (Tamizaje, las 7 dimensiones, Resultado) con respondidas/total y aporte por dimensión; un paso a la vez. Tamizaje: seis preguntas Sí/No con `SegmentedControl`, las críticas con `Badge`, recomendación con `Alert` (obligatoria · recomendada · vía rápida). Dimensión: cada pregunta con código, tipo (`Tag` Objetiva/Evaluativa), peso y cinco opciones como `Chip` seleccionable con su valor 0–4. Resultado: talla sobre la escala, FTE esperado/optimista/pesimista, lectura y acción recomendada, complejidad por dimensión (`Progress`), y el equipo que pide la talla (capacidad, personas del mix, composición %, FTE). Único primario por paso; **Guardar evaluación** persiste respuestas y resultado.
- **Modelo y cálculo**: el mock sirve el modelo de evaluación (`GET /initiatives/evaluation-model`) **armado desde los parámetros de Admin** (pool de preguntas, bandas de talla, mix de capacidades) más el tamizaje y las escalas de opciones; el cálculo es una función pura compartida (`computeEvaluation`) que el frontend usa para la vista en vivo y el mock para lo que persiste. Guardar es `PUT /initiatives/:id/evaluation` y devuelve la iniciativa con talla y FTE.
- **Datos compartidos**: el mock de iniciativas es la fuente; el catálogo de iniciativas del backlog y el `initiativeName` de las asignaciones pasan a leerlo por snapshot (mismos ids y nombres).

### Fuera de alcance

- Capacidad vs demanda, portafolio con KPIs agregados y calibración (1.2–1.4).
- Nivel mínimo por capacidad en el mix (el parámetro de Admin no lo tiene; el resultado muestra personas y composición, no nivel).
- Edición del tamizaje desde Admin (vive en el mock como constante).
- Estimación por etapas y gate de prerequisitos (2.2).

## Capabilities

### New Capabilities
- `initiatives`: listado, alta/edición y cambio de estado de iniciativas; evaluación (tamizaje, dimensiones, resultado) con el modelo parametrizado.

### Modified Capabilities
- `chapter-lead-shell`: "Navegación lateral del rol Chapter Lead" gana el grupo "Iniciativas" con su entrada y títulos de breadcrumb.
- `api-mocking`: handler nuevo de iniciativas (CRUD, estado, evaluación) y del modelo de evaluación derivado de los parámetros de Admin; el catálogo de iniciativas del backlog y el nombre de iniciativa de las asignaciones salen del mismo mock.

## Impact

- Frontend nuevo: `features/initiatives/{services/initiativeService.ts, services/evaluationModel.ts (tipos + computeEvaluation), adapters/InitiativeAdapter.ts, adapters/EvaluationAdapter.ts, hooks/useInitiatives.ts, hooks/useInitiativeMutations.ts, hooks/useEvaluation.ts, components/InitiativesStatsCards.tsx, components/InitiativesList.tsx, components/InitiativeFormDrawer.tsx, components/initiativeValidation.ts, components/evaluation/{EvaluationHeader, EvaluationSteps, TriageStep, DimensionStep, ResultStep}.tsx, InitiativesContainer.tsx, InitiativeEvaluationContainer.tsx}`; páginas `LeadInitiativesPage`, `LeadInitiativeEvaluationPage`; rutas y nav en `chapter-lead-shell`.
- Mocks: `initiatives.handlers.ts` + `initiatives.seeds.ts` (nuevos); `backlog.seeds.ts` (`INITIATIVES` ← snapshot) y `allocations.handlers.ts` (nombre de iniciativa ← snapshot); `index.ts`.
- Specs: `initiatives` (nueva), `chapter-lead-shell`, `api-mocking`. Tests de handlers, adapters, cálculo, hooks, componentes y containers.
- tuip: sin cambios. Brechas detectadas al implementar:
  - **Stepper vertical**: no existe; el panel de pasos es una lista de botones neutros con el actual resaltado (`bg-neutral-subtlest`, número con borde de marca) y los completados en `bg-neutral-bold`.
  - **Escala de tallas con marcador**: no existe; se compone con tramos a escala de las bandas (`bg-neutral-subtle` / `bg-neutral-bold`) y un punto posicionado por el porcentaje. Un `Scale`/`RangeIndicator` con segmentos etiquetados lo resolvería.
  - **Chip como opción de escala**: `Chip selectable` con `count` se usa como "opción con valor 0–4"; semánticamente es un filtro (`aria-pressed`) y no un radio. Un `OptionChip`/`ChoiceChipGroup` (un solo seleccionado, `role="radiogroup"`) sería lo correcto.
  - **Breadcrumb**: colapsa más de tres niveles en "…", así que el nivel final es "<iniciativa> · Evaluación" en una sola miga (no dos).
  - **Badge grande**: el resultado quiere la talla en tamaño de titular; `Badge` no tiene tamaño, se usa el normal junto a la lectura.
