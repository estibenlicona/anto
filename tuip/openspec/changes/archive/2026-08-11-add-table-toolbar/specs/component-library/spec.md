## ADDED Requirements

### Requirement: Opciones del componente Pagination
El componente Pagination SHALL presentar navegación entre páginas mediante controles anterior/siguiente y una lista de números de página, con puntos suspensivos cuando el total de páginas no cabe completo, y SHALL delegar en el consumidor la página actual y el cambio de página — no SHALL mantener estado propio ni texto de resumen de resultados.

#### Scenario: Cambiar de página
- **WHEN** un usuario hace clic en un número de página distinto del actual, o en el control de anterior/siguiente
- **THEN** Pagination notifica la página elegida al consumidor, sin cambiar su propia visualización hasta que el consumidor le pase la nueva página actual

#### Scenario: Rango largo de páginas
- **WHEN** el total de páginas es mayor al que cabe mostrado completo
- **THEN** Pagination muestra puntos suspensivos en lugar de la lista completa, conservando siempre visibles la primera, la última y la página actual

#### Scenario: Límites de navegación
- **WHEN** la página actual es la primera o la última
- **THEN** el control de anterior o de siguiente correspondiente se deshabilita

### Requirement: Opciones del componente Chip
El componente Chip SHALL mostrar una etiqueta de texto con un control para removerla, y SHALL notificar al consumidor cuando ese control se activa, sin removerse a sí mismo.

#### Scenario: Remover un chip
- **WHEN** un usuario activa el control de cierre de un Chip, con mouse o teclado
- **THEN** Chip notifica la remoción al consumidor, que decide si deja de renderizarlo

### Requirement: Opciones del componente SegmentedControl
El componente SegmentedControl SHALL presentar un conjunto de opciones mutuamente excluyentes como botones contiguos, de las cuales exactamente una SHALL estar seleccionada en todo momento, navegable por teclado.

#### Scenario: Cambiar de opción
- **WHEN** un usuario hace clic en una opción distinta de la seleccionada
- **THEN** SegmentedControl notifica la opción elegida al consumidor

#### Scenario: Navegación por teclado
- **WHEN** una opción de SegmentedControl tiene el foco y el usuario usa las flechas
- **THEN** el foco se mueve a la opción adyacente dentro del grupo, sin necesitar Tab entre cada una

### Requirement: Opciones del componente TableToolbar
El componente TableToolbar SHALL proveer un contenedor de layout con espaciado y borde consistentes, pensado para alojar controles de búsqueda, filtro y densidad inmediatamente arriba de una Table, sin imponer qué controles contiene.

#### Scenario: Envolver controles de búsqueda y filtro
- **WHEN** se coloca un campo de búsqueda, un filtro y un SegmentedControl de densidad dentro de TableToolbar
- **THEN** los tres quedan alineados en una fila con espaciado consistente, y el filtro se separa del resto con un margen automático cuando corresponde

### Requirement: Densidad de Table
Table SHALL aceptar una densidad opcional, `comfortable` o `compact`, que ajusta el alto de fila y el padding de celda de forma uniforme en toda la tabla, con `comfortable` como valor por defecto.

#### Scenario: Cambiar a densidad compacta
- **WHEN** Table recibe `density="compact"`
- **THEN** todas sus filas y celdas reducen su padding vertical de manera uniforme, sin afectar el contenido de las celdas

#### Scenario: Densidad por defecto
- **WHEN** Table no recibe una densidad explícita
- **THEN** se comporta exactamente igual que antes de este requisito, con el espaciado `comfortable` que ya tenía

### Requirement: Cabeceras ordenables de Table
TableHead SHALL soportar un indicador de dirección de orden y SHALL volverse interactiva y anunciar su estado de orden a tecnologías de asistencia cuando el consumidor le pasa un manejador de orden, delegando en el consumidor el ordenamiento real de los datos.

#### Scenario: Activar el orden desde la cabecera
- **WHEN** una TableHead recibe un manejador de orden y un usuario la activa con mouse o teclado
- **THEN** TableHead invoca el manejador, sin reordenar los datos por sí misma

#### Scenario: Anunciar la dirección de orden
- **WHEN** una TableHead tiene una dirección de orden activa
- **THEN** expone esa dirección mediante el atributo de tabla estándar para orden, de modo que una tecnología de asistencia la anuncie

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox, Table, Pagination, Chip, SegmentedControl y TableToolbar.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox, Table, Pagination, Chip, SegmentedControl y TableToolbar aparecen como componentes instalables
