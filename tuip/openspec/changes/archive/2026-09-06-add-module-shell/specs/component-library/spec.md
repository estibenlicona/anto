## ADDED Requirements

### Requirement: Opciones del componente ModuleShell
El componente ModuleShell SHALL componer la estructura de un módulo que vive debajo de una barra superior ajena: una columna de navegación lateral que ocupa toda la altura disponible bajo esa barra, y el área de contenido que recibe como hijos, sin barra superior propia, sin botón de menú y sin cabecera de marca — el título visible del producto y del módulo pertenecen a la barra del host, y la columna NO SHALL repetirlos.

La columna lateral SHALL comenzar directamente por la navegación del componente Sidebar, y terminar, como último elemento, con el control de colapso que Sidebar ya ofrece suelto: una franja de borde a borde con su chevron y su rótulo ("Colapsar" / "Expandir"), que responde en toda su franja y cuyo rótulo comunica el estado actual. Ese SHALL ser el único control de colapso del módulo. La navegación SHALL exponer una etiqueta accesible que nombre al módulo, porque es el único lugar donde la columna lo nombra.

Colapsada, la columna lateral SHALL reducirse al ancho de sólo-íconos que Sidebar ya define, la franja de colapso SHALL seguir disponible al pie — con el rótulo "Expandir" para tecnologías de asistencia — y cada ítem SHALL seguir ofreciendo su nombre por tooltip y a las tecnologías de asistencia. El estado de colapso SHALL persistir entre sesiones bajo la misma clave de almacenamiento que Sidebar y AppShell, y SHALL colapsarse automáticamente por debajo del mismo umbral de ancho de ventana que ellos aplican.

ModuleShell SHALL aceptar un desplazamiento superior, expresado como la altura de la barra bajo la que se apoya, de modo que la columna lateral quede fija inmediatamente debajo de esa barra al desplazarse la página y su altura descuente ese espacio. Sin desplazamiento, la columna ocupa la altura completa de la ventana.

ModuleShell NO SHALL modificar los contratos de Sidebar ni de AppShell: es composición sobre Sidebar en modo controlado, y AppShell sigue siendo la pieza para una aplicación que trae su propia barra.

#### Scenario: Sin barra, cabecera ni hamburguesa: la columna empieza por la navegación
- **WHEN** un módulo renderiza ModuleShell
- **THEN** el primer elemento de la columna lateral es la navegación de Sidebar, sin ninguna cabecera de marca ni botón por encima, y no existe ninguna barra superior renderizada por el componente

#### Scenario: El control de colapso vive al pie
- **WHEN** se renderiza ModuleShell
- **THEN** el último elemento de la columna es la franja de colapso de Sidebar, de borde a borde, con el rótulo "Colapsar"

#### Scenario: La franja contrae y expande
- **WHEN** la persona activa la franja de colapso, con el puntero o con el teclado
- **THEN** la columna lateral alterna entre su ancho expandido y el de sólo-íconos, y el rótulo de la franja pasa a decir el estado nuevo ("Expandir" colapsada, "Colapsar" expandida)

#### Scenario: Colapsada, la franja sigue disponible
- **WHEN** la navegación está colapsada a sólo-íconos
- **THEN** la franja al pie sigue presente con el nombre accesible "Expandir", y la persona puede volver a expandir desde ahí

#### Scenario: El colapso persiste y se comparte con AppShell
- **WHEN** la persona colapsa la navegación en un módulo y después abre otra superficie que usa AppShell o Sidebar suelto
- **THEN** la preferencia se respeta en las dos, porque las tres piezas la guardan bajo la misma clave

#### Scenario: Colapso automático en ventanas angostas
- **WHEN** la ventana baja del umbral de ancho que Sidebar ya define para colapsarse solo
- **THEN** ModuleShell colapsa la navegación, y la persona puede re-expandirla desde la franja sin que el siguiente render se lo deshaga

