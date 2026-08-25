## MODIFIED Requirements

### Requirement: Matriz de capacidades y habilidades del span
El sistema SHALL ofrecer al Chapter Lead una pantalla de Plan de carrera en `/app/lead/plan-carrera` con una matriz del span: una fila por persona del chapter y una columna por habilidad activa del catálogo, agrupadas las columnas en técnicas y humanas. El breadcrumb SHALL ser "Plan de carrera".

Cada celda SHALL representarse como un cuadro de color de tamaño uniforme, y todas las celdas SHALL medir lo mismo: lo único que SHALL variar de ancho es la columna de persona. El color SHALL decir cuánto le falta a esa persona para lo que su rol le pide, y SHALL NOT decir el nivel evaluado; el nivel se lee en el detalle de la celda.

El nombre de la habilidad NO SHALL dibujarse en el encabezado de su columna: el mapa se lee por color, y de qué habilidad es cada columna se dice en el detalle de la celda. El nombre SHALL seguir siendo el nombre accesible de la columna, para que la tabla pueda recorrerse con un lector de pantalla.

Una persona sin evaluación cerrada SHALL mostrar sus celdas sin dato —nunca un cero ni un nivel supuesto— y quedar señalada como pendiente de evaluar.

La pantalla SHALL mostrar la leyenda de la escala junto a la matriz, porque un mapa cuyo color no se puede interpretar sin abrir una celda no informa nada.

#### Scenario: Entrar a la matriz
- **WHEN** el Chapter Lead abre `/app/lead/plan-carrera`
- **THEN** ve una fila por persona a cargo y una columna por habilidad activa, y el color de cada cuadro le dice dónde hay trabajo por hacer

#### Scenario: Todas las celdas miden lo mismo
- **WHEN** se renderiza la matriz con habilidades de nombres de largo muy distinto
- **THEN** todos los cuadros conservan el mismo tamaño, y el largo del nombre no afecta a ninguna columna

#### Scenario: La columna no muestra el nombre de su habilidad
- **WHEN** el Chapter Lead mira los encabezados de la matriz
- **THEN** no encuentra el nombre de cada habilidad escrito ahí, y llega a él abriendo cualquiera de sus celdas

#### Scenario: Persona sin evaluar
- **WHEN** una persona del chapter no tiene evaluación cerrada
- **THEN** su fila aparece con las celdas sin dato y marcada como pendiente de evaluar, sin contar brechas

#### Scenario: La leyenda está a la vista
- **WHEN** el Chapter Lead mira la matriz
- **THEN** encuentra junto a ella qué significa cada color, sin tener que abrir una celda para deducirlo

#### Scenario: Span sin evaluaciones
- **WHEN** ninguna persona tiene evaluación cerrada todavía
- **THEN** la pantalla muestra un estado vacío que invita a evaluar, en vez de una matriz en blanco

### Requirement: Brecha marcada contra el rol de cada persona
Una celda SHALL marcarse como brecha cuando el nivel evaluado queda por debajo del que pide el rol de **esa** persona en **esa** habilidad. El sistema SHALL comparar persona por persona contra su propio rol y SHALL NOT usar un umbral único por habilidad: en un mismo span conviven roles que exigen niveles distintos.

La intensidad del color SHALL crecer con la cantidad de niveles que faltan, usando la escala de atención del sistema de diseño, de modo que el caso más grave del span se distinga del que está a un paso sin tener que leer una cifra.

Los tres casos que **no** son brecha SHALL distinguirse entre sí y SHALL NOT llevar color de la escala de atención: estar al nivel o por encima, no tener nivel declarado para ese rol, y no tener evaluación cerrada son hechos distintos, y pintarlos todos igual —o pintarlos con color— haría que lo que sí pide atención dejara de destacar.

Estar por encima de lo que el rol pide SHALL NOT representarse con un color propio en la matriz; el sistema SHALL informarlo en el detalle de la celda.

#### Scenario: Dos roles, dos exigencias
- **WHEN** dos personas están en Competente en la misma habilidad y sus roles piden Competente y Avanzado respectivamente
- **THEN** la primera celda no lleva color de atención y la segunda sí

#### Scenario: La intensidad crece con la brecha
- **WHEN** una persona está a un nivel de lo que su rol pide y otra a tres
- **THEN** la segunda celda se ve más intensa que la primera, y la diferencia se percibe sin leer ninguna cifra

#### Scenario: Rol sin nivel declarado
- **WHEN** el rol de una persona no tiene nivel declarado en una habilidad
- **THEN** su celda se distingue tanto de una celda al nivel como de una sin evaluar, y no cuenta como brecha

#### Scenario: Al nivel o por encima
- **WHEN** el nivel evaluado alcanza o supera el que pide el rol
- **THEN** la celda no lleva color de atención, y estar por encima no genera ninguna alerta en la matriz

## ADDED Requirements

### Requirement: Detalle de una celda
Al activar una celda de la matriz, el sistema SHALL mostrar un panel anclado a esa celda con el detalle que el mapa no puede mostrar, sin sacar al Chapter Lead de la matriz ni perder su desplazamiento.

El panel SHALL mostrar de quién es la celda y cuándo se cerró su evaluación, el nivel alcanzado junto al que su rol pide, y —cuando hay brecha— los criterios del nivel exigido que quedaron sin marcar en esa evaluación. El panel SHALL indicar además **cuántas personas del span tienen brecha en esa misma habilidad**, y si ya existe una acción del plan sobre esa brecha o si está sin plan.

El panel SHALL nombrar la habilidad de la celda —es donde se dice de qué columna se trata— y SHALL ofrecer el camino al plan de esa persona y al detalle de esa habilidad. SHALL cerrarse con la tecla Escape o al activar fuera de él, y SHALL poder abrirse con teclado, no sólo con el mouse.

Una celda sin brecha SHALL abrir el panel igualmente, indicando que está al nivel y, cuando corresponde, que está por encima del que su rol pide. Una celda sin evaluación cerrada SHALL abrir un panel que lo diga y ofrezca evaluar a esa persona.

#### Scenario: Abrir una celda con brecha
- **WHEN** el Chapter Lead activa una celda marcada
- **THEN** ve de quién es, el nivel alcanzado contra el exigido, los criterios que le faltan de esa evaluación, cuántas personas más del span tienen brecha en esa habilidad, y qué acción del plan existe

#### Scenario: Abrir una celda sin brecha
- **WHEN** activa una celda que está al nivel o por encima
- **THEN** el panel lo dice, e indica cuando la persona supera lo que su rol pide

#### Scenario: Abrir una celda sin evaluar
- **WHEN** activa una celda de una persona sin evaluación cerrada
- **THEN** el panel lo indica y ofrece evaluarla, en vez de mostrar un detalle vacío

#### Scenario: Volver a la matriz sin perder el lugar
- **WHEN** cierra el panel con Escape o activando fuera de él
- **THEN** vuelve a la matriz en la misma posición de desplazamiento en que estaba

#### Scenario: Abrir con teclado
- **WHEN** recorre la matriz con el teclado y activa una celda
- **THEN** el panel se abre y su contenido queda accesible sin usar el mouse
