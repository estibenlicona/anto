# real-dedication Specification

## Purpose
TBD - created by archiving change dedicacion-real. Update Purpose after archive.

## Requirements

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

### Requirement: Capacidad del sprint en FTE
El sistema SHALL usar el **FTE únicamente como capacidad** y SHALL NOT traducir puntos de historia a FTE en ninguna pantalla ni en ningún cálculo. Cada colaborador SHALL tener, para cada sprint, un **FTE contractual** (su dedicación declarada de contrato, 1.0 para jornada completa) y un **FTE disponible**, la fracción de ese contrato que efectivamente tuvo disponible en el sprint.

El **FTE disponible** SHALL derivarse de los días del sprint: `FTE disponible = FTE contractual × (días laborales del sprint − festivos − días de vacaciones − días de ausencia aprobada − otras indisponibilidades conocidas) / días laborales del sprint`, redondeado a dos decimales y nunca negativo. Los días laborales SHALL ser de lunes a viernes dentro de las fechas del sprint; las vacaciones y ausencias SHALL ser las **aprobadas** que intersectan el sprint, contadas en días hábiles y admitiendo medias jornadas; los festivos y las otras indisponibilidades SHALL llegar con el dato del sprint. El sistema SHALL mostrar siempre el **desglose** que produjo el FTE disponible (días laborales y cuántos días descuenta cada concepto), de modo que el número nunca sea opaco.

El sistema SHALL expresar además la capacidad en **horas**, como unidad de lectura derivada y nunca reportada: `horas disponibles = FTE disponible × horas por sprint` y `horas descontadas = (FTE contractual − FTE disponible) × horas por sprint`, donde **horas por sprint** es el parámetro del Calendario de sprints. Ambas cifras SHALL redondearse a la hora entera y mostrarse juntas ("72 h · −8 h por ausencias"), con el descuento omitido cuando es cero. La plataforma SHALL NOT pedir, registrar ni almacenar horas trabajadas: estas horas se calculan de los días que ya se miden y de las ausencias ya registradas.

El sistema SHALL NOT usar el FTE declarado en la asignación a la célula como referencia para evaluar la carga: ese dato es un reporte de la célula, no una medición. SHALL seguir mostrándolo como contexto de la asignación, rotulado como tal.

#### Scenario: FTE disponible de un sprint con ausencias
- **WHEN** un colaborador con FTE contractual 1.0 tiene un sprint de dos semanas con 10 días laborales, 1 festivo y 1 día de ausencia aprobada
- **THEN** su FTE disponible es 0.80 y el desglose muestra "10 días laborales · −1 festivo · −1 ausencia"

#### Scenario: La capacidad en horas sale del parámetro del sprint
- **WHEN** el Calendario de sprints declara 100 horas por sprint y un colaborador con FTE contractual 1.0 tiene 0.80 disponible
- **THEN** su capacidad se lee "0.80 / 1.0 FTE" con "80 h · −20 h por ausencias" al lado

#### Scenario: Horas de un colaborador a tiempo parcial
- **WHEN** el Calendario declara 100 horas por sprint y un colaborador con FTE contractual 0.80 pierde un día por festivo, quedando en 0.72 disponible
- **THEN** su capacidad se lee "0.72 / 0.80 FTE" con "72 h · −8 h por ausencias"

#### Scenario: Sin descuentos no hay resta que mostrar
- **WHEN** un colaborador no tiene festivos, vacaciones, ausencias ni otras indisponibilidades en el sprint
- **THEN** la capacidad muestra sólo sus horas disponibles, sin la cifra de descuento

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

El sistema SHALL exponer la **atención repartida** del colaborador en el sprint: las **HUs simultáneas** —cuántas historias estuvieron a la vez en un estado activo en Azure DevOps, con el máximo del sprint como WIP— y las **iniciativas simultáneas** —cuántas épicas distintas tocan sus historias del sprint—. Cada iniciativa simultánea SHALL mostrarse con el nombre de la iniciativa cuando la épica está mapeada a una y con el título de la épica cuando no lo está, indicando cuántos SP aporta cada una.

