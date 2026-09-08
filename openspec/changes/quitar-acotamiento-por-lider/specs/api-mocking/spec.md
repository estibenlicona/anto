## RENAMED Requirements

- FROM: `### Requirement: Handler de mock para el resumen de capacidad del chapter`
- TO: `### Requirement: Handler de mock para el resumen de capacidad`

## MODIFIED Requirements

### Requirement: Handler de mock para células
El sistema SHALL exponer un handler de mock con CRUD completo de células (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), el catálogo de criticidades (`GET`) y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El `GET` de listado SHALL aceptar además `search` (texto) y `criticality` (uno o más valores), aplicando esos filtros antes de paginar. Cada célula devuelta —en el listado y por id— SHALL incluir campos calculados de sólo lectura —cantidad de personas asignadas, una muestra de ellas para avatares, FTE asignado y su desglose BAU / Transformación, y el FTE disponible de sus personas (suma del `availableFte` de las personas asignadas, tomado del mock de personas)— derivados de las asignaciones actuales en memoria del mock de asignaciones, de modo que una asignación creada o quitada en el detalle de la célula se refleje en el listado de Células dentro de la misma sesión.

La agrupación a la que pertenece una célula SHALL viajar en el atributo `team`, no en `tribe`, en la lectura, el alta y la edición, y el filtro `search` SHALL buscar contra ese atributo además del nombre. Es un cambio incompatible del contrato: un cliente que siga enviando o leyendo `tribe` no encuentra el dato.

Cada célula devuelta SHALL incluir además sus **iniciativas vigentes** —las activas y las que están en evaluación, nunca las cerradas— con, de cada una, su id, su nombre, su estado y su talla, y `null` en la talla cuando esa iniciativa todavía no tiene evaluación guardada. Hoy la relación existe sólo en sentido contrario —la iniciativa conoce su célula—, así que el handler SHALL derivarla del mock de iniciativas, del mismo modo que ya deriva las cifras de capacidad del mock de asignaciones, y una iniciativa creada, evaluada o cerrada SHALL reflejarse en el listado de Células dentro de la misma sesión.

El resumen agregado SHALL incluir `atCapacityCount`: cuántas células con personas asignadas tienen el FTE asignado igual o mayor que el FTE disponible de sus personas.

#### Scenario: Células al tope en el resumen
- **WHEN** se hace un `GET` al resumen de células
- **THEN** `atCapacityCount` cuenta las células con equipo cuya asignación alcanza o supera su capacidad, y una sin equipo no cuenta

#### Scenario: Listar células mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de células con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las células actuales en memoria (datos de ejemplo iniciales, o los últimos cambios de la sesión), con los campos calculados de equipo y capacidad en cada célula

#### Scenario: Obtener una célula por id
- **WHEN** se hace un `GET` al endpoint mockeado de una célula con un id que existe en memoria
- **THEN** responde con esa célula y sus campos calculados

#### Scenario: Obtener una célula inexistente
- **WHEN** se hace un `GET` con un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Buscar y filtrar células mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de células con `search` o `criticality`
- **THEN** el handler filtra las células en memoria por nombre o equipo (parcial, sin distinguir mayúsculas) y por las criticidades indicadas antes de paginar, y el sobre paginado refleja el total y la paginación sobre el subconjunto filtrado

#### Scenario: Campos calculados desde las asignaciones
- **WHEN** una célula tiene asignaciones en memoria en el mock de asignaciones
- **THEN** el `GET` de listado devuelve para esa célula la cantidad de personas asignadas, hasta tres de ellas (id y nombre) como muestra, y el FTE asignado total, de BAU y de Transformación (suma de los porcentajes / 100) y el FTE disponible del equipo (suma del `availableFte` de esas personas)

#### Scenario: Campos calculados tras una mutación de asignaciones
- **WHEN** en la misma sesión del mock se crea o quita una asignación de una célula
- **THEN** el siguiente `GET` de listado de células refleja los nuevos valores calculados para esa célula

#### Scenario: Iniciativas vigentes de cada célula
- **WHEN** se pide el listado de células y una de ellas tiene una iniciativa activa evaluada con talla M, otra en evaluación sin evaluación guardada y una tercera cerrada
- **THEN** el handler devuelve para esa célula dos iniciativas —la activa con talla M y la que está en evaluación con talla `null`— y omite la cerrada

