## Purpose

Provee el catálogo de componentes React de UI de Tuya UI (Button, Input, Card, Badge, Select, Combobox), construidos sobre los design tokens de marca, listos para ser copiados a proyectos consumidores mediante el CLI.
## Requirements
### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Textarea, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, OptionCard, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, AppShell, Accordion, Popover, CommandPalette, Link, Kbd, CapacityBar, DistributionCard y Meter.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Textarea, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, OptionCard, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, AppShell, Accordion, Popover, CommandPalette, Link, Kbd, CapacityBar, DistributionCard y Meter aparecen como componentes instalables

### Requirement: Componentes basados en design tokens
Cada componente SHALL usar exclusivamente los design tokens de Tuya CA (vía clases de Tailwind o CSS Variables) para color, tipografía, espaciado, radio y sombra — sin valores de estilo embebidos que no provengan de un token.

El cumplimiento SHALL verificarse de forma automática y NO SHALL quedar librado a la revisión manual: la verificación SHALL fallar el build cuando el código de un componente contenga un valor de color literal en vez del token equivalente. La verificación SHALL alcanzar al código y no a los comentarios, de modo que una explicación pueda seguir citando el valor concreto de un token sin que eso se confunda con usarlo.

#### Scenario: Cambio de token de marca se refleja en el componente
- **WHEN** un token de color usado por Button cambia de valor
- **THEN** el Button renderizado refleja el nuevo color sin modificar el código del componente

#### Scenario: Un color literal falla el build
- **WHEN** el código de un componente introduce un valor de color literal donde existe un token equivalente
- **THEN** la verificación automática falla y reporta el archivo y la línea donde aparece

#### Scenario: Un comentario puede citar el valor de un token
- **WHEN** un comentario del código de un componente menciona el valor concreto de un token para explicar una decisión
- **THEN** la verificación automática pasa, porque ese valor no participa del estilo renderizado

### Requirement: Variantes y estados de componente
Cada componente SHALL soportar al menos una variante visual (ej. primario/secundario) y SHALL usar los tokens semánticos de estado de interacción (`hover`, `pressed`, `disabled`, `focus`) del sistema de diseño para sus estados, en vez de valores de color definidos de forma independiente por componente.

El estado de interacción SHALL incluir el **cursor**, no sólo el color: todo elemento accionable con el puntero SHALL mostrar el cursor de puntero al pasar por encima, y todo elemento deshabilitado SHALL mostrar el de no permitido. El cursor es la señal con la que el puntero distingue lo accionable de lo que sólo se lee; sin ella, un botón se ve igual que un párrafo hasta que el usuario lo prueba.

Esta condición SHALL sostenerse desde la base de estilos del paquete y NO SHALL depender de que cada componente la declare por su cuenta: el catálogo la dio por sentada mientras el framework la traía, y cuando dejó de traerla se perdió en la mitad de los componentes sin que nada fallara. Un componente nuevo SHALL heredarla sin tener que acordarse de ella.

#### Scenario: El cursor distingue lo accionable
- **WHEN** un usuario pasa el puntero sobre un Button, un Chip accionable, una cabecera ordenable de Table o el cierre de un Modal
- **THEN** ve el cursor de puntero en todos, sin que ninguno dependa de una clase propia para tenerlo

#### Scenario: Lo deshabilitado no invita a hacer clic
- **WHEN** un usuario pasa el puntero sobre un control deshabilitado
- **THEN** ve el cursor de no permitido, nunca el de puntero

#### Scenario: Un componente nuevo hereda el cursor
- **WHEN** se agrega al catálogo un componente accionable que no declara ninguna clase de cursor
- **THEN** muestra igual el cursor de puntero, porque la base del paquete lo provee

#### Scenario: Estado deshabilitado de Button
- **WHEN** el componente Button recibe la propiedad de deshabilitado
- **THEN** el componente se renderiza con estilo deshabilitado y no dispara eventos de click

#### Scenario: Estado hover usa tokens de interacción
- **WHEN** un usuario pasa el cursor sobre un Button de variante primaria
- **THEN** el color de fondo cambia al token de estado `hover` correspondiente al rol `brand`, no a un valor de color propio del componente

### Requirement: Accesibilidad básica
Cada componente SHALL cumplir con prácticas básicas de accesibilidad: roles ARIA correctos, navegación por teclado y foco visible.

#### Scenario: Navegación por teclado en Input
- **WHEN** un usuario navega el formulario usando la tecla Tab
- **THEN** el componente Input recibe el foco visualmente indicado y es operable desde el teclado

### Requirement: Props públicas documentadas
Cada componente SHALL declarar sus props públicas mediante tipos explícitos, y cada prop propia del componente SHALL llevar una descripción legible por herramientas de generación de documentación, de modo que la documentación de API pueda derivarse del código sin escritura manual.

#### Scenario: Descripción disponible para la documentación
- **WHEN** una herramienta lee las definiciones de tipos de un componente para generar su documentación de API
- **THEN** obtiene, por cada prop propia del componente, su nombre, su tipo, si es requerida y su descripción

#### Scenario: Componente nuevo agregado al catálogo
- **WHEN** se agrega un componente nuevo al catálogo
- **THEN** sus props públicas quedan declaradas con tipos explícitos y descritas, igual que las de los componentes ya existentes

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

### Requirement: La superficie del Sidebar se distingue del lienzo
El Sidebar SHALL presentarse sobre una superficie propia, distinta de la del lienzo de la página que sostiene el contenido, de modo que la navegación y el área de trabajo se lean como dos planos y no como uno partido por un filete. Esa superficie SHALL ser la misma que usa la barra superior en su variante clara, para que el shell se lea como una sola pieza en vez de como dos zonas con criterios distintos.

#### Scenario: Sidebar y contenido son dos planos
- **WHEN** se renderiza el Sidebar junto al área de contenido
- **THEN** cada uno se apoya en una superficie distinta, sin depender únicamente del filete que los separa para diferenciarse

#### Scenario: El shell comparte una superficie
- **WHEN** se comparan la barra superior en su variante clara y el Sidebar
- **THEN** ambos usan la misma superficie, de modo que la navegación se lea como una sola pieza

### Requirement: Componentes distribuidos como paquete publicado
El sistema SHALL distribuir el catálogo completo de componentes como parte de `@tuya-ui/components`, un paquete npm compilado y versionado que el proyecto consumidor instala como dependencia de runtime. Un componente SHALL poder declarar dependencias de runtime de terceros más allá de React, siempre que se distribuyan como paquetes de npm que el consumidor instala, y no como código que el paquete genera u oculta.

#### Scenario: Instalar el paquete trae el componente listo para usar
- **WHEN** un consumidor instala `@tuya-ui/components` e importa el componente Card
- **THEN** obtiene el componente compilado y tipado, sin que su código fuente se copie ni se agregue como archivo al repositorio del consumidor

#### Scenario: Actualizar el paquete actualiza el componente
- **WHEN** se publica una corrección de un componente y el consumidor actualiza la versión instalada de `@tuya-ui/components`
- **THEN** el componente actualizado se refleja en la aplicación del consumidor sin que el consumidor tenga que editar ningún archivo propio

#### Scenario: Un componente con dependencia de terceros
- **WHEN** `@tuya-ui/components` incluye un componente cuyo código importa una librería headless de terceros
- **THEN** esa librería se declara como dependencia del paquete y se instala automáticamente junto con `@tuya-ui/components`, sin que el consumidor deba instalarla ni conocerla por separado

#### Scenario: El código sigue siendo consultable como referencia
- **WHEN** un consumidor quiere entender cómo está implementado un componente
- **THEN** puede consultar su código fuente en el sitio de documentación, aunque ese código ya no se copie a su propio repositorio

### Requirement: Opciones del componente Badge
El componente Badge SHALL representar el estado de un elemento con forma cuadrada (no de píldora, para distinguirse de un control clicable como Chip) y SHALL admitir al menos las variantes semánticas `success`, `info`, `warning`, `danger`, `neutral` y `discovery`. Badge no SHALL usar el rol de color `brand` en ninguna de sus variantes.

Badge SHALL mostrar un punto de color junto al texto **por defecto**, y SHALL permitir omitirlo. El punto marca que lo que el badge dice es una condición del elemento —algo que está pasando y que puede dejar de pasar—; cuando lo que el badge lleva no es un estado sino una clasificación fija, como el nivel de una escala, el punto no agrega información y compite con el texto que ya la da. Omitirlo NO SHALL cambiar ninguna otra cosa del badge: conserva su forma, su variante y su relleno.

El punto NO SHALL ser nunca el único canal de la información: con punto o sin él, el texto del badge SHALL decir por sí solo lo que el badge clasifica.

#### Scenario: Forma cuadrada distinta de un control
- **WHEN** se renderiza un Badge junto a un Chip
- **THEN** el Badge se distingue del Chip por su forma (esquinas cuadradas en vez de píldora)

#### Scenario: Punto de color obligatorio
- **WHEN** se renderiza un Badge de cualquier variante sin pedir que se omita el punto
- **THEN** muestra un punto de color junto al texto: sigue sin poder desaparecer por descuido, y omitirlo exige pedirlo

#### Scenario: Badge sin punto
- **WHEN** un consumidor pide un Badge sin punto para clasificar algo que no es un estado
- **THEN** el badge se dibuja sin el punto y conserva su forma, su variante y su relleno

#### Scenario: Variante sin color de marca
- **WHEN** se consultan las variantes disponibles de Badge
- **THEN** ninguna usa el rol de color `brand`, de modo que un badge nunca se confunde con la acción primaria de la vista

#### Scenario: Estado no distinguible solo por color
- **WHEN** una persona con dificultad para distinguir colores encuentra un Badge, con punto o sin él
- **THEN** puede identificar lo que el badge dice por el texto, no solo por el color del punto o del fondo

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

### Requirement: Opciones del componente Select
El componente Select SHALL presentar una lista cerrada de opciones en un desplegable con semántica de listbox, navegable por teclado, y SHALL mostrar un estado de carga dentro del propio desplegable cuando sus opciones provienen de una fuente asíncrona, en vez de presentarse vacío mientras se resuelven.

#### Scenario: Elegir una opción por teclado
- **WHEN** un usuario abre el Select con el teclado y usa las flechas para recorrer las opciones
- **THEN** cada opción se resalta al recorrerla y Enter la confirma sin usar el mouse

#### Scenario: Opciones que llegan del backend
- **WHEN** un Select abre su desplegable mientras sus opciones todavía se están resolviendo
- **THEN** el desplegable muestra un estado de carga en vez de aparecer vacío o sin abrir

#### Scenario: Cerrar sin elegir
- **WHEN** un usuario abre el Select y presiona Escape
- **THEN** el desplegable se cierra sin cambiar la opción seleccionada, y el foco vuelve al control

### Requirement: Opciones del componente Combobox
El componente Combobox SHALL filtrar sus opciones a medida que el usuario escribe, SHALL permitir confirmar una opción de la lista filtrada por teclado, y SHALL admitir selección múltiple con las opciones elegidas visibles como elementos removibles dentro del propio campo.

#### Scenario: Filtrar mientras se escribe
- **WHEN** un usuario escribe en el Combobox
- **THEN** la lista de opciones se reduce a las que coinciden con el texto escrito, sin exigir una coincidencia exacta

#### Scenario: Selección múltiple visible en el campo
- **WHEN** un usuario elige más de una opción en un Combobox de selección múltiple
- **THEN** cada opción elegida aparece como un elemento dentro del campo, removible sin reabrir la lista

#### Scenario: Sin resultados
- **WHEN** el texto escrito no coincide con ninguna opción
- **THEN** el Combobox lo indica explícitamente en vez de mostrar una lista vacía sin explicación

### Requirement: Umbral entre radios, Select y Combobox
La documentación SHALL orientar sobre cuál de los tres patrones de selección de opción única corresponde según el volumen de opciones: un grupo de radios para hasta seis, Select para entre siete y veinte, y Combobox para más de veinte.

#### Scenario: Consultar qué patrón corresponde
- **WHEN** alguien construye un formulario y necesita elegir entre radios, Select y Combobox para un campo con un número conocido de opciones
- **THEN** la documentación del componente le indica el umbral y por qué

### Requirement: Opciones del componente Checkbox
El componente Checkbox SHALL soportar los estados marcado, desmarcado e indeterminado, y SHALL comunicar el estado indeterminado a las tecnologías de asistencia además de representarlo visualmente.

El Checkbox SHALL dibujarse **cuadrado**, con un redondeo que a su tamaño real se lea como esquina redondeada y no como circunferencia. Es la convención más vieja de los formularios —cuadrado admite varios, redondo admite uno— y la forma es lo que se percibe antes de leer nada: un checkbox redondo dice que hay que elegir una sola opción cuando se pueden elegir todas.

El radio del Checkbox NO SHALL heredarse del que usan los controles grandes. Ese valor está pensado para botones y campos, que miden el doble o más; aplicado a una caja cuya mitad del lado es ese mismo número, deja de ser un redondeo y pasa a ser un círculo. Un token correcto usado a la escala equivocada produce una forma que miente.

#### Scenario: Alternar con teclado
- **WHEN** un usuario mueve el foco a un Checkbox y presiona Espacio
- **THEN** el estado alterna entre marcado y desmarcado, y el cambio se anuncia a las tecnologías de asistencia

#### Scenario: Estado indeterminado
- **WHEN** un Checkbox representa una selección parcial de un grupo (ni todos ni ninguno marcados)
- **THEN** se muestra en estado indeterminado, distinto visualmente de marcado y de desmarcado, y ese estado se expone a las tecnologías de asistencia

#### Scenario: La forma dice cuántos se pueden elegir
- **WHEN** un usuario mira una lista de casillas sin leer sus etiquetas
- **THEN** su forma cuadrada le dice que puede elegir más de una, sin depender de la marca de adentro ni de un texto que lo aclare

#### Scenario: Un Checkbox no se confunde con un radio
- **WHEN** se comparan un Checkbox y una opción de RadioGroup del mismo tamaño, ambos sin marcar
- **THEN** se distinguen por su contorno —uno cuadrado, el otro circular— y no sólo por lo que aparece dentro al seleccionarlos

### Requirement: Opciones del componente RadioGroup
El componente RadioGroup SHALL presentar un conjunto de opciones mutuamente excluyentes, de las cuales como máximo una SHALL estar seleccionada, con navegación por teclado entre las opciones del grupo. Sus opciones SHALL dibujarse **circulares**, que es la contraparte de la forma cuadrada del Checkbox: juntas, las dos formas dicen cuántas opciones admite el control antes de que alguien lea una etiqueta.

#### Scenario: Elegir una opción por teclado
- **WHEN** un usuario mueve el foco al grupo y usa las flechas
- **THEN** el foco y la selección se mueven juntos entre las opciones del grupo, sin necesitar Tab entre cada una

#### Scenario: Selección excluyente
- **WHEN** un usuario elige una opción del grupo que ya tenía otra seleccionada
- **THEN** la opción anterior se deselecciona automáticamente, de modo que nunca hay más de una elegida a la vez

### Requirement: Opciones del componente Switch
El componente Switch SHALL aplicar su cambio de estado de inmediato, sin requerir una acción de confirmación posterior, y SHALL exponerse a las tecnologías de asistencia con el rol de interruptor y no el de casilla de verificación. El track encendido SHALL usar el color de marca de fondo; el track apagado SHALL usar un gris neutro, sin ningún tinte de marca. El thumb SHALL ser blanco (`neutral-0`) en ambos estados. Un Switch deshabilitado SHALL verse igual esté marcado o no, con el mismo tratamiento visual de deshabilitado que el resto de los controles del catálogo, sin el color de marca del track encendido.

#### Scenario: El cambio se aplica al instante
- **WHEN** un usuario activa un Switch
- **THEN** el efecto de ese cambio ocurre de inmediato, sin esperar una acción de guardado

#### Scenario: Rol distinto del de Checkbox
- **WHEN** una tecnología de asistencia encuentra un Switch
- **THEN** lo anuncia con un rol de interruptor, distinguible del rol que usa Checkbox

#### Scenario: Color del track encendido
- **WHEN** un Switch está encendido
- **THEN** su track usa el color de marca de fondo

#### Scenario: Track apagado sin tinte de marca
- **WHEN** un Switch está apagado
- **THEN** su track usa un gris neutro, sin ningún tinte del color de marca

#### Scenario: Thumb blanco en ambos estados
- **WHEN** un Switch cambia entre encendido y apagado
- **THEN** su thumb permanece blanco (`neutral-0`) en los dos estados

#### Scenario: Deshabilitado no se confunde con habilitado
- **WHEN** un Switch marcado se deshabilita
- **THEN** su track y su thumb toman el tratamiento visual de deshabilitado, sin el color de marca que tendría el mismo Switch marcado y habilitado

