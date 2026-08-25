## MODIFIED Requirements

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales. El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** se muestra la estructura de formulario de parámetros del sprint, sin persistir ni cargar datos reales, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** se muestran las cuatro secciones (bandas de talla, mix de capacidades, pool de preguntas, versionado) como pestañas, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

## ADDED Requirements

### Requirement: Secciones de "Parámetros del modelo" en pestañas
La pantalla de Parámetros del modelo SHALL presentar sus cuatro secciones como pestañas, con una sola visible a la vez y la primera activa al cargar. Cada pestaña SHALL nombrar su sección, y la sección no SHALL repetir ese nombre en su propio contenido, por la misma razón por la que la pantalla no repite su título: la pestaña activa ya lo identifica.

#### Scenario: Ver una sección a la vez
- **WHEN** el usuario abre la pantalla de Parámetros del modelo
- **THEN** ve la primera sección (bandas de talla) y los rótulos de las otras tres, en vez de las cuatro tablas al mismo tiempo

#### Scenario: Cambiar de sección
- **WHEN** el usuario activa la pestaña de otra sección
- **THEN** se muestra el contenido de esa sección y se oculta el de la anterior

#### Scenario: El rótulo no se duplica
- **WHEN** se muestra una sección
- **THEN** su nombre aparece únicamente en su pestaña, sin repetirse como encabezado dentro del contenido

#### Scenario: Navegación por teclado entre pestañas
- **WHEN** el usuario recorre las pestañas con el teclado
- **THEN** puede moverse entre ellas y activarlas sin usar el mouse, y cada sección se anuncia asociada a la pestaña que la nombra

### Requirement: Presentación de las tablas de Parámetros del modelo
Las tablas de la pantalla de Parámetros del modelo SHALL integrarse a ras del contenedor que las rodea, sin dibujar un borde dentro de otro, SHALL alinear a la derecha sus columnas numéricas con cifras tabulares, y SHALL presentar la columna de talla como una etiqueta de pertenencia con un color propio por talla, estable en toda la pantalla.

#### Scenario: Una tabla dentro de su contenedor
- **WHEN** se muestra cualquiera de las cuatro tablas
- **THEN** se ve un solo borde, el del contenedor, en vez de un borde de la tabla dentro del borde del contenedor

#### Scenario: Columnas numéricas alineadas
- **WHEN** se muestra una tabla con columnas de valores numéricos, como puntaje, persona-mes, conteos o pesos
- **THEN** esas columnas se alinean a la derecha y sus dígitos quedan en columna entre filas, mientras las columnas de texto siguen alineadas a la izquierda

#### Scenario: La talla se muestra como etiqueta
- **WHEN** se muestra la tabla de bandas de talla
- **THEN** cada talla aparece como una etiqueta con un color que la distingue de las demás, sin que ese color implique un estado ni una severidad, y con el texto de la talla siempre presente
