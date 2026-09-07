## ADDED Requirements

### Requirement: Capacidad del sprint en FTE
El sistema SHALL usar el **FTE únicamente como capacidad** y SHALL NOT traducir puntos de historia a FTE en ninguna pantalla ni en ningún cálculo. Cada colaborador SHALL tener, para cada sprint, un **FTE contractual** (su dedicación declarada de contrato, 1.0 para jornada completa) y un **FTE disponible**, la fracción de ese contrato que efectivamente tuvo disponible en el sprint.

El **FTE disponible** SHALL derivarse de los días del sprint: `FTE disponible = FTE contractual × (días laborales del sprint − festivos − días de vacaciones − días de ausencia aprobada − otras indisponibilidades conocidas) / días laborales del sprint`, redondeado a dos decimales y nunca negativo. Los días laborales SHALL ser de lunes a viernes dentro de las fechas del sprint; las vacaciones y ausencias SHALL ser las **aprobadas** que intersectan el sprint, contadas en días hábiles y admitiendo medias jornadas; los festivos y las otras indisponibilidades SHALL llegar con el dato del sprint. El sistema SHALL mostrar siempre el **desglose** que produjo el FTE disponible (días laborales y cuántos días descuenta cada concepto), de modo que el número nunca sea opaco.

El sistema SHALL NOT usar el FTE declarado en la asignación a la célula como referencia para evaluar la carga: ese dato es un reporte de la célula, no una medición. SHALL seguir mostrándolo como contexto de la asignación, rotulado como tal.

#### Scenario: FTE disponible de un sprint con ausencias
- **WHEN** un colaborador con FTE contractual 1.0 tiene un sprint de dos semanas con 10 días laborales, 1 festivo y 1 día de ausencia aprobada
- **THEN** su FTE disponible es 0.80 y el desglose muestra "10 días laborales · −1 festivo · −1 ausencia"

#### Scenario: Media jornada de ausencia
- **WHEN** de los días de ausencia aprobada del sprint uno es de media jornada
- **THEN** ese día descuenta 0.5 días y el FTE disponible lo refleja con dos decimales

#### Scenario: Colaborador a tiempo parcial
- **WHEN** un colaborador tiene FTE contractual 0.5 y no tiene ausencias ni festivos en el sprint
- **THEN** su FTE disponible es 0.50 y la capacidad se lee "0.50 / 0.50 FTE", no "0.50 / 1.0"

#### Scenario: El FTE asignado no evalúa
- **WHEN** la célula declara 0.80 de dedicación para un colaborador cuyo comportamiento observable dice otra cosa
- **THEN** ese 0.80 aparece como dato de la asignación pero no participa en ninguna evidencia ni en la señal de balance

### Requirement: Referencia histórica del colaborador y de la célula
El sistema SHALL usar como referencia principal de demanda el **histórico del propio colaborador**: la **mediana** de SP comprometidos en sus últimos sprints **cerrados y sellados**, dentro de la ventana de histórico del Calendario de sprints (6 por defecto). SHALL exponer junto a ella el **histórico de la célula**: la mediana de SP comprometidos por colaborador de esa célula en la misma ventana. Ambas SHALL calcularse sólo sobre sprints con snapshot sellado; los sprints sin snapshot SHALL NOT alimentar el histórico.

El sistema SHALL mostrar la referencia como un bloque de **tres cifras comparables** —histórico del colaborador, histórico de la célula y sprint actual—, de modo que se distingan a simple vista los casos de un colaborador bajo en una célula normal (colaborador 9 SP, célula 22 SP) de un colaborador bajo en una célula igualmente baja (colaborador 9 SP, célula 9 SP). SHALL NOT usar el histórico de la célula como referencia única ni como sustituto del histórico del colaborador.

El sistema SHALL considerar el histórico **suficiente** cuando el colaborador tiene al menos el mínimo de sprints sellados del Calendario de sprints (3 por defecto); por debajo de ese mínimo la referencia SHALL mostrarse como no disponible con cuántos sprints hay, y la señal de balance SHALL ser **No evaluable**.

El sistema SHALL calcular también la **desviación**: la diferencia del sprint actual frente al histórico del colaborador, en SP y en porcentaje relativo, y la desviación equivalente de la célula frente a su propio histórico.

#### Scenario: Referencia de tres cifras
- **WHEN** un colaborador con mediana histórica de 22 SP, en una célula con mediana histórica de 21 SP, comprometió 28 SP en el sprint actual
- **THEN** la referencia muestra "Histórico colaborador 22 SP", "Histórico célula 21 SP" y "Sprint actual 28 SP", con la desviación "+6 SP · +27 %" frente a su propio histórico

