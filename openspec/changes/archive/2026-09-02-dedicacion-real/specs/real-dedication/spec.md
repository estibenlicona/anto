## ADDED Requirements

### Requirement: Dedicación real de las capacidades
El sistema SHALL exponer la pantalla **Dedicación real** en `/app/lead/dedicacion`, con breadcrumb `Plataforma / Dedicación real` y la entrada "Dedicación" activa en la navegación: una fila por persona del chapter del Líder de Expertise, con lo que cada una hace en Azure DevOps frente a lo que tiene asignado. La franja del breadcrumb SHALL llevar la acción **Actualizar desde Azure DevOps** y, a su lado, cuándo fue la última actualización ("Actualizado hace 12 min" o "Sin actualizar").

Tres **indicadores** SHALL encabezar la pantalla: **Capacidades vinculadas** (cuántas tienen identidad DevOps sobre el total, y cuántas quedan sin vincular), **Por encima de lo asignado** (cuántas, en rol de advertencia cuando es mayor que cero) y **Por debajo de lo asignado** (cuántas: las que tienen margen para recibir más carga).

La **tabla** SHALL mostrar, por capacidad y para el sprint en curso, **todo en FTE**: la persona (avatar, nombre, cargo, enlace neutro a su dedicación real), la célula con su iniciativa activa, el sprint (nombre y fechas), la **dedicación** —una sola barra en la que el FTE comprometido (segmentado por etiqueta: iniciativa, BAU, sin etiqueta) se dibuja sobre la banda del FTE asignado, ambos sobre el FTE disponible de la persona, con las cifras "0.69 / 0.80 FTE" (comprometido / asignado) y, cuando hay puntos sin etiqueta, su FTE anotado en rol de advertencia—, el FTE dedicado a **Iniciativa** y a **BAU** (con los puntos de cada etiqueta como dato secundario) y, como última columna, la **lectura** reducida a **un solo icono**: flecha arriba en rol de advertencia (Por encima), flecha abajo en rol informativo (Por debajo), marca de verificación en rol de éxito (En línea), guion neutro (Sin célula) y el icono de DevOps en neutro apagado (Sin identidad); el icono SHALL tener nombre accesible y tooltip con la lectura y la diferencia en FTE ("Por encima · +0.27 FTE"), y la columna SHALL NOT llevar texto, marca de estado ni enlace. La tabla SHALL NOT tener una columna aparte de "asignado", ni de porcentajes, ni de actividad: lo asignado vive en la barra y la actividad se lee por capacidad. La tabla SHALL ordenarse por defecto con las capacidades que más se alejan de lo asignado primero (por encima y por debajo, según la magnitud de la diferencia), luego las en línea, y al final las sin célula y las sin identidad; SHALL buscarse por nombre o cargo y filtrarse por célula y por lectura con los mismos controles de filtro del listado de Personas; y SHALL paginarse como los demás listados.

Una capacidad **sin identidad DevOps** SHALL aparecer sin barra ni cifras y con el icono de "Sin identidad"; su nombre sigue llevando a su dedicación real, desde donde se vincula. Una capacidad **sin sprint en Azure DevOps** SHALL aparecer sin cifras y con el guion neutro y el tooltip "Sin sprint". Sin capacidades a cargo, la pantalla SHALL mostrar un estado vacío. Mientras carga SHALL mostrar el esqueleto de la tabla, sin desplazar los indicadores.

#### Scenario: Abrir la dedicación real
- **WHEN** el Líder de Expertise entra a Dedicación
- **THEN** ve los tres indicadores del sprint en curso, la tabla con una fila por persona de su chapter ordenada por distancia a lo asignado, la acción "Actualizar desde Azure DevOps" con la hora de la última actualización en la franja del breadcrumb, y la entrada "Dedicación" activa en la navegación

#### Scenario: Leer una fila en FTE
- **WHEN** una persona con 1.0 FTE disponible y 80 % de dedicación en su célula comprometió 18 puntos en el sprint en curso (14 de iniciativa, 3 de BAU, 1 sin etiqueta) con 26 puntos por FTE
- **THEN** su fila muestra la barra con el comprometido (0.69 FTE, segmentado) sobre la banda de lo asignado (0.80 FTE), las cifras "0.69 / 0.80 FTE", "0.04 sin etiqueta" en rol de advertencia, Iniciativa "0.54 FTE" con "14 pts", BAU "0.12 FTE" con "3 pts" y, en la última columna, sólo la flecha abajo en rol informativo cuyo tooltip dice "Por debajo · −0.11 FTE"

