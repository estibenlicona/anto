## REMOVED Requirements

### Requirement: Brecha marcada contra el rol de cada persona
**Reason**: El nivel que se le exige a una persona pasa a derivarse de su **cargo** y no de su rol. El rol deja de ser texto libre y pasa a ser un catálogo cerrado de cinco valores de participación —Administrador, Líder Técnico, Líder de Expertise, Product Owner, Colaborador—, que no describe una disciplina y no puede fijar el nivel de una habilidad. Los escenarios de este requisito nombran el rol como vara de medir, así que se retira entero y se reemplaza por su equivalente contra el cargo.
**Migration**: Ninguna para quien usa la pantalla: lo que antes se leía del rol se lee del cargo, y las expectativas ya estaban declaradas con nombres de cargo ("Backend Dev", "Data Engineer"). Ver el requisito que lo reemplaza en la sección ADDED.

## ADDED Requirements

### Requirement: Brecha marcada contra el cargo de cada persona
Una celda SHALL marcarse como brecha cuando el nivel evaluado queda por debajo del que pide el cargo de **esa** persona en **esa** habilidad. El sistema SHALL comparar persona por persona contra su propio cargo y SHALL NOT usar un umbral único por habilidad: en un mismo span conviven cargos que exigen niveles distintos.

La intensidad del color SHALL crecer con la cantidad de niveles que faltan, usando la escala de atención del sistema de diseño, de modo que el caso más grave del span se distinga del que está a un paso sin tener que leer una cifra.

Los tres casos que **no** son brecha SHALL distinguirse entre sí y SHALL NOT llevar color de la escala de atención: estar al nivel o por encima, no tener nivel declarado para ese cargo, y no tener evaluación cerrada son hechos distintos, y pintarlos todos igual —o pintarlos con color— haría que lo que sí pide atención dejara de destacar.

Estar por encima de lo que el cargo pide SHALL NOT representarse con un color propio en la matriz; el sistema SHALL informarlo en el detalle de la celda.

#### Scenario: Dos cargos, dos exigencias
- **WHEN** dos personas están en Competente en la misma habilidad y sus cargos piden Competente y Avanzado respectivamente
- **THEN** la primera celda no lleva color de atención y la segunda sí

#### Scenario: La intensidad crece con la brecha
- **WHEN** una persona está a un nivel de lo que su cargo pide y otra a tres
- **THEN** la segunda celda se ve más intensa que la primera, y la diferencia se percibe sin leer ninguna cifra

#### Scenario: Cargo sin nivel declarado
- **WHEN** el cargo de una persona no tiene nivel declarado en una habilidad
- **THEN** su celda se distingue tanto de una celda al nivel como de una sin evaluar, y no cuenta como brecha

#### Scenario: Al nivel o por encima
- **WHEN** el nivel evaluado alcanza o supera el que pide el cargo
- **THEN** la celda no lleva color de atención, y estar por encima no genera ninguna alerta en la matriz

## MODIFIED Requirements

### Requirement: Matriz de capacidades y habilidades del span
El sistema SHALL ofrecer al Chapter Lead una pantalla de **Competencias** en `/app/lead/competencias` con una matriz del span: una fila por persona del chapter y una columna por habilidad activa del catálogo, agrupadas las columnas en técnicas y humanas. El breadcrumb SHALL ser "Competencias".

La pantalla SHALL organizarse en tres zonas: los **indicadores del span** arriba, la **matriz** al centro y una **columna de apoyo** a la derecha con el detalle de la celda activa, las habilidades que más brecha concentran y lo que queda pendiente de gestionar.

Cada celda SHALL representarse como un cuadro de color de tamaño uniforme, y todas las celdas SHALL medir lo mismo: lo único que SHALL variar de ancho es la columna de persona. El color SHALL decir cuánto le falta a esa persona para lo que su cargo le pide, y SHALL NOT decir el nivel evaluado; el nivel se lee en el detalle de la celda.

El encabezado de cada columna SHALL identificar su habilidad con una **sigla de dos letras** derivada de su nombre, y el nombre completo SHALL quedar disponible al pasar el puntero y como nombre accesible de la columna. La sigla SHALL calcularse con una única regla compartida —las iniciales de las dos primeras palabras cuando el nombre tiene varias, las dos primeras letras cuando es una sola—, para que dos habilidades no se abrevien con criterios distintos; el sistema SHALL NOT escribir el nombre completo en el encabezado, que descuadraría el ancho uniforme de las columnas.

