# Diseño — Backend: módulo Catálogo de habilidades

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`SkillsCatalogDto`, `SkillDto`, `SkillLevelDto`, `PositionExpectationDto`, enums `SkillGroup`/`SkillLevel`, y los request DTOs `UpsertSkillRequest`, `SetSkillActiveRequest`, `SetExpectationRequest`, `SetCriteriaRequest`). La semántica canónica vive en `frontend/src/mocks/handlers/skills.handlers.ts` (`toDto`, `currentPositions`, `readUpsert`, versión y `publish`) y sus semillas en `skills.seeds.ts`. Las reglas de negocio están en `openspec/specs/skills-catalog/spec.md`.

Convenciones ya asentadas en los ocho módulos anteriores: agregados `AggregateRoot` con las invariantes en el constructor y en los métodos; entidades poseídas con ctor privado sin parámetros + propiedades de sólo lectura pública, para que EF las materialice por propiedades (la lección de Prefacturación: un ctor con parámetros que no calzan uno a uno con las propiedades, o que recibe otro tipo poseído, rompe el *constructor binding* de EF); `IEndpointDefinition` por módulo; ejemplos Swagger con `IExamplesProvider`; provider InMemory/Postgres con semillas en `DevelopmentDataSeeder`.

## Goals / Non-Goals

**Goals**
- Los 7 endpoints en 🟢, con exactamente las reglas y mensajes que hoy produce el mock.
- Dejar el catálogo (habilidades, niveles, criterios, expectativas por cargo) en un solo lugar, listo para que Evaluaciones y Competencias lo lean sin duplicarlo.

**Non-Goals**
- Evaluaciones, Competencias (span y planes), la guarda de borrado por uso en evaluaciones (no hay todavía qué preguntar), historial de versiones publicadas (sólo el contador).

## Decisions

1. **`Skill` como agregado con las invariantes de forma adentro; la unicidad del nombre, afuera.** Nombre obligatorio, grupo válido, criterio no vacío, nivel 1–4: son del agregado. Que el nombre no choque con otra habilidad exige mirar el conjunto completo, así que vive en el use case — mismo reparto que ya usan `Absence`/`CreateAbsenceUseCase` con el solape.

2. **Los cuatro niveles son fijos, no una colección libre.** `Skill` nace con `SkillLevelCriteria` para 1, 2, 3 y 4 siempre presentes (criterios vacíos), y no expone forma de agregar o quitar un nivel — sólo `ReplaceCriteria(level, criteria)` reemplaza los de uno. Es la regla del spec ("toda habilidad SHALL tener exactamente los cuatro niveles... sin poder agregarlos ni quitarlos"), y evita que el catálogo permita una habilidad con tres niveles o cinco.

3. **`Level` (value object ya existente) para el nivel, no un `SkillLevel` nuevo.** El propio contrato y `ENDPOINTS.md` dicen que es la misma escala Tuya de 4 que ya usan seniority y stacks. Reutilizarlo evita dos catálogos cerrados idénticos que podrían divergir.

4. **`SkillExpectation` es una colección poseída dispersa: sólo los cargos con nivel declarado.** `Skill.Expectations` no tiene una entrada por cada cargo del chapter — eso lo arma el mapeo hacia el DTO, cruzando contra los cargos vigentes. Guardar sólo lo declarado evita reescribir el agregado entero cada vez que alguien da de alta una persona con un cargo nuevo.

5. **Los cargos se resuelven en vivo desde `IPersonRepository`, nunca se persisten en este módulo.** `CurrentPositions` (Application, reutilizable desde el mapeo de `GET` y desde la validación de `PUT .../expectations`) devuelve los cargos distintos de las personas registradas, ordenados con comparación insensible a mayúsculas apropiada para español. *Alternativa descartada*: un catálogo de cargos propio — duplicaría un dato que ya vive en Personas y se desincronizaría en la primera alta.

6. **El nivel esperado se declara por cargo, nunca por rol.** El rol (`PersonRole`) es un catálogo cerrado de 5 valores de participación en la aplicación y no una disciplina; `SetExpectationRequest.position` es el cargo (string libre, el mismo que trae `Person.Position`), validado contra los cargos vigentes — 400 si el cargo no existe entre las personas registradas.