### Requirement: Distinción de uso entre Checkbox y Switch
La documentación SHALL orientar sobre cuándo corresponde Switch y cuándo Checkbox, según si el cambio se aplica de inmediato o requiere una acción de guardado posterior.

#### Scenario: Consultar cuál corresponde
- **WHEN** alguien construye un formulario y duda entre Checkbox y Switch para un campo booleano
- **THEN** la documentación de cualquiera de los dos componentes le indica el criterio: si el cambio necesita un paso de guardado, es Checkbox; si aplica solo, es Switch

### Requirement: Opciones del componente Pagination
El componente Pagination SHALL presentar navegación entre páginas mediante controles anterior/siguiente y una lista de números de página, con puntos suspensivos cuando el total de páginas no cabe completo, y SHALL delegar en el consumidor la página actual y el cambio de página — no SHALL mantener estado propio ni texto de resumen de resultados.

#### Scenario: Cambiar de página
- **WHEN** un usuario hace clic en un número de página distinto del actual, o en el control de anterior/siguiente
- **THEN** Pagination notifica la página elegida al consumidor, sin cambiar su propia visualización hasta que el consumidor le pase la nueva página actual

#### Scenario: Rango largo de páginas
- **WHEN** el total de páginas es mayor al que cabe mostrado completo
- **THEN** Pagination muestra puntos suspensivos en lugar de la lista completa, conservando siempre visibles la primera, la última y la página actual

#### Scenario: Límites de navegación
- **WHEN** la página actual es la primera o la última
- **THEN** el control de anterior o de siguiente correspondiente se deshabilita

### Requirement: Opciones del componente Chip
El componente Chip SHALL tener dos modos excluyentes. En el modo removible SHALL mostrar una etiqueta de texto con un control para removerla, y SHALL notificar al consumidor cuando ese control se activa, sin removerse a sí mismo. En el modo seleccionable SHALL comportarse como un interruptor de filtro: el Chip entero es el control, SHALL exponer su estado con `aria-pressed`, SHALL notificar el cambio al consumidor sin cambiar por sí mismo, y encendido SHALL vestir el fondo neutro intenso con texto invertido — nunca el color de marca, porque un filtro activo no es la acción principal de la pantalla. El modo seleccionable SHALL admitir un contador opcional a la derecha de la etiqueta, en cifras tabulares, que forma parte del nombre accesible.

#### Scenario: Remover un chip
- **WHEN** un usuario activa el control de cierre de un Chip removible, con mouse o teclado
- **THEN** Chip notifica la remoción al consumidor, que decide si deja de renderizarlo

#### Scenario: Encender y apagar un chip seleccionable
- **WHEN** un usuario activa un Chip seleccionable apagado, con mouse o teclado
- **THEN** Chip notifica el nuevo estado al consumidor; al recibir `selected`, se pinta encendido y expone `aria-pressed="true"`; una nueva activación lo notifica apagado

#### Scenario: Chip con contador
- **WHEN** un Chip seleccionable recibe un contador
- **THEN** muestra la cifra a la derecha de la etiqueta, separada visualmente, y el nombre accesible incluye la etiqueta y la cifra

#### Scenario: Los dos modos no se mezclan
- **WHEN** un Chip recibe a la vez `onRemove` y `selectable`
- **THEN** el tipado lo rechaza: un Chip es removible o seleccionable, nunca ambos

### Requirement: Opciones del componente Alert
El componente Alert SHALL comunicar un mensaje dentro del flujo de la página, con una de cuatro severidades (`danger`, `warning`, `success`, `info`), SHALL mostrar un ícono correspondiente a la severidad que no dependa solo del color para distinguirse, y SHALL admitir un título opcional y una acción opcional.

#### Scenario: Ícono obligatorio por severidad
- **WHEN** se renderiza un Alert de cualquier severidad
- **THEN** muestra el ícono correspondiente a esa severidad, distinto para cada una de las cuatro

#### Scenario: Alert con acción
- **WHEN** un Alert recibe una acción
- **THEN** la acción se muestra dentro del propio Alert, sin necesitar que el usuario busque la respuesta en otro lugar de la pantalla

#### Scenario: Distinguible sin color
- **WHEN** una persona con dificultad para distinguir colores encuentra un Alert
- **THEN** puede identificar su severidad por el ícono y el texto, no solo por el color de fondo o del borde

### Requirement: Opciones del componente SegmentedControl
El componente SegmentedControl SHALL presentar un conjunto de opciones mutuamente excluyentes como botones contiguos, de las cuales exactamente una SHALL estar seleccionada en todo momento, navegable por teclado. Una opción SHALL poder representarse solo por un icono en vez de texto visible; en ese caso SHALL exponer un nombre accesible que describa la opción, ya que el icono no SHALL ser el único portador de esa información para tecnologías de asistencia.

#### Scenario: Cambiar de opción
- **WHEN** un usuario hace clic en una opción distinta de la seleccionada
- **THEN** SegmentedControl notifica la opción elegida al consumidor

#### Scenario: Navegación por teclado
- **WHEN** una opción de SegmentedControl tiene el foco y el usuario usa las flechas
- **THEN** el foco se mueve a la opción adyacente dentro del grupo, sin necesitar Tab entre cada una

#### Scenario: Opción representada solo por icono
- **WHEN** una opción de SegmentedControl se define solo con un icono, sin texto visible
- **THEN** el icono se renderiza en lugar del texto, y la opción expone un nombre accesible que una tecnología de asistencia puede anunciar

#### Scenario: Estado seleccionado no depende solo del icono
- **WHEN** un usuario recorre visualmente un SegmentedControl cuyas opciones son iconos
- **THEN** distingue cuál está seleccionada por el mismo tratamiento visual de fondo que usan las opciones de texto, no por un cambio en el propio icono

### Requirement: Opciones del componente Tabs
El componente Tabs SHALL presentar un conjunto de secciones navegables mutuamente excluyentes, de las cuales exactamente una SHALL estar activa en todo momento, con navegación por teclado entre las pestañas y su contenido asociado expuesto solo cuando está activa.

#### Scenario: Cambiar de pestaña por teclado
- **WHEN** un usuario mueve el foco a la lista de pestañas y usa las flechas
- **THEN** el foco se mueve entre las pestañas del grupo, y la pestaña activa y su contenido cambian junto con el foco

#### Scenario: Contenido asociado a la pestaña activa
- **WHEN** una pestaña está activa
- **THEN** solo su contenido asociado es visible y accesible a tecnologías de asistencia; el contenido de las demás pestañas no se anuncia

#### Scenario: Contador junto a la etiqueta
- **WHEN** una pestaña recibe un contador
- **THEN** se muestra junto a la etiqueta, distinguible tipográficamente del texto de la etiqueta

### Requirement: Opciones del componente Avatar
El componente Avatar SHALL representar una persona con sus iniciales, SHALL admitir al menos tres tamaños, y SHALL aceptar un color categórico opcional del mismo vocabulario de seis tonos que usan `Tag` y `Slider` (`gray`, `green`, `blue`, `amber`, `red`, `purple`), asignado explícitamente por el consumidor. Avatar no SHALL derivar ese color por sí mismo del nombre o de ningún otro dato variable de la persona — la asignación es siempre una decisión del consumidor, nunca automática. Sin color especificado, SHALL usar el fondo neutro que ya tenía.

#### Scenario: Color por defecto
- **WHEN** se renderiza un Avatar sin especificar color
- **THEN** usa el fondo neutro, igual que antes de este cambio

#### Scenario: Color categórico asignado por el consumidor
- **WHEN** se renderiza un Avatar con un color categórico especificado
- **THEN** su fondo usa ese color, con el mismo tratamiento de relleno sólido y texto invertido que ya tenía la variante neutra

#### Scenario: Color siempre neutro
- **WHEN** se renderizan varios Avatar con nombres distintos, ninguno con color especificado
- **THEN** todos comparten el mismo fondo neutro — Avatar no SHALL inferir un color distinto por avatar a partir del nombre u otro dato

### Requirement: Opciones del componente AvatarGroup
El componente AvatarGroup SHALL superponer un conjunto de Avatar con un borde que los separe visualmente, y SHALL mostrar un indicador con la cantidad restante cuando el número de miembros exceda el máximo visible configurado, en vez de superponer todos los avatares sin límite.

#### Scenario: Exceder el máximo visible
- **WHEN** AvatarGroup recibe más miembros que su máximo configurado
- **THEN** muestra ese máximo de avatares superpuestos y un indicador final con la cantidad de miembros restantes

### Requirement: Opciones del componente Progress
El componente Progress SHALL representar un valor de avance entre 0 y 100 como una barra horizontal, SHALL saturar su color a la severidad `danger` en vez de desbordar visualmente la barra cuando el valor supera 100, y SHALL aceptar una opción de relleno de marca que reemplaza el color de severidad por el degradado de marca del sistema. Esa opción SHALL ser explícita: por defecto el componente conserva el relleno por severidad. El componente SHALL aceptar además un umbral de advertencia (`warningFrom`, entre 0 y 100): cuando el valor lo alcanza o supera, y mientras no pase de 100, el relleno por severidad es `warning`; sin el umbral, el relleno es `success` hasta 100 inclusive, como hasta ahora.

Progress SHALL aceptar además un tono de la escala de acento (`tone`): con él, la barra se rellena con el paso de relleno de ese matiz —el mismo que usan LevelMeter y SegmentedBar— sobre la pista neutra, y NO SHALL cambiar de color por severidad ni por umbral, porque una cantidad pintada en acento no afirma estado. `tone` tiene precedencia sobre la opción de relleno de marca.

#### Scenario: Relleno por tono de acento
- **WHEN** Progress recibe `tone="blue"` y un valor que supera `warningFrom`
- **THEN** la barra se rellena en el paso de relleno de `blue` y no en advertencia ni peligro

#### Scenario: Valor dentro de rango
- **WHEN** Progress recibe un valor entre 0 y 100
- **THEN** la porción rellena de la barra es proporcional a ese valor

#### Scenario: Valor sobre el límite
- **WHEN** Progress recibe un valor mayor a 100
- **THEN** la barra se muestra completamente llena con el color de severidad `danger`, sin desbordar su contenedor

#### Scenario: Relleno de marca
- **WHEN** Progress recibe la opción de relleno de marca
- **THEN** la porción rellena usa el degradado de marca en vez del color de severidad

#### Scenario: Umbral de advertencia
- **WHEN** Progress recibe `warningFrom` y un valor igual o mayor que ese umbral pero no mayor que 100
- **THEN** la porción rellena usa el color de severidad `warning`

#### Scenario: Advertir exactamente al tope
- **WHEN** Progress recibe `warningFrom` igual a 100 y un valor de 100
- **THEN** la porción rellena usa `warning`, y un valor mayor a 100 sigue saturando a `danger`

#### Scenario: Sin umbral no hay advertencia
- **WHEN** Progress se usa sin `warningFrom`
- **THEN** conserva `success` para todo valor hasta 100 inclusive, como hasta ahora

#### Scenario: El relleno por severidad es el comportamiento por defecto
- **WHEN** Progress se usa sin especificar la opción de relleno de marca
- **THEN** conserva el relleno por severidad, sin que el consumidor tenga que pedirlo

### Requirement: Opciones del componente SegmentedBar
El componente SegmentedBar SHALL representar una distribución como una barra dividida en segmentos proporcionales a su valor, y cada segmento SHALL colorearse por uno de cuatro vocabularios excluyentes entre sí: un rol de estado (`info`/`warning`/`success`/`danger`, consistente en toda la aplicación), un color categórico (el mismo vocabulario de seis tonos sin significado de estado que ya usan Avatar y Tag), un tono de acento (el mismo vocabulario ordinal de cuatro matices que usa el medidor de nivel), o un grado de intensidad (`heat`: `max`/`high`/`mid`/`low`, una escala ordinal sobre la marca que va del relleno de peligro intenso al de marca, al de marca atenuada y al neutro), nunca más de uno a la vez en el mismo segmento.

El componente SHALL aceptar un `total` opcional: cuando se indica, el ancho de cada segmento es proporcional a su valor respecto a ese total y el resto de la barra queda como track vacío (lo no asignado); sin `total`, los segmentos reparten el 100 % entre sí como hasta ahora. Y SHALL aceptar un tamaño (`size`: `sm` de 6 px, igual que Progress, o `md` de 8 px, el actual y por defecto). El componente SHALL aceptar además una opción para separar visualmente los segmentos entre sí, redondeando cada uno por separado; por defecto los pinta como una barra continua.

La documentación del componente SHALL distinguir cuándo corresponde cada vocabulario: el rol de estado cuando el color afirma algo (salud, riesgo), el categórico cuando sólo distingue miembros de un conjunto sin orden, el de acento cuando los segmentos representan los pasos de una escala ordinal, y el de intensidad cuando la distribución se ordena por gravedad y el color resume "cuánto de esto es grave" sin afirmar el estado de cada miembro — de modo que una distribución por nivel use los mismos matices con que el sistema pinta ese nivel en cualquier otra pieza.

#### Scenario: Suma de segmentos
- **WHEN** SegmentedBar recibe una lista de segmentos con sus valores
- **THEN** el ancho de cada segmento es proporcional a su valor respecto a la suma total de los segmentos

#### Scenario: Color por rol de estado
- **WHEN** un segmento especifica un rol de estado (`info`/`warning`/`success`/`danger`)
- **THEN** el segmento se colorea con el color de ese rol, igual que en el resto del sistema

#### Scenario: Color categórico
- **WHEN** un segmento especifica un color categórico (`gray`/`green`/`blue`/`amber`/`red`/`purple`) en vez de un rol de estado
- **THEN** el segmento se colorea con ese tono, sin implicar ningún significado de estado

#### Scenario: Tono de acento
- **WHEN** un segmento especifica un tono de acento (`slate`/`blue`/`teal`/`purple`) en vez de un rol de estado o un color categórico
- **THEN** el segmento se tiñe con el mismo paso de relleno de ese matiz que usa el medidor de nivel, de modo que el mismo dato viste el mismo color en la barra y en el medidor

#### Scenario: Grado de intensidad
- **WHEN** un segmento especifica un grado de intensidad (`max`/`high`/`mid`/`low`)
- **THEN** el segmento se rellena, respectivamente, con el relleno de peligro intenso, el de marca, el de marca atenuada (`brand-strong`) y el neutro pressed, sin recurrir a opacidad

#### Scenario: Los vocabularios no se mezclan en un segmento
- **WHEN** un segmento intenta especificar más de un vocabulario de color a la vez
- **THEN** el contrato del componente lo impide: cada segmento declara rol, color categórico, tono de acento o grado de intensidad, sólo uno

#### Scenario: Segmentos sobre un total
- **WHEN** SegmentedBar recibe `total` mayor que la suma de sus segmentos
- **THEN** cada segmento ocupa su valor sobre ese total y el resto de la barra muestra el track vacío

#### Scenario: Total menor que la suma
- **WHEN** SegmentedBar recibe `total` menor que la suma de sus segmentos
- **THEN** los segmentos se dimensionan sobre la suma, sin desbordar la barra

#### Scenario: Tamaño compacto
- **WHEN** SegmentedBar recibe `size="sm"`
- **THEN** la barra mide 6 px de alto, la misma altura que Progress, para convivir en una fila de tabla

#### Scenario: Segmentos separados
- **WHEN** SegmentedBar recibe la opción de separar sus segmentos
- **THEN** cada segmento se dibuja como una pieza propia, con espacio entre él y el siguiente y con sus esquinas redondeadas, conservando la proporción de su valor

#### Scenario: La barra continua es el comportamiento por defecto
- **WHEN** SegmentedBar se usa sin especificar la opción de separación
- **THEN** los segmentos se pintan pegados entre sí dentro de un único contenedor redondeado, como hasta ahora

### Requirement: Opciones del componente CapacityBar
El componente CapacityBar SHALL representar una capacidad asignada frente a una disponible: una cabecera con `asignado / disponible` seguidos de una unidad opcional (formateados con un decimal y cifras tabulares), el porcentaje de ocupación (`asignado / disponible`, 0 cuando la disponible es 0) coloreado por severidad según un umbral de advertencia configurable (por defecto 85: `success` por debajo, `warning` desde el umbral, `danger` al alcanzar o superar el 100 %), una barra apilada cuyas partes se dimensionan sobre la capacidad disponible (SegmentedBar con `total`) y cuyo color sale del vocabulario de acento, una leyenda con punto, etiqueta y cifra por parte, y una lectura final: lo libre ("N libre", con la etiqueta configurable) o, al alcanzar el tope, un texto de tope (por defecto "Al tope") en color `danger`. Cuando la capacidad asignada es 0 y no hay partes, el componente SHALL mostrar la variante vacía: cifra 0.0 atenuada, barra vacía y un texto configurable (por defecto "Sin capacidad asignada"), sin porcentaje.

