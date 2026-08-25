## MODIFIED Requirements

### Requirement: Handler de mock para personas
El sistema SHALL exponer un handler de mock con CRUD completo de personas (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), asignación de proveedor (`PUT` a un sub-recurso, sin proveedor en el cuerpo del alta/edición), los catálogos de seniorities y modalities (`GET`), un catálogo de solo lectura de compañías/proveedores (`GET`), y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El `GET` de listado SHALL aceptar además `search` (texto), `seniority` (uno o más valores) y `stack` (uno o más nombres: personas con cualquiera de ellos), aplicando esos filtros antes de paginar. Cada persona SHALL llevar sus `stacks` (`name`, `level` 1–4, `isPrimary`), con datos de ejemplo que cubran el catálogo y al menos dos stacks que sólo una persona tenga. El handler SHALL exponer el catálogo de stacks del chapter (`GET`, solo lectura) y un `PUT` al sub-recurso de stacks de una persona que reemplaza su lista completa (400 si un stack no está en el catálogo, si hay más de un principal o si hay stacks y ninguno es principal). El resumen agregado SHALL incluir la cobertura por stack: cuántos stacks distintos hay y la lista de los que sólo una persona tiene.

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
- **WHEN** se hace un `GET` a los endpoints mockeados de seniorities o modalities
- **THEN** cada uno responde con sus valores vigentes (seniorities: los 4 niveles de la escala Tuya con su etiqueta — el mismo catálogo que antes se llamaba "nivel SFIA", ya fusionado; modalities: `Remote`, `Hybrid`, `OnSite`); el endpoint `sfia-levels` ya no existe por separado

#### Scenario: Obtener el catálogo de compañías/proveedores
- **WHEN** se hace un `GET` al endpoint mockeado de compañías
- **THEN** responde con la lista de proveedores de ejemplo, sin exponer operaciones de alta, edición o baja sobre ese catálogo

#### Scenario: Buscar y filtrar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `search` o `seniority`
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

### Requirement: Handler de mock para el detalle de una persona
El sistema SHALL exponer un handler de mock con un `GET` de detalle por persona que devuelve, en una sola respuesta, todo lo que la página de detalle necesita: los datos de la persona (los mismos del `GET` por id de personas, más la etiqueta en español de la modalidad, el nivel SFIA derivado del seniority, y la vinculación con proveedor y vigencia de contrato si es externa); su asignación actual (célula con nombre, criticidad y tribu, nombres de los compañeros, dedicación, BAU, Transformación y fecha de inicio) o `null`; el FTE real del último sprint validado; el reporte de horas del sprint actual (sprint, horas del sprint, rango de tolerancia, horas BAU / Iniciativa / Libre, estado `NotReported | Draft | Submitted | Validated`, fechas de envío y cierre) o `null`; los últimos seis sprints con sus horas BAU e Iniciativa y estado; la identidad DevOps (vinculada con usuario y fecha, o `null` con las identidades candidatas por nombre) y sus items activos por tipo y pendientes de curación; los stacks que cubre, derivados de los `stacks` de la persona en el mock de personas (nombre, nivel, si es el principal, cuántas personas más del chapter lo tienen y quiénes — id y nombre — hasta tres); el chapter y su lead; la lectura de concordancia costo / seniority; el SFIA requerido por su célula para su capacidad; y, sin célula, las células que piden su capacidad (id, nombre, motivo, SFIA requerido, FTE asignado y disponible).

La asignación, la célula, los compañeros y las células sugeridas SHALL derivarse de los mocks actuales en memoria de personas, asignaciones y células (no de copias propias), de modo que asignar, mover o quitar en la misma sesión se refleje en el siguiente `GET`. Las horas, la identidad DevOps, los items y las capacidades SHALL salir de datos de ejemplo propios del handler, con al menos una persona con reporte "Por validar" y exceso sobre lo asignado, una sin identidad DevOps, y una con un stack de bus factor 1 (derivado, no sembrado).

El handler SHALL exponer además un `POST` para validar el reporte de horas de un sprint (pasa a `Validated` y recalcula el FTE real) y un `POST` para vincular una identidad DevOps (a partir de una identidad candidata), persistiendo ambos en memoria durante la sesión, disponibles tanto en modo Node (tests) como en modo navegador.

#### Scenario: Detalle de una persona con célula
- **WHEN** se hace un `GET` al endpoint mockeado de detalle de una persona que tiene una asignación
- **THEN** responde con la persona, su asignación derivada del mock de asignaciones (célula, criticidad, tribu y compañeros tomados de los mocks de células y asignaciones), el reporte del sprint actual, los últimos seis sprints, la identidad DevOps, las capacidades y la ficha

#### Scenario: Detalle de una persona sin célula
- **WHEN** se hace un `GET` al detalle de una persona sin asignación
- **THEN** `allocation` es `null`, el reporte del sprint actual es `null`, y la respuesta incluye las células que piden su capacidad con el SFIA requerido y el FTE asignado sobre disponible de cada una

#### Scenario: El detalle sigue a los cambios de asignación
- **WHEN** en la misma sesión se crea, edita o elimina una asignación de esa persona por el handler de asignaciones
- **THEN** el siguiente `GET` del detalle refleja la nueva célula, dedicación o la ausencia de asignación

#### Scenario: Validar el reporte de horas
- **WHEN** se hace un `POST` de validación sobre el sprint actual de una persona con reporte `Submitted`
- **THEN** responde `200`, el siguiente `GET` devuelve ese reporte en `Validated` y el FTE real del último sprint validado recalculado con sus horas; sobre un reporte que no está en `Submitted` responde `409`

#### Scenario: Vincular identidad DevOps
- **WHEN** se hace un `POST` de vinculación con el id de una identidad candidata para una persona sin identidad
- **THEN** responde `200`, y el siguiente `GET` devuelve la identidad vinculada con la fecha de hoy y los items de ejemplo de esa identidad; con un id de identidad desconocido responde `404`

#### Scenario: Persona inexistente
- **WHEN** se hace un `GET` al detalle con un id que no existe
- **THEN** responde `404`

#### Scenario: Los stacks del detalle siguen a la edición
- **WHEN** en la misma sesión se reemplazan los stacks de la persona por el handler de personas
- **THEN** el siguiente `GET` del detalle devuelve los stacks nuevos con su cobertura recalculada sobre el resto del chapter