#### Scenario: Iconos de la lectura
- **WHEN** la tabla muestra capacidades por encima, en línea, sin célula y sin identidad
- **THEN** la última columna muestra respectivamente la flecha arriba en rol de advertencia, la marca de verificación en rol de éxito, el guion neutro y el icono de DevOps apagado, sin texto ni enlaces, cada uno con su nombre accesible

#### Scenario: Filtrar por lectura y por célula
- **WHEN** el Líder de Expertise filtra por la lectura "Por debajo" y por la célula Backend Platform
- **THEN** la tabla muestra sólo las capacidades de esa célula con esa lectura, desde la primera página, y los indicadores no cambian: describen el sprint, no el filtro

#### Scenario: Capacidad sin identidad
- **WHEN** una persona del chapter no tiene identidad DevOps vinculada
- **THEN** su fila muestra el icono de "Sin identidad", sin barra ni cifras, y cuenta en "sin vincular" del indicador de capacidades vinculadas

#### Scenario: Ir a la dedicación real de una capacidad
- **WHEN** el Líder de Expertise hace clic en el nombre de una persona
- **THEN** el sistema abre `/app/lead/dedicacion/<id>` con el sprint en curso elegido, sin recargar la aplicación, y la entrada "Dedicación" sigue activa

#### Scenario: Sin capacidades a cargo
- **WHEN** el chapter del Líder de Expertise no tiene personas
- **THEN** la pantalla muestra un estado vacío que lo dice y no muestra la tabla

### Requirement: Dedicación real de una capacidad por sprint
El sistema SHALL exponer la dedicación real de una capacidad en `/app/lead/dedicacion/:personId`, con breadcrumb `Plataforma / Dedicación real / <nombre de la persona>` y la entrada "Dedicación" activa. El **encabezado** SHALL mostrar el enlace de vuelta al listado, el avatar, el nombre, el cargo, la célula con su iniciativa activa y su talla, y el FTE asignado sobre el disponible ("0.80 / 1.0 FTE asignado"); y las acciones **Actualizar desde Azure DevOps** (secundaria), **Ver ficha** (neutra) y **Reasignar** (primaria, mismo drawer de reasignación de la Torre de control; *Asignar a una célula* cuando no tiene célula).

Un **selector de sprints** SHALL listar los sprints que Azure DevOps devuelve para esa capacidad (los últimos seis y el en curso), con el en curso elegido al abrir y marcado como tal; elegir otro SHALL cambiar todo lo que sigue a ese sprint sin recargar la aplicación.

Tres **indicadores** del sprint elegido SHALL ser: **Dedicación** (el FTE comprometido sobre el FTE asignado, "0.69 / 0.80 FTE", con los puntos que lo originan como dato secundario, la misma barra única del listado, la lectura como marca de estado y la diferencia en FTE: "−0.11 FTE"); **Iniciativa y BAU** (el FTE comprometido en iniciativa frente al FTE de Transformación de su asignación, y el FTE comprometido en BAU frente al FTE de BAU de su asignación, cada uno con su propia barra de la misma forma —comprometido sobre la banda de lo asignado— y sus cifras "0.54 / 0.50 FTE" y "0.12 / 0.30 FTE", más el FTE sin etiqueta anotado en advertencia); y **Actividad** (cuántos commits, releases y features creadas tiene en el sprint, el total y cuándo fue la última).

El panel **Dedicación por sprint** SHALL mostrar una fila por sprint listado, del más antiguo al en curso: el nombre del sprint, la misma barra única (comprometido segmentado por etiqueta sobre la banda de lo asignado, sobre el FTE disponible), las cifras en FTE y su lectura como marca de estado; el sprint elegido SHALL resaltarse y hacer clic en una fila SHALL elegir ese sprint.

El panel **Historias del sprint** SHALL listar las historias de usuario comprometidas por la persona en el sprint elegido: número, título, etiqueta (Iniciativa con el nombre de la iniciativa cuando el Epic está mapeado, BAU, o "Sin etiqueta" en rol de advertencia), tablero, puntos, estado en DevOps y enlace para abrirla en DevOps; ordenadas por puntos de mayor a menor; sin historias SHALL mostrar el estado vacío del sprint.

