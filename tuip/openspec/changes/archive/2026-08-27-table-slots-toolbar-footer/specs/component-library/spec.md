## MODIFIED Requirements

### Requirement: Estructura del componente Table
El componente Table SHALL presentar datos tabulares mediante elementos HTML nativos de tabla (`table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`), expuestos como el conjunto compuesto `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` y `TableCell`. Table SHALL aceptar un modo opcional que omite su propio borde y esquinas redondeadas, para cuando ya está dentro de un contenedor con borde propio; por defecto Table dibuja ese borde. La última fila del cuerpo no SHALL dibujar una línea inferior.

Table SHALL aceptar además que su **primera columna quede fija** mientras el resto se desplaza horizontalmente dentro del contenedor de la tabla. La columna fija SHALL mantener su fondo propio —opaco, para que el contenido que pasa por debajo no se transparente— y SHALL dibujar una separación en su borde derecho **sólo cuando hay contenido oculto hacia la izquierda**, de modo que esa línea signifique "acá empieza lo que está congelado" y no se confunda con una línea más de la grilla. La celda fija de la cabecera SHALL quedar fija en el mismo eje que las del cuerpo.

Table SHALL aceptar dos **slots opcionales de contenido arbitrario**: una **barra** que se muestra encima de la cabecera y un **pie** que se muestra debajo del cuerpo. Son zonas de composición: Table no interpreta lo que recibe (búsqueda, filtros, acciones, paginación o cualquier otro elemento son decisión del consumidor). Cuando al menos uno de los dos está presente, Table SHALL dibujar **un único marco** —el mismo borde y esquinas que hoy dibuja alrededor de la tabla— que envuelva barra, tabla y pie como una sola superficie, con una línea que separe cada slot de la tabla. Los slots SHALL quedar **fuera de la zona de desplazamiento horizontal**, de modo que no se desplacen con las columnas ni queden recortados por ella. El modo sin borde SHALL aplicar al marco completo. Sin slots, Table SHALL renderizar exactamente lo mismo que antes de este requisito: el marco empieza en la cabecera.

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

#### Scenario: Barra y pie dentro de un solo marco
- **WHEN** una Table recibe contenido en la barra, en el pie o en ambos
- **THEN** ese contenido se muestra en su zona —la barra encima de la cabecera, el pie debajo del cuerpo— y un único borde con esquinas redondeadas envuelve barra, tabla y pie, con una línea entre cada slot y la tabla

#### Scenario: Los slots no se desplazan con las columnas
- **WHEN** una tabla con barra o pie es más ancha que su contenedor y se desplaza horizontalmente
- **THEN** la barra y el pie permanecen en su lugar, visibles completos, y sólo las columnas se desplazan

#### Scenario: Slots dentro de un contenedor con borde
- **WHEN** una Table con barra o pie activa el modo sin borde dentro de una Card
- **THEN** barra, tabla y pie se integran a ras de la Card sin dibujar un segundo borde ni esquinas propias

#### Scenario: Sin slots nada cambia
- **WHEN** una Table no recibe ni barra ni pie
- **THEN** su estructura y su estilo son exactamente los de antes de este requisito: el marco arranca en la cabecera y no aparece ninguna zona vacía

#### Scenario: Columna fija con slots
- **WHEN** una Table con barra o pie activa la primera columna fija
- **THEN** la columna se comporta igual que sin slots: queda anclada al desplazarse y su separación aparece sólo con contenido oculto a la izquierda
