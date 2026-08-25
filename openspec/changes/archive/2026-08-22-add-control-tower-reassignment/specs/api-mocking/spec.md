## MODIFIED Requirements

### Requirement: Handler de mock para asignaciones
El sistema SHALL exponer un handler de mock con las asignaciones de personas a células: `GET` paginado de las asignaciones de una célula, `POST` alta, `PUT` edición, `DELETE` baja, persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. Cada asignación devuelta SHALL incluir campos de sólo lectura derivados de la persona en memoria del mock de personas (cargo, modalidad, seniority y su etiqueta) y su margen (porcentaje disponible = 100 − su dedicación, porque una persona tiene una sola asignación). El `POST` SHALL rechazar con 400 una asignación para una persona que ya tiene una en cualquier célula, y las semillas NO SHALL tener personas en dos células. El `GET` de listado SHALL aceptar además `search` (nombre o cargo de la persona) y `seniority` (uno o más valores), aplicando esos filtros antes de paginar.

#### Scenario: Listar las asignaciones de una célula
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las asignaciones actuales en memoria de esa célula (datos de ejemplo iniciales, o los últimos cambios de la sesión), con los campos de persona y disponibilidad en cada una

#### Scenario: Campos de persona y disponibilidad
- **WHEN** una persona tiene 80% en su célula
- **THEN** su asignación sale con el cargo, modalidad y seniority de la persona y 20 de porcentaje disponible

#### Scenario: Una persona, una célula
- **WHEN** se hace un `POST` para una persona que ya tiene asignación en otra célula
- **THEN** responde con un error HTTP (400) sin crear nada

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

## ADDED Requirements

### Requirement: Handler de mock para el resumen de capacidad del chapter
El sistema SHALL exponer un `GET` mockeado con el resumen de capacidad del chapter calculado sobre todas las personas, células y asignaciones en memoria: FTE del chapter con su reparto BAU / Transformación / libre; conteos de personas con margen (sin célula, dedicación parcial) y de células al tope y sin equipo; la lista de personas con su asignación (célula, dedicación, desglose) o ninguna, su FTE disponible y su margen; y la lista de células con su ocupación (asignado, disponible del equipo, BAU, Transformación, personas, criticidad).

#### Scenario: Resumen con datos
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de capacidad
- **THEN** responde con los indicadores, todas las personas y todas las células, coherentes con las asignaciones actuales en memoria

#### Scenario: Resumen tras una mutación
- **WHEN** en la misma sesión se crea, edita o quita una asignación
- **THEN** el siguiente `GET` del resumen refleja el cambio