Esa lectura SHALL llamarse **Foco** en toda superficie visible —la columna del listado, la tarjeta de la ficha, la fila de la tabla de señales y cualquier otro rótulo—, y SHALL NOT llamarse "Multitarea" ni "WIP". El campo del contrato SHALL seguir llamándose `wip`, que es el nombre que Azure DevOps y el backend usan: renombrarlo sólo para la pantalla haría más difícil rastrear de dónde sale.

El sistema SHALL tratar el foco como **contexto de carga**: 28 SP en una sola iniciativa y 28 SP repartidos en cuatro no describen la misma situación, y la segunda tiene mayor riesgo de fragmentación de atención. SHALL NOT convertir por sí solo el foco en un veredicto.

#### Scenario: Trabajo no planificado en el sprint
- **WHEN** un colaborador se comprometió a 22 SP al inicio, recibió 8 SP más durante el sprint y completó 20
- **THEN** el trabajo no planificado se lee "36.4 %" con "+8 SP sobre 22" entre las métricas secundarias, y la pestaña de señales lo desarrolla como una barra apilada de 22 SP al inicio contra 8 SP agregados sobre un total de 30 SP

#### Scenario: Iniciativas simultáneas por épica
- **WHEN** las historias del sprint de un colaborador pertenecen a cuatro épicas distintas, dos de ellas mapeadas a iniciativas
- **THEN** el foco indica 4 iniciativas simultáneas, nombrando las dos iniciativas mapeadas y las dos épicas sin mapear, con los SP que aporta cada una

#### Scenario: Foco en una sola iniciativa
- **WHEN** los 28 SP del sprint pertenecen a una sola épica
- **THEN** el foco indica 1 iniciativa simultánea y no aporta evidencia de sobreasignación

#### Scenario: WIP del sprint
- **WHEN** en algún momento del sprint el colaborador tuvo cinco historias a la vez en estado activo
- **THEN** el foco del sprint cuenta 5 HUs abiertas a la vez y las muestra junto a las iniciativas simultáneas, sin usar la sigla WIP en la pantalla

### Requirement: Señal de balance de capacidad
El sistema SHALL terminar el análisis de cada colaborador en una **señal**, no en una sentencia. La señal SHALL tener cuatro valores:

- **Carga habitual** (rol de éxito) — los indicadores están dentro de la tolerancia de sus señales.
- **Posible sobreasignación** (rol de peligro) — varias señales apuntan consistentemente a una carga superior a la habitual.
- **Posible subasignación** (rol de advertencia) — la demanda observable está significativamente por debajo de la capacidad y del comportamiento habitual.
- **No evaluable** (rol neutro) — falta el dato mínimo: sin identidad DevOps, sin sprint en Azure DevOps, sin snapshot del sprint que se mira, o histórico insuficiente. SHALL indicar cuál de los motivos aplica.

El sistema SHALL NOT ofrecer un estado intermedio entre *Carga habitual* y las dos señales accionables: una señal que no pide una decisión de carga y tampoco dice "está bien" deja la fila sin resolver. La subasignación SHALL llevar rol de **advertencia** y no rol informativo: es una decisión de carga, no un dato de contexto.

La señal SHALL sintetizarse de **evidencias** concurrentes, cada una con una dirección (*sobre*, *sub* o *neutra*) y su cifra:

1. **Demanda frente al histórico del colaborador** — SP comprometidos contra su mediana histórica.
2. **Demanda por FTE disponible** — SP comprometidos por FTE disponible contra la misma razón en su histórico, que separa el efecto de las ausencias del efecto de la carga.
3. **Cumplimiento** — % de cumplimiento del sprint contra su cumplimiento histórico.
4. **Carry-over** — carry-over % del sprint contra su carry-over histórico.
5. **Trabajo no planificado** — proporción de SP agregados durante el sprint.
6. **Multitarea** — iniciativas simultáneas y HUs abiertas a la vez.

