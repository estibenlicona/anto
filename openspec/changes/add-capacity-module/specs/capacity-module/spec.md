## Purpose

Define Gestión de Capacidad como módulo de la plataforma: el contrato mínimo que recibe del host que lo aloja, el shell interno único que arma con él (sidebar por permisos, sin barra superior propia) y sus modos de construcción y desarrollo como remote federado.

## ADDED Requirements

### Requirement: Contrato de montaje con el host
El módulo SHALL exponerse como remote federado con un único componente de entrada que recibe del host: la fuente de sesión (obtener la sesión actual con referencia estable y suscribirse a sus cambios), la función para obtener tokens de acceso por scopes, la ruta base bajo la que está montado y el alto de la barra del host. El módulo SHALL derivar toda su sesión de esa fuente y NO SHALL iniciar ni cerrar sesión, mostrar pantallas de login propias ni redirigir fuera de su ruta base. React, ReactDOM y el router SHALL compartirse con el host como singletons.

#### Scenario: Sesión desde el host
- **WHEN** el host entrega la fuente de sesión y la persona autenticada cambia (inicio, cierre, renovación)
- **THEN** el módulo refleja la sesión nueva sin recargar, con el mismo contrato de sesión que ya consumen sus pantallas

#### Scenario: Sin acciones de sesión propias
- **WHEN** se recorre la interfaz del módulo
- **THEN** no existe botón de iniciar o cerrar sesión ni pantalla de login: la cuenta vive en la barra del host

#### Scenario: Rutas relativas a la base
- **WHEN** el host monta el módulo bajo una ruta base
- **THEN** toda la navegación interna ocurre bajo esa base sin recargar la aplicación, y los enlaces profundos abiertos directamente resuelven a la pantalla correcta

### Requirement: Shell interno único por permisos
El módulo SHALL mostrar un único shell con navegación lateral propia y sin barra superior propia, ubicado bajo la barra del host y ocupando el alto restante. La navegación SHALL contener las secciones del módulo — Inicio; Iniciativas; grupo Capacidad: Células, Personas, Ausencias, Dedicación, Facturación, Competencias; grupo Configuración: Sprints, Parámetros, Habilidades, Líneas; grupo DevOps: Ingesta — filtradas por los permisos de sección de la sesión, con los grupos vacíos ocultos, la entrada activa marcada también en rutas hijas y el colapso del sidebar controlado desde su pie. El breadcrumb SHALL mostrarse en el encabezado del área de contenido. "Inicio" SHALL mostrar la torre de control cuando la sesión tiene permisos de capacidad y el estado de la plataforma cuando sólo tiene permisos de configuración.

#### Scenario: Sidebar según permisos
- **WHEN** la sesión tiene los permisos de unas secciones y no de otras
- **THEN** el menú ofrece exactamente las secciones permitidas, los grupos sin entradas desaparecen y las rutas de secciones no permitidas muestran el aviso de permisos del módulo

#### Scenario: Sin barra propia
- **WHEN** el módulo se muestra dentro del host
- **THEN** no renderiza barra superior, buscador ni campana propios: la única barra es la del host, y el sidebar del módulo empieza debajo de ella

#### Scenario: Breadcrumb en el contenido
- **WHEN** la persona está en una pantalla con jerarquía (por ejemplo el detalle de una célula)
- **THEN** el encabezado del contenido muestra el rastro con el nombre completo de la pantalla padre y el elemento abierto, como lo hacía la topbar

#### Scenario: Inicio según permisos
- **WHEN** una persona con permisos de capacidad abre la raíz del módulo
- **THEN** ve la torre de control; con sólo permisos de configuración ve el estado de la plataforma

### Requirement: Permisos de sección desde el token del módulo
El módulo SHALL derivar sus permisos de sección pidiendo al host un token de acceso para su API y leyendo los sub-claims de rol del token; SHALL renovar esa derivación cuando la sesión cambie. Si el token no puede obtenerse, el módulo SHALL comportarse como sin permisos de sección, sin fallar. La lectura del token SHALL ser sólo informativa para la interfaz: la autorización real pertenece al backend.

#### Scenario: Permisos desde el token
- **WHEN** el host entrega un token de la API del módulo cuyo claim de roles trae sub-claims de sección
- **THEN** el menú y los guards reflejan exactamente esas secciones

#### Scenario: Token ausente
- **WHEN** el host no puede entregar el token del módulo
- **THEN** el módulo muestra su interfaz sin secciones (aviso de permisos), sin errores ni pantallas en blanco

### Requirement: Desarrollo y datos bajo el host
El módulo SHALL desarrollarse ejecutándose dentro del host: su servidor de desarrollo publica el remote y el host lo carga por configuración. Mientras el backend real no esté cableado, los datos del módulo SHALL seguir proviniendo de sus mocks también bajo el host en desarrollo, y esos mocks NO SHALL formar parte del build de producción del remote.

#### Scenario: Ciclo de desarrollo
- **WHEN** el emulador de identidad, el host y el servidor del remote están corriendo
- **THEN** entrar a la ruta del módulo en el host muestra el módulo con datos de mocks y sesión real del emulador, y los cambios de código del módulo se reflejan sin reiniciar el host

#### Scenario: Mocks fuera de producción
- **WHEN** se construye el remote para producción
- **THEN** el artefacto no contiene los mocks ni su service worker