#### Scenario: La columna se apoya bajo la barra del host
- **WHEN** ModuleShell recibe como desplazamiento superior la altura de la barra del host
- **THEN** al desplazar la página la columna lateral queda fija inmediatamente debajo de esa barra, y su altura es la de la ventana menos ese desplazamiento

#### Scenario: Sin desplazamiento ocupa la ventana completa
- **WHEN** ModuleShell se renderiza sin desplazamiento superior
- **THEN** la columna lateral ocupa toda la altura de la ventana, igual que la columna de AppShell

## MODIFIED Requirements

### Requirement: Notificaciones en Navbar
El botón de notificaciones de Navbar SHALL mostrar un indicador cuando exista al menos una notificación no leída, sin exhibir un conteo numérico en la propia barra, y ese indicador no SHALL ser la única señal de que hay notificaciones pendientes. Un producto que todavía no ofrece notificaciones SHALL poder omitir el botón y su panel por completo, de modo que la barra no muestre un control sin función; omitido, el resto de las zonas y la coordinación de paneles no SHALL cambiar. Por defecto el botón se muestra, para que quien ya usa Navbar no note ningún cambio.

#### Scenario: Indicador de no leídas sin conteo en la barra
- **WHEN** Navbar recibe notificaciones con al menos una marcada como no leída
- **THEN** el botón de notificaciones muestra un indicador visual, sin mostrar la cantidad de notificaciones como número junto al ícono

#### Scenario: El indicador no es la única señal
- **WHEN** una persona que no distingue el color del indicador abre el panel de notificaciones
- **THEN** puede identificar qué notificaciones no leyó por un medio distinto del color, dentro del propio panel

#### Scenario: Un producto sin notificaciones omite el botón
- **WHEN** Navbar se configura para no mostrar notificaciones
- **THEN** ni el botón ni su panel se renderizan, y la marca, la búsqueda, los enlaces de utilidad y la cuenta siguen en su lugar y funcionando igual

#### Scenario: Sin configurarlo, el botón sigue apareciendo
- **WHEN** Navbar se usa como hasta ahora, sin indicar nada sobre las notificaciones
- **THEN** el botón de notificaciones se muestra exactamente como antes

### Requirement: Distinción de uso entre AppShell y Navbar con Sidebar sueltos
El sistema SHALL distinguir en su documentación cuándo corresponde AppShell, cuándo ModuleShell y cuándo componer Navbar y Sidebar por separado: AppShell es la composición por defecto para una aplicación completa con navegación lateral y barra propias — trae la fusión resuelta (sidebar a toda altura con la marca en su cabecera, hamburguesa en la barra, colapso persistente) —; ModuleShell es la pieza para un módulo que vive debajo de la barra de un host y sólo es dueño de su navegación lateral — la columna a toda la altura disponible bajo esa barra, sin cabecera de marca porque el título lo pone el host, con el control de colapso de Sidebar al pie y el área de contenido al lado —; Navbar suelto sigue siendo la pieza para una aplicación o un host sin navegación lateral; y Sidebar suelto para colocar sólo la navegación dentro de un layout que la aplicación arma por su cuenta.

#### Scenario: Elegir la composición
- **WHEN** alguien consulta la documentación para armar el esqueleto de una aplicación interna
- **THEN** encuentra el criterio explícito: aplicación completa con navegación lateral, AppShell; módulo bajo la barra de un host, ModuleShell; sólo barra, Navbar; sólo la navegación dentro de un layout propio, Sidebar — y la advertencia de no recomponer ninguna de las dos fusiones a mano

#### Scenario: Host y módulo se reparten las piezas
- **WHEN** alguien consulta la documentación para dividir una plataforma en un host y módulos
- **THEN** encuentra que el host usa Navbar y cada módulo usa ModuleShell con el desplazamiento superior igual a la altura de esa barra, sin que ninguno de los dos use AppShell ni repita el título en la columna