#### Scenario: Célula sin iniciativas vigentes
- **WHEN** se pide una célula que no tiene ninguna iniciativa, o cuyas iniciativas están todas cerradas
- **THEN** el handler devuelve la lista de iniciativas vacía, no `null`, para que el cliente no distinga dos formas del mismo caso

#### Scenario: Las iniciativas siguen a su mock dentro de la sesión
- **WHEN** se evalúa o se cierra una iniciativa y luego se vuelve a pedir el listado de células
- **THEN** la célula de esa iniciativa refleja la talla nueva, o deja de listarla si quedó cerrada, sin reiniciar el mock

#### Scenario: El atributo de agrupación es team
- **WHEN** se hace un `POST` o un `PUT` de una célula enviando la agrupación en `team`
- **THEN** el handler la persiste y la devuelve en `team`, y un envío que use `tribe` es tratado como si no trajera la agrupación, fallando la validación de campo obligatorio

#### Scenario: Crear una célula válida
- **WHEN** se hace un `POST` con una célula que cumple las reglas de validación (nombre ≤200, equipo ≤100, descripción ≤500, criticidad del catálogo)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve, con los campos calculados en cero (sin asignaciones todavía)

#### Scenario: Crear con datos inválidos
- **WHEN** se hace un `POST` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin agregar ninguna célula

#### Scenario: Editar una célula existente
- **WHEN** se hace un `PUT` a una célula que existe en memoria, con datos válidos
- **THEN** el handler actualiza esa célula y la devuelve

#### Scenario: Editar una célula inexistente
- **WHEN** se hace un `PUT` a un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Eliminar una célula
- **WHEN** se hace un `DELETE` a un id que existe en memoria
- **THEN** el handler la quita de la lista en memoria

#### Scenario: Obtener el catálogo de criticidades
- **WHEN** se hace un `GET` al endpoint mockeado de criticidades
- **THEN** responde con los valores vigentes (`Critical`, `High`, `Medium`, `Low`)

#### Scenario: Obtener el resumen agregado de células
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de células
- **THEN** el handler calcula, sobre todas las células actuales en memoria (sin paginar ni filtrar), el total de células, cuántas no tienen asignaciones, cuántas tribus distintas hay, la distribución por criticidad (los 4 niveles, incluso con cero), el FTE asignado total con su desglose BAU / Transformación, y el FTE disponible total como la suma del FTE disponible de las personas actuales en memoria del mock de personas

### Requirement: Handler de mock para personas
El sistema SHALL exponer un handler de mock con CRUD completo de personas (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), asignación de proveedor (`PUT` a un sub-recurso, sin proveedor en el cuerpo del alta/edición), los catálogos de levels, seniorities y modalities (`GET`), un catálogo de solo lectura de compañías/proveedores (`GET`), y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. Cada persona SHALL llevar `level`/`levelLabel` (la escala Tuya 1–4: Principiante, Competente, Avanzado, Experto) y `seniority`/`seniorityLabel` (`Junior`, `Intermediate`, `Senior` — en español Junior, Intermedio, Senior); el campo numérico que antes viajaba como `seniority` SHALL viajar como `level`. El `GET` de listado SHALL aceptar además `search` (texto), `level` (uno o más valores), `seniority` (uno o más valores) y `stack` (uno o más nombres: personas con cualquiera de ellos), aplicando esos filtros antes de paginar. Cada persona SHALL llevar sus `stacks` (`name`, `level` 1–4, `isPrimary`), con datos de ejemplo que cubran el catálogo y al menos dos stacks que sólo una persona tenga. El handler SHALL exponer el catálogo de stacks (`GET`, solo lectura) y un `PUT` al sub-recurso de stacks de una persona que reemplaza su lista completa (400 si un stack no está en el catálogo, si hay más de un principal o si hay stacks y ninguno es principal). El resumen agregado SHALL incluir la cobertura por stack: cuántos stacks distintos hay y la lista de los que sólo una persona tiene.

#### Scenario: Listar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las personas actuales en memoria (datos de ejemplo iniciales, o los últimos cambios de la sesión)

#### Scenario: Crear una persona válida
- **WHEN** se hace un `POST` con una persona que cumple las reglas de validación (nombre ≤200, documento ≤50, usuario principal ≤250, cargo ≤100, rol ≤100, seniority entre 1 y 4, modalidad del catálogo, FTE disponible entre 0.0 y 1.0, costo mensual ≥0)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve

#### Scenario: Crear con datos inválidos
- **WHEN** se hace un `POST` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin agregar ninguna persona

