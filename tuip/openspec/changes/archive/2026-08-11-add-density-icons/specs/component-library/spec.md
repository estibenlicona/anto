## MODIFIED Requirements

### Requirement: Opciones del componente SegmentedControl
El componente SegmentedControl SHALL presentar un conjunto de opciones mutuamente excluyentes como botones contiguos, de las cuales exactamente una SHALL estar seleccionada en todo momento, navegable por teclado. Una opción SHALL poder representarse solo por un icono en vez de texto visible; en ese caso SHALL exponer un nombre accesible que describa la opción, ya que el icono no SHALL ser el único portador de esa información para tecnologías de asistencia.

#### Scenario: Cambiar de opción
- **WHEN** un usuario hace clic en una opción distinta de la seleccionada
- **THEN** SegmentedControl notifica la opción elegida al consumidor

#### Scenario: Navegación por teclado
- **WHEN** una opción de SegmentedControl tiene el foco y el usuario usa las flechas
- **THEN** el foco se mueve a la opción adyacente dentro del grupo, sin necesitar Tab entre cada una

#### Scenario: Opción representada solo por icono
- **WHEN** una opción de SegmentedControl se define solo con un icono, sin texto visible
- **THEN** el icono se renderiza en lugar del texto, y la opción expone un nombre accesible que una tecnología de asistencia puede anunciar

#### Scenario: Estado seleccionado no depende solo del icono
- **WHEN** un usuario recorre visualmente un SegmentedControl cuyas opciones son iconos
- **THEN** distingue cuál está seleccionada por el mismo tratamiento visual de fondo que usan las opciones de texto, no por un cambio en el propio icono
