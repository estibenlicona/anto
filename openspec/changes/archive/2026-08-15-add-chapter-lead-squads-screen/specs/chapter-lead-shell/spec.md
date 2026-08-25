## Purpose

Provee la estructura de navegación y layout (sidebar, topbar, breadcrumb) para el rol Chapter Lead, como base sobre la que se construyen sus pantallas de negocio, empezando por Gestionar Células.

## ADDED Requirements

### Requirement: Navegación lateral del rol Chapter Lead
El sistema SHALL mostrar una navegación lateral con las entradas construidas hasta el momento para este rol, en este orden y agrupación, replicando el subconjunto correspondiente de `NAV.lead` del mockup de referencia:
- Inicio · Torre de control
- Grupo "Gestión de Capacidad": Gestionar Células

El sistema SHALL NOT mostrar entradas de navegación para pantallas de Chapter Lead que todavía no existen.

#### Scenario: Entrar al shell de Chapter Lead
- **WHEN** el usuario navega a cualquier ruta bajo `/app/lead`
- **THEN** la navegación lateral muestra las entradas listadas arriba

#### Scenario: Resaltar la entrada activa
- **WHEN** el usuario está en una de las rutas de Chapter Lead
- **THEN** la entrada de navegación correspondiente a esa ruta se muestra visualmente marcada como activa

### Requirement: Navegación entre pantallas de Chapter Lead
El sistema SHALL permitir navegar entre las pantallas de Chapter Lead haciendo clic en cada entrada de la navegación lateral, sin recargar la aplicación completa, y SHALL reflejar la pantalla activa en el breadcrumb del topbar.

#### Scenario: Cambiar de pantalla
- **WHEN** el usuario hace clic en una entrada de navegación distinta a la actual
- **THEN** el contenido principal cambia a la pantalla correspondiente y el breadcrumb del topbar refleja el nuevo título

### Requirement: Pantalla de inicio placeholder
El sistema SHALL renderizar, en la ruta índice de Chapter Lead, una pantalla placeholder mínima — no la Torre de control completa del mockup (KPIs, tarjetas de células, alertas), que queda fuera de alcance.

#### Scenario: Ver la pantalla de inicio
- **WHEN** el usuario navega a la raíz de `/app/lead`
- **THEN** se muestra una pantalla placeholder identificando el rol Chapter Lead, sin datos ni funcionalidad de negocio

### Requirement: Acceso sin autenticación al shell de Chapter Lead
El sistema SHALL permitir acceder a las rutas del shell de Chapter Lead sin requerir sesión autenticada, dado que la plataforma aún no tiene cuentas de usuario ni autenticación real.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a una ruta bajo `/app/lead`
- **THEN** la pantalla se muestra normalmente, sin redirigir a una pantalla de login
