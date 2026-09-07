## REMOVED Requirements

### Requirement: Navegación lateral del rol Admin
**Reason**: El esqueleto de Admin deja de tener navegación propia: sus entradas (Sprints, Parámetros, Habilidades, Líneas, Ingesta) pasan al sidebar único del módulo de Gestión de Capacidad, filtradas por los mismos permisos de sección (ver `capacity-module` — Shell interno único por permisos).
**Migration**: Las secciones viven en la navegación del módulo bajo los grupos "Configuración" y "DevOps", con rutas `/capacidad/<sección>`; las etiquetas cortas y los nombres completos del breadcrumb se conservan.

### Requirement: Navegación entre pantallas de Admin
**Reason**: La navegación entre pantallas es del shell único del módulo, no de un esqueleto propio de Admin.
**Migration**: Cubierta por el shell del módulo (`capacity-module`): clic en una entrada navega sin recargar y el breadcrumb del contenido refleja la pantalla.

### Requirement: Acceso autenticado al esqueleto de Admin
**Reason**: La sesión la garantiza el host antes de montar el módulo, y el acceso a cada pantalla lo decide su permiso de sección (`Capacidad.Sprints`, `Capacidad.Parametros`, `Capacidad.Habilidades`, `Capacidad.Lineas`, `Capacidad.DevOps`), no un rol de shell. No queda un "esqueleto de Admin" que proteger.
**Migration**: Guards por permiso de sección en las rutas del módulo (requisito "Rutas protegidas por sesión y por rol" de `auth-session` y "Shell interno único por permisos" de `capacity-module`).
