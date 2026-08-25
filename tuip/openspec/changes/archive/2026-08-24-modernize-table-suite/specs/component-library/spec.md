## MODIFIED Requirements

### Requirement: Opciones del componente Avatar
El componente Avatar SHALL representar una persona con sus iniciales, SHALL admitir al menos tres tamaños, y SHALL aceptar un color categórico opcional del mismo vocabulario de seis tonos que usan `Tag` y `Slider` (`gray`, `green`, `blue`, `amber`, `red`, `purple`), asignado explícitamente por el consumidor. Avatar no SHALL derivar ese color por sí mismo del nombre o de ningún otro dato variable de la persona — la asignación es siempre una decisión del consumidor, nunca automática. Sin color especificado, SHALL usar el fondo neutro que ya tenía.

#### Scenario: Color por defecto
- **WHEN** se renderiza un Avatar sin especificar color
- **THEN** usa el fondo neutro, igual que antes de este cambio

#### Scenario: Color categórico asignado por el consumidor
- **WHEN** se renderiza un Avatar con un color categórico especificado
- **THEN** su fondo usa ese color, con el mismo tratamiento de relleno sólido y texto invertido que ya tenía la variante neutra

#### Scenario: Color siempre neutro
- **WHEN** se renderizan varios Avatar con nombres distintos, ninguno con color especificado
- **THEN** todos comparten el mismo fondo neutro — Avatar no SHALL inferir un color distinto por avatar a partir del nombre u otro dato

### Requirement: Densidad de Table
Table SHALL aceptar una densidad opcional, `comfortable` o `compact`, que ajusta el alto de fila y el padding de celda de forma uniforme en todo el cuerpo de la tabla, con `comfortable` como valor por defecto. La cabecera SHALL usar su propio padding vertical, siempre más ajustado que el del cuerpo en la misma densidad, y SHALL seguir subiendo y bajando junto con el cuerpo al cambiar de densidad.

#### Scenario: Cambiar a densidad compacta
- **WHEN** Table recibe `density="compact"`
- **THEN** todas sus filas y celdas reducen su padding vertical de manera uniforme, sin afectar el contenido de las celdas

#### Scenario: Densidad por defecto
- **WHEN** Table no recibe una densidad explícita
- **THEN** se comporta exactamente igual que antes de este requisito, con el espaciado `comfortable` que ya tenía

#### Scenario: La cabecera es más baja que el cuerpo en cualquier densidad
- **WHEN** Table recibe cualquiera de las dos densidades
- **THEN** el padding vertical de la cabecera es menor que el de las celdas del cuerpo en esa misma densidad

## ADDED Requirements

### Requirement: Apariencia de cabecera, pie y cuerpo de Table
La cabecera y el pie de Table (`TableHeader`, `TableFooter`) SHALL compartir un mismo fondo casi blanco, apenas diferenciado del cuerpo — no un gris sólido marcado. El cuerpo de la tabla (el contenedor de Table) SHALL usar un fondo blanco explícito. Las etiquetas de la cabecera SHALL mostrarse en mayúsculas y en negrita, con un color de texto que cumpla al menos 4.5:1 de contraste contra el fondo de la cabecera.

#### Scenario: Fondo compartido de cabecera y pie
- **WHEN** se renderizan la cabecera y el pie de una Table
- **THEN** ambos usan el mismo fondo casi blanco

#### Scenario: Fondo del cuerpo
- **WHEN** se renderiza una Table
- **THEN** el contenedor de la tabla usa un fondo blanco explícito, distinguible del casi blanco de cabecera y pie

#### Scenario: Tipografía de la cabecera
- **WHEN** se renderiza la cabecera de una Table
- **THEN** sus etiquetas se muestran en mayúsculas y en negrita

#### Scenario: Contraste del texto de cabecera
- **WHEN** se mide el contraste entre el color de texto de la cabecera y su fondo
- **THEN** la razón de contraste es de al menos 4.5:1

## REMOVED Requirements

### Requirement: Opciones del componente TableToolbar
**Reason**: El contenedor con borde y fondo propio no tiene lugar en el rediseño de la experiencia alrededor de Table: los controles de búsqueda y filtro pasan a mostrarse sueltos, directamente sobre el fondo de la página, no dentro de una caja.
**Migration**: Reemplazar `TableToolbar` por los controles nuevos (`SearchField`, `FilterButton`) compuestos directamente en el layout del consumidor, con el espaciado que ese layout ya maneja — sin un contenedor de reemplazo, porque el punto es justamente no tener uno.

## ADDED Requirements

### Requirement: Opciones del componente SearchField
El componente SearchField SHALL presentar un campo de texto para búsqueda con un ícono de lupa integrado, y SHALL delegar en el consumidor qué hace con el valor ingresado — no SHALL ejecutar ninguna búsqueda por sí mismo. Es una variante propia, distinta de `NavbarSearch`, pensada para acotar una búsqueda al contenido de una pantalla (por ejemplo, una tabla) en vez de a toda la plataforma.

#### Scenario: Ingresar un término de búsqueda
- **WHEN** un usuario escribe en SearchField
- **THEN** el ícono de lupa permanece visible junto al texto ingresado, y SearchField notifica el valor al consumidor en cada cambio

#### Scenario: Campo vacío
- **WHEN** SearchField no tiene valor ingresado
- **THEN** muestra su placeholder junto al ícono de lupa

### Requirement: Opciones del componente FilterButton
El componente FilterButton SHALL presentar un botón con una etiqueta y un indicador visual de despliegue, que al activarse muestra un listado de opciones marcables. SHALL distinguirse visualmente cuando al menos una opción está activa, y SHALL notificar al consumidor los cambios de selección — no SHALL filtrar ningún dato por sí mismo.

#### Scenario: Abrir el listado de opciones
- **WHEN** un usuario activa un FilterButton
- **THEN** se muestra el listado de opciones marcables asociado

#### Scenario: Marcar una o más opciones
- **WHEN** un usuario marca una o más opciones del listado
- **THEN** FilterButton notifica el conjunto de opciones marcadas al consumidor, y el botón muestra su estado activo

#### Scenario: Sin opciones activas
- **WHEN** ninguna opción de FilterButton está marcada
- **THEN** el botón se muestra en su estado por defecto, sin el indicador de estado activo

### Requirement: Opciones del componente PaginationBar
El componente PaginationBar SHALL combinar, en una sola fila, un resumen textual del rango de resultados mostrado y el total, a la izquierda, con un selector de cantidad de resultados por página y la navegación de `Pagination` ya existente, a la derecha. PaginationBar SHALL componer `Pagination` sin modificarlo ni duplicar su lógica de navegación.

#### Scenario: Resumen de resultados
- **WHEN** PaginationBar recibe el rango actual y el total de resultados
- **THEN** muestra un texto con ambos datos a la izquierda de la fila

#### Scenario: Cambiar la cantidad de resultados por página
- **WHEN** un usuario elige una cantidad distinta en el selector de tamaño de página
- **THEN** PaginationBar notifica el nuevo tamaño al consumidor, sin decidir por sí mismo cómo recalcular la página actual

#### Scenario: Navegación delegada en Pagination
- **WHEN** un usuario navega entre páginas dentro de PaginationBar
- **THEN** el cambio de página se comporta exactamente igual que usar `Pagination` de forma directa, porque PaginationBar lo compone sin alterar su comportamiento
