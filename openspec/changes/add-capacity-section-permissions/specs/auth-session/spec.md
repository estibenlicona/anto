## ADDED Requirements

### Requirement: Permisos de sección del módulo en la sesión
La sesión SHALL exponer los permisos de sección del módulo de Gestión de Capacidad como un conjunto derivado de sub-claims: los valores con prefijo `Capacidad.` del claim `roles` del token dirigido a la API del módulo. Un valor desconocido SHALL ignorarse sin fallar. En modo simulado, cada perfil SHALL declarar sus permisos y la sesión SHALL exponerlos por la misma vía que usará la sesión real, de modo que las pantallas no distingan el origen. La sesión SHALL ofrecer un predicado para consultar si un permiso está presente, análogo al de roles.

#### Scenario: Permisos desde los sub-claims
- **WHEN** el token del módulo trae `roles: ["Capacidad.Celulas", "Capacidad.Dedicacion"]`
- **THEN** la sesión expone exactamente los permisos Células y Dedicación, y el predicado responde que Personas no está

#### Scenario: Claim desconocido
- **WHEN** el token del módulo trae un valor que no corresponde a ninguna sección conocida
- **THEN** ese valor se ignora y los demás permisos se derivan con normalidad

#### Scenario: Perfil simulado con permisos parciales
- **WHEN** se elige un perfil del simulador que declara sólo algunos permisos de sección
- **THEN** la sesión expone exactamente esos permisos y las pantallas reaccionan igual que si hubieran llegado en un token real

## MODIFIED Requirements

### Requirement: Rutas protegidas por sesión y por rol
El sistema SHALL impedir el acceso a las pantallas de negocio cuando no hay sesión, redirigiendo a la pantalla de inicio de sesión. El sistema SHALL además permitir exigir uno o más roles para una ruta, y también un permiso de sección del módulo, y SHALL distinguir "no hay sesión" de "hay sesión pero sin el rol o el permiso necesario".

#### Scenario: Acceso sin sesión
- **WHEN** un usuario sin sesión navega a una pantalla protegida
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceso con sesión y rol suficiente
- **WHEN** un usuario con sesión y con el rol exigido navega a una pantalla protegida
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceso con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin el rol exigido navega a una pantalla protegida
- **THEN** el sistema le indica que no tiene permisos, de forma distinguible de la ausencia de sesión, y no lo manda a iniciar sesión — ya lo hizo

#### Scenario: Acceso con rol pero sin el permiso de la sección
- **WHEN** un usuario con sesión y con el rol del shell navega a la ruta de una sección cuyo permiso no tiene
- **THEN** el sistema le indica que no tiene permisos para esa sección, sin mandarlo a iniciar sesión

### Requirement: Navegación según permisos
El sistema SHALL mostrar en la navegación únicamente las entradas que el usuario de la sesión puede usar — por rol y por permiso de sección del módulo — de modo que no se le ofrezcan pantallas a las que el guard le negaría el acceso. Un grupo cuyas entradas quedaron todas ocultas SHALL desaparecer del menú.

#### Scenario: Entradas visibles según rol
- **WHEN** el usuario de la sesión no tiene el rol que una pantalla exige
- **THEN** la entrada de navegación hacia esa pantalla no se le muestra

#### Scenario: Entradas visibles según permiso de sección
- **WHEN** el usuario de la sesión no tiene el permiso de sección que una entrada declara
- **THEN** esa entrada no se le muestra, y las entradas cuyas secciones sí tiene permanecen

#### Scenario: Grupo vacío
- **WHEN** todas las entradas de un grupo del menú exigen permisos que el usuario no tiene
- **THEN** el grupo entero desaparece del menú
