## ADDED Requirements

### Requirement: Página de iconografía
El sitio SHALL incluir una página de iconografía que presente la librería completa agrupada por familia, con el nombre de cada icono junto a su dibujo, las reglas de construcción y de tamaño, el comportamiento de color y accesibilidad, y el método para incorporar un icono nuevo.

#### Scenario: Encontrar un icono por su concepto
- **WHEN** un usuario abre la página de iconografía buscando un icono para una acción
- **THEN** ve los iconos agrupados por familia con el nombre de cada uno junto a su dibujo

#### Scenario: Consultar las reglas de construcción
- **WHEN** un usuario abre la página de iconografía
- **THEN** encuentra la retícula, el grosor de trazo, los tamaños admitidos y su uso previsto

#### Scenario: Saber cómo agregar un icono
- **WHEN** un usuario necesita un icono que la librería no tiene
- **THEN** la página le da el método a seguir antes de dibujarlo

### Requirement: Reglas de aplicación en las páginas de fundamentos
Las páginas de fundamentos SHALL enunciar, junto a cada escala, las reglas que gobiernan su aplicación —entre ellas la regla de escasez del color de marca y la relación entre la separación dentro de un grupo y la separación entre grupos—, presentadas como notas destacadas del texto corrido.

#### Scenario: Consultar la regla del color de marca
- **WHEN** un usuario abre la página de color
- **THEN** lee que el color de marca señala una sola acción por vista, y por qué

#### Scenario: Consultar la regla de pertenencia del espacio
- **WHEN** un usuario abre la página de espaciado
- **THEN** lee que el salto dentro de un grupo debe ser menor que el salto entre grupos, y qué comunica esa diferencia

## MODIFIED Requirements

### Requirement: Páginas de fundamentos
El sitio SHALL documentar los fundamentos del sistema en páginas separadas por tema —tipografía, color y tokens, y espaciado y layout—, cada una accesible desde la sección de fundamentos de la navegación. Cada página SHALL presentar los valores del tema junto con el nombre del token que los expresa y la orientación de cuándo aplicar cada uno.

La página de espaciado y layout SHALL documentar además la estructura de página que comparten las aplicaciones del sistema, sus puntos de quiebre, las alturas de control, los anchos máximos por tipo de contenido y las capas de superposición.

La página de color SHALL distinguir la paleta de marca de las paletas semánticas, y SHALL documentar el modo oscuro como conjunto propio de valores.

#### Scenario: Consultar la escala tipográfica
- **WHEN** un usuario abre la página de tipografía
- **THEN** ve las familias tipográficas del sistema y la escala completa, con el tamaño, el interlineado, el peso y el uso previsto de cada paso

#### Scenario: Consultar la paleta de color
- **WHEN** un usuario abre la página de color y tokens
- **THEN** ve la paleta base y las paletas semánticas, cada color con su valor y el nombre del token que lo expresa

#### Scenario: Consultar la escala de espaciado
- **WHEN** un usuario abre la página de espaciado
- **THEN** ve los alias de espaciado con su valor y la relación entre elementos que cada uno expresa

#### Scenario: Fundamentos accesibles desde la navegación
- **WHEN** un usuario despliega la sección de fundamentos en el sidebar
- **THEN** ve las páginas de tipografía, color y espaciado como entradas independientes

#### Scenario: Consultar la estructura de una página
- **WHEN** un usuario abre la página de espaciado y layout
- **THEN** ve la anatomía que comparten las aplicaciones del sistema, con la medida de cada zona

#### Scenario: Consultar el comportamiento responsive
- **WHEN** un usuario abre la página de espaciado y layout
- **THEN** ve los puntos de quiebre con lo que cambia en cada rango

#### Scenario: Consultar el modo oscuro
- **WHEN** un usuario abre la página de color y tokens
- **THEN** ve los valores del modo oscuro y la explicación de por qué no son la inversión de los del modo claro
