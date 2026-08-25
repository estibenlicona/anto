## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField y DateRangeField.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField y DateRangeField aparecen como componentes instalables

## ADDED Requirements

### Requirement: Opciones del componente DateField
El componente DateField SHALL capturar una fecha única como texto en formato ISO (`YYYY-MM-DD`) sin ambigüedad entre día y mes, SHALL ofrecer un calendario desplegable como ayuda opcional para elegir la fecha, y SHALL permitir escribir la fecha a mano en todo momento sin depender de abrir el calendario.

#### Scenario: Escribir la fecha a mano
- **WHEN** un usuario escribe una fecha válida en formato ISO directamente en el campo, sin abrir el calendario
- **THEN** DateField acepta el valor sin requerir que se haya usado el calendario

#### Scenario: Elegir la fecha desde el calendario
- **WHEN** un usuario abre el calendario desplegable y selecciona un día
- **THEN** el campo de texto se actualiza con la fecha elegida en formato ISO y el calendario se cierra

#### Scenario: Fecha fuera de límite visible pero deshabilitada
- **WHEN** DateField recibe una fecha mínima o máxima y el calendario muestra un mes con días fuera de ese límite
- **THEN** esos días se muestran deshabilitados en vez de ocultarse, para que el límite quede visible

### Requirement: Opciones del componente DateRangeField
El componente DateRangeField SHALL capturar dos fechas (inicio y fin) como texto en formato ISO, SHALL ofrecer el mismo calendario desplegable que DateField como ayuda opcional para elegir ambos extremos del rango, y SHALL presentar el rango en modo lectura con un formato abreviado localizado en vez del formato ISO usado en captura.

#### Scenario: Formato abreviado en lectura
- **WHEN** DateRangeField muestra un rango ya elegido fuera de edición
- **THEN** lo presenta con un formato abreviado localizado (por ejemplo «28 jul – 8 ago») en vez del formato ISO de captura

#### Scenario: Elegir un rango desde el calendario
- **WHEN** un usuario abre el calendario y selecciona un día de inicio y luego un día de fin posterior
- **THEN** DateRangeField actualiza ambos campos de texto con las fechas elegidas en formato ISO

#### Scenario: Escribir ambos extremos a mano
- **WHEN** un usuario escribe directamente las fechas de inicio y fin en formato ISO, sin abrir el calendario
- **THEN** DateRangeField acepta ambos valores sin requerir el calendario
