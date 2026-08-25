## Purpose

TBD - add-chapter-lead-squads-screen - Update Purpose after archive
## Requirements
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
- **THEN** el handler calcula, sobre todas las células actuales en memoria (sin paginar ni filtrar), el total de células, cuántas no tienen asignaciones, cuántas tribus distintas hay, la distribución por criticidad (los 4 niveles, incluso con cero), el FTE asignado total con su desglose BAU / Transformación, y el FTE disponible del chapter como la suma del FTE disponible de las personas actuales en memoria del mock de personas

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

### Requirement: Modo navegador de los mocks, activado explícitamente
El sistema SHALL permitir interceptar en el navegador (Service Worker), durante `pnpm dev`, las mismas peticiones HTTP que el modo Node intercepta en los tests, usando los mismos handlers. El sistema SHALL activar este modo únicamente cuando una variable de entorno lo indique explícitamente, y SHALL NOT activarlo en un build de producción bajo ninguna circunstancia.

#### Scenario: Desarrollador activa el modo mock
- **WHEN** se levanta `pnpm dev` con `VITE_USE_MOCKS=true`
- **THEN** las peticiones HTTP que haga la app (por ejemplo, al iniciar sesión) son interceptadas por el Service Worker de mocks y responden con los datos de los handlers, sin llegar a ningún backend real

#### Scenario: Desarrollo sin la variable de entorno
- **WHEN** se levanta `pnpm dev` sin `VITE_USE_MOCKS` (o en `false`)
- **THEN** la app se comporta igual que hoy: las peticiones HTTP van al backend real configurado en `VITE_BASE_URL`

#### Scenario: Build de producción
- **WHEN** se genera un build de producción (`npm run build:prod` o equivalente)
- **THEN** el Service Worker de mocks no se incluye ni se activa, sin importar el valor de `VITE_USE_MOCKS`

### Requirement: Los handlers de mock funcionan igual en Node y en navegador
El sistema SHALL usar los mismos handlers de mock (los definidos en `frontend/src/mocks/handlers/`) tanto para el modo Node (tests) como para el modo navegador (desarrollo), sin duplicar su definición ni acoplarlos a un origen específico.

#### Scenario: Un handler ya existente funciona en ambos modos
- **WHEN** un handler de mock (por ejemplo, el de login) se ejercita tanto desde un test de Vitest como desde el navegador en modo mock
- **THEN** responde de forma equivalente en ambos casos, sin necesitar una versión distinta del handler para cada modo

### Requirement: Servidor de mocks de red disponible en toda la suite de tests
El sistema SHALL interceptar, durante la ejecución de la suite de tests de Vitest, las peticiones HTTP salientes del frontend a nivel de red (no de módulo), sin requerir configuración adicional por archivo de test.

#### Scenario: Un test hace una petición HTTP sin configurar nada
- **WHEN** un test ejercita un flujo que internamente llama a `httpClient` (por ejemplo, a través de `authService`)
- **THEN** la petición es interceptada por el servidor de mocks y no llega a ningún backend real

### Requirement: Handlers de mock para los endpoints de autenticación
El sistema SHALL exponer handlers de mock para los endpoints que usa `authService` (login, logout, obtener usuario actual), cubriendo tanto la respuesta de éxito como errores HTTP (401 y 500).

#### Scenario: Login exitoso mediante el mock
- **WHEN** un test ejercita el flujo de login con credenciales válidas
- **THEN** el handler de mock responde con un cuerpo de éxito equivalente al que devuelve hoy el backend real, y el flujo de UI/hook lo procesa igual que una respuesta real

#### Scenario: Login con credenciales inválidas mediante el mock
- **WHEN** un test ejercita el flujo de login configurado para fallar
- **THEN** el handler de mock responde con un error HTTP (401), y el flujo de UI/hook lo procesa igual que un error real de servidor

### Requirement: Los tests pueden sobreescribir la respuesta de un handler puntualmente
El sistema SHALL permitir que un test individual reemplace, solo para su propia ejecución, la respuesta de cualquier handler de mock (por ejemplo, para simular un error 500 específico), sin afectar a otros tests de la suite.

#### Scenario: Un test necesita simular un error de servidor
- **WHEN** un test sobreescribe el handler de un endpoint para que responda con un error 500
- **THEN** solo ese test recibe esa respuesta; el resto de la suite sigue usando el handler por defecto

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