El color de cada parte SHALL poder salir del vocabulario de **acento** o del **categórico**, y el consumidor SHALL elegir cuál según lo que las partes sean: acento cuando son pasos de una misma escala, y categórico cuando son categorías que no se ordenan entre sí. Obligar al acento hace que dos categorías tomen prestados los tonos de una escala ordinal del sistema y se confundan con ella. Una parte SHALL declarar uno solo de los dos vocabularios. Los dos vocabularios SHALL estar disponibles para el consumidor con un nombre propio: una opción cuyo tipo no se puede nombrar desde afuera no se puede escribir con tipos, y obliga a quien la use a apoyarse en el alias de otro componente.

CapacityBar SHALL aceptar `separated`: con él, los tramos se dibujan como piezas separadas (la misma lectura de categorías que comparten un total que ofrece SegmentedBar) y el resto libre sigue visible como pista neutra; por defecto la barra es continua.

#### Scenario: Tramos separados
- **WHEN** CapacityBar recibe `separated`
- **THEN** BAU y Transformación se dibujan como piezas con separación entre sí y lo libre queda como pista, sin cambiar cifras ni leyenda

#### Scenario: Ocupación con margen
- **WHEN** CapacityBar recibe 1.8 asignado sobre 2.0 disponible, partes BAU 1.1 y Transformación 0.7 y el umbral por defecto
- **THEN** muestra "1.8 / 2.0", "90%" en `warning`, dos tramos de 55 % y 35 % del ancho, la leyenda con 1.1 y 0.7, y "0.2 libre"

#### Scenario: Partes que son categorías
- **WHEN** las partes de una CapacityBar son categorías que no se ordenan entre sí
- **THEN** el consumidor las colorea con el vocabulario categórico, y no toman prestados los tonos de ninguna escala ordinal del sistema

#### Scenario: Partes que son pasos de una escala
- **WHEN** las partes son pasos de una misma escala
- **THEN** el consumidor las colorea con el vocabulario de acento, igual que antes de existir esta opción

#### Scenario: Al tope
- **WHEN** la capacidad asignada iguala o supera la disponible
- **THEN** el porcentaje se muestra en `danger` y la lectura final es el texto de tope en `danger`, sin cifra de libre

#### Scenario: Con espacio
- **WHEN** la ocupación está por debajo del umbral de advertencia
- **THEN** el porcentaje se muestra en `success` y la lectura final es lo libre con un decimal

#### Scenario: Vacía
- **WHEN** la capacidad asignada es 0 y no hay partes
- **THEN** muestra la cifra 0.0 atenuada, la barra vacía y el texto de vacío, sin porcentaje ni leyenda

#### Scenario: Disponible en cero
- **WHEN** la capacidad disponible es 0 pero hay partes asignadas
- **THEN** el porcentaje es 0 sin división por cero y las partes se dimensionan sobre su propia suma

### Requirement: Opciones del componente DistributionCard
El componente DistributionCard SHALL presentar una distribución dentro de una Card: un título en estilo de rótulo, un total con su sustantivo en el slot derecho de la cabecera, una SegmentedBar (separada por defecto) con los segmentos recibidos —cada uno con etiqueta, valor y uno de los vocabularios de color de SegmentedBar, incluido el de intensidad—, una leyenda en dos columnas con un punto del mismo color que el segmento, la etiqueta y el valor en negrita con cifras tabulares, y un pie opcional, separado por un borde superior y alineado al fondo de la card, para una lectura derivada de las mismas cifras. Los segmentos con valor 0 NO SHALL pintar tramo en la barra pero SHALL aparecer en la leyenda. El punto de leyenda de un segmento de intensidad `low` SHALL llevar borde para seguir visible sobre la card.

La card SHALL poder abrir con una cifra titular (`headline`: valor y lectura) entre el rótulo y la barra, en el mismo tamaño de métrica que las demás cards de resumen; SHALL aceptar una acción (`action`) que ocupa el slot derecho de la cabecera en lugar del total; y SHALL ofrecer la leyenda en línea (`legend="inline"`), una fila que envuelve con punto, etiqueta y cifra, además de las disposiciones en dos columnas y en lista. El total SHALL ser opcional.

#### Scenario: Cifra titular con acción y leyenda en línea
- **WHEN** DistributionCard recibe `headline`, `action` y `legend="inline"`
- **THEN** muestra la cifra con su lectura bajo el rótulo, la acción en la cabecera sin el total, la barra y una leyenda en una sola fila con el conteo junto a cada etiqueta

#### Scenario: Distribución con pie
- **WHEN** DistributionCard recibe cuatro segmentos (2, 1, 1, 1) con vocabulario de intensidad, el total 5 y un pie
- **THEN** muestra la barra con cuatro tramos proporcionales, la leyenda con los cuatro valores, "5" junto a su sustantivo en la cabecera y el pie al fondo

#### Scenario: Segmento en cero
- **WHEN** un segmento tiene valor 0
- **THEN** no aparece en la barra pero sí en la leyenda, con su valor 0

#### Scenario: Mismo color en barra y leyenda
- **WHEN** un segmento usa cualquiera de los vocabularios de color
- **THEN** su tramo y su punto de leyenda usan la misma clase de relleno

#### Scenario: Sin pie
- **WHEN** DistributionCard se usa sin pie
- **THEN** la card termina en la leyenda, sin borde ni espacio reservado

### Requirement: Opciones del componente Meter
El componente Meter SHALL mostrar un Progress acompañado de su valor como texto (porcentaje con cifras tabulares y peso semibold), en una fila horizontal con un ancho mínimo que evita que la barra colapse dentro de una celda, y SHALL trasladar a Progress el umbral de advertencia (`warningFrom`) y el valor, de modo que la barra y la cifra describan el mismo número. El valor 0 SHALL dejar la barra vacía. Un valor mayor a 100 SHALL saturar la barra a `danger` y mostrar la cifra real.

Meter SHALL trasladar también `tone` a Progress: con un tono de acento, la barra es una cantidad sobre la pista neutra y la cifra sigue describiendo el mismo número, sin señal de estado.

#### Scenario: Utilización como cantidad
- **WHEN** Meter recibe 100 con `tone="blue"`
- **THEN** la barra se rellena completa en el relleno de `blue` y la cifra muestra "100%"

#### Scenario: Valor medio
- **WHEN** Meter recibe 80 con `warningFrom` 100
- **THEN** la barra se rellena al 80 % en `success` y la cifra muestra "80%"

#### Scenario: Exactamente al tope
- **WHEN** Meter recibe 100 con `warningFrom` 100
- **THEN** la barra se rellena completa en `warning` y la cifra muestra "100%"

#### Scenario: Sobreasignado
- **WHEN** Meter recibe 120
- **THEN** la barra se rellena completa en `danger` y la cifra muestra "120%"

#### Scenario: Cero
- **WHEN** Meter recibe 0
- **THEN** la barra queda vacía y la cifra muestra "0%"

### Requirement: Opciones del componente Breadcrumb
El componente Breadcrumb SHALL mostrar la ruta de navegación de la página actual, SHALL colapsar los niveles intermedios en un indicador no interactivo cuando la ruta supera tres niveles, conservando siempre visibles el primero y el último, el último nivel no SHALL ser un enlace, y SHALL aceptar una variante `"light" | "dark"` que adapta el color de sus enlaces, nivel actual y separadores a un fondo claro u oscuro, respectivamente. Por defecto usa `"light"`.

#### Scenario: Ruta corta
- **WHEN** Breadcrumb recibe tres niveles o menos
- **THEN** muestra todos los niveles, cada uno enlazado salvo el último

#### Scenario: Ruta larga
- **WHEN** Breadcrumb recibe más de tres niveles
- **THEN** colapsa los niveles intermedios en un indicador no interactivo, conservando visibles el primero y el último

#### Scenario: Último nivel no es un enlace
- **WHEN** se renderiza el último nivel de un Breadcrumb
- **THEN** se muestra como texto, no como un enlace, porque representa la página actual

#### Scenario: Variante clara (por defecto)
- **WHEN** Breadcrumb se usa sin especificar `variant`, o con `variant="light"`
- **THEN** sus enlaces, nivel actual y separadores usan los tokens de color pensados para un fondo claro

#### Scenario: Variante oscura
- **WHEN** Breadcrumb se usa con `variant="dark"`
- **THEN** sus enlaces, nivel actual y separadores usan tokens de color legibles sobre un fondo oscuro

### Requirement: Opciones del componente DateField
El componente DateField SHALL capturar una fecha única como texto en formato ISO (`YYYY-MM-DD`) sin ambigüedad entre día y mes, SHALL ofrecer un calendario desplegable como ayuda opcional para elegir la fecha, y SHALL permitir escribir la fecha a mano en todo momento sin depender de abrir el calendario.

#### Scenario: Escribir la fecha a mano
- **WHEN** un usuario escribe una fecha válida en formato ISO directamente en el campo, sin abrir el calendario
- **THEN** DateField acepta el valor sin requerir que se haya usado el calendario

#### Scenario: Elegir la fecha desde el calendario
- **WHEN** un usuario abre el calendario desplegable y selecciona un día
- **THEN** el campo de texto se actualiza con la fecha elegida en formato ISO y el calendario se cierra

#### Scenario: Fecha fuera de límite visible pero deshabilitada
- **WHEN** DateField recibe una fecha mínima o máxima y el calendario muestra un mes con días fuera de ese límite
- **THEN** esos días se muestran deshabilitados en vez de ocultarse, para que el límite quede visible

### Requirement: Opciones del componente DateRangeField
El componente DateRangeField SHALL capturar dos fechas (inicio y fin) como texto en formato ISO, SHALL ofrecer el mismo calendario desplegable que DateField como ayuda opcional para elegir ambos extremos del rango, y SHALL presentar el rango en modo lectura con un formato abreviado localizado en vez del formato ISO usado en captura.

#### Scenario: Formato abreviado en lectura
- **WHEN** DateRangeField muestra un rango ya elegido fuera de edición
- **THEN** lo presenta con un formato abreviado localizado (por ejemplo «28 jul – 8 ago») en vez del formato ISO de captura

#### Scenario: Elegir un rango desde el calendario
- **WHEN** un usuario abre el calendario y selecciona un día de inicio y luego un día de fin posterior
- **THEN** DateRangeField actualiza ambos campos de texto con las fechas elegidas en formato ISO

#### Scenario: Escribir ambos extremos a mano
- **WHEN** un usuario escribe directamente las fechas de inicio y fin en formato ISO, sin abrir el calendario
- **THEN** DateRangeField acepta ambos valores sin requerir el calendario

### Requirement: Opciones del componente EmptyState
El componente EmptyState SHALL presentar, centrados, un icono, un título y opcionalmente una descripción y una acción, y no SHALL imponer un contenedor propio con borde — se apoya en la superficie donde el consumidor lo coloque. EmptyState no SHALL determinar por sí mismo si corresponde invitar a crear, invitar a limpiar filtros, o indicar a quién pedir permiso: esa decisión de contenido queda del lado del consumidor, según cuál de las tres situaciones se esté representando.

#### Scenario: Estado sin datos con acción de creación
- **WHEN** un consumidor usa EmptyState para una lista que todavía no tiene ningún elemento
- **THEN** puede pasar una acción que invite a crear el primero

#### Scenario: Estado sin resultados
- **WHEN** un consumidor usa EmptyState después de que un filtro o una búsqueda no arroja resultados
- **THEN** el título y la descripción pueden orientar a limpiar el filtro, sin que el componente imponga ese texto

#### Scenario: Sin contenedor propio
- **WHEN** se renderiza EmptyState dentro de un Card o dentro del cuerpo de una Table
- **THEN** EmptyState no agrega un borde ni un fondo propios que compitan con el contenedor que lo aloja

### Requirement: Opciones del componente Skeleton
El componente Skeleton SHALL representar un bloque de carga con animación de pulso, sin una forma fija impuesta — el consumidor SHALL poder dimensionarlo y redondearlo para imitar la forma del contenido real que reemplaza, en vez de mostrar siempre un rectángulo genérico.

#### Scenario: Imitar una línea de texto
- **WHEN** un consumidor usa Skeleton para anticipar una línea de texto
- **THEN** puede darle un ancho y una altura que se asemejen a esa línea, en vez de un bloque de proporciones fijas

#### Scenario: Imitar un avatar circular
- **WHEN** un consumidor usa Skeleton para anticipar un avatar
- **THEN** puede darle forma circular, en vez de quedar limitado a la forma que trae por defecto

#### Scenario: Guía de uso sobre cuándo mostrarlo
- **WHEN** alguien consulta la documentación de Skeleton para decidir cuándo mostrarlo
- **THEN** encuentra la orientación de no mostrarlo antes de 300ms de espera, y de reemplazarlo por un mensaje explícito con opción de cancelar pasados 10 segundos

### Requirement: Opciones del componente Toast
El componente Toast SHALL dispararse mediante un hook, no mediante un componente presentacional montado directamente en el árbol de cada pantalla, y SHALL mostrar como máximo un toast a la vez, anclado en una posición fija de la ventana. Toast SHALL desaparecer automáticamente luego de una duración por defecto, y esa duración por defecto SHALL extenderse cuando el toast incluye una acción, en vez de mantenerse igual independientemente del contenido.

#### Scenario: Disparar un toast desde cualquier componente
- **WHEN** un componente necesita confirmar una acción del usuario
- **THEN** puede disparar un toast mediante el hook, sin tener que montar manualmente el elemento visual en su propio árbol

#### Scenario: Un solo toast a la vez
- **WHEN** se dispara un segundo toast mientras el primero todavía es visible
- **THEN** el segundo espera su turno en vez de mostrarse superpuesto o al lado del primero

#### Scenario: Duración por defecto
- **WHEN** se dispara un toast sin una acción y sin especificar duración
- **THEN** desaparece automáticamente a los 5 segundos

#### Scenario: Duración extendida con acción
- **WHEN** se dispara un toast que incluye una acción (por ejemplo, deshacer) y sin especificar duración
- **THEN** desaparece automáticamente a los 10 segundos en vez de a los 5

### Requirement: Opciones del componente Tooltip
El componente Tooltip SHALL mostrar una frase corta con un ancho máximo acotado, tras un retraso de aparición y sin retraso al desaparecer, y no SHALL contener acciones ni información imprescindible para completar una tarea — quien navega por teclado o en un dispositivo táctil no siempre lo activa.

#### Scenario: Aparece con retraso
- **WHEN** un usuario posiciona el puntero o el foco sobre el elemento que activa un Tooltip
- **THEN** el Tooltip aparece luego de un retraso, no de inmediato

#### Scenario: Desaparece sin retraso
- **WHEN** el puntero o el foco deja el elemento que activa un Tooltip visible
- **THEN** el Tooltip desaparece de inmediato, sin el mismo retraso que tuvo al aparecer

#### Scenario: Sin información imprescindible
- **WHEN** se diseña el contenido de un Tooltip
- **THEN** ese contenido no SHALL ser necesario para completar la tarea, porque una persona que no lo ve igual debe poder continuar

### Requirement: Opciones del componente Menu
El componente Menu SHALL presentar una lista de ítems accionables anclada a su disparador, navegable con las flechas del teclado, y SHALL cerrarse con la tecla Escape. Un ítem de Menu SHALL poder marcarse como destructivo, y en ese caso SHALL distinguirse visualmente de los ítems no destructivos por su color, no solo por su posición.

#### Scenario: Navegación por teclado
- **WHEN** un usuario abre un Menu y usa las flechas
- **THEN** el foco recorre los ítems en orden, sin necesitar Tab entre cada uno

#### Scenario: Cerrar con Escape
- **WHEN** un usuario presiona Escape con un Menu abierto
- **THEN** el Menu se cierra y el foco vuelve al disparador

#### Scenario: Extremos del menú
- **WHEN** un usuario con el foco dentro de un Menu abierto presiona Home o End
- **THEN** el foco salta al primer o al último ítem respectivamente

#### Scenario: Ítem destructivo distinguible
- **WHEN** un Menu incluye un ítem marcado como destructivo
- **THEN** ese ítem se distingue de los demás por su color, no solo por estar en una posición particular de la lista

### Requirement: Comportamiento compartido de Modal y Drawer
Modal y Drawer SHALL atrapar el foco de teclado dentro de su propio contenido mientras están abiertos, SHALL cerrarse con la tecla Escape, y SHALL devolver el foco al elemento que los abrió al cerrarse. Un Modal no SHALL abrir otro Modal. El panel de ambos SHALL delimitarse contra lo que tiene detrás por un trazo propio en su contorno, y NO SHALL depender únicamente de su sombra: una sombra proyectada deja el borde superior sin definir, así que por sí sola no delimita. Ese trazo SHALL ser el mismo que usan las demás superposiciones de panel claro del catálogo, de modo que la familia se lea con un solo criterio.