#### Scenario: Colaborador bajo en célula normal
- **WHEN** un colaborador comprometió 9 SP con mediana histórica propia de 20 SP en una célula con mediana histórica de 22 SP
- **THEN** la referencia muestra la desviación propia (−11 SP · −55 %) y la de la célula cerca de cero, y el bloque deja ver que la desviación es del colaborador, no de la célula

#### Scenario: Colaborador bajo en célula baja
- **WHEN** un colaborador comprometió 9 SP y su célula entera está en torno a 9 SP frente a su histórico de 22
- **THEN** la referencia muestra que colaborador y célula se desvían en la misma dirección y magnitud, y el dashboard lo señala como comportamiento de la célula

#### Scenario: Histórico insuficiente
- **WHEN** un colaborador tiene sólo 2 sprints sellados y el mínimo configurado es 3
- **THEN** la referencia dice que el histórico es insuficiente indicando cuántos sprints hay, y la señal de balance es "No evaluable"

#### Scenario: Un sprint sin snapshot no entra al histórico
- **WHEN** uno de los sprints cerrados de la ventana no tiene snapshot sellado
- **THEN** ese sprint no participa en la mediana, se marca como sin snapshot en la tendencia, y la ventana efectiva se reporta con los sprints que sí entraron

### Requirement: Métricas de ejecución y snapshot de cierre de sprint
El sistema SHALL exponer, por colaborador y por sprint, las **métricas de ejecución**: **SP comprometidos**, **SP completados**, **SP no completados** (comprometidos menos completados), **% de cumplimiento** (completados sobre comprometidos, con un decimal) y **carry-over** en SP y en porcentaje (los SP no completados que pasan al sprint siguiente). El **carry-over** SHALL presentarse como indicador **secundario**, explicativo de la señal, y SHALL NOT ser por sí solo el indicador principal de asignación.

Las métricas de ejecución de un sprint cerrado SHALL provenir de un **snapshot sellado al cierre del sprint**, tomado antes de que los equipos limpien o cierren las HUs, porque después de esa limpieza los estados en Azure DevOps ya no reflejan lo que ocurrió. Cada sprint SHALL declarar la **procedencia** de sus métricas:

- **Sellado** — snapshot tomado al cierre, con la fecha y hora en que se selló. Es el único que alimenta el histórico y la tendencia.
- **Provisional** — el sprint está en curso o aún no se ha sellado: las cifras se calculan en vivo desde Azure DevOps y pueden cambiar.
- **Sin snapshot** — el sprint cerró sin que se sellara snapshot: las cifras que muestre Azure DevOps hoy no son confiables.

El sistema SHALL rotular la procedencia en toda superficie que muestre cumplimiento o carry-over, con el rol de color correspondiente (sellado en neutro con su fecha, provisional en informativo, ausente en advertencia), y SHALL NOT presentar como medida una cifra de un sprint sin snapshot.

El **momento del sellado** SHALL derivarse de la fecha de fin del sprint y la **hora de cierre del sprint** del Calendario de sprints; sellar el snapshot es responsabilidad del backend, y el sistema SHALL mostrar cuándo se selló cada uno.

El sistema SHALL exponer la **tendencia** del colaborador: por cada sprint de la ventana de histórico, sus SP comprometidos, sus SP completados, su % de cumplimiento y su carry-over %, del más antiguo al más reciente, para que la lectura sea de trayectoria y no de un sprint aislado.

#### Scenario: Ejecución de un sprint cerrado
- **WHEN** un colaborador comprometió 28 SP y completó 22 en un sprint con snapshot sellado
- **THEN** la ejecución muestra 28 comprometidos, 22 completados, 6 no completados, 78.6 % de cumplimiento y 6 SP de carry-over, con la marca "Sellado" y la fecha del snapshot

#### Scenario: Carry-over en porcentaje
- **WHEN** un colaborador comprometió 30 SP y completó 22
- **THEN** el carry-over es "8 SP · 26.7 %" y se presenta como indicador secundario, dentro de la explicación de la señal y no como el veredicto

#### Scenario: Sprint en curso
- **WHEN** se consulta el sprint en curso
- **THEN** las métricas de ejecución se muestran con la marca "Provisional" y la advertencia de que pueden cambiar hasta el cierre, y ese sprint no entra en el histórico

#### Scenario: Sprint cerrado sin snapshot
- **WHEN** un sprint ya cerrado no tiene snapshot sellado
- **THEN** el sistema muestra "Sin snapshot" en rol de advertencia en lugar de cifras de cumplimiento y carry-over, no lo cuenta en el histórico ni en la tendencia, y explica que el dato de DevOps ya no es confiable tras la limpieza

