# Backend: módulo Evaluaciones al contrato

## Why

Décimo ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Evaluaciones está 0🟢 4🔴 y es la segunda pieza de la familia que empezó con el Catálogo de habilidades: sin evaluaciones cerradas no hay nivel alcanzado que comparar contra lo que un cargo exige, y **Competencias (span y planes)** no puede calcular una sola brecha. Cerrarlo agota lo que le falta a Competencias del lado del dato — el span queda como el último paso de la familia.

## What Changes

- **Domain — agregado `Assessment`**: persona, ciclo (`YYYY-S1|S2`), estado (`InProgress|Closed`), y una entrada por habilidad calificada (nivel alcanzado, criterios marcados por nivel, nota). Nace `InProgress` sin habilidades calificadas — se van agregando una a una al calificar, no todas de una vez al abrir. Calificar exige nota cuando el nivel queda por debajo de lo que el cargo pide (`hasGap`); sin brecha la nota es opcional. Cerrar exige que todas las habilidades activas del catálogo (más cualquiera que esta evaluación ya haya usado, aunque se haya desactivado después) tengan nivel.
- **Snapshot congelado sólo al cerrar, por habilidad**: mientras está en curso, la evaluación se resuelve siempre contra el catálogo **vigente** — si el catálogo cambia a mitad de una evaluación abierta, la evaluación lo ve de inmediato, igual que el mock. Al cerrar, cada habilidad calificada congela su nombre, grupo, los criterios de sus cuatro niveles y el nivel que el cargo exigía en ese momento; de ahí en adelante esa evaluación no vuelve a tocar el catálogo. Es la adaptación real de "estampar la versión del catálogo" del mock: sin guardar el catálogo entero por versión (que el cambio anterior dejó fuera de alcance), cada evaluación cerrada carga su propio recorte de lo que necesita para no moverse.
- **El nombre y el cargo de la persona nunca se congelan**: a diferencia de Prefacturación, la ficha de una evaluación —incluida una cerrada— siempre muestra el nombre y el cargo **vigentes** de la persona; es fidelidad exacta al mock, no una omisión.
- **Endpoints del contrato**: `GET /people/{personId}/assessment?cycle=` (404 si la persona no existe; sin ciclo, el vigente; la en curso si hay, si no la última cerrada de ese ciclo, si no `null` con 200), `POST /people/{personId}/assessment` (sin cuerpo — el contrato no lo trae, siempre abre el ciclo vigente; 400 si ya hay una en curso para esa persona y ciclo; 404 si la persona no existe), `PUT .../assessment/{assessmentId}/skills/{skillId}` (califica una habilidad; 404; 400 si está cerrada, si la habilidad no está en el alcance, si el nivel no es 1–4, o si hay brecha sin nota), `PUT .../assessment/{assessmentId}/close` (404; 400 si ya está cerrada o si faltan habilidades sin nivel, listándolas por nombre).
- **Cierra el pendiente que dejó el Catálogo de habilidades**: `DELETE /skills-catalog/skills/{id}` pasa a comprobar si alguna evaluación **cerrada** calificó esa habilidad (con nivel, no sólo listada); si la usó, 400 ofreciendo desactivarla en su lugar, con el mensaje del mock. Antes de este cambio esa guarda no existía porque no había qué preguntarle.
- **Semillas**: un par de evaluaciones cerradas de ciclos anteriores sobre personas ya sembradas, con algunas habilidades calificadas por debajo de lo exigido (para que exista al menos una brecha real), y una evaluación en curso del ciclo vigente para ver el flujo de calificar sin cerrar.
- Fuera de alcance: Competencias (span y planes) — este cambio le deja el dato, no lo consume —, y el propio historial de versiones del catálogo (cada evaluación sigue llevando su propio recorte, no una referencia a "la versión N").

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/skill-assessment/spec.md` ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregado `Assessment`, entidad poseída `AssessmentSkillAnswer` con su snapshot congelado opcional, value object `AssessmentStatus`, reutiliza `Level` y `SkillGroup` ya existentes, contrato de repositorio), Application (resolución del alcance de habilidades y del ciclo vigente, DTOs del contrato, cuatro use cases con sus validadores, registro en DI), Infrastructure (configuración EF con la entidad poseída y su snapshot congelado, repositorio, semillas), WebApi (`AssessmentsEndpoints` y ejemplos Swagger). También toca `DeleteSkillUseCase` (Catálogo de habilidades), que gana la guarda de uso pendiente.
- `backend/tests`: invariantes del agregado (nota obligatoria con brecha, cerrar incompleta lanza, cerrar una cerrada lanza), el use case de cada 400/404, el snapshot congelado sobreviviendo a un cambio posterior del catálogo, y la guarda de borrado nueva en Catálogo de habilidades.
- `backend/ENDPOINTS.md`: Evaluaciones hacia 4🟢, total actualizado, y la nota de Catálogo de habilidades actualizada porque la guarda de borrado ya no está pendiente.
- Sin cambios al contrato: `backend/oas.json` ya tiene las 4 rutas y sus esquemas.
- Migración nueva (tablas `Assessments` y `AssessmentSkillAnswers`, vacías salvo por las semillas de desarrollo).
