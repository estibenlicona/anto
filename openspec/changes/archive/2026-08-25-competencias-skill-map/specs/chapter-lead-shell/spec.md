## MODIFIED Requirements

### Requirement: Navegación lateral del rol Chapter Lead
El sistema SHALL mostrar una navegación lateral con las entradas construidas hasta el momento para este rol, en este orden y agrupación, tomando del subconjunto correspondiente de `NAV.lead` del mockup de referencia su estructura y su orden pero no su redacción:
- Inicio
- Grupo "Iniciativas": Iniciativas
- Grupo "Capacidad": Células, Personas, Ausencias, Backlog, Facturación, Competencias

Cada etiqueta SHALL ser el término más corto que distingue su pantalla de las demás del menú, con el mismo criterio que la navegación de Admin: el menú se recorre buscando dónde ir, y el nombre completo de la pantalla vive en el breadcrumb.

Una entrada SHALL mostrarse activa tanto en su ruta exacta como en sus rutas hijas (por ejemplo, "Células" en el detalle de una célula). En una ruta hija, el breadcrumb SHALL mostrar el nombre completo de la pantalla padre seguido del nombre del elemento abierto.

La entrada "Iniciativas" SHALL mostrarse activa también en la evaluación de una iniciativa, cuyo breadcrumb SHALL ser (un solo nivel final, porque el breadcrumb del sistema colapsa más de tres niveles) "Plataforma / Gestionar Iniciativas / <nombre de la iniciativa> · Evaluación".

La entrada "Facturación" SHALL mostrarse activa también en el detalle de un cierre, cuyo breadcrumb SHALL ser "Plataforma / Facturación de proveedores / <proveedor> · <período>".

La entrada "Backlog" SHALL mostrar como badge la cantidad de historias por clasificar cuando es mayor que cero, y ningún badge cuando es cero.

El sistema SHALL NOT mostrar entradas de navegación para pantallas de Chapter Lead que todavía no existen, ni para la antigua pantalla de Capacidades.

#### Scenario: Entrar al shell de Chapter Lead
- **WHEN** el usuario navega a cualquier ruta bajo `/app/lead`
- **THEN** la navegación lateral muestra las entradas listadas arriba, sin "Capacidades"

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las rutas de Chapter Lead
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa

#### Scenario: Entrada activa en una ruta hija
- **WHEN** el usuario está en el detalle de una célula o en la evaluación de una iniciativa
- **THEN** la entrada "Células" (o "Iniciativas") se muestra como activa y el breadcrumb muestra "Plataforma / Gestionar Células / <nombre de la célula>" (o "Plataforma / Gestionar Iniciativas / <nombre de la iniciativa> · Evaluación")

#### Scenario: El nombre completo no se pierde
- **WHEN** el usuario está en una pantalla cuya entrada de menú es un término corto
- **THEN** el breadcrumb sigue mostrando el nombre completo de esa pantalla

#### Scenario: Badge de pendientes en Backlog
- **WHEN** hay historias por clasificar en el chapter
- **THEN** la entrada "Backlog" muestra la cantidad como badge; al clasificarlas todas, el badge desaparece

#### Scenario: Entrada de Plan de carrera
- **WHEN** el usuario abre el mapa del span o el plan de una persona, bajo `/app/lead/competencias`
- **THEN** la entrada "Competencias" se muestra activa y el breadcrumb muestra "Competencias"

#### Scenario: Ruta antigua de Capacidades
- **WHEN** el usuario navega a `/app/lead/capacidades`
- **THEN** el sistema redirige al detalle de la célula indicada en `?celula=` o, sin ella, al listado de Células

