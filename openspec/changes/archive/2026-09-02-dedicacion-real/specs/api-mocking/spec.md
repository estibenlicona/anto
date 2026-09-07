## ADDED Requirements

### Requirement: Handler de mock para la dedicación real
El sistema SHALL exponer un handler de mock de la dedicación real con: un `GET /dedication/capacities` que devuelve una fila por persona del chapter del usuario en sesión (persona con id, nombre, cargo, avatar; célula e iniciativa activa con talla; si tiene identidad DevOps; el sprint en curso con nombre y fechas; puntos comprometidos, de iniciativa, de BAU y sin etiqueta con su equivalente en FTE; FTE disponible y FTE asignado —con su reparto Transformación / BAU—; FTE comprometido, diferencia y lectura) junto con un resumen (vinculadas, sin identidad, por encima, en línea, por debajo, sin célula), los puntos por FTE por sprint vigentes y la hora de la última actualización; que acepta `squadId`, `reading` y `search` y pagina como los demás listados; un `GET /dedication/capacities/{personId}` con `sprint` opcional que devuelve la persona, su asignación, la lista de sprints de esa capacidad (nombre, fechas, si es el en curso, puntos por etiqueta y actividad por tipo) y, para el sprint elegido (el en curso por defecto), las historias comprometidas (id, número, título, etiqueta `Initiative | Bau | null`, iniciativa mapeada por el Epic si la hay, puntos, estado en DevOps, tablero, URL en DevOps) y la actividad por día (fecha, commits, releases y features creadas); y dos `POST` de actualización, `/dedication/capacities/sync` y `/dedication/capacities/{personId}/sync`, que responden la hora nueva de última actualización; `404` en el detalle y en la actualización de una persona que no existe o que no está en el chapter del usuario en sesión; `409` al actualizar una persona sin identidad DevOps.

La persona de cada historia y de cada actividad SHALL derivarse del identificador del usuario de DevOps de las identidades vinculadas en el mock de detalle de persona; la dedicación asignada, la célula y la iniciativa activa, de los snapshots de asignaciones, células e iniciativas; los puntos por FTE por sprint, del mock de configuración de sprints; el FTE disponible, del mock de personas; y el FTE comprometido, la diferencia y la lectura SHALL calcularse con las reglas de la capability `real-dedication`, de modo que vincular una identidad, cambiar una asignación o cambiar el parámetro en la misma sesión se refleje en el siguiente `GET`. Los datos de ejemplo SHALL incluir al menos una capacidad por debajo, una en línea, una por encima, una sin célula con puntos, una sin identidad, y una historia sin etiqueta; y para cada persona con identidad, siete sprints con historias etiquetadas y actividad —commits, releases y features creadas— en varios días, incluido un sprint sin actividad. Todo SHALL persistir en memoria durante la sesión, disponible en Node y en navegador, con `reset`.

#### Scenario: Listado con resumen
- **WHEN** se hace un `GET` de capacidades sin filtros
- **THEN** responde una fila por persona del chapter ordenada por distancia a lo asignado (por encima y por debajo primero, luego en línea, al final sin célula y sin identidad), el resumen coherente con las filas, los puntos por FTE por sprint vigentes y la última actualización

#### Scenario: La lectura sigue a la asignación y al parámetro
- **WHEN** en la misma sesión se cambia la dedicación de una persona por el handler de asignaciones, o los puntos por FTE por sprint por el de configuración de sprints
- **THEN** el siguiente `GET` recalcula su FTE comprometido, su diferencia y su lectura con los valores nuevos

#### Scenario: Dedicación real de una capacidad por sprint
- **WHEN** se hace un `GET` del detalle de una persona con identidad, con y sin `sprint`
- **THEN** sin `sprint` responde el sprint en curso elegido, y con `sprint` responde las historias y la actividad por día de ese sprint, con la lista de sprints igual en ambos casos

#### Scenario: Actualizar desde Azure DevOps
- **WHEN** se hace un `POST` de actualización general o de una persona con identidad
- **THEN** responde `200` con la hora nueva, y el siguiente `GET` la refleja como última actualización; sobre una persona sin identidad responde `409`, y sobre una persona inexistente `404`

#### Scenario: Vincular una identidad hace aparecer su dedicación real
- **WHEN** una persona sin identidad se vincula por el handler de detalle de persona en la misma sesión
- **THEN** el siguiente `GET` de capacidades la muestra con sus sprints, FTE y lectura en vez de "Sin identidad"

## MODIFIED Requirements

