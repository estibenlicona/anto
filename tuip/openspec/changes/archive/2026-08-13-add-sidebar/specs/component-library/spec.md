## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar y Sidebar.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar y Sidebar aparecen como componentes instalables

## ADDED Requirements

### Requirement: Ítem activo del Sidebar
El ítem activo de Sidebar SHALL distinguirse de los demás por al menos tres señales simultáneas — un riel de color a su izquierda, un fondo distinto y un peso de texto mayor — y ninguna de esas señales SHALL depender únicamente del color.

#### Scenario: Tres señales a la vez
- **WHEN** se renderiza un ítem activo junto a ítems inactivos
- **THEN** el ítem activo muestra riel, fondo y peso de texto distintos a los inactivos, no solo un color diferente

#### Scenario: El estado no depende del color
- **WHEN** una persona que no distingue el color del riel navega el Sidebar
- **THEN** puede identificar el ítem activo por su fondo y su peso de texto, sin depender del riel

### Requirement: Contador de trabajo pendiente en Sidebar
Un ítem de Sidebar SHALL mostrar un contador solo cuando representa trabajo pendiente de esa persona, nunca un total ni una cifra informativa, y SHALL omitirse por completo — no mostrar cero — cuando no hay nada pendiente. Un contador mayor a 99 SHALL mostrarse como "99+".

#### Scenario: Sin trabajo pendiente, sin contador
- **WHEN** un ítem no tiene trabajo pendiente asociado
- **THEN** no muestra ningún contador, ni siquiera en cero

#### Scenario: El contador se satura en 99+
- **WHEN** el trabajo pendiente de un ítem supera 99
- **THEN** el contador muestra "99+" en vez de seguir creciendo

### Requirement: Persistencia del estado de colapso en Sidebar
Cuando el colapso de Sidebar no está controlado desde afuera, el componente SHALL recordar la última elección de la persona y aplicarla de nuevo en visitas posteriores. Cuando el colapso sí está controlado desde afuera, Sidebar no SHALL leer ni escribir esa persistencia.

#### Scenario: La elección persiste sin modo controlado
- **WHEN** una persona colapsa Sidebar sin que la app controle ese estado, y vuelve a cargar la página más tarde
- **THEN** Sidebar aparece colapsado desde el primer render

#### Scenario: El modo controlado no persiste por su cuenta
- **WHEN** una app controla el colapso de Sidebar desde afuera
- **THEN** Sidebar no guarda ni recupera esa elección por sí mismo — la app es la única fuente de verdad

### Requirement: Colapso automático de Sidebar por ancho
Sidebar SHALL colapsarse automáticamente cuando el ancho disponible baja de 1120px, salvo que su colapso esté controlado desde afuera.

#### Scenario: Colapso automático al angostarse
- **WHEN** el ancho disponible baja de 1120px y Sidebar no está en modo controlado
- **THEN** Sidebar se colapsa a su ancho mínimo

#### Scenario: El modo controlado no se ve forzado
- **WHEN** el ancho disponible baja de 1120px y una app controla el colapso de Sidebar desde afuera
- **THEN** Sidebar no cambia su estado por su cuenta — respeta el valor controlado

### Requirement: Accesibilidad de Sidebar
Sidebar SHALL exponerse como una región de navegación con una etiqueta accesible, SHALL marcar el ítem activo como la página actual, y SHALL mantener el nombre de cada ítem disponible para tecnología de asistencia incluso cuando el texto no es visible.

#### Scenario: El ítem activo se anuncia como la página actual
- **WHEN** una persona usando un lector de pantalla llega al ítem activo
- **THEN** lo anuncia como la página actual, no solo como un ítem más de la lista

#### Scenario: El nombre del ítem viaja aunque el texto esté oculto
- **WHEN** Sidebar está colapsado y solo muestra íconos
- **THEN** cada ítem sigue teniendo su nombre disponible para tecnología de asistencia

#### Scenario: El contador es parte del nombre accesible
- **WHEN** un ítem tiene un contador de trabajo pendiente
- **THEN** ese número forma parte del nombre accesible del ítem, no solo de su apariencia visual

### Requirement: Guía de uso de Sidebar
La documentación de Sidebar SHALL indicar que admite un solo nivel de profundidad sin subsecciones anidadas, que no aloja botones de acción, y que un ítem al que la persona no tiene acceso se omite en vez de mostrarse deshabilitado.

#### Scenario: Un solo nivel
- **WHEN** se decide cómo organizar la navegación de una app en Sidebar
- **THEN** la documentación indica que las subsecciones pertenecen a las pestañas del encabezado de página, no a un segundo nivel dentro de Sidebar

#### Scenario: Sin acceso, sin ítem
- **WHEN** una persona no tiene permiso para entrar a una sección
- **THEN** la documentación indica que esa sección no aparece en su Sidebar, en vez de aparecer deshabilitada
