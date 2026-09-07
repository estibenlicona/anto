## MODIFIED Requirements

### Requirement: Handler de mock para la dedicación real
El sistema SHALL exponer un handler de mock del balance de carga con los endpoints `/dedication/collaborators…`, que reemplazan a `/dedication/capacities…`.

Un `GET /dedication/collaborators` SHALL devolver una fila por colaborador del chapter del usuario en sesión con: el colaborador (id, nombre, cargo, avatar); su célula e iniciativa activa con talla, y el FTE declarado en su asignación como dato de contexto; si tiene identidad DevOps; su sprint en curso con nombre, fechas y procedencia del snapshot; su **capacidad** del sprint (FTE contractual, FTE disponible y el desglose de días: laborales, festivos, vacaciones, ausencias y otras indisponibilidades); su **demanda** (SP comprometidos y HUs comprometidas); su **referencia** (mediana histórica propia, mediana histórica de la célula, cuántos sprints sellados la sostienen); su **multitarea** (iniciativas simultáneas y WIP); y su **señal de balance** con el conteo de evidencias que la sostienen y, cuando aplica, el motivo de no evaluable. La respuesta SHALL incluir un resumen por señal (sobreasignación, subasignación, revisar, balanceado, no evaluables con su desglose por motivo), la ventana de histórico y el mínimo de sprints vigentes, y la hora de la última actualización. SHALL aceptar `squadId`, `signal` y `search`, y paginar como los demás listados.

Un `GET /dedication/collaborators/{personId}` con `sprint` opcional SHALL devolver el colaborador, su asignación, la lista de sprints (nombre, fechas, si es el en curso, procedencia del snapshot, SP comprometidos y completados, % de cumplimiento y carry-over %) que alimenta la tendencia, y, para el sprint elegido (el en curso por defecto): la **capacidad** con su desglose de días; la **ejecución** (SP comprometidos, completados, no completados, % de cumplimiento, carry-over en SP y %, procedencia y fecha del sellado); el **trabajo no planificado** (comprometido al inicio, agregado durante el sprint, total trabajado y la proporción); la **multitarea** (iniciativas simultáneas con su épica, su iniciativa mapeada si la hay y sus SP; HUs comprometidas y WIP); la **referencia** con las desviaciones del colaborador y de su célula; la **señal de balance** con la lista completa de evidencias evaluadas —cada una con su dirección, su cifra, su umbral y si se pudo evaluar— y el modificador de célula cuando se aplicó; las **historias** comprometidas (id, número, título, etiqueta `Initiative | Bau | null`, épica, iniciativa mapeada por el Epic si la hay, puntos, estado en DevOps, si entró después del inicio del sprint, tablero, URL en DevOps); y la **actividad por día** (fecha, commits, releases y features creadas).

Dos `POST` de actualización, `/dedication/collaborators/sync` y `/dedication/collaborators/{personId}/sync`, SHALL responder la hora nueva de última actualización y SHALL recalcular sólo las cifras provisionales del sprint en curso, dejando intactos los snapshots sellados. SHALL responder `404` en el detalle y en la actualización de una persona que no existe o que no está en el chapter del usuario en sesión, y `409` al actualizar una persona sin identidad DevOps.

El handler SHALL derivar del resto de los mocks todo lo que ya es de otro: el colaborador y su FTE contractual, del mock de personas; la identidad y el usuario de DevOps, del mock de detalle de persona; la célula, la iniciativa activa y el FTE declarado, de los snapshots de asignaciones, células e iniciativas; los días de vacaciones y ausencias aprobadas que intersectan cada sprint, del mock de ausencias; y la ventana de histórico, el mínimo de sprints y la hora de cierre, del mock de configuración de sprints. El FTE disponible, las medianas históricas, las métricas de ejecución provisionales, el trabajo no planificado, la multitarea y la señal de balance SHALL calcularse con las reglas de la capability `real-dedication`, de modo que vincular una identidad, aprobar una ausencia, cambiar una asignación o cambiar la ventana de histórico en la misma sesión se refleje en el siguiente `GET`. El handler SHALL NOT devolver ni aceptar puntos por FTE por sprint, FTE comprometido, FTE asignado como referencia de lectura, ni el campo de lectura.

