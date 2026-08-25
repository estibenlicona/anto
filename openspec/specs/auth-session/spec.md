# auth-session Specification

## Purpose

Define qué necesita esta aplicación saber sobre la sesión del usuario para decidir qué muestra y qué permite, y de dónde sale esa información: del host que la aloja como microfrontend, o de un simulador durante el desarrollo.

## Requirements

### Requirement: Contrato único de sesión
El sistema SHALL exponer una única forma de consultar la sesión: si hay usuario autenticado, quién es, sus roles, sus claims, sus scopes, y cómo obtener el token para llamar al backend. Todo el código de negocio —pantallas, guards, menús, servicios— SHALL consumir únicamente ese contrato, y SHALL NOT conocer de dónde sale la sesión.

#### Scenario: Una pantalla necesita saber si hay sesión
- **WHEN** una pantalla o un guard necesita saber si hay usuario autenticado o qué roles tiene
- **THEN** lo obtiene del contrato de sesión, sin referirse a ninguna implementación concreta ni a ninguna variable de entorno

#### Scenario: La sesión cambia mientras la aplicación está montada
- **WHEN** la sesión cambia sin recargar la página — el usuario cierra sesión, cambia de usuario, o su token se renueva
- **THEN** las pantallas que dependen de la sesión reflejan el cambio, sin necesidad de recargar

#### Scenario: Cambiar el origen de la sesión no toca el negocio
- **WHEN** se cambia qué implementación provee la sesión
- **THEN** ningún componente de negocio requiere modificación, porque ninguno nombra una implementación concreta

### Requirement: Selección de la implementación en el arranque
El sistema SHALL decidir en un único punto de composición cuál implementación del contrato se usa, y SHALL tomar esa decisión a partir de la configuración de build. El sistema SHALL NOT decidirlo dentro de componentes de negocio ni permitir que la decisión se tome en tiempo de ejecución desde el navegador.

#### Scenario: Arranque en desarrollo con el simulador habilitado
- **WHEN** la aplicación arranca en desarrollo con el simulador habilitado por configuración
- **THEN** la sesión proviene del simulador

#### Scenario: Arranque sin el simulador
- **WHEN** la aplicación arranca sin el simulador habilitado
- **THEN** la sesión proviene del host, y el simulador no participa de ninguna manera

### Requirement: Sesión provista por el host
El sistema SHALL obtener la sesión del host que lo aloja cuando no está en modo simulado, adaptando lo que el host entrega al contrato de sesión. El sistema SHALL NOT gestionar el inicio de sesión, la renovación de tokens ni el cierre de sesión por su cuenta: eso pertenece al host.

#### Scenario: El host provee una sesión
- **WHEN** el host entrega una sesión con usuario, roles y token
- **THEN** la aplicación la expone a través del contrato de sesión, sin alterar su contenido

#### Scenario: El host no provee sesión
- **WHEN** el host no entrega ninguna sesión
- **THEN** el contrato reporta que no hay usuario autenticado, sin error

### Requirement: Perfiles simulados
El sistema SHALL ofrecer, en modo simulado, un conjunto de perfiles predefinidos que cubra al menos: sin sesión, usuario común, administrador, y usuario con permisos restringidos. Cada perfil SHALL definir su identidad, sus roles, sus claims y sus scopes.

#### Scenario: Elegir un perfil
- **WHEN** se selecciona un perfil en el simulador
- **THEN** la aplicación pasa a comportarse como si ese fuera el usuario de la sesión, sin comunicarse con ningún proveedor de identidad externo

#### Scenario: Cambiar de usuario
- **WHEN** se selecciona un perfil distinto del activo
- **THEN** la sesión pasa a ser la del perfil nuevo, y las pantallas que dependen de roles o permisos se actualizan en consecuencia

#### Scenario: Cerrar sesión simulada
- **WHEN** se cierra la sesión desde el simulador
- **THEN** el contrato reporta que no hay usuario autenticado, igual que si el host no hubiera provisto sesión

#### Scenario: La sesión simulada sobrevive a una recarga
- **WHEN** se recarga la página con un perfil activo
- **THEN** el perfil sigue siendo el mismo, para no tener que reelegirlo en cada recarga durante el desarrollo

### Requirement: Token simulado válido o expirado
El sistema SHALL permitir, en modo simulado, que el token de la sesión se comporte como válido o como expirado, para poder ejercitar el manejo de ambos casos.

#### Scenario: Token válido
- **WHEN** el perfil activo tiene un token válido y se hace una llamada al backend
- **THEN** la llamada lleva el token, igual que lo haría con una sesión real

#### Scenario: Token expirado
- **WHEN** se marca el token como expirado
- **THEN** la aplicación se comporta como ante un token vencido de una sesión real, sin tratarlo como un caso especial del simulador

### Requirement: UI de desarrollo del simulador
El sistema SHALL ofrecer, únicamente en modo simulado, una interfaz para elegir el perfil activo, cambiar de usuario, cerrar sesión y alternar la validez del token. Esa interfaz SHALL distinguirse visualmente del resto de la aplicación, de modo que nadie la confunda con funcionalidad del producto.

#### Scenario: Operar el simulador
- **WHEN** la aplicación corre en modo simulado
- **THEN** hay una interfaz visible para elegir perfil y aplicar la sesión, señalada como herramienta de desarrollo

#### Scenario: La UI no existe fuera del modo simulado
- **WHEN** la aplicación corre sin el simulador habilitado
- **THEN** esa interfaz no se muestra ni existe en la página

### Requirement: El simulador no llega a producción
El sistema SHALL excluir el simulador —su código, sus perfiles y su interfaz— del artefacto de producción. El sistema SHALL NOT permitir activarlo desde el navegador en producción por ningún medio: ni parámetro de URL, ni almacenamiento local, ni variable global, ni consola.

#### Scenario: Build de producción
- **WHEN** se genera el artefacto de producción
- **THEN** el código del simulador no está incluido en él

#### Scenario: Intento de activarlo en producción
- **WHEN** alguien intenta habilitar el simulador en producción por cualquier medio disponible en el navegador
- **THEN** no ocurre nada: la sesión sigue proviniendo del host

### Requirement: Rutas protegidas por sesión y por rol
El sistema SHALL impedir el acceso a las pantallas de negocio cuando no hay sesión, redirigiendo a la pantalla de inicio de sesión. El sistema SHALL además permitir exigir uno o más roles para una ruta, y SHALL distinguir "no hay sesión" de "hay sesión pero sin el rol necesario".

#### Scenario: Acceso sin sesión
- **WHEN** un usuario sin sesión navega a una pantalla protegida
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceso con sesión y rol suficiente
- **WHEN** un usuario con sesión y con el rol exigido navega a una pantalla protegida
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceso con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin el rol exigido navega a una pantalla protegida
- **THEN** el sistema le indica que no tiene permisos, de forma distinguible de la ausencia de sesión, y no lo manda a iniciar sesión — ya lo hizo

### Requirement: Navegación según permisos
El sistema SHALL mostrar en la navegación únicamente las entradas que el usuario de la sesión puede usar, de modo que no se le ofrezcan pantallas a las que el guard le negaría el acceso.

#### Scenario: Entradas visibles según rol
- **WHEN** el usuario de la sesión no tiene el rol que una pantalla exige
- **THEN** la entrada de navegación hacia esa pantalla no se le muestra
