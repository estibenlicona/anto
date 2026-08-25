## MODIFIED Requirements

### Requirement: Navegación lateral del rol Admin
El sistema SHALL mostrar una navegación lateral con exactamente estas 6 entradas, en este orden y agrupación, tomando de `NAV.admin` del mockup de referencia su estructura y su orden pero no su redacción:
- Inicio
- Grupo "Configuración": Sprints, Parámetros, Habilidades, Líneas
- Grupo "DevOps": Ingesta

Cada etiqueta SHALL ser el término más corto que distingue su pantalla de las demás del menú, dado que la navegación se recorre buscando dónde ir y no se lee. El nombre completo de la pantalla SHALL seguir estando en el breadcrumb y en el encabezado de la pantalla, que no forman parte del menú. La entrada "Líneas" SHALL nombrar en el breadcrumb la pantalla completa, "Líneas de expertise", porque el término corto por sí solo no dice de qué líneas se habla.

#### Scenario: Entrar al esqueleto de Admin
- **WHEN** el usuario navega a cualquier ruta bajo `/app/admin`
- **THEN** la navegación lateral muestra las 6 entradas agrupadas como arriba

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las rutas de Admin
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa y las otras no

#### Scenario: El nombre completo no se pierde
- **WHEN** el usuario está en una pantalla cuya entrada de menú es un término corto
- **THEN** el breadcrumb sigue mostrando el nombre completo de esa pantalla, de modo que acortar el menú no deja al usuario sin saber dónde está

#### Scenario: Ir a Líneas de expertise
- **WHEN** el usuario hace clic en la entrada "Líneas" del grupo "Configuración"
- **THEN** el sistema navega a `/app/admin/lineas` sin recargar la aplicación y el breadcrumb muestra "Líneas de expertise"