**Ningún indicador individual SHALL determinar automáticamente la categoría.** El sistema SHALL exigir **evidencias concurrentes en la misma dirección**: con ninguna evidencia, o con una sola que no sea de intensidad fuerte, la señal SHALL ser **Carga habitual**; con dos o más evidencias concordantes, o con una sola de intensidad fuerte, SHALL ser **Posible sobreasignación** o **Posible subasignación** según la dirección. Cuando hay evidencias en ambas direcciones la señal SHALL ser **Carga habitual**, y la explicación SHALL mostrar las evidencias de las dos direcciones.

El sistema SHALL calcular el **contexto de célula**: cuando la desviación del colaborador va en la misma dirección y magnitud comparable que la de su célula frente al histórico de la célula, SHALL declararlo junto a la señal ("la célula se comporta igual"). Ese contexto SHALL NOT modificar la señal ni el conteo de evidencias: sin un escalón intermedio al cual bajar, atenuarla escondería a una célula entera desviada, que es justamente lo que el Líder de Expertise necesita ver. La anotación SHALL acompañar a la señal en el dashboard y viajar en el tooltip del listado.

El sistema SHALL exponer siempre **por qué** salió esa señal: la lista de evidencias evaluadas con su dirección, su cifra y su umbral, incluidas las neutras y las que no se pudieron evaluar, y el contexto de célula cuando aplicó. La señal SHALL NOT presentarse nunca sin acceso a esa explicación.

Los **umbrales** SHALL ser los mismos en todas las pantallas y SHALL provenir de una única definición compartida por el listado, el dashboard del colaborador, la ficha de la persona y el badge de navegación. El umbral de la evidencia de demanda SHALL llamarse **tolerancia** en la interfaz y mostrarse junto a la cifra que juzga.

#### Scenario: Balanceado
- **WHEN** un colaborador comprometió 23 SP contra una mediana de 22, con cumplimiento y carry-over en línea con su histórico, sin trabajo agregado relevante y con una sola iniciativa
- **THEN** la señal es "Carga habitual" y la explicación lista las seis evidencias en dirección neutra

#### Scenario: Una sola evidencia no basta
- **WHEN** la única desviación de un colaborador es un carry-over del sprint por encima de su histórico y por debajo del umbral fuerte, y todo lo demás está en línea
- **THEN** la señal es "Carga habitual" y la explicación deja ver la evidencia aislada del carry-over; la señal SHALL NOT ser de sobreasignación

#### Scenario: Una sola evidencia fuerte ya es accionable
- **WHEN** la única desviación de un colaborador es una demanda un 60 % por debajo de su histórico, por encima del umbral de intensidad fuerte
- **THEN** la señal es "Posible subasignación" con esa evidencia como única sostén, y la explicación lo dice

#### Scenario: Dos evidencias concordantes
- **WHEN** un colaborador comprometió 28 SP contra su histórico de 22 y su cumplimiento cayó respecto al histórico, sin más desviaciones
- **THEN** la señal es "Posible sobreasignación" con las dos evidencias listadas

#### Scenario: Posible sobreasignación
- **WHEN** un colaborador comprometió 28 SP contra 22 habituales, su demanda por FTE disponible también subió, su carry-over supera el histórico y recibió trabajo no planificado
- **THEN** la señal es "Posible sobreasignación" y la explicación lista las cuatro evidencias en dirección de sobrecarga

#### Scenario: Posible subasignación
- **WHEN** un colaborador comprometió 9 SP contra 22 habituales, con demanda por FTE disponible también muy por debajo, cumplimiento del 100 % y una sola iniciativa
- **THEN** la señal es "Posible subasignación" y la explicación indica que la demanda observable está por debajo de su capacidad y su comportamiento habitual

#### Scenario: La célula se comporta igual
- **WHEN** un colaborador comprometió 9 SP contra su histórico de 22, y su célula entera está igualmente por debajo de su propio histórico
- **THEN** la señal sigue siendo "Posible subasignación" y junto a ella aparece la anotación de que la célula se comporta igual, sin que el conteo de evidencias cambie

#### Scenario: Evidencias en direcciones opuestas
- **WHEN** un colaborador tiene la demanda muy por encima de su histórico pero un cumplimiento y un carry-over mejores que los habituales
- **THEN** la señal es "Carga habitual" y la explicación muestra las evidencias en ambas direcciones

