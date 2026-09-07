# Tareas — Backend: módulo Catálogo de habilidades

## 1. Domain

- [x] 1.1 Crear `ValueObjects/SkillGroup.cs` (catálogo cerrado: `Human`/Humana, `Technical`/Técnica). Verificar con tests: valores en el orden del contrato y `From` inválido lanza listando los válidos.
- [x] 1.2 Crear `Entities/SkillLevelCriteria.cs` (poseída, ctor privado sin parámetros para EF + ctor público `(int level, IReadOnlyList<string> criteria)`: nivel 1–4 vía `Level.From`, cada criterio no vacío tras `Trim()`) y `Entities/SkillExpectation.cs` (poseída: `(string position, int level)`, cargo no vacío, nivel vía `Level.From`). Verificar con tests: nivel fuera de 1–4 lanza, criterio vacío lanza, cargo vacío lanza.
- [x] 1.3 Crear `Entities/Skill.cs` (`AggregateRoot`): ctor `(string name, SkillGroup group, string description)` — nombre obligatorio ≤200, `active = true`, nace con los cuatro niveles vacíos (`SkillLevelCriteria` 1–4 sin criterios) y sin expectativas. Verificar con tests: nace activa con los cuatro niveles presentes y vacíos.
- [x] 1.4 `Skill.UpdateDetails(name, group, description)`, `Skill.SetActive(bool)`, `Skill.ReplaceCriteria(level, criteria)` (reemplaza el nivel indicado; 400 si el nivel no es 1–4 o hay un criterio vacío), `Skill.SetExpectation(position, level?)` (nivel nulo retira la expectativa del cargo; nivel presente la declara o reemplaza). Verificar con tests: reemplazar los criterios de Avanzado dos veces deja sólo la segunda lista; declarar dos veces el mismo cargo reemplaza, no duplica; nivel nulo quita la entrada del cargo si existía.
- [x] 1.5 Crear `Interfaces/ISkillRepository.cs` (`IRepository<Skill>` más `ExistsByNameAsync(name, excludeId?)` para la unicidad) y la entidad de versión `Entities/SkillCatalogVersion.cs` (fila única: entero `Value`, nace en 1, `Increment()`). Verificar: build.

## 2. Application — cargos vigentes, DTOs y use cases

- [x] 2.1 Crear `Skills/SkillCatalogPositions.cs`: `GetCurrentAsync(IPersonRepository, ct)` devuelve los cargos distintos de las personas registradas, ordenados con `OrdinalIgnoreCase`. Verificar con tests: cargos duplicados entre personas se listan una sola vez; orden alfabético.
- [x] 2.2 DTOs del contrato en `DataTransferObjects/SkillDtos.cs`: `SkillsCatalogDto`, `SkillDto`, `SkillLevelDto`, `PositionExpectationDto`, y los request DTOs (`UpsertSkillRequest`, `SetSkillActiveRequest`, `SetExpectationRequest`, `SetCriteriaRequest`). Verificar: un test que serializa a JSON y comprueba los nombres exactos del contrato (`group`, `active`, `levels`, `criteria`, `expectations`, `position`, `level`).
- [x] 2.3 Crear `Skills/SkillCatalogContext.cs` (o mapeo equivalente): arma `SkillDto` desde un `Skill` y los cargos vigentes, rellenando `expectations` con una entrada por cargo (nivel declarado o `null`). Verificar con tests: cargo sin expectativa declarada aparece con `level: null`; cargo con expectativa aparece con su nivel; dos cargos con niveles distintos no se pisan.
- [x] 2.4 `GetSkillsCatalog` (`GET /skills-catalog`): versión vigente + cargos vigentes + todas las habilidades mapeadas. Verificar con test: trae la versión y las habilidades en el orden en que se crearon.
- [x] 2.5 `CreateSkill` con su validador (nombre obligatorio y único sin distinguir mayúsculas/espacios, grupo válido): 400 con cada mensaje del mock; sube la versión. Verificar con tests: alta exitosa nace activa con los cuatro niveles vacíos; nombre repetido (con mayúsculas o espacios distintos) lanza 400; grupo inválido lanza 400.
- [x] 2.6 `UpdateSkill` (mismas reglas que el alta, excluyendo la propia habilidad de la comprobación de nombre): 404; 400. Verificar con tests: renombrar a un nombre ya usado por otra lanza; renombrar a su propio nombre actual no lanza.
- [x] 2.7 `DeleteSkill` (sin la guarda de uso, ver design.md): 404 si no existe; borra y sube la versión. Verificar con test.
- [x] 2.8 `SetSkillActive`: 404. Verificar con test: activar una desactivada y viceversa.
- [x] 2.9 `SetSkillExpectation` con su validador (cargo obligatorio y debe existir entre los vigentes; nivel 1–4 o nulo): 404; 400 con cada mensaje. Verificar con tests: cargo inexistente lanza; nivel nulo retira la expectativa; nivel fuera de 1–4 lanza.
- [x] 2.10 `SetSkillCriteria` con su validador (nivel de la ruta 1–4; lista de criterios, cada uno no vacío tras `Trim()`): 404; 400. Verificar con tests: nivel de ruta inválido lanza; criterio vacío lanza; la lista reemplaza la anterior completa.
- [x] 2.11 Registrar los siete use cases y sus validadores en `Application/DependencyInjection` bajo `// Catálogo de habilidades`. Verificar: build y el test de DI que resuelve el contenedor.

