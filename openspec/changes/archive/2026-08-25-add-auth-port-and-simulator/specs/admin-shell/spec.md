## ADDED Requirements

### Requirement: Acceso autenticado al esqueleto de Admin
El sistema SHALL exigir sesión autenticada para acceder a las 4 rutas del esqueleto de Admin, y SHALL exigir además el rol de administrador. Un usuario sin sesión SHALL ser llevado a iniciar sesión; uno con sesión pero sin el rol SHALL recibir un aviso de permisos insuficientes.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a una ruta del esqueleto de Admin
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceder con rol de administrador
- **WHEN** un usuario con sesión y con rol de administrador navega a una ruta del esqueleto de Admin
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceder con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin rol de administrador navega a una ruta del esqueleto de Admin
- **THEN** el sistema le indica que no tiene permisos, sin mandarlo a iniciar sesión

## REMOVED Requirements

### Requirement: Acceso sin autenticación al esqueleto de Admin
**Reason**: Existía porque la plataforma no tenía forma de saber quién era el usuario. Con el contrato de sesión de `auth-session` ya la tiene, en desarrollo mediante el simulador y en producción mediante el host.

**Migration**: Lo reemplaza "Acceso autenticado al esqueleto de Admin", en esta misma capacidad. Para trabajar en estas pantallas en desarrollo hay que levantar la aplicación con el simulador y elegir un perfil con rol de administrador.
