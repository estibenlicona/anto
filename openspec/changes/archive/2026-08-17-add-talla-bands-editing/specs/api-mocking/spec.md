## ADDED Requirements

### Requirement: Handler de mock para las bandas de talla
El sistema SHALL exponer un handler de mock que sirve (`GET`) y persiste (`PUT`) las bandas de talla en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El handler SHALL rechazar un conjunto de bandas cuyos límites no formen una partición contigua del rango completo.

#### Scenario: Obtener las bandas actuales
- **WHEN** se hace un `GET` al endpoint mockeado de bandas de talla
- **THEN** responde con las bandas vigentes (las iniciales, o las últimas guardadas con `PUT` en esa misma sesión)

#### Scenario: Guardar bandas nuevas
- **WHEN** se hace un `PUT` al endpoint mockeado con bandas válidas
- **THEN** el handler las persiste en memoria y un `GET` posterior en la misma sesión las refleja

#### Scenario: Guardar con datos inválidos
- **WHEN** se hace un `PUT` con bandas que no cumplen la validación del handler, por ejemplo con límites desordenados o un persona-mes mínimo mayor que su máximo
- **THEN** responde con un error HTTP (400), sin modificar las bandas previamente guardadas

#### Scenario: Reiniciar el estado entre pruebas
- **WHEN** una prueba que ejercita el guardado llama a la función de reinicio del mock
- **THEN** las bandas vuelven a su valor inicial, de modo que una prueba no arrastre lo que guardó otra
