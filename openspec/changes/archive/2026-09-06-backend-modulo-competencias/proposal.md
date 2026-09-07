# Backend: módulo Competencias (span y planes) al contrato

## Why

Undécimo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Competencias está 0🟢 5🔴 y es la última pieza de la familia que empezó con el Catálogo de habilidades y siguió con Evaluaciones: ambas ya están 🟢 y archivadas, y entre las dos dejan todo lo que el span necesita — catálogo de habilidades con expectativas por cargo, y evaluaciones cerradas con nivel alcanzado por habilidad. Con esto cerrado, el backend agota la familia de habilidades/desarrollo del chapter.

## What Changes

- **Domain — agregado `PlanAction`**: persona, habilidad, nivel de partida (congelado al crearla, desde el nivel que la última evaluación cerrada le dio), nivel objetivo, mes de compromiso (`YYYY-MM`), título y estado (`InProgress|Done`). Es el único dato con estado propio de este módulo — el span y el perfil se derivan por completo del catálogo y de las evaluaciones cerradas, sin persistir nada de eso.
- **Sin agregado para el span ni el perfil**: `SpanMatrixDto`, `SpanSummaryDto` y `PersonPlanDto` se calculan en cada petición cruzando el catálogo de habilidades **vigente** con la evaluación cerrada **más reciente** de cada persona (por cargo actual, no por el que tenía al evaluarse). Es deliberado que la brecha de hoy se mida contra el cargo y el catálogo de hoy, aunque la evaluación sea de hace dos ciclos — es la diferencia con `GET /people/{id}/assessment` (Evaluaciones), que sí congela la exigencia al cerrar.
- **Nombre y criterios de una habilidad evaluada salen de lo que la evaluación registró**, no del catálogo vigente: `PlanSkillDto.skillName`/`group`/`metCriteria`/`missingCriteria` usan el recorte congelado de `AssessmentSkillAnswer` (`FrozenSkillName`, `FrozenGroup`, `FrozenLevels`) que Evaluaciones ya captura al cerrar — sólo `expectedLevel` (y por tanto `gap`) se recalcula contra el catálogo y el cargo vigentes.
- **Una brecha se cierra reevaluando, nunca marcando una acción**: `PUT .../plan/actions/{id}/status` sólo cambia el estado de la acción; el nivel (y por tanto la brecha) siempre sale de la evaluación cerrada más reciente, nunca de una acción.
- **Endpoints del contrato**: `GET /career-plan/span` (matriz persona × habilidad activa, sin filtros de servidor — los filtros de grupo/orden son de la pantalla), `GET /career-plan/span/summary` (los cuatro indicadores, la serie por ciclo, las habilidades foco y los pendientes de gestión, todos calculados del lado del servidor para no pedir el plan de cada persona), `GET /career-plan/people/{personId}/plan` (404 si la persona no existe; perfil vacío con `cycle: null` si nunca se evaluó), `POST .../plan/actions` (400 si la habilidad no está entre las evaluadas de esa persona, si no tiene brecha registrada, si el nivel objetivo no es 1-4, si no es mayor al nivel alcanzado, si el mes no tiene forma `YYYY-MM`, o si falta el título; 201 con el plan completo), `PUT .../plan/actions/{actionId}/status` (404 si la acción no existe para esa persona).
- Fuera de alcance: filtros de columnas/orden de la matriz (son de la pantalla, no del contrato — el contrato no declara parámetros de query para `GET /career-plan/span`), y el scope por chapter (claims), igual que el resto de los módulos.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/career-plan/spec.md` ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregado `PlanAction`, value object `PlanActionStatus`, contrato de repositorio), Application (`CareerPlanContext` que arma span/perfil cruzando `ISkillRepository`/`IPersonRepository`/`IAssessmentRepository`, DTOs del contrato, cinco use cases con sus validadores, registro en DI), Infrastructure (configuración EF, repositorio, semillas: acciones de plan sobre las evaluaciones cerradas ya sembradas por Evaluaciones), WebApi (`CareerPlanEndpoints` y ejemplos Swagger).
- `backend/tests`: invariantes del agregado (una acción no nace sin brecha ni con nivel objetivo menor o igual al actual), el cálculo del span y el resumen (brechas críticas ≥2 niveles, riesgo ≥3 brechas, la serie por ciclo comparando siempre contra la exigencia de hoy, los cuatro pendientes), y cada 400/404 de los use cases.
- `backend/ENDPOINTS.md`: Competencias hacia 5🟢, total actualizado.
- Sin cambios al contrato: `backend/oas.json` ya tiene las 5 rutas y sus esquemas.
- Migración nueva (tabla `PlanActions`, vacía salvo por las semillas de desarrollo).
