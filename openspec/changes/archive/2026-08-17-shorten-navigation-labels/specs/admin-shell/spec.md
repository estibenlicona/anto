## MODIFIED Requirements

### Requirement: Navegación lateral del rol Admin
El sistema SHALL mostrar una navegación lateral con exactamente estas 4 entradas, en este orden y agrupación, tomando de `NAV.admin` del mockup de referencia su estructura y su orden pero no su redacción:
- Inicio
- Grupo "Configuración": Sprints, Parámetros
- Grupo "DevOps": Ingesta

Cada etiqueta SHALL ser el término más corto que distingue su pantalla de las demás del menú, dado que la navegación se recorre buscando dónde ir y no se lee. El nombre completo de la pantalla SHALL seguir estando en el breadcrumb y en el encabezado de la pantalla, que no forman parte del menú.

#### Scenario: Entrar al esqueleto de Admin
- **WHEN** el usuario navega a cualquier ruta bajo `/app/admin`
- **THEN** la navegación lateral muestra las 4 entradas agrupadas como arriba

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las 4 rutas de Admin
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa y las otras 3 no

#### Scenario: El nombre completo no se pierde
- **WHEN** el usuario está en una pantalla cuya entrada de menú es un término corto
- **THEN** el breadcrumb sigue mostrando el nombre completo de esa pantalla, de modo que acortar el menú no deja al usuario sin saber dónde está

### Requirement: Secciones de "Parámetros del modelo" en pestañas
La pantalla de Parámetros del modelo SHALL presentar sus cuatro secciones como pestañas, con una sola visible a la vez y la primera activa al cargar. Cada pestaña SHALL nombrar su sección con el término más corto que la distingue de las otras tres —Bandas, Capacidades, Preguntas y Versionado— y la sección no SHALL repetir ese nombre en su propio contenido, por la misma razón por la que la pantalla no repite su título: la pestaña activa ya lo identifica.

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