Los datos de ejemplo SHALL incluir al menos: un colaborador balanceado; uno a revisar con dos evidencias; uno con posible sobreasignación; uno con posible subasignación cuya célula está igualmente por debajo, para ejercitar el modificador de célula; uno sin identidad; uno sin sprints; uno con histórico insuficiente; uno sin célula pero con demanda e histórico propios; un colaborador a tiempo parcial; un sprint con festivo y ausencia aprobada; un sprint cerrado sin snapshot; un sprint en curso provisional; historias entradas después del inicio del sprint; épicas mapeadas y sin mapear a iniciativa; y un sprint sin actividad. Todo SHALL persistir en memoria durante la sesión, disponible en Node y en navegador, con `reset`, y SHALL exponer un snapshot de sólo lectura de las señales para la ficha de la persona y el badge de navegación.

#### Scenario: Listado con resumen
- **WHEN** se hace un `GET` de colaboradores sin filtros
- **THEN** responde una fila por colaborador del chapter ordenada por señal accionable (sobreasignación y subasignación primero, luego revisar, luego balanceado, al final no evaluables), el resumen por señal coherente con las filas y con el desglose de motivos de no evaluable, la ventana de histórico y el mínimo vigentes, y la última actualización

#### Scenario: La lectura sigue a la asignación y al parámetro
- **WHEN** en la misma sesión se aprueba una ausencia que cae dentro del sprint en curso, se cambia la dedicación de una persona por el handler de asignaciones, o se cambia la ventana de histórico por el de configuración de sprints
- **THEN** el siguiente `GET` recalcula su FTE disponible, sus medianas y su señal de balance con los valores nuevos, y el FTE declarado en la asignación viaja como contexto sin alterar la señal

#### Scenario: Dedicación real de una capacidad por sprint
- **WHEN** se hace un `GET` del detalle de una persona con identidad, con y sin `sprint`
- **THEN** sin `sprint` responde el sprint en curso elegido, y con `sprint` responde la capacidad, la ejecución, el trabajo no planificado, la multitarea, las historias y la actividad por día de ese sprint; en ambos casos la lista de sprints para la tendencia es la misma y la señal viaja con todas sus evidencias, incluidas las neutras y las no evaluadas

#### Scenario: Actualizar desde Azure DevOps
- **WHEN** se hace un `POST` de actualización general o de una persona con identidad
- **THEN** responde `200` con la hora nueva, el siguiente `GET` la refleja como última actualización, las cifras del sprint en curso se recalculan y las de los sprints sellados quedan idénticas; sobre una persona sin identidad responde `409`, y sobre una persona inexistente `404`

#### Scenario: Vincular una identidad hace aparecer su dedicación real
- **WHEN** una persona sin identidad se vincula por el handler de detalle de persona en la misma sesión
- **THEN** el siguiente `GET` de colaboradores la muestra con sus sprints, su capacidad y su demanda en vez de "Sin identidad"; su señal es "No evaluable · histórico insuficiente" hasta que acumule los sprints sellados del mínimo configurado

#### Scenario: Procedencia del snapshot
- **WHEN** se pide el detalle de un colaborador con sprints cerrados sellados, un sprint cerrado sin snapshot y el sprint en curso
- **THEN** los sellados responden con su procedencia y la fecha del sellado, el sprint sin snapshot responde como tal, sin cifras de cumplimiento ni carry-over y fuera del histórico, y el en curso responde como provisional

