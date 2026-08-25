## ADDED Requirements

### Requirement: Opciones del componente Avatar
El componente Avatar SHALL representar una persona con sus iniciales sobre un color neutro fijo, SHALL admitir al menos tres tamaños, y no SHALL derivar el color de fondo del nombre o de ningún otro dato variable.

#### Scenario: Color siempre neutro
- **WHEN** se renderizan varios Avatar con nombres distintos
- **THEN** todos comparten el mismo fondo neutro, sin variar por nombre ni por ningún dato de la persona

### Requirement: Opciones del componente AvatarGroup
El componente AvatarGroup SHALL superponer un conjunto de Avatar con un borde que los separe visualmente, y SHALL mostrar un indicador con la cantidad restante cuando el número de miembros exceda el máximo visible configurado, en vez de superponer todos los avatares sin límite.

#### Scenario: Exceder el máximo visible
- **WHEN** AvatarGroup recibe más miembros que su máximo configurado
- **THEN** muestra ese máximo de avatares superpuestos y un indicador final con la cantidad de miembros restantes

### Requirement: Opciones del componente Progress
El componente Progress SHALL representar un valor de avance entre 0 y 100 como una barra horizontal, y SHALL saturar su color a la severidad `danger` en vez de desbordar visualmente la barra cuando el valor supera 100.

#### Scenario: Valor dentro de rango
- **WHEN** Progress recibe un valor entre 0 y 100
- **THEN** la porción rellena de la barra es proporcional a ese valor

#### Scenario: Valor sobre el límite
- **WHEN** Progress recibe un valor mayor a 100
- **THEN** la barra se muestra completamente llena con el color de severidad `danger`, sin desbordar su contenedor

### Requirement: Opciones del componente SegmentedBar
El componente SegmentedBar SHALL representar una distribución como una barra dividida en segmentos proporcionales a su valor, cada uno con un color propio y consistente en toda la aplicación.

#### Scenario: Suma de segmentos
- **WHEN** SegmentedBar recibe una lista de segmentos con sus valores
- **THEN** el ancho de cada segmento es proporcional a su valor respecto a la suma total de los segmentos

### Requirement: Opciones del componente Breadcrumb
El componente Breadcrumb SHALL mostrar la ruta de navegación de la página actual, SHALL colapsar los niveles intermedios en un indicador no interactivo cuando la ruta supera tres niveles, conservando siempre visibles el primero y el último, y el último nivel no SHALL ser un enlace.

#### Scenario: Ruta corta
- **WHEN** Breadcrumb recibe tres niveles o menos
- **THEN** muestra todos los niveles, cada uno enlazado salvo el último

#### Scenario: Ruta larga
- **WHEN** Breadcrumb recibe más de tres niveles
- **THEN** colapsa los niveles intermedios en un indicador no interactivo, conservando visibles el primero y el último

#### Scenario: Último nivel no es un enlace
- **WHEN** se renderiza el último nivel de un Breadcrumb
- **THEN** se muestra como texto, no como un enlace, porque representa la página actual

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar y Breadcrumb.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar y Breadcrumb aparecen como componentes instalables
