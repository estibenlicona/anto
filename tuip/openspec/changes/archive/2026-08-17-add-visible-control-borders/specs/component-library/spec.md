## MODIFIED Requirements

### Requirement: Opciones del componente Button
El componente Button SHALL ofrecer variantes de énfasis (acción primaria, secundaria, sutil, destructiva y de tipo enlace), al menos tres tamaños, la posibilidad de acompañar la etiqueta con un ícono antes o después, y un estado de carga que impida activar la acción mientras está en curso. Las variantes de relleno sólido SHALL declarar su zona activa por su fondo. La variante secundaria SHALL llevar un trazo que insinúe su límite en reposo. Las variantes sutil y de tipo enlace SHALL permanecer sin borde: su ausencia de caja es lo que las distingue de la secundaria. Todas las variantes SHALL ocupar la misma caja a igual tamaño, de modo que se alineen al combinarse. El anillo de foco SHALL dibujarse contra el borde del control, sin separación intermedia, y en un tono derivado del color base de la variante que lo muestra.

#### Scenario: Variante destructiva
- **WHEN** se usa la variante destructiva de Button
- **THEN** el botón se presenta con los colores del rol `danger` del sistema de diseño, incluidos sus estados de interacción

#### Scenario: Tamaños
- **WHEN** se usa Button en un tamaño distinto del predeterminado
- **THEN** cambian su altura, su espaciado interno y su tamaño de texto de forma proporcionada, sin alterar sus colores ni su variante

#### Scenario: Botón con ícono
- **WHEN** se pasa un ícono junto a la etiqueta del botón
- **THEN** el ícono se renderiza alineado con el texto, con separación consistente, y se oculta a las tecnologías de asistencia por ser decorativo

#### Scenario: Botón en estado de carga
- **WHEN** el botón está en estado de carga
- **THEN** muestra un indicador de progreso, no dispara eventos de click, y su estado se comunica a las tecnologías de asistencia

#### Scenario: Botón sin etiqueta visible
- **WHEN** un botón contiene únicamente un ícono, sin texto visible
- **THEN** requiere un nombre accesible explícito para que su acción pueda anunciarse

#### Scenario: Variante secundaria en reposo
- **WHEN** se renderiza la variante secundaria de Button, sin hover ni foco
- **THEN** un trazo acompaña su contorno, insinuando dónde termina su zona activa

#### Scenario: Variantes sutil y de enlace sin borde
- **WHEN** se renderiza la variante sutil o la de tipo enlace
- **THEN** no lleva borde visible, porque su baja jerarquía es su propósito y una caja la equipararía con la secundaria

#### Scenario: Variante sólida sin contorno agregado
- **WHEN** se renderiza una variante de relleno sólido de Button
- **THEN** su límite queda declarado por el propio relleno, sin sumarle un contorno que lo rodee

#### Scenario: Las variantes se alinean entre sí
- **WHEN** se combinan variantes con y sin trazo visible en una misma fila, a igual tamaño
- **THEN** todas presentan la misma altura, sin que el trazo de una la desplace respecto de las demás

#### Scenario: El anillo de foco toma el tono de su variante
- **WHEN** una variante de Button recibe el foco por teclado
- **THEN** su anillo se dibuja en un tono derivado del color base de esa variante, no en un color ajeno al que la pinta

#### Scenario: El anillo de foco se apoya en el borde
- **WHEN** una variante de Button muestra su anillo de foco
- **THEN** el anillo arranca en el borde del control, sin una franja intermedia que lo separe, y el estado enfocado sigue siendo distinguible del estado en reposo

## ADDED Requirements

### Requirement: El foco de un control de formulario no se confunde con un error
Los controles destinados a capturar un valor —campos de texto, selectores, combos, campos de fecha, cargadores de archivo, casillas, opciones excluyentes, interruptores, deslizadores y controles segmentados— SHALL mostrar su anillo de foco en el tono neutro, y NO en el tono de marca. En este sistema el color de marca es un rojo de la misma familia que el color de error, así que un anillo de marca sobre un campo lo hace parecer un campo con problema: dos estados con significados opuestos quedarían dichos con el mismo color. El tono de error SHALL quedar reservado al control que efectivamente está en estado de error, de modo que el color siga distinguiendo un estado del otro.

#### Scenario: Campo enfocado sin error
- **WHEN** un control de formulario recibe el foco y no está en estado de error
- **THEN** su anillo se muestra en el tono neutro, sin sugerir que algo esté mal

#### Scenario: Campo enfocado con error
- **WHEN** un control de formulario en estado de error recibe el foco
- **THEN** su anillo se muestra en el tono de error, distinguible del anillo de un campo sin problema

### Requirement: Límite y elevación de la superficie Card
El componente Card SHALL delimitarse contra el lienzo por un trazo propio en su contorno, y SHALL comunicar su elevación con una sombra. Ambos cumplen funciones distintas y no se sustituyen entre sí: el trazo dice dónde termina la tarjeta, la sombra dice que está por encima del lienzo. La sombra SHALL leerse como proyectada desde arriba —claramente más presente por debajo de la tarjeta que por sus costados, y ausente por encima— y NO como un halo repartido alrededor del contorno. Las divisiones internas de Card —las que separan su encabezado y su pie del cuerpo— SHALL usar un trazo consistente con el del contorno, de modo que la tarjeta se lea como una sola pieza y no como una grilla de líneas de distinto peso.

#### Scenario: Card sobre el lienzo de la página
- **WHEN** se renderiza una Card sobre el lienzo de la página
- **THEN** su contorno la delimita y su sombra la eleva, cada uno cumpliendo su propia función

#### Scenario: La sombra se proyecta, no rodea
- **WHEN** se comparan la extensión de la sombra por debajo de la tarjeta y por sus costados
- **THEN** la de abajo es notoriamente mayor, y por encima del borde superior no asoma sombra alguna

#### Scenario: Divisiones internas consistentes con el contorno
- **WHEN** una Card tiene encabezado o pie
- **THEN** el trazo que los separa del cuerpo es consistente con el del contorno, sin introducir un salto de peso dentro de la misma pieza
