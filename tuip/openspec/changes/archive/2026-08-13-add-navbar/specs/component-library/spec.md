## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader y Navbar.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader y Navbar aparecen como componentes instalables

## ADDED Requirements

### Requirement: Zonas fijas del componente Navbar
El componente Navbar SHALL presentar tres zonas en un orden fijo — marca de producto a la izquierda, búsqueda al centro, utilidades y sesión a la derecha — y ese reparto SHALL ser el mismo en cualquier producto que lo use.

#### Scenario: Las tres zonas aparecen en el mismo orden
- **WHEN** se renderiza un Navbar con marca, búsqueda y sesión configuradas
- **THEN** la marca de producto aparece a la izquierda, la búsqueda al centro y las utilidades, notificaciones y cuenta a la derecha, en ese orden

#### Scenario: Sin manejador de búsqueda, no hay caja de búsqueda
- **WHEN** Navbar se usa sin la función de búsqueda
- **THEN** la zona central no muestra una caja de búsqueda no funcional

#### Scenario: Sin apps para cambiar, la marca no abre nada
- **WHEN** Navbar recibe una lista vacía de apps
- **THEN** la marca de producto no se comporta como un control que abre un panel

### Requirement: Coordinación de paneles de Navbar
De los paneles de selector de apps, notificaciones y cuenta, a lo sumo uno SHALL estar abierto a la vez: activar el disparador de un panel distinto mientras otro está abierto SHALL cerrar ese otro. Escape SHALL cerrar el panel abierto devolviendo el foco a su disparador.

#### Scenario: Activar otro disparador cierra el panel abierto
- **WHEN** el panel de notificaciones está abierto y la persona activa el disparador del selector de apps
- **THEN** el panel de notificaciones se cierra, sin quedar nunca dos paneles visibles a la vez

#### Scenario: Escape cierra el panel abierto y devuelve el foco
- **WHEN** hay un panel de Navbar abierto y la persona presiona Escape
- **THEN** el panel se cierra y el foco vuelve al botón que lo abrió

### Requirement: Notificaciones en Navbar
El botón de notificaciones de Navbar SHALL mostrar un indicador cuando exista al menos una notificación no leída, sin exhibir un conteo numérico en la propia barra, y ese indicador no SHALL ser la única señal de que hay notificaciones pendientes.

#### Scenario: Indicador de no leídas sin conteo en la barra
- **WHEN** Navbar recibe notificaciones con al menos una marcada como no leída
- **THEN** el botón de notificaciones muestra un indicador visual, sin mostrar la cantidad de notificaciones como número junto al ícono

#### Scenario: El indicador no es la única señal
- **WHEN** una persona que no distingue el color del indicador abre el panel de notificaciones
- **THEN** puede identificar qué notificaciones no leyó por un medio distinto del color, dentro del propio panel

### Requirement: Selector de apps en Navbar
El panel de selector de apps SHALL listar las apps a las que la persona puede cambiar, y SHALL señalar cuál de ellas es la app actual.

#### Scenario: La app actual se distingue de las demás
- **WHEN** se abre el selector de apps y una de ellas es la app actual
- **THEN** esa app se distingue del resto por una etiqueta, no solo por su posición en la lista

### Requirement: Comportamiento responsive de Navbar
Navbar SHALL adaptar su contenido al ancho disponible sin perder ninguna de sus tres zonas: por debajo de 1120px la búsqueda SHALL colapsar a un ícono y por debajo de 960px SHALL adoptar una variante compacta con altura reducida y un botón de menú para la navegación lateral de la app que lo use.

#### Scenario: La búsqueda colapsa antes que el resto
- **WHEN** el ancho disponible baja de 1120px
- **THEN** la búsqueda se reduce a un ícono, mientras que la marca, las notificaciones y la cuenta siguen visibles

#### Scenario: Variante compacta bajo 960px
- **WHEN** el ancho disponible baja de 960px
- **THEN** Navbar reduce su altura y muestra un botón de menú para la navegación lateral, sin dejar de mostrar la marca, las notificaciones y la cuenta

#### Scenario: Sin manejador de menú, no hay botón de menú
- **WHEN** Navbar entra en su variante compacta sin una función de alternar menú configurada
- **THEN** no se muestra un botón de menú sin acción

### Requirement: Accesibilidad de Navbar
Navbar SHALL exponerse como el banner del documento y SHALL incluir, como primer elemento alcanzable por teclado, un enlace para saltar al contenido principal que solo sea visible al recibir foco. Ninguno de sus paneles SHALL atrapar el foco.

#### Scenario: El enlace para saltar al contenido es el primer tabbable
- **WHEN** una persona que navega por teclado presiona Tab por primera vez en una página con Navbar
- **THEN** el foco llega a un enlace para saltar al contenido, invisible hasta ese momento

#### Scenario: Los paneles no atrapan el foco
- **WHEN** un panel de Navbar está abierto y la persona presiona Tab repetidamente
- **THEN** el foco sale del panel y lo cierra, sin quedar retenido dentro

### Requirement: Guía de uso de Navbar
La documentación de Navbar SHALL indicar que la variante de color es constante dentro de un mismo producto, que como máximo un enlace de utilidad acompaña a "Ayuda", y que la navegación de secciones y las acciones primarias no pertenecen a la barra.

#### Scenario: La variante no cambia dentro de un producto
- **WHEN** se elige una variante de color para Navbar
- **THEN** la documentación indica que esa variante es constante para todas las pantallas del producto, no algo que cambie por sección o por entorno

#### Scenario: Qué no pertenece a la barra
- **WHEN** se decide qué agregar a Navbar
- **THEN** la documentación indica que la navegación de secciones y los botones de acción primaria pertenecen a otros componentes, no a Navbar
