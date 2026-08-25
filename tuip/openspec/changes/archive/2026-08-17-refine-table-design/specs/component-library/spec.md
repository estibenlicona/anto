## MODIFIED Requirements

### Requirement: Convención de alineación y datos ausentes en Table
Table SHALL ofrecer una alineación por columna, `left` o `right`, aplicable tanto a la cabecera como a las celdas, donde `right` alinea el contenido a la derecha y lo renderiza con cifras tabulares, con `left` como valor por defecto. La documentación de Table SHALL indicar que el texto se alinea a la izquierda, las columnas numéricas se alinean a la derecha con cifras tabulares, y un dato ausente se representa con el carácter "—" en vez de dejar la celda vacía.

#### Scenario: Consultar la convención de alineación
- **WHEN** alguien arma una tabla con una columna de valores numéricos
- **THEN** la documentación de Table indica que esa columna debe alinearse a la derecha con cifras tabulares, a diferencia de las columnas de texto

#### Scenario: Alinear una columna numérica a la derecha
- **WHEN** la cabecera y las celdas de una columna reciben la alineación `right`
- **THEN** su contenido se alinea a la derecha y sus dígitos se renderizan con cifras tabulares, de modo que las cifras de filas distintas quedan en columna

#### Scenario: Alineación por defecto
- **WHEN** una cabecera o una celda no recibe una alineación explícita
- **THEN** su contenido se alinea a la izquierda, igual que antes de este requisito

### Requirement: Estructura del componente Table
El componente Table SHALL presentar datos tabulares mediante elementos HTML nativos de tabla (`table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`), expuestos como el conjunto compuesto `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` y `TableCell`. Table SHALL aceptar un modo opcional que omite su propio borde y esquinas redondeadas, para cuando ya está dentro de un contenedor con borde propio; por defecto Table dibuja ese borde. La última fila del cuerpo no SHALL dibujar una línea inferior.

#### Scenario: Semántica de tabla accesible a tecnologías de asistencia
- **WHEN** una tecnología de asistencia recorre una tabla construida con estos componentes
- **THEN** anuncia la estructura de filas y columnas usando la semántica nativa de tabla, sin roles ARIA agregados a mano

#### Scenario: Composición de las partes de la tabla
- **WHEN** se arma una tabla con `TableHeader`, `TableBody` y, opcionalmente, `TableFooter` dentro de `Table`
- **THEN** cada parte se renderiza con el elemento HTML de tabla que le corresponde, preservando el orden de cabecera, cuerpo y pie

#### Scenario: Tabla dentro de un contenedor con borde
- **WHEN** una Table se coloca dentro de un contenedor que ya tiene borde propio, como una Card, y se activa el modo sin borde
- **THEN** la tabla se integra a ras del contenedor, sin dibujar un segundo borde ni esquinas redondeadas dentro del borde del contenedor

#### Scenario: Tabla suelta en la página
- **WHEN** una Table se usa sin activar el modo sin borde
- **THEN** dibuja su propio borde y esquinas redondeadas, igual que antes de este requisito

#### Scenario: Última fila sin línea inferior
- **WHEN** se renderiza la última fila del cuerpo de una tabla
- **THEN** no dibuja una línea inferior, de modo que no se duplica contra el borde del contenedor que la rodea

### Requirement: Cabeceras ordenables de Table
TableHead SHALL presentar sus etiquetas de columna con el estilo tipográfico que el sistema define para rótulos de columna, SHALL soportar un indicador de dirección de orden y SHALL volverse interactiva y anunciar su estado de orden a tecnologías de asistencia cuando el consumidor le pasa un manejador de orden, delegando en el consumidor el ordenamiento real de los datos.

#### Scenario: Activar el orden desde la cabecera
- **WHEN** una TableHead recibe un manejador de orden y un usuario la activa con mouse o teclado
- **THEN** TableHead invoca el manejador, sin reordenar los datos por sí misma

#### Scenario: Anunciar la dirección de orden
- **WHEN** una TableHead tiene una dirección de orden activa
- **THEN** expone esa dirección mediante el atributo de tabla estándar para orden, de modo que una tecnología de asistencia la anuncie

#### Scenario: Estilo del rótulo de columna
- **WHEN** se renderiza una TableHead, sea ordenable o no
- **THEN** su etiqueta usa el estilo tipográfico de rótulo del sistema, distinto del estilo del contenido de las celdas, de modo que la cabecera se distingue del cuerpo por tipografía y no solo por color de fondo