El panel **Mapa de actividad** SHALL mostrar, para el sprint elegido, una celda por día calendario desde el inicio hasta el fin del sprint, agrupadas por semana, con la intensidad según la **actividad** de ese día —commits en los repositorios, releases y features creadas por la persona en Azure DevOps— en cinco niveles (ninguna y cuatro escalones) y los fines de semana atenuados; cada celda SHALL tener un nombre accesible con la fecha y el detalle por tipo ("mié 19 ago · 3 commits · 1 release"); debajo, la leyenda de intensidad, los totales del sprint por tipo (commits, releases, features creadas), los días con actividad y la última actividad. Sin actividad SHALL mostrar las celdas vacías y "Sin actividad en este sprint".

Una capacidad **sin identidad DevOps** SHALL mostrar, en lugar de sprints e indicadores, un estado vacío con la acción de vincularla desde su ficha. Una capacidad **sin sprints** en Azure DevOps SHALL mostrar un estado vacío que lo diga con la acción de actualizar.

#### Scenario: Abrir la dedicación real de una capacidad
- **WHEN** el Líder de Expertise abre la dedicación real de una persona con identidad y célula
- **THEN** ve el encabezado con su célula, iniciativa activa y FTE asignado, el sprint en curso elegido en el selector, los tres indicadores de ese sprint, la dedicación sprint a sprint con el en curso resaltado, las historias del sprint y el mapa de actividad

#### Scenario: Cambiar de sprint
- **WHEN** el Líder de Expertise elige un sprint anterior en el selector o en una fila de Dedicación por sprint
- **THEN** los indicadores, las historias y el mapa de actividad pasan a ese sprint sin recargar la aplicación, y el selector y la fila lo marcan como elegido

#### Scenario: Iniciativa y BAU frente a la asignación
- **WHEN** una persona con 0.80 FTE asignado (Transformación 0.50, BAU 0.30) comprometió 14 puntos de iniciativa, 3 de BAU y 1 sin etiqueta en un sprint con 26 puntos por FTE
- **THEN** el indicador Iniciativa y BAU muestra "0.54 / 0.50 FTE" para iniciativa y "0.12 / 0.30 FTE" para BAU, cada uno con su barra del comprometido sobre la banda de lo asignado, y "0.04 FTE sin etiqueta" en rol de advertencia

#### Scenario: Historia sin etiqueta
- **WHEN** una historia comprometida del sprint no trae la etiqueta de iniciativa ni de BAU
- **THEN** cuenta en el FTE comprometido, aparece como "sin etiqueta" en los indicadores y en la lista de historias con esa marca en rol de advertencia

#### Scenario: Mapa de actividad de un sprint con actividad
- **WHEN** la persona hizo commits, publicó releases o creó features en varios días del sprint elegido
- **THEN** cada día muestra la intensidad de su actividad total, el nombre accesible de la celda detalla cuántos de cada tipo, los fines de semana se ven atenuados, y debajo aparecen los totales por tipo, los días con actividad y la última actividad

#### Scenario: Reasignar desde la dedicación real
- **WHEN** el Líder de Expertise usa "Reasignar" y confirma un plan válido
- **THEN** el sistema aplica el cambio con la misma semántica que la Torre de control y el FTE asignado del encabezado, de las barras y de los indicadores se actualiza sin recargar la aplicación

#### Scenario: Capacidad sin identidad en su dedicación real
- **WHEN** se abre la dedicación real de una persona sin identidad DevOps
- **THEN** la pantalla muestra el estado vacío "Sin identidad DevOps" con la acción de ir a su ficha a vincularla, y no muestra sprints ni indicadores

### Requirement: Lectura de dedicación real frente a la asignada
El sistema SHALL hablar en un solo lenguaje, **FTE**, para comparar la dedicación real con la asignada. Los **puntos por FTE por sprint** del Calendario de sprints (26 por defecto) SHALL ser la tasa de traducción: el **FTE comprometido** de una capacidad en un sprint es la suma de los puntos de las historias de usuario que comprometió en ese sprint dividida por esa tasa, con dos decimales. El **FTE asignado** SHALL ser la dedicación declarada en la asignación de la persona a su célula aplicada a su FTE disponible (el mismo "FTE asignado" que muestran la ficha de la persona y la Torre de control). La **diferencia** SHALL ser FTE comprometido menos FTE asignado.

La **lectura** SHALL ser: **En línea** cuando la diferencia está entre −0.10 y +0.10 FTE (rol de éxito); **Por debajo** cuando es menor que −0.10 (rol informativo: la capacidad tiene margen); **Por encima** cuando es mayor que +0.10 (rol de advertencia: hay que bajarle carga); **Sin célula** cuando la persona no tiene asignación (rol neutro: se muestra el FTE comprometido sin comparación); **Sin identidad** cuando no tiene identidad DevOps vinculada (rol neutro apagado en el listado, de peligro en la ficha); **Sin sprint** cuando Azure DevOps no devuelve sprints para ella (rol neutro).

