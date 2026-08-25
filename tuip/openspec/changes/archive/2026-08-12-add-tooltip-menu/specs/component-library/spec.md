## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip y Menu.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip y Menu aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente Tooltip
El componente Tooltip SHALL mostrar una frase corta con un ancho máximo acotado, tras un retraso de aparición y sin retraso al desaparecer, y no SHALL contener acciones ni información imprescindible para completar una tarea — quien navega por teclado o en un dispositivo táctil no siempre lo activa.

#### Scenario: Aparece con retraso
- **WHEN** un usuario posiciona el puntero o el foco sobre el elemento que activa un Tooltip
- **THEN** el Tooltip aparece luego de un retraso, no de inmediato

#### Scenario: Desaparece sin retraso
- **WHEN** el puntero o el foco deja el elemento que activa un Tooltip visible
- **THEN** el Tooltip desaparece de inmediato, sin el mismo retraso que tuvo al aparecer

#### Scenario: Sin información imprescindible
- **WHEN** se diseña el contenido de un Tooltip
- **THEN** ese contenido no SHALL ser necesario para completar la tarea, porque una persona que no lo ve igual debe poder continuar

### Requirement: Opciones del componente Menu
El componente Menu SHALL presentar una lista de ítems accionables anclada a su disparador, navegable con las flechas del teclado, y SHALL cerrarse con la tecla Escape. Un ítem de Menu SHALL poder marcarse como destructivo, y en ese caso SHALL distinguirse visualmente de los ítems no destructivos por su color, no solo por su posición.

#### Scenario: Navegación por teclado
- **WHEN** un usuario abre un Menu y usa las flechas
- **THEN** el foco recorre los ítems en orden, sin necesitar Tab entre cada uno

#### Scenario: Cerrar con Escape
- **WHEN** un usuario presiona Escape con un Menu abierto
- **THEN** el Menu se cierra y el foco vuelve al disparador

#### Scenario: Extremos del menú
- **WHEN** un usuario con el foco dentro de un Menu abierto presiona Home o End
- **THEN** el foco salta al primer o al último ítem respectivamente

#### Scenario: Ítem destructivo distinguible
- **WHEN** un Menu incluye un ítem marcado como destructivo
- **THEN** ese ítem se distingue de los demás por su color, no solo por estar en una posición particular de la lista