### Requirement: Handler de mock para personas
El sistema SHALL exponer un handler de mock con CRUD completo de personas (`GET` listado paginado, `GET` por id, `POST` alta, `PUT` edición, `DELETE` baja), asignación de proveedor (`PUT` a un sub-recurso, sin proveedor en el cuerpo del alta/edición), los catálogos de seniorities y modalities (`GET`), un catálogo de solo lectura de compañías/proveedores (`GET`), y un resumen agregado (`GET`), persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. El `GET` de listado SHALL aceptar además `search` (texto), `seniority` (uno o más valores) y `stack` (uno o más nombres: personas con cualquiera de ellos), aplicando esos filtros antes de paginar. Cada persona SHALL llevar sus `stacks` (`name`, `level` 1–4, `isPrimary`), con datos de ejemplo que cubran el catálogo y al menos dos stacks que sólo una persona tenga. El handler SHALL exponer el catálogo de stacks del chapter (`GET`, solo lectura) y un `PUT` al sub-recurso de stacks de una persona que reemplaza su lista completa (400 si un stack no está en el catálogo, si hay más de un principal o si hay stacks y ninguno es principal). El resumen agregado SHALL incluir la cobertura por stack: cuántos stacks distintos hay y la lista de los que sólo una persona tiene.

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
- **WHEN** se hace un `GET` a los endpoints mockeados de seniorities o modalities
- **THEN** cada uno responde con sus valores vigentes (seniorities: los 4 niveles de la escala Tuya con su etiqueta — el mismo catálogo que antes se llamaba "nivel SFIA", ya fusionado; modalities: `Remote`, `Hybrid`, `OnSite`); el endpoint `sfia-levels` ya no existe por separado

#### Scenario: Obtener el catálogo de compañías/proveedores
- **WHEN** se hace un `GET` al endpoint mockeado de compañías
- **THEN** responde con la lista de proveedores de ejemplo, sin exponer operaciones de alta, edición o baja sobre ese catálogo

#### Scenario: Buscar y filtrar personas mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de personas con `search` o `seniority`
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
- **THEN** responde con los nombres del catálogo del chapter, ordenados, sin duplicados

### Requirement: Handler de mock para asignaciones
El sistema SHALL exponer un handler de mock con las asignaciones de personas a células: `GET` paginado de las asignaciones de una célula, `POST` alta, `PUT` edición, `DELETE` baja, persistiendo los cambios en memoria durante la sesión del mock, disponible tanto en modo Node (tests) como en modo navegador. Cada asignación devuelta SHALL incluir campos de sólo lectura derivados de la persona en memoria del mock de personas (cargo, modalidad, seniority y su etiqueta) y su margen (porcentaje disponible = 100 − su dedicación, porque una persona tiene una sola asignación). El `POST` SHALL rechazar con 400 una asignación para una persona que ya tiene una en cualquier célula, y las semillas NO SHALL tener personas en dos células. El `GET` de listado SHALL aceptar además `search` (nombre o cargo de la persona) y `seniority` (uno o más valores), aplicando esos filtros antes de paginar.

#### Scenario: Listar las asignaciones de una célula
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula con `page` y `pageSize`
- **THEN** responde con el sobre paginado (`items`, `page`, `pageSize`, `totalCount`, `totalPages`) recortado sobre las asignaciones actuales en memoria de esa célula (datos de ejemplo iniciales, o los últimos cambios de la sesión), con los campos de persona y disponibilidad en cada una

#### Scenario: Campos de persona y disponibilidad
- **WHEN** una persona tiene 80% en su célula
- **THEN** su asignación sale con el cargo, modalidad y seniority de la persona y 20 de porcentaje disponible

#### Scenario: Una persona, una célula
- **WHEN** se hace un `POST` para una persona que ya tiene asignación en otra célula
- **THEN** responde con un error HTTP (400) sin crear nada

#### Scenario: Buscar y filtrar asignaciones mockeadas
- **WHEN** se hace un `GET` al endpoint mockeado de asignaciones de una célula con `search` o `seniority`
- **THEN** el handler filtra por nombre o cargo de la persona y por los seniorities indicados antes de paginar, y el sobre paginado refleja el total sobre el subconjunto filtrado

