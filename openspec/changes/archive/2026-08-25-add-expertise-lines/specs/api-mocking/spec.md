## ADDED Requirements

### Requirement: Handler de mock para las líneas de expertise
El sistema SHALL exponer un handler de mock con el ciclo completo de las líneas de expertise, persistiendo los cambios en memoria durante la sesión del mock y disponible tanto en modo Node (tests) como en modo navegador:
- `GET` del listado de líneas, cada una con id, nombre, código, descripción, estado (`Active | Archived`), su lead (id y nombre) o `null`, el conteo de personas y su FTE disponible.
- `GET` de detalle por línea, que agrega el listado de sus personas (id, nombre, cargo, seniority con su etiqueta, FTE disponible, y célula con nombre y dedicación o `null`) y su resumen de capacidad (personas, FTE disponible, FTE asignado, FTE libre y porcentaje sin asignar).
- `POST` de alta y `PUT` de edición, validando nombre no vacío ≤100 y único entre las líneas no archivadas, código no vacío ≤10 normalizado a mayúsculas y único entre todas las líneas, y descripción ≤200.
- `PUT` del lead de la línea, que además incorpora a esa persona a la línea, y rechaza a quien ya lidera otra.
- `POST` para incorporar una o varias personas a la línea y `DELETE` para quitar a una persona de ella.
- `POST` de archivado y de reactivación.
- `GET` del padrón de personas: todas las personas registradas con su línea actual (id y nombre) o `null`. De acá salen las dos lecturas que la pantalla necesita —quién está sin línea, y a quién se puede asignar sabiendo de qué línea saldría— sin pedir el detalle de cada línea para armar un selector.

Las personas, sus células y sus dedicaciones SHALL derivarse de los mocks actuales en memoria de personas, asignaciones y células, no de copias propias, de modo que un alta de persona o un cambio de asignación en la misma sesión se refleje en el siguiente `GET` de líneas. El handler SHALL ser dueño únicamente de las líneas y de a qué línea pertenece cada persona.

El FTE disponible de una línea SHALL ser la suma del FTE disponible de sus personas, y el FTE asignado la suma de sus porcentajes de dedicación dividida entre cien, con el mismo criterio y el mismo redondeo del handler del resumen de capacidad del chapter, para que la pantalla de Líneas y la Torre de control no den números distintos sobre las mismas personas. El FTE libre SHALL ser la diferencia acotada a cero, dado que con personas de FTE parcial asignadas al 100 % el asignado puede superar al disponible.

Las semillas SHALL incluir varias líneas del dominio (por ejemplo Backend, QA, AS-400 y Frontend) repartiendo entre ellas las personas ya sembradas, al menos una línea activa sin lead, al menos una archivada y sin personas, y al menos dos personas sin línea, de modo que los estados vacíos, la marca de incompleta y el reparto se puedan ver sin preparar datos.

#### Scenario: Listar las líneas
- **WHEN** se hace un `GET` al endpoint mockeado de líneas
- **THEN** responde con las líneas actuales en memoria, cada una con su estado, su lead o `null`, su conteo de personas y su FTE disponible calculado sobre las personas del mock de personas

#### Scenario: Detalle de una línea con personas
- **WHEN** se hace un `GET` de detalle de una línea que agrupa personas, algunas asignadas a células
- **THEN** responde con sus personas —con la célula y la dedicación tomadas del mock de asignaciones— y el resumen con FTE disponible, asignado, libre y porcentaje sin asignar

#### Scenario: Crear una línea con nombre o código repetido
- **WHEN** se hace un `POST` con un nombre que ya tiene otra línea no archivada, o con un código que ya tiene cualquier otra línea
- **THEN** responde `409` y no agrega ninguna línea

#### Scenario: Crear una línea con datos inválidos
- **WHEN** se hace un `POST` sin nombre, sin código, o excediendo los límites de longitud
- **THEN** responde `400` y no agrega ninguna línea

#### Scenario: Designar el lead
- **WHEN** se hace un `PUT` del lead de una línea con el id de una persona que no lidera ninguna otra
- **THEN** responde `200`, y el siguiente `GET` de detalle devuelve esa persona como lead y dentro del listado de personas de la línea, aunque antes estuviera en otra línea o sin línea

#### Scenario: Designar como lead a quien ya lidera otra línea
- **WHEN** se hace un `PUT` del lead con el id de una persona que ya es lead de otra línea
- **THEN** responde `409` y ninguna de las dos líneas cambia

#### Scenario: Incorporar personas a la línea
- **WHEN** se hace un `POST` con uno o varios ids de personas sobre una línea activa
- **THEN** responde `200`, esas personas quedan sólo en esa línea, salen de la línea que tuvieran, y sus asignaciones a células quedan intactas en el mock de asignaciones

#### Scenario: Quitar de la línea a su lead
- **WHEN** se hace un `DELETE` de la persona que lidera la línea
- **THEN** responde `409` y la persona sigue en la línea

#### Scenario: Archivar una línea con personas
- **WHEN** se hace un `POST` de archivado sobre una línea que todavía agrupa personas
- **THEN** responde `409` y la línea sigue activa

#### Scenario: Archivar y reactivar una línea vacía
- **WHEN** se hace un `POST` de archivado sobre una línea sin personas y luego uno de reactivación
- **THEN** el archivado responde `200` y el siguiente `GET` la devuelve en `Archived`; la reactivación responde `200` y la devuelve en `Active`, sin personas y sin lead

#### Scenario: Padrón de personas con su línea
- **WHEN** se hace un `GET` del padrón de personas
- **THEN** responde con todas las personas actuales en memoria, cada una con su línea (id y nombre) o `null` si no tiene; después de incorporar a una sin línea, el siguiente `GET` la devuelve con esa línea

