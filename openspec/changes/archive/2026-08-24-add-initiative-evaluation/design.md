## Context

Ver proposal.md — Why. Estado actual que condiciona el cómo:

- Los parámetros del modelo ya viven en mocks de Admin: `question-pool.handlers.ts` (30 preguntas con `dimension`, `texto`, `peso`; sin tipo), `talla-bands.handlers.ts` (`boundaries` [20,40,60,80] + 5 bandas con `pmMin/pmMax/lectura`), `capability-mix.handlers.ts` (capacidad × talla → personas). Los changes `add-question-pool-editing` y `add-capability-mix-editing` están aplicados (no archivados): sus servicios y tipos (`QuestionPool`, `TallaBands`, `CapabilityMix`) son los que se reutilizan.
- Las iniciativas existen sólo como `INITIATIVES` en `backlog.seeds.ts` (id, name, squadId) y como `initiativeId/initiativeName` en asignaciones. No hay feature ni spec.
- Shell del Chapter Lead: `leadNavGroups`/`leadRouteTitles` en `chapter-lead-shell/navigation.ts`, activo por prefijo; breadcrumb por `useLeadBreadcrumbTrailing`.
- tuip: `Table`, `PaginationBar`, `SearchField`, `FilterButton`, `Menu`, `Badge`, `Tag`, `Card`, `SegmentedControl`, `Chip` (selectable + count), `Progress`, `Alert`, `Drawer`, `Select`, `TextField`, `EmptyState`, `Kbd`. No hay "escala de tallas" ni "stepper vertical".
- Diseño de referencia: canvas "Evaluación de Iniciativas" (listado, tamizaje, dimensión, resultado) — se adapta, no se calca.

## Goals / Non-Goals

**Goals:**
- Módulo Iniciativas completo y mock-first: listado + alta/edición + estado + evaluación, con el modelo parametrizado por Admin.
- Un único motor de cálculo (`computeEvaluation`) compartido por frontend y mock, que el backend reemplazará sin tocar la UI.
- Iniciativas como fuente única para backlog y asignaciones.

**Non-Goals:**
- Capacidad vs demanda, portafolio con KPIs, calibración; nivel por capacidad en el mix; edición del tamizaje en Admin; estimación por etapas.

## Decisions

1. **Modelo servido, cálculo compartido.** `GET /initiatives/evaluation-model` devuelve `EvaluationModelDto { dimensions: string[]; questions: { id, dimension, text, weight, kind: "Objective"|"Evaluative", scale: [5 labels] }[]; triage: { id, text, critical }[]; bands: { talla, minPct, maxPct, pmMin, pmMax, lectura, action }[]; mix: { capability, byTalla: Record<string, number> }[] }`. El mock lo arma por petición desde los tres mocks de Admin (snapshots `getQuestionPoolSnapshot`, `getTallaBandsSnapshot`, `getCapabilityMixSnapshot`, nuevos) + `QUESTION_KINDS` (id → kind/escala) y `TRIAGE` constantes del mock. `computeEvaluation(model, input)` vive en `features/initiatives/services/evaluationModel.ts` (sin React, sin DTOs de red) y lo importan el hook y el handler: una sola verdad para la vista en vivo y lo persistido. Alternativa descartada: `POST /preview` por respuesta (ruido de red y latencia para un cálculo de microsegundos).

2. **Cálculo** (del v1 con los parámetros de Admin): `pts = Σ respuesta·peso`, `MP = Σ 4·peso`, `pct = pts/MP·100`; talla = primera banda con `pct ≤ maxPct` (rangos desde `boundaries`: XS 0–20, S 21–40…); `fMed = (pmMin+pmMax)/2 / plazo`, `fMin = pmMin/plazo`, `fMax = pmMax/plazo`; por dimensión `pctDim = Σ resp·peso / Σ 4·peso`; mix: personas de la talla por capacidad, composición = personas/total, `fte = composición·fMed`. `action` por banda es texto fijo del mock (no existe en las bandas de Admin). Tamizaje: obligatoria si alguna crítica en sí o ≥3 en sí; recomendada si ≥1; vía rápida si 0.

3. **Estado de la evaluación en el cliente.** `useEvaluation(initiativeId)` carga iniciativa + modelo, mantiene `draft { triage: boolean[]; answers: Record<questionId, 0–4>; targetMonths }` inicializado desde la evaluación guardada (o vacío: todo No, sin respuestas, plazo de la iniciativa) y expone `result = computeEvaluation(model, draft)` memoizado, `step` (0 tamizaje · 1–7 dimensiones · 8 resultado) y `save()` (`PUT /initiatives/:id/evaluation`). Sin respuesta = 0 en el cálculo pero cuenta como "no respondida" en el panel de pasos.