#### Scenario: Foco atrapado
- **WHEN** un Modal o un Drawer está abierto y el usuario navega con Tab
- **THEN** el foco recorre solo los elementos dentro del Modal o Drawer, sin salir hacia el resto de la página

#### Scenario: Cerrar con Escape
- **WHEN** un usuario presiona Escape con un Modal o un Drawer abierto
- **THEN** se cierra

#### Scenario: El foco vuelve al disparador
- **WHEN** un Modal o un Drawer se cierra, por cualquier medio
- **THEN** el foco vuelve al elemento que lo abrió

#### Scenario: Sin anidamiento de modales
- **WHEN** se diseña un flujo que abre un Modal
- **THEN** ese Modal no SHALL abrir otro Modal encima — una confirmación adicional se resuelve dentro del mismo Modal, no apilando uno nuevo

#### Scenario: El borde superior del panel queda definido
- **WHEN** se abre un Modal o un Drawer sobre un fondo claro
- **THEN** su contorno lo delimita por los cuatro lados, incluido el superior, donde la sombra no llega

#### Scenario: La familia de panel claro comparte trazo
- **WHEN** se comparan los paneles de Modal y Drawer con los de las demás superposiciones de panel claro
- **THEN** todos se delimitan con el mismo trazo, sin que unas lo lleven y otras no

#### Scenario: Las superposiciones de superficie oscura no lo requieren
- **WHEN** una superposición se apoya en una superficie oscura que ya la separa de la página, como una burbuja de ayuda o un aviso
- **THEN** no necesita trazo propio: su superficie cumple esa función

### Requirement: Opciones del componente Modal
El componente Modal SHALL centrarse sobre la página con un fondo que oscurece el contenido detrás, SHALL usarse para decisiones que bloquean el flujo hasta que el usuario responde, y SHALL requerir un título accesible.

#### Scenario: Uso para decidir, no para consultar
- **WHEN** se elige entre Modal y Drawer para mostrar contenido
- **THEN** Modal es la opción cuando el usuario debe responder algo antes de continuar, no cuando solo necesita consultar información manteniendo el contexto detrás visible

#### Scenario: Título accesible obligatorio
- **WHEN** se arma un Modal con `ModalHeader`
- **THEN** el título queda expuesto a tecnología de asistencia sin que el consumidor tenga que declararlo aparte

### Requirement: Opciones del componente Drawer
El componente Drawer SHALL deslizarse desde el borde de la página sin oscurecer completamente el contenido de forma que impida orientarse, y SHALL usarse para consultar el detalle de un elemento sin perder de vista la lista o tabla de la que proviene.

#### Scenario: Uso para consultar, no para decidir
- **WHEN** se elige entre Modal y Drawer para mostrar contenido
- **THEN** Drawer es la opción cuando el usuario necesita ver el detalle de algo sin abandonar el contexto de la tabla o lista detrás

#### Scenario: Cierre sin perder la posición de la tabla
- **WHEN** un Drawer se cierra
- **THEN** la tabla o lista que quedaba detrás sigue en el mismo estado de scroll y selección que tenía antes de abrirlo, porque nunca dejó de estar montada

### Requirement: Opciones del componente ActivityTimeline
El componente ActivityTimeline SHALL presentar una secuencia de entradas ordenada, y cada entrada SHALL nombrar al actor antes que la acción, distinguiendo tipográficamente al actor del resto del texto. Cada entrada SHALL admitir una marca de tiempo y, opcionalmente, una línea de detalle secundaria. El color asociado a una entrada SHALL ser un refuerzo visual y no SHALL ser la única forma de distinguir su naturaleza.

#### Scenario: El actor se distingue del resto del texto
- **WHEN** se renderiza una entrada de ActivityTimeline
- **THEN** el actor aparece antes que la acción y se distingue tipográficamente de ella

#### Scenario: Detalle secundario opcional
- **WHEN** una entrada no tiene línea de detalle
- **THEN** ActivityTimeline la muestra igual, sin dejar un espacio vacío en el lugar del detalle

#### Scenario: El color no es la única fuente
- **WHEN** una persona que no distingue el color de una entrada la consulta
- **THEN** puede identificar qué ocurrió por el texto de la acción, sin depender del color del punto

#### Scenario: Sin superficie propia
- **WHEN** se coloca un ActivityTimeline dentro de otro componente que ya provee un fondo y un borde
- **THEN** ActivityTimeline no agrega una segunda superficie encima de la del componente que lo contiene

### Requirement: Opciones del componente Stepper
El componente Stepper SHALL presentar una secuencia horizontal de pasos, y cada paso SHALL declarar explícitamente su estado entre completado, en curso o pendiente. Un paso completado SHALL distinguirse visualmente por un medio distinto de su sola posición en la secuencia, y a lo sumo un paso SHALL representar el paso en curso.

#### Scenario: Un paso completado se distingue sin depender de la posición
- **WHEN** se renderiza un paso con estado completado
- **THEN** se distingue de un paso pendiente por su color y por un ícono de confirmación, no solo por estar antes en la secuencia

#### Scenario: El paso en curso es identificable de un vistazo
- **WHEN** se renderiza un paso con estado en curso
- **THEN** su color lo distingue tanto de los pasos completados como de los pendientes

#### Scenario: Stepper no infiere el estado de sus pasos
- **WHEN** se compone un Stepper con varios StepperStep
- **THEN** el estado de cada paso es el que su propio consumidor le asignó explícitamente, sin que Stepper lo recalcule a partir de la posición del paso en la secuencia

#### Scenario: Guía de uso según la cantidad de pasos
- **WHEN** se elige usar Stepper para un flujo
- **THEN** la documentación indica que por debajo de tres pasos alcanza un formulario simple y que por encima de cinco conviene guardar el progreso, porque a partir de ahí la persona pierde el hilo del flujo

### Requirement: Opciones del componente NotificationMenu
El componente NotificationMenu SHALL anclarse a un disparador y presentar una lista de notificaciones navegable con las flechas del teclado, y SHALL cerrarse con la tecla Escape devolviendo el foco al disparador. Cada notificación SHALL declarar su estado leído o no leído, y ese estado SHALL distinguirse tanto por el fondo como por el peso del texto. El contenido de una notificación SHALL corresponder a un evento sobre el que la persona puede actuar.

#### Scenario: Navegación por teclado entre notificaciones
- **WHEN** un usuario abre un NotificationMenu y usa las flechas
- **THEN** el foco recorre las notificaciones en orden, sin necesitar Tab entre cada una

#### Scenario: Cerrar con Escape
- **WHEN** un usuario presiona Escape con un NotificationMenu abierto
- **THEN** el NotificationMenu se cierra y el foco vuelve al disparador

#### Scenario: Una notificación no leída se distingue por dos señales
- **WHEN** se renderiza una notificación no leída junto a una leída
- **THEN** ambas se distinguen entre sí tanto por el color de fondo como por el peso de su texto, no por una sola señal

#### Scenario: Guía de contenido accionable
- **WHEN** se diseña qué notificaciones mostrar en NotificationMenu
- **THEN** la documentación indica que solo corresponden ahí los eventos sobre los que la persona puede actuar, y que un evento meramente informativo pertenece a un historial en otro lugar, no a este panel

### Requirement: Selección de archivo por arrastre o por teclado
FileInput y FileUploader SHALL permitir elegir un archivo tanto arrastrándolo sobre la zona designada como mediante un control operable por teclado, y el resultado de elegir un archivo SHALL ser el mismo sin importar cuál de los dos medios se haya usado.

#### Scenario: Elegir un archivo arrastrándolo
- **WHEN** un usuario suelta un archivo sobre la zona de FileInput o FileUploader
- **THEN** el archivo queda seleccionado, igual que si se hubiera elegido por el diálogo del sistema

#### Scenario: Elegir un archivo sin arrastrar nada
- **WHEN** un usuario que navega por teclado activa el control con Enter o Espacio
- **THEN** se abre el selector de archivos del sistema operativo, sin que el arrastre sea la única vía para adjuntar algo

#### Scenario: Mismo resultado por cualquiera de los dos medios
- **WHEN** se compara un archivo elegido por arrastre con el mismo archivo elegido por el selector del sistema
- **THEN** el estado resultante de FileInput o FileUploader es indistinguible entre ambos casos

### Requirement: Opciones del componente FileInput
El componente FileInput SHALL aceptar un único archivo a la vez, SHALL mostrar el nombre y el tamaño del archivo elegido una vez seleccionado, y SHALL permitir quitarlo sin tener que elegir otro en su reemplazo. Si se sueltan varios archivos sobre FileInput, SHALL conservar únicamente el primero.

#### Scenario: Mostrar el archivo elegido
- **WHEN** se selecciona un archivo en FileInput
- **THEN** su nombre y su tamaño quedan visibles, reemplazando la invitación a elegir uno

#### Scenario: Quitar el archivo elegido
- **WHEN** un usuario quita el archivo ya elegido
- **THEN** FileInput vuelve a mostrar la invitación a elegir uno, sin exigir que se elija otro de inmediato

#### Scenario: Soltar varios archivos en un campo de uno solo
- **WHEN** un usuario suelta más de un archivo sobre FileInput
- **THEN** FileInput conserva solo el primero y descarta el resto, sin mostrar un error por ello

### Requirement: Opciones del componente FileUploader
El componente FileUploader SHALL aceptar varios archivos a la vez, presentando cada uno en su propia fila con nombre, tamaño y estado. El estado de cada archivo SHALL ser controlado por quien usa el componente, y no SHALL simularse dentro del componente. Un archivo en estado de error SHALL mostrar el motivo junto a su fila.

#### Scenario: Cada archivo con su propio estado
- **WHEN** FileUploader recibe varios archivos con estados distintos entre sí
- **THEN** cada fila refleja el estado que le corresponde a su propio archivo, no un estado compartido por todos

#### Scenario: Progreso de una subida en curso
- **WHEN** un archivo está en estado de subida con un progreso definido
- **THEN** su fila muestra una barra de progreso con ese valor

#### Scenario: Un archivo con error
- **WHEN** un archivo queda en estado de error
- **THEN** su fila muestra el motivo del error, sin que eso afecte el estado de las demás filas

#### Scenario: Quitar un archivo de la lista
- **WHEN** un usuario quita un archivo de la lista, sin importar su estado
- **THEN** solo esa fila desaparece, y el resto de la lista permanece sin cambios

### Requirement: Zonas fijas del componente Navbar
El componente Navbar SHALL presentar tres zonas en un orden fijo — marca de producto a la izquierda, búsqueda al centro, utilidades y sesión a la derecha — y ese reparto SHALL ser el mismo en cualquier producto que lo use.

#### Scenario: Las tres zonas aparecen en el mismo orden
- **WHEN** se renderiza un Navbar con marca, búsqueda y sesión configuradas
- **THEN** la marca de producto aparece a la izquierda, la búsqueda al centro y las utilidades, notificaciones y cuenta a la derecha, en ese orden

#### Scenario: Sin manejador de búsqueda, no hay caja de búsqueda
- **WHEN** Navbar se usa sin la función de búsqueda
- **THEN** la zona central no muestra una caja de búsqueda no funcional

#### Scenario: Sin apps para cambiar, la marca no abre nada
- **WHEN** Navbar recibe una lista vacía de apps
- **THEN** la marca de producto no se comporta como un control que abre un panel

### Requirement: Coordinación de paneles de Navbar
De los paneles de selector de apps, notificaciones y cuenta, a lo sumo uno SHALL estar abierto a la vez: activar el disparador de un panel distinto mientras otro está abierto SHALL cerrar ese otro. Escape SHALL cerrar el panel abierto devolviendo el foco a su disparador.

#### Scenario: Activar otro disparador cierra el panel abierto
- **WHEN** el panel de notificaciones está abierto y la persona activa el disparador del selector de apps
- **THEN** el panel de notificaciones se cierra, sin quedar nunca dos paneles visibles a la vez

#### Scenario: Escape cierra el panel abierto y devuelve el foco
- **WHEN** hay un panel de Navbar abierto y la persona presiona Escape
- **THEN** el panel se cierra y el foco vuelve al botón que lo abrió

### Requirement: Notificaciones en Navbar
El botón de notificaciones de Navbar SHALL mostrar un indicador cuando exista al menos una notificación no leída, sin exhibir un conteo numérico en la propia barra, y ese indicador no SHALL ser la única señal de que hay notificaciones pendientes.

#### Scenario: Indicador de no leídas sin conteo en la barra
- **WHEN** Navbar recibe notificaciones con al menos una marcada como no leída
- **THEN** el botón de notificaciones muestra un indicador visual, sin mostrar la cantidad de notificaciones como número junto al ícono

#### Scenario: El indicador no es la única señal
- **WHEN** una persona que no distingue el color del indicador abre el panel de notificaciones
- **THEN** puede identificar qué notificaciones no leyó por un medio distinto del color, dentro del propio panel

### Requirement: Selector de apps en Navbar
El panel de selector de apps SHALL listar las apps a las que la persona puede cambiar, y SHALL señalar cuál de ellas es la app actual.

#### Scenario: La app actual se distingue de las demás
- **WHEN** se abre el selector de apps y una de ellas es la app actual
- **THEN** esa app se distingue del resto por una etiqueta, no solo por su posición en la lista

### Requirement: Comportamiento responsive de Navbar
Navbar SHALL adaptar su contenido al ancho disponible sin perder ninguna de sus tres zonas: por debajo de 1120px la búsqueda SHALL colapsar a un ícono y por debajo de 960px SHALL adoptar una variante compacta con altura reducida y un botón de menú para la navegación lateral de la app que lo use.

#### Scenario: La búsqueda colapsa antes que el resto
- **WHEN** el ancho disponible baja de 1120px
- **THEN** la búsqueda se reduce a un ícono, mientras que la marca, las notificaciones y la cuenta siguen visibles

#### Scenario: Variante compacta bajo 960px
- **WHEN** el ancho disponible baja de 960px
- **THEN** Navbar reduce su altura y muestra un botón de menú para la navegación lateral, sin dejar de mostrar la marca, las notificaciones y la cuenta

#### Scenario: Sin manejador de menú, no hay botón de menú
- **WHEN** Navbar entra en su variante compacta sin una función de alternar menú configurada
- **THEN** no se muestra un botón de menú sin acción

### Requirement: Accesibilidad de Navbar
Navbar SHALL exponerse como el banner del documento y SHALL incluir, como primer elemento alcanzable por teclado, un enlace para saltar al contenido principal que solo sea visible al recibir foco. Ninguno de sus paneles SHALL atrapar el foco.

#### Scenario: El enlace para saltar al contenido es el primer tabbable
- **WHEN** una persona que navega por teclado presiona Tab por primera vez en una página con Navbar
- **THEN** el foco llega a un enlace para saltar al contenido, invisible hasta ese momento

#### Scenario: Los paneles no atrapan el foco
- **WHEN** un panel de Navbar está abierto y la persona presiona Tab repetidamente
- **THEN** el foco sale del panel y lo cierra, sin quedar retenido dentro

### Requirement: Guía de uso de Navbar
La documentación de Navbar SHALL indicar que la variante de color es constante dentro de un mismo producto, que como máximo un enlace de utilidad acompaña a "Ayuda", y que la navegación de secciones y las acciones primarias no pertenecen a la barra.

#### Scenario: La variante no cambia dentro de un producto
- **WHEN** se elige una variante de color para Navbar
- **THEN** la documentación indica que esa variante es constante para todas las pantallas del producto, no algo que cambie por sección o por entorno

#### Scenario: Qué no pertenece a la barra
- **WHEN** se decide qué agregar a Navbar
- **THEN** la documentación indica que la navegación de secciones y los botones de acción primaria pertenecen a otros componentes, no a Navbar

### Requirement: Vocabulario del estado de madurez
El campo de madurez de un componente SHALL expresarse en inglés con los valores `stable` y `beta`, siguiendo la nomenclatura de canal de publicación estándar del ecosistema — la misma distinción que un dist-tag de npm o que usan Radix y MUI —, en vez de una traducción propia del sistema.

#### Scenario: El valor se reconoce sin traducir
- **WHEN** alguien familiarizado con el ecosistema de componentes de código abierto lee el estado de madurez de un componente
- **THEN** reconoce el valor (`stable` o `beta`) sin necesitar traducirlo primero

### Requirement: Ítem activo del Sidebar
El ítem activo de Sidebar SHALL distinguirse de los demás por al menos tres señales simultáneas — un riel de color a su izquierda, un fondo distinto y un peso de texto mayor — y ninguna de esas señales SHALL depender únicamente del color. Su fondo SHALL distinguirse además del de la propia barra que lo contiene, y NO SHALL coincidir con ella: un fondo que iguala a su superficie deja de ser una señal, aunque el requisito de llevar fondo se cumpla en el papel. El fondo del ítem activo SHALL distinguirse también del que muestran los ítems inactivos al pasar el puntero, de modo que activo, hover y reposo se lean como tres estados y no como dos.

