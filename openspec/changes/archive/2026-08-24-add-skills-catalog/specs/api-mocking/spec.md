## ADDED Requirements

### Requirement: Handler de mock para el catálogo de habilidades
El sistema SHALL exponer un handler de mock con `GET` del catálogo vigente (habilidades con su grupo, descripción, estado activo, sus cuatro niveles con la lista ordenada de criterios de cada uno, y el nivel esperado por rol), `POST` y `PUT` de una habilidad (400 si el nombre falta o se repite), `PUT` de los criterios de un nivel (lista ordenada completa; 400 si algún texto viene vacío), `PUT` del nivel esperado de un rol (acepta retirarlo para dejarlo sin definir) y `DELETE` de una habilidad (400 cuando alguna evaluación la usa, ofreciendo desactivarla). Cada publicación SHALL incrementar la versión del catálogo, y el `GET` SHALL devolverla junto con los datos.

Los roles ofrecidos SHALL derivarse del snapshot de personas, no de una lista propia. Los cambios SHALL persistir en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio.

Los datos de ejemplo SHALL incluir las nueve habilidades del diseño —cinco técnicas y cuatro humanas—, con cantidades de criterios distintas entre niveles y entre habilidades (por ejemplo 5·5·6·4 en una y 5·5·5·5 en otra), al menos una habilidad con un nivel sin criterios, y al menos un rol sin nivel esperado declarado.

El handler SHALL exponer un snapshot de sólo lectura del catálogo vigente y de cada versión publicada, para que los handlers de evaluación puedan resolver con qué versión se hizo cada una.

#### Scenario: Traer el catálogo vigente
- **WHEN** se hace un `GET` del catálogo
- **THEN** responde las habilidades agrupadas con sus criterios por nivel, los niveles esperados por rol y el número de versión vigente

#### Scenario: Editar criterios de un nivel
- **WHEN** se hace un `PUT` con la lista de criterios de un nivel
- **THEN** el nivel queda con esa lista en ese orden y la versión del catálogo sube; con algún texto vacío responde 400 y no cambia nada

#### Scenario: Nombre de habilidad repetido
- **WHEN** se hace un `POST` o `PUT` con un nombre que ya existe
- **THEN** responde 400 explicando el conflicto

#### Scenario: Retirar el nivel esperado de un rol
- **WHEN** se hace un `PUT` del nivel esperado de un rol sin nivel
- **THEN** ese rol queda sin definir en esa habilidad

#### Scenario: Versión histórica disponible
- **WHEN** otro handler pide la versión con la que se cerró una evaluación
- **THEN** el snapshot devuelve esa versión con sus criterios y niveles esperados tal como estaban
