## MODIFIED Requirements

### Requirement: Sesión provista por el host
El sistema SHALL obtener la sesión únicamente del host que lo aloja, adaptando al contrato de sesión la fuente que el host entrega en el montaje (sesión actual con referencia estable y suscripción a cambios). El sistema SHALL NOT gestionar el inicio de sesión, la renovación de tokens ni el cierre de sesión por su cuenta, ni ofrecer una vía alternativa de sesión en tiempo de ejecución: eso pertenece al host.

#### Scenario: El host provee una sesión
- **WHEN** el host entrega una sesión con usuario, roles y token
- **THEN** la aplicación la expone a través del contrato de sesión, sin alterar su contenido

#### Scenario: El host no provee sesión
- **WHEN** el host no entrega ninguna sesión
- **THEN** el contrato reporta que no hay usuario autenticado, sin error

#### Scenario: La sesión del host cambia
- **WHEN** el host notifica un cambio de sesión (cierre, renovación, otra persona)
- **THEN** el contrato refleja la sesión nueva y las pantallas que dependen de roles o permisos se actualizan sin recargar

### Requirement: Rutas protegidas por sesión y por rol
El sistema SHALL impedir el acceso a las pantallas de negocio cuando no hay sesión, mostrando el aviso de permisos del módulo — la redirección a iniciar sesión pertenece al host, que no monta el módulo sin sesión. El sistema SHALL además permitir exigir uno o más roles para una ruta, y también un permiso de sección del módulo, y SHALL distinguir en el aviso "no hay sesión" de "hay sesión pero sin el rol o el permiso necesario".

#### Scenario: Acceso sin sesión
- **WHEN** el contrato reporta ausencia de sesión al entrar a una pantalla protegida
- **THEN** el sistema muestra su aviso de acceso no disponible, sin pantalla de login propia y sin salir de su ruta base

#### Scenario: Acceso con sesión y rol suficiente
- **WHEN** un usuario con sesión y con el rol exigido navega a una pantalla protegida
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceso con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin el rol exigido navega a una pantalla protegida
- **THEN** el sistema le indica que no tiene permisos, de forma distinguible de la ausencia de sesión

#### Scenario: Acceso con rol pero sin el permiso de la sección
- **WHEN** un usuario con sesión y con el rol del módulo navega a la ruta de una sección cuyo permiso no tiene
- **THEN** el sistema le indica que no tiene permisos para esa sección

## REMOVED Requirements

### Requirement: Selección de la implementación en el arranque
**Reason**: Ya no hay implementaciones entre las que elegir: la app dejó de ser standalone y la sesión llega siempre del host en el montaje del remote. La decisión de build desapareció con el modo simulado.
**Migration**: El composition root del módulo recibe la fuente de sesión como prop del contrato de montaje; los tests montan pantallas con el puerto falso de siempre (`deriveAuthSession` sobre sesiones fabricadas).

### Requirement: Perfiles simulados
**Reason**: El simulador de sesión del front se retira: en desarrollo la sesión real viene del host autenticado contra el emulador de identidad local, con personas y sub-claims sembrados (`pnpm entra:seed`), que cubren los mismos casos que cubrían los perfiles.
**Migration**: Los casos de prueba interactivos usan las personas del emulador (administradora, líder de expertise, líder técnica, persona sin rol); los tests unitarios siguen fabricando sesiones directamente contra el contrato.

### Requirement: Token simulado válido o expirado
**Reason**: Cae con el simulador. El caso "token vencido" se ejercita con el emulador (vidas de token configurables) o fabricando sesiones sin token en tests.
**Migration**: En tests, sesión con `accessToken: null`; interactivamente, expiración real contra el emulador.

### Requirement: UI de desarrollo del simulador
**Reason**: Cae con el simulador: cambiar de persona en desarrollo es cerrar sesión en la barra del host y entrar con otra cuenta del emulador.
**Migration**: Ninguna: el panel se elimina junto con el simulador.

### Requirement: El simulador no llega a producción
**Reason**: Sin simulador no hay nada que excluir del build.
**Migration**: Ninguna.