#### Scenario: No evaluable
- **WHEN** un colaborador no tiene identidad DevOps vinculada, o Azure DevOps no devuelve sprints para él, o el sprint que se mira cerró sin snapshot, o tiene menos sprints sellados que el mínimo configurado
- **THEN** la señal es "No evaluable" indicando cuál de los motivos aplica, sin cifras inventadas y con la acción que corresponde (vincular identidad o actualizar desde DevOps)

### Requirement: Balance de carga de los colaboradores
El sistema SHALL exponer la pantalla **Capacidad** en `/app/lead/dedicacion`, con breadcrumb `Plataforma / Capacidad` y la entrada "Capacidad" activa en la navegación: una fila por **colaborador** del chapter del Líder de Expertise —desarrolladores, ingenieros de calidad y cualquier otro perfil a su cargo— con su señal de balance en el sprint elegido.

La franja del breadcrumb SHALL llevar un **navegador de sprint** —el sprint anterior, el nombre y las fechas del sprint elegido, el siguiente— que mueve **el listado entero** de un sprint a otro, con el sprint en curso elegido al abrir y marcado como tal, y sin avanzar más allá de él. El sprint elegido SHALL viajar en la URL, de modo que el enlace se comparta y el botón de atrás funcione. A su lado SHALL ir cuándo fue la última actualización ("Actualizado hace 12 min" o "Sin actualizar") y la acción **Actualizar** desde Azure DevOps.

Cuatro **indicadores** SHALL encabezar la pantalla, uno por señal, cada uno con el punto de color de su rol: **Posible sobreasignación** (peligro), **Posible subasignación** (advertencia), **Carga habitual** (éxito) y **No evaluables** (neutro, sobre el total del chapter y con cuántos son por cada motivo). Cada indicador SHALL nombrar a los colaboradores que cuenta cuando son pocos, y describir el sprint elegido y no el filtro aplicado.

La **tabla** SHALL mostrar, por colaborador y para el sprint elegido, seis columnas: el **colaborador** (avatar, nombre, cargo, enlace neutro a su dashboard); la **célula e iniciativas**, con la célula y, de las iniciativas que sus historias tocaron en el sprint, **sólo la primera** como marca y el resto colapsado en un "+N" que lleva los nombres en su tooltip —la columna dice en qué anduvo la persona, y el ancho que se ahorra se lo llevan las barras de capacidad y demanda—; los nombres repetidos SHALL contarse una sola vez acá, aunque el foco los cuente todos; la **capacidad** (FTE disponible sobre contractual con su barra, y las horas con su descuento debajo); la **demanda vs habitual** (SP comprometidos, su mediana histórica y la **desviación en porcentaje** con el rol de color de la señal, sobre una barra que marca el habitual, y debajo la **tolerancia** —"Tolerancia ±25 %" cuando la desviación se sale de ella, "Dentro de la tolerancia" cuando no—); el **foco**, que es cuánta atención tiene repartida: un **medidor de cuatro tramos** que escala con las HUs abiertas a la vez por los mismos umbrales con los que la evidencia de multitarea cuenta —una sola HU, dos o tres, el umbral, y la desviación fuerte— y, debajo, las dos cifras que lo sostienen ("2 iniciativas · 4 HUs", sin la palabra WIP y sin el adjetivo "abiertas", que en la fila no distingue nada). Sin WIP reconstruido SHALL NOT pintarse el medidor: uno vacío se leería como foco pleno, que es lo contrario de "no se sabe"; y, como última columna, el **balance** reducido a **un solo icono** con nombre accesible y tooltip que lleva la señal, cuántas evidencias la sostienen y el contexto de célula cuando aplica. La columna de balance SHALL NOT llevar texto, marca de estado ni enlace.