4. **Cómo se dibuja con tuip (adaptaciones al canvas):**
   - Resultado en vivo del encabezado: `Card` con cuatro métricas (`text-metric`) y `SegmentedControl` de plazo (3 · 6 · 9 · 12).
   - Panel de pasos: lista propia (`ul` con botones neutros) con `Badge neutral` del número y texto mono de "respondidas · %"; el actual con `bg-neutral-subtlest` y borde. No hay stepper en tuip: se anota como brecha, sin imitar un componente.
   - Tamizaje: `SegmentedControl` No/Sí por pregunta; `Badge variant="danger"` "Crítica"; `Alert` variant danger/warning/success según la recomendación.
   - Dimensión: `Tag` para "Objetiva/Evaluativa" y "Peso N"; opciones con `Chip selected count={valor}` (el contador es el valor 0–4); una sola seleccionada por pregunta (`onSelectedChange` selecciona, nunca deselecciona).
   - Resultado: `Badge` grande de talla (por talla: XS neutral, S success, M warning, L warning, XL danger), escala de tallas compuesta con `Progress`-like local (cinco tramos y marcador) — brecha de tuip; `Card` × 3 para FTE (esperado con `border-bold`); `Progress` por dimensión; `Table` del mix; `Alert` neutral para la acción recomendada y warning para la dimensión que más pesa.
   - Listado: `Table flush` + `PaginationBar`, `SearchField`, `FilterButton` × 3, `Menu` por fila (`MenuItem` deshabilitados según estado), `Link tone="neutral"` para nombre y "Evaluar", `Badge` de estado y de talla; `Card` × 3 arriba.
   - Drawer de alta/edición: `TextField` nombre, `Select` célula (de `squadService.list`), `TextField` PO, `TextField type="number"` plazo; `FormSection` como los demás drawers.

5. **Mock de iniciativas como fuente única.** `initiatives.handlers.ts` + `initiatives.seeds.ts` con 7 iniciativas (ids actuales `ini-kafka`, `ini-payments`, `ini-onboarding`, `ini-fraud`, `ini-lakehouse` + 2 nuevas sin evaluar) y evaluaciones sembradas calculadas al cargar con `computeEvaluation` sobre el modelo inicial (nunca resultados hardcodeados). `getInitiativesSnapshot()` → `backlog.seeds.ts` exporta `INITIATIVES` derivado; `allocations.handlers.ts` resuelve `initiativeName` por id. `resetInitiativesMock()`.

6. **Rutas y nav.** `leadNavGroups` gana el grupo `{ label: "Iniciativas", items: [{ id: "lead-iniciativas", label: "Iniciativas", href: "/app/lead/iniciativas", icon: "rebalance"? → usar un icono existente de tuip (revisar catálogo; fallback "expertise") }] }` antes de "Capacidad"; `leadRouteTitles["lead-iniciativas"] = "Gestionar Iniciativas"`. Rutas `iniciativas` y `iniciativas/:id/evaluacion` en el router del lead; la evaluación publica `"<nombre> / Evaluación"` con `useLeadBreadcrumbTrailing`.

7. **Validación pura** en `components/initiativeValidation.ts` (nombre, célula, PO, plazo 1–36) y `evaluationValidation` en el mock (ids del pool, valores 0–4, plazo ≥1).

## Risks / Trade-offs

- **Duplicar el motor en el backend real**: aceptado; `computeEvaluation` es pequeño, puro y con tests de tabla que servirán como contrato.
- **Bandas de Admin (PM 0.5–18) ≠ v1 (1–64)**: el FTE de ejemplo será menor que en el canvas; es el dato vigente y el que Admin controla.
- **Mix sin nivel**: el resultado muestra personas y composición; si Admin incorpora nivel, el `Table` gana una columna sin rehacer nada.
- **Chip con contador como "valor"**: semánticamente es un filtro; se usa por ser el único seleccionable con número en tuip. Anotar como brecha ("OptionChip"/escala de opciones) en el proposal al cerrar.

## Migration Plan

Sólo frontend/mocks. `INITIATIVES` del backlog pasa a derivarse del nuevo mock con los mismos ids: los tests existentes de backlog/asignaciones no cambian de datos. Sin pasos de despliegue.

## Open Questions

- Icono del grupo Iniciativas: elegir entre los existentes de tuip al implementar (sin agregar iconos en este change).
