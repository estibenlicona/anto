## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Textarea, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, OptionCard, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, AppShell, Accordion, Popover, CommandPalette, Link, Kbd, CapacityBar, DistributionCard y Meter.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Textarea, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, OptionCard, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, AppShell, Accordion, Popover, CommandPalette, Link, Kbd, CapacityBar, DistributionCard y Meter aparecen como componentes instalables

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

## ADDED Requirements

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