#### Scenario: Tendencia de cumplimiento
- **WHEN** los últimos cinco sprints sellados del colaborador cumplieron 94 %, 91 %, 88 %, 79 % y 76 %
- **THEN** la tendencia los muestra en ese orden con su dirección, y la lectura de la caída sostenida está disponible como evidencia de la señal

### Requirement: Trabajo no planificado y multitarea
El sistema SHALL exponer, por colaborador y por sprint, el **trabajo no planificado**: los **SP comprometidos al inicio** del sprint, los **SP agregados durante** el sprint (historias que entraron al sprint después de su fecha de inicio) y el **total trabajado** (la suma). SHALL mostrar los tres juntos siempre que muestre el cumplimiento, para que un cumplimiento bajo se lea contra el trabajo que realmente entró, y SHALL calcular la **proporción de trabajo no planificado** (agregado sobre comprometido al inicio).

El sistema SHALL exponer la **multitarea** del colaborador en el sprint: las **HUs simultáneas** —cuántas historias estuvieron a la vez en un estado activo en Azure DevOps, con el máximo del sprint como **WIP**— y las **iniciativas simultáneas** —cuántas épicas distintas tocan sus historias del sprint—. Cada iniciativa simultánea SHALL mostrarse con el nombre de la iniciativa cuando la épica está mapeada a una y con el título de la épica cuando no lo está, indicando cuántos SP aporta cada una.

El sistema SHALL tratar la multitarea como **contexto de carga**: 28 SP en una sola iniciativa y 28 SP repartidos en cuatro no describen la misma situación, y la segunda tiene mayor riesgo de fragmentación de atención. SHALL NOT convertir por sí sola la multitarea en un veredicto.

#### Scenario: Trabajo no planificado en el sprint
- **WHEN** un colaborador se comprometió a 22 SP al inicio, recibió 8 SP más durante el sprint y completó 20
- **THEN** el panel muestra "Comprometido al inicio 22 SP", "Trabajo agregado 8 SP" y "Total trabajado 30 SP", con la proporción de no planificado en 36.4 %, junto al cumplimiento

#### Scenario: Iniciativas simultáneas por épica
- **WHEN** las historias del sprint de un colaborador pertenecen a cuatro épicas distintas, dos de ellas mapeadas a iniciativas
- **THEN** la multitarea indica 4 iniciativas simultáneas, nombrando las dos iniciativas mapeadas y las dos épicas sin mapear, con los SP que aporta cada una

#### Scenario: Foco en una sola iniciativa
- **WHEN** los 28 SP del sprint pertenecen a una sola épica
- **THEN** la multitarea indica 1 iniciativa simultánea y no aporta evidencia de sobreasignación

#### Scenario: WIP del sprint
- **WHEN** en algún momento del sprint el colaborador tuvo cinco historias a la vez en estado activo
- **THEN** el WIP del sprint es 5 y se muestra junto a las HUs comprometidas del sprint

### Requirement: Señal de balance de capacidad
El sistema SHALL terminar el análisis de cada colaborador en una **señal**, no en una sentencia. La señal SHALL tener cinco valores:

- **Balanceado** (rol de éxito) — los indicadores están dentro del comportamiento esperado.
- **Revisar** (rol de advertencia) — existe una desviación que merece contexto.
- **Posible sobreasignación** (rol de peligro) — varias señales apuntan consistentemente a una carga superior a la habitual.
- **Posible subasignación** (rol informativo) — la demanda observable está significativamente por debajo de la capacidad y del comportamiento habitual.
- **No evaluable** (rol neutro) — falta el dato mínimo: sin identidad DevOps, sin sprint en Azure DevOps, o histórico insuficiente. SHALL indicar cuál de los tres motivos aplica.

La señal SHALL sintetizarse de **evidencias** concurrentes, cada una con una dirección (*sobre*, *sub* o *neutra*) y su cifra:

1. **Demanda frente al histórico del colaborador** — SP comprometidos contra su mediana histórica.
2. **Demanda por FTE disponible** — SP comprometidos por FTE disponible contra la misma razón en su histórico, que separa el efecto de las ausencias del efecto de la carga.
3. **Cumplimiento** — % de cumplimiento del sprint contra su cumplimiento histórico.
4. **Carry-over** — carry-over % del sprint contra su carry-over histórico.
5. **Trabajo no planificado** — proporción de SP agregados durante el sprint.
6. **Multitarea** — iniciativas simultáneas y WIP.

