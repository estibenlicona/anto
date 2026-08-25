## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion y Popover.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion y Popover aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente Popover
El componente Popover SHALL anclar una superficie de contenido arbitrario a su disparador, abierta y cerrada por el propio disparador, y SHALL cerrarse con la tecla Escape o al hacer clic fuera de su contenido, devolviendo el foco al disparador. La superficie SHALL usar el ancho mínimo de 280px definido para popovers en el sistema de diseño, ampliable hasta 360px según el contenido.

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
