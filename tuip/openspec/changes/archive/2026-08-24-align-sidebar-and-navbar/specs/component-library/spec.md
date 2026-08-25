## ADDED Requirements

### Requirement: Alineación horizontal del shell
El contenido de los elementos de navegación del shell —los ítems del Sidebar, los rótulos de sus grupos, su control de colapso y la marca del Navbar— SHALL empezar sobre una misma vertical, de modo que el borde izquierdo del shell se lea como una sola línea. Esa alineación SHALL surgir de la estructura de cada elemento y no de compensar diferencias con valores sueltos, para que un cambio de relleno o de borde no la rompa en silencio.

#### Scenario: Los ítems y sus rótulos de grupo se alinean
- **WHEN** se muestra un grupo del Sidebar con su rótulo y sus ítems
- **THEN** el rótulo del grupo empieza en la misma vertical que los íconos de los ítems que encabeza

#### Scenario: El Sidebar se alinea con el Navbar
- **WHEN** se muestran Navbar y Sidebar en la misma pantalla
- **THEN** la marca del Navbar y el primer ícono del Sidebar empiezan en la misma vertical

#### Scenario: El control de colapso se alinea con los ítems
- **WHEN** se muestra el control de colapso del Sidebar expandido
- **THEN** su ícono empieza en la misma vertical que los íconos de los ítems, pese a que ese control no lleva indicador de activo

#### Scenario: El indicador de activo no desplaza el contenido
- **WHEN** un ítem del Sidebar pasa a estar activo
- **THEN** su contenido no se corre: el indicador ocupa un espacio que el ítem ya reservaba estando inactivo

### Requirement: Zona activa del control de colapso de Sidebar
El control de colapso SHALL responder al clic y mostrar su estado de hover en toda la franja que su separador delimita, de borde a borde del Sidebar, y no sólo sobre su texto e ícono. Su presentación SHALL corresponder a esa franja completa en vez de a un elemento embutido.

#### Scenario: Toda la franja responde
- **WHEN** una persona apunta a cualquier punto de la franja del control de colapso, incluido el espacio a la derecha del texto
- **THEN** esa zona muestra su estado de hover y el clic colapsa o expande el Sidebar

#### Scenario: La franja se lee como una sola zona
- **WHEN** se muestra el control de colapso
- **THEN** su fondo de hover llega a los bordes de la franja, sin esquinas redondeadas que lo separen visualmente del área que el separador delimita

#### Scenario: El control colapsado sigue respondiendo en toda su franja
- **WHEN** el Sidebar está colapsado y el control muestra sólo su ícono
- **THEN** la franja completa sigue siendo clickeable, en vez de reducirse al tamaño del ícono