#### Scenario: Editar una persona existente
- **WHEN** se hace un `PUT` a una persona que existe en memoria, con datos válidos
- **THEN** el handler actualiza esa persona y la devuelve

#### Scenario: Editar una persona inexistente
- **WHEN** se hace un `PUT` a un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Eliminar una persona
- **WHEN** se hace un `DELETE` a un id que existe en memoria
- **THEN** el handler la quita de la lista en memoria

#### Scenario: Asignar un proveedor a una persona
- **WHEN** se hace un `PUT` al sub-recurso de proveedor de una persona que existe en memoria, con un id de compañía del catálogo
- **THEN** el handler actualiza esa persona con el proveedor asignado, sin requerirlo en el cuerpo del alta o la edición

#### Scenario: Obtener los catálogos de seniority, modalidad y nivel SFIA
- **WHEN** se hace un `GET` a los endpoints mockeados de levels, seniorities o modalities
- **THEN** cada uno responde con sus valores vigentes (levels: los 4 niveles de la escala Tuya con su etiqueta — la escala que antes se sirvió como "seniorities" y antes como "nivel SFIA"; seniorities: `Junior`, `Intermediate`, `Senior` con sus etiquetas Junior, Intermedio, Senior; modalities: `Remote`, `Hybrid`, `OnSite`)

#### Scenario: Obtener el catálogo de compañías/proveedores
- **WHEN** se hace un `GET` al endpoint mockeado de compañías
- **THEN** responde con la lista de proveedores de ejemplo, sin exponer operaciones de alta, edición o baja sobre ese catálogo

#### Scenario: Buscar y filtrar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `search`, `level` o `seniority`
- **THEN** el handler filtra las personas en memoria por esos criterios antes de paginar, y el sobre paginado refleja el total y la paginación sobre el subconjunto filtrado

#### Scenario: Obtener el resumen agregado de personas
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de personas
- **THEN** el handler calcula, sobre todas las personas actuales en memoria (sin paginar ni filtrar), el total, el FTE disponible y la distribución por seniority; la capacidad objetivo usada para el % de FTE asignado es un valor fijo que el mock asume

#### Scenario: Filtrar por stack
- **WHEN** se hace un `GET` de listado con `stack=Azure&stack=MuleSoft`
- **THEN** responde sólo con las personas que tienen alguno de esos stacks, y `totalCount` cuenta ese subconjunto

#### Scenario: Reemplazar los stacks de una persona
- **WHEN** se hace un `PUT` al sub-recurso de stacks con una lista válida y un principal
- **THEN** el siguiente `GET` por id devuelve exactamente esa lista; el resumen recalcula la cobertura; con un stack fuera del catálogo o sin principal responde `400`

#### Scenario: Catálogo de stacks
- **WHEN** se hace un `GET` al catálogo de stacks
- **THEN** responde con los nombres del catálogo, ordenados, sin duplicados

### Requirement: Handler de mock para el resumen de capacidad
El sistema SHALL exponer un `GET` mockeado con el resumen de capacidad calculado sobre todas las personas, células y asignaciones en memoria, sin acotar por el titular del token: FTE total con su reparto BAU / Transformación / libre; conteos de personas con margen (sin célula, dedicación parcial) y de células al tope y sin equipo; la lista de personas con su asignación (célula, dedicación, desglose) o ninguna, su FTE disponible y su margen; y la lista de células con su ocupación (asignado, disponible del equipo, BAU, Transformación, personas, criticidad).

#### Scenario: Resumen con datos
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de capacidad
- **THEN** responde con los indicadores, todas las personas y todas las células, coherentes con las asignaciones actuales en memoria

#### Scenario: Resumen tras una mutación
- **WHEN** en la misma sesión se crea, edita o quita una asignación
- **THEN** el siguiente `GET` del resumen refleja el cambio

