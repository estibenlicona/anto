# Tareas — Backend: módulo Evaluaciones

## 1. Domain

- [x] 1.1 Crear `ValueObjects/AssessmentStatus.cs` (catálogo cerrado: `InProgress`/EnCurso, `Closed`/Cerrada). Verificar con tests: valores en el orden del contrato y `From` inválido lanza listando los válidos.
- [x] 1.2 Crear `Entities/AssessmentSkillAnswer.cs` (poseída, ctor privado sin parámetros para EF + ctor público `(Guid skillId)`): `SetAnswer(level, met, note)` guarda la respuesta (nivel vía `Level.From`); `Freeze(skillName, group, levelsCriteria, expectedLevel)` fija los campos congelados, sólo llamable una vez desde `Assessment.Close`. Verificar con tests: `SetAnswer` con nivel fuera de 1–4 lanza; antes de `Freeze` los campos congelados son nulos; después, quedan fijos.
- [x] 1.3 Crear `Entities/Assessment.cs` (`AggregateRoot`): ctor `(Guid personId, string cycle)` — cargo de la persona no se guarda acá (se resuelve en vivo); ciclo con forma `YYYY-S1|S2` (400 si no calza); nace `InProgress`, sin habilidades calificadas. Verificar con tests: nace en curso sin habilidades; ciclo con forma inválida lanza (`""`, `"2026-S3"`, `"2026"`).
- [x] 1.4 `Assessment.SaveSkill(skillId, level, met, note, expectedLevel)`: 400 si está cerrada ("La evaluación está cerrada. Para corregirla hay que evaluar de nuevo."); si `expectedLevel > level` (brecha) y la nota está vacía, 400 ("Con brecha la nota es obligatoria: es lo que sostiene la acción del plan."); si no hay guarda que lo bloquee, agrega o reemplaza la respuesta de esa habilidad. Verificar con tests: calificar sin brecha sin nota no lanza; calificar con brecha sin nota lanza; calificar dos veces la misma habilidad reemplaza, no duplica; calificar una cerrada lanza.
- [x] 1.5 `Assessment.Close(frozenBySkillId, closedAtUtc)`: 400 si ya está cerrada ("La evaluación ya está cerrada"); si no, congela cada respuesta existente con su recorte (`Freeze`), pasa a `Closed` y fija `ClosedAtUtc`. Verificar con tests: cerrar deja `Closed` con `ClosedAtUtc` fijado y cada respuesta con sus campos congelados; cerrar una ya cerrada lanza.
- [x] 1.6 Crear `Interfaces/IAssessmentRepository.cs` (`IRepository<Assessment>` más `GetByPersonAndCycleAsync(personId, cycle)` y `ExistsUsingClosedSkillAsync(skillId)` para la guarda de borrado del Catálogo). Verificar: build.

## 2. Application — alcance, ciclo vigente, DTOs y use cases

- [x] 2.1 Crear `Assessments/AssessmentCycle.cs`: `Current(TimeProvider)` (`YYYY-S1` enero-junio, `YYYY-S2` julio-diciembre) e `IsValidFormat(string)`. Verificar con tests: enero y junio dan S1, julio y diciembre dan S2; formas inválidas (`"2026-S3"`, `"26-S1"`) devuelven `false`.
- [x] 2.2 Crear `Assessments/AssessmentSkillScope.cs`: dado el catálogo completo (`ISkillRepository.GetAllAsync`) y una evaluación, devuelve las habilidades en su alcance — activas, más cualquiera que la evaluación ya haya usado aunque se haya desactivado. Verificar con tests: una habilidad inactiva sin usar queda fuera; una inactiva ya calificada por esta evaluación se mantiene.
- [x] 2.3 DTOs del contrato en `DataTransferObjects/AssessmentDtos.cs`: `AssessmentDto`, `AssessmentSkillDto`, `AssessmentLevelDto`, `AssessmentCriterionDto`, y `SaveSkillRequest`. Verificar: un test que serializa a JSON y comprueba los nombres exactos del contrato (`catalogVersion`, `closedAtUtc`, `expectedLevel`, `missingCriteria`, `levels`, `criteria`, `met`).
- [x] 2.4 Crear `Assessments/AssessmentMappings.cs`: arma `AssessmentSkillDto` para una respuesta — desde el catálogo vigente si la evaluación está en curso, desde el recorte congelado si está cerrada —, calculando `gap` (`max(0, exigido − alcanzado)`, `null` sin nivel exigido o sin calificar) y `missingCriteria` (sólo con brecha > 0, los criterios del nivel exigido sin marcar). Verificar con tests: en curso refleja un cambio reciente del catálogo; cerrada no se mueve aunque el catálogo cambie después; `missingCriteria` vacío sin brecha.
- [x] 2.5 `GetAssessment` (`GET /people/{personId}/assessment?cycle=`): 404 si la persona no existe; sin ciclo, el vigente; devuelve la en curso de ese ciclo o, si no hay, la última cerrada; `null` si ninguna. Verificar con tests: persona inexistente lanza 404; sin evaluaciones devuelve `null`; con una en curso y una cerrada del mismo ciclo, devuelve la en curso.
- [x] 2.6 `OpenAssessment` (`POST /people/{personId}/assessment`, sin cuerpo): 404 si la persona no existe; 400 si ya hay una en curso para esa persona y el ciclo vigente. Verificar con tests: primera apertura crea en curso sin habilidades; abrir una segunda vez el mismo ciclo lanza.
- [x] 2.7 `SaveAssessmentSkill` (`PUT .../skills/{skillId}`) con su validador: 404 si la evaluación no existe o si `personId` no es su dueña; 400 si la habilidad no está en el alcance, o las guardas del agregado (1.4); filtra `met` contra los criterios reales del catálogo (un texto que no exista en ese nivel no se guarda). Verificar con tests: habilidad fuera de alcance lanza; texto de criterio inventado no se guarda; calificar con brecha sin nota lanza con el mensaje del mock.
- [x] 2.8 `CloseAssessment` (`PUT .../close`): 404 si la evaluación no existe o si `personId` no es su dueña; 400 si ya está cerrada o si faltan habilidades activas sin nivel, listándolas por nombre; congela el recorte de cada habilidad calificada y cierra. Verificar con tests: cerrar con todas calificadas funciona y congela; faltando una lanza listando su nombre; cerrar una ya cerrada lanza.
- [x] 2.9 Registrar los cuatro use cases y su validador en `Application/DependencyInjection` bajo `// Evaluaciones`. Verificar: build y el test de DI que resuelve el contenedor.