#### Scenario: Tres señales a la vez
- **WHEN** se renderiza un ítem activo junto a ítems inactivos
- **THEN** el ítem activo muestra riel, fondo y peso de texto distintos a los inactivos, no solo un color diferente

#### Scenario: El estado no depende del color
- **WHEN** una persona que no distingue el color del riel navega el Sidebar
- **THEN** puede identificar el ítem activo por su fondo y su peso de texto, sin depender del riel

#### Scenario: El fondo del ítem activo no iguala al de la barra
- **WHEN** se renderiza un ítem activo sobre la superficie del Sidebar
- **THEN** su fondo se distingue del de la barra, de modo que la señal siga existiendo

#### Scenario: Activo, hover y reposo son tres estados distinguibles
- **WHEN** se comparan un ítem activo, uno inactivo con el puntero encima y uno inactivo en reposo
- **THEN** los tres se distinguen entre sí, sin que el activo se confunda con el que está en hover

### Requirement: Contador de trabajo pendiente en Sidebar
Un ítem de Sidebar SHALL mostrar un contador solo cuando representa trabajo pendiente de esa persona, nunca un total ni una cifra informativa, y SHALL omitirse por completo — no mostrar cero — cuando no hay nada pendiente. Un contador mayor a 99 SHALL mostrarse como "99+".

#### Scenario: Sin trabajo pendiente, sin contador
- **WHEN** un ítem no tiene trabajo pendiente asociado
- **THEN** no muestra ningún contador, ni siquiera en cero

#### Scenario: El contador se satura en 99+
- **WHEN** el trabajo pendiente de un ítem supera 99
- **THEN** el contador muestra "99+" en vez de seguir creciendo

### Requirement: Persistencia del estado de colapso en Sidebar
Cuando el colapso de Sidebar no está controlado desde afuera, el componente SHALL recordar la última elección de la persona y aplicarla de nuevo en visitas posteriores. Cuando el colapso sí está controlado desde afuera, Sidebar no SHALL leer ni escribir esa persistencia.

#### Scenario: La elección persiste sin modo controlado
- **WHEN** una persona colapsa Sidebar sin que la app controle ese estado, y vuelve a cargar la página más tarde
- **THEN** Sidebar aparece colapsado desde el primer render

#### Scenario: El modo controlado no persiste por su cuenta
- **WHEN** una app controla el colapso de Sidebar desde afuera
- **THEN** Sidebar no guarda ni recupera esa elección por sí mismo — la app es la única fuente de verdad

### Requirement: Colapso automático de Sidebar por ancho
Sidebar SHALL colapsarse automáticamente cuando el ancho disponible baja de 1120px, salvo que su colapso esté controlado desde afuera.

#### Scenario: Colapso automático al angostarse
- **WHEN** el ancho disponible baja de 1120px y Sidebar no está en modo controlado
- **THEN** Sidebar se colapsa a su ancho mínimo

#### Scenario: El modo controlado no se ve forzado
- **WHEN** el ancho disponible baja de 1120px y una app controla el colapso de Sidebar desde afuera
- **THEN** Sidebar no cambia su estado por su cuenta — respeta el valor controlado

### Requirement: Accesibilidad de Sidebar
Sidebar SHALL exponerse como una región de navegación con una etiqueta accesible, SHALL marcar el ítem activo como la página actual, y SHALL mantener el nombre de cada ítem disponible para tecnología de asistencia incluso cuando el texto no es visible.

#### Scenario: El ítem activo se anuncia como la página actual
- **WHEN** una persona usando un lector de pantalla llega al ítem activo
- **THEN** lo anuncia como la página actual, no solo como un ítem más de la lista

#### Scenario: El nombre del ítem viaja aunque el texto esté oculto
- **WHEN** Sidebar está colapsado y solo muestra íconos
- **THEN** cada ítem sigue teniendo su nombre disponible para tecnología de asistencia

#### Scenario: El contador es parte del nombre accesible
- **WHEN** un ítem tiene un contador de trabajo pendiente
- **THEN** ese número forma parte del nombre accesible del ítem, no solo de su apariencia visual

### Requirement: Guía de uso de Sidebar
La documentación de Sidebar SHALL indicar que admite un solo nivel de profundidad sin subsecciones anidadas, que no aloja botones de acción, y que un ítem al que la persona no tiene acceso se omite en vez de mostrarse deshabilitado.

#### Scenario: Un solo nivel
- **WHEN** se decide cómo organizar la navegación de una app en Sidebar
- **THEN** la documentación indica que las subsecciones pertenecen a las pestañas del encabezado de página, no a un segundo nivel dentro de Sidebar

#### Scenario: Sin acceso, sin ítem
- **WHEN** una persona no tiene permiso para entrar a una sección
- **THEN** la documentación indica que esa sección no aparece en su Sidebar, en vez de aparecer deshabilitada

### Requirement: Opciones del componente Accordion
El componente Accordion SHALL presentar una lista de ítems con un encabezado interactivo cada uno, que al activarse expande o colapsa el contenido asociado a ese ítem, navegable con las flechas arriba y abajo del teclado entre los encabezados. Accordion SHALL soportar un modo `single`, en el que a lo sumo un ítem permanece expandido a la vez, y un modo `multiple`, en el que varios ítems SHALL poder permanecer expandidos en simultáneo; `single` SHALL ser el modo por defecto.

#### Scenario: Expandir un ítem
- **WHEN** un usuario activa el encabezado de un ítem colapsado, con mouse o teclado
- **THEN** el contenido asociado a ese ítem se vuelve visible y accesible a tecnologías de asistencia

#### Scenario: Modo single cierra el ítem previamente abierto
- **WHEN** Accordion está en modo `single` y un usuario expande un ítem distinto del que ya estaba expandido
- **THEN** el ítem previamente expandido se colapsa, de modo que nunca hay más de uno abierto a la vez

#### Scenario: Modo multiple permite varios ítems abiertos
- **WHEN** Accordion está en modo `multiple` y un usuario expande un ítem sin haber colapsado los demás
- **THEN** los ítems expandidos previamente permanecen abiertos junto con el nuevo

#### Scenario: Navegación por teclado entre encabezados
- **WHEN** un usuario mueve el foco a un encabezado de Accordion y usa las flechas arriba o abajo
- **THEN** el foco se mueve al encabezado adyacente, sin necesitar Tab entre cada uno

#### Scenario: Estado expandido anunciado a tecnología de asistencia
- **WHEN** una tecnología de asistencia encuentra un encabezado de Accordion
- **THEN** anuncia si el ítem está expandido o colapsado y a qué región de contenido controla

#### Scenario: Encabezado deshabilitado
- **WHEN** un ítem de Accordion se marca como deshabilitado
- **THEN** su encabezado no responde a la activación por mouse ni teclado y se distingue visualmente con el mismo tratamiento de deshabilitado que el resto de los controles del catálogo

### Requirement: Opciones del componente Popover
El componente Popover SHALL anclar una superficie de contenido arbitrario a su disparador, abierta y cerrada por el propio disparador, y SHALL cerrarse con la tecla Escape o al hacer clic fuera de su contenido, devolviendo el foco al disparador. La superficie SHALL usar el ancho mínimo de 280px definido para popovers en el sistema de diseño, ampliable hasta 360px según el contenido.

Popover SHALL admitir además el modo **controlado por el consumidor**: quién está abierto puede ser estado de la pantalla, y en ese modo el Popover SHALL anclarse a un elemento indicado por el consumidor en vez de a un disparador propio. Es lo que permite que una cuadrícula con muchas celdas ofrezca un detalle al activar cualquiera de ellas sin montar un Popover por celda.

Al cerrarse, el Popover SHALL devolver el foco al elemento que lo tenía al abrirse, también cuando no hay disparador propio: sin eso, quien navega con teclado pierde el lugar donde estaba. SHALL NOT hacerlo cuando el cierre vino de interactuar fuera de la superficie —ahí el foco corresponde a donde el usuario acaba de tocar— ni cuando el consumidor declara su propio manejo del foco al cerrar.

La superficie SHALL traer un relleno por defecto y SHALL permitir que el consumidor lo reemplace, de modo que un contenido con encabezado o pie a sangre —con su propio borde o fondo llegando al límite de la superficie— sea posible sin forkear el componente.

La superficie NO SHALL dibujarse fuera de la pantalla: cuando su contenido es más alto que el espacio disponible junto al elemento anclado, SHALL acotarse a ese espacio y desplazar adentro. Un panel cuyo encabezado queda cortado arriba es inservible justo en el caso en que más contenido tiene.

#### Scenario: Abrir desde el disparador
- **WHEN** un usuario activa el disparador de un Popover cerrado, con mouse o teclado
- **THEN** la superficie de contenido se vuelve visible, anclada al disparador

#### Scenario: Cerrar con Escape
- **WHEN** un usuario presiona Escape con un Popover abierto
- **THEN** el Popover se cierra y el foco vuelve al disparador

#### Scenario: Cerrar al hacer clic afuera
- **WHEN** un usuario hace clic fuera de la superficie de un Popover abierto
- **THEN** el Popover se cierra

#### Scenario: Ancho mínimo de la superficie
- **WHEN** se renderiza el contenido de un Popover sin un ancho propio especificado
- **THEN** la superficie ocupa el ancho mínimo de 280px definido para popovers en el sistema de diseño

#### Scenario: Contenido arbitrario
- **WHEN** un consumidor coloca un formulario de filtros dentro de un Popover
- **THEN** el Popover lo renderiza sin imponer una estructura de datos propia, igual que Modal y Drawer con su contenido

#### Scenario: Un solo Popover anclado a la celda activa
- **WHEN** un consumidor mantiene un único Popover controlado y lo ancla a la celda que el usuario acaba de activar dentro de una cuadrícula
- **THEN** la superficie se abre junto a esa celda, sin necesidad de un Popover ni un disparador por celda

#### Scenario: El foco vuelve sin disparador propio
- **WHEN** un usuario abre con el teclado un Popover controlado anclado a una celda y lo cierra con Escape
- **THEN** el foco vuelve a esa celda, y no queda suelto en el documento

#### Scenario: Cerrar tocando afuera no arrastra el foco
- **WHEN** el usuario cierra el Popover interactuando fuera de su superficie
- **THEN** el foco queda donde acaba de tocar, y el Popover no se lo lleva de vuelta al elemento anclado

#### Scenario: Contenido más alto que la pantalla
- **WHEN** el contenido de un Popover es más alto que el espacio que queda junto al elemento anclado
- **THEN** la superficie se acota a ese espacio y desplaza adentro, en vez de dibujarse fuera de la pantalla

#### Scenario: Contenido a sangre
- **WHEN** un consumidor reemplaza el relleno por defecto de la superficie para que su encabezado llegue al límite
- **THEN** el contenido se dibuja sin el relleno por defecto, conservando el borde, el radio y la elevación de la superficie

### Requirement: Opciones del componente Tag
El componente Tag SHALL presentar una etiqueta breve sobre un relleno de color que identifica a un elemento como miembro de un conjunto, y SHALL aceptar un color elegido por el consumidor entre un conjunto de colores nombrados por su tono —no por un rol de estado— de modo que elegir un color no afirme nada sobre el elemento. Tag SHALL NOT exponer el rol `brand`, reservado para la acción principal de una vista. El contenido de Tag SHALL ser siempre su propia etiqueta de texto, de manera que el color nunca sea el único portador del significado. Varios Tag de etiquetas cortas SHALL renderizarse con un mismo ancho mínimo, de modo que un conjunto se lea como valores de una misma cosa y no como elementos de distinta naturaleza.

#### Scenario: Distinguir miembros de un conjunto por color
- **WHEN** se renderizan varios Tag con colores distintos para los miembros de un mismo conjunto
- **THEN** cada uno se muestra con su color de relleno sólido y su etiqueta de texto, sin que el color implique un estado, una severidad ni un juicio sobre el elemento

#### Scenario: El texto no depende del color
- **WHEN** un usuario no puede percibir la diferencia de color entre dos Tag
- **THEN** la etiqueta de texto de cada uno sigue identificándolo por completo, porque el color solo acompaña al texto en vez de reemplazarlo

#### Scenario: Color por defecto
- **WHEN** un Tag se renderiza sin especificar un color
- **THEN** usa un color neutro, sin que la ausencia de elección se interprete como una categoría particular

#### Scenario: Contraste del relleno
- **WHEN** se renderiza un Tag en cualquiera de sus colores
- **THEN** su texto usa el color que el sistema define como legible sobre ese relleno, en vez de un color fijo que solo contraste con algunos de ellos, y la combinación cumple el contraste mínimo que el sistema de tokens ya exige y verifica

#### Scenario: Tamaño uniforme en un conjunto
- **WHEN** se renderizan varios Tag de etiquetas cortas, como las tallas de un conjunto
- **THEN** todos ocupan el mismo ancho mínimo, y una etiqueta más larga que ese mínimo crece en vez de recortarse

#### Scenario: Tag no se anuncia como un estado
- **WHEN** una tecnología de asistencia recorre un Tag
- **THEN** lo encuentra como el texto de su etiqueta, sin anunciarlo como una región de estado ni como un cambio en vivo, a diferencia de Badge

### Requirement: Distinción entre Tag y Badge
La documentación SHALL indicar que Badge comunica el estado de un elemento mediante los roles de estado del sistema, mientras que Tag identifica a un elemento dentro de un conjunto mediante un color sin significado propio, de modo que quien elige entre ambos sepa cuál corresponde. Tag SHALL distinguirse visualmente de Badge también por su forma, de modo que la diferencia no dependa únicamente del color de relleno.

#### Scenario: Elegir entre Tag y Badge
- **WHEN** alguien necesita etiquetar un elemento y consulta la documentación
- **THEN** encuentra que Badge corresponde cuando la etiqueta comunica un estado, y Tag cuando solo distingue a un miembro de un conjunto

#### Scenario: Tag y Badge se distinguen por forma
- **WHEN** un Tag y un Badge aparecen juntos, por ejemplo en la misma tabla
- **THEN** se diferencian por su forma además de por su relleno, de manera que quien no distinga los colores igual puede separar una etiqueta de pertenencia de una de estado

### Requirement: Composición atómica de componentes compuestos
Todo componente compuesto del catálogo SHALL exponer sus partes estructurales internas como componentes nombrados, importables por separado, además de su componente de nivel superior de uso directo. El componente de nivel superior SHALL seguir funcionando sin cambios para quien ya lo usa, componiéndose internamente a partir de esas mismas partes.

#### Scenario: Recomponer con las partes atómicas
- **WHEN** un consumidor necesita una disposición que el componente de nivel superior no contempla (un disparador propio, un ítem con contenido distinto al de por defecto)
- **THEN** puede importar las partes atómicas del componente por separado y recomponerlas, sin forkear el código fuente del componente

#### Scenario: El componente de nivel superior sigue funcionando igual
- **WHEN** se agregan las partes atómicas de un componente que antes era monolítico
- **THEN** el uso existente del componente de nivel superior, con las mismas props que ya tenía, se sigue comportando exactamente igual que antes

### Requirement: Partes atómicas del componente Select
El componente Select SHALL exponer `SelectTrigger` y `SelectItem` como partes atómicas, además de `Select` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Ítem con contenido propio
- **WHEN** un consumidor usa `SelectItem` directamente dentro de la estructura de Select
- **THEN** puede darle contenido propio (por ejemplo, un ícono junto a la etiqueta) más allá de la etiqueta de texto simple que acepta `options` en `Select`

#### Scenario: Select sigue aceptando `options`
- **WHEN** se usa `Select` con su prop `options` como hasta ahora
- **THEN** internamente renderiza un `SelectItem` por cada opción, sin cambiar el comportamiento que el consumidor ya observaba

### Requirement: Partes atómicas del componente Combobox
El componente Combobox SHALL exponer `ComboboxTrigger` y `ComboboxItem` como partes atómicas, además de `Combobox` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Ítem con contenido propio
- **WHEN** un consumidor usa `ComboboxItem` directamente
- **THEN** puede darle contenido propio más allá de la etiqueta de texto simple que acepta `options` en `Combobox`

#### Scenario: Combobox sigue aceptando `options`
- **WHEN** se usa `Combobox` con su prop `options` como hasta ahora
- **THEN** internamente renderiza un `ComboboxItem` por cada opción, sin cambiar el comportamiento que el consumidor ya observaba

### Requirement: Partes atómicas del componente Pagination
El componente Pagination SHALL exponer `PaginationPrevious`, `PaginationNext`, `PaginationItem` y `PaginationEllipsis` como partes atómicas, además de `Pagination` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Disposición de paginación propia
- **WHEN** un consumidor necesita una disposición de paginación distinta a la que arma `Pagination` (por ejemplo, sin los controles anterior/siguiente)
- **THEN** puede componer `PaginationItem`, `PaginationEllipsis`, `PaginationPrevious` y `PaginationNext` directamente, en el orden y agrupación que necesite