### Requirement: Handler de mock para el detalle de una persona
El sistema SHALL exponer un handler de mock con un `GET` de detalle por persona que devuelve, en una sola respuesta, todo lo que la página de detalle necesita: los datos de la persona (los mismos del `GET` por id de personas, más la etiqueta en español de la modalidad, el nivel SFIA derivado del seniority, y la vinculación con proveedor y vigencia de contrato si es externa); su asignación actual (célula con nombre, criticidad y tribu, nombres de los compañeros, dedicación, BAU, Transformación y fecha de inicio) o `null`; la identidad DevOps (vinculada, con el identificador del usuario de Azure DevOps, su usuario y la fecha de vinculación, y el **sprint en curso** —nombre del sprint, SP comprometidos, mediana histórica propia, la desviación frente al habitual, FTE contractual y FTE disponible con sus horas, y la señal de balance de cuatro valores con el conteo de evidencias que la sostienen o el motivo de no evaluable— tomado del snapshot de señales del mock de dedicación real, o `null` cuando Azure DevOps no devuelve sprints; SHALL NOT traer FTE comprometido, FTE asignado como referencia de lectura, diferencia en FTE, el campo de lectura ni una señal de "revisar"; o `null`); las capacidades que cubre (nombre, nivel SFIA, si es la principal, cuántas personas más la cubren); su línea de expertise y el lead de esa línea; la lectura de concordancia costo / seniority; el SFIA requerido por su célula para su capacidad; y, sin célula, las células que piden su capacidad (id, nombre, motivo, SFIA requerido, FTE asignado y disponible). El detalle SHALL NOT devolver identidades candidatas por nombre: la identidad se encuentra buscando en Azure DevOps por correo. El detalle SHALL NOT devolver horas reportadas, reporte del sprint, sprints ni un FTE real: la plataforma no registra horas. La identidad SHALL NOT traer items activos ni pendientes de curación: la curación manual no existe.

La línea de expertise y su lead SHALL derivarse del mock de líneas en memoria y no de una constante propia del handler, de modo que mover a la persona de línea, cambiarle el nombre a la línea o designarle otro lead en la misma sesión se refleje en el siguiente `GET`. Una persona que no pertenece a ninguna línea SHALL devolver la línea en `null`, y una línea sin lead SHALL devolver el lead en `null`; el handler SHALL NOT inventar un nombre de línea ni de lead en esos casos.

La asignación, la célula, los compañeros y las células sugeridas SHALL derivarse de los mocks actuales en memoria de personas, asignaciones y células (no de copias propias), de modo que asignar, mover o quitar en la misma sesión se refleje en el siguiente `GET`. La identidad DevOps y las capacidades SHALL salir de datos de ejemplo propios del handler, con al menos una persona sin identidad DevOps y una con una capacidad de bus factor 1; la lectura del sprint en curso SHALL salir del mock de dedicación real.

El handler SHALL exponer además un `GET` de **búsqueda de usuarios de Azure DevOps por correo** (`GET /devops/users?email=<correo>`) que responde el usuario cuyo correo coincide, sin distinguir mayúsculas: su identificador, nombre para mostrar, correo, URL de avatar (o `null`), y los nombres de sus proyectos, equipos y tableros; `404` si ningún usuario tiene ese correo, y `400` si falta el parámetro. Los datos de ejemplo SHALL incluir un usuario de DevOps cuyo correo es el correo corporativo de la persona sin identidad, un usuario ya vinculado a otra persona, y ningún usuario para al menos un correo con forma válida.

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
- **THEN** el siguiente `GET` del detalle devuelve los stacks nuevos con su cobertura recalculada sobre el resto de las personas

#### Scenario: La señal de la ficha es la misma del listado
- **WHEN** se comparan la señal del sprint en curso que trae la identidad DevOps del detalle y la fila de esa persona en el listado de dedicación real
- **THEN** son la misma señal de las cuatro, con el mismo conteo de evidencias y el mismo motivo de no evaluable cuando aplica, y ninguna de las dos responde "revisar"

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

El FTE disponible de una línea SHALL ser la suma del FTE disponible de sus personas, y el FTE asignado la suma de sus porcentajes de dedicación dividida entre cien, con el mismo criterio y el mismo redondeo del handler del resumen de capacidad, para que la pantalla de Líneas y la Torre de control no den números distintos sobre las mismas personas. El FTE libre SHALL ser la diferencia acotada a cero, dado que con personas de FTE parcial asignadas al 100 % el asignado puede superar al disponible.

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

### Requirement: Handler de mock para la dedicación real
El sistema SHALL exponer un handler de mock del balance de carga con los endpoints `/dedication/collaborators…`, que reemplazan a `/dedication/capacities…`.