Cada fila SHALL mostrar, junto al nombre de la persona, **el cargo contra el que se la está midiendo**: la brecha se calcula contra ese cargo, y sin él la fila obliga a recordar quién es cada quien.

La matriz SHALL permitir acotar qué habilidades se muestran a técnicas, humanas o todas, y ordenar las filas por cantidad de brechas o por nombre.

Una persona sin evaluación cerrada SHALL mostrar sus celdas sin dato —nunca un cero ni un nivel supuesto— y quedar señalada como pendiente de evaluar. La pantalla SHALL decir cuántas personas están en esa situación y por qué no entran en los totales, y SHALL ofrecer el camino a evaluarlas.

La pantalla SHALL mostrar la leyenda de la escala junto a la matriz, porque un mapa cuyo color no se puede interpretar sin abrir una celda no informa nada. La leyenda SHALL nombrar los tres tamaños de brecha y los dos casos que no son brecha: estar al nivel o por encima, y no tener nivel requerido.

#### Scenario: Entrar a la matriz
- **WHEN** el Chapter Lead abre `/app/lead/competencias`
- **THEN** ve una fila por persona a cargo y una columna por habilidad activa, y el color de cada cuadro le dice dónde hay trabajo por hacer

#### Scenario: Todas las celdas miden lo mismo
- **WHEN** se renderiza la matriz con habilidades de nombres de largo muy distinto
- **THEN** todos los cuadros conservan el mismo tamaño, y el largo del nombre no afecta a ninguna columna

#### Scenario: La columna no muestra el nombre de su habilidad
- **WHEN** el Chapter Lead mira los encabezados de la matriz
- **THEN** encuentra la sigla de dos letras de cada habilidad, no su nombre completo, y el nombre completo aparece al pasar el puntero

#### Scenario: La sigla sale de una sola regla
- **WHEN** el catálogo tiene una habilidad de una sola palabra y otra cuyo nombre es una frase
- **THEN** las dos se abrevian con la misma regla y quedan en dos letras, sin que ninguna dependa de una abreviatura escrita a mano

#### Scenario: Cada fila dice contra qué rol se mide
- **WHEN** el Chapter Lead recorre las filas
- **THEN** ve el cargo de cada persona junto a su nombre, que es el que fija el nivel requerido de esa fila

#### Scenario: Acotar y ordenar
- **WHEN** el Chapter Lead elige ver sólo las humanas y ordenar por brechas
- **THEN** la matriz deja sólo esas columnas y ordena las filas de más a menos brechas, sin perder la lectura del resto de la pantalla

#### Scenario: Persona sin evaluar
- **WHEN** una persona del chapter no tiene evaluación cerrada
- **THEN** su fila aparece con las celdas sin dato y marcada como pendiente de evaluar, sin contar brechas

#### Scenario: Los pendientes se pueden atender desde acá
- **WHEN** hay personas sin evaluación cerrada
- **THEN** la pantalla dice cuántas son, aclara que sin evaluación no hay brecha medible, y ofrece ir a abrir esas evaluaciones

#### Scenario: La leyenda está a la vista
- **WHEN** el Chapter Lead mira la matriz
- **THEN** encuentra junto a ella qué significa cada color, incluidos los dos casos que no son brecha, sin tener que abrir una celda para deducirlo

#### Scenario: Span sin evaluaciones
- **WHEN** ninguna persona tiene evaluación cerrada todavía
- **THEN** la pantalla muestra un estado vacío que invita a evaluar, en vez de una matriz en blanco

### Requirement: Totales por habilidad y por persona
La matriz SHALL cerrar cada columna con cuántas personas tienen brecha en esa habilidad, cada fila con cuántas brechas tiene esa persona, y SHALL mostrar el total de brechas del span. Los totales SHALL contar sólo personas con evaluación cerrada.

Los totales de fila y de columna SHALL responder al recorte de habilidades y al orden elegidos: si la matriz muestra sólo las técnicas, la cuenta de una fila SHALL ser la de esas columnas y no la del catálogo completo — un total que no corresponde a lo que se está viendo es peor que no mostrarlo.

#### Scenario: Leer una columna
- **WHEN** el Chapter Lead mira el pie de una columna
- **THEN** ve cuántas personas del span quedan por debajo de lo que su cargo pide en esa habilidad

