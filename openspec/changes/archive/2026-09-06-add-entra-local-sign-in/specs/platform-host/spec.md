## ADDED Requirements

### Requirement: Roles de negocio y módulos por rol
La plataforma SHALL reconocer tres roles de negocio derivados de los claims de rol del token del host: administrador (`Plataforma.Admin`), líder de expertise (`Plataforma.ChapterLead`) y líder técnico (`Plataforma.TechLead`). El registro de módulos SHALL declarar, como mínimo, "Gestión de Capacidad" para administrador y líder de expertise, e "Iniciativas y Células" para administrador, líder de expertise y líder técnico. La cuenta en la barra SHALL mostrar el nombre del rol en el idioma de la plataforma.

#### Scenario: Líder técnico
- **WHEN** una persona cuyo token trae `Plataforma.TechLead` abre el portal
- **THEN** ve "Iniciativas y Células" y no ve "Gestión de Capacidad", y su cuenta la identifica como líder técnica

#### Scenario: Líder de expertise
- **WHEN** una persona cuyo token trae `Plataforma.ChapterLead` abre el portal
- **THEN** ve "Gestión de Capacidad" e "Iniciativas y Células"

#### Scenario: Varios roles
- **WHEN** el token trae más de un claim de rol conocido
- **THEN** la persona ve la unión de los módulos que esos roles admiten, sin repetir ninguno

## MODIFIED Requirements

### Requirement: Sesión con el proveedor de identidad corporativo
El host SHALL ser el único que inicia y cierra sesión, contra un proveedor de identidad compatible con Entra ID mediante redirección al proveedor, con la configuración tomada del entorno de despliegue: identificador de aplicación, inquilino, URI de retorno y los scopes del token de acceso. La autoridad SHALL ser configurable: por defecto la nube de Entra ID para el inquilino indicado, y opcionalmente otra autoridad (como un emulador local) declarada como conocida, sin que cambie el flujo ni el código. Al arrancar sin sesión, el host SHALL llevar a la persona a iniciar sesión; al volver del proveedor SHALL reconstruir la sesión sin intervención. Los roles de negocio SHALL derivarse de los claims de rol del token mediante un mapeo explícito, y los claims crudos SHALL quedar disponibles en la sesión. Si falta la configuración del proveedor, el host SHALL mostrar un error explícito que nombre la variable faltante, en vez de una pantalla en blanco.

#### Scenario: Primer ingreso
- **WHEN** una persona sin sesión abre cualquier ruta del host
- **THEN** el host la lleva a iniciar sesión con el proveedor, y al regresar la deja en la ruta que había pedido, con su sesión activa

#### Scenario: Sesión existente al recargar
- **WHEN** una persona con sesión vigente recarga la página
- **THEN** el host reconstruye la sesión sin volver a pedir credenciales, y durante esa reconstrucción no muestra ni el inicio de sesión ni el contenido protegido

#### Scenario: Roles desde los claims
- **WHEN** el token de la persona trae claims de rol del proveedor
- **THEN** la sesión expone los roles de negocio equivalentes según el mapeo, y un claim de rol desconocido se ignora sin fallar

#### Scenario: Token expirado
- **WHEN** el token de acceso de la persona ya no puede renovarse en silencio
- **THEN** la sesión reporta el token como ausente y el host vuelve a pedir inicio de sesión en la siguiente navegación protegida

#### Scenario: Autoridad alternativa
- **WHEN** el entorno declara una autoridad distinta de la nube y la marca como conocida
- **THEN** el inicio de sesión, el regreso y la renovación silenciosa se hacen contra esa autoridad, y los roles y datos de la persona se derivan igual que contra la nube

#### Scenario: Configuración ausente
- **WHEN** el host arranca sin el identificador de aplicación o de inquilino
- **THEN** muestra un error que nombra la variable que falta, sin intentar redirigir al proveedor

## REMOVED Requirements

### Requirement: Simulador de sesión sólo en desarrollo
**Reason**: El emulador de identidad local (ver `dev-identity-emulator`) reemplaza al simulador con el flujo real de MSAL, roles reales en el token y personas de prueba por rol; mantener dos vías de sesión en desarrollo duplicaba código y probaba un camino que no existe en producción.
**Migration**: Levantar el emulador, ejecutar la herramienta de semilla del host y configurar `.env.development.local` con los valores que imprime; `pnpm dev` inicia sesión contra el emulador. Los tests del host siguen usando el puerto de sesión falso, que no dependía del simulador.