Un `GET /dedication/collaborators` con `sprint` opcional SHALL devolver una fila por **cada colaborador registrado**, sin acotar por el usuario en sesión, **todas para el mismo sprint** —el en curso cuando no se pide otro— con: el colaborador (id, nombre, cargo, avatar); su célula, el FTE declarado en su asignación como dato de contexto, y las **iniciativas que sus historias tocaron en ese sprint** (con su épica y la iniciativa mapeada cuando la hay); si tiene identidad DevOps; el sprint con nombre, fechas, si es el en curso y procedencia del snapshot; su **capacidad** (FTE contractual, FTE disponible, el desglose de días —laborales, festivos, vacaciones, ausencias y otras indisponibilidades— y las **horas disponibles y descontadas** derivadas de las horas por sprint); su **demanda** (SP comprometidos y HUs comprometidas); su **referencia** (mediana histórica propia, mediana histórica de la célula, cuántos sprints sellados la sostienen, y la desviación del sprint frente al habitual en SP y en porcentaje); su **multitarea** (iniciativas simultáneas y **HUs abiertas** a la vez); y su **señal de balance** con el conteo de evidencias que la sostienen, si la célula se comporta igual, y, cuando aplica, el motivo de no evaluable. La respuesta SHALL incluir el sprint elegido, si hay sprint anterior y siguiente disponibles, un resumen por señal (sobreasignación, subasignación, carga habitual, no evaluables con su desglose por motivo), las horas por sprint, la ventana de histórico y el mínimo de sprints vigentes, y la hora de la última actualización. SHALL aceptar `squadId` y `search`, y paginar como los demás listados; SHALL NOT aceptar un filtro por señal.

Un `GET /dedication/collaborators/{personId}` con `sprint` opcional SHALL devolver el colaborador, su asignación, la lista de sprints (nombre, fechas, si es el en curso, procedencia del snapshot, SP comprometidos y completados, % de cumplimiento y carry-over %) que alimenta la tendencia, y, para el sprint elegido (el en curso por defecto): la **capacidad** con su desglose de días y sus horas; la **ejecución** (SP comprometidos, completados, no completados, % de cumplimiento, carry-over en SP y %, procedencia y fecha del sellado); el **trabajo no planificado** (comprometido al inicio, agregado durante el sprint, total trabajado y la proporción); la **multitarea** (iniciativas simultáneas con su épica, su iniciativa mapeada si la hay y sus SP; HUs comprometidas y HUs abiertas a la vez); la **referencia** con las desviaciones del colaborador y de su célula; la **señal de balance** con la lista completa de evidencias evaluadas —cada una con su dirección, su cifra, su umbral y si se pudo evaluar— y el contexto de célula cuando aplica; las **historias** comprometidas (id, número, título, etiqueta `Initiative | Bau | null`, épica, iniciativa mapeada por el Epic si la hay, puntos, estado en DevOps, si entró después del inicio del sprint, tablero, URL en DevOps); y la **actividad por día** (fecha, commits, releases y features creadas).

Dos `POST` de actualización, `/dedication/collaborators/sync` y `/dedication/collaborators/{personId}/sync`, SHALL responder la hora nueva de última actualización y SHALL recalcular sólo las cifras provisionales del sprint en curso, dejando intactos los snapshots sellados. SHALL responder `404` en el detalle y en la actualización de una persona que no existe, y `409` al actualizar una persona sin identidad DevOps. Un `sprint` desconocido en cualquiera de los dos `GET` SHALL caer al sprint en curso en vez de responder un error: es un enlace viejo, no una petición inválida.

El handler SHALL derivar del resto de los mocks todo lo que ya es de otro: el colaborador y su FTE contractual, del mock de personas; la identidad y el usuario de DevOps, del mock de detalle de persona; la célula y el FTE declarado, de los snapshots de asignaciones y células; el nombre de las iniciativas mapeadas, del de iniciativas; los días de vacaciones y ausencias aprobadas que intersectan cada sprint, del mock de ausencias; y las horas por sprint, la ventana de histórico, el mínimo de sprints y la hora de cierre, del mock de configuración de sprints. El FTE disponible y sus horas, las medianas históricas, las métricas de ejecución provisionales, el trabajo no planificado, la multitarea y la señal de balance SHALL calcularse con las reglas de la capability `real-dedication`, de modo que vincular una identidad, aprobar una ausencia, cambiar una asignación o cambiar cualquier parámetro del calendario en la misma sesión se refleje en el siguiente `GET`. El handler SHALL NOT devolver ni aceptar puntos por FTE por sprint, FTE comprometido, FTE asignado como referencia de lectura, ni una señal de "revisar".

