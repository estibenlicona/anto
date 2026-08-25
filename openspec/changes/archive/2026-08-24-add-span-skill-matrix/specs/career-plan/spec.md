## ADDED Requirements

### Requirement: Matriz de capacidades y habilidades del span
El sistema SHALL ofrecer al Chapter Lead una pantalla de Plan de carrera en `/app/lead/plan-carrera` con una matriz del span: una fila por persona del chapter y una columna por habilidad activa del catálogo, agrupadas las columnas en técnicas y humanas. El breadcrumb SHALL ser "Plan de carrera".

Cada celda SHALL mostrar el nivel evaluado de esa persona en esa habilidad con el medidor de cuatro pasos de la escala Tuya. Una persona sin evaluación cerrada SHALL mostrar sus celdas sin dato —nunca un cero ni un nivel supuesto— y quedar señalada como pendiente de evaluar.

#### Scenario: Entrar a la matriz
- **WHEN** el Chapter Lead abre `/app/lead/plan-carrera`
- **THEN** ve una fila por persona a cargo y una columna por habilidad activa, con el nivel de cada quien en cada una

#### Scenario: Persona sin evaluar
- **WHEN** una persona del chapter no tiene evaluación cerrada
- **THEN** su fila aparece con las celdas sin dato y marcada como pendiente de evaluar, sin contar brechas

#### Scenario: Span sin evaluaciones
- **WHEN** ninguna persona tiene evaluación cerrada todavía
- **THEN** la pantalla muestra un estado vacío que invita a evaluar, en vez de una matriz en blanco

### Requirement: Brecha marcada contra el rol de cada persona
Una celda SHALL marcarse como brecha cuando el nivel evaluado queda por debajo del que pide el rol de **esa** persona en **esa** habilidad, e indicar cuántos niveles le faltan. El sistema SHALL comparar persona por persona contra su propio rol y SHALL NOT usar un umbral único por habilidad: en un mismo span conviven roles que exigen niveles distintos.

Cuando el rol de una persona no tiene nivel declarado en una habilidad, esa celda SHALL mostrar el nivel evaluado sin marcar brecha.

#### Scenario: Dos roles, dos exigencias
- **WHEN** dos personas están en Competente en la misma habilidad y sus roles piden Competente y Avanzado respectivamente
- **THEN** la primera celda no se marca y la segunda sí, indicando que le falta un nivel

#### Scenario: Rol sin nivel declarado
- **WHEN** el rol de una persona no tiene nivel declarado en una habilidad
- **THEN** su celda muestra el nivel evaluado y no cuenta como brecha

#### Scenario: Al nivel o por encima
- **WHEN** el nivel evaluado alcanza o supera el que pide el rol
- **THEN** la celda no se marca, y estar por encima no genera ninguna alerta

### Requirement: Totales por habilidad y por persona
La matriz SHALL cerrar cada columna con cuántas personas tienen brecha en esa habilidad, cada fila con cuántas brechas tiene esa persona, y SHALL mostrar el total de brechas del span. Los totales SHALL contar sólo personas con evaluación cerrada.

#### Scenario: Leer una columna
- **WHEN** el Chapter Lead mira el pie de una columna
- **THEN** ve cuántas personas del span quedan por debajo de lo que su rol pide en esa habilidad

#### Scenario: Leer una fila
- **WHEN** mira el extremo de una fila
- **THEN** ve cuántas brechas acumula esa persona en total

#### Scenario: Los pendientes no inflan ni desinflan
- **WHEN** hay personas sin evaluar
- **THEN** no suman ni restan a ningún total, y la pantalla informa cuántas están pendientes

### Requirement: Recorrer la matriz cuando no entra en pantalla
La columna de persona SHALL quedar fija mientras la matriz se desplaza a lo ancho, de modo que ninguna celda quede sin saber a quién pertenece. El sistema SHALL permitir acotar qué habilidades se muestran —por grupo o eligiéndolas— y ordenar las filas y las columnas por cantidad de brechas, para que lo más crítico quede primero.

#### Scenario: Desplazar a lo ancho
- **WHEN** las habilidades no entran en el ancho de la pantalla y el usuario se desplaza
- **THEN** la columna de persona permanece visible y el resto se desplaza por debajo

#### Scenario: Acotar habilidades
- **WHEN** el Chapter Lead elige ver sólo las habilidades técnicas
- **THEN** la matriz muestra esas columnas y los totales se recalculan sobre lo visible

#### Scenario: Ordenar por brechas
- **WHEN** ordena filas y columnas por brechas
- **THEN** la persona con más brechas y la habilidad con más brechas quedan primero

### Requirement: Detalle de una habilidad
Al abrir una habilidad desde la matriz, el sistema SHALL mostrar un panel con las personas evaluadas agrupadas por el nivel que sacaron en esa habilidad, de menor a mayor. Dentro de cada nivel SHALL distinguir a quién está al nivel de quién tiene brecha, indicando en ese caso qué nivel pide su rol y cuántos le faltan, junto con el rol de cada persona.

El panel SHALL mostrar el reparto del span en esa habilidad y cuántas personas tienen brecha, y SHALL indicar cuántas quedan sin evaluar.

#### Scenario: Abrir una habilidad
- **WHEN** el Chapter Lead abre una habilidad desde la matriz
- **THEN** ve a las personas agrupadas por nivel, con su rol, y marcadas como al nivel o con brecha

#### Scenario: Mismo nivel, distinta situación
- **WHEN** dos personas comparten nivel pero sus roles piden niveles distintos
- **THEN** aparecen en el mismo grupo, una marcada al nivel y la otra con brecha

#### Scenario: Un nivel sin nadie
- **WHEN** ninguna persona quedó en un nivel
- **THEN** ese nivel aparece igual, indicando que no hay nadie, para que el reparto se lea completo