### Requirement: Handler de mock para la configuración de sprints
El sistema SHALL exponer un handler de mock que sirve (`GET`) y persiste (`PUT`) la configuración de sprints en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. La configuración SHALL constar de **semanas por sprint**, **sprints por quarter**, **hora de cierre del sprint** ("23:00" por defecto, formato `HH:mm` de 24 horas: el momento del último día del sprint en que se sella el snapshot), **ventana de histórico** (6 por defecto, entre 3 y 12 sprints) y **mínimo de sprints para evaluar** (3 por defecto, entre 2 y 6 y nunca mayor que la ventana), y de nada más: el handler SHALL NOT devolver ni aceptar puntos por FTE por sprint, horas por semana ni tolerancia de reporte, porque la plataforma no registra horas y el FTE no traduce puntos. Un `PUT` con un valor fuera de rango o no numérico en cualquiera de los campos numéricos, una hora de cierre con formato inválido, o un mínimo mayor que la ventana SHALL responder `400` sin modificar la configuración guardada. El handler SHALL exponer un snapshot de sólo lectura de la hora de cierre, la ventana de histórico y el mínimo de sprints para el mock de dedicación real.

#### Scenario: Obtener la configuración actual
- **WHEN** se hace un `GET` al endpoint mockeado de configuración de sprints
- **THEN** responde con la configuración vigente (la inicial, o la última guardada con `PUT` en esa misma sesión), con semanas por sprint, sprints por quarter, hora de cierre, ventana de histórico y mínimo de sprints, y sin campos de horas ni de puntos por FTE

#### Scenario: Guardar una configuración nueva
- **WHEN** se hace un `PUT` al endpoint mockeado con una configuración válida
- **THEN** el handler la persiste en memoria y un `GET` posterior en la misma sesión la refleja

#### Scenario: Guardar con datos inválidos
- **WHEN** se hace un `PUT` con datos que no cumplen la validación del handler —una hora de cierre mal formada, un valor fuera de rango, o un mínimo de sprints mayor que la ventana de histórico—
- **THEN** responde con un error HTTP (400), sin modificar la configuración previamente guardada

### Requirement: Handler de mock para el detalle de una persona
El sistema SHALL exponer un handler de mock con un `GET` de detalle por persona que devuelve, en una sola respuesta, todo lo que la página de detalle necesita: los datos de la persona (los mismos del `GET` por id de personas, más la etiqueta en español de la modalidad, el nivel SFIA derivado del seniority, y la vinculación con proveedor y vigencia de contrato si es externa); su asignación actual (célula con nombre, criticidad y tribu, nombres de los compañeros, dedicación, BAU, Transformación y fecha de inicio) o `null`; la identidad DevOps (vinculada, con el identificador del usuario de Azure DevOps, su usuario y la fecha de vinculación, y el **sprint en curso** —nombre del sprint, SP comprometidos, mediana histórica propia, FTE contractual y FTE disponible, y la señal de balance con el conteo de evidencias que la sostienen o el motivo de no evaluable— tomado del snapshot de señales del mock de dedicación real, o `null` cuando Azure DevOps no devuelve sprints; SHALL NOT traer FTE comprometido, FTE asignado como referencia de lectura, diferencia en FTE ni el campo de lectura; o `null`); las capacidades que cubre (nombre, nivel SFIA, si es la principal, cuántas personas más del chapter la cubren); su línea de expertise y el lead de esa línea; la lectura de concordancia costo / seniority; el SFIA requerido por su célula para su capacidad; y, sin célula, las células que piden su capacidad (id, nombre, motivo, SFIA requerido, FTE asignado y disponible). El detalle SHALL NOT devolver identidades candidatas por nombre: la identidad se encuentra buscando en Azure DevOps por correo. El detalle SHALL NOT devolver horas reportadas, reporte del sprint, sprints ni un FTE real: la plataforma no registra horas. La identidad SHALL NOT traer items activos ni pendientes de curación: la curación manual no existe.

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
