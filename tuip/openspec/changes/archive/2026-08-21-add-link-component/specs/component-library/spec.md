## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover, CommandPalette y Link.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover, CommandPalette y Link aparecen como componentes instalables