#### Scenario: Crear una asignación válida
- **WHEN** se hace un `POST` con una asignación que cumple las reglas de validación (persona y célula existentes, % de dedicación entre 1 y 100, % BAU y % Transformación entre 0 y 100 cada uno y cuya suma sea igual al % de dedicación)
- **THEN** el handler la agrega en memoria con un id nuevo y la devuelve con los campos de persona y disponibilidad

#### Scenario: Crear con datos inválidos
- **WHEN** se hace un `POST` con datos que no cumplen la validación del handler
- **THEN** responde con un error HTTP (400), sin agregar ninguna asignación

#### Scenario: Editar una asignación existente
- **WHEN** se hace un `PUT` a una asignación que existe en memoria, con datos válidos
- **THEN** el handler actualiza esa asignación y la devuelve

#### Scenario: Editar una asignación inexistente
- **WHEN** se hace un `PUT` a un id que no existe en memoria
- **THEN** responde con un error HTTP (404)

#### Scenario: Eliminar una asignación
- **WHEN** se hace un `DELETE` a un id que existe en memoria
- **THEN** el handler la quita de la lista en memoria

### Requirement: Handler de mock para el resumen del equipo de una célula
El sistema SHALL exponer un `GET` mockeado con el resumen del equipo de una célula, calculado sobre todas sus asignaciones actuales en memoria y las personas en memoria: cantidad de personas, todas ellas (id y nombre) para los avatares, cuántas son de nivel Experto y cuántas de nivel Principiante, FTE asignado con su desglose BAU / Transformación, y el FTE disponible del equipo (suma del `availableFte` de las personas asignadas).

#### Scenario: Resumen del equipo de una célula existente
- **WHEN** se hace un `GET` al endpoint mockeado de resumen del equipo de una célula que existe
- **THEN** responde con los conteos y FTE calculados sobre las asignaciones y personas actuales en memoria

#### Scenario: Resumen de una célula sin asignaciones
- **WHEN** la célula existe pero no tiene asignaciones
- **THEN** responde con ceros y una lista de personas vacía

#### Scenario: Resumen de una célula inexistente
- **WHEN** el id no corresponde a ninguna célula en memoria
- **THEN** responde con un error HTTP (404)

### Requirement: Handler de mock para el resumen de capacidad del chapter
El sistema SHALL exponer un `GET` mockeado con el resumen de capacidad del chapter calculado sobre todas las personas, células y asignaciones en memoria: FTE del chapter con su reparto BAU / Transformación / libre; conteos de personas con margen (sin célula, dedicación parcial) y de células al tope y sin equipo; la lista de personas con su asignación (célula, dedicación, desglose) o ninguna, su FTE disponible y su margen; y la lista de células con su ocupación (asignado, disponible del equipo, BAU, Transformación, personas, criticidad).

#### Scenario: Resumen con datos
- **WHEN** se hace un `GET` al endpoint mockeado de resumen de capacidad
- **THEN** responde con los indicadores, todas las personas y todas las células, coherentes con las asignaciones actuales en memoria

#### Scenario: Resumen tras una mutación
- **WHEN** en la misma sesión se crea, edita o quita una asignación
- **THEN** el siguiente `GET` del resumen refleja el cambio

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

### Requirement: Handler de mock para evaluaciones de habilidades
El sistema SHALL exponer un handler de mock con `GET` de la evaluación de una persona en un ciclo (devuelve la en curso, o la última cerrada cuando no hay ninguna en curso), `POST` para abrir una (400 si ya existe una en curso para esa persona y ciclo), `PUT` de una habilidad de la evaluación (nivel elegido, criterios marcados y nota; 400 si hay brecha y la nota viene vacía, o si el nivel no está en la escala) y `PUT` de cierre (400 si alguna habilidad activa quedó sin nivel).

El handler SHALL derivar, y NOT aceptar digitados: el nivel que pide el rol de la persona —del catálogo, contra la versión que corresponda—, la existencia y el tamaño de la brecha, y los criterios sin marcar del nivel exigido. Al cerrar SHALL estampar la versión vigente del catálogo, y a partir de ahí SHALL resolver esa evaluación contra esa versión aunque el catálogo cambie.

