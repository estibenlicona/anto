## ADDED Requirements

### Requirement: Handler de mock para asignaciones
El sistema SHALL exponer un handler de mock con las asignaciones de personas a células: `GET` de las asignaciones de una célula, `POST` alta, `PUT` edición, `DELETE` baja, persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador.

#### Scenario: Listar las asignaciones de una célula
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula
- **THEN** responde con las asignaciones actuales en memoria de esa célula (datos de ejemplo iniciales, o los últimos cambios de la sesión)

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
