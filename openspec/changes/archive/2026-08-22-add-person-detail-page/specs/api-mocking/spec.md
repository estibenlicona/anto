## ADDED Requirements

### Requirement: Handler de mock para el detalle de una persona
El sistema SHALL exponer un handler de mock con un `GET` de detalle por persona que devuelve, en una sola respuesta, todo lo que la página de detalle necesita: los datos de la persona (los mismos del `GET` por id de personas, más la etiqueta en español de la modalidad, el nivel SFIA derivado del seniority, y la vinculación con proveedor y vigencia de contrato si es externa); su asignación actual (célula con nombre, criticidad y tribu, nombres de los compañeros, dedicación, BAU, Transformación y fecha de inicio) o `null`; el FTE real del último sprint validado; el reporte de horas del sprint actual (sprint, horas del sprint, rango de tolerancia, horas BAU / Iniciativa / Libre, estado `NotReported | Draft | Submitted | Validated`, fechas de envío y cierre) o `null`; los últimos seis sprints con sus horas BAU e Iniciativa y estado; la identidad DevOps (vinculada con usuario y fecha, o `null` con las identidades candidatas por nombre) y sus items activos por tipo y pendientes de curación; las capacidades que cubre (nombre, nivel SFIA, si es la principal, cuántas personas más del chapter la cubren); el chapter y su lead; la lectura de concordancia costo / seniority; el SFIA requerido por su célula para su capacidad; y, sin célula, las células que piden su capacidad (id, nombre, motivo, SFIA requerido, FTE asignado y disponible).

La asignación, la célula, los compañeros y las células sugeridas SHALL derivarse de los mocks actuales en memoria de personas, asignaciones y células (no de copias propias), de modo que asignar, mover o quitar en la misma sesión se refleje en el siguiente `GET`. Las horas, la identidad DevOps, los items y las capacidades SHALL salir de datos de ejemplo propios del handler, con al menos una persona con reporte "Por validar" y exceso sobre lo asignado, una sin identidad DevOps, y una con una capacidad de bus factor 1.

El handler SHALL exponer además un `POST` para validar el reporte de horas de un sprint (pasa a `Validated` y recalcula el FTE real) y un `POST` para vincular una identidad DevOps (a partir de una identidad candidata), persistiendo ambos en memoria durante la sesión, disponibles tanto en modo Node (tests) como en modo navegador.

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
