## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Acceso sin autenticación al shell de Chapter Lead
**Reason**: Existía porque la plataforma no tenía forma de saber quién era el usuario. Con el contrato de sesión de `auth-session` ya la tiene, en desarrollo mediante el simulador y en producción mediante el host.

**Migration**: Lo reemplaza "Acceso autenticado al shell de Chapter Lead", en esta misma capacidad. Para trabajar en estas pantallas en desarrollo hay que levantar la aplicación con el simulador y elegir un perfil con rol de Chapter Lead.
