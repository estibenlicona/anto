## Purpose

Provee la estructura de navegación y layout (sidebar, topbar, breadcrumb) para el rol Chapter Lead, como base sobre la que se construyen sus pantallas de negocio, empezando por Gestionar Células.
## Requirements
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

### Requirement: Navegación entre pantallas de Chapter Lead
El sistema SHALL permitir navegar entre las pantallas de Chapter Lead haciendo clic en cada entrada de la navegación lateral, sin recargar la aplicación completa, y SHALL reflejar la pantalla activa en el breadcrumb del topbar.

#### Scenario: Cambiar de pantalla
- **WHEN** el usuario hace clic en una entrada de navegación distinta a la actual
- **THEN** el contenido principal cambia a la pantalla correspondiente y el breadcrumb del topbar refleja el nuevo título

### Requirement: Acceso autenticado al shell de Chapter Lead
El sistema SHALL exigir sesión autenticada para acceder a las rutas del shell de Chapter Lead, y SHALL exigir además el rol de Chapter Lead. Un usuario sin sesión SHALL ser llevado a iniciar sesión; uno con sesión pero sin el rol SHALL recibir un aviso de permisos insuficientes.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a una ruta bajo el shell de Chapter Lead
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceder con el rol de Chapter Lead
- **WHEN** un usuario con sesión y con rol de Chapter Lead navega a una ruta del shell
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceder con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin rol de Chapter Lead navega a una ruta del shell
- **THEN** el sistema le indica que no tiene permisos, sin mandarlo a iniciar sesión

### Requirement: El Chapter Lead sólo ve las personas a su cargo
Toda pantalla del rol Chapter Lead que enumere, cuente o resuma personas SHALL considerar únicamente las personas del chapter que ese Chapter Lead lidera. Alcanza al listado de Personas y a sus indicadores, a la matriz del span, al equipo de cada célula, a la ocupación de la torre de control, al calendario de ausencias y a las asignaciones.

El acotado SHALL hacerlo el **servidor**, resolviendo la responsabilidad a partir del titular del token. La interfaz SHALL consumir lo que recibe y SHALL NOT filtrar por su cuenta: filtrar en el cliente una respuesta que ya trae los datos ajenos no restringe el acceso —los datos igual viajaron—, y además obliga a repetir la misma regla en cada pantalla, donde tarde o temprano una queda afuera.

Una persona SHALL pertenecer a un chapter, y ese chapter SHALL tener un Chapter Lead. La relación entre una persona y quien la tiene a cargo SHALL ser una sola en todo el sistema: si además existe otra jerarquía que nombre un responsable —una línea de expertise con su líder, por ejemplo—, lo que el sistema muestre como el Chapter Lead de una persona SHALL salir de la misma relación que decide qué ve ese lead. Dos jerarquías de responsabilidad en paralelo terminan contradiciéndose, y la contradicción aparece como una persona que figura a cargo de alguien que no la ve en su listado.

Todo total, promedio o porcentaje que la interfaz presente como "del chapter" SHALL calcularse sobre ese mismo conjunto acotado.

#### Scenario: El listado no incluye personas de otro chapter
- **WHEN** el sistema registra personas de más de un chapter y el Chapter Lead abre cualquier pantalla que enumere personas
- **THEN** sólo aparecen las de su chapter, y las de los demás no llegan siquiera en la respuesta del servidor

#### Scenario: La interfaz no filtra por su cuenta
- **WHEN** una pantalla del Chapter Lead recibe una lista de personas del servidor
- **THEN** la muestra tal como llega, sin descartar filas por responsabilidad, porque esa decisión ya se tomó donde están los datos

#### Scenario: Los totales acompañan al alcance
- **WHEN** una pantalla muestra un total, un promedio o un porcentaje descrito como "del chapter"
- **THEN** la cifra se calcula sobre las personas a cargo de ese Chapter Lead y no sobre todas las del sistema

#### Scenario: Una sola relación de responsabilidad
- **WHEN** la ficha de una persona muestra quién es su Chapter Lead
- **THEN** es el mismo lead que la ve en sus pantallas, porque el dato sale de la relación que decide el alcance y no de otra jerarquía en paralelo

#### Scenario: Un lead sin personas a cargo
- **WHEN** el chapter de ese Chapter Lead no tiene ninguna persona
- **THEN** las pantallas muestran su estado vacío, y no el de todo el sistema ni un error
