## ADDED Requirements

### Requirement: Handler de mock para el mix de capacidades
El sistema SHALL exponer un handler de mock que sirve (`GET`) y persiste (`PUT`) el mix de capacidades en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El handler SHALL rechazar un mix con nombres de capacidad vacíos o repetidos, o con cantidades que no sean enteros no negativos.

#### Scenario: Obtener el mix actual
- **WHEN** se hace un `GET` al endpoint mockeado de mix de capacidades
- **THEN** responde con el mix vigente (el inicial, o el último guardado con `PUT` en esa misma sesión)

#### Scenario: Guardar un mix nuevo
- **WHEN** se hace un `PUT` al endpoint mockeado con un mix válido
- **THEN** el handler lo persiste en memoria y un `GET` posterior en la misma sesión lo refleja

#### Scenario: Guardar con datos inválidos
- **WHEN** se hace un `PUT` con nombres vacíos o repetidos, o con una cantidad negativa o no entera
- **THEN** responde con un error HTTP (400), sin modificar el mix previamente guardado

#### Scenario: Reiniciar el estado entre pruebas
- **WHEN** una prueba que ejercita el guardado llama a la función de reinicio del mock
- **THEN** el mix vuelve a su valor inicial, de modo que una prueba no arrastre lo que guardó otra