Los cambios SHALL persistir en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Los datos de ejemplo SHALL incluir evaluaciones cerradas de varias personas con roles distintos —de modo que la misma habilidad tenga niveles esperados distintos entre ellas—, una evaluación en curso a medio recorrer, y al menos una persona sin evaluar.

El handler SHALL exponer un snapshot de sólo lectura de las evaluaciones cerradas, con nivel y brecha por persona y habilidad, para que la matriz del span y el plan individual lo consuman.

#### Scenario: Abrir y retomar
- **WHEN** se hace un `POST` para una persona sin evaluación en curso y luego un `GET`
- **THEN** el primero la crea en curso y el segundo la devuelve con lo guardado hasta el momento; un segundo `POST` responde 400

#### Scenario: Guardar una habilidad
- **WHEN** se hace un `PUT` de una habilidad con nivel y criterios marcados
- **THEN** responde la evaluación actualizada con la brecha derivada y los criterios sin marcar del nivel exigido; con brecha y sin nota responde 400

#### Scenario: Cerrar
- **WHEN** se hace un `PUT` de cierre con todas las habilidades activas evaluadas
- **THEN** la evaluación queda cerrada con la versión del catálogo estampada; con alguna habilidad sin nivel responde 400 indicando cuáles

#### Scenario: Una cerrada no se mueve
- **WHEN** el catálogo publica una versión nueva
- **THEN** el `GET` de una evaluación cerrada sigue devolviendo los criterios y niveles esperados de la versión con la que se cerró

### Requirement: Handler de mock para prefacturas de proveedores
El sistema SHALL exponer un handler de mock cuyo recurso es la **prefactura de una persona externa en un período**, no un cierre por proveedor: `GET` de prefacturas por período (`period=YYYY-MM`) que devuelve una por cada persona externa vigente, con su proveedor y su registro de ese período o `null`; `POST` generar el esperado de un período (crea las que faltan, tomando `monthlyCost`, cargo y célula del snapshot de personas y asignaciones, y el descuento derivado de las ausencias aprobadas de esa persona en el período; las existentes no se tocan); `GET` por id; `POST` de la prefactura recibida a un sub-recurso (número, fecha de recibida, valor total, moneda, y los datos de imputación —célula o CoE, concepto, cuenta contable y su número, centro de costos, orden de compra y cuenta destinada al pago—; deja la prefactura en `Received`; 400 si esa persona ya tiene prefactura de ese período —salvo que esté objetada, en cuyo caso la corregida la devuelve a `Received`—, si el esperado no existe, si la prefactura está aprobada, o si la moneda no es COP); `PUT` del valor prefacturado (pasa a `InReview`); `PUT` ajuste (monto entero distinto de cero, motivo del catálogo `Overtime | PartialEntry | Exit | Other`, nota opcional; pasa a `InReview`; 400 si está aprobada o el monto es cero) y `DELETE` del ajuste; `PUT` de estado (`Approved` sólo desde `Received` o `InReview`, y con nota obligatoria cuando la diferencia no es cero; `Objected` sólo desde `Received` o `InReview` y con motivo obligatorio; 400 en otro caso).

Los datos de **imputación** SHALL persistirse tal como se reciben y SHALL poder llegar incompletos: el número de prefactura, la fecha de recibida y el valor total son obligatorios; los demás SHALL admitir `null` y devolverse como `null`, para que el consumidor distinga un dato que falta de uno en blanco. La **moneda** SHALL viajar con cada prefactura y el handler SHALL rechazar con 400 cualquier valor distinto de `COP`, porque la diferencia se calcula contra un esperado en COP y compararlo con otra moneda sin tasa produce una cifra falsa.

Una prefactura con el esperado generado y todavía sin recibir SHALL llevar estado `Pending`. El esperado, el valor prefacturado, la diferencia y los totales del período SHALL calcularse en el handler; el descuento por ausencias SHALL derivarse del snapshot de ausencias aprobadas y SHALL NOT aceptarse digitado. Una prefactura aprobada SHALL conservar las cifras con las que se aprobó aunque cambien las ausencias del período. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Los datos de ejemplo SHALL incluir el mes anterior con una prefactura aprobada y otra objetada, y el mes en curso con el esperado generado, una prefactura en revisión con diferencia por un descuento no aplicado, y una persona sin prefactura todavía. SHALL incluir además **dos personas del mismo proveedor imputadas a células distintas**: con una sola por proveedor, la razón por la que la unidad es la persona no se puede probar.

