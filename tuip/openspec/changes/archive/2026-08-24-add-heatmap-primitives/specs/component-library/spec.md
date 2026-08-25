## MODIFIED Requirements

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

## ADDED Requirements

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
