## MODIFIED Requirements

### Requirement: Densidad de Table
Table SHALL aceptar una densidad opcional, `comfortable`, `compact` o `matrix`, que ajusta el alto de fila y el padding de celda de forma uniforme en todo el cuerpo de la tabla, con `comfortable` como valor por defecto. La cabecera SHALL usar su propio padding vertical, siempre más ajustado que el del cuerpo en la misma densidad, y SHALL seguir subiendo y bajando junto con el cuerpo al cambiar de densidad.

`matrix` SHALL ser el paso más ajustado de los tres y existe para la tabla cuyas celdas no llevan texto sino una pieza corta —un medidor, una cifra de un dígito—, donde el padding pensado para leer texto separa tanto las columnas que la comparación entre filas se pierde. Ninguna densidad SHALL cambiar el contenido de las celdas ni su alineación.

#### Scenario: Cambiar a densidad compacta
- **WHEN** Table recibe `density="compact"`
- **THEN** todas sus filas y celdas reducen su padding vertical de manera uniforme, sin afectar el contenido de las celdas

#### Scenario: Densidad por defecto
- **WHEN** Table no recibe una densidad explícita
- **THEN** se comporta exactamente igual que antes de este requisito, con el espaciado `comfortable` que ya tenía

#### Scenario: La cabecera es más baja que el cuerpo en cualquier densidad
- **WHEN** Table recibe cualquiera de las densidades
- **THEN** el padding vertical de la cabecera es menor que el de las celdas del cuerpo en esa misma densidad

#### Scenario: Densidad de matriz
- **WHEN** Table recibe `density="matrix"`
- **THEN** el padding horizontal y vertical de sus celdas queda por debajo del de `compact`, de modo que muchas columnas de contenido corto entren sin separarse entre sí

### Requirement: Estructura del componente Table
El componente Table SHALL presentar datos tabulares mediante elementos HTML nativos de tabla (`table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`), expuestos como el conjunto compuesto `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` y `TableCell`. Table SHALL aceptar un modo opcional que omite su propio borde y esquinas redondeadas, para cuando ya está dentro de un contenedor con borde propio; por defecto Table dibuja ese borde. La última fila del cuerpo no SHALL dibujar una línea inferior.

Table SHALL aceptar además que su **primera columna quede fija** mientras el resto se desplaza horizontalmente dentro del contenedor de la tabla. La columna fija SHALL mantener su fondo propio —opaco, para que el contenido que pasa por debajo no se transparente— y SHALL dibujar una separación en su borde derecho **sólo cuando hay contenido oculto hacia la izquierda**, de modo que esa línea signifique "acá empieza lo que está congelado" y no se confunda con una línea más de la grilla. La celda fija de la cabecera SHALL quedar fija en el mismo eje que las del cuerpo.

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

#### Scenario: La primera columna acompaña el desplazamiento
- **WHEN** una tabla con la primera columna fija se desplaza horizontalmente
- **THEN** esa columna queda a la vista sobre el resto del contenido, con su fondo opaco, y las demás columnas pasan por debajo

#### Scenario: La separación aparece sólo al haber contenido oculto
- **WHEN** la tabla está en su posición inicial, sin nada oculto hacia la izquierda
- **THEN** la columna fija no dibuja separación en su borde derecho; al desplazarse, la separación aparece

#### Scenario: La tabla sin columna fija no cambia
- **WHEN** una Table no activa la columna fija
- **THEN** se comporta exactamente igual que antes de este requisito, incluido su desplazamiento horizontal

## ADDED Requirements

### Requirement: Fila con detalle desplegable de Table
`TableRow` SHALL aceptar un detalle desplegable: un control de apertura al inicio de la fila y un bloque de contenido que se muestra debajo de ella. El detalle SHALL renderizarse como una fila propia de la tabla que ocupa todo el ancho, de modo que la semántica nativa se conserve y ninguna tecnología de asistencia reciba una estructura de tabla rota.

El control de apertura SHALL anunciar su estado y a qué fila pertenece, y SHALL operarse con teclado igual que cualquier otro control del sistema. La fila SHALL poder usarse controlada por el consumidor —quién está abierto es estado de la pantalla— y el componente no SHALL decidir por su cuenta cerrar otras filas al abrir una. Una tabla sin filas desplegables no SHALL reservar la columna del control.

#### Scenario: Abrir el detalle de una fila
- **WHEN** el usuario activa el control de apertura de una fila desplegable
- **THEN** el contenido del detalle aparece como una fila debajo, ocupando todo el ancho de la tabla, y el control anuncia que quedó abierto

#### Scenario: Varias filas abiertas a la vez
- **WHEN** el consumidor mantiene abiertas dos filas al mismo tiempo
- **THEN** ambas muestran su detalle, porque el componente no cierra ninguna por su cuenta

#### Scenario: El detalle no rompe la tabla
- **WHEN** una tecnología de asistencia recorre una tabla con detalles abiertos
- **THEN** encuentra filas y celdas válidas, con el detalle asociado a la fila que lo abrió

#### Scenario: Tabla sin filas desplegables
- **WHEN** ninguna fila de la tabla declara detalle
- **THEN** la tabla no reserva ninguna columna para el control de apertura