#### Scenario: Leer una fila
- **WHEN** mira el extremo de una fila
- **THEN** ve cuántas brechas acumula esa persona en total

#### Scenario: Los totales siguen al recorte
- **WHEN** el Chapter Lead deja a la vista sólo las habilidades humanas
- **THEN** la cuenta de cada fila pasa a ser la de esas columnas, y ninguna cifra sigue contando las que ya no se ven

#### Scenario: Los pendientes no inflan ni desinflan
- **WHEN** hay personas sin evaluar
- **THEN** no suman ni restan a ningún total, y la pantalla informa cuántas están pendientes

### Requirement: Detalle de una habilidad
Al abrir una habilidad desde la matriz, el sistema SHALL mostrar un panel con las personas evaluadas agrupadas por el nivel que sacaron en esa habilidad, de menor a mayor. Dentro de cada nivel SHALL distinguir a quién está al nivel de quién tiene brecha, indicando en ese caso qué nivel pide su cargo y cuántos le faltan, junto con el cargo de cada persona.

El panel SHALL mostrar el reparto del span en esa habilidad y cuántas personas tienen brecha, y SHALL indicar cuántas quedan sin evaluar.

#### Scenario: Abrir una habilidad
- **WHEN** el Chapter Lead abre una habilidad desde la matriz
- **THEN** ve a las personas agrupadas por nivel, con su cargo, y marcadas como al nivel o con brecha

#### Scenario: Mismo nivel, distinta situación
- **WHEN** dos personas comparten nivel pero sus cargos piden niveles distintos
- **THEN** aparecen en el mismo grupo, una marcada al nivel y la otra con brecha

#### Scenario: Un nivel sin nadie
- **WHEN** ninguna persona quedó en un nivel
- **THEN** ese nivel aparece igual, indicando que no hay nadie, para que el reparto se lea completo

### Requirement: Perfil evaluado de una persona
El sistema SHALL ofrecer al Chapter Lead el plan de carrera de una persona en `/app/lead/competencias/:personId`, accesible desde la matriz del span y desde el detalle de la persona. La pantalla SHALL encabezarse con la persona, su cargo, la fecha de su última evaluación y cuántas brechas tiene abiertas.

El perfil SHALL mostrar una fila por habilidad evaluada, agrupadas en técnicas y humanas, con el nivel alcanzado sobre el medidor de cuatro pasos y, sobre ese mismo medidor, una marca en el nivel que su cargo pide. Cada fila SHALL indicar si está al nivel o cuántos niveles le faltan. Cuando su cargo no tiene nivel declarado para una habilidad, la fila SHALL mostrar el nivel sin marca ni estado de brecha.

#### Scenario: Ver el perfil
- **WHEN** el Chapter Lead abre el plan de una persona evaluada
- **THEN** ve una fila por habilidad con su nivel, la marca de lo que su cargo pide y si está al nivel o cuántos le faltan

#### Scenario: Persona sin evaluación cerrada
- **WHEN** la persona no tiene ninguna evaluación cerrada
- **THEN** la pantalla lo dice y ofrece evaluarla, en vez de mostrar un perfil vacío

#### Scenario: Habilidad sin nivel exigido para su rol
- **WHEN** el cargo de la persona no declara nivel en una habilidad
- **THEN** la fila muestra el nivel alcanzado, sin marca de umbral ni estado de brecha

### Requirement: Detalle de criterios por habilidad
Al abrir una habilidad del perfil, el sistema SHALL mostrar los criterios que la persona **cumple** en el nivel que alcanzó y los que le **faltan** del nivel que su cargo pide, cada uno con su marca, tomados de la evaluación con la que se cerró — no de un texto escrito aparte. Cada bloque SHALL indicar cuántos cumple sobre el total de ese nivel, sin asumir una cantidad de criterios.

Varias habilidades SHALL poder estar abiertas a la vez, y el sistema SHALL NOT cerrar una al abrir otra.

#### Scenario: Abrir una habilidad con brecha
- **WHEN** el Chapter Lead abre una habilidad en la que la persona tiene brecha
- **THEN** ve a la izquierda lo que cumple en su nivel y a la derecha lo que le falta del nivel exigido, con el contador de cada uno

