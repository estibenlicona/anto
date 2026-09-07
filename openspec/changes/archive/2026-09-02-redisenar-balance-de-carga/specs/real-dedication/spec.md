## MODIFIED Requirements

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
El sistema SHALL exponer el dashboard de balance de un colaborador en `/app/lead/dedicacion/:personId`, con breadcrumb `Plataforma / Dedicación real / <nombre del colaborador>` y la entrada "Dedicación" activa. El **encabezado** SHALL mostrar el enlace de vuelta al listado, el avatar, el nombre, el cargo, la célula con su iniciativa activa y su talla, el FTE declarado en su asignación rotulado como dato que la célula reporta, y las acciones **Actualizar** (secundaria), **Ver ficha** (neutra) y **Reasignar** (primaria, mismo drawer de reasignación de la Torre de control; *Asignar a una célula* cuando no tiene célula).

Un **selector de sprints** SHALL listar los sprints que Azure DevOps devuelve para ese colaborador (los de la ventana de histórico y el en curso), con el en curso elegido al abrir y marcado como tal, y cada uno marcado con la procedencia de su snapshot; elegir otro SHALL cambiar todo lo que sigue a ese sprint sin recargar la aplicación.

El dashboard SHALL organizarse en **tres niveles de lectura**, en este orden.

**Nivel 1 — la cabecera.** Cuatro tarjetas: **Capacidad** (el FTE disponible sobre el contractual, con su desglose de días y sus horas), **Demanda** (los SP comprometidos del sprint con su desviación frente al habitual), **Referencia** (la mediana histórica del colaborador) y **Balance** (la señal con su frase, y la anotación de contexto de célula cuando aplica). Debajo, una **línea de resumen** con lo esencial en lenguaje natural: los SP comprometidos frente a los habituales, las iniciativas activas y el carry-over histórico ("28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18 % carry-over histórico").

**Nivel 2 — la explicación.** El panel **Por qué esta señal** SHALL listar las evidencias evaluadas con su dirección, su cifra y su umbral, incluidas las neutras y las no evaluables, y el contexto de célula cuando aplicó. Los paneles **Referencia** (las tres cifras comparables: histórico del colaborador, histórico de la célula y sprint actual, con las desviaciones), **Ejecución** (SP comprometidos, completados, no completados, % de cumplimiento y carry-over, con la procedencia del snapshot), **Trabajo no planificado** (comprometido al inicio, agregado, total trabajado y la proporción) y **Multitarea** (iniciativas simultáneas con sus nombres y SP, HUs comprometidas y HUs abiertas a la vez) SHALL desarrollar cada evidencia.

**Nivel 3 — el análisis.** El panel **Tendencia** SHALL mostrar, por cada sprint de la ventana, los SP comprometidos y completados, el % de cumplimiento y el carry-over %, del más antiguo al más reciente, con los sprints sin snapshot marcados y excluidos del cálculo; SHALL dejar leer la trayectoria (una caída sostenida de cumplimiento, un carry-over que crece) por encima del valor de un sprint aislado.

Se SHALL conservar, para el sprint elegido, el panel **Historias del sprint** —número, título, etiqueta con la iniciativa mapeada cuando la hay, épica, tablero, puntos, estado en DevOps, si entró después del inicio del sprint, y enlace para abrirla en DevOps, ordenadas por puntos— y el panel **Mapa de actividad** —una celda por día calendario del sprint agrupadas por semana, con la intensidad de commits, releases y features creadas, los fines de semana atenuados, el nombre accesible con el detalle por tipo, su leyenda, sus totales por tipo, los días con actividad y la última actividad—.

El dashboard SHALL usar el mismo vocabulario de cuatro señales, tolerancia, horas y HUs abiertas que el listado: las dos pantallas SHALL NOT nombrar distinto lo mismo.

Un colaborador **sin identidad DevOps** SHALL mostrar, en lugar del dashboard, un estado vacío con la acción de vincularla desde su ficha. Un colaborador **sin sprints** SHALL mostrar un estado vacío que lo diga con la acción de actualizar. Un colaborador con **histórico insuficiente** SHALL mostrar el sprint elegido con sus cifras y, en lugar de la referencia y la señal, el aviso de cuántos sprints sellados hay y cuántos faltan.

#### Scenario: Abrir el dashboard de un colaborador
- **WHEN** el Líder de Expertise abre el dashboard de un colaborador con identidad, célula e histórico suficiente
- **THEN** ve el encabezado, el sprint en curso elegido, las cuatro tarjetas Capacidad / Demanda / Referencia / Balance con la línea de resumen debajo, luego los paneles de explicación y al final la tendencia, las historias y el mapa de actividad

#### Scenario: Cabecera de cuatro tarjetas
- **WHEN** un colaborador con FTE disponible 0.80 sobre 1.0, 28 SP comprometidos y mediana histórica de 22 SP abre su dashboard, con 100 horas por sprint configuradas
- **THEN** las tarjetas muestran "0.80 / 1.0 FTE" con "80 h · −20 h por ausencias", "28 SP" con "+27 %", "22 SP" y la señal con su frase, y la línea de resumen dice "28 SP comprometidos vs 22 SP habituales · 3 iniciativas activas · 18 % carry-over histórico"

#### Scenario: El contexto de célula se anota, no atenúa
- **WHEN** la señal del sprint elegido es "Posible subasignación" y la célula del colaborador se desvía igual que él
- **THEN** la tarjeta de Balance sigue diciendo "Posible subasignación" y junto a ella aparece la anotación de que la célula se comporta igual, que el panel *Por qué esta señal* repite con las evidencias intactas

#### Scenario: Por qué esta señal
- **WHEN** la señal del sprint elegido es "Posible sobreasignación"
- **THEN** el panel lista las evidencias que la sostienen con su cifra y su umbral, las que quedaron neutras, las que no se pudieron evaluar y, si aplicó, la anotación de comportamiento de la célula

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
