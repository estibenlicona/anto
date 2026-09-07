# Backend: módulo Catálogo de habilidades al contrato

## Why

Noveno ajuste del backend hacia el contrato (`backend/oas.json` + `backend/ENDPOINTS.md`). Catálogo de habilidades está 0🟢 7🔴 y es la base de la que dependen **Evaluaciones** y **Competencias (span y planes)**: ninguna de las dos puede evaluar a nadie ni calcular una brecha sin un catálogo de habilidades, sus criterios por nivel y el nivel que cada cargo exige. Es el mismo rol que cumplió Ausencias para Prefacturación — cerrarlo primero desbloquea los dos módulos que faltan de esa familia sin que cada uno reinvente su propio catálogo.

## What Changes

- **Domain — agregado `Skill`**: nombre (único, sin distinguir mayúsculas ni espacios de borde), grupo (`human|technical`), descripción, `active` (nace `true`), sus **cuatro niveles fijos** (1–4, la escala Tuya que ya vive en el value object `Level`) cada uno con una lista ordenada de criterios de largo libre, y las expectativas por cargo (nivel exigido, sólo para los cargos que lo tienen declarado — el resto se resuelve "sin definir" al responder). Nace con los cuatro niveles vacíos y sin expectativas.
- **Los cargos no son un catálogo propio**: `positions` sale de los cargos vigentes de las personas registradas (`IPersonRepository`, distintos, orden alfabético en español), igual que hace el mock — inventar una lista aparte la desincronizaría del alta de personas. `expectations` de la respuesta trae una entrada por cada cargo vigente, con nivel o `null` ("sin definir"), no sólo los que ya tienen algo declarado.
- **Versión del catálogo**: un contador de un solo agregado (patrón fila única de Admin) que sube en cada mutación — alta, edición, activar/desactivar, criterios o expectativas. Las evaluaciones cerradas (fuera de alcance acá) congelarán su propio snapshot de habilidades al cerrarse; este cambio sólo deja el contador subiendo, no la historia de versiones publicadas — eso lo decide el diseño de Evaluaciones cuando llegue.
- **Endpoints del contrato**: `GET /skills-catalog` (versión vigente, cargos vigentes y las habilidades con sus niveles y expectativas), `POST /skills-catalog/skills` (alta con nombre único y grupo; 400 con nombre vacío, repetido o grupo inválido), `PUT /skills-catalog/skills/{id}` (edita nombre/grupo/descripción con las mismas reglas), `DELETE /skills-catalog/skills/{id}` (borra; 404 si no existe), `PUT /skills-catalog/skills/{id}/active` (retira o reactiva), `PUT /skills-catalog/skills/{id}/expectations` (declara o retira —con `level: null`— el nivel de un cargo; 400 si el cargo no está entre los vigentes o el nivel no es 1–4), `PUT /skills-catalog/skills/{id}/levels/{level}/criteria` (reemplaza en bloque los criterios de un nivel; 400 con nivel fuera de 1–4 o un criterio vacío).
- **Semillas**: catálogo inicial con habilidades técnicas y humanas típicas del chapter, con criterios en al menos un nivel de cada una y expectativas declaradas para los cargos ya sembrados por Personas.
- Fuera de alcance: **el borrado bloqueado por uso en evaluaciones** — el mock lo impide y ofrece desactivar en su lugar, pero sin el módulo de Evaluaciones no existe todavía qué preguntarle; `DELETE` borra sin esa guarda, y queda anotado como pendiente para cuando Evaluaciones exista. También fuera de alcance: el propio módulo de Evaluaciones, Competencias (span y planes), e historial de versiones publicadas del catálogo (sólo sube el contador).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — implementa lo que `backend-contract`, `backend/oas.json` y `openspec/specs/skills-catalog/spec.md` ya exigen. El cambio declara `skip_specs`.)

## Impact

- `backend/src`: Domain (agregado `Skill`, value object `SkillGroup`, entidades poseídas `SkillLevelCriteria` y `SkillExpectation`, reutiliza el value object `Level` ya existente, contrato de repositorio), Application (DTOs del contrato, resolución de cargos vigentes desde Personas, seis use cases con sus validadores, registro en DI), Infrastructure (configuración EF con las dos colecciones poseídas, repositorio, agregado de fila única para la versión, semillas), WebApi (`SkillsCatalogEndpoints` y ejemplos Swagger).
- `backend/tests`: invariantes del agregado (nombre obligatorio, criterio vacío, nivel fuera de 1–4), el use case de cada 400, el cálculo de cargos vigentes y el relleno de expectativas con `null` para los que no tienen nivel declarado, y la versión subiendo en cada mutación.
- `backend/ENDPOINTS.md`: Catálogo de habilidades hacia 7🟢, total actualizado, y nota explícita del borrado sin la guarda de uso (pendiente de Evaluaciones).
- Sin cambios al contrato: `backend/oas.json` ya tiene las 7 rutas y sus esquemas.
- Migración nueva (tablas `Skills`, `SkillLevelCriteria`, `SkillExpectations` y la fila única de versión, vacías salvo por las semillas de desarrollo).
