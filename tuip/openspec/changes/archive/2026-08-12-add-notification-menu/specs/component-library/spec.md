## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper y NotificationMenu.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper y NotificationMenu aparecen como componentes instalables

## ADDED Requirements

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
