## ADDED Requirements

### Requirement: Opciones del componente Tabs
El componente Tabs SHALL presentar un conjunto de secciones navegables mutuamente excluyentes, de las cuales exactamente una SHALL estar activa en todo momento, con navegación por teclado entre las pestañas y su contenido asociado expuesto solo cuando está activa.

#### Scenario: Cambiar de pestaña por teclado
- **WHEN** un usuario mueve el foco a la lista de pestañas y usa las flechas
- **THEN** el foco se mueve entre las pestañas del grupo, y la pestaña activa y su contenido cambian junto con el foco

#### Scenario: Contenido asociado a la pestaña activa
- **WHEN** una pestaña está activa
- **THEN** solo su contenido asociado es visible y accesible a tecnologías de asistencia; el contenido de las demás pestañas no se anuncia

#### Scenario: Contador junto a la etiqueta
- **WHEN** una pestaña recibe un contador
- **THEN** se muestra junto a la etiqueta, distinguible tipográficamente del texto de la etiqueta

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar y Tabs.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar y Tabs aparecen como componentes instalables