El handler SHALL exponer un snapshot de sólo lectura de las prefacturas.

#### Scenario: Generar cierres de un período
- **WHEN** se hace un `POST` de generar para `2026-08`
- **THEN** responde con una prefactura por persona externa, cada una con su tarifa, su descuento derivado de las ausencias aprobadas y `esperado = tarifa − descuento + ajustes`, y un segundo `POST` no crea duplicados

#### Scenario: Ajustar una línea
- **WHEN** se hace un `PUT` de ajuste con `amount: 1140000` y `reason: "Overtime"` sobre una prefactura no aprobada
- **THEN** guarda el ajuste, su esperado lo incorpora y la diferencia y los totales se recalculan; sobre una aprobada responde 400

#### Scenario: Aprobar y reabrir
- **WHEN** se hace un `PUT` de estado `Approved` sobre una prefactura sin diferencia, y luego se registra la corregida de una objetada
- **THEN** el primero responde con la prefactura aprobada y `approvedAtUtc` fijado, y el segundo la devuelve a `Received`; aprobar una ya aprobada responde 400

#### Scenario: Registrar la factura recibida
- **WHEN** se hace un `POST` de la prefactura con número, fecha, valor total e imputación sobre una persona con esperado generado
- **THEN** responde el registro en `Received` con su imputación persistida y la diferencia calculada; un segundo `POST` para la misma persona y período responde 400, y hacerlo sin esperado generado también

#### Scenario: Objetar y aprobar con diferencia
- **WHEN** se hace un `PUT` de estado `Objected` con motivo, o `Approved` sobre una prefactura con diferencia distinta de cero
- **THEN** el primero responde la prefactura objetada con el motivo trazado, y el segundo exige la nota: sin ella responde 400, con ella aprueba y la deja trazada

#### Scenario: Imputación incompleta
- **WHEN** se registra una prefactura sin orden de compra ni centro de costos
- **THEN** el handler la guarda y devuelve esos campos en `null`, en vez de rechazar el registro o devolver cadenas vacías

#### Scenario: Una moneda que no es COP
- **WHEN** se registra una prefactura con moneda `USD`
- **THEN** el handler responde 400 explicando que sólo compara en COP, y no persiste el registro

#### Scenario: Dos personas del mismo proveedor
- **WHEN** se pide el período de un proveedor con dos personas externas
- **THEN** el handler devuelve dos prefacturas independientes, cada una con su propia imputación y su propio estado

### Requirement: Handler de mock para ausencias
El sistema SHALL exponer un handler de mock con `GET` listado de ausencias filtrado por mes (`month=YYYY-MM`, devuelve las ausencias cuyo rango toca ese mes junto con los días hábiles del mes pedido), `POST` alta (400 si el rango es inválido o se solapa con otra ausencia no rechazada de la misma persona), y `PUT` de estado a un sub-recurso (`Aprobada` sólo desde `Solicitada`; `Rechazada` sólo desde `Solicitada` y con motivo obligatorio; 400 en otro caso, 404 si no existe). Los cambios SHALL persistir en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio.

Cada ausencia SHALL llevar `id`, `personId`, `personName`, `providerName | null`, `type` (`Vacation | Leave | SickLeave`), `startDate`, `endDate`, `businessDays` (días hábiles L–V del rango completo), `status` (`Requested | Approved | Rejected`), `rejectReason | null`, y — calculados para el mes pedido — `businessDaysInMonth` y `squadImpacts` (`squadId`, `squadName`, `dedicationPct`, `fteImpact`). Los impactos SHALL derivarse de los datos de personas y asignaciones del propio mock (FTE disponible y dedicaciones vigentes), no de valores digitados, usando los mismos ids y nombres que esos handlers.

El handler SHALL exponer un snapshot de sólo lectura de las ausencias **aprobadas** de un período, con los días hábiles de cada una dentro de ese mes y los días hábiles del mes, para que el handler de facturación derive de ahí los descuentos sin duplicar la cuenta de días.

Los datos de ejemplo SHALL incluir ausencias de los tres tipos y los tres estados, de personas de terceros y de planta, y al menos una que cruza un fin de mes, con fechas relativas al mes corriente para que la pantalla abra con contenido. El cálculo SHALL repartir el impacto entre varias asignaciones en proporción a su dedicación cuando existan, aunque el mundo semilla de asignaciones tenga hoy una célula por persona — el reparto se cubre a nivel del cálculo, no de las semillas.

