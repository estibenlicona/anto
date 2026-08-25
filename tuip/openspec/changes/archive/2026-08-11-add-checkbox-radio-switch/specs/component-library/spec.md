## ADDED Requirements

### Requirement: Opciones del componente Checkbox
El componente Checkbox SHALL soportar los estados marcado, desmarcado e indeterminado, y SHALL comunicar el estado indeterminado a las tecnologías de asistencia además de representarlo visualmente.

#### Scenario: Alternar con teclado
- **WHEN** un usuario mueve el foco a un Checkbox y presiona Espacio
- **THEN** el estado alterna entre marcado y desmarcado, y el cambio se anuncia a las tecnologías de asistencia

#### Scenario: Estado indeterminado
- **WHEN** un Checkbox representa una selección parcial de un grupo (ni todos ni ninguno marcados)
- **THEN** se muestra en estado indeterminado, distinto visualmente de marcado y de desmarcado, y ese estado se expone a las tecnologías de asistencia

### Requirement: Opciones del componente RadioGroup
El componente RadioGroup SHALL presentar un conjunto de opciones mutuamente excluyentes, de las cuales como máximo una SHALL estar seleccionada, con navegación por teclado entre las opciones del grupo.

#### Scenario: Elegir una opción por teclado
- **WHEN** un usuario mueve el foco al grupo y usa las flechas
- **THEN** el foco y la selección se mueven juntos entre las opciones del grupo, sin necesitar Tab entre cada una

#### Scenario: Selección excluyente
- **WHEN** un usuario elige una opción del grupo que ya tenía otra seleccionada
- **THEN** la opción anterior se deselecciona automáticamente, de modo que nunca hay más de una elegida a la vez

### Requirement: Opciones del componente Switch
El componente Switch SHALL aplicar su cambio de estado de inmediato, sin requerir una acción de confirmación posterior, y SHALL exponerse a las tecnologías de asistencia con el rol de interruptor y no el de casilla de verificación.

#### Scenario: El cambio se aplica al instante
- **WHEN** un usuario activa un Switch
- **THEN** el efecto de ese cambio ocurre de inmediato, sin esperar una acción de guardado

#### Scenario: Rol distinto del de Checkbox
- **WHEN** una tecnología de asistencia encuentra un Switch
- **THEN** lo anuncia con un rol de interruptor, distinguible del rol que usa Checkbox

### Requirement: Distinción de uso entre Checkbox y Switch
La documentación SHALL orientar sobre cuándo corresponde Switch y cuándo Checkbox, según si el cambio se aplica de inmediato o requiere una acción de guardado posterior.

#### Scenario: Consultar cuál corresponde
- **WHEN** alguien construye un formulario y duda entre Checkbox y Switch para un campo booleano
- **THEN** la documentación de cualquiera de los dos componentes le indica el criterio: si el cambio necesita un paso de guardado, es Checkbox; si aplica solo, es Switch

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup y Switch.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup y Switch aparecen como componentes instalables