#### Scenario: Pagination sigue aceptando `page`, `pageCount` y `onPageChange`
- **WHEN** se usa `Pagination` con sus props actuales
- **THEN** se comporta exactamente igual que antes, incluida la colapsación con puntos suspensivos

### Requirement: Partes atómicas del componente Navbar
El componente Navbar SHALL exponer `NavbarBrand`, `NavbarSearch` y `NavbarUtilities` como partes atómicas correspondientes a sus tres zonas fijas, además de `Navbar` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Navbar sigue componiendo sus tres zonas en orden fijo
- **WHEN** se usa `Navbar` con sus props actuales
- **THEN** internamente sigue componiendo `NavbarBrand`, `NavbarSearch` y `NavbarUtilities` en el mismo orden fijo que ya tenía (marca a la izquierda, búsqueda al centro, utilidades y sesión a la derecha)

#### Scenario: Reutilizar una zona fuera de Navbar
- **WHEN** un consumidor necesita la misma zona de búsqueda o de marca en un contexto distinto al de la barra completa
- **THEN** puede importar `NavbarSearch` o `NavbarBrand` por separado

### Requirement: Partes atómicas del componente Sidebar
El componente Sidebar SHALL exponer `SidebarGroup` y `SidebarItem` como partes atómicas, además de `Sidebar` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: Sidebar sigue aceptando `groups`
- **WHEN** se usa `Sidebar` con su prop `groups` como hasta ahora
- **THEN** internamente renderiza un `SidebarGroup` por cada grupo y un `SidebarItem` por cada ítem, sin cambiar el comportamiento que el consumidor ya observaba, incluidas las tres señales del ítem activo

#### Scenario: Componer una navegación con agrupación propia
- **WHEN** un consumidor necesita una agrupación o un orden de ítems que la prop `groups` no expresa directamente
- **THEN** puede componer `SidebarGroup` y `SidebarItem` directamente dentro de Sidebar

### Requirement: Partes atómicas del componente DateField
El componente DateField SHALL exponer `DateFieldCalendar` como parte atómica correspondiente a su calendario desplegable, además de `DateField` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: DateField sigue ofreciendo el calendario como ayuda opcional
- **WHEN** se usa `DateField` con sus props actuales
- **THEN** internamente sigue componiendo `DateFieldCalendar` de la misma forma que ya tenía, sin cambiar el comportamiento observable

#### Scenario: Reutilizar el calendario fuera del campo de texto
- **WHEN** un consumidor necesita el mismo calendario de selección de fecha única en una superficie distinta a la del campo de texto de DateField
- **THEN** puede importar `DateFieldCalendar` por separado

### Requirement: Partes atómicas del componente DateRangeField
El componente DateRangeField SHALL exponer `DateRangeFieldCalendar` como parte atómica correspondiente a su calendario desplegable de rango, además de `DateRangeField` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: DateRangeField sigue ofreciendo el calendario como ayuda opcional
- **WHEN** se usa `DateRangeField` con sus props actuales
- **THEN** internamente sigue componiendo `DateRangeFieldCalendar` de la misma forma que ya tenía, sin cambiar el comportamiento observable

#### Scenario: Reutilizar el calendario de rango fuera del campo de texto
- **WHEN** un consumidor necesita el mismo calendario de selección de rango en una superficie distinta a la del campo de texto de DateRangeField
- **THEN** puede importar `DateRangeFieldCalendar` por separado

### Requirement: Partes atómicas del componente FileUploader
El componente FileUploader SHALL exponer `FileUploaderRow` como parte atómica correspondiente a la fila de un archivo, además de `FileUploader` como composición de uso directo con las mismas props que ya tenía.

#### Scenario: FileUploader sigue renderizando una fila por archivo
- **WHEN** se usa `FileUploader` con su prop `files` como hasta ahora
- **THEN** internamente renderiza un `FileUploaderRow` por cada archivo, sin cambiar el comportamiento que el consumidor ya observaba

#### Scenario: Reutilizar la fila de archivo en una lista propia
- **WHEN** un consumidor arma una lista de archivos con una disposición distinta a la zona de arrastre de FileUploader
- **THEN** puede importar `FileUploaderRow` por separado y reutilizarla dentro de su propia lista

### Requirement: Partes atómicas del componente Popover
El componente Popover SHALL exponer como partes atómicas su raíz, su disparador, su **ancla** y su superficie de contenido. El ancla SHALL permitir que la superficie se posicione respecto de un elemento distinto del disparador, incluso cuando no hay disparador propio.

El ancla SHALL admitir dos formas de nombrar al elemento anclado: envolviéndolo, sin agregar un nodo propio, o recibiendo una referencia a un elemento que el consumidor ya tiene, sin renderizar nada. La segunda existe para las cuadrículas: envolver sólo la celda activa cambiaría la forma del árbol en esa posición en cada activación, y el elemento se volvería a montar llevándose el foco.

#### Scenario: Composición con ancla propia
- **WHEN** un consumidor compone un Popover con su raíz, un ancla puesta sobre un elemento cualquiera y su contenido, sin disparador
- **THEN** la superficie se ancla a ese elemento y el consumidor controla cuándo se abre

#### Scenario: Ancla por referencia, sin envolver
- **WHEN** un consumidor pasa al ancla una referencia al elemento activo de una cuadrícula en vez de envolverlo
- **THEN** el ancla no renderiza ningún nodo, la superficie se posiciona respecto de ese elemento, y el elemento no se vuelve a montar al activarse

#### Scenario: El uso con disparador sigue igual
- **WHEN** un consumidor usa Popover con su disparador, como antes de existir el ancla
- **THEN** se comporta exactamente igual que antes, sin necesidad de declarar un ancla

### Requirement: Opciones del componente CommandPalette
El componente CommandPalette SHALL abrirse desde cualquier parte de la pantalla mediante el atajo de teclado `⌘K`/`Ctrl+K` mientras está montado, SHALL presentar una lista de comandos que se filtra a medida que la persona escribe, y SHALL cerrarse con la tecla Escape devolviendo el foco al elemento que tenía el foco antes de abrirse. CommandPalette SHALL admitir además una forma de apertura explícita (por ejemplo, desde `Navbar`) equivalente al atajo de teclado.

#### Scenario: Abrir con el atajo de teclado
- **WHEN** una persona presiona `⌘K` (o `Ctrl+K`) en cualquier parte de la pantalla mientras CommandPalette está montado
- **THEN** CommandPalette se abre, sin importar qué elemento tenía el foco

#### Scenario: Filtrar mientras se escribe
- **WHEN** una persona escribe en el campo de búsqueda de CommandPalette
- **THEN** la lista de comandos se reduce a los que coinciden con el texto escrito

#### Scenario: Cerrar con Escape
- **WHEN** una persona presiona Escape con CommandPalette abierto
- **THEN** CommandPalette se cierra y el foco vuelve al elemento que lo tenía antes de abrirse

#### Scenario: Apertura explícita equivalente al atajo
- **WHEN** un consumidor abre CommandPalette desde un control propio (por ejemplo, el buscador de Navbar) en vez del atajo de teclado
- **THEN** CommandPalette se comporta igual que si se hubiera abierto con `⌘K`

#### Scenario: Sin resultados
- **WHEN** el texto escrito no coincide con ningún comando
- **THEN** CommandPalette lo indica explícitamente en vez de mostrar una lista vacía sin explicación

### Requirement: Opciones del componente Slider
El componente Slider SHALL permitir fijar uno o más valores numéricos sobre un rango continuo, presentando un pulgar por valor. Los pulgares no SHALL cruzarse entre sí, de modo que el orden de los valores se conserve siempre. Slider SHALL aceptar una separación mínima entre pulgares contiguos, para que el espacio entre dos no pueda reducirse a cero. Cada pulgar SHALL ser operable por teclado y SHALL exponer a las tecnologías de asistencia su valor actual, los límites dentro de los que puede moverse y un nombre que lo distinga de los demás.

#### Scenario: Fijar un valor arrastrando
- **WHEN** un usuario arrastra un pulgar a lo largo de la pista
- **THEN** el valor que ese pulgar representa cambia siguiendo su posición, sin que se alteren los valores de los demás pulgares

#### Scenario: Los pulgares no se cruzan
- **WHEN** un usuario arrastra un pulgar más allá de uno contiguo
- **THEN** el pulgar se detiene antes de cruzarlo, de modo que los valores nunca quedan desordenados

#### Scenario: Separación mínima entre pulgares
- **WHEN** un usuario acerca un pulgar a otro más allá de la separación mínima configurada
- **THEN** el pulgar se detiene a esa separación, de modo que el espacio entre ambos nunca llega a cero

#### Scenario: Operar por teclado
- **WHEN** un usuario enfoca un pulgar y usa el teclado para moverlo
- **THEN** su valor cambia sin necesidad de arrastrar, respetando los mismos límites y la misma separación mínima que el arrastre

#### Scenario: Cada pulgar se anuncia por separado
- **WHEN** una tecnología de asistencia recorre un Slider de varios pulgares
- **THEN** encuentra cada pulgar como un control propio, con su valor, sus límites y un nombre que permite saber cuál de todos es

### Requirement: Segmentos del componente Slider
Slider SHALL aceptar una descripción opcional de los tramos en que sus pulgares dividen la pista, con un rótulo y un color por tramo. Los tramos descritos SHALL corresponder uno a uno con los espacios que quedan entre pulgares, contando también el que va desde el inicio del rango al primer pulgar y el que va del último al final. Sin esa descripción, Slider SHALL presentarse como un control de valor corriente. El rótulo de cada tramo SHALL ser lo que lo identifica, de manera que el color solo lo refuerce y nunca sea la única señal.

#### Scenario: Ver una partición rotulada
- **WHEN** se describen los tramos de un Slider de varios pulgares
- **THEN** cada tramo se muestra con su color y su rótulo, y mover un pulgar cambia a la vez el tamaño de los dos tramos que ese pulgar separa

#### Scenario: Slider sin segmentos
- **WHEN** un Slider se usa sin describir tramos
- **THEN** se presenta como un control de valor corriente, sin colores ni rótulos por tramo

#### Scenario: El color del tramo no es la única señal
- **WHEN** un usuario no puede percibir la diferencia de color entre dos tramos
- **THEN** el rótulo de cada uno sigue identificándolo por completo

### Requirement: Opciones del componente LevelMeter
El componente LevelMeter SHALL representar una posición dentro de una escala ordinal discreta como una fila de segmentos de igual ancho, donde los segmentos hasta la posición alcanzada aparecen llenos y los restantes vacíos. SHALL aceptar la cantidad de pasos de la escala, con cuatro como valor por defecto, de modo que una escala futura de otra longitud lo reutilice sin bifurcarlo.

Los segmentos SHALL repartir el ancho disponible entre sí con una separación uniforme tomada de los alias de espaciado del sistema, nunca de un valor suelto. Los segmentos llenos SHALL usar el paso de relleno del matiz de acento que el componente recibe —uno de `sky`, `blue`, `violet` o `magenta`, el vocabulario vigente de la escala, que resuelve al valor del tema activo—; los vacíos SHALL dibujarse sobre la superficie neutra con un aro que los mantenga distinguibles del fondo sobre el que se los coloque.

LevelMeter SHALL aceptar además una **posición esperada** opcional y, cuando la recibe, dibujar una marca sobre los segmentos en el límite de esa posición, de modo que se lea "hasta acá" y no "en este escalón". La marca SHALL distinguirse de los segmentos por forma y no sólo por color, y SHALL quedar dentro del ancho del componente sin desplazar los segmentos ni cambiar su reparto. Sin posición esperada, LevelMeter SHALL dibujarse exactamente como antes de este requisito.

Cuando hay posición esperada, LevelMeter SHALL exponerla también a tecnologías de asistencia junto con la posición alcanzada, para que la comparación entre las dos no dependa de ver la marca.

LevelMeter NO SHALL dibujar fondo ni borde propios alrededor de la fila de segmentos: se apoya en lo que lo contenga, que es lo que le permite ir dentro de otra pieza sin recortarla.

LevelMeter NO SHALL comunicar su valor únicamente por color: SHALL exponer a tecnologías de asistencia la posición alcanzada y el total de pasos de la escala.

El componente SHALL exportarse desde el paquete publicado y SHALL declararse en el manifiesto del catálogo con su estado de madurez, de modo que aparezca en el inventario del sistema junto con los demás componentes.

#### Scenario: Posición dentro de la escala
- **WHEN** LevelMeter recibe una posición dentro de una escala de cuatro pasos
- **THEN** muestra llenos los segmentos hasta esa posición y vacíos los restantes, todos del mismo ancho

#### Scenario: Escala de otra longitud
- **WHEN** LevelMeter recibe una cantidad de pasos distinta de la de por defecto
- **THEN** dibuja esa cantidad de segmentos, repartiendo entre ellos el mismo ancho disponible

#### Scenario: Marca de la posición esperada
- **WHEN** LevelMeter recibe una posición esperada además de la alcanzada
- **THEN** dibuja una marca en el límite de esa posición, sin mover ni reducir los segmentos

#### Scenario: Sin posición esperada no hay marca
- **WHEN** LevelMeter no recibe una posición esperada
- **THEN** se dibuja igual que antes de existir esta opción, sin marca ni espacio reservado para ella

#### Scenario: La posición esperada llega a tecnologías de asistencia
- **WHEN** un lector de pantalla recorre un LevelMeter que tiene posición esperada
- **THEN** anuncia también esa posición, de modo que la comparación con la alcanzada no dependa de ver la marca

#### Scenario: Los segmentos se distinguen del fondo que los sostiene
- **WHEN** LevelMeter se coloca sobre cualquiera de las superficies del sistema, en tema claro u oscuro
- **THEN** tanto el relleno de los segmentos llenos como el aro de los vacíos alcanzan al menos 3:1 contra esa superficie

#### Scenario: El valor llega a tecnologías de asistencia
- **WHEN** un lector de pantalla recorre un LevelMeter
- **THEN** anuncia la posición alcanzada y el total de pasos, sin depender de que el usuario perciba el color de los segmentos

#### Scenario: Presente en el inventario del sistema
- **WHEN** se consulta el manifiesto del catálogo de componentes
- **THEN** LevelMeter figura con su nombre, su descripción, su estado de madurez y sus dependencias internas

### Requirement: Distinción de uso entre LevelMeter y SegmentedBar
El sistema SHALL mantener LevelMeter y SegmentedBar como piezas distintas, y la documentación SHALL establecer cuál corresponde a cada caso: LevelMeter cuenta pasos de una escala ordinal cerrada, donde los segmentos son iguales entre sí y lo que varía es cuántos están llenos; SegmentedBar reparte un total entre categorías, donde lo que varía es el ancho de cada segmento. NO SHALL usarse LevelMeter para representar proporciones ni SegmentedBar para representar un nivel dentro de una escala.

#### Scenario: Representar un nivel alcanzado
- **WHEN** una interfaz necesita mostrar en qué paso de una escala cerrada se encuentra algo
- **THEN** usa LevelMeter, cuyos segmentos son de ancho igual y se llenan hasta la posición alcanzada

#### Scenario: Representar una distribución
- **WHEN** una interfaz necesita mostrar cómo se reparte un total entre varias categorías
- **THEN** usa SegmentedBar, cuyos segmentos toman un ancho proporcional a su valor

### Requirement: Opciones del componente SeniorityCard
El componente SeniorityCard SHALL mostrar el nivel de seniority de una persona como una etiqueta con el nombre del nivel y, debajo, un medidor de cuatro segmentos que indica la posición del nivel dentro de la escala.

SeniorityCard NO SHALL dibujar fondo, borde ni sombra: es un bloque de contenido que se apoya en la superficie donde se lo coloque, no una superficie propia. En consecuencia NO SHALL componerse sobre la superficie Card, que existe justamente para aportar esos tres.

La escala SHALL ser cerrada de cuatro niveles —Principiante, Competente, Avanzado y Experto— y NO SHALL admitir un quinto nivel ni etiquetas libres. Un valor fuera de la escala SHALL renderizar un estado vacío documentado: ni un tono inventado, ni una etiqueta arbitraria, ni un fallo silencioso que deje la celda en blanco sin explicación.

La etiqueta SHALL usar el color de texto neutro del sistema en todos los niveles, y NO SHALL teñirse con el matiz del nivel. El único elemento que toma el color del nivel SHALL ser el medidor: la correspondencia entre nivel y matiz SHALL avanzar de gris a azul, a turquesa y a morado, de modo que la progresión se lea como avance de dominio y no como escala de riesgo. El rojo de marca NO SHALL participar de la escala.