**Ningún indicador individual SHALL determinar automáticamente la categoría.** El sistema SHALL exigir **evidencias concurrentes en la misma dirección**: con ninguna o una sola evidencia la señal SHALL ser **Balanceado** —salvo que esa única evidencia sea de intensidad fuerte, en cuyo caso SHALL ser **Revisar**—; con dos evidencias concordantes SHALL ser **Revisar**; con tres o más concordantes SHALL ser **Posible sobreasignación** o **Posible subasignación** según la dirección. Cuando hay evidencias en ambas direcciones, la señal SHALL NOT alcanzar los estados fuertes y SHALL quedar, a lo sumo, en **Revisar**.

El sistema SHALL aplicar el **modificador de célula**: cuando la desviación del colaborador va en la misma dirección y magnitud comparable que la de su célula frente al histórico de la célula, SHALL descontar una evidencia del conteo y SHALL declararlo explícitamente ("la célula se comporta igual"), para no atribuir a la persona un comportamiento que es del equipo.

El sistema SHALL exponer siempre **por qué** salió esa señal: la lista de evidencias evaluadas con su dirección, su cifra y su umbral, incluidas las neutras y las que no se pudieron evaluar, y el modificador de célula cuando se aplicó. La señal SHALL NOT presentarse nunca sin acceso a esa explicación.

Los **umbrales** SHALL ser los mismos en todas las pantallas y SHALL provenir de una única definición compartida por el listado, el dashboard del colaborador, la ficha de la persona y el badge de navegación.

#### Scenario: Balanceado
- **WHEN** un colaborador comprometió 23 SP contra una mediana de 22, con cumplimiento y carry-over en línea con su histórico, sin trabajo agregado relevante y con una sola iniciativa
- **THEN** la señal es "Balanceado" y la explicación lista las seis evidencias en dirección neutra

#### Scenario: Una sola evidencia no basta
- **WHEN** la única desviación de un colaborador es un carry-over del sprint por encima de su histórico, y todo lo demás está en línea
- **THEN** la señal es "Balanceado" y la explicación deja ver la evidencia aislada del carry-over; la señal SHALL NOT ser de sobreasignación

#### Scenario: Dos evidencias concordantes
- **WHEN** un colaborador comprometió 28 SP contra su histórico de 22 y su cumplimiento cayó respecto al histórico, sin más desviaciones
- **THEN** la señal es "Revisar" con la frase de que existe una desviación que merece contexto y las dos evidencias listadas

#### Scenario: Posible sobreasignación
- **WHEN** un colaborador comprometió 28 SP contra 22 habituales, su demanda por FTE disponible también subió, su carry-over supera el histórico y recibió trabajo no planificado
- **THEN** la señal es "Posible sobreasignación" y la explicación lista las cuatro evidencias en dirección de sobrecarga

#### Scenario: Posible subasignación
- **WHEN** un colaborador comprometió 9 SP contra 22 habituales, con demanda por FTE disponible también muy por debajo, cumplimiento del 100 % y una sola iniciativa
- **THEN** la señal es "Posible subasignación" y la explicación indica que la demanda observable está por debajo de su capacidad y su comportamiento habitual

#### Scenario: La célula se comporta igual
- **WHEN** un colaborador comprometió 9 SP contra su histórico de 22, y su célula entera está igualmente por debajo de su propio histórico
- **THEN** se descuenta una evidencia, la señal no llega a "Posible subasignación" y la explicación dice que la célula se comporta igual

#### Scenario: Evidencias en direcciones opuestas
- **WHEN** un colaborador tiene la demanda muy por encima de su histórico pero un cumplimiento y un carry-over mejores que los habituales
- **THEN** la señal no supera "Revisar" y la explicación muestra las evidencias en ambas direcciones

#### Scenario: No evaluable
- **WHEN** un colaborador no tiene identidad DevOps vinculada, o Azure DevOps no devuelve sprints para él, o tiene menos sprints sellados que el mínimo configurado
- **THEN** la señal es "No evaluable" indicando cuál de los tres motivos aplica, sin cifras inventadas y con la acción que corresponde (vincular identidad o actualizar desde DevOps)

### Requirement: Balance de carga de los colaboradores
El sistema SHALL exponer la pantalla **Dedicación real** en `/app/lead/dedicacion`, con breadcrumb `Plataforma / Dedicación real` y la entrada "Dedicación" activa en la navegación: una fila por **colaborador** del chapter del Líder de Expertise —desarrolladores, ingenieros de calidad y cualquier otro perfil a su cargo— con la señal de balance de su sprint en curso. La franja del breadcrumb SHALL llevar la acción **Actualizar desde Azure DevOps** y, a su lado, cuándo fue la última actualización ("Actualizado hace 12 min" o "Sin actualizar").