#### Scenario: Abrir una habilidad sin brecha
- **WHEN** abre una habilidad en la que la persona está al nivel o por encima
- **THEN** ve los criterios que cumple en su nivel, y el sistema no inventa un nivel siguiente como exigencia

#### Scenario: Los criterios son los de la evaluación
- **WHEN** el catálogo cambió después de la evaluación
- **THEN** el detalle muestra los criterios de la versión con la que se evaluó, coherente con lo que la evaluación registró

### Requirement: Una brecha se cierra reevaluando
Marcar una acción como cumplida SHALL NOT cerrar la brecha que la originó: SHALL registrar que la acción terminó y dejar la brecha abierta. Una brecha SHALL cerrarse únicamente cuando una evaluación posterior deja el nivel de esa habilidad en el que su cargo pide o por encima.

La pantalla SHALL dejar esta regla explícita donde se administran las acciones, para que cumplir el plan no se confunda con cerrar la brecha.

#### Scenario: Acción cumplida, brecha abierta
- **WHEN** el Chapter Lead marca una acción como cumplida
- **THEN** la acción queda cumplida y la brecha sigue abierta, con la pantalla indicando que se cierra reevaluando

#### Scenario: La reevaluación cierra la brecha
- **WHEN** una evaluación posterior deja esa habilidad en el nivel que el cargo pide o por encima
- **THEN** la brecha deja de contarse como abierta, tanto en el plan de la persona como en los totales del span

#### Scenario: La reevaluación no alcanza
- **WHEN** la evaluación posterior sube el nivel pero sigue por debajo de lo que el cargo pide
- **THEN** la brecha continúa abierta, con su tamaño actualizado

### Requirement: Detalle de una celda
Al activar una celda de la matriz, el sistema SHALL mostrar en la **columna de apoyo** el detalle que el mapa no puede mostrar, sin sacar al Chapter Lead de la matriz ni perder su desplazamiento. El detalle SHALL ocupar un lugar fijo de la pantalla y SHALL NOT taparla: la comparación entre la celda abierta y el resto del mapa es la lectura que la pantalla existe para permitir.

El panel SHALL mostrar de quién es la celda —con su cargo— y cuándo se cerró su evaluación, el nivel alcanzado junto al que su cargo pide, el tamaño de la brecha nombrado en palabras, y —cuando hay brecha— los criterios del nivel exigido que quedaron sin marcar en esa evaluación. El panel SHALL indicar además **cuántas personas del span tienen brecha en esa misma habilidad**, y si ya existe una acción del plan sobre esa brecha o si está sin plan.

El panel SHALL distinguir la brecha que se cierra acompañando en el trabajo de la que exige un plan formal, porque es la diferencia que decide qué hacer a continuación.

El panel SHALL nombrar la habilidad de la celda —es donde se dice de qué columna se trata— y SHALL ofrecer el camino al plan de esa persona y al detalle de esa habilidad. SHALL cerrarse desde el propio panel o con la tecla Escape, y SHALL poder abrirse con teclado, no sólo con el mouse.

Una celda sin brecha SHALL abrir el panel igualmente, indicando que está al nivel y, cuando corresponde, que está por encima del que su cargo pide. Una celda sin evaluación cerrada SHALL abrir un panel que lo diga y ofrezca evaluar a esa persona.

Sin ninguna celda activa, el lugar del panel SHALL quedar disponible para el resto de la columna de apoyo, sin dejar un hueco vacío esperando.

#### Scenario: Abrir una celda con brecha
- **WHEN** el Chapter Lead activa una celda marcada
- **THEN** ve de quién es, el nivel alcanzado contra el exigido, los criterios que le faltan de esa evaluación, cuántas personas más del span tienen brecha en esa habilidad, y qué acción del plan existe

#### Scenario: La matriz sigue a la vista
- **WHEN** el detalle de una celda está abierto
- **THEN** la matriz sigue visible y desplazable, y el detalle no la cubre

#### Scenario: Brecha de un nivel y brecha crítica
- **WHEN** el Chapter Lead abre una celda de un nivel y otra de dos o más
- **THEN** la primera se presenta como algo que se cierra con acompañamiento en trabajo real y la segunda como algo que requiere un plan formal

#### Scenario: Abrir una celda sin brecha
- **WHEN** activa una celda que está al nivel o por encima
- **THEN** el panel lo dice, e indica cuando la persona supera lo que su cargo pide

