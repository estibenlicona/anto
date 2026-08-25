## MODIFIED Requirements

### Requirement: Handler de mock para células
El sistema SHALL exponer un handler de mock con CRUD completo de células (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja) y el catálogo de criticidades (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador.

#### Scenario: Listar células mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de células con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las células actuales en memoria (datos de ejemplo iniciales, o los últimos cambios de la sesión)

#### Scenario: Crear una célula válida
- **WHEN** se hace un `POST` con una célula que cumple las reglas de validación (nombre ≤200, tribu ≤100, descripción ≤500, criticidad del catálogo)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve

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

### Requirement: Handler de mock para personas
El sistema SHALL exponer un handler de mock con CRUD completo de personas (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), asignación de proveedor (`PUT` a un sub-recurso, sin proveedor en el cuerpo del alta/edición), los catálogos de seniorities, modalities y sfia-levels (`GET`), y un catálogo de solo lectura de compañías/proveedores (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador.

#### Scenario: Listar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las personas actuales en memoria (datos de ejemplo iniciales, o los últimos cambios de la sesión)

#### Scenario: Crear una persona válida
- **WHEN** se hace un `POST` con una persona que cumple las reglas de validación (nombre ≤200, documento ≤50, usuario principal ≤250, cargo ≤100, rol ≤100, seniority del catálogo, nivel SFIA entre 1 y 4, modalidad del catálogo, FTE disponible entre 0.0 y 1.0, costo mensual ≥0)
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
- **WHEN** se hace un `GET` a los endpoints mockeados de seniorities, modalities o sfia-levels
- **THEN** cada uno responde con sus valores vigentes (seniorities: `Junior`, `MidLevel`, `Senior`, `StaffEngineer`, `Principal`; modalities: `Remote`, `Hybrid`, `OnSite`; sfia-levels: 1 a 4 con su etiqueta de la escala Tuya)

#### Scenario: Obtener el catálogo de compañías/proveedores
- **WHEN** se hace un `GET` al endpoint mockeado de compañías
- **THEN** responde con la lista de proveedores de ejemplo, sin exponer operaciones de alta, edición o baja sobre ese catálogo

### Requirement: Handler de mock para asignaciones
El sistema SHALL exponer un handler de mock con las asignaciones de personas a células: `GET` paginado de las asignaciones de una célula, `POST` alta, `PUT` edición, `DELETE` baja, persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador.

#### Scenario: Listar las asignaciones de una célula
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las asignaciones actuales en memoria de esa célula (datos de ejemplo iniciales, o los últimos cambios de la sesión)

#### Scenario: Crear una asignación válida
- **WHEN** se hace un `POST` con una asignación que cumple las reglas de validación (persona y célula existentes, % de dedicación entre 1 y 100, % BAU y % Transformación entre 0 y 100 cada uno y cuya suma sea igual al % de dedicación)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve

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
