## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer y ActivityTimeline.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer y ActivityTimeline aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente ActivityTimeline
El componente ActivityTimeline SHALL presentar una secuencia de entradas ordenada, y cada entrada SHALL nombrar al actor antes que la acción, distinguiendo tipográficamente al actor del resto del texto. Cada entrada SHALL admitir una marca de tiempo y, opcionalmente, una línea de detalle secundaria. El color asociado a una entrada SHALL ser un refuerzo visual y no SHALL ser la única forma de distinguir su naturaleza.

#### Scenario: El actor se distingue del resto del texto
- **WHEN** se renderiza una entrada de ActivityTimeline
- **THEN** el actor aparece antes que la acción y se distingue tipográficamente de ella

#### Scenario: Detalle secundario opcional
- **WHEN** una entrada no tiene línea de detalle
- **THEN** ActivityTimeline la muestra igual, sin dejar un espacio vacío en el lugar del detalle

#### Scenario: El color no es la única fuente
- **WHEN** una persona que no distingue el color de una entrada la consulta
- **THEN** puede identificar qué ocurrió por el texto de la acción, sin depender del color del punto

#### Scenario: Sin superficie propia
- **WHEN** se coloca un ActivityTimeline dentro de otro componente que ya provee un fondo y un borde
- **THEN** ActivityTimeline no agrega una segunda superficie encima de la del componente que lo contiene
