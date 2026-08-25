## ADDED Requirements

### Requirement: Opciones del componente Slider
El componente Slider SHALL permitir fijar uno o más valores numéricos sobre un rango continuo, presentando un pulgar por valor. Los pulgares no SHALL cruzarse entre sí, de modo que el orden de los valores se conserve siempre. Slider SHALL aceptar una separación mínima entre pulgares contiguos, para que el espacio entre dos no pueda reducirse a cero. Cada pulgar SHALL ser operable por teclado y SHALL exponer a las tecnologías de asistencia su valor actual, los límites dentro de los que puede moverse y un nombre que lo distinga de los demás.

#### Scenario: Fijar un valor arrastrando
- **WHEN** un usuario arrastra un pulgar a lo largo de la pista
- **THEN** el valor que ese pulgar representa cambia siguiendo su posición, sin que se alteren los valores de los demás pulgares

#### Scenario: Los pulgares no se cruzan
- **WHEN** un usuario arrastra un pulgar más allá de uno contiguo
- **THEN** el pulgar se detiene antes de cruzarlo, de modo que los valores nunca quedan desordenados

#### Scenario: Separación mínima entre pulgares
- **WHEN** un usuario acerca un pulgar a otro más allá de la separación mínima configurada
- **THEN** el pulgar se detiene a esa separación, de modo que el espacio entre ambos nunca llega a cero

#### Scenario: Operar por teclado
- **WHEN** un usuario enfoca un pulgar y usa el teclado para moverlo
- **THEN** su valor cambia sin necesidad de arrastrar, respetando los mismos límites y la misma separación mínima que el arrastre

#### Scenario: Cada pulgar se anuncia por separado
- **WHEN** una tecnología de asistencia recorre un Slider de varios pulgares
- **THEN** encuentra cada pulgar como un control propio, con su valor, sus límites y un nombre que permite saber cuál de todos es

### Requirement: Segmentos del componente Slider
Slider SHALL aceptar una descripción opcional de los tramos en que sus pulgares dividen la pista, con un rótulo y un color por tramo. Los tramos descritos SHALL corresponder uno a uno con los espacios que quedan entre pulgares, contando también el que va desde el inicio del rango al primer pulgar y el que va del último al final. Sin esa descripción, Slider SHALL presentarse como un control de valor corriente. El rótulo de cada tramo SHALL ser lo que lo identifica, de manera que el color solo lo refuerce y nunca sea la única señal.

#### Scenario: Ver una partición rotulada
- **WHEN** se describen los tramos de un Slider de varios pulgares
- **THEN** cada tramo se muestra con su color y su rótulo, y mover un pulgar cambia a la vez el tamaño de los dos tramos que ese pulgar separa

#### Scenario: Slider sin segmentos
- **WHEN** un Slider se usa sin describir tramos
- **THEN** se presenta como un control de valor corriente, sin colores ni rótulos por tramo

#### Scenario: El color del tramo no es la única señal
- **WHEN** un usuario no puede percibir la diferencia de color entre dos tramos
- **THEN** el rótulo de cada uno sigue identificándolo por completo

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover y CommandPalette.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Slider, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover y CommandPalette aparecen como componentes instalables