La tabla SHALL NOT tener columna de sprint —el sprint es del listado entero— ni columnas de FTE comprometido, de FTE asignado, de porcentajes de dedicación ni de actividad. SHALL ordenarse por defecto poniendo primero las señales que piden acción —sobreasignación y subasignación—, luego la carga habitual y al final las no evaluables; SHALL buscarse por nombre o cargo; SHALL filtrarse por célula con **marcas en línea** que se activan y desactivan al hacer clic, incluida una para quienes no tienen célula; y SHALL paginarse como los demás listados. La toolbar SHALL mostrar a la derecha cuántas filas se están viendo sobre el total ("13 de 13 personas"). El sistema SHALL NOT ofrecer un filtro por señal: los cuatro indicadores ya separan por señal.

Un colaborador **sin identidad DevOps**, **sin sprint** o con **histórico insuficiente** SHALL aparecer con el icono de "No evaluable" y sin cifras de capacidad, demanda ni foco, con el motivo en el tooltip; su nombre sigue llevando a su dashboard. Sin colaboradores a cargo, la pantalla SHALL mostrar un estado vacío. Mientras carga SHALL mostrar el esqueleto de la tabla, sin desplazar los indicadores.

#### Scenario: Abrir el balance de carga
- **WHEN** el Líder de Expertise entra a Dedicación
- **THEN** ve el navegador de sprint en el sprint en curso y marcado como tal, los cuatro indicadores por señal, la tabla con una fila por colaborador de su chapter ordenada por señal accionable, la acción de actualizar con la hora de la última actualización, y la entrada "Dedicación" activa

#### Scenario: Leer una fila
- **WHEN** un colaborador con FTE contractual 0.80 y 0.72 disponible comprometió 30 SP contra un histórico de 22, tocando 2 iniciativas con 4 HUs abiertas
- **THEN** su fila muestra "0.72 / 0.80 FTE" con "72 h · −8 h por ausencias", "30 SP · habitual 22 · +36 %" con "Tolerancia ±25 %", el medidor de foco con tres de sus cuatro tramos encendidos sobre "2 iniciativas · 4 HUs", y el icono de su señal, cuyo tooltip da la señal y cuántas evidencias concurrentes la sostienen

#### Scenario: Una fila dentro de la tolerancia
- **WHEN** un colaborador comprometió 18 SP contra un histórico de 22, una desviación del −18 % que no llega a la tolerancia de ±25 %
- **THEN** su fila muestra "18 SP · habitual 22 · −18 %" con el pie "Dentro de la tolerancia" y el icono de "Carga habitual"

#### Scenario: Cambiar de sprint mueve el listado entero
- **WHEN** el Líder de Expertise retrocede un sprint en el navegador de la franja
- **THEN** los cuatro indicadores y todas las filas pasan a ese sprint sin recargar la aplicación, el sprint elegido queda en la URL y deja de mostrarse la marca de sprint en curso

#### Scenario: No se avanza más allá del sprint en curso
- **WHEN** el sprint elegido es el en curso
- **THEN** la acción de avanzar al sprint siguiente está deshabilitada

#### Scenario: Ordenar por señal accionable
- **WHEN** el chapter tiene colaboradores con las cuatro señales
- **THEN** la tabla muestra primero los de posible sobreasignación y subasignación, luego los de carga habitual y al final los no evaluables

#### Scenario: Filtrar por señal y por célula
- **WHEN** el Líder de Expertise hace clic en la marca de la célula Backend Platform
- **THEN** la tabla muestra sólo los colaboradores de esa célula desde la primera página, el conteo de la derecha dice cuántos se están viendo sobre el total, y los indicadores no cambian: describen el sprint, no el filtro; la toolbar SHALL NOT ofrecer un filtro por señal, porque los cuatro indicadores ya separan por señal

#### Scenario: Colaborador no evaluable
- **WHEN** un colaborador del chapter no tiene identidad DevOps vinculada
- **THEN** su fila muestra el icono de "No evaluable" sin cifras, el tooltip dice que falta la identidad, y cuenta en el indicador de no evaluables por ese motivo

#### Scenario: Ir al dashboard de un colaborador
- **WHEN** el Líder de Expertise hace clic en el nombre de un colaborador
- **THEN** el sistema abre `/app/lead/dedicacion/<id>` con el sprint que estaba mirando ya elegido, sin recargar la aplicación, y la entrada "Dedicación" sigue activa

