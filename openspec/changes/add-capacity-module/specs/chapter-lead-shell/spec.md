## REMOVED Requirements

### Requirement: Navegación lateral del rol Chapter Lead
**Reason**: El shell del Chapter Lead deja de tener navegación propia: sus entradas (Iniciativas, Células, Personas, Ausencias, Dedicación, Facturación, Competencias) pasan al sidebar único del módulo de Gestión de Capacidad, con los mismos permisos de sección, el mismo criterio de entrada activa en rutas hijas, el badge de Dedicación y las redirecciones de rutas antiguas (ver `capacity-module` — Shell interno único por permisos).
**Migration**: Las secciones viven en la navegación del módulo bajo el grupo "Capacidad" (más "Iniciativas"), con rutas `/capacidad/<sección>`; el badge de Dedicación y los breadcrumbs compuestos se conservan en el shell del módulo, y las rutas antiguas del shell redirigen a las nuevas.

### Requirement: Navegación entre pantallas de Chapter Lead
**Reason**: La navegación entre pantallas es del shell único del módulo.
**Migration**: Cubierta por el shell del módulo (`capacity-module`): clic en una entrada navega sin recargar y el breadcrumb del contenido refleja la pantalla.

### Requirement: Acceso autenticado al shell de Chapter Lead
**Reason**: La sesión la garantiza el host antes de montar el módulo, y el acceso a cada pantalla lo decide su permiso de sección (`Capacidad.Iniciativas`, `Capacidad.Celulas`, `Capacidad.Personas`, `Capacidad.Ausencias`, `Capacidad.Dedicacion`, `Capacidad.Prefacturacion`, `Capacidad.Competencias`). No queda un shell propio que proteger.
**Migration**: Guards por permiso de sección en las rutas del módulo (requisitos de `auth-session` y `capacity-module`).
