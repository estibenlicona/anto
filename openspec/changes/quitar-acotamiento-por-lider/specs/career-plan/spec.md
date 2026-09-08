## RENAMED Requirements

- FROM: `### Requirement: Habilidades que concentran la brecha del chapter`
- TO: `### Requirement: Habilidades que concentran la brecha`

- FROM: `### Requirement: Pendientes de gestión del chapter`
- TO: `### Requirement: Pendientes de gestión`

## MODIFIED Requirements

### Requirement: Matriz de capacidades y habilidades del span
El sistema SHALL ofrecer al Chapter Lead una pantalla de **Competencias** en `/app/lead/competencias` con una matriz del span: una fila por **cada persona registrada** y una columna por habilidad activa del catálogo, agrupadas las columnas en técnicas y humanas. El breadcrumb SHALL ser "Competencias".

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
- **WHEN** una persona no tiene evaluación cerrada
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

### Requirement: Indicadores del span
La pantalla de Competencias SHALL encabezarse con cuatro indicadores sobre el span completo —no sobre el recorte de habilidades ni el orden que el Chapter Lead tenga puesto—, porque son la lectura de situación con la que se entra a la pantalla:

- **Brechas críticas**: cuántas brechas son de dos niveles o más, sobre el total de brechas abiertas. El indicador SHALL explicar que son las que no se cierran con la operación diaria.
- **Cobertura de evaluación**: qué porcentaje de las personas registradas tiene evaluación cerrada, con las dos cifras que forman ese porcentaje, y SHALL aclarar que las no evaluadas quedan fuera de los totales.
- **Variación contra el ciclo anterior**: cuántas brechas se abrieron o se cerraron respecto del ciclo previo, con el signo a la vista y la serie de los últimos ciclos. Una baja SHALL leerse como mejora y una subida como deterioro, sin que el usuario tenga que interpretar el signo.
- **Personas en riesgo**: cuántas acumulan tres brechas o más respecto de lo que su cargo pide, identificadas con sus avatares y con el camino a verlas todas.

Las cifras SHALL calcularse sobre personas con evaluación cerrada. Cuando no hay ciclo anterior con el que comparar, el indicador de variación SHALL decirlo en lugar de mostrar un cero, que se leería como "no cambió nada".

#### Scenario: Leer la situación de un vistazo
- **WHEN** el Chapter Lead abre Competencias
- **THEN** ve las brechas críticas sobre el total, la cobertura de evaluación, la variación contra el ciclo anterior y cuántas personas están en riesgo

#### Scenario: Los indicadores no siguen al filtro
- **WHEN** el Chapter Lead deja a la vista sólo las habilidades técnicas
- **THEN** los indicadores siguen hablando del span completo, porque son la situación completa y no la de la vista

#### Scenario: Primer ciclo
- **WHEN** no existe un ciclo anterior cerrado con el que comparar
- **THEN** el indicador de variación lo dice, en vez de mostrar una variación de cero

#### Scenario: Nadie en riesgo
- **WHEN** ninguna persona acumula tres brechas o más
- **THEN** el indicador lo dice sin avatares, y no desaparece de la fila

### Requirement: Habilidades que concentran la brecha
La pantalla SHALL mostrar las habilidades donde se acumula la mayor brecha del span, ordenadas por cuánto pesan, y para cada una cuántas personas tienen brecha y qué nivel se les pide. El peso SHALL considerar el tamaño de las brechas y no sólo cuántas son: tres personas a un nivel y tres a tres niveles no son el mismo problema.

Este bloque SHALL presentarse como una lectura **del conjunto**, explícitamente distinta de la de una persona, y SHALL NOT mostrarse cuando el span no tiene ninguna brecha abierta.

#### Scenario: Ver dónde duele
- **WHEN** el Chapter Lead mira la columna de apoyo
- **THEN** ve las habilidades con más brecha acumulada, cuántas personas la tienen y el nivel requerido, presentado como dato del conjunto

#### Scenario: El tamaño pesa
- **WHEN** una habilidad tiene tres brechas de un nivel y otra tres de tres niveles
- **THEN** la segunda aparece por delante

#### Scenario: Span sin brechas
- **WHEN** ninguna persona del span tiene brecha abierta
- **THEN** el bloque no se muestra, en vez de aparecer vacío

### Requirement: Pendientes de gestión
La pantalla SHALL mostrar lo que quedó pendiente de gestionar en el módulo, con su cantidad y el camino para atenderlo: evaluaciones sin cerrar, acciones del plan cuyo compromiso ya venció, cargos sin nivel declarado y brechas que no tienen ninguna acción registrada.

Cada cantidad SHALL venir calculada sobre el conjunto completo, y el sistema SHALL NOT obtenerla pidiendo el plan de cada persona por separado: la pantalla se abre con una lectura del span, no con una petición por integrante.

Un pendiente en cero SHALL mostrarse igual, para que la lista se lea siempre completa y su ausencia no se confunda con no haberlo mirado.

#### Scenario: Ver los pendientes
- **WHEN** el Chapter Lead mira la columna de apoyo
- **THEN** ve cuántas evaluaciones están sin cerrar, cuántos planes vencieron, cuántos cargos no declaran nivel y cuántas brechas están sin plan

#### Scenario: Un pendiente en cero
- **WHEN** no hay ningún plan vencido
- **THEN** la fila aparece con cero, no desaparece de la lista

#### Scenario: Una sola lectura
- **WHEN** la pantalla carga los pendientes
- **THEN** las cifras llegan resueltas del lado del dato, sin una petición por cada persona