#### Scenario: Sin colaboradores a cargo
- **WHEN** el chapter del Líder de Expertise no tiene personas
- **THEN** la pantalla muestra un estado vacío que lo dice y no muestra la tabla

### Requirement: Dashboard de balance de un colaborador
El sistema SHALL exponer el dashboard de balance de un colaborador en `/app/lead/dedicacion/:personId`, con breadcrumb `Plataforma / Dedicación real / <nombre del colaborador>` y la entrada "Dedicación" activa.

La **franja del breadcrumb** SHALL llevar, a la derecha del rastro: el **navegador de sprint** —flechas *Sprint anterior* y *Sprint siguiente* con el nombre y el rango del elegido entre ellas, el mismo componente y la misma redacción del listado, deshabilitada la que no tiene a dónde ir—; la **marca de estado del sprint** (*En curso* en rol informativo, *Finalizado* en neutro); y las acciones **Actualizar** (secundaria), **Ver ficha** (neutra) y **Reasignar** (primaria, mismo drawer de reasignación de la Torre de control; *Asignar a una célula* cuando no tiene célula). Elegir otro sprint SHALL cambiar todo lo que sigue a ese sprint sin recargar la aplicación, y SHALL quedar en la URL para que el enlace se comparta. La ficha SHALL NOT mostrar además una tira de pestañas de sprints: el navegador es el único selector.

El **encabezado de identidad** SHALL ser una sola línea de datos bajo el nombre: avatar con las iniciales, nombre del colaborador, y debajo su cargo, su célula, el **FTE declarado en su asignación rotulado como dato que la célula reporta**, y las **iniciativas que sus historias tocaron en el sprint** como marcas, colapsadas en un "+N" cuyo tooltip lleva los nombres restantes.

**La cabecera** SHALL ser una fila de tres tarjetas de anchos desiguales, con el balance al frente:

1. **Balance del sprint**, que SHALL ocupar aproximadamente el doble que cada una de las otras dos y SHALL llevar el borde en el rol de color de la señal cuando ésta pide una decisión de carga. Muestra un punto de color, el **nombre de la señal en tipografía de titular**, la **frase que la explica**, cuántas señales concurrentes la sostienen, y al pie la procedencia del sprint —la fecha de sellado, o el aviso de que el sprint sigue en curso y las cifras pueden cambiar—.
2. **Capacidad**: el FTE disponible sobre el contractual como cifra grande, con su barra y las horas con su descuento debajo.
3. **Demanda vs referencia**: los SP comprometidos como cifra grande, la desviación frente al habitual en SP y en porcentaje con el rol de color de la señal, y una barra que marca dónde está el habitual.

La cabecera SHALL NOT llevar una tarjeta de Referencia —esas cifras viven en la pestaña *Señales*— ni una línea de resumen en lenguaje natural.

Bajo la cabecera SHALL ir una **fila de cuatro métricas secundarias**, cada una con su rótulo, su cifra grande y su lectura al lado: **Cumplimiento** ("40 %" · "12 de 30 SP en Closed"), **Trabajo no planificado** ("36.4 %" · "+8 SP sobre 22"), **Carry-over** ("0 %" · "0 SP") y **Foco** ("2" · "iniciativas · 4 HUs abiertas a la vez"). Las cifras que se salen de su tolerancia SHALL llevar el rol de color que les corresponde.

Todo lo demás SHALL vivir en **una sola tarjeta con cuatro pestañas** —**Señales**, **Historias**, **Actividad** y **Tendencia**—, cada una con un **subtítulo** que resume su contenido sin abrirla ("3 de 6 hacia sobrecarga", "6 historias · 30 SP", "5 días activos · 24 commits", "7 sprints · +0.4 %"). La pestaña activa SHALL marcarse con una regla en el rol de marca.

