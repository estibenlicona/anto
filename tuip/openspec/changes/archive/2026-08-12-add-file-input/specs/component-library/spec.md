## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput y FileUploader.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput y FileUploader aparecen como componentes instalables

## ADDED Requirements

### Requirement: Selección de archivo por arrastre o por teclado
FileInput y FileUploader SHALL permitir elegir un archivo tanto arrastrándolo sobre la zona designada como mediante un control operable por teclado, y el resultado de elegir un archivo SHALL ser el mismo sin importar cuál de los dos medios se haya usado.

#### Scenario: Elegir un archivo arrastrándolo
- **WHEN** un usuario suelta un archivo sobre la zona de FileInput o FileUploader
- **THEN** el archivo queda seleccionado, igual que si se hubiera elegido por el diálogo del sistema

#### Scenario: Elegir un archivo sin arrastrar nada
- **WHEN** un usuario que navega por teclado activa el control con Enter o Espacio
- **THEN** se abre el selector de archivos del sistema operativo, sin que el arrastre sea la única vía para adjuntar algo

#### Scenario: Mismo resultado por cualquiera de los dos medios
- **WHEN** se compara un archivo elegido por arrastre con el mismo archivo elegido por el selector del sistema
- **THEN** el estado resultante de FileInput o FileUploader es indistinguible entre ambos casos

### Requirement: Opciones del componente FileInput
El componente FileInput SHALL aceptar un único archivo a la vez, SHALL mostrar el nombre y el tamaño del archivo elegido una vez seleccionado, y SHALL permitir quitarlo sin tener que elegir otro en su reemplazo. Si se sueltan varios archivos sobre FileInput, SHALL conservar únicamente el primero.

#### Scenario: Mostrar el archivo elegido
- **WHEN** se selecciona un archivo en FileInput
- **THEN** su nombre y su tamaño quedan visibles, reemplazando la invitación a elegir uno

#### Scenario: Quitar el archivo elegido
- **WHEN** un usuario quita el archivo ya elegido
- **THEN** FileInput vuelve a mostrar la invitación a elegir uno, sin exigir que se elija otro de inmediato

#### Scenario: Soltar varios archivos en un campo de uno solo
- **WHEN** un usuario suelta más de un archivo sobre FileInput
- **THEN** FileInput conserva solo el primero y descarta el resto, sin mostrar un error por ello

### Requirement: Opciones del componente FileUploader
El componente FileUploader SHALL aceptar varios archivos a la vez, presentando cada uno en su propia fila con nombre, tamaño y estado. El estado de cada archivo SHALL ser controlado por quien usa el componente, y no SHALL simularse dentro del componente. Un archivo en estado de error SHALL mostrar el motivo junto a su fila.

#### Scenario: Cada archivo con su propio estado
- **WHEN** FileUploader recibe varios archivos con estados distintos entre sí
- **THEN** cada fila refleja el estado que le corresponde a su propio archivo, no un estado compartido por todos

#### Scenario: Progreso de una subida en curso
- **WHEN** un archivo está en estado de subida con un progreso definido
- **THEN** su fila muestra una barra de progreso con ese valor

#### Scenario: Un archivo con error
- **WHEN** un archivo queda en estado de error
- **THEN** su fila muestra el motivo del error, sin que eso afecte el estado de las demás filas

#### Scenario: Quitar un archivo de la lista
- **WHEN** un usuario quita un archivo de la lista, sin importar su estado
- **THEN** solo esa fila desaparece, y el resto de la lista permanece sin cambios
