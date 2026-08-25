## ADDED Requirements

### Requirement: Opciones del componente Tag
El componente Tag SHALL presentar una etiqueta breve sobre un relleno de color que identifica a un elemento como miembro de un conjunto, y SHALL aceptar un color elegido por el consumidor entre un conjunto de colores nombrados por su tono —no por un rol de estado— de modo que elegir un color no afirme nada sobre el elemento. Tag SHALL NOT exponer el rol `brand`, reservado para la acción principal de una vista. El contenido de Tag SHALL ser siempre su propia etiqueta de texto, de manera que el color nunca sea el único portador del significado. Varios Tag de etiquetas cortas SHALL renderizarse con un mismo ancho mínimo, de modo que un conjunto se lea como valores de una misma cosa y no como elementos de distinta naturaleza.

#### Scenario: Distinguir miembros de un conjunto por color
- **WHEN** se renderizan varios Tag con colores distintos para los miembros de un mismo conjunto
- **THEN** cada uno se muestra con su color de relleno sólido y su etiqueta de texto, sin que el color implique un estado, una severidad ni un juicio sobre el elemento

#### Scenario: El texto no depende del color
- **WHEN** un usuario no puede percibir la diferencia de color entre dos Tag
- **THEN** la etiqueta de texto de cada uno sigue identificándolo por completo, porque el color solo acompaña al texto en vez de reemplazarlo

#### Scenario: Color por defecto
- **WHEN** un Tag se renderiza sin especificar un color
- **THEN** usa un color neutro, sin que la ausencia de elección se interprete como una categoría particular

#### Scenario: Contraste del relleno
- **WHEN** se renderiza un Tag en cualquiera de sus colores
- **THEN** su texto usa el color que el sistema define como legible sobre ese relleno, en vez de un color fijo que solo contraste con algunos de ellos, y la combinación cumple el contraste mínimo que el sistema de tokens ya exige y verifica

#### Scenario: Tamaño uniforme en un conjunto
- **WHEN** se renderizan varios Tag de etiquetas cortas, como las tallas de un conjunto
- **THEN** todos ocupan el mismo ancho mínimo, y una etiqueta más larga que ese mínimo crece en vez de recortarse

#### Scenario: Tag no se anuncia como un estado
- **WHEN** una tecnología de asistencia recorre un Tag
- **THEN** lo encuentra como el texto de su etiqueta, sin anunciarlo como una región de estado ni como un cambio en vivo, a diferencia de Badge

### Requirement: Distinción entre Tag y Badge
La documentación SHALL indicar que Badge comunica el estado de un elemento mediante los roles de estado del sistema, mientras que Tag identifica a un elemento dentro de un conjunto mediante un color sin significado propio, de modo que quien elige entre ambos sepa cuál corresponde. Tag SHALL distinguirse visualmente de Badge también por su forma, de modo que la diferencia no dependa únicamente del color de relleno.

#### Scenario: Elegir entre Tag y Badge
- **WHEN** alguien necesita etiquetar un elemento y consulta la documentación
- **THEN** encuentra que Badge corresponde cuando la etiqueta comunica un estado, y Tag cuando solo distingue a un miembro de un conjunto

#### Scenario: Tag y Badge se distinguen por forma
- **WHEN** un Tag y un Badge aparecen juntos, por ejemplo en la misma tabla
- **THEN** se diferencian por su forma además de por su relleno, de manera que quien no distinga los colores igual puede separar una etiqueta de pertenencia de una de estado

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion y Popover.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Tag, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion y Popover aparecen como componentes instalables