### Requirement: Handler de mock para la configuración de sprints
El sistema SHALL exponer un handler de mock que sirve (`GET`) y persiste (`PUT`) la configuración de sprints en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. La configuración SHALL constar de **semanas por sprint**, **sprints por quarter** y **puntos por FTE por sprint** (los puntos de historias de usuario que equivalen a 1.0 FTE de dedicación en un sprint: la tasa con la que Dedicación real traduce puntos a FTE; 26 por defecto, entre 1 y 100), y de nada más: el handler SHALL NOT devolver ni aceptar horas por semana ni tolerancia de reporte, porque la plataforma no registra horas. Un `PUT` con un valor fuera de rango o no numérico en cualquiera de los tres campos SHALL responder `400` sin modificar la configuración guardada. El handler SHALL exponer un snapshot de sólo lectura de los puntos por FTE por sprint para el mock de dedicación real.

#### Scenario: Obtener la configuración actual
- **WHEN** se hace un `GET` al endpoint mockeado de configuración de sprints
- **THEN** responde con la configuración vigente (la inicial, o la última guardada con `PUT` en esa misma sesión), con semanas por sprint, sprints por quarter y puntos por FTE por sprint, y sin campos de horas

#### Scenario: Guardar una configuración nueva
- **WHEN** se hace un `PUT` al endpoint mockeado con una configuración válida
- **THEN** el handler la persiste en memoria y un `GET` posterior en la misma sesión la refleja

#### Scenario: Guardar con datos inválidos
- **WHEN** se hace un `PUT` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin modificar la configuración previamente guardada

### Requirement: Handler de mock para el detalle de una persona
El sistema SHALL exponer un handler de mock con un `GET` de detalle por persona que devuelve, en una sola respuesta, todo lo que la página de detalle necesita: los datos de la persona (los mismos del `GET` por id de personas, más la etiqueta en español de la modalidad, el nivel SFIA derivado del seniority, y la vinculación con proveedor y vigencia de contrato si es externa); su asignación actual (célula con nombre, criticidad y tribu, nombres de los compañeros, dedicación, BAU, Transformación y fecha de inicio) o `null`; la identidad DevOps (vinculada, con el identificador del usuario de Azure DevOps, su usuario y la fecha de vinculación, y la **lectura del sprint en curso** —nombre del sprint, puntos comprometidos, FTE comprometido, FTE asignado, FTE disponible, diferencia y lectura— tomada del mock de dedicación real; o `null`); las capacidades que cubre (nombre, nivel SFIA, si es la principal, cuántas personas más del chapter la cubren); su línea de expertise y el lead de esa línea; la lectura de concordancia costo / seniority; el SFIA requerido por su célula para su capacidad; y, sin célula, las células que piden su capacidad (id, nombre, motivo, SFIA requerido, FTE asignado y disponible). El detalle SHALL NOT devolver identidades candidatas por nombre: la identidad se encuentra buscando en Azure DevOps por correo. El detalle SHALL NOT devolver horas reportadas, reporte del sprint, sprints ni un FTE real: la plataforma no registra horas. La identidad SHALL NOT traer items activos ni pendientes de curación: la curación manual no existe.

La línea de expertise y su lead SHALL derivarse del mock de líneas en memoria y no de una constante propia del handler, de modo que mover a la persona de línea, cambiarle el nombre a la línea o designarle otro lead en la misma sesión se refleje en el siguiente `GET`. Una persona que no pertenece a ninguna línea SHALL devolver la línea en `null`, y una línea sin lead SHALL devolver el lead en `null`; el handler SHALL NOT inventar un nombre de línea ni de lead en esos casos.

La asignación, la célula, los compañeros y las células sugeridas SHALL derivarse de los mocks actuales en memoria de personas, asignaciones y células (no de copias propias), de modo que asignar, mover o quitar en la misma sesión se refleje en el siguiente `GET`. La identidad DevOps y las capacidades SHALL salir de datos de ejemplo propios del handler, con al menos una persona sin identidad DevOps y una con una capacidad de bus factor 1; la lectura del sprint en curso SHALL salir del mock de dedicación real.

El handler SHALL exponer además un `GET` de **búsqueda de usuarios de Azure DevOps por correo** (`GET /devops/users?email=<correo>`) que responde el usuario cuyo correo coincide, sin distinguir mayúsculas: su identificador, nombre para mostrar, correo, URL de avatar (o `null`), y los nombres de sus proyectos, equipos y tableros; `404` si ningún usuario tiene ese correo, y `400` si falta el parámetro. Los datos de ejemplo SHALL incluir un usuario de DevOps cuyo correo es el correo corporativo de la persona sin identidad, un usuario ya vinculado a otra persona, y ningún usuario para al menos un correo con forma válida.

El handler SHALL exponer un `POST` para vincular la identidad DevOps de una persona a partir del **identificador de un usuario de Azure DevOps** devuelto por la búsqueda: `404` si el identificador no corresponde a ningún usuario, `409` si ese usuario ya está vinculado a otra persona, y `200` en otro caso, dejando la identidad vinculada con la fecha de hoy y con el correo del usuario como su `userName` —de modo que el mock de dedicación real resuelva por él las historias y la actividad de esa persona—. El `POST` persiste en memoria durante la sesión, disponible tanto en modo Node (tests) como en modo navegador, y se reinicia con el resto del handler. El handler SHALL NOT exponer ningún endpoint de validación de reporte de horas.

