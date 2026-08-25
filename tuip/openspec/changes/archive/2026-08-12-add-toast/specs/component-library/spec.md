## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton y Toast.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton y Toast aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente Toast
El componente Toast SHALL dispararse mediante un hook, no mediante un componente presentacional montado directamente en el árbol de cada pantalla, y SHALL mostrar como máximo un toast a la vez, anclado en una posición fija de la ventana. Toast SHALL desaparecer automáticamente luego de una duración por defecto, y esa duración por defecto SHALL extenderse cuando el toast incluye una acción, en vez de mantenerse igual independientemente del contenido.

#### Scenario: Disparar un toast desde cualquier componente
- **WHEN** un componente necesita confirmar una acción del usuario
- **THEN** puede disparar un toast mediante el hook, sin tener que montar manualmente el elemento visual en su propio árbol

#### Scenario: Un solo toast a la vez
- **WHEN** se dispara un segundo toast mientras el primero todavía es visible
- **THEN** el segundo espera su turno en vez de mostrarse superpuesto o al lado del primero

#### Scenario: Duración por defecto
- **WHEN** se dispara un toast sin una acción y sin especificar duración
- **THEN** desaparece automáticamente a los 5 segundos

#### Scenario: Duración extendida con acción
- **WHEN** se dispara un toast que incluye una acción (por ejemplo, deshacer) y sin especificar duración
- **THEN** desaparece automáticamente a los 10 segundos en vez de a los 5