#### Scenario: Listar por mes
- **WHEN** se hace un `GET` con `month=2026-07`
- **THEN** responde las ausencias que tocan julio — incluidas las que empiezan en junio o terminan en agosto — con `businessDaysInMonth` y `squadImpacts` calculados sólo sobre los días hábiles de julio

#### Scenario: Alta con solape
- **WHEN** se hace un `POST` con un rango que se cruza con otra ausencia Solicitada o Aprobada de la misma persona
- **THEN** responde 400 con un problema que explica el conflicto y no crea nada

#### Scenario: Cambiar el estado
- **WHEN** se aprueba una Solicitada, o se rechaza una Solicitada con motivo
- **THEN** responde la ausencia actualizada; rechazar sin motivo o transicionar desde Aprobada/Rechazada responde 400, y un id inexistente 404

#### Scenario: Snapshot de aprobadas del período
- **WHEN** el handler de facturación pide las ausencias aprobadas de un mes
- **THEN** recibe sólo las aprobadas que tocan ese mes, con sus días hábiles dentro del mes y los días hábiles del mes, y las solicitadas y rechazadas quedan fuera

### Requirement: Handler de mock para iniciativas
El sistema SHALL exponer un handler de mock con `GET` listado paginado de iniciativas (acepta `search`, `status`, `squadId` y `talla` repetibles, aplicados antes de paginar), `GET` por id, `POST` alta, `PUT` edición, `PUT` de estado a un sub-recurso (`Active` sólo con talla; `Closed` sólo desde `Active`; 400 en otro caso), `GET` resumen (sin evaluar, activas por talla, FTE demandado de las activas), y `PUT` de evaluación a un sub-recurso que recibe respuestas de tamizaje, respuestas por pregunta y plazo, calcula con el modelo vigente y persiste respuestas y resultado (talla, puntaje, porcentaje, PM, FTE esperado/optimista/pesimista, por dimensión, mix), devolviendo la iniciativa actualizada; 404 si no existe, 400 si una respuesta referencia una pregunta que no está en el pool o un valor fuera de 0–4. Los cambios persisten en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Cada iniciativa SHALL llevar `id`, `name`, `squadId`, `squadName`, `productOwner`, `targetMonths`, `status`, `evaluation | null`. Los datos de ejemplo SHALL incluir iniciativas sin evaluar, en evaluación, activas con distintas tallas y cerradas, con los **mismos ids y nombres** que hoy usan el catálogo del backlog y las asignaciones.

El handler SHALL exponer un snapshot de sólo lectura de las iniciativas para que otros handlers (backlog, asignaciones) deriven sus catálogos de la misma fuente.

#### Scenario: Listar con filtro por talla
- **WHEN** se hace un `GET` con `talla=M&talla=L`
- **THEN** responde con el sobre paginado recortado sobre las iniciativas cuya evaluación guardada tiene esas tallas

#### Scenario: Crear y editar
- **WHEN** se hace un `POST` válido y luego un `PUT` que cambia el plazo de una iniciativa evaluada
- **THEN** la nueva queda en `Evaluating` sin evaluación, y la editada conserva su talla con el FTE recalculado para el nuevo plazo

#### Scenario: Cambios de estado
- **WHEN** se hace un `PUT` de estado `Active` sobre una iniciativa sin evaluación
- **THEN** responde 400; sobre una evaluada, pasa a `Active`; `Closed` sobre una `Evaluating` responde 400

#### Scenario: Guardar la evaluación
- **WHEN** se hace un `PUT` de evaluación con respuestas válidas y plazo 6
- **THEN** la iniciativa devuelta trae talla y resultado coherentes con `computeEvaluation` sobre el modelo vigente, y un `GET` posterior los refleja

#### Scenario: Catálogos derivados
- **WHEN** el backlog o las asignaciones piden sus catálogos de iniciativas
- **THEN** los ids y nombres coinciden con los del mock de iniciativas (incluidas las creadas en la sesión)

