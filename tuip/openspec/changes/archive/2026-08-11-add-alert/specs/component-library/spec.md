## ADDED Requirements

### Requirement: Opciones del componente Alert
El componente Alert SHALL comunicar un mensaje dentro del flujo de la página, con una de cuatro severidades (`danger`, `warning`, `success`, `info`), SHALL mostrar un ícono correspondiente a la severidad que no dependa solo del color para distinguirse, y SHALL admitir un título opcional y una acción opcional.

#### Scenario: Ícono obligatorio por severidad
- **WHEN** se renderiza un Alert de cualquier severidad
- **THEN** muestra el ícono correspondiente a esa severidad, distinto para cada una de las cuatro

#### Scenario: Alert con acción
- **WHEN** un Alert recibe una acción
- **THEN** la acción se muestra dentro del propio Alert, sin necesitar que el usuario busque la respuesta en otro lugar de la pantalla

#### Scenario: Distinguible sin color
- **WHEN** una persona con dificultad para distinguir colores encuentra un Alert
- **THEN** puede identificar su severidad por el ícono y el texto, no solo por el color de fondo o del borde

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs y Alert.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs y Alert aparecen como componentes instalables