SeniorityCard SHALL construirse componiendo LevelMeter como medidor, y NO SHALL reimplementar por su cuenta la lógica de los segmentos.

El componente SHALL exportarse desde el paquete publicado y SHALL declararse en el manifiesto del catálogo con su estado de madurez y sus dependencias internas.

#### Scenario: Nivel dentro de la escala
- **WHEN** SeniorityCard recibe uno de los cuatro niveles de la escala
- **THEN** muestra su nombre como etiqueta y llena en el medidor la cantidad de segmentos que corresponde a su posición

#### Scenario: Sin superficie propia
- **WHEN** se renderiza una SeniorityCard sobre cualquier superficie
- **THEN** no dibuja fondo, borde ni sombra: se ve la superficie que la contiene

#### Scenario: Valor fuera de la escala
- **WHEN** SeniorityCard recibe un valor que no pertenece a la escala de cuatro niveles
- **THEN** renderiza el estado vacío documentado, sin inventar un tono ni fallar en silencio

#### Scenario: La etiqueta no se tiñe
- **WHEN** se comparan las cuatro cards de la escala una junto a otra
- **THEN** las cuatro etiquetas comparten el mismo color de texto neutro, y lo único que cambia de color entre ellas es el medidor

#### Scenario: Un matiz por nivel en el medidor
- **WHEN** se comparan los medidores de los cuatro niveles
- **THEN** cada uno tiñe sus segmentos llenos con un matiz distinto, y los cuatro avanzan de gris a morado en el orden de la escala

#### Scenario: El rojo de marca queda fuera
- **WHEN** se inspeccionan todos los niveles de SeniorityCard
- **THEN** ninguno usa el rol de color de marca, que sigue reservado a la acción primaria de la vista

#### Scenario: Composición sobre la pieza existente
- **WHEN** cambia el aspecto de los segmentos en LevelMeter
- **THEN** SeniorityCard refleja ese cambio sin que su propio código se modifique

#### Scenario: Presente en el inventario del sistema
- **WHEN** se consulta el manifiesto del catálogo de componentes
- **THEN** SeniorityCard figura con su nombre, su descripción, su estado de madurez y sus dependencias internas, entre ellas LevelMeter

### Requirement: Dimensión fija de SeniorityCard
SeniorityCard SHALL ocupar un ancho fijo, idéntico en los cuatro niveles, y ese ancho NO SHALL variar con el nivel mostrado ni con la longitud de su etiqueta: la etiqueta más larga de la escala SHALL entrar sin recorte, y las cortas SHALL dejar aire en vez de encoger la pieza. El alto SHALL ser fijo también, con un valor para la densidad amplia y otro para la compacta, y ambas medidas SHALL incluir el borde dentro de la caja en vez de sumarlo por fuera.

Ese ancho constante es lo que permite comparar el nivel de una fila con el de otra de un vistazo; un ancho que dependa del texto convertiría la comparación en una ilusión. El alto constante es lo que mantiene parejas las filas de un listado, incluidas las que no tienen dato.

#### Scenario: El ancho no depende del nivel
- **WHEN** se renderizan las cuatro cards de la escala, una por nivel
- **THEN** las cuatro miden exactamente el mismo ancho

#### Scenario: La etiqueta más larga entra sin recorte
- **WHEN** se renderiza la card del nivel cuya etiqueta es la más larga de la escala
- **THEN** la etiqueta se muestra completa, sin truncamiento ni ajuste a dos líneas, dentro del mismo ancho que las demás

#### Scenario: Alto por densidad
- **WHEN** se renderiza la misma card en densidad amplia y en densidad compacta
- **THEN** cada una toma el alto fijo de su densidad, con el borde contenido dentro de esa medida en ambos casos

#### Scenario: Comparación entre filas
- **WHEN** varias cards de niveles distintos aparecen en filas sucesivas de un listado
- **THEN** todas se alinean en el mismo ancho, de modo que sus medidores queden comparables entre sí

#### Scenario: El estado vacío conserva la dimensión
- **WHEN** una fila sin nivel asignado aparece entre filas que sí lo tienen
- **THEN** su card ocupa exactamente la misma dimensión, sin desalinear la columna

### Requirement: Accesibilidad de SeniorityCard
SeniorityCard NO SHALL comunicar el nivel únicamente por color. La etiqueta textual con el nombre del nivel SHALL acompañar siempre al medidor; cuando una variante de ancho reducido omita la etiqueta visible, el nombre del nivel SHALL viajar igualmente en el nombre accesible del componente y en su tooltip.

El contraste SHALL verificarse de forma automatizada y no en la revisión manual: la etiqueta SHALL alcanzar al menos 4.5:1 contra las superficies del sistema sobre las que la card puede quedar apoyada, y los segmentos y sus aros SHALL alcanzar al menos 3:1 contra esas mismas superficies.

#### Scenario: La etiqueta acompaña al medidor
- **WHEN** se renderiza una SeniorityCard en su forma habitual
- **THEN** el nombre del nivel aparece como texto, y el color del medidor no es el único canal

#### Scenario: Variante sin etiqueta visible
- **WHEN** se renderiza la variante de ancho reducido, que no muestra la etiqueta
- **THEN** el nombre del nivel sigue disponible en el nombre accesible del componente y en su tooltip

#### Scenario: Contraste de la etiqueta verificado automáticamente
- **WHEN** corre la verificación automatizada sobre las superficies donde la card puede apoyarse
- **THEN** el color de texto de la etiqueta alcanza al menos 4.5:1 contra cada una, y la verificación falla si no llega

#### Scenario: Contraste de los segmentos verificado automáticamente
- **WHEN** corre la verificación automatizada sobre los cuatro matices y esas mismas superficies
- **THEN** los segmentos y sus aros alcanzan al menos 3:1, y la verificación falla si alguno no llega

### Requirement: Opciones del componente Link
El componente Link SHALL presentar texto que navega a otra dirección, renderizando un elemento de ancla real, de modo que el foco por teclado, el menú contextual del navegador y la apertura en otra pestaña funcionen sin que el componente los reimplemente.

Link SHALL ofrecer el tono como opción del componente y NO SHALL fijarlo: el tono de marca SHALL ser el valor por defecto, y SHALL existir además un tono neutro que toma el color de texto de la superficie sobre la que está. Elegir el tono neutro NO SHALL exigir reescribir ni sobrescribir las clases del componente.

El anillo de foco SHALL derivarse del tono elegido, de modo que un enlace neutro no muestre un foco de marca.

En cualquier tono, Link SHALL mostrar un subrayado al pasar el puntero y al recibir el foco por teclado. En el tono de marca ese subrayado SHALL acompañar al color, que ya distingue al enlace en reposo; en el tono neutro SHALL ser la única señal visual que lo distingue del texto que lo rodea, que en reposo NO SHALL tener ninguna.

Link SHALL permitir ceder su etiqueta al elemento que recibe como hijo, de modo que un consumidor pueda aplicar el estilo y el comportamiento del enlace sobre el componente de navegación de su propio router. El componente NO SHALL depender de ningún router ni de ninguna biblioteca de navegación.

#### Scenario: Tono por defecto
- **WHEN** se usa Link sin indicar tono
- **THEN** el enlace se presenta con el color del rol `brand` del sistema de diseño, que es el tratamiento que el sistema daba a los enlaces antes de que el tono fuera una opción

#### Scenario: Tono neutro
- **WHEN** se usa Link indicando el tono neutro
- **THEN** el enlace se presenta con el color de texto neutro de la superficie, sin ningún color de marca, y sin que el consumidor tenga que pasar clases propias

#### Scenario: El anillo de foco acompaña al tono
- **WHEN** un enlace de tono neutro recibe el foco por teclado
- **THEN** el anillo de foco se dibuja en el tono neutro del sistema, no en el de marca

#### Scenario: El subrayado aparece en hover y en foco
- **WHEN** un usuario pasa el puntero sobre un enlace, o lo alcanza con el teclado, en cualquiera de los dos tonos
- **THEN** el enlace muestra un subrayado mientras dura esa interacción

#### Scenario: El tono neutro no se distingue en reposo
- **WHEN** un enlace de tono neutro se muestra junto a texto plano, sin puntero encima y sin foco
- **THEN** ambos se ven igual, y el enlace se revela como tal recién al pasar el puntero o al alcanzarlo con el teclado

#### Scenario: Abrir en otra pestaña
- **WHEN** un usuario hace clic con el botón central, o con la tecla modificadora de su sistema, sobre un enlace
- **THEN** el navegador abre el destino en otra pestaña, como con cualquier ancla

#### Scenario: Enlace sobre el componente de navegación del consumidor
- **WHEN** un consumidor pide que Link ceda su etiqueta y le pasa como hijo el componente de enlace de su propio router
- **THEN** se renderiza un único elemento de ancla, con el estilo y el tono de Link y con la navegación del router del consumidor, sin anclas anidadas

### Requirement: Distinción de uso entre Link y Button de tipo enlace
El sistema SHALL distinguir en su documentación cuándo corresponde Link y cuándo corresponde la variante de tipo enlace de Button: Link es para lo que navega a otra dirección y Button de tipo enlace es para lo que ejecuta una acción sin salir de la página, aunque ambos se parezcan visualmente. La pieza que navega SHALL renderizar un ancla y la que ejecuta una acción SHALL renderizar un botón, de modo que la semántica corresponda a lo que hace y no a lo que parece.

#### Scenario: Elegir entre las dos piezas
- **WHEN** alguien consulta la documentación para decidir entre Link y Button de tipo enlace
- **THEN** encuentra el criterio explícito de que Link navega y Button de tipo enlace ejecuta una acción, con un ejemplo de cada caso

#### Scenario: La semántica corresponde a lo que hace
- **WHEN** una tecnología de asistencia recorre una página que usa ambas piezas
- **THEN** anuncia como enlace lo que navega y como botón lo que ejecuta una acción

### Requirement: Alineación horizontal del shell
El contenido de los elementos de navegación del shell —los ítems del Sidebar, los rótulos de sus grupos, su control de colapso y la marca del Navbar— SHALL empezar sobre una misma vertical, de modo que el borde izquierdo del shell se lea como una sola línea. Esa alineación SHALL surgir de la estructura de cada elemento y no de compensar diferencias con valores sueltos, para que un cambio de relleno o de borde no la rompa en silencio.

#### Scenario: Los ítems y sus rótulos de grupo se alinean
- **WHEN** se muestra un grupo del Sidebar con su rótulo y sus ítems
- **THEN** el rótulo del grupo empieza en la misma vertical que los íconos de los ítems que encabeza

#### Scenario: El Sidebar se alinea con el Navbar
- **WHEN** se muestran Navbar y Sidebar en la misma pantalla
- **THEN** la marca del Navbar y el primer ícono del Sidebar empiezan en la misma vertical

#### Scenario: El control de colapso se alinea con los ítems
- **WHEN** se muestra el control de colapso del Sidebar expandido
- **THEN** su ícono empieza en la misma vertical que los íconos de los ítems, pese a que ese control no lleva indicador de activo

#### Scenario: El indicador de activo no desplaza el contenido
- **WHEN** un ítem del Sidebar pasa a estar activo
- **THEN** su contenido no se corre: el indicador ocupa un espacio que el ítem ya reservaba estando inactivo

### Requirement: Zona activa del control de colapso de Sidebar
El control de colapso SHALL responder al clic y mostrar su estado de hover en toda la franja que su separador delimita, de borde a borde del Sidebar, y no sólo sobre su texto e ícono. Su presentación SHALL corresponder a esa franja completa en vez de a un elemento embutido.

#### Scenario: Toda la franja responde
- **WHEN** una persona apunta a cualquier punto de la franja del control de colapso, incluido el espacio a la derecha del texto
- **THEN** esa zona muestra su estado de hover y el clic colapsa o expande el Sidebar

#### Scenario: La franja se lee como una sola zona
- **WHEN** se muestra el control de colapso
- **THEN** su fondo de hover llega a los bordes de la franja, sin esquinas redondeadas que lo separen visualmente del área que el separador delimita

#### Scenario: El control colapsado sigue respondiendo en toda su franja
- **WHEN** el Sidebar está colapsado y el control muestra sólo su ícono
- **THEN** la franja completa sigue siendo clickeable, en vez de reducirse al tamaño del ícono

### Requirement: Opciones del componente SearchField
El componente SearchField SHALL presentar un campo de texto para búsqueda con un ícono de lupa integrado, y SHALL delegar en el consumidor qué hace con el valor ingresado — no SHALL ejecutar ninguna búsqueda por sí mismo. Es una variante propia, distinta de `NavbarSearch`, pensada para acotar una búsqueda al contenido de una pantalla (por ejemplo, una tabla) en vez de a toda la plataforma.

#### Scenario: Ingresar un término de búsqueda
- **WHEN** un usuario escribe en SearchField
- **THEN** el ícono de lupa permanece visible junto al texto ingresado, y SearchField notifica el valor al consumidor en cada cambio

#### Scenario: Campo vacío
- **WHEN** SearchField no tiene valor ingresado
- **THEN** muestra su placeholder junto al ícono de lupa

### Requirement: Opciones del componente FilterButton
El componente FilterButton SHALL presentar un botón con una etiqueta y un indicador visual de despliegue, que al activarse muestra un listado de opciones marcables. SHALL distinguirse visualmente cuando al menos una opción está activa, y SHALL notificar al consumidor los cambios de selección — no SHALL filtrar ningún dato por sí mismo.

#### Scenario: Abrir el listado de opciones
- **WHEN** un usuario activa un FilterButton
- **THEN** se muestra el listado de opciones marcables asociado

#### Scenario: Marcar una o más opciones
- **WHEN** un usuario marca una o más opciones del listado
- **THEN** FilterButton notifica el conjunto de opciones marcadas al consumidor, y el botón muestra su estado activo

#### Scenario: Sin opciones activas
- **WHEN** ninguna opción de FilterButton está marcada
- **THEN** el botón se muestra en su estado por defecto, sin el indicador de estado activo

### Requirement: Opciones del componente PaginationBar
El componente PaginationBar SHALL combinar, en una sola fila, un resumen textual del rango de resultados mostrado y el total, a la izquierda, con un selector de cantidad de resultados por página y la navegación de `Pagination` ya existente, a la derecha. PaginationBar SHALL componer `Pagination` sin modificarlo ni duplicar su lógica de navegación.

#### Scenario: Resumen de resultados
- **WHEN** PaginationBar recibe el rango actual y el total de resultados
- **THEN** muestra un texto con ambos datos a la izquierda de la fila

#### Scenario: Cambiar la cantidad de resultados por página
- **WHEN** un usuario elige una cantidad distinta en el selector de tamaño de página
- **THEN** PaginationBar notifica el nuevo tamaño al consumidor, sin decidir por sí mismo cómo recalcular la página actual

#### Scenario: Navegación delegada en Pagination
- **WHEN** un usuario navega entre páginas dentro de PaginationBar
- **THEN** el cambio de página se comporta exactamente igual que usar `Pagination` de forma directa, porque PaginationBar lo compone sin alterar su comportamiento

### Requirement: Opciones del componente AppShell
El componente AppShell SHALL componer la estructura completa de una aplicación interna: una columna de navegación lateral a toda la altura de la ventana, una barra superior que ocupa el ancho restante a su lado, y el área de contenido que recibe como hijos.

La columna lateral SHALL comenzar con una cabecera de marca — el cuadro de marca y el nombre del producto — cuya altura SHALL coincidir con la de la barra superior, de modo que el filete inferior de ambas corra como una sola línea continua de borde a borde. Debajo de la cabecera SHALL renderizar la navegación del componente Sidebar, sin la franja de colapso inferior que Sidebar muestra cuando se usa suelto: en AppShell el control de colapso vive en la barra.

La barra superior SHALL comenzar con un botón de menú (hamburguesa) como su primer elemento, adyacente al borde de la columna lateral, que contrae y expande la navegación. El botón SHALL llevar un nombre accesible que diga lo que hace y SHALL comunicar el estado actual a las tecnologías de asistencia. A la derecha, la barra SHALL ofrecer las mismas utilidades que Navbar — enlaces de utilidad, notificaciones y cuenta — y la búsqueda cuando la aplicación la pide, con los mismos contratos que esas piezas ya tienen.

Colapsada, la columna lateral SHALL reducirse al ancho de sólo-íconos que Sidebar ya define, la cabecera SHALL mostrar sólo el cuadro de marca, y cada ítem SHALL seguir ofreciendo su nombre por tooltip y a las tecnologías de asistencia. El estado de colapso SHALL persistir entre sesiones bajo la misma clave de almacenamiento que Sidebar usa suelto, de modo que la preferencia de la persona sobreviva a la adopción de AppShell, y SHALL colapsarse automáticamente por debajo del mismo umbral de ancho de ventana que Sidebar aplica por su cuenta.