- **Señales** SHALL listar las seis evidencias como una tabla de **Señal · Valor · Tolerancia**, cada fila con un icono de dirección, el nombre de la evidencia, su **veredicto en palabras** —"Fuera de tolerancia", "Fuera de tolerancia · desviación fuerte", "Dentro de la tolerancia", "No se pudo evaluar: <motivo>"—, su cifra y el umbral contra el que se comparó; las que cuentan hacia la señal SHALL destacarse por color y no sólo por posición. Encabezando la tabla SHALL ir la frase que explica la regla: cada señal tiene una tolerancia y cuenta cuando el valor la excede. A la derecha SHALL ir la **Referencia** —histórico del colaborador, histórico de la célula y sprint actual, cada uno con su cifra, su desviación y una barra a la misma escala— y el **Trabajo no planificado** como una **barra apilada** de lo comprometido al inicio contra lo agregado, con su leyenda y los tres totales.
- **Historias** SHALL listar las del sprint elegido con número, título, épica y tablero, la iniciativa mapeada como marca, el estado en DevOps como marca de estado, la marca **Entró después** cuando llegó con el sprint arrancado, los puntos y el enlace para abrirla en DevOps. Al pie SHALL ir el recuento: cuántas historias y cuántos SP, cuántos en Closed, cuántos sin cerrar, cómo se calcula el cumplimiento y cuántas entraron después del inicio.
- **Actividad** SHALL mostrar el mapa de actividad —una celda por día calendario del sprint agrupadas por semana con su encabezado de días, la intensidad de commits, releases y features creadas, el nombre accesible con el detalle por tipo y su leyenda— junto a los totales por tipo y la última actividad.
- **Tendencia** SHALL mostrar, por cada sprint de la ventana, los SP comprometidos y completados, el % de cumplimiento, el carry-over % y una barra de cumplimiento, **del más reciente al más antiguo**, con los sprints sin snapshot marcados y excluidos del cálculo. Cada fila SHALL ser **accionable**: elegirla lleva la ficha entera a ese sprint. La fila del sprint elegido SHALL marcarse como tal.

El dashboard SHALL usar el mismo vocabulario de cuatro señales, tolerancia, horas, HUs y **foco** que el listado: las dos pantallas SHALL NOT nombrar distinto lo mismo. En particular, la evidencia de dispersión de la atención SHALL llamarse **Foco** en la tarjeta secundaria, en la fila de la tabla de señales y en cualquier otro rótulo visible, y SHALL NOT llamarse "Multitarea" ni "WIP".

Un colaborador **sin identidad DevOps** SHALL mostrar, en lugar del dashboard, un estado vacío con la acción de vincularla desde su ficha. Un colaborador **sin sprints** SHALL mostrar un estado vacío que lo diga con la acción de actualizar. Un colaborador con **histórico insuficiente** SHALL mostrar el sprint elegido con sus cifras y, en la tarjeta de Balance, el aviso de cuántos sprints sellados hay y cuántos faltan.

#### Scenario: Abrir el dashboard de un colaborador
- **WHEN** el Líder de Expertise abre el dashboard de un colaborador con identidad, célula e histórico suficiente
- **THEN** ve la franja del breadcrumb con el navegador en el sprint en curso y la marca "En curso", la línea de identidad con sus iniciativas, la tarjeta de Balance al frente con Capacidad y Demanda al lado, las cuatro métricas secundarias, y la tarjeta de pestañas abierta en *Señales*

#### Scenario: Cabecera de cuatro tarjetas
- **WHEN** un colaborador con FTE disponible 0.72 sobre 0.80, 30 SP comprometidos, mediana histórica de 22 SP y tres evidencias hacia sobrecarga abre su dashboard
- **THEN** la cabecera **ya no son cuatro tarjetas iguales con una línea de resumen debajo**: son tres desiguales, sin tarjeta de Referencia y sin línea de resumen. La de Balance, al frente y del doble de ancho, dice "Posible sobreasignación" con su frase, "3 señales" y el aviso de sprint en curso; la de Capacidad dice "0.72 / 0.80 FTE" con "72 h · −8 h por ausencias"; y la de Demanda dice "30 SP" con "+8 SP · +36 %" sobre una barra que marca el histórico de 22 SP

