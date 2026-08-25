## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover, CommandPalette, Link, CapacityBar, DistributionCard y Meter.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover, CommandPalette, Link, CapacityBar, DistributionCard y Meter aparecen como componentes instalables

### Requirement: Opciones del componente Progress
El componente Progress SHALL representar un valor de avance entre 0 y 100 como una barra horizontal, SHALL saturar su color a la severidad `danger` en vez de desbordar visualmente la barra cuando el valor supera 100, y SHALL aceptar una opción de relleno de marca que reemplaza el color de severidad por el degradado de marca del sistema. Esa opción SHALL ser explícita: por defecto el componente conserva el relleno por severidad. El componente SHALL aceptar además un umbral de advertencia (`warningFrom`, entre 0 y 100): cuando el valor lo alcanza o supera, y mientras no pase de 100, el relleno por severidad es `warning`; sin el umbral, el relleno es `success` hasta 100 inclusive, como hasta ahora.

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

## ADDED Requirements

### Requirement: Opciones del componente CapacityBar
El componente CapacityBar SHALL representar una capacidad asignada frente a una disponible: una cabecera con `asignado / disponible` seguidos de una unidad opcional (formateados con un decimal y cifras tabulares), el porcentaje de ocupación (`asignado / disponible`, 0 cuando la disponible es 0) coloreado por severidad según un umbral de advertencia configurable (por defecto 85: `success` por debajo, `warning` desde el umbral, `danger` al alcanzar o superar el 100 %), una barra apilada cuyas partes se dimensionan sobre la capacidad disponible (SegmentedBar con `total`) y cuyo color sale del vocabulario de acento, una leyenda con punto, etiqueta y cifra por parte, y una lectura final: lo libre ("N libre", con la etiqueta configurable) o, al alcanzar el tope, un texto de tope (por defecto "Al tope") en color `danger`. Cuando la capacidad asignada es 0 y no hay partes, el componente SHALL mostrar la variante vacía: cifra 0.0 atenuada, barra vacía y un texto configurable (por defecto "Sin capacidad asignada"), sin porcentaje.

#### Scenario: Ocupación con margen
- **WHEN** CapacityBar recibe 1.8 asignado sobre 2.0 disponible, partes BAU 1.1 y Transformación 0.7 y el umbral por defecto
- **THEN** muestra "1.8 / 2.0", "90%" en `warning`, dos tramos de 55 % y 35 % del ancho, la leyenda con 1.1 y 0.7, y "0.2 libre"

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
