## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover, CommandPalette, Link, CapacityBar, DistributionCard, Meter y AppShell.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover, CommandPalette, Link, CapacityBar, DistributionCard, Meter y AppShell aparecen como componentes instalables
