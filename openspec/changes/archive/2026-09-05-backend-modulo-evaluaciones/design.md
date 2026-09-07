# Diseño — Backend: módulo Evaluaciones

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`AssessmentDto`, `AssessmentSkillDto`, `AssessmentLevelDto`, `AssessmentCriterionDto`, `SaveSkillRequest`, enum `AssessmentStatus`). La semántica canónica vive en `frontend/src/mocks/handlers/assessments.handlers.ts` (`toDto`, `toSkillDto`, `skillsInScope`, `catalogFor`) y `frontend/src/features/assessments/services/assessmentService.ts` (`currentCycle`, `cycleBefore`). Las reglas de negocio están en `openspec/specs/skill-assessment/spec.md`.

Convenciones ya asentadas en los nueve módulos anteriores: agregados `AggregateRoot`; entidades poseídas con ctor privado sin parámetros + propiedades de sólo lectura, para que EF las materialice por propiedades; `IEndpointDefinition` por módulo; ejemplos Swagger con `IExamplesProvider`; provider InMemory/Postgres con semillas en `DevelopmentDataSeeder`. Este módulo lee `ISkillRepository` y `IPersonRepository` del Catálogo de habilidades y de Personas, y a su vez es leído por `DeleteSkillUseCase` del Catálogo (mismo patrón de composición entre repositorios de Application que ya usa Prefacturación con Ausencias, ahora en la dirección contraria).

## Goals / Non-Goals

**Goals**
- Los 4 endpoints en 🟢, con exactamente las reglas y mensajes que hoy produce el mock.
- Cerrar la guarda de borrado que el Catálogo de habilidades dejó pendiente, ahora que hay qué preguntarle.
- Dejar el nivel alcanzado y la brecha de cada persona listos para que Competencias (span y planes) los lea.

**Non-Goals**
- Competencias (span y planes), historial de versiones del catálogo (cada evaluación cerrada lleva su propio recorte, no una referencia a una versión guardada en otro lado).

## Decisions

1. **El catálogo con el que se resuelve una evaluación depende de su estado, no de un número de versión guardado en otro lado.** El cambio anterior (Catálogo de habilidades) dejó explícitamente fuera de alcance guardar el catálogo completo por versión — sólo un contador. El mock resuelve esto con `getSkillsCatalogVersion(n)`, que este backend no tiene. La adaptación real: **mientras está en curso, se lee siempre el catálogo vigente** (mismo comportamiento que el mock cuando `catalogVersion === null`); **al cerrar, cada habilidad calificada congela su propio recorte** —nombre, grupo, criterios de sus cuatro niveles, nivel exigido— dentro de la propia evaluación. Es el mismo patrón que `Initiative.SaveEvaluation` o el `FrozenDiscount` de Prefacturación: freeze puntual sobre lo usado, no un historial completo del catálogo.

2. **Las habilidades calificadas no se precargan al abrir.** El agregado nace sin ninguna: se agregan una a una a medida que se califican, igual que el mock (`skills: []` al abrir). El alcance —qué habilidades puede calificar esta evaluación— no vive en el agregado: lo resuelve el use case contra el catálogo vigente (activas, más cualquiera que esta evaluación ya haya usado), porque depende de datos externos que cambian con el tiempo.

3. **La nota obligatoria con brecha es una invariante del agregado, no del use case.** `Assessment.SaveSkill` recibe el nivel exigido ya resuelto (el use case lo saca del catálogo) y ahí mismo calcula si hay brecha (`exigido > alcanzado`) y exige la nota — mismo reparto que `Prefacture.Approve`, que recibe el descuento ya calculado y decide con él si la nota es obligatoria. *Alternativa descartada*: calcular `hasGap` en el use case y sólo pasar un booleano. Se descarta porque la regla "con brecha, nota obligatoria" es del significado de calificar una habilidad, no un detalle de transporte.

4. **`Close` recibe el recorte congelado ya armado; la completitud se valida antes, en el use case.** Qué habilidades están pendientes (para el mensaje "Faltan N habilidades: ...") exige leer el catálogo vigente y sus nombres — datos externos — así que esa validación vive en `CloseAssessmentUseCase`. El agregado sólo exige no estar ya cerrado y aplica el freeze que recibe.

5. **El nombre y el cargo de la persona se resuelven siempre en vivo, nunca se congelan** — ni siquiera al cerrar. Es una diferencia deliberada con Prefacturación (que congela el snapshot entero): acá el mock relee `personOf(id)` en cada respuesta sin excepción, incluida una evaluación cerrada de hace varios ciclos. Fidelidad al mock, no una omisión — si se congelara, una evaluación vieja mostraría un cargo que la persona ya no tiene, y el mock nunca hace eso.

