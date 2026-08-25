## MODIFIED Requirements

### Requirement: Opciones del componente Checkbox
El componente Checkbox SHALL soportar los estados marcado, desmarcado e indeterminado, y SHALL comunicar el estado indeterminado a las tecnologías de asistencia además de representarlo visualmente.

El Checkbox SHALL dibujarse **cuadrado**, con un redondeo que a su tamaño real se lea como esquina redondeada y no como circunferencia. Es la convención más vieja de los formularios —cuadrado admite varios, redondo admite uno— y la forma es lo que se percibe antes de leer nada: un checkbox redondo dice que hay que elegir una sola opción cuando se pueden elegir todas.

El radio del Checkbox NO SHALL heredarse del que usan los controles grandes. Ese valor está pensado para botones y campos, que miden el doble o más; aplicado a una caja cuya mitad del lado es ese mismo número, deja de ser un redondeo y pasa a ser un círculo. Un token correcto usado a la escala equivocada produce una forma que miente.

#### Scenario: Alternar con teclado
- **WHEN** un usuario mueve el foco a un Checkbox y presiona Espacio
- **THEN** el estado alterna entre marcado y desmarcado, y el cambio se anuncia a las tecnologías de asistencia

#### Scenario: Estado indeterminado
- **WHEN** un Checkbox representa una selección parcial de un grupo (ni todos ni ninguno marcados)
- **THEN** se muestra en estado indeterminado, distinto visualmente de marcado y de desmarcado, y ese estado se expone a las tecnologías de asistencia

#### Scenario: La forma dice cuántos se pueden elegir
- **WHEN** un usuario mira una lista de casillas sin leer sus etiquetas
- **THEN** su forma cuadrada le dice que puede elegir más de una, sin depender de la marca de adentro ni de un texto que lo aclare

#### Scenario: Un Checkbox no se confunde con un radio
- **WHEN** se comparan un Checkbox y una opción de RadioGroup del mismo tamaño, ambos sin marcar
- **THEN** se distinguen por su contorno —uno cuadrado, el otro circular— y no sólo por lo que aparece dentro al seleccionarlos

### Requirement: Opciones del componente RadioGroup
El componente RadioGroup SHALL presentar un conjunto de opciones mutuamente excluyentes, de las cuales como máximo una SHALL estar seleccionada, con navegación por teclado entre las opciones del grupo. Sus opciones SHALL dibujarse **circulares**, que es la contraparte de la forma cuadrada del Checkbox: juntas, las dos formas dicen cuántas opciones admite el control antes de que alguien lea una etiqueta.

#### Scenario: Elegir una opción por teclado
- **WHEN** un usuario mueve el foco al grupo y usa las flechas
- **THEN** el foco y la selección se mueven juntos entre las opciones del grupo, sin necesitar Tab entre cada una

#### Scenario: Selección excluyente
- **WHEN** un usuario elige una opción del grupo que ya tenía otra seleccionada
- **THEN** la opción anterior se deselecciona automáticamente, de modo que nunca hay más de una elegida a la vez