#### Scenario: Las cuatro métricas secundarias
- **WHEN** el sprint elegido cerró 12 de 30 SP, tuvo 8 SP que entraron después de los 22 iniciales, no arrastró nada y tocó 2 iniciativas con 4 HUs abiertas a la vez
- **THEN** la fila muestra "40 %" con "12 de 30 SP en Closed", "36.4 %" con "+8 SP sobre 22", "0 %" con "0 SP", y "2" con "iniciativas · 4 HUs abiertas a la vez" bajo el rótulo **Foco**

#### Scenario: Por qué esta señal
- **WHEN** se abre la pestaña *Señales* de un sprint en curso cuya demanda por FTE disponible se pasó fuerte de la tolerancia
- **THEN** la tabla lista las seis evidencias —también las neutras y las no evaluables— con su valor y su tolerancia; esa fila dice "Fuera de tolerancia · desviación fuerte" con su cifra destacada, y las que todavía no se pueden evaluar dicen "No se pudo evaluar: sprint en curso" con un guion en lugar de cifra

#### Scenario: El contexto de célula se anota, no atenúa
- **WHEN** la señal del sprint elegido es "Posible subasignación" y la célula del colaborador se desvía igual que él
- **THEN** la tarjeta de Balance sigue diciendo "Posible subasignación" —el comportamiento de la célula no baja la señal— y la ficha no repite la anotación, que se lee en el tooltip de su fila del listado

#### Scenario: Las pestañas dicen qué hay dentro sin abrirlas
- **WHEN** se mira la tarjeta de pestañas sin cambiar de pestaña
- **THEN** cada pestaña lleva su subtítulo con el resumen de su contenido —cuántas evidencias van hacia sobrecarga, cuántas historias y SP, cuántos días activos y commits, y cuántos sprints tiene la tendencia—

#### Scenario: Cambiar de sprint
- **WHEN** el Líder de Expertise usa la flecha de sprint anterior en la franja del breadcrumb
- **THEN** la cabecera, las métricas secundarias y las cuatro pestañas pasan a ese sprint sin recargar la aplicación, la marca de estado pasa a "Finalizado", el sprint queda en la URL, y la tendencia no cambia

#### Scenario: Ir a un sprint desde la tendencia
- **WHEN** el Líder de Expertise elige una fila de la pestaña *Tendencia*
- **THEN** la ficha entera pasa a ese sprint, el navegador del breadcrumb lo refleja, y esa fila queda marcada como la elegida

#### Scenario: Sprint sin snapshot en el dashboard
- **WHEN** el sprint elegido cerró sin snapshot sellado
- **THEN** el pie de la tarjeta de Balance lo dice, la señal de ese sprint es "No evaluable" por ese motivo, las evidencias de cumplimiento y carry-over dicen que no se pudieron evaluar, y la tendencia marca ese punto como faltante

#### Scenario: Mapa de actividad de un sprint con actividad
- **WHEN** el colaborador hizo commits, publicó releases o creó features en varios días del sprint elegido
- **THEN** la pestaña *Actividad* muestra cada día con la intensidad de su actividad total, el nombre accesible de la celda detalla cuántos de cada tipo, y al lado aparecen los totales por tipo, los días con actividad y la última actividad

#### Scenario: Reasignar desde el dashboard
- **WHEN** el Líder de Expertise usa "Reasignar" y confirma un plan válido
- **THEN** el sistema aplica el cambio con la misma semántica que la Torre de control y el dato de asignación de la línea de identidad se actualiza sin recargar la aplicación; la señal de balance no cambia por ello, porque no depende del FTE asignado

#### Scenario: Colaborador sin identidad en su dashboard
- **WHEN** se abre el dashboard de un colaborador sin identidad DevOps
- **THEN** la pantalla muestra el estado vacío "Sin identidad DevOps" con la acción de ir a su ficha a vincularla, y no muestra navegador de sprint, tarjetas ni pestañas

#### Scenario: Colaborador con histórico insuficiente
- **WHEN** se abre el dashboard de un colaborador con 2 sprints sellados y un mínimo de 3
- **THEN** las tarjetas de Capacidad y Demanda muestran sus cifras, la de Balance dice "No evaluable" con cuántos sprints sellados hay y cuántos faltan, y las pestañas muestran lo que sí se puede medir del sprint elegido