6. **`AssessmentStatus` como catálogo cerrado nuevo** (`InProgress`/`Closed`), mismo patrón que `BillingStatus`. **`SkillLevel` sigue siendo el value object `Level`** ya existente — ninguna razón para duplicarlo acá tampoco.

7. **`AssessmentSkillAnswer` como entidad poseída con dos bloques de campos: la respuesta y el freeze.** `SkillId`, `Level` (nulo hasta calificar), `Met` (4 listas de textos marcados, una por nivel) y `Note` son la respuesta, mutable mientras la evaluación está en curso. `FrozenSkillName`, `FrozenGroup`, `FrozenLevels` (4 listas de criterios, el catálogo completo de ese nivel al momento de cerrar) y `FrozenExpectedLevel` son nulos hasta `Close` y de ahí en adelante fijos. Ambos bloques conviven en la misma fila porque describen la misma habilidad calificada en dos momentos de su vida, no dos conceptos distintos.

8. **El ciclo vigente se calcula con `TimeProvider`, no con `DateTime.UtcNow` directo** — mismo patrón que `SaveEvaluationUseCase` de Iniciativas. `YYYY-S1` para enero-junio, `YYYY-S2` para julio-diciembre. La validación de forma (`^\d{4}-S[12]$`) vive en el agregado, igual que el período de Prefacturación.

9. **`GET` sin evaluación devuelve `200` con cuerpo `null`, nunca `404`.** El 404 es sólo por persona inexistente; que la persona no tenga evaluación ese ciclo es un estado legítimo de la pantalla ("evalúala"), no un error. `POST` no lleva cuerpo — el contrato no lo declara — y siempre abre el ciclo vigente; pedir un ciclo distinto (para reabrir un ciclo pasado, por ejemplo) queda fuera de lo que el contrato permite hoy.

10. **`personId` de la ruta se valida contra el dueño real de la evaluación.** El mock busca la evaluación sólo por `assessmentId`, ignorando si el `personId` de la URL coincide — nunca lo necesita porque la UI ya arma la ruta bien. El backend, más estricto por venir de cualquier cliente, responde 404 si `assessmentId` existe pero pertenece a otra persona: la URL afirma una relación y hay que cumplirla.

11. **`DeleteSkillUseCase` (Catálogo de habilidades) gana `IAssessmentRepository`.** La guarda pendiente — "no se borra una habilidad que alguna evaluación cerrada calificó" — ya tiene qué preguntarle. `ExistsUsingClosedSkillAsync(skillId)` busca, entre las evaluaciones cerradas, alguna respuesta con ese `skillId` y `Level` no nulo (una habilidad sin calificar, aunque estuviera "en el alcance", no cuenta como usada). 400 con el mensaje y la sugerencia de desactivar, calcada del mock.

12. **Persistencia con una colección poseída (`OwnsMany`), patrón ya usado en el Catálogo de habilidades.** `AssessmentSkillAnswer` con clave shadow `int`; `Met` y `FrozenLevels` (listas de listas de texto) como JSON-como-texto vía converter, reutilizando `ModelParameterJson`.

13. **Semillas con un par de evaluaciones cerradas de ciclos anteriores** (con `cycleBefore` recalculado en el seeder, no fechas fijas) **y una en curso del ciclo vigente**, sobre personas que el Catálogo de habilidades ya usó en sus expectativas, con al menos una habilidad calificada por debajo de lo exigido para que exista una brecha real desde el primer arranque.

## Risks / Trade-offs

- [Cada evaluación cerrada carga su propio recorte del catálogo en vez de referenciar una versión compartida] → algo de duplicación de texto entre evaluaciones que cerraron con el mismo catálogo; aceptado porque el cambio anterior ya decidió no guardar historial de versiones, y es el mismo costo que ya paga `Initiative.SaveEvaluation`.
- [El nombre y el cargo de la persona no se congelan] → una evaluación cerrada puede mostrar un cargo distinto al que tenía cuando se evaluó; es fidelidad exacta al mock, documentada acá para que no se lea como un olvido.
- [`personId` validado más estricto que el mock] → un cliente que arme mal la URL recibe 404 en vez de que el backend ignore silenciosamente el desajuste; no cambia ningún camino que la UI real use.
- [Sin scope por chapter] → igual que los nueve módulos anteriores; pendiente del ajuste de seguridad.

## Migration Plan

Sin datos que migrar: tablas nuevas (`Assessments`, `AssessmentSkillAnswers`). Orden: Domain (value object + agregado + entidad poseída) → Application (alcance de habilidades, ciclo vigente, DTOs, use cases) → Infrastructure (configuración EF + repositorio + semillas) → el ajuste en `DeleteSkillUseCase` → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar los endpoints y las tablas, y revertir `DeleteSkillUseCase` a su versión sin guarda; ningún otro módulo depende todavía de Evaluaciones.

## Open Questions

(ninguna)