#### Scenario: El detalle sigue a los cambios de línea
- **WHEN** en la misma sesión se mueve a esa persona de línea, se renombra su línea o se designa otro lead por el handler de líneas
- **THEN** el siguiente `GET` del detalle devuelve la línea y el lead nuevos, sin que haya que tocar a la persona

#### Scenario: Detalle de una persona sin línea
- **WHEN** se hace un `GET` al detalle de una persona que no pertenece a ninguna línea
- **THEN** la línea de expertise y su lead vienen en `null`, en vez de un nombre de línea fijo

#### Scenario: Detalle de una persona con célula
- **WHEN** se hace un `GET` al endpoint mockeado de detalle de una persona que tiene una asignación
- **THEN** responde con la persona, su asignación derivada del mock de asignaciones (célula, criticidad, tribu y compañeros tomados de los mocks de células y asignaciones), la identidad DevOps con la lectura del sprint en curso, las capacidades y la ficha

#### Scenario: Detalle de una persona sin célula
- **WHEN** se hace un `GET` al detalle de una persona sin asignación
- **THEN** `allocation` es `null` y la respuesta incluye las células que piden su capacidad con el SFIA requerido y el FTE asignado sobre disponible de cada una

#### Scenario: Sin datos de horas
- **WHEN** se hace un `GET` al detalle de cualquier persona
- **THEN** la respuesta no incluye `realFte`, `currentReport` ni `sprints`

#### Scenario: Validar el reporte de horas
- **WHEN** se hace un `POST` a `/people/{id}/hours/{sprint}/validate`
- **THEN** ningún handler de mock lo atiende: el endpoint no existe y la petición queda como no manejada

#### Scenario: Detalle de una persona sin identidad
- **WHEN** se hace un `GET` al detalle de una persona sin identidad DevOps
- **THEN** `devOpsIdentity` es `null` y la respuesta no incluye ninguna lista de identidades candidatas

#### Scenario: El detalle sigue a los cambios de asignación
- **WHEN** en la misma sesión se crea, edita o elimina una asignación de esa persona por el handler de asignaciones
- **THEN** el siguiente `GET` del detalle refleja la nueva célula, dedicación o la ausencia de asignación, y la lectura del sprint en curso se recalcula con la dedicación nueva

#### Scenario: Buscar un usuario de Azure DevOps por correo
- **WHEN** se hace un `GET` de búsqueda con el correo corporativo de la persona sin identidad, en cualquier combinación de mayúsculas
- **THEN** responde `200` con el usuario: identificador, nombre para mostrar, correo, avatar y los nombres de sus proyectos, equipos y tableros

#### Scenario: Correo sin usuario en Azure DevOps
- **WHEN** se hace un `GET` de búsqueda con un correo válido que ningún usuario de ejemplo tiene, o sin el parámetro `email`
- **THEN** responde `404` en el primer caso y `400` en el segundo

#### Scenario: Vincular identidad DevOps
- **WHEN** se hace un `POST` de vinculación con el identificador de un usuario devuelto por la búsqueda para una persona sin identidad
- **THEN** responde `200`, y el siguiente `GET` del detalle devuelve la identidad vinculada con la fecha de hoy, el correo del usuario como `userName` y la lectura del sprint en curso que el mock de dedicación real calcula para ella; con un identificador desconocido responde `404`

#### Scenario: Usuario ya vinculado a otra persona
- **WHEN** se hace un `POST` de vinculación con el identificador de un usuario que ya está vinculado a otra persona
- **THEN** responde `409` con un mensaje que nombra a esa persona, y ninguna de las dos identidades cambia

#### Scenario: Persona inexistente
- **WHEN** se hace un `GET` al detalle con un id que no existe
- **THEN** responde `404`

#### Scenario: Los stacks del detalle siguen a la edición
- **WHEN** en la misma sesión se reemplazan los stacks de la persona por el handler de personas
- **THEN** el siguiente `GET` del detalle devuelve los stacks nuevos con su cobertura recalculada sobre el resto del chapter

## REMOVED Requirements

### Requirement: Handler de mock para el backlog
**Reason**: la cola de triage desaparece; el módulo pasa a ser Dedicación real y lo sirve el handler nuevo de dedicación real.
**Migration**: los endpoints `GET /backlog/queue`, `GET /backlog/catalogs` y los `POST` de clasificar, saltar, deshacer y rechazar se retiran; las semillas de historias se reescriben con etiqueta, sprint y puntos, y no hay estado de clasificación que conservar.