7. **Comparación de nombres insensible a mayúsculas y espacios de borde, tras `Trim()`.** Cubre "QA" vs "qa " del mock con `StringComparison.OrdinalIgnoreCase`; el español no tiene casos especiales de mayúsculas (como el problema de la "I" turca) que Ordinal no resuelva, así que no hace falta una comparación por cultura.

8. **Versión como agregado de fila única**, mismo patrón que `SprintConfiguration`/`TallaBandSet` de Admin: `SkillCatalogVersion` con un entero, `ISingleDocumentRepository<SkillCatalogVersion>`. Cada use case que muta (alta, edición, activar/desactivar, criterios, expectativas — no el borrado, que hace desaparecer la habilidad sin dejar nada que versionar en ella) lee la versión vigente, la sube en uno y la guarda en la misma transacción que el cambio. *Alternativa descartada*: la versión como columna de un agregado de habilidad cualquiera — el contador es del catálogo completo, no de una habilidad, y viviría en un lugar arbitrario.

9. **Sin historial de versiones publicadas.** El mock guarda una copia completa del catálogo por cada versión, para que una evaluación cerrada pueda resolver "cómo se veía el catálogo cuando se cerró". Ese problema es de Evaluaciones, no de este módulo: cuando exista, lo resolverá copiando el snapshot de las habilidades usadas **dentro** del propio registro de la evaluación (como ya hace `Initiative.SaveEvaluation` con su snapshot), no reconsultando "la versión N" de este catálogo. Este cambio deja el contador subiendo y nada más.

10. **Borrar una habilidad no comprueba uso en evaluaciones — todavía no hay evaluaciones.** El spec y el mock impiden borrar una habilidad usada y ofrecen desactivarla; sin el agregado de Evaluaciones no existe qué preguntar, así que `DELETE` borra sin condición. Se anota en `ENDPOINTS.md` como pendiente: cuando Evaluaciones exista, este endpoint necesitará una guarda contra su repositorio.

11. **Persistencia con dos colecciones poseídas (`OwnsMany`), patrón `QuestionPool`/`PoolQuestion` de Admin.** `SkillLevelCriteria` (nivel, criterios como JSON-como-texto vía converter, igual que `CapabilityMixRow.PorTalla`) y `SkillExpectation` (cargo, nivel), cada una con clave shadow `int` autogenerada. Ambas entidades poseídas llevan ctor privado sin parámetros y propiedades de sólo lectura pública — la lección de `PrefactureDocument` en Prefacturación: un ctor cuyos parámetros no calzan exactamente con los tipos de las propiedades rompe la materialización de EF.

12. **Semillas con habilidades técnicas y humanas ya con criterios y expectativas**, sobre los cargos que `DevelopmentDataSeeder` ya siembra en Personas (Backend Dev, QA Engineer, Arquitecto, Data Engineer, etc.), para que el catálogo no llegue vacío la primera vez que Evaluaciones o Competencias lo consuman.

## Risks / Trade-offs

- [Sin la guarda de borrado por uso] → anotado en `ENDPOINTS.md`; Evaluaciones deberá agregarla al llegar, y hasta entonces borrar una habilidad usada en el frontend (que sigue contra su propio mock) no tiene equivalente real todavía.
- [Sin historial de versiones publicadas] → el contador sirve para que un cliente detecte que el catálogo cambió, pero no para reconstruir cómo se veía una versión anterior; ese problema se resuelve en Evaluaciones con un snapshot propio, no acá.
- [Los cargos dependen de qué personas hay sembradas] → si Personas no tiene gente con un cargo dado, `expectations` para ese cargo simplemente no aparece en ningún lado; es el mismo comportamiento del mock.
- [Comparación de nombres por `OrdinalIgnoreCase` en vez de por cultura] → suficiente para nombres en español típicos del catálogo; si en el futuro aparecen acentos con normalización distinta, se revisita.

## Migration Plan

Sin datos que migrar: tablas nuevas (`Skills`, `SkillLevelCriteria`, `SkillExpectations`, fila única de versión). Orden: Domain (value object + agregado + entidades poseídas) → Application (cargos vigentes + DTOs + use cases) → Infrastructure (configuración EF + repositorio + agregado de versión + semillas) → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar los endpoints y las tablas; ningún otro módulo depende todavía del catálogo.

## Open Questions

(ninguna)
