## ADDED Requirements

### Requirement: Respuestas de no autorizado y prohibido en los mocks
El sistema SHALL permitir que los handlers de mock respondan 401 y 403 a demanda, para poder ejercitar cómo reacciona la aplicación ante una sesión inválida o ante permisos insuficientes. Estos handlers SHALL imitar el comportamiento de la puerta de enlace que valida al llamador antes del backend, y no el del backend en sí — que por diseño no procesa identidad. En desarrollo no hay puerta de enlace delante, de modo que los handlers ocupan ese lugar.

#### Scenario: Simular sesión inválida
- **WHEN** se pide a los mocks que respondan como si la sesión no fuera válida
- **THEN** las llamadas al backend reciben un 401, y la aplicación reacciona como lo haría ante un 401 real

#### Scenario: Simular permisos insuficientes
- **WHEN** se pide a los mocks que respondan como si el usuario no tuviera permisos sobre el recurso
- **THEN** las llamadas al backend reciben un 403, y la aplicación reacciona como lo haría ante un 403 real

#### Scenario: Comportamiento normal por defecto
- **WHEN** no se pide ninguno de esos dos comportamientos
- **THEN** los handlers responden normalmente, como hasta ahora
