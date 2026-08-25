## ADDED Requirements

### Requirement: Handler de mock para la configuración de sprints
El sistema SHALL exponer un handler de mock que sirve (`GET`) y persiste (`PUT`) la configuración de sprints en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador.

#### Scenario: Obtener la configuración actual
- **WHEN** se hace un `GET` al endpoint mockeado de configuración de sprints
- **THEN** responde con la configuración vigente (la inicial, o la última guardada con `PUT` en esa misma sesión)

#### Scenario: Guardar una configuración nueva
- **WHEN** se hace un `PUT` al endpoint mockeado con una configuración válida
- **THEN** el handler la persiste en memoria y un `GET` posterior en la misma sesión la refleja

#### Scenario: Guardar con datos inválidos
- **WHEN** se hace un `PUT` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin modificar la configuración previamente guardada