Cuatro **indicadores** SHALL encabezar la pantalla, uno por señal accionable: **Posible sobreasignación** (rol de peligro), **Posible subasignación** (rol informativo), **A revisar** (rol de advertencia) y **No evaluables** (rol neutro, con cuántos son por falta de identidad, por falta de sprint y por histórico insuficiente). Cada indicador SHALL nombrar a los colaboradores que cuenta cuando son pocos.

La **tabla** SHALL mostrar, por colaborador y para su sprint en curso: el colaborador (avatar, nombre, cargo, enlace neutro a su dashboard), la célula con su iniciativa activa, el sprint (nombre, fechas y procedencia de su snapshot), la **capacidad** (FTE disponible sobre contractual, "0.80 / 1.0 FTE", con el desglose en tooltip), la **demanda** (SP comprometidos con su referencia inmediata debajo, "28 SP · habitual 22"), la **multitarea** (iniciativas simultáneas y WIP) y, como última columna, la **señal de balance** reducida a **un solo icono** con nombre accesible y tooltip que lleva la señal y la evidencia principal ("Posible sobreasignación · 4 señales concurrentes"). La columna de señal SHALL NOT llevar texto, marca de estado ni enlace.

La tabla SHALL NOT tener columnas de FTE comprometido, de FTE asignado, de porcentajes de dedicación ni de actividad: el FTE es capacidad, la demanda se dice en SP, y la actividad se lee en el dashboard del colaborador. SHALL ordenarse por defecto poniendo primero las señales que piden acción —sobreasignación, subasignación, revisar—, luego balanceado y al final las no evaluables; SHALL buscarse por nombre o cargo y filtrarse por célula y por **señal** con los mismos controles de filtro del listado de Personas; y SHALL paginarse como los demás listados.

Un colaborador **sin identidad DevOps**, **sin sprint** o con **histórico insuficiente** SHALL aparecer con el icono de "No evaluable" y sin cifras de demanda ni de señal, con el motivo en el tooltip; su nombre sigue llevando a su dashboard. Sin colaboradores a cargo, la pantalla SHALL mostrar un estado vacío. Mientras carga SHALL mostrar el esqueleto de la tabla, sin desplazar los indicadores.

#### Scenario: Abrir el balance de carga
- **WHEN** el Líder de Expertise entra a Dedicación
- **THEN** ve los cuatro indicadores por señal del sprint en curso, la tabla con una fila por colaborador de su chapter ordenada por señal accionable, la acción "Actualizar desde Azure DevOps" con la hora de la última actualización en la franja del breadcrumb, y la entrada "Dedicación" activa

#### Scenario: Leer una fila
- **WHEN** un colaborador con FTE contractual 1.0 y 0.80 disponible comprometió 28 SP contra un histórico de 22, en 3 iniciativas
- **THEN** su fila muestra "0.80 / 1.0 FTE", "28 SP · habitual 22", "3 iniciativas" y el icono de su señal, cuyo tooltip da la señal y cuántas evidencias concurrentes la sostienen

#### Scenario: Ordenar por señal accionable
- **WHEN** el chapter tiene colaboradores con las cinco señales
- **THEN** la tabla muestra primero los de posible sobreasignación y subasignación, luego los de revisar, luego los balanceados y al final los no evaluables

#### Scenario: Filtrar por señal y por célula
- **WHEN** el Líder de Expertise filtra por la señal "Posible subasignación" y por la célula Backend Platform
- **THEN** la tabla muestra sólo los colaboradores de esa célula con esa señal, desde la primera página, y los indicadores no cambian: describen el sprint, no el filtro

#### Scenario: Colaborador no evaluable
- **WHEN** un colaborador del chapter no tiene identidad DevOps vinculada
- **THEN** su fila muestra el icono de "No evaluable" sin cifras, el tooltip dice que falta la identidad, y cuenta en el indicador de no evaluables por ese motivo

#### Scenario: Ir al dashboard de un colaborador
- **WHEN** el Líder de Expertise hace clic en el nombre de un colaborador
- **THEN** el sistema abre `/app/lead/dedicacion/<id>` con el sprint en curso elegido, sin recargar la aplicación, y la entrada "Dedicación" sigue activa

#### Scenario: Sin colaboradores a cargo
- **WHEN** el chapter del Líder de Expertise no tiene personas
- **THEN** la pantalla muestra un estado vacío que lo dice y no muestra la tabla

