# Diseño — Backend: módulo Competencias (span y planes)

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`SpanMatrixDto`/`SpanSkillDto`/`SpanPersonDto`/`SpanCellDto`, `SpanSummaryDto`/`SpanPersonRefDto`/`SpanCyclePointDto`/`SpanFocusSkillDto`/`SpanPendingDto`, `PersonPlanDto`/`PlanSkillDto`/`PlanActionDto`, `CreatePlanActionRequest`/`SetPlanActionStatusRequest`, enum `PlanActionStatus`). La semántica canónica —y la que este cambio **porta literalmente**, no reinterpreta— vive en el mock del frontend: `frontend/src/mocks/handlers/career-plan.handlers.ts` (todo el cálculo real: `buildSpan`, `buildPlan`, `buildSpanSummary`, `gapsInCycle`, y las dos rutas de escritura). Los adaptadores de `frontend/src/features/career-plan/adapters/*.ts` sólo reformatean ese DTO para la pantalla (estado de celda, color, sigla de dos letras) — nada de eso viaja al contrato ni hace falta portarlo.

Las reglas de pantalla están en `openspec/specs/career-plan/spec.md`. Este cambio depende por completo de dos módulos ya 🟢 y archivados: Catálogo de habilidades (`ISkillRepository`, expectativas por cargo) y Evaluaciones (`IAssessmentRepository`, `Assessment`/`AssessmentSkillAnswer` con su recorte congelado).

Convenciones ya asentadas en los once módulos anteriores: agregados `AggregateRoot`; value objects de catálogo cerrado (`sealed record` + `From(string)`); `IEndpointDefinition` por módulo; ejemplos Swagger con `IExamplesProvider`; provider InMemory/Postgres con semillas en `DevelopmentDataSeeder`; cruce entre módulos resuelto en una clase de Application dedicada (`AbsenceContext`, `DedicationContext`) que se construye una vez por request — acá `CareerPlanContext`.

## Goals / Non-Goals

**Goals**
- Las 5 rutas en 🟢, con exactamente los números y umbrales que hoy produce el mock del frontend.
- Ningún agregado nuevo para span ni perfil: se derivan en cada petición del catálogo vigente y la evaluación cerrada más reciente — sólo `PlanAction` persiste.

**Non-Goals**
- Filtros de columnas/orden de la matriz (query params de pantalla, el contrato no los declara).
- Scope por chapter (claims) — igual que los once módulos anteriores.
- Recalcular brechas históricas si el catálogo cambia después de un ciclo cerrado: la serie por ciclo mide siempre contra el catálogo y el cargo **de hoy**, nunca contra los que regían en ese ciclo (ver decisión 5).

## Decisions

1. **`PlanAction` es el único agregado nuevo; span y perfil no persisten nada.** `SpanMatrixDto`, `SpanSummaryDto` y `PersonPlanDto` se recalculan en cada petición cruzando `ISkillRepository.GetAllAsync` (sólo habilidades `Active`), `IPersonRepository.GetAllAsync` y, por persona, su evaluación **cerrada** más reciente (`IAssessmentRepository.GetAllAsync`, agrupada por `PersonId`, quedándose con el `Cycle` más alto por comparación de texto — el formato fijo `AAAA-SN` ya ordena así, mismo truco que `latestClosed` del mock). *Alternativa descartada*: un snapshot de span persistido y refrescado por job — el mock no lo tiene, y persistirlo duplicaría datos que ya viven en `Skill`/`Assessment` sin ganar nada mientras no haya volumen que lo justifique.

2. **`PlanAction` guarda persona, habilidad, nivel de partida, nivel objetivo, mes de compromiso, título y estado — nada de nombre de habilidad.** `PlanActionDto.skillName` se resuelve al leer, no al guardar: primero contra la fila de `PlanSkillDto` vigente de esa persona para esa habilidad (el nombre congelado de la evaluación), y si esa habilidad ya no aparece en el plan (una reevaluación posterior no volvió a calificarla), contra el nombre vigente del catálogo; si tampoco existe ahí, cadena vacía — literal de `buildPlan`'s `actions.map`. `FromLevel` se congela al crear la acción, tomado del nivel que la evaluación cerrada le daba a esa habilidad en ese momento, y no se vuelve a tocar aunque una evaluación posterior cambie ese nivel.

3. **El nombre, el grupo y los criterios de una habilidad evaluada salen del recorte congelado de `AssessmentSkillAnswer` (`FrozenSkillName`, `FrozenGroup`, `FrozenLevels`), no del catálogo vigente — pero el nivel exigido (`expectedLevel`) sí se recalcula contra el catálogo y el cargo de hoy.** Es la lectura exacta de `buildPlan`: `s.skillName`/`s.group`/`s.levels[...].criteria` vienen de la evaluación cerrada (`ClosedAssessmentSnapshot`, el equivalente del mock a nuestro `AssessmentSkillAnswer` ya congelado), mientras que `expectedLevel` sale de `catalogSkill.expectations.find(cargo actual)`. Esto es **distinto** de cómo `GET /people/{id}/assessment` (Evaluaciones) arma una evaluación cerrada, que usa `FrozenExpectedLevel` (la exigencia congelada al cerrar) — acá interesa "cuánto le falta hoy", no "cuánto le faltaba entonces". `gap = max(0, expectedLevel − level)` cuando ambos existen, si no `null`. `metCriteria`/`levelTotal` salen de `FrozenLevels[level‑1]`; `missingCriteria`/`expectedTotal` sólo cuando `gap > 0`, de `FrozenLevels[expectedLevel‑1]`.