### Requirement: Handler de mock para el modelo de evaluación
El sistema SHALL exponer un `GET` del modelo de evaluación armado **en el momento de la petición** desde los mocks de Admin: pool de preguntas (id, dimensión, texto, peso) con el tipo de cada pregunta (Objetiva con su escala de rangos, o Evaluativa con la escala cualitativa) que el mock asigna por id; las siete dimensiones en orden; el tamizaje (seis preguntas con su marca de crítica); las bandas de talla vigentes (límites, PM mínimo y máximo, lectura, acción recomendada); y el mix de capacidades vigente. Un cambio guardado en Admin SHALL reflejarse en el siguiente `GET` del modelo.

#### Scenario: El modelo sigue a los parámetros
- **WHEN** Admin guarda un peso distinto para una pregunta o mueve un límite de banda
- **THEN** el siguiente `GET` del modelo trae el peso o el límite nuevo, y una evaluación guardada después usa esos valores

#### Scenario: Tipo y escala de cada pregunta
- **WHEN** se hace un `GET` del modelo
- **THEN** cada pregunta trae su tipo y las cinco etiquetas de su escala (rangos para las de cantidad, cualitativa para las demás), y toda pregunta del pool tiene uno

### Requirement: Handler de mock para el backlog
El sistema SHALL exponer un handler de mock del backlog con: un `GET` de la cola que devuelve las historias de usuario del chapter (número, título, descripción, tipo, puntos, estado en DevOps, tablero, sprint, Epic y su iniciativa mapeada si la hay, usuario DevOps asignado y el anterior si cambió, fecha de ingesta, estado de triage `Pending | Classified | Rejected`, clasificación con iniciativa o categoría, fecha de clasificación, motivo de rechazo) junto con un resumen (total, pendientes, clasificadas hoy, pendientes por célula, historias excluidas por usuarios DevOps sin persona) y que acepta filtros por célula, persona y estado; un `GET` de catálogos (iniciativas activas por célula, categorías BAU, motivos de rechazo); y cuatro `POST` por historia: clasificar (`kind` iniciativa | BAU | descartar con su iniciativa o categoría; 400 si falta lo que el tipo exige), saltar (la manda al final del orden), deshacer (vuelve a `Pending` sin clasificación; 409 si no estaba clasificada) y rechazar (`reason` obligatorio, `reassignToPersonId` y `detail` opcionales; 400 sin motivo). Todo SHALL persistir en memoria durante la sesión, disponible en Node y en navegador, con `reset`.

La persona y la célula de cada historia SHALL derivarse de las identidades DevOps del mock de detalle de persona y de los snapshots de personas y asignaciones: una historia cuyo usuario DevOps no está vinculado a ninguna persona NO SHALL entrar a la cola y SHALL contarse como excluida; vincular esa identidad en la misma sesión SHALL hacerla aparecer en el siguiente `GET`. Rechazar con `reassignToPersonId` SHALL crear la historia como pendiente a nombre de esa persona y dejar la original como rechazada y trazada.

#### Scenario: Cola con resumen
- **WHEN** se hace un `GET` de la cola sin filtros
- **THEN** responde con las historias pendientes ordenadas (cambio de asignado primero, luego por ingesta), el resumen coherente con ellas (pendientes por célula suman el total de pendientes) y la cuenta de excluidas por identidad

#### Scenario: Clasificar y avanzar
- **WHEN** se hace un `POST` de clasificar como iniciativa con un `initiativeId` válido
- **THEN** responde `200`, la historia pasa a `Classified` con esa iniciativa y fecha de hoy, y el siguiente `GET` la excluye de las pendientes y suma una a clasificadas hoy; clasificar como BAU sin categoría responde `400`

#### Scenario: Saltar, deshacer y rechazar
- **WHEN** se salta una historia, luego se deshace una clasificada y se rechaza otra con motivo y nueva persona
- **THEN** la saltada queda última en el orden; la deshecha vuelve a `Pending` sin clasificación; la rechazada queda `Rejected` con su motivo y aparece una historia nueva pendiente a nombre de la persona indicada; rechazar sin motivo responde `400` y deshacer una pendiente responde `409`

#### Scenario: Historias sin persona
- **WHEN** una historia está asignada a un usuario DevOps sin persona vinculada
- **THEN** no aparece en la cola y el resumen la cuenta como excluida; tras vincular esa identidad con el handler de detalle de persona, el siguiente `GET` la incluye

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