## 3. Cierra el pendiente del Catálogo de habilidades

- [x] 3.1 `DeleteSkillUseCase` gana `IAssessmentRepository`: 400 si `ExistsUsingClosedSkillAsync(id)` es verdadero, con el mensaje del mock ("ya se usó en evaluaciones cerradas y no se puede eliminar. Desactivarla la saca de las evaluaciones nuevas y deja las anteriores como están."). Verificar con tests: borrar una habilidad usada en una evaluación cerrada lanza; borrar una sin usar sigue funcionando; borrar una usada sólo en una evaluación **en curso** (sin calificar con nivel) no lanza.

## 4. Infrastructure

- [x] 4.1 `AssessmentConfiguration` (tabla `Assessments`; `Status` con converter a string; colección poseída `Skills` (tabla `AssessmentSkillAnswers`, clave shadow, `Met` y `FrozenLevels` como JSON-como-texto); índice por `(PersonId, Cycle)`) y `AssessmentRepository`. `DbSet`s en `ApplicationDbContext`, migración nueva y registro en DI. Verificar con un test sobre Sqlite en memoria: guardar una evaluación cerrada con una habilidad congelada, releerla y obtener los mismos valores.
- [x] 4.2 Semillas: un par de evaluaciones cerradas de ciclos anteriores (fechas relativas, como las de Ausencias) con al menos una brecha real, y una en curso del ciclo vigente. Verificar: `dotnet run` y `GET /people/{id}/assessment` devuelve lo esperado para las personas sembradas.

## 5. WebApi y contrato

- [x] 5.1 `AssessmentsEndpoints`: las 4 rutas (`GET`, `POST`, `PUT .../skills/{skillId}`, `PUT .../close`); `Produces` con 200/201, 400 y 404 según cada una. Verificar: Swagger lista las 4 operaciones bajo `/api/v1/people/{personId}/assessment`.
- [x] 5.2 `Swagger/Examples/AssessmentsExamples.cs` con una evaluación en curso (una habilidad calificada, otra pendiente) y una cerrada con una brecha. Verificar: Swagger muestra los ejemplos.

## 6. Verificación

- [x] 6.1 `dotnet build` + `dotnet test` en verde (sólo las fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 6.2 Smoke con Postgres local (`curl -sk`, `Idempotency-Key` en POST/PUT): abrir evaluación de una persona sembrada → 201 en curso; abrir dos veces el mismo ciclo → 400; calificar una habilidad con brecha sin nota → 400, con nota → 200; calificar una habilidad fuera del alcance → 400; cerrar incompleta → 400 listando lo que falta; calificar todo y cerrar → 200 y `GET` posterior sigue igual aunque se edite el catálogo; intentar borrar del Catálogo la habilidad usada en la cerrada → 400 con la sugerencia de desactivar; `personId` que no es dueño de la evaluación → 404.
- [x] 6.3 `backend/ENDPOINTS.md`: Evaluaciones 4🟢, total del resumen actualizado, y la nota de Catálogo de habilidades actualizada porque la guarda de borrado ya no está pendiente.
