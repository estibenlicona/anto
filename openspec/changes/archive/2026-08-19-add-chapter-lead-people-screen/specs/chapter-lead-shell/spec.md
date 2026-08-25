## MODIFIED Requirements

### Requirement: Navegación lateral del rol Chapter Lead
El sistema SHALL mostrar una navegación lateral con las entradas construidas hasta el momento para este rol, en este orden y agrupación, tomando del subconjunto correspondiente de `NAV.lead` del mockup de referencia su estructura y su orden pero no su redacción:
- Inicio
- Grupo "Capacidad": Células, Personas

Cada etiqueta SHALL ser el término más corto que distingue su pantalla de las demás del menú, con el mismo criterio que la navegación de Admin: el menú se recorre buscando dónde ir, y el nombre completo de la pantalla vive en el breadcrumb.

El sistema SHALL NOT mostrar entradas de navegación para pantallas de Chapter Lead que todavía no existen.

#### Scenario: Entrar al shell de Chapter Lead
- **WHEN** el usuario navega a cualquier ruta bajo `/app/lead`
- **THEN** la navegación lateral muestra las entradas listadas arriba

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las rutas de Chapter Lead
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa

#### Scenario: El nombre completo no se pierde
- **WHEN** el usuario está en una pantalla cuya entrada de menú es un término corto
- **THEN** el breadcrumb sigue mostrando el nombre completo de esa pantalla
