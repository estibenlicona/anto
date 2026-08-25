## MODIFIED Requirements

### Requirement: Páginas de fundamentos
El sitio SHALL documentar los fundamentos del sistema en páginas separadas por tema —tipografía, color y tokens, y espaciado y layout—, cada una accesible desde la sección de fundamentos de la navegación. Cada página SHALL presentar los valores del tema junto con el nombre del token que los expresa y la orientación de cuándo aplicar cada uno.

La página de espaciado y layout SHALL documentar además la estructura de página que comparten las aplicaciones del sistema, sus puntos de quiebre, las alturas de control, los anchos máximos por tipo de contenido y las capas de superposición.

La página de color SHALL distinguir la paleta de marca de las paletas semánticas, y SHALL documentar el modo oscuro como conjunto propio de valores.

La página de color SHALL documentar además los vocabularios de color que no son semánticos, presentándolos como categoría aparte y no como una familia más de la escala semántica. Para la paleta de acento, SHALL mostrar sus cuatro matices con el nombre del token de cada uno y su contraste medido contra las superficies del sistema sobre las que puede quedar apoyado, expresado como razón concreta. La página SHALL afirmar de forma explícita que un matiz de acento no comunica estado y no reemplaza a los roles `success`, `warning`, `danger` ni `info`, en vez de dejar esa distinción implícita en la separación visual de las tablas.

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

#### Scenario: Consultar la paleta de acento
- **WHEN** un usuario abre la página de color y tokens
- **THEN** ve los cuatro matices de acento con el nombre de su token y el contraste medido de cada uno contra las superficies donde puede usarse

#### Scenario: El acento se presenta aparte de lo semántico
- **WHEN** un usuario recorre la página de color y tokens
- **THEN** encuentra la paleta de acento en una sección propia, con una advertencia explícita de que no comunica estado y no reemplaza a los roles semánticos