AppShell NO SHALL modificar los contratos de Navbar ni de Sidebar: es composición sobre ellos, y quien los usa sueltos no cambia.

#### Scenario: El sidebar llega arriba y la marca vive en su cabecera
- **WHEN** una aplicación renderiza AppShell
- **THEN** la columna lateral ocupa toda la altura de la ventana, su cabecera muestra el cuadro de marca y el nombre del producto, y la barra superior queda a su lado, no encima

#### Scenario: La línea de la cabecera corre continua
- **WHEN** se observa la unión entre la cabecera de la columna lateral y la barra superior
- **THEN** ambas comparten altura y su filete inferior se lee como una sola línea de borde a borde

#### Scenario: La hamburguesa contrae y expande
- **WHEN** la persona activa el botón de menú de la barra, con el puntero o con el teclado
- **THEN** la columna lateral alterna entre su ancho expandido y el de sólo-íconos, y el botón comunica el estado nuevo a las tecnologías de asistencia

#### Scenario: Sin franja de colapso al pie
- **WHEN** se renderiza AppShell
- **THEN** la columna lateral no muestra la franja inferior de "Colapsar" que Sidebar muestra suelto — el único control de colapso es la hamburguesa de la barra

#### Scenario: El colapso persiste entre sesiones
- **WHEN** la persona colapsa la navegación y vuelve a abrir la aplicación en otra sesión
- **THEN** la navegación aparece colapsada, y la preferencia guardada antes de adoptar AppShell (con Sidebar suelto) se respeta

#### Scenario: Colapso automático en ventanas angostas
- **WHEN** la ventana baja del umbral de ancho que Sidebar ya define para colapsarse solo
- **THEN** AppShell colapsa la navegación, y la persona puede re-expandirla con la hamburguesa sin que el siguiente render se lo deshaga

#### Scenario: Colapsado conserva la vía asistida
- **WHEN** la navegación está colapsada a sólo-íconos
- **THEN** cada ítem sigue exponiendo su nombre por tooltip y a las tecnologías de asistencia, y el ítem activo conserva sus señales

#### Scenario: Las utilidades de la barra conservan sus contratos
- **WHEN** la aplicación pasa a AppShell los enlaces de utilidad, las notificaciones, la cuenta o la búsqueda
- **THEN** se comportan exactamente como en Navbar — mismos paneles, mismos callbacks — sin contrato nuevo que aprender

### Requirement: Distinción de uso entre AppShell y Navbar con Sidebar sueltos
El sistema SHALL distinguir en su documentación cuándo corresponde AppShell y cuándo componer Navbar y Sidebar por separado: AppShell es la composición por defecto para una aplicación con navegación lateral — trae la fusión resuelta (sidebar a toda altura, hamburguesa en la barra, colapso persistente) —, mientras que Navbar suelto sigue siendo la pieza para una aplicación sin navegación lateral, y Sidebar suelto para una superficie que necesita navegación lateral sin la barra del sistema.

#### Scenario: Elegir la composición
- **WHEN** alguien consulta la documentación para armar el esqueleto de una aplicación interna
- **THEN** encuentra el criterio explícito: con navegación lateral, AppShell; sólo barra, Navbar; sólo navegación lateral, Sidebar — y la advertencia de no recomponer la fusión a mano

### Requirement: Opciones del componente OptionCard
El componente OptionCard SHALL presentar una opción de un conjunto mutuamente excluyente como una tarjeta: un radio, un título, una descripción opcional, un atajo de teclado opcional mostrado con Kbd, y contenido opcional propio de esa opción (por ejemplo un Select o un grupo de chips). Las tarjetas SHALL agruparse en OptionCardGroup, que SHALL mantener a lo sumo una seleccionada y SHALL navegarse por teclado como un grupo de radios: las flechas mueven foco y selección juntos; Tab entra al contenido interno de la tarjeta seleccionada. La tarjeta seleccionada SHALL marcarse con el borde neutro intenso y el radio lleno, sin ocupar el color de marca, y NO SHALL cambiar de tamaño al seleccionarse. Una tarjeta deshabilitada SHALL verse con el tratamiento de deshabilitado del resto del catálogo y no SHALL poder seleccionarse. El grupo SHALL admitir disposición en columnas iguales o apilada.

#### Scenario: Elegir una tarjeta
- **WHEN** un usuario activa una tarjeta no seleccionada, con mouse o con las flechas del teclado
- **THEN** el grupo notifica el nuevo valor al consumidor, la tarjeta elegida muestra el radio lleno y el borde neutro intenso, y la anterior vuelve al estado de reposo sin que ninguna cambie de tamaño

#### Scenario: Contenido interno de la opción
- **WHEN** una tarjeta seleccionada contiene un control (por ejemplo un Select)
- **THEN** el control es alcanzable con Tab desde la tarjeta y operarlo no cambia la selección del grupo

#### Scenario: Atajo visible
- **WHEN** una tarjeta recibe un atajo de teclado
- **THEN** lo muestra con Kbd en su cabecera; el atajo es informativo y la tecla la maneja el consumidor

#### Scenario: Tarjeta deshabilitada
- **WHEN** una tarjeta está deshabilitada
- **THEN** las flechas del grupo la saltan y activarla con el mouse no cambia la selección

### Requirement: Opciones del componente Textarea
El componente Textarea SHALL ser el par multilínea de Input, con la misma anatomía y el mismo tratamiento visual de reposo, foco, error y deshabilitado: etiqueta visible asociada al campo, ayuda opcional debajo, mensaje de error que reemplaza a la ayuda y se anuncia a las tecnologías de asistencia, y marca de obligatorio en la etiqueta. SHALL admitir la altura inicial en filas y el redimensionado vertical por el usuario, nunca horizontal.

#### Scenario: Misma anatomía que Input
- **WHEN** se renderizan un Input y un Textarea con etiqueta, ayuda y error
- **THEN** ambos muestran la etiqueta, la ayuda y el error con la misma posición, tipografía y colores, y el error reemplaza a la ayuda

#### Scenario: Redimensionar
- **WHEN** un usuario arrastra el control de redimensionado de un Textarea
- **THEN** el campo crece o se achica sólo en vertical, sin desbordar el ancho de su contenedor

#### Scenario: Error anunciado
- **WHEN** un Textarea recibe un error
- **THEN** el campo queda marcado como inválido para las tecnologías de asistencia y el mensaje se asocia al campo

### Requirement: Opciones del componente Kbd
El componente Kbd SHALL mostrar una tecla o combinación de teclas como una pieza inline en tipografía monoespaciada sobre fondo neutro con borde, para documentar atajos de teclado. SHALL ser sólo informativo: NO SHALL ser interactivo ni recibir foco. SHALL admitir dos tamaños (`sm`, `md`) y SHALL exponerse con el elemento semántico de tecla.

#### Scenario: Atajo documentado
- **WHEN** se renderiza un Kbd con el texto de una tecla
- **THEN** se muestra en mono sobre fondo neutro con borde, con el elemento semántico de tecla, sin rol interactivo ni foco

#### Scenario: Combinación de teclas
- **WHEN** un pie de panel muestra varios Kbd seguidos con texto entre ellos
- **THEN** cada tecla se lee como una pieza separada y el texto entre ellas conserva la tipografía del contexto

### Requirement: Distinción de uso entre OptionCard, RadioGroup, SegmentedControl y Chip seleccionable
La documentación SHALL establecer cuándo usar cada control de elección excluyente: RadioGroup cuando las opciones son una etiqueta corta y no necesitan explicación ni contenido propio; SegmentedControl cuando son dos a cuatro opciones cortas que cambian una vista y caben en una línea; OptionCard cuando cada opción necesita describirse o trae su propio control, y la decisión merece espacio. Para filtros, Chip seleccionable cuando las opciones deben quedar a la vista y son pocas; FilterButton cuando son muchas o multi-selección y pueden vivir en un menú.

#### Scenario: Elección con contenido propio
- **WHEN** una opción trae un control que sólo aplica cuando está elegida
- **THEN** la documentación indica OptionCard y no RadioGroup ni SegmentedControl

#### Scenario: Filtro a la vista
- **WHEN** una pantalla filtra por un puñado de valores que el usuario debe ver sin abrir nada
- **THEN** la documentación indica Chip seleccionable con contador, y FilterButton cuando las opciones son muchas

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

### Requirement: Opciones del componente Sparkline
El sistema SHALL ofrecer un componente **Sparkline** que dibuja una serie corta de valores como barras verticales, ordenadas del más viejo al más reciente, dentro de un alto fijo y sin ejes, cuadrícula ni cifras: se lee como forma, para acompañar a un número que ya está escrito al lado.

Cada punto SHALL declarar su valor y la etiqueta de su período. La altura de cada barra SHALL ser proporcional al mayor valor de la serie, de modo que la forma describa la variación relativa y no una escala absoluta que el componente no conoce.

**El último punto es el presente** y SHALL distinguirse de los demás, porque una serie de esta clase se lee desde el ahora hacia atrás. El componente SHALL permitir elegir el tono de acento con el que se destaca, y SHALL NOT decidir por su cuenta si la variación es buena o mala: si bajar es una mejora lo sabe la pantalla, no la serie.

Un valor **cero** SHALL seguir dibujándose con una barra mínima visible: una barra que desaparece se lee como un dato que falta, y son cosas distintas.

El componente SHALL exponer un nombre accesible para la serie completa y SHALL NOT exigir que el lector recorra barra por barra: cada barra SHALL quedar fuera del árbol de accesibilidad, con su etiqueta y su valor disponibles al pasar el puntero.

Una serie de un solo punto SHALL dibujarse igual —es el caso de quien todavía no tiene historial— y una serie vacía SHALL NOT dibujar nada.

#### Scenario: Leer la forma de la serie
- **WHEN** una card muestra un Sparkline con los valores de los últimos ciclos
- **THEN** ve una barra por ciclo, del más viejo al más reciente, con alturas proporcionales al mayor de la serie

#### Scenario: El presente se distingue
- **WHEN** se dibuja una serie de varios puntos
- **THEN** el último se ve distinto de los anteriores, en el tono que la pantalla eligió

#### Scenario: Un cero se sigue viendo
- **WHEN** un punto de la serie vale cero
- **THEN** su barra se dibuja con una altura mínima visible, y no desaparece

#### Scenario: La serie se anuncia una sola vez
- **WHEN** un lector de pantalla recorre la card
- **THEN** encuentra la serie como una sola imagen con su nombre, y no seis elementos sueltos sin sentido

#### Scenario: Sin historial
- **WHEN** la serie tiene un único punto
- **THEN** se dibuja igual, sin tratar el caso como un error; y con la serie vacía no se dibuja nada

### Requirement: La hoja publicada no le gana a las utilidades del consumidor
La hoja de estilos que el paquete publica SHALL emitir sus utilidades de modo que las que escribe el consumidor **manden sobre ellas**, sin que el consumidor tenga que declarar un orden de capas, ordenar sus importaciones ni marcar nada como importante.

El motivo es que las dos hojas conviven: el paquete distribuye utilidades ya compiladas y el consumidor compila las suyas. Entre utilidades la especificidad siempre empata, así que dentro de una misma capa decide el orden de aparición, y la hoja del paquete se importa después. Dentro de una sola hoja Tailwind ordena las variantes después de las utilidades base —por eso `w-full lg:w-80` funciona—; al concatenar dos hojas ese orden se pierde y la variante del consumidor deja de aplicarse.

El caso que SHALL quedar resuelto es el par (utilidad base publicada por el paquete, variante del consumidor sobre la misma propiedad): `w-full` contra `lg:w-80`, `flex-col` contra `md:flex-row`, `p-4` contra `lg:p-8`. Un consumidor SHALL poder escribir esos pares y obtener el comportamiento que Tailwind describe.

El par inverso SHALL quedar igual de resuelto: (variante publicada por el paquete, utilidad base del consumidor sobre la misma propiedad). Las variantes con que un componente dibuja su estado —`peer-checked:opacity-100` para el punto del radio o el check de la casilla, `hover:`, `focus-visible:`, `data-[state]`— SHALL ganar a cualquier utilidad base que toque la misma propiedad, la publique el paquete o la genere el consumidor porque otra pantalla suya la usa. Es el orden que Tailwind garantiza dentro de una sola hoja, y perderlo no produce error: el control se marca y no se ve.

Las utilidades publicadas SHALL seguir por encima de la base y de los componentes del propio paquete: bajarlas por debajo de la capa base rompería toda utilidad que el paquete publique y el consumidor no compile —un `p-4` que ningún archivo del consumidor escribe— contra el reset universal que las aplicaciones suelen tener en base.

Esta condición SHALL vigilarse sobre la hoja publicada, porque su pérdida no produce ningún error: nada falla al compilar, ninguna prueba mira la cascada, y el síntoma aparece como una pantalla que se ve mal.

#### Scenario: Una variante del consumidor le gana a la utilidad base del paquete
- **WHEN** un consumidor escribe `w-full lg:w-80` en un elemento y mira la pantalla por encima del punto de corte `lg`
- **THEN** el elemento mide 20rem, y no el ancho completo

#### Scenario: Una variante de estado del paquete le gana a una utilidad base del consumidor
- **WHEN** un radio dibuja su punto con `opacity-0` en reposo y `peer-checked:opacity-100` al marcarse, y el consumidor genera `opacity-0` por su cuenta porque otra pantalla suya lo usa
- **THEN** al marcar el radio el punto aparece igual: la variante publicada gana a la utilidad base, venga de la hoja que venga

#### Scenario: Una utilidad que sólo publica el paquete sigue aplicándose
- **WHEN** el consumidor usa una clase que el paquete publica pero que su propio código no escribe en ninguna parte —así que su Tailwind no la genera— y su hoja tiene un reset universal en la capa base
- **THEN** la utilidad publicada se aplica igual, y no queda anulada por ese reset

#### Scenario: La condición se vigila sola
- **WHEN** la hoja publicada vuelve a emitir sus utilidades de forma que le ganen a las del consumidor
- **THEN** la verificación del paquete falla y lo dice, en vez de publicarse y aparecer como una pantalla desacomodada

#### Scenario: El consumidor no tiene que saber nada de esto
- **WHEN** un consumidor instala el paquete e importa su hoja después de la suya
- **THEN** no necesita declarar capas, reordenar importaciones ni usar `!important` para que sus utilidades manden

### Requirement: Realce del disparador de cuenta de Navbar

El disparador del panel de cuenta de Navbar no SHALL pintar una superficie de realce con forma distinta de la del avatar que contiene: no SHALL mostrar fondo al recibir el puntero ni mientras su panel está abierto. El anillo de foco por teclado SHALL seguir presente y visible: es la única señal del estado del control que no puede perderse. Ese anillo SHALL corresponderse con un recorrido por teclado y no con uno por puntero: cerrado el panel que se abrió con un clic, el disparador no SHALL quedar enfocado ni mostrar anillo; cerrado el que se abrió por teclado, el foco SHALL volver al disparador con su anillo. El resto de los controles de la zona de utilidades —enlaces de utilidad, botón de notificaciones y botón de menú de la variante compacta— SHALL conservar el realce rectangular que ya tienen, porque su anatomía sí es rectangular.

#### Scenario: El puntero sobre el avatar no pinta un rectángulo

- **WHEN** una persona pasa el puntero sobre el disparador de cuenta
- **THEN** no aparece ninguna superficie de fondo detrás del avatar, ni rectangular ni de ninguna otra forma

#### Scenario: Con el panel abierto tampoco hay superficie

- **WHEN** el panel de cuenta está abierto
- **THEN** el disparador sigue sin pintar fondo, y la señal de que el control está activo es el propio panel desplegado

#### Scenario: El foco por teclado sigue siendo visible

- **WHEN** una persona que navega por teclado lleva el foco al disparador de cuenta
- **THEN** el disparador muestra su anillo de foco, distinguible de su estado en reposo

#### Scenario: Cerrado con el mouse, el avatar no queda con anillo

- **WHEN** una persona abre el panel de cuenta con un clic y después lo cierra
- **THEN** el disparador queda sin foco y sin anillo, sin importar que el panel devuelva el foco al cerrarse

#### Scenario: Cerrado por teclado, el foco vuelve al disparador

- **WHEN** una persona abre el panel de cuenta desde el teclado y después lo cierra
- **THEN** el foco vuelve al disparador y su anillo se ve, para que sepa dónde quedó parada

#### Scenario: Sin el nombre visible, el avatar queda solo

- **WHEN** el ancho disponible oculta el nombre de la persona y el disparador queda reducido al avatar
- **THEN** el puntero sobre el avatar no dibuja un contenedor alrededor del círculo

#### Scenario: Las demás utilidades conservan su realce

- **WHEN** una persona pasa el puntero sobre el botón de notificaciones o sobre un enlace de utilidad
- **THEN** ese control sí muestra su superficie de realce, igual que antes de este cambio