4. **`PersonPlanDto.skills` incluye toda habilidad que la evaluación cerrada más reciente calificó (nivel no nulo), esté o no activa hoy en el catálogo; `SpanMatrixDto`/`SpanCellDto` sólo recorren las habilidades `Active`.** Son alcances distintos a propósito: el perfil de una persona es su historial calificado, la matriz es "sobre qué puede actuar el líder hoy" (mismo comentario del mock: *"una habilidad retirada del catálogo no es algo sobre lo que el líder pueda actuar hoy, aunque siga en evaluaciones anteriores"*). Si la habilidad calificada ya no existe en el catálogo (borrado, no sólo desactivado — aunque la guarda de Evaluaciones ya lo impide mientras haya una evaluación cerrada que la usó), `expectedLevel` queda `null` por no encontrarse el `Skill` vigente, igual que hace `buildPlan` con `catalogSkill` indefinido.

5. **La serie por ciclo (`trend`/`previousCycle`) compara siempre contra la exigencia de hoy, nunca contra la de cada ciclo.** Por cada ciclo cerrado que exista (de cualquier persona), se cuenta cuántas brechas tenía **esa** foto: una evaluación cerrada por persona y ciclo (si hay dos, la última encontrada), sólo habilidades **activas hoy**, comparadas contra el cargo **de la persona** (su cargo actual, no el que tenía en ese ciclo) y el nivel **exigido hoy**. Es deliberado —mismo comentario del mock— para que la serie no mezcle dos varas distintas si el catálogo subió una exigencia: "esto es lo que faltaba entonces para lo que pedimos ahora". `trend` tiene un punto por cada ciclo cerrado distinto que exista (ordenados de más viejo a más nuevo, comparación de texto), sin ventana ni tope; `previousCycle` es el penúltimo punto, o `null` con menos de dos.

6. **Los cuatro indicadores y los cuatro pendientes se calculan una sola vez, en el servidor, sobre el span completo — nunca sumando el plan de cada persona.** `totalGaps`/`criticalGaps` recorren las celdas de personas evaluadas (`gap > 0`, y `gap >= 2` para las críticas). `peopleAtRisk` son las personas con 3 o más celdas en brecha (`gapCount >= 3`), ordenadas por cantidad descendente y nombre. `topSkills` pesa cada habilidad por la **suma de los niveles que faltan** entre las personas evaluadas con brecha en ella (no por cuántas personas), muestra el mayor `expectedLevel` entre esas brechas, descarta las de peso 0 y se queda con las 4 de mayor peso (empate por nombre). Los cuatro pendientes: `unassessed` = personas sin evaluación cerrada; `overduePlans` = acciones `InProgress` cuyo `dueMonth` (comparado como texto `AAAA-MM`, en hora local) es anterior al mes actual; `positionsWithoutLevel` = cargos distintos del chapter con al menos una habilidad activa sin nivel declarado para ese cargo; `gapsWithoutPlan` = pares persona-habilidad en brecha sin ninguna acción **`InProgress`** sobre esa habilidad para esa persona (una acción `Done` no cuenta como plan vigente — la brecha vuelve a quedar sin plan, mismo principio que la decisión 7).

7. **Una brecha se cierra reevaluando, nunca marcando una acción como cumplida.** `PUT .../plan/actions/{id}/status` sólo cambia `PlanAction.Status`; el nivel de la habilidad (y por tanto el `gap`) siempre sale de la evaluación cerrada más reciente, recalculado en cada lectura — nada en el agregado `PlanAction` puede tocarlo. Es la misma regla que ya rige `gapsWithoutPlan` (decisión 6) y que el spec pide explícito en pantalla.

8. **Crear una acción exige una brecha real ya calculada, no una habilidad cualquiera.** `POST .../plan/actions` resuelve primero el `PersonPlanDto` vigente de la persona (404 si no existe) y valida contra su `PlanSkillDto`: la habilidad debe estar entre las evaluadas de esa persona (400 si no), con `gap` no nulo y mayor que 0 (400 si no hay brecha registrada — mismo mensaje del mock, con el nombre de la habilidad), `targetLevel` uno de 1-4 (400) y estrictamente mayor al nivel alcanzado (400), `dueMonth` con forma `AAAA-MM` (400) y `title` no vacío tras recortar espacios (400). `FromLevel` se fija al nivel alcanzado en ese momento; el estado nace `InProgress`.

## Risks / Trade-offs

- [Recalcular span/perfil en cada petición recorre todo el catálogo y todas las evaluaciones cerradas del chapter] → mismo costo que ya paga `DedicationContext`/`AbsenceContext`; sin scope por chapter todavía el volumen es el mismo que los demás módulos, y no hay indicio de que sea un problema real antes de tenerlo.
- [La serie por ciclo puede mostrar un ciclo antiguo con más brechas de las que realmente tenía si el catálogo subió una exigencia después] → es el comportamiento **deseado**, documentado en el propio mock: mide "qué tan lejos estamos hoy de lo que pedimos hoy", no un historial congelado.
- [Una habilidad evaluada y luego desactivada sigue en el perfil de la persona pero desaparece de la matriz] → decisión 4, coherente con "el líder actúa sobre lo vigente, la persona conserva su historial".
- [Sin scope por chapter] → igual que los once módulos anteriores.

## Migration Plan

Sin datos que migrar: una tabla nueva (`PlanActions`), vacía salvo semillas de desarrollo. Orden: Domain (`PlanActionStatus` + `PlanAction`) → Application (`CareerPlanContext`, DTOs, cinco use cases) → Infrastructure (configuración EF + repositorio + semillas sobre las evaluaciones cerradas que Evaluaciones ya sembró) → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar las 5 rutas y la tabla nueva; ningún otro módulo depende de Competencias.

## Open Questions

(ninguna)