El **FTE por etiqueta** SHALL ser los puntos de las historias con etiqueta *Iniciativa*, con etiqueta *BAU* y *sin etiqueta* divididos por la misma tasa; las tres partes suman el FTE comprometido y las tres cuentan en él. Como referencia, el FTE asignado SHALL repartirse en Transformación y BAU según la asignación (la iniciativa se compara con Transformación; el BAU, con BAU).

La **barra única** SHALL ser la misma en el listado, en la dedicación real de la capacidad, en su panel por sprint y en la ficha de la persona: la pista es el FTE disponible de la persona, la banda es el FTE asignado, el relleno segmentado por etiqueta es el FTE comprometido, y las cifras son "comprometido / asignado FTE"; cuando el comprometido supera el disponible, la barra SHALL marcar el exceso como lo hace la barra de capacidad del sistema de diseño. La tasa y los umbrales SHALL ser los mismos en todas las pantallas.

#### Scenario: Por debajo de lo asignado
- **WHEN** una persona con 1.0 FTE disponible y 80 % de dedicación asignada comprometió 18 puntos en un sprint con 26 puntos por FTE
- **THEN** su FTE comprometido es 0.69, su FTE asignado 0.80, la diferencia −0.11 FTE y la lectura "Por debajo", en todas las pantallas por igual

#### Scenario: En línea y por encima
- **WHEN** una persona con 0.80 FTE asignado comprometió 22 puntos, y otra con 0.50 FTE asignado comprometió 20
- **THEN** la primera lee 0.85 FTE y "En línea" (+0.05), y la segunda 0.77 FTE y "Por encima" (+0.27)

#### Scenario: FTE por etiqueta
- **WHEN** de los 18 puntos comprometidos, 14 son de iniciativa, 3 de BAU y 1 sin etiqueta
- **THEN** el FTE en iniciativa es 0.54, en BAU 0.12 y sin etiqueta 0.04, y suman los 0.69 FTE comprometidos

#### Scenario: Sin célula
- **WHEN** una persona con identidad DevOps no tiene asignación a ninguna célula
- **THEN** se muestra su FTE comprometido y su FTE en iniciativa y BAU, la lectura es "Sin célula" y la barra no tiene banda de lo asignado ni diferencia

#### Scenario: Cambia la tasa de puntos por FTE
- **WHEN** el Administrador cambia los puntos por FTE por sprint de 26 a 30
- **THEN** los FTE comprometidos y las lecturas se recalculan con 30 en todas las pantallas sin que cambien los puntos de las historias

### Requirement: Sincronización con Azure DevOps
El sistema SHALL permitir **actualizar desde Azure DevOps** la dedicación real de todas las capacidades a cargo (desde el listado) o de una sola (desde su dedicación real), consultando sprints, historias comprometidas con sus puntos y etiquetas, y la **actividad** —commits en los repositorios, releases y features creadas por la persona—, a partir del **identificador del usuario de Azure DevOps** que dejó la vinculación de la identidad. Mientras actualiza, la acción SHALL indicarlo y deshabilitarse; al terminar, los datos y la hora de la última actualización SHALL refrescarse sin recargar la aplicación. Si la actualización falla, el sistema SHALL mostrar el error y conservar los datos anteriores con su hora. Las capacidades sin identidad SHALL quedar fuera de la actualización y contarse como sin vincular. La actualización SHALL NOT modificar nada en Azure DevOps.

#### Scenario: Actualizar todas las capacidades
- **WHEN** el Líder de Expertise usa "Actualizar desde Azure DevOps" en el listado
- **THEN** la acción muestra que está actualizando, al terminar la tabla y los indicadores reflejan lo que devolvió DevOps y la franja muestra "Actualizado hace un momento"

#### Scenario: Actualizar una capacidad
- **WHEN** el Líder de Expertise usa "Actualizar desde Azure DevOps" en la dedicación real de una persona
- **THEN** sólo esa capacidad se consulta y sus sprints, historias, actividad e indicadores se refrescan

#### Scenario: Falla la actualización
- **WHEN** Azure DevOps no responde o responde con error
- **THEN** el sistema muestra el error en rol de peligro, deja los datos y la hora anteriores, y permite reintentar
