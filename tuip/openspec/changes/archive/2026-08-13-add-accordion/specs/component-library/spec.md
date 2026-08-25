## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar y Accordion.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar y Accordion aparecen como componentes instalables

## ADDED Requirements

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
