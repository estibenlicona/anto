## MODIFIED Requirements

### Requirement: Matriz de capacidades y habilidades del span
El sistema SHALL ofrecer al Chapter Lead una pantalla de **Competencias** en `/app/lead/competencias` con una matriz del span: una fila por persona del chapter y una columna por habilidad activa del catálogo, agrupadas las columnas en técnicas y humanas. El breadcrumb SHALL ser "Competencias".

La pantalla SHALL organizarse en tres zonas: los **indicadores del span** arriba, la **matriz** al centro y una **columna de apoyo** a la derecha con el detalle de la celda activa, las habilidades que más brecha concentran y lo que queda pendiente de gestionar.

Cada celda SHALL representarse como un cuadro de color de tamaño uniforme, y todas las celdas SHALL medir lo mismo: lo único que SHALL variar de ancho es la columna de persona. El color SHALL decir cuánto le falta a esa persona para lo que su rol le pide, y SHALL NOT decir el nivel evaluado; el nivel se lee en el detalle de la celda.

El encabezado de cada columna SHALL identificar su habilidad con una **sigla de dos letras** derivada de su nombre, y el nombre completo SHALL quedar disponible al pasar el puntero y como nombre accesible de la columna. La sigla SHALL calcularse con una única regla compartida —las iniciales de las dos primeras palabras cuando el nombre tiene varias, las dos primeras letras cuando es una sola—, para que dos habilidades no se abrevien con criterios distintos; el sistema SHALL NOT escribir el nombre completo en el encabezado, que descuadraría el ancho uniforme de las columnas.

Cada fila SHALL mostrar, junto al nombre de la persona, **el rol contra el que se la está midiendo**: la brecha se calcula contra ese rol, y sin él la fila obliga a recordar quién es cada quien.

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
- **THEN** ve el rol de cada persona junto a su nombre, que es el que fija el nivel requerido de esa fila

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
- **THEN** ve cuántas personas del span quedan por debajo de lo que su rol pide en esa habilidad

#### Scenario: Leer una fila
- **WHEN** mira el extremo de una fila
- **THEN** ve cuántas brechas acumula esa persona en total

#### Scenario: Los totales siguen al recorte
- **WHEN** el Chapter Lead deja a la vista sólo las habilidades humanas
- **THEN** la cuenta de cada fila pasa a ser la de esas columnas, y ninguna cifra sigue contando las que ya no se ven

#### Scenario: Los pendientes no inflan ni desinflan
- **WHEN** hay personas sin evaluar
- **THEN** no suman ni restan a ningún total, y la pantalla informa cuántas están pendientes

### Requirement: Detalle de una celda
Al activar una celda de la matriz, el sistema SHALL mostrar en la **columna de apoyo** el detalle que el mapa no puede mostrar, sin sacar al Chapter Lead de la matriz ni perder su desplazamiento. El detalle SHALL ocupar un lugar fijo de la pantalla y SHALL NOT taparla: la comparación entre la celda abierta y el resto del mapa es la lectura que la pantalla existe para permitir.

El panel SHALL mostrar de quién es la celda —con su rol— y cuándo se cerró su evaluación, el nivel alcanzado junto al que su rol pide, el tamaño de la brecha nombrado en palabras, y —cuando hay brecha— los criterios del nivel exigido que quedaron sin marcar en esa evaluación. El panel SHALL indicar además **cuántas personas del span tienen brecha en esa misma habilidad**, y si ya existe una acción del plan sobre esa brecha o si está sin plan.

El panel SHALL distinguir la brecha que se cierra acompañando en el trabajo de la que exige un plan formal, porque es la diferencia que decide qué hacer a continuación.

El panel SHALL nombrar la habilidad de la celda —es donde se dice de qué columna se trata— y SHALL ofrecer el camino al plan de esa persona y al detalle de esa habilidad. SHALL cerrarse desde el propio panel o con la tecla Escape, y SHALL poder abrirse con teclado, no sólo con el mouse.

Una celda sin brecha SHALL abrir el panel igualmente, indicando que está al nivel y, cuando corresponde, que está por encima del que su rol pide. Una celda sin evaluación cerrada SHALL abrir un panel que lo diga y ofrezca evaluar a esa persona.

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
- **THEN** el panel lo dice, e indica cuando la persona supera lo que su rol pide

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

### Requirement: Perfil evaluado de una persona
El sistema SHALL ofrecer al Chapter Lead el plan de carrera de una persona en `/app/lead/competencias/:personId`, accesible desde la matriz del span y desde el detalle de la persona. La pantalla SHALL encabezarse con la persona, su rol, la fecha de su última evaluación y cuántas brechas tiene abiertas.

El perfil SHALL mostrar una fila por habilidad evaluada, agrupadas en técnicas y humanas, con el nivel alcanzado sobre el medidor de cuatro pasos y, sobre ese mismo medidor, una marca en el nivel que su rol pide. Cada fila SHALL indicar si está al nivel o cuántos niveles le faltan. Cuando su rol no tiene nivel declarado para una habilidad, la fila SHALL mostrar el nivel sin marca ni estado de brecha.

#### Scenario: Ver el perfil
- **WHEN** el Chapter Lead abre el plan de una persona evaluada
- **THEN** ve una fila por habilidad con su nivel, la marca de lo que su rol pide y si está al nivel o cuántos le faltan

#### Scenario: Persona sin evaluación cerrada
- **WHEN** la persona no tiene ninguna evaluación cerrada
- **THEN** la pantalla lo dice y ofrece evaluarla, en vez de mostrar un perfil vacío

#### Scenario: Habilidad sin nivel exigido para su rol
- **WHEN** el rol de la persona no declara nivel en una habilidad
- **THEN** la fila muestra el nivel alcanzado, sin marca de umbral ni estado de brecha

