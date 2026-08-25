## Purpose

Provee la estructura de navegación y layout (sidebar, topbar, páginas placeholder) para el rol Admin de plataforma, como base visual sobre la que se construirán las pantallas de negocio de administración en changes posteriores.

## ADDED Requirements

### Requirement: Navegación lateral del rol Admin
El sistema SHALL mostrar una navegación lateral con exactamente estas 4 entradas, en este orden y agrupación, replicando `NAV.admin` del mockup de referencia:
- Inicio · Estado de la plataforma
- Grupo "Configuración": Calendario de sprints, Parámetros del modelo
- Grupo "Integración DevOps": Conexión y job de ingesta

#### Scenario: Entrar al esqueleto de Admin
- **WHEN** el usuario navega a cualquier ruta bajo `/app/admin`
- **THEN** la navegación lateral muestra las 4 entradas agrupadas como arriba

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las 4 rutas de Admin
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa y las otras 3 no

### Requirement: Navegación entre pantallas de Admin
El sistema SHALL permitir navegar entre las 4 pantallas de Admin haciendo clic en cada entrada de la navegación lateral, sin recargar la aplicación completa.

#### Scenario: Cambiar de pantalla
- **WHEN** el usuario hace clic en una entrada de navegación distinta a la actual
- **THEN** el contenido principal cambia a la pantalla correspondiente y el breadcrumb del topbar refleja el nuevo título

### Requirement: Pantallas placeholder de Admin
El sistema SHALL renderizar, para cada una de las 4 rutas de Admin, únicamente la estructura de secciones (cards y grids) del mockup correspondiente, con datos de ejemplo o marcadores de posición — sin llamadas a backend ni datos reales. El sistema SHALL NOT duplicar en el contenido de la página el título ni la categoría de la pantalla, dado que la entrada activa de la navegación lateral y el breadcrumb del topbar ya identifican la pantalla y sección actuales.

#### Scenario: Ver el esqueleto de "Estado de la plataforma"
- **WHEN** el usuario navega a la pantalla de inicio de Admin
- **THEN** se muestran las secciones de configuración vigente e información de autenticación/autorización, con contenido de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Calendario de sprints"
- **WHEN** el usuario navega a la pantalla de Calendario de sprints
- **THEN** se muestra la estructura de formulario de parámetros del sprint, sin persistir ni cargar datos reales, y sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Parámetros del modelo"
- **WHEN** el usuario navega a la pantalla de Parámetros del modelo
- **THEN** se muestra la estructura de tablas (bandas de talla, mix de capacidades, pool de preguntas, versionado), con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

#### Scenario: Ver el esqueleto de "Conexión y job de ingesta"
- **WHEN** el usuario navega a la pantalla de Conexión y job de ingesta
- **THEN** se muestra la estructura de pipeline y tarjetas de conexión, con datos de marcador de posición, sin título ni descripción de página adicionales a los ya visibles en la navegación y el breadcrumb

### Requirement: Acceso sin autenticación al esqueleto de Admin
El sistema SHALL permitir acceder a las 4 rutas del esqueleto de Admin sin requerir sesión autenticada, dado que la plataforma aún no tiene cuentas de usuario ni autenticación real.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a una ruta bajo `/app/admin`
- **THEN** la pantalla se muestra normalmente, sin redirigir a una pantalla de login