#### Scenario: Abrir una celda sin evaluar
- **WHEN** activa una celda de una persona sin evaluación cerrada
- **THEN** el panel lo dice y ofrece evaluar a esa persona, en vez de mostrar una brecha que nadie midió

#### Scenario: Volver a la matriz sin perder el lugar
- **WHEN** cierra el panel desde el propio panel o con Escape
- **THEN** vuelve a la matriz en la misma posición de desplazamiento en que estaba

#### Scenario: Abrir con teclado
- **WHEN** recorre la matriz con el teclado y activa una celda
- **THEN** el panel se abre y su contenido queda accesible sin usar el mouse

#### Scenario: Cerrar el detalle
- **WHEN** el Chapter Lead cierra el detalle
- **THEN** la columna de apoyo vuelve a mostrar el resto de su contenido, sin dejar un espacio en blanco

### Requirement: Indicadores del span
La pantalla de Competencias SHALL encabezarse con cuatro indicadores sobre el span completo —no sobre el recorte de habilidades ni el orden que el Chapter Lead tenga puesto—, porque son la lectura de situación con la que se entra a la pantalla:

- **Brechas críticas**: cuántas brechas son de dos niveles o más, sobre el total de brechas abiertas. El indicador SHALL explicar que son las que no se cierran con la operación diaria.
- **Cobertura de evaluación**: qué porcentaje de las personas del chapter tiene evaluación cerrada, con las dos cifras que forman ese porcentaje, y SHALL aclarar que las no evaluadas quedan fuera de los totales.
- **Variación contra el ciclo anterior**: cuántas brechas se abrieron o se cerraron respecto del ciclo previo, con el signo a la vista y la serie de los últimos ciclos. Una baja SHALL leerse como mejora y una subida como deterioro, sin que el usuario tenga que interpretar el signo.
- **Personas en riesgo**: cuántas acumulan tres brechas o más respecto de lo que su cargo pide, identificadas con sus avatares y con el camino a verlas todas.

Las cifras SHALL calcularse sobre personas con evaluación cerrada. Cuando no hay ciclo anterior con el que comparar, el indicador de variación SHALL decirlo en lugar de mostrar un cero, que se leería como "no cambió nada".

#### Scenario: Leer la situación de un vistazo
- **WHEN** el Chapter Lead abre Competencias
- **THEN** ve las brechas críticas sobre el total, la cobertura de evaluación, la variación contra el ciclo anterior y cuántas personas están en riesgo

#### Scenario: Los indicadores no siguen al filtro
- **WHEN** el Chapter Lead deja a la vista sólo las habilidades técnicas
- **THEN** los indicadores siguen hablando del span completo, porque son la situación del chapter y no la de la vista

#### Scenario: Primer ciclo
- **WHEN** no existe un ciclo anterior cerrado con el que comparar
- **THEN** el indicador de variación lo dice, en vez de mostrar una variación de cero

#### Scenario: Nadie en riesgo
- **WHEN** ninguna persona acumula tres brechas o más
- **THEN** el indicador lo dice sin avatares, y no desaparece de la fila

### Requirement: Pendientes de gestión del chapter
La pantalla SHALL mostrar lo que quedó pendiente de gestionar en el módulo, con su cantidad y el camino para atenderlo: evaluaciones sin cerrar, acciones del plan cuyo compromiso ya venció, cargos sin nivel declarado y brechas que no tienen ninguna acción registrada.

Cada cantidad SHALL venir calculada sobre todo el chapter, y el sistema SHALL NOT obtenerla pidiendo el plan de cada persona por separado: la pantalla se abre con una lectura del span, no con una petición por integrante.

Un pendiente en cero SHALL mostrarse igual, para que la lista se lea siempre completa y su ausencia no se confunda con no haberlo mirado.

#### Scenario: Ver los pendientes
- **WHEN** el Chapter Lead mira la columna de apoyo
- **THEN** ve cuántas evaluaciones están sin cerrar, cuántos planes vencieron, cuántos cargos no declaran nivel y cuántas brechas están sin plan

#### Scenario: Un pendiente en cero
- **WHEN** no hay ningún plan vencido
- **THEN** la fila aparece con cero, no desaparece de la lista

#### Scenario: Una sola lectura
- **WHEN** la pantalla carga los pendientes
- **THEN** las cifras llegan resueltas del lado del dato, sin una petición por persona del chapter

