## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal y Drawer.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal y Drawer aparecen como componentes instalables

## ADDED Requirements

### Requirement: Comportamiento compartido de Modal y Drawer
Modal y Drawer SHALL atrapar el foco de teclado dentro de su propio contenido mientras están abiertos, SHALL cerrarse con la tecla Escape, y SHALL devolver el foco al elemento que los abrió al cerrarse. Un Modal no SHALL abrir otro Modal.

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
