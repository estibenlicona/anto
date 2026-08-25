## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState y Skeleton.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState y Skeleton aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente EmptyState
El componente EmptyState SHALL presentar, centrados, un icono, un título y opcionalmente una descripción y una acción, y no SHALL imponer un contenedor propio con borde — se apoya en la superficie donde el consumidor lo coloque. EmptyState no SHALL determinar por sí mismo si corresponde invitar a crear, invitar a limpiar filtros, o indicar a quién pedir permiso: esa decisión de contenido queda del lado del consumidor, según cuál de las tres situaciones se esté representando.

#### Scenario: Estado sin datos con acción de creación
- **WHEN** un consumidor usa EmptyState para una lista que todavía no tiene ningún elemento
- **THEN** puede pasar una acción que invite a crear el primero

#### Scenario: Estado sin resultados
- **WHEN** un consumidor usa EmptyState después de que un filtro o una búsqueda no arroja resultados
- **THEN** el título y la descripción pueden orientar a limpiar el filtro, sin que el componente imponga ese texto

#### Scenario: Sin contenedor propio
- **WHEN** se renderiza EmptyState dentro de un Card o dentro del cuerpo de una Table
- **THEN** EmptyState no agrega un borde ni un fondo propios que compitan con el contenedor que lo aloja

### Requirement: Opciones del componente Skeleton
El componente Skeleton SHALL representar un bloque de carga con animación de pulso, sin una forma fija impuesta — el consumidor SHALL poder dimensionarlo y redondearlo para imitar la forma del contenido real que reemplaza, en vez de mostrar siempre un rectángulo genérico.

#### Scenario: Imitar una línea de texto
- **WHEN** un consumidor usa Skeleton para anticipar una línea de texto
- **THEN** puede darle un ancho y una altura que se asemejen a esa línea, en vez de un bloque de proporciones fijas

#### Scenario: Imitar un avatar circular
- **WHEN** un consumidor usa Skeleton para anticipar un avatar
- **THEN** puede darle forma circular, en vez de quedar limitado a la forma que trae por defecto

#### Scenario: Guía de uso sobre cuándo mostrarlo
- **WHEN** alguien consulta la documentación de Skeleton para decidir cuándo mostrarlo
- **THEN** encuentra la orientación de no mostrarlo antes de 300ms de espera, y de reemplazarlo por un mensaje explícito con opción de cancelar pasados 10 segundos
