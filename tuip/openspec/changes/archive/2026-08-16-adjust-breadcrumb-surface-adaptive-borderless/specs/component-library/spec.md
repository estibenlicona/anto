## MODIFIED Requirements

### Requirement: Opciones del componente Breadcrumb
El componente Breadcrumb SHALL mostrar la ruta de navegación de la página actual, SHALL colapsar los niveles intermedios en un indicador no interactivo cuando la ruta supera tres niveles, conservando siempre visibles el primero y el último, el último nivel no SHALL ser un enlace, y SHALL aceptar una variante `"light" | "dark"` que adapta el color de sus enlaces, nivel actual y separadores a un fondo claro u oscuro, respectivamente. Por defecto usa `"light"`.

#### Scenario: Ruta corta
- **WHEN** Breadcrumb recibe tres niveles o menos
- **THEN** muestra todos los niveles, cada uno enlazado salvo el último

#### Scenario: Ruta larga
- **WHEN** Breadcrumb recibe más de tres niveles
- **THEN** colapsa los niveles intermedios en un indicador no interactivo, conservando visibles el primero y el último

#### Scenario: Último nivel no es un enlace
- **WHEN** se renderiza el último nivel de un Breadcrumb
- **THEN** se muestra como texto, no como un enlace, porque representa la página actual

#### Scenario: Variante clara (por defecto)
- **WHEN** Breadcrumb se usa sin especificar `variant`, o con `variant="light"`
- **THEN** sus enlaces, nivel actual y separadores usan los tokens de color pensados para un fondo claro

#### Scenario: Variante oscura
- **WHEN** Breadcrumb se usa con `variant="dark"`
- **THEN** sus enlaces, nivel actual y separadores usan tokens de color legibles sobre un fondo oscuro