#### Scenario: Operar sobre una línea inexistente
- **WHEN** se hace un `GET`, `PUT`, `POST` o `DELETE` sobre un id de línea que no existe
- **THEN** responde `404` sin modificar nada

## MODIFIED Requirements

### Requirement: Handler de mock para el detalle de una persona
El sistema SHALL exponer un handler de mock con un `GET` de detalle por persona que devuelve, en una sola respuesta, todo lo que la página de detalle necesita: los datos de la persona (los mismos del `GET` por id de personas, más la etiqueta en español de la modalidad, el nivel SFIA derivado del seniority, y la vinculación con proveedor y vigencia de contrato si es externa); su asignación actual (célula con nombre, criticidad y tribu, nombres de los compañeros, dedicación, BAU, Transformación y fecha de inicio) o `null`; el FTE real del último sprint validado; el reporte de horas del sprint actual (sprint, horas del sprint, rango de tolerancia, horas BAU / Iniciativa / Libre, estado `NotReported | Draft | Submitted | Validated`, fechas de envío y cierre) o `null`; los últimos seis sprints con sus horas BAU e Iniciativa y estado; la identidad DevOps (vinculada con usuario y fecha, o `null` con las identidades candidatas por nombre) y sus items activos por tipo y pendientes de curación; las capacidades que cubre (nombre, nivel SFIA, si es la principal, cuántas personas más del chapter la cubren); su línea de expertise y el lead de esa línea; la lectura de concordancia costo / seniority; el SFIA requerido por su célula para su capacidad; y, sin célula, las células que piden su capacidad (id, nombre, motivo, SFIA requerido, FTE asignado y disponible).

La línea de expertise y su lead SHALL derivarse del mock de líneas en memoria y no de una constante propia del handler, de modo que mover a la persona de línea, cambiarle el nombre a la línea o designarle otro lead en la misma sesión se refleje en el siguiente `GET`. Una persona que no pertenece a ninguna línea SHALL devolver la línea en `null`, y una línea sin lead SHALL devolver el lead en `null`; el handler SHALL NOT inventar un nombre de línea ni de lead en esos casos.

La asignación, la célula, los compañeros y las células sugeridas SHALL derivarse de los mocks actuales en memoria de personas, asignaciones y células (no de copias propias), de modo que asignar, mover o quitar en la misma sesión se refleje en el siguiente `GET`. Las horas, la identidad DevOps, los items y las capacidades SHALL salir de datos de ejemplo propios del handler, con al menos una persona con reporte "Por validar" y exceso sobre lo asignado, una sin identidad DevOps, y una con una capacidad de bus factor 1.

El handler SHALL exponer además un `POST` para validar el reporte de horas de un sprint (pasa a `Validated` y recalcula el FTE real) y un `POST` para vincular una identidad DevOps (a partir de una identidad candidata), persistiendo ambos en memoria durante la sesión, disponibles tanto en modo Node (tests) como en modo navegador.

#### Scenario: El detalle sigue a los cambios de línea
- **WHEN** en la misma sesión se mueve a esa persona de línea, se renombra su línea o se designa otro lead por el handler de líneas
- **THEN** el siguiente `GET` del detalle devuelve la línea y el lead nuevos, sin que haya que tocar a la persona

#### Scenario: Detalle de una persona sin línea
- **WHEN** se hace un `GET` al detalle de una persona que no pertenece a ninguna línea
- **THEN** la línea de expertise y su lead vienen en `null`, en vez de un nombre de línea fijo

#### Scenario: Detalle de una persona con célula
- **WHEN** se hace un `GET` al endpoint mockeado de detalle de una persona que tiene una asignación
- **THEN** responde con la persona, su asignación derivada del mock de asignaciones (célula, criticidad, tribu y compañeros tomados de los mocks de células y asignaciones), el reporte del sprint actual, los últimos seis sprints, la identidad DevOps, las capacidades y la ficha

#### Scenario: Detalle de una persona sin célula
- **WHEN** se hace un `GET` al detalle de una persona sin asignación
- **THEN** `allocation` es `null`, el reporte del sprint actual es `null`, y la respuesta incluye las células que piden su capacidad con el SFIA requerido y el FTE asignado sobre disponible de cada una

#### Scenario: El detalle sigue a los cambios de asignación
- **WHEN** en la misma sesión se crea, edita o elimina una asignación de esa persona por el handler de asignaciones
- **THEN** el siguiente `GET` del detalle refleja la nueva célula, dedicación o la ausencia de asignación

#### Scenario: Validar el reporte de horas
- **WHEN** se hace un `POST` de validación sobre el sprint actual de una persona con reporte `Submitted`
- **THEN** responde `200`, el siguiente `GET` devuelve ese reporte en `Validated` y el FTE real del último sprint validado recalculado con sus horas; sobre un reporte que no está en `Submitted` responde `409`

#### Scenario: Vincular identidad DevOps
- **WHEN** se hace un `POST` de vinculación con el id de una identidad candidata para una persona sin identidad
- **THEN** responde `200`, y el siguiente `GET` devuelve la identidad vinculada con la fecha de hoy y los items de ejemplo de esa identidad; con un id de identidad desconocido responde `404`

#### Scenario: Persona inexistente
- **WHEN** se hace un `GET` al detalle con un id que no existe
- **THEN** responde `404`

#### Scenario: Los stacks del detalle siguen a la edición
- **WHEN** en la misma sesión se reemplazan los stacks de la persona por el handler de personas
- **THEN** el siguiente `GET` del detalle devuelve los stacks nuevos con su cobertura recalculada sobre el resto del chapter
