## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover y CommandPalette.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover y CommandPalette aparecen como componentes instalables

## ADDED Requirements

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
