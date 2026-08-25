## ADDED Requirements

### Requirement: Handler de mock para el resumen del equipo de una célula
El sistema SHALL exponer un `GET` mockeado con el resumen del equipo de una célula, calculado sobre todas sus asignaciones actuales en memoria y las personas en memoria: cantidad de personas, todas ellas (id y nombre) para los avatares, cuántas son de nivel Experto y cuántas de nivel Principiante, FTE asignado con su desglose BAU / Transformación, y el FTE disponible del equipo (suma del `availableFte` de las personas asignadas).

#### Scenario: Resumen del equipo de una célula existente
- **WHEN** se hace un `GET` al endpoint mockeado de resumen del equipo de una célula que existe
- **THEN** responde con los conteos y FTE calculados sobre las asignaciones y personas actuales en memoria

#### Scenario: Resumen de una célula sin asignaciones
- **WHEN** la célula existe pero no tiene asignaciones
- **THEN** responde con ceros y una lista de personas vacía

#### Scenario: Resumen de una célula inexistente
- **WHEN** el id no corresponde a ninguna célula en memoria
- **THEN** responde con un error HTTP (404)

## MODIFIED Requirements

### Requirement: Handler de mock para asignaciones
El sistema SHALL exponer un handler de mock con las asignaciones de personas a células: `GET` paginado de las asignaciones de una célula, `POST` alta, `PUT` edición, `DELETE` baja, persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. Cada asignación devuelta SHALL incluir campos de sólo lectura derivados de la persona en memoria del mock de personas (cargo, modalidad, seniority y su etiqueta) y de todas las asignaciones de esa persona (porcentaje disponible = 100 − Σ dedicación en todas sus células, y porcentaje comprometido en otras células). El `GET` de listado SHALL aceptar además `search` (nombre o cargo de la persona) y `seniority` (uno o más valores), aplicando esos filtros antes de paginar.

#### Scenario: Listar las asignaciones de una célula
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las asignaciones actuales en memoria de esa célula (datos de ejemplo iniciales, o los últimos cambios de la sesión), con los campos de persona y disponibilidad en cada una

#### Scenario: Campos de persona y disponibilidad
- **WHEN** una persona tiene 40% en la célula consultada y 60% en otra
- **THEN** su asignación sale con el cargo, modalidad y seniority de la persona, 0 de porcentaje disponible y 60 de porcentaje en otras células

#### Scenario: Buscar y filtrar asignaciones mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula con `search` o `seniority`
- **THEN** el handler filtra por nombre o cargo de la persona y por los seniorities indicados antes de paginar, y el sobre paginado refleja el total sobre el subconjunto filtrado

#### Scenario: Crear una asignación válida
- **WHEN** se hace un `POST` con una asignación que cumple las reglas de validación (persona y célula existentes, % de dedicación entre 1 y 100, % BAU y % Transformación entre 0 y 100 cada uno y cuya suma sea igual al % de dedicación)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve con los campos de persona y disponibilidad

#### Scenario: Crear con datos inválidos
- **WHEN** se hace un `POST` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin agregar ninguna asignación

#### Scenario: Editar una asignación existente
- **WHEN** se hace un `PUT` a una asignación que existe en memoria, con datos válidos
- **THEN** el handler actualiza esa asignación y la devuelve

#### Scenario: Editar una asignación inexistente
- **WHEN** se hace un `PUT` a un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Eliminar una asignación
- **WHEN** se hace un `DELETE` a un id que existe en memoria
- **THEN** el handler la quita de la lista en memoria

### Requirement: Handler de mock para células
El sistema SHALL exponer un handler de mock con CRUD completo de células (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), el catálogo de criticidades (`GET`) y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El `GET` de listado SHALL aceptar además `search` (texto) y `criticality` (uno o más valores), aplicando esos filtros antes de paginar. Cada célula devuelta —en el listado y por id— SHALL incluir campos calculados de sólo lectura —cantidad de personas asignadas, una muestra de ellas para avatares, FTE asignado y su desglose BAU / Transformación— derivados de las asignaciones actuales en memoria del mock de asignaciones, de modo que una asignación creada o quitada en el detalle de la célula se refleje en el listado de Células dentro de la misma sesión.

#### Scenario: Listar células mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de células con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las células actuales en memoria (datos de ejemplo iniciales, o los últimos cambios de la sesión), con los campos calculados de equipo y capacidad en cada célula

#### Scenario: Obtener una célula por id
- **WHEN** se hace un `GET` al endpoint mockeado de una célula con un id que existe en memoria
- **THEN** responde con esa célula y sus campos calculados

#### Scenario: Obtener una célula inexistente
- **WHEN** se hace un `GET` con un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Buscar y filtrar células mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de células con `search` o `criticality`
- **THEN** el handler filtra las células en memoria por nombre o tribu (parcial, sin distinguir mayúsculas) y por las criticidades indicadas antes de paginar, y el sobre paginado refleja el total y la paginación sobre el subconjunto filtrado

#### Scenario: Campos calculados desde las asignaciones
- **WHEN** una célula tiene asignaciones en memoria en el mock de asignaciones
- **THEN** el `GET` de listado devuelve para esa célula la cantidad de personas asignadas, hasta tres de ellas (id y nombre) como muestra, y el FTE asignado total, de BAU y de Transformación (suma de los porcentajes / 100)

#### Scenario: Campos calculados tras una mutación de asignaciones
- **WHEN** en la misma sesión del mock se crea o quita una asignación de una célula
- **THEN** el siguiente `GET` de listado de células refleja los nuevos valores calculados para esa célula

#### Scenario: Crear una célula válida
- **WHEN** se hace un `POST` con una célula que cumple las reglas de validación (nombre ≤200, tribu ≤100, descripción ≤500, criticidad del catálogo)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve, con los campos calculados en cero (sin asignaciones todavía)

#### Scenario: Crear con datos inválidos
- **WHEN** se hace un `POST` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin agregar ninguna célula

#### Scenario: Editar una célula existente
- **WHEN** se hace un `PUT` a una célula que existe en memoria, con datos válidos
- **THEN** el handler actualiza esa célula y la devuelve

#### Scenario: Editar una célula inexistente
- **WHEN** se hace un `PUT` a un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Eliminar una célula
- **WHEN** se hace un `DELETE` a un id que existe en memoria
- **THEN** el handler la quita de la lista en memoria

#### Scenario: Obtener el catálogo de criticidades
- **WHEN** se hace un `GET` al endpoint mockeado de criticidades
- **THEN** responde con los valores vigentes (`Critical`, `High`, `Medium`, `Low`)

#### Scenario: Obtener el resumen agregado de células
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de células
- **THEN** el handler calcula, sobre todas las células actuales en memoria (sin paginar ni filtrar), el total de células, cuántas no tienen asignaciones, cuántas tribus distintas hay, la distribución por criticidad (los 4 niveles, incluso con cero), el FTE asignado total con su desglose BAU / Transformación, y el FTE disponible del chapter como la suma del FTE disponible de las personas actuales en memoria del mock de personas
