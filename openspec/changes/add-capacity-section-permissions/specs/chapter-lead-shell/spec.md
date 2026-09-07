## MODIFIED Requirements

### Requirement: Navegación lateral del rol Chapter Lead
El sistema SHALL mostrar una navegación lateral con las entradas construidas hasta el momento para este rol, en este orden y agrupación, tomando del subconjunto correspondiente de `NAV.lead` del mockup de referencia su estructura y su orden pero no su redacción:
- Inicio
- Grupo "Iniciativas": Iniciativas
- Grupo "Capacidad": Células, Personas, Ausencias, Dedicación, Facturación, Competencias

Cada entrada salvo "Inicio" SHALL declarar el permiso de sección del módulo que exige — Iniciativas `Capacidad.Iniciativas`, Células `Capacidad.Celulas`, Personas `Capacidad.Personas`, Ausencias `Capacidad.Ausencias`, Dedicación `Capacidad.Dedicacion`, Facturación `Capacidad.Prefacturacion`, Competencias `Capacidad.Competencias` — y el menú SHALL mostrar únicamente las entradas cuyos permisos la sesión tiene, desapareciendo los grupos que queden vacíos. "Inicio" SHALL mostrarse siempre a quien entró al shell.

Cada etiqueta SHALL ser el término más corto que distingue su pantalla de las demás del menú, con el mismo criterio que la navegación de Admin: el menú se recorre buscando dónde ir, y el nombre completo de la pantalla vive en el breadcrumb.

Una entrada SHALL mostrarse activa tanto en su ruta exacta como en sus rutas hijas (por ejemplo, "Células" en el detalle de una célula). En una ruta hija, el breadcrumb SHALL mostrar el nombre completo de la pantalla padre seguido del nombre del elemento abierto.

La entrada "Iniciativas" SHALL mostrarse activa también en la evaluación de una iniciativa, cuyo breadcrumb SHALL ser (un solo nivel final, porque el breadcrumb del sistema colapsa más de tres niveles) "Plataforma / Gestionar Iniciativas / <nombre de la iniciativa> · Evaluación".

La entrada "Facturación" SHALL mostrarse activa también en el detalle de un cierre, cuyo breadcrumb SHALL ser "Plataforma / Facturación de proveedores / <proveedor> · <período>".

La entrada "Dedicación" (pantalla **Dedicación real**, `/app/lead/dedicacion`, en el lugar que ocupaba Backlog) SHALL mostrarse activa también en el dashboard de balance de un colaborador, cuyo breadcrumb SHALL ser "Plataforma / Dedicación real / <nombre del colaborador>"; y SHALL mostrar como badge la cantidad de colaboradores cuya **señal de balance del sprint en curso** es "Posible sobreasignación" o "Posible subasignación" cuando es mayor que cero, y ningún badge cuando es cero. Los colaboradores con señal "Revisar", "Balanceado" o "No evaluable" SHALL NOT contar en el badge: el badge cuenta lo que pide una decisión de carga, no lo que pide una mirada.

El sistema SHALL NOT mostrar entradas de navegación para pantallas de Chapter Lead que todavía no existen, ni para la antigua pantalla de Capacidades, ni una entrada "Backlog": la ruta `/app/lead/backlog` SHALL redirigir a `/app/lead/dedicacion`.

#### Scenario: Entrar al shell de Chapter Lead
- **WHEN** el usuario con los permisos de todas sus secciones navega a cualquier ruta bajo `/app/lead`
- **THEN** la navegación lateral muestra las entradas listadas arriba, con "Dedicación" y sin "Capacidades" ni "Backlog"

#### Scenario: Sin el permiso de una sección
- **WHEN** la sesión tiene los permisos del shell salvo `Capacidad.Prefacturacion` y `Capacidad.Ausencias`
- **THEN** "Facturación" y "Ausencias" no se muestran, y el resto del grupo "Capacidad" permanece en su orden

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
- **WHEN** en el sprint en curso hay colaboradores del chapter con señal de posible sobreasignación o de posible subasignación
- **THEN** la entrada "Dedicación" muestra esa cantidad como badge

#### Scenario: Revisar no cuenta en el badge
- **WHEN** todos los colaboradores del chapter leen "Balanceado", "Revisar" o "No evaluable" en el sprint en curso
- **THEN** la entrada "Dedicación" no muestra badge

#### Scenario: Entrada de Plan de carrera
- **WHEN** el usuario abre el mapa del span o el plan de una persona, bajo `/app/lead/competencias`
- **THEN** la entrada "Competencias" se muestra activa y el breadcrumb muestra "Competencias"

#### Scenario: Ruta antigua de Capacidades
- **WHEN** el usuario navega a `/app/lead/capacidades`
- **THEN** el sistema redirige al detalle de la célula indicada en `?celula=` o, sin ella, al listado de Células