### Requirement: Dashboard de balance de un colaborador
El sistema SHALL exponer el dashboard de balance de un colaborador en `/app/lead/dedicacion/:personId`, con breadcrumb `Plataforma / Dedicación real / <nombre del colaborador>` y la entrada "Dedicación" activa. El **encabezado** SHALL mostrar el enlace de vuelta al listado, el avatar, el nombre, el cargo, la célula con su iniciativa activa y su talla, el FTE declarado en su asignación rotulado como dato que la célula reporta, y las acciones **Actualizar desde Azure DevOps** (secundaria), **Ver ficha** (neutra) y **Reasignar** (primaria, mismo drawer de reasignación de la Torre de control; *Asignar a una célula* cuando no tiene célula).

Un **selector de sprints** SHALL listar los sprints que Azure DevOps devuelve para ese colaborador (los de la ventana de histórico y el en curso), con el en curso elegido al abrir y marcado como tal, y cada uno marcado con la procedencia de su snapshot; elegir otro SHALL cambiar todo lo que sigue a ese sprint sin recargar la aplicación.

El dashboard SHALL organizarse en **tres niveles de lectura**, en este orden.

**Nivel 1 — la cabecera.** Cuatro tarjetas: **Capacidad** (el FTE disponible sobre el contractual con su desglose de días), **Demanda** (los SP comprometidos del sprint), **Referencia** (la mediana histórica del colaborador) y **Balance** (la señal con su frase). Debajo, una **línea de resumen** con lo esencial en lenguaje natural: los SP comprometidos frente a los habituales, las iniciativas activas y el carry-over histórico ("28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18 % carry-over histórico").

**Nivel 2 — la explicación.** El panel **Por qué esta señal** SHALL listar las evidencias evaluadas con su dirección, su cifra y su umbral, incluidas las neutras y las no evaluables, y el modificador de célula cuando se aplicó. Los paneles **Referencia** (las tres cifras comparables: histórico del colaborador, histórico de la célula y sprint actual, con las desviaciones), **Ejecución** (SP comprometidos, completados, no completados, % de cumplimiento y carry-over, con la procedencia del snapshot), **Trabajo no planificado** (comprometido al inicio, agregado, total trabajado y la proporción) y **Multitarea** (iniciativas simultáneas con sus nombres y SP, HUs comprometidas y WIP) SHALL desarrollar cada evidencia.

**Nivel 3 — el análisis.** El panel **Tendencia** SHALL mostrar, por cada sprint de la ventana, los SP comprometidos y completados, el % de cumplimiento y el carry-over %, del más antiguo al más reciente, con los sprints sin snapshot marcados y excluidos del cálculo; SHALL dejar leer la trayectoria (una caída sostenida de cumplimiento, un carry-over que crece) por encima del valor de un sprint aislado.

Se SHALL conservar, para el sprint elegido, el panel **Historias del sprint** —número, título, etiqueta con la iniciativa mapeada cuando la hay, épica, tablero, puntos, estado en DevOps, si entró después del inicio del sprint, y enlace para abrirla en DevOps, ordenadas por puntos— y el panel **Mapa de actividad** —una celda por día calendario del sprint agrupadas por semana, con la intensidad de commits, releases y features creadas, los fines de semana atenuados, el nombre accesible con el detalle por tipo, su leyenda, sus totales por tipo, los días con actividad y la última actividad—.

Un colaborador **sin identidad DevOps** SHALL mostrar, en lugar del dashboard, un estado vacío con la acción de vincularla desde su ficha. Un colaborador **sin sprints** SHALL mostrar un estado vacío que lo diga con la acción de actualizar. Un colaborador con **histórico insuficiente** SHALL mostrar el sprint elegido con sus cifras y, en lugar de la referencia y la señal, el aviso de cuántos sprints sellados hay y cuántos faltan.

#### Scenario: Abrir el dashboard de un colaborador
- **WHEN** el Líder de Expertise abre el dashboard de un colaborador con identidad, célula e histórico suficiente
- **THEN** ve el encabezado, el sprint en curso elegido, las cuatro tarjetas Capacidad / Demanda / Referencia / Balance con la línea de resumen debajo, luego los paneles de explicación y al final la tendencia, las historias y el mapa de actividad

#### Scenario: Cabecera de cuatro tarjetas
- **WHEN** un colaborador con FTE disponible 0.80, 28 SP comprometidos, mediana histórica de 22 SP y señal de revisión abre su dashboard
- **THEN** las tarjetas muestran "0.80 / 1.0 FTE", "28 SP", "22 SP" y la señal con su frase, y la línea de resumen dice "28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18 % carry-over histórico"

