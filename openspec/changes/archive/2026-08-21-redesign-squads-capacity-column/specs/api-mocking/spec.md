## MODIFIED Requirements

### Requirement: Handler de mock para células
El sistema SHALL exponer un handler de mock con CRUD completo de células (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), el catálogo de criticidades (`GET`) y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El `GET` de listado SHALL aceptar además `search` (texto) y `criticality` (uno o más valores), aplicando esos filtros antes de paginar. Cada célula devuelta —en el listado y por id— SHALL incluir campos calculados de sólo lectura —cantidad de personas asignadas, una muestra de ellas para avatares, FTE asignado y su desglose BAU / Transformación, y el FTE disponible del equipo (suma del `availableFte` de las personas asignadas, tomado del mock de personas)— derivados de las asignaciones actuales en memoria del mock de asignaciones, de modo que una asignación creada o quitada en el detalle de la célula se refleje en el listado de Células dentro de la misma sesión.

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
- **THEN** el `GET` de listado devuelve para esa célula la cantidad de personas asignadas, hasta tres de ellas (id y nombre) como muestra, y el FTE asignado total, de BAU y de Transformación (suma de los porcentajes / 100) y el FTE disponible del equipo (suma del `availableFte` de esas personas)

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
