## Purpose

Define el host de la plataforma: la barra superior común, la entrada a los módulos según el rol de la persona, la sesión con el proveedor de identidad corporativo (Entra ID) y el contrato con el que esa sesión se entrega a los módulos que se monten debajo.

## Requirements

### Requirement: Barra superior común de la plataforma
El host SHALL mostrar, en toda pantalla, una única barra superior con la marca de la plataforma a la izquierda, el selector de módulos como panel de esa marca, y a la derecha los enlaces de utilidad y la cuenta de la persona. La cuenta SHALL mostrar el nombre y el rol de la persona y ofrecer, como mínimo y como última acción, "Cerrar sesión". La barra NO SHALL mostrar campana de notificaciones, caja de búsqueda, botón de menú ni navegación lateral: la navegación de secciones pertenece a cada módulo, y las notificaciones se incorporarán cuando exista un servicio de plataforma que las provea.

#### Scenario: La barra acompaña todas las pantallas
- **WHEN** la persona está en el portal, dentro de un módulo o en una pantalla de aviso del host
- **THEN** la misma barra superior se muestra arriba, con la marca, el selector de módulos y su cuenta

#### Scenario: Sin campana ni búsqueda
- **WHEN** se renderiza la barra del host
- **THEN** no aparece ningún botón de notificaciones ni caja de búsqueda, y las zonas restantes conservan su orden y funcionamiento

#### Scenario: Cerrar sesión desde la cuenta
- **WHEN** la persona abre el panel de su cuenta y elige "Cerrar sesión"
- **THEN** la sesión termina y el host vuelve a pedir inicio de sesión

### Requirement: Selector y portal de módulos según rol
El host SHALL mantener un registro de módulos — identificador, nombre, descripción, color, ruta base y roles admitidos — y SHALL ofrecer sólo los módulos cuyos roles la persona tiene, tanto en el selector de la barra como en el portal de la raíz. Un módulo sin roles declarados SHALL estar disponible para cualquier persona con sesión. Entrar a un módulo SHALL navegar a su ruta base sin recargar la aplicación, y el selector SHALL señalar cuál módulo es el actual mientras la persona está dentro de él.

#### Scenario: El portal muestra los módulos permitidos
- **WHEN** una persona con sesión abre la raíz del host
- **THEN** ve una tarjeta por cada módulo cuyos roles tiene, y ninguna de los que no

#### Scenario: Entrar a un módulo
- **WHEN** la persona activa un módulo desde el portal o desde el selector de la barra
- **THEN** el host navega a la ruta base de ese módulo sin recargar, y el selector lo marca como el módulo actual

#### Scenario: Módulo todavía no integrado
- **WHEN** la persona entra a un módulo cuyo contenido aún no está integrado al host
- **THEN** la ruta del módulo muestra, bajo la barra, un aviso de que el módulo está pendiente de integrar, con su nombre, en vez de una pantalla vacía o un error

#### Scenario: Sin módulos para ese rol
- **WHEN** la persona tiene sesión pero ningún módulo admite alguno de sus roles
- **THEN** el portal lo dice explícitamente, sin mostrar tarjetas ni fallar

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

### Requirement: Contrato de sesión hacia los módulos
El host SHALL exponer su sesión a los módulos mediante una fuente con dos operaciones: obtener la sesión actual y suscribirse a sus cambios. La sesión obtenida SHALL ser la misma referencia mientras no cambie, y cada cambio — inicio, cierre, renovación de token, cambio de perfil — SHALL notificar a los suscriptores. Junto con la sesión, el host SHALL poder entregar a un módulo la ruta base bajo la que está montado. Un módulo NO SHALL necesitar conocer cómo el host obtuvo la sesión.

#### Scenario: Referencia estable
- **WHEN** un módulo pide la sesión varias veces sin que haya cambiado
- **THEN** recibe exactamente el mismo objeto cada vez, de modo que pueda leerla como un store externo sin re-renderizar en bucle

#### Scenario: Notificación de cambio
- **WHEN** la persona cierra sesión, cambia de perfil en el simulador o su token se renueva
- **THEN** cada suscriptor recibe un aviso y la siguiente lectura devuelve la sesión nueva

#### Scenario: Token para un conjunto de scopes
- **WHEN** un módulo necesita un token de acceso para scopes distintos de los del host
- **THEN** puede pedírselo al host, que lo obtiene del proveedor en silencio o devuelve ausencia si no es posible, sin exponer credenciales

### Requirement: Acceso protegido por sesión y rol
Toda ruta del host salvo la de inicio de sesión SHALL exigir sesión. La ruta de un módulo SHALL exigir además alguno de los roles que ese módulo declara. Una persona sin sesión SHALL ser llevada a iniciar sesión; una con sesión pero sin el rol SHALL recibir un aviso de permisos insuficientes bajo la barra, sin ser enviada a iniciar sesión de nuevo.

#### Scenario: Ruta de módulo sin el rol
- **WHEN** una persona con sesión navega directamente a la ruta de un módulo cuyos roles no tiene
- **THEN** ve el aviso de permisos insuficientes con la barra arriba, y el selector de módulos sigue ofreciéndole sólo los que sí puede abrir

#### Scenario: Ruta inexistente
- **WHEN** una persona con sesión navega a una ruta que no corresponde a ningún módulo ni pantalla del host
- **THEN** ve un aviso de que la ruta no existe con la barra arriba y una vía para volver al portal
