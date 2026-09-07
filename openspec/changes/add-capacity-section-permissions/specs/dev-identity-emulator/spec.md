## MODIFIED Requirements

### Requirement: Directorio de prueba de la plataforma reproducible
La plataforma SHALL contar con una herramienta que, contra la API de administración del emulador, cree o reutilice la app registration del host (cliente público con su URI de retorno local), sus app roles de negocio (`Plataforma.Admin`, `Plataforma.ChapterLead`, `Plataforma.TechLead`), y personas de prueba con sus asignaciones: una administradora, una líder de expertise, una líder técnica y una persona sin rol. La herramienta SHALL además crear o reutilizar la app registration de la **API de Gestión de Capacidad** (recurso con identifier URI y un scope delegado) con un app role de usuario por sección del módulo — `Capacidad.Iniciativas`, `Capacidad.Celulas`, `Capacidad.Personas`, `Capacidad.Ausencias`, `Capacidad.Dedicacion`, `Capacidad.Prefacturacion`, `Capacidad.Competencias`, `Capacidad.Sprints`, `Capacidad.Parametros`, `Capacidad.Habilidades`, `Capacidad.Lineas`, `Capacidad.DevOps` — y asignarlos: todos a la administradora; a la líder de expertise las secciones de su shell (Iniciativas, Células, Personas, Ausencias, Dedicación, Prefacturación, Competencias); a la líder técnica Iniciativas, Células, Dedicación y Competencias; ninguno a la persona sin rol. La herramienta SHALL ser idempotente — ejecutarla de nuevo no duplica nada — y SHALL imprimir los valores de configuración que el host necesita, incluido el scope de la API del módulo, sin escribir archivos versionados.

#### Scenario: Primera ejecución
- **WHEN** se ejecuta la herramienta contra un emulador recién sembrado
- **THEN** existen la app del host, la app de la API de Gestión de Capacidad con sus 12 sub-roles, las cuatro personas y todas sus asignaciones, y la salida muestra el identificador de la app del host, el inquilino, la autoridad y el scope de la API del módulo

#### Scenario: Segunda ejecución
- **WHEN** se vuelve a ejecutar la herramienta sin cambios
- **THEN** termina sin error y el número de apps, roles, personas y asignaciones es el mismo que antes

#### Scenario: Ejecución sobre un directorio ya sembrado sin la API del módulo
- **WHEN** el directorio ya tiene la app del host y las personas pero no la app de la API de Gestión de Capacidad
- **THEN** la herramienta crea sólo lo que falta — la app de la API, sus sub-roles y sus asignaciones — sin duplicar lo existente

#### Scenario: Token de la persona frente a la API del módulo
- **WHEN** la líder técnica obtiene un access token dirigido a la API de Gestión de Capacidad
- **THEN** el claim `roles` de ese token trae exactamente `Capacidad.Celulas`, `Capacidad.Competencias`, `Capacidad.Dedicacion` y `Capacidad.Iniciativas`, y su ID token del host sigue trayendo sólo `Plataforma.TechLead`

#### Scenario: Emulador apagado
- **WHEN** el emulador no responde en la URL configurada
- **THEN** la herramienta termina con un error que nombra la URL y cómo levantar el emulador
