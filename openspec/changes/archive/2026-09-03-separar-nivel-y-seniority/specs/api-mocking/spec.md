## MODIFIED Requirements

### Requirement: Handler de mock para personas
El sistema SHALL exponer un handler de mock con CRUD completo de personas (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), asignación de proveedor (`PUT` a un sub-recurso, sin proveedor en el cuerpo del alta/edición), los catálogos de levels, seniorities y modalities (`GET`), un catálogo de solo lectura de compañías/proveedores (`GET`), y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. Cada persona SHALL llevar `level`/`levelLabel` (la escala Tuya 1–4: Principiante, Competente, Avanzado, Experto) y `seniority`/`seniorityLabel` (`Junior`, `Intermediate`, `Senior` — en español Junior, Intermedio, Senior); el campo numérico que antes viajaba como `seniority` SHALL viajar como `level`. El `GET` de listado SHALL aceptar además `search` (texto), `level` (uno o más valores), `seniority` (uno o más valores) y `stack` (uno o más nombres: personas con cualquiera de ellos), aplicando esos filtros antes de paginar. Cada persona SHALL llevar sus `stacks` (`name`, `level` 1–4, `isPrimary`), con datos de ejemplo que cubran el catálogo y al menos dos stacks que sólo una persona tenga. El handler SHALL exponer el catálogo de stacks del chapter (`GET`, solo lectura) y un `PUT` al sub-recurso de stacks de una persona que reemplaza su lista completa (400 si un stack no está en el catálogo, si hay más de un principal o si hay stacks y ninguno es principal). El resumen agregado SHALL incluir la cobertura por stack: cuántos stacks distintos hay y la lista de los que sólo una persona tiene.

#### Scenario: Listar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las personas actuales en memoria (datos de ejemplo iniciales, o los últimos cambios de la sesión)

#### Scenario: Crear una persona válida
- **WHEN** se hace un `POST` con una persona que cumple las reglas de validación (nombre ≤200, documento ≤50, usuario principal ≤250, cargo ≤100, rol ≤100, seniority entre 1 y 4, modalidad del catálogo, FTE disponible entre 0.0 y 1.0, costo mensual ≥0)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve

#### Scenario: Crear con datos inválidos
- **WHEN** se hace un `POST` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin agregar ninguna persona

#### Scenario: Editar una persona existente
- **WHEN** se hace un `PUT` a una persona que existe en memoria, con datos válidos
- **THEN** el handler actualiza esa persona y la devuelve

#### Scenario: Editar una persona inexistente
- **WHEN** se hace un `PUT` a un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Eliminar una persona
- **WHEN** se hace un `DELETE` a un id que existe en memoria
- **THEN** el handler la quita de la lista en memoria

#### Scenario: Asignar un proveedor a una persona
- **WHEN** se hace un `PUT` al sub-recurso de proveedor de una persona que existe en memoria, con un id de compañía del catálogo
- **THEN** el handler actualiza esa persona con el proveedor asignado, sin requerirlo en el cuerpo del alta o la edición

#### Scenario: Obtener los catálogos de seniority, modalidad y nivel SFIA
- **WHEN** se hace un `GET` a los endpoints mockeados de levels, seniorities o modalities
- **THEN** cada uno responde con sus valores vigentes (levels: los 4 niveles de la escala Tuya con su etiqueta — la escala que antes se sirvió como "seniorities" y antes como "nivel SFIA"; seniorities: `Junior`, `Intermediate`, `Senior` con sus etiquetas Junior, Intermedio, Senior; modalities: `Remote`, `Hybrid`, `OnSite`)

#### Scenario: Obtener el catálogo de compañías/proveedores
- **WHEN** se hace un `GET` al endpoint mockeado de compañías
- **THEN** responde con la lista de proveedores de ejemplo, sin exponer operaciones de alta, edición o baja sobre ese catálogo

#### Scenario: Buscar y filtrar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `search`, `level` o `seniority`
- **THEN** el handler filtra las personas en memoria por esos criterios antes de paginar, y el sobre paginado refleja el total y la paginación sobre el subconjunto filtrado

#### Scenario: Obtener el resumen agregado de personas
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de personas
- **THEN** el handler calcula, sobre todas las personas actuales en memoria (sin paginar ni filtrar), el total, el FTE disponible y la distribución por seniority; la capacidad objetivo usada para el % de FTE asignado es un valor fijo que el mock asume

#### Scenario: Filtrar por stack
- **WHEN** se hace un `GET` de listado con `stack=Azure&stack=MuleSoft`
- **THEN** responde sólo con las personas que tienen alguno de esos stacks, y `totalCount` cuenta ese subconjunto

#### Scenario: Reemplazar los stacks de una persona
- **WHEN** se hace un `PUT` al sub-recurso de stacks con una lista válida y un principal
- **THEN** el siguiente `GET` por id devuelve exactamente esa lista; el resumen recalcula la cobertura; con un stack fuera del catálogo o sin principal responde `400`

#### Scenario: Catálogo de stacks
- **WHEN** se hace un `GET` al catálogo de stacks
- **THEN** responde con los nombres del catálogo del chapter, ordenados, sin duplicados
