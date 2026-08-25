## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline y Stepper.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline y Stepper aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente Stepper
El componente Stepper SHALL presentar una secuencia horizontal de pasos, y cada paso SHALL declarar explícitamente su estado entre completado, en curso o pendiente. Un paso completado SHALL distinguirse visualmente por un medio distinto de su sola posición en la secuencia, y a lo sumo un paso SHALL representar el paso en curso.

#### Scenario: Un paso completado se distingue sin depender de la posición
- **WHEN** se renderiza un paso con estado completado
- **THEN** se distingue de un paso pendiente por su color y por un ícono de confirmación, no solo por estar antes en la secuencia

#### Scenario: El paso en curso es identificable de un vistazo
- **WHEN** se renderiza un paso con estado en curso
- **THEN** su color lo distingue tanto de los pasos completados como de los pendientes

#### Scenario: Stepper no infiere el estado de sus pasos
- **WHEN** se compone un Stepper con varios StepperStep
- **THEN** el estado de cada paso es el que su propio consumidor le asignó explícitamente, sin que Stepper lo recalcule a partir de la posición del paso en la secuencia

#### Scenario: Guía de uso según la cantidad de pasos
- **WHEN** se elige usar Stepper para un flujo
- **THEN** la documentación indica que por debajo de tres pasos alcanza un formulario simple y que por encima de cinco conviene guardar el progreso, porque a partir de ahí la persona pierde el hilo del flujo