#### Scenario: Por qué esta señal
- **WHEN** la señal del sprint elegido es "Posible sobreasignación"
- **THEN** el panel lista las evidencias que la sostienen con su cifra y su umbral, las que quedaron neutras, las que no se pudieron evaluar y, si aplicó, el descuento por comportamiento de la célula

#### Scenario: Cambiar de sprint
- **WHEN** el Líder de Expertise elige un sprint anterior en el selector
- **THEN** la cabecera, las evidencias, la ejecución, el trabajo no planificado, la multitarea, las historias y el mapa de actividad pasan a ese sprint sin recargar la aplicación, y la tendencia no cambia

#### Scenario: Sprint sin snapshot en el dashboard
- **WHEN** el sprint elegido cerró sin snapshot sellado
- **THEN** la ejecución muestra "Sin snapshot" en rol de advertencia en lugar del cumplimiento y el carry-over, la señal de ese sprint es "No evaluable" por ese motivo, y la tendencia marca ese punto como faltante

#### Scenario: Mapa de actividad de un sprint con actividad
- **WHEN** el colaborador hizo commits, publicó releases o creó features en varios días del sprint elegido
- **THEN** cada día muestra la intensidad de su actividad total, el nombre accesible de la celda detalla cuántos de cada tipo, los fines de semana se ven atenuados, y debajo aparecen los totales por tipo, los días con actividad y la última actividad

#### Scenario: Reasignar desde el dashboard
- **WHEN** el Líder de Expertise usa "Reasignar" y confirma un plan válido
- **THEN** el sistema aplica el cambio con la misma semántica que la Torre de control y el dato de asignación del encabezado se actualiza sin recargar la aplicación; la señal de balance no cambia por ello, porque no depende del FTE asignado

#### Scenario: Colaborador sin identidad en su dashboard
- **WHEN** se abre el dashboard de un colaborador sin identidad DevOps
- **THEN** la pantalla muestra el estado vacío "Sin identidad DevOps" con la acción de ir a su ficha a vincularla, y no muestra sprints ni tarjetas

#### Scenario: Colaborador con histórico insuficiente
- **WHEN** se abre el dashboard de un colaborador con 2 sprints sellados y un mínimo de 3
- **THEN** las tarjetas de Capacidad y Demanda muestran sus cifras, las de Referencia y Balance dicen que faltan sprints indicando cuántos hay, y los paneles de explicación muestran lo que sí se puede medir del sprint elegido

## MODIFIED Requirements

### Requirement: Sincronización con Azure DevOps
El sistema SHALL permitir **actualizar desde Azure DevOps** el balance de todos los colaboradores a cargo (desde el listado) o de uno solo (desde su dashboard), consultando sprints, historias comprometidas con sus puntos, épicas, estados y fecha de entrada al sprint, y la **actividad** —commits en los repositorios, releases y features creadas por la persona—, a partir del **identificador del usuario de Azure DevOps** que dejó la vinculación de la identidad. La actualización SHALL recalcular las métricas **provisionales** del sprint en curso y SHALL NOT alterar ningún snapshot ya **sellado**: un snapshot sellado es el registro de lo que ocurrió al cierre y no se reescribe.

Mientras actualiza, la acción SHALL indicarlo y deshabilitarse; al terminar, los datos y la hora de la última actualización SHALL refrescarse sin recargar la aplicación. Si la actualización falla, el sistema SHALL mostrar el error y conservar los datos anteriores con su hora. Los colaboradores sin identidad SHALL quedar fuera de la actualización y contarse como no evaluables por ese motivo. La actualización SHALL NOT modificar nada en Azure DevOps.

#### Scenario: Actualizar todas las capacidades
- **WHEN** el Líder de Expertise usa "Actualizar desde Azure DevOps" en el listado
- **THEN** la acción muestra que está actualizando, al terminar la tabla y los indicadores por señal reflejan lo que devolvió DevOps y la franja muestra "Actualizado hace un momento"

#### Scenario: Actualizar una capacidad
- **WHEN** el Líder de Expertise usa "Actualizar desde Azure DevOps" en el dashboard de un colaborador
- **THEN** sólo ese colaborador se consulta y su sprint en curso, sus historias, su actividad y su señal se refrescan

#### Scenario: La actualización no toca los sellados
- **WHEN** se actualiza un colaborador cuyos sprints anteriores ya tienen snapshot sellado
- **THEN** las métricas de esos sprints, su histórico y su tendencia quedan iguales, y sólo cambian las cifras provisionales del sprint en curso

#### Scenario: Falla la actualización
- **WHEN** Azure DevOps no responde o responde con error
- **THEN** el sistema muestra el error en rol de peligro, deja los datos y la hora anteriores, y permite reintentar