Los datos de ejemplo SHALL incluir al menos: un colaborador con carga habitual; uno con posible sobreasignación sostenida por varias evidencias; dos de una misma célula con posible subasignación cuya célula está igualmente por debajo, para ejercitar el contexto de célula; uno sin identidad; uno sin sprints; uno con histórico insuficiente; uno sin célula pero con demanda e histórico propios; un colaborador a tiempo parcial; un sprint con festivo y ausencia aprobada; un sprint cerrado sin snapshot; un sprint en curso provisional; historias entradas después del inicio del sprint; épicas mapeadas y sin mapear a iniciativa; un colaborador que toca más de dos iniciativas en un sprint; y un sprint sin actividad. Todo SHALL persistir en memoria durante la sesión, disponible en Node y en navegador, con `reset`, y SHALL exponer un snapshot de sólo lectura de las señales para la ficha de la persona y el badge de navegación.

#### Scenario: Listado con resumen
- **WHEN** se hace un `GET` de colaboradores sin filtros
- **THEN** responde una fila por cada colaborador registrado para el sprint en curso, ordenada por señal accionable (sobreasignación y subasignación primero, luego carga habitual, al final no evaluables), el resumen por las cuatro señales coherente con las filas y con el desglose de motivos de no evaluable, las horas por sprint, la ventana de histórico y el mínimo vigentes, y la última actualización

#### Scenario: Listado de un sprint anterior
- **WHEN** se hace un `GET` de colaboradores con el nombre de un sprint cerrado
- **THEN** todas las filas responden con la capacidad, la demanda, la multitarea y la señal de ese sprint, el resumen las acompaña, y la respuesta indica que hay sprint anterior y siguiente disponibles

#### Scenario: No hay sprint después del en curso
- **WHEN** se hace un `GET` de colaboradores sin `sprint`, o con el nombre del sprint en curso
- **THEN** la respuesta marca ese sprint como el en curso y declara que no hay sprint siguiente disponible

#### Scenario: La lectura sigue a la asignación y al parámetro
- **WHEN** en la misma sesión se aprueba una ausencia que cae dentro del sprint en curso, se cambia la dedicación de una persona por el handler de asignaciones, o se cambian las horas por sprint o la ventana de histórico por el de configuración de sprints
- **THEN** el siguiente `GET` recalcula su FTE disponible, sus horas, sus medianas y su señal de balance con los valores nuevos; cambiar sólo las horas por sprint mueve las horas y deja la señal igual; y el FTE declarado en la asignación viaja como contexto sin alterar la señal

#### Scenario: Dedicación real de una capacidad por sprint
- **WHEN** se hace un `GET` del detalle de una persona con identidad, con y sin `sprint`
- **THEN** sin `sprint` responde el sprint en curso elegido, y con `sprint` responde la capacidad, la ejecución, el trabajo no planificado, la multitarea, las historias y la actividad por día de ese sprint; en ambos casos la lista de sprints para la tendencia es la misma y la señal viaja con todas sus evidencias, incluidas las neutras y las no evaluadas

#### Scenario: Actualizar desde Azure DevOps
- **WHEN** se hace un `POST` de actualización general o de una persona con identidad
- **THEN** responde `200` con la hora nueva, el siguiente `GET` la refleja como última actualización, las cifras del sprint en curso se recalculan y las de los sprints sellados quedan idénticas; sobre una persona sin identidad responde `409`, y sobre una persona inexistente `404`

#### Scenario: Vincular una identidad hace aparecer su dedicación real
- **WHEN** una persona sin identidad se vincula por el handler de detalle de persona en la misma sesión
- **THEN** el siguiente `GET` de colaboradores la muestra con sus sprints, su capacidad y su demanda en vez de "Sin identidad"; su señal es "No evaluable · histórico insuficiente" hasta que acumule los sprints sellados del mínimo configurado

#### Scenario: El contexto de célula viaja sin atenuar la señal
- **WHEN** se pide el listado de un sprint en el que dos colaboradores de una misma célula están igualmente por debajo de su histórico
- **THEN** los dos responden con señal de posible subasignación, cuentan en el indicador de subasignación, y cada uno trae la marca de que su célula se comporta igual

#### Scenario: Procedencia del snapshot
- **WHEN** se pide el detalle de un colaborador con sprints cerrados sellados, un sprint cerrado sin snapshot y el sprint en curso
- **THEN** los sellados responden con su procedencia y la fecha del sellado, el sprint sin snapshot responde como tal, sin cifras de cumplimiento ni carry-over y fuera del histórico, y el en curso responde como provisional