### Requirement: Recorrer la matriz cuando no entra en pantalla
La columna de persona SHALL quedar fija mientras la matriz se desplaza a lo ancho, de modo que ninguna celda quede sin saber a quién pertenece. El sistema SHALL permitir acotar qué habilidades se muestran —por grupo o eligiéndolas— y ordenar las filas por cantidad de brechas, para que lo más crítico quede primero.

Las columnas SHALL agruparse siempre en técnicas y humanas, con **cada grupo rotulado sobre las columnas que le corresponden**, y el orden por brechas SHALL aplicarse **dentro** de cada grupo. Ordenar cruzando los grupos los dejaría intercalados, y entonces nada diría a qué grupo pertenece una columna: el encabezado sólo lleva dos letras. El grupo es una clasificación de la habilidad y la criticidad una lectura sobre ella; una lectura no reordena la clasificación.

Con la matriz acotada a un solo grupo, SHALL mostrarse únicamente el rótulo de ese grupo.

#### Scenario: Los grupos se rotulan sobre sus columnas
- **WHEN** el Chapter Lead mira el encabezado de la matriz con todas las habilidades a la vista
- **THEN** encuentra "TÉCNICAS" y "HUMANAS" abarcando cada uno sus columnas, y al acotar a un grupo queda sólo el rótulo de ése

#### Scenario: Desplazar a lo ancho
- **WHEN** las habilidades no entran en el ancho de la pantalla y el usuario se desplaza
- **THEN** la columna de persona permanece visible y el resto se desplaza por debajo

#### Scenario: Acotar habilidades
- **WHEN** el Chapter Lead elige ver sólo las habilidades técnicas
- **THEN** la matriz muestra esas columnas y los totales se recalculan sobre lo visible

#### Scenario: Ordenar por brechas
- **WHEN** ordena por brechas
- **THEN** la persona con más brechas queda primera, y dentro de cada grupo de habilidades la que más brechas acumula queda a la izquierda, sin que ninguna columna cambie de grupo

## ADDED Requirements

### Requirement: Indicadores del span
La pantalla de Competencias SHALL encabezarse con cuatro indicadores sobre el span completo —no sobre el recorte de habilidades ni el orden que el Chapter Lead tenga puesto—, porque son la lectura de situación con la que se entra a la pantalla:

- **Brechas críticas**: cuántas brechas son de dos niveles o más, sobre el total de brechas abiertas. El indicador SHALL explicar que son las que no se cierran con la operación diaria.
- **Cobertura de evaluación**: qué porcentaje de las personas del chapter tiene evaluación cerrada, con las dos cifras que forman ese porcentaje, y SHALL aclarar que las no evaluadas quedan fuera de los totales.
- **Variación contra el ciclo anterior**: cuántas brechas se abrieron o se cerraron respecto del ciclo previo, con el signo a la vista y la serie de los últimos ciclos. Una baja SHALL leerse como mejora y una subida como deterioro, sin que el usuario tenga que interpretar el signo.
- **Personas en riesgo**: cuántas acumulan tres brechas o más respecto de lo que su rol pide, identificadas con sus avatares y con el camino a verlas todas.

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

### Requirement: Habilidades que concentran la brecha del chapter
La pantalla SHALL mostrar las habilidades donde se acumula la mayor brecha del span, ordenadas por cuánto pesan, y para cada una cuántas personas tienen brecha y qué nivel se les pide. El peso SHALL considerar el tamaño de las brechas y no sólo cuántas son: tres personas a un nivel y tres a tres niveles no son el mismo problema.

Este bloque SHALL presentarse como una lectura **del chapter**, explícitamente distinta de la de una persona, y SHALL NOT mostrarse cuando el span no tiene ninguna brecha abierta.

#### Scenario: Ver dónde duele
- **WHEN** el Chapter Lead mira la columna de apoyo
- **THEN** ve las habilidades con más brecha acumulada, cuántas personas la tienen y el nivel requerido, presentado como dato del chapter

#### Scenario: El tamaño pesa
- **WHEN** una habilidad tiene tres brechas de un nivel y otra tres de tres niveles
- **THEN** la segunda aparece por delante

#### Scenario: Span sin brechas
- **WHEN** ninguna persona del span tiene brecha abierta
- **THEN** el bloque no se muestra, en vez de aparecer vacío

### Requirement: Pendientes de gestión del chapter
La pantalla SHALL mostrar lo que quedó pendiente de gestionar en el módulo, con su cantidad y el camino para atenderlo: evaluaciones sin cerrar, acciones del plan cuyo compromiso ya venció, roles sin nivel declarado y brechas que no tienen ninguna acción registrada.

Cada cantidad SHALL venir calculada sobre todo el chapter, y el sistema SHALL NOT obtenerla pidiendo el plan de cada persona por separado: la pantalla se abre con una lectura del span, no con una petición por integrante.

Un pendiente en cero SHALL mostrarse igual, para que la lista se lea siempre completa y su ausencia no se confunda con no haberlo mirado.

#### Scenario: Ver los pendientes
- **WHEN** el Chapter Lead mira la columna de apoyo
- **THEN** ve cuántas evaluaciones están sin cerrar, cuántos planes vencieron, cuántos roles no declaran nivel y cuántas brechas están sin plan

#### Scenario: Un pendiente en cero
- **WHEN** no hay ningún plan vencido
- **THEN** la fila aparece con cero, no desaparece de la lista

#### Scenario: Una sola lectura
- **WHEN** la pantalla carga los pendientes
- **THEN** las cifras llegan resueltas del lado del dato, sin una petición por persona del chapter