## REMOVED Requirements

### Requirement: Dedicación real de las capacidades
**Reason**: El listado se construía sobre la lectura FTE-contra-asignación que este change retira: sus columnas eran FTE comprometido, FTE dedicado a Iniciativa y a BAU, y la lectura como icono, todas derivadas de traducir puntos a FTE y compararlos contra lo que la célula declara. Cambian el sujeto (de "capacidad" a **colaborador**, porque en el modelo nuevo *capacidad* nombra al FTE), las columnas, los indicadores de cabecera, el criterio de orden y el filtro. No queda un requisito reformulable: lo reemplaza **Balance de carga de los colaboradores**.

**Migration**: La pantalla, la ruta `/app/lead/dedicacion`, el breadcrumb, la entrada de navegación, la acción de actualizar con su hora y el patrón de listado (búsqueda, filtros, paginación, esqueleto y estado vacío) se conservan sin cambios. Las columnas de FTE comprometido, Iniciativa y BAU se reemplazan por Capacidad (FTE disponible sobre contractual), Demanda (SP con su referencia) y Multitarea; los tres indicadores de vinculadas / por encima / por debajo se reemplazan por los cuatro por señal; el orden por distancia a lo asignado pasa a orden por señal accionable; y el filtro por lectura pasa a filtro por señal. El icono de la última columna sigue siendo un icono sin texto con tooltip, pero comunica la señal de balance en lugar de la lectura.

### Requirement: Dedicación real de una capacidad por sprint
**Reason**: El detalle organizaba la página alrededor de la comparación FTE comprometido vs FTE asignado: sus tres indicadores eran Dedicación (comprometido sobre asignado), Iniciativa y BAU (cada uno contra su parte de la asignación) y Actividad, y su panel principal repetía esa barra sprint a sprint. Con el FTE reducido a capacidad y la referencia trasladada al histórico del propio colaborador, ninguno de los tres indicadores sobrevive en su forma. Lo reemplaza **Dashboard de balance de un colaborador**, que reordena la página en los tres niveles del modelo.

**Migration**: Se conservan sin cambios la ruta `/app/lead/dedicacion/:personId`, el breadcrumb, el selector de sprints en la URL, el encabezado con sus acciones (Actualizar, Ver ficha, Reasignar / Asignar a una célula con el drawer de la Torre), el panel de historias del sprint y el mapa de actividad, y los estados de sin identidad y sin sprints. Los tres indicadores se reemplazan por las cuatro tarjetas Capacidad / Demanda / Referencia / Balance con su línea de resumen; el panel *Dedicación por sprint* se reemplaza por *Tendencia*; y se agregan los paneles de explicación (Por qué esta señal, Referencia, Ejecución, Trabajo no planificado, Multitarea). El panel de historias gana la marca de si la historia entró después del inicio del sprint. Se agrega el estado de histórico insuficiente.

### Requirement: Lectura de dedicación real frente a la asignada
**Reason**: La lectura comparaba el FTE comprometido —los puntos de historia traducidos con una tasa fija— contra el FTE declarado por la célula en la asignación. Ese FTE asignado es un dato reportado, no medido: si la célula reporta mal, la lectura miente, y la pantalla emitía una sentencia sobre una persona a partir de un número no verificado. Además no distinguía a un colaborador desviado de una célula entera desviada. La reemplazan **Capacidad del sprint en FTE** (el FTE sólo como capacidad, medido desde días y ausencias), **Referencia histórica del colaborador y de la célula** (la demanda en SP contra el propio histórico, con la célula como contexto) y **Señal de balance de capacidad** (una señal sintetizada de evidencias concurrentes, nunca de un indicador único).

**Migration**: Los umbrales ±0.10 FTE, la tasa de puntos por FTE por sprint, el FTE comprometido, el FTE asignado como referencia, la barra "comprometido sobre asignado" y las lecturas En línea / Por debajo / Por encima / Sin célula / Sin identidad / Sin sprint desaparecen del contrato y de las pantallas. Las tres lecturas comparativas se subsumen en la señal de balance: "Por encima" deja de ser un veredicto de un solo indicador y pasa a ser, cuando concurre con otras evidencias, "Posible sobreasignación"; "Por debajo", "Posible subasignación"; "En línea", "Balanceado". "Sin identidad" y "Sin sprint" se subsumen en "No evaluable" con su motivo. "Sin célula" deja de impedir la evaluación: un colaborador sin célula sigue teniendo capacidad, demanda e histórico propios y por tanto señal, y sólo pierde el contexto de célula. El FTE declarado en la asignación se conserva como dato de contexto, sin papel evaluador.