## 3. Infrastructure

- [x] 3.1 `SkillConfiguration` (tabla `Skills`; `Group` con converter a string; colecciones poseídas `Levels` (tabla `SkillLevelCriteria`, clave shadow, `Criteria` como JSON-como-texto) y `Expectations` (tabla `SkillExpectations`, clave shadow, `Position` + `Level`); índice por `Name`) y `SkillRepository` (`ExistsByNameAsync` case-insensitive). Verificar con un test sobre Sqlite en memoria: guardar una habilidad con sus cuatro niveles y dos expectativas, releerla y obtener los mismos valores.
- [x] 3.2 `SkillCatalogVersionConfiguration` y su repositorio vía `ISingleDocumentRepository<SkillCatalogVersion>` (mismo patrón que los agregados de fila única de Admin); `DbSet`s en `ApplicationDbContext`, migración nueva y registro en DI. Verificar con test: `GetAsync` sin fila previa no lanza y permite crear la primera en 1.
- [x] 3.3 Semillas: catálogo con habilidades técnicas y humanas, criterios en al menos un nivel de cada una, y expectativas para los cargos que `DevelopmentDataSeeder` ya siembra en Personas. Verificar: `dotnet run` y `GET /skills-catalog` devuelve las habilidades sembradas con sus niveles y expectativas.

## 4. WebApi y contrato

- [x] 4.1 `SkillsCatalogEndpoints`: las 7 rutas (`GET /skills-catalog`, `POST/PUT/DELETE /skills-catalog/skills[/{id}]`, `PUT /skills-catalog/skills/{id}/active`, `PUT /skills-catalog/skills/{id}/expectations`, `PUT /skills-catalog/skills/{id}/levels/{level}/criteria`); `Produces` con 200/201/204, 400 y 404 según cada una. Verificar: Swagger lista las 7 operaciones bajo `/api/v1/skills-catalog`.
- [x] 4.2 `Swagger/Examples/SkillsCatalogExamples.cs` con una habilidad técnica completa (los cuatro niveles con criterios y dos expectativas) y los cuerpos de alta/edición/criterios/expectativas. Verificar: Swagger muestra los ejemplos.

## 5. Verificación

- [x] 5.1 `dotnet build` + `dotnet test` en verde (sólo las fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 5.2 Smoke con Postgres local (`curl -sk`, `Idempotency-Key` en POST/PUT/DELETE): `GET /skills-catalog` trae las semillas con su versión; `POST /skills-catalog/skills` con nombre repetido (mayúsculas distintas) → 400, válido → 201 y sube la versión; `PUT .../active` alterna; `PUT .../expectations` con cargo inexistente → 400, con nivel nulo retira; `PUT .../levels/{level}/criteria` con nivel 5 → 400, con criterio vacío → 400, válido reemplaza en bloque; `DELETE` en una inexistente → 404, en una existente → 204 y desaparece del catálogo.
- [x] 5.3 `backend/ENDPOINTS.md`: Catálogo de habilidades 7🟢, total del resumen actualizado, dejando anotado que el borrado no comprueba uso en evaluaciones todavía (pendiente de ese módulo).
