## Purpose

Define cómo se compone la vista de listado de células del chapter lead: qué bloques la forman, en qué orden aparecen, dónde vive la acción de crear una célula y cómo se mantiene el encabezado accesible sin ocupar espacio visible.

## ADDED Requirements

### Requirement: La vista abre con el resumen, sin encabezado de módulo visible
La vista de listado de células NO SHALL mostrar un título de módulo ni una descripción visibles: el nombre de la pantalla ya lo da el breadcrumb del shell ("Gestionar Células"). El primer bloque visible del contenido SHALL ser el resumen (cards de estadísticas), seguido del listado.

#### Scenario: Primer pantallazo con células cargadas
- **WHEN** el usuario entra a `/app/lead/celulas` y existen células
- **THEN** no se muestra ningún texto "Células" ni "Las células del chapter…" como encabezado de la vista
- **AND** las cards de resumen son el primer bloque visible del contenido, y el listado va inmediatamente después

### Requirement: La página conserva un encabezado de nivel 1 accesible
La página SHALL exponer exactamente un encabezado de nivel 1 con el texto "Gestionar Células", disponible para tecnologías de asistencia pero no visible en pantalla.

#### Scenario: Navegación por encabezados con lector de pantalla
- **WHEN** un lector de pantalla enumera los encabezados de `/app/lead/celulas`
- **THEN** encuentra un único encabezado de nivel 1 con el texto "Gestionar Células"
- **AND** ese encabezado no ocupa espacio visible en la vista

### Requirement: La acción "Nueva célula" vive en la franja del breadcrumb
Mientras la vista de listado de células está montada dentro del shell, SHALL publicar la acción primaria "Nueva célula" en la franja del breadcrumb, donde se muestra a la derecha y a la altura del breadcrumb. La acción SHALL estar disponible en todos los estados del listado (cargando, con error, con resultados, sin resultados, vacío inicial).

#### Scenario: Crear desde la franja del breadcrumb
- **WHEN** el usuario está en `/app/lead/celulas`
- **THEN** el botón "Nueva célula" aparece en la franja del breadcrumb, a la derecha
- **AND** al pulsarlo se abre el formulario de creación de célula

#### Scenario: Acción disponible durante la carga o el error
- **WHEN** el listado está cargando o muestra un error de carga
- **THEN** el botón "Nueva célula" sigue presente en la franja del breadcrumb

#### Scenario: Estado vacío inicial
- **WHEN** no hay ninguna célula y no hay búsqueda ni filtro activos
- **THEN** se muestra el estado vacío "Todavía no hay células" con su propio botón "Nueva célula", además del de la franja (como hoy con el encabezado)
- **AND** cualquiera de los dos abre el mismo formulario de creación

#### Scenario: Salir de la vista
- **WHEN** el usuario navega al detalle de una célula o a otro módulo
- **THEN** el botón "Nueva célula" deja de mostrarse en la franja del breadcrumb

### Requirement: La vista usa un espaciado vertical compacto
El espacio vertical entre los bloques del contenido (resumen y listado) SHALL ser de 8px (`gap-2`), no de 24px (`gap-6`), de modo que entren más filas del listado en el primer pantallazo.

#### Scenario: Separación entre resumen y listado
- **WHEN** la vista muestra las cards de resumen y el listado
- **THEN** la separación vertical entre ambos bloques es de 8px
