## Purpose

Define cómo se compone la vista de listado de iniciativas del chapter lead: qué bloques la forman y en qué orden, dónde vive la acción de crear, cómo se mantiene el encabezado accesible sin ocupar espacio visible, qué dicen los pies de las cards de resumen y con qué única medida se separan sus piezas.

## ADDED Requirements

### Requirement: La vista abre con el resumen, sin encabezado de módulo visible
La vista de listado de iniciativas NO SHALL mostrar un título de módulo ni una descripción visibles: el nombre de la pantalla ya lo da el breadcrumb del shell ("Gestionar Iniciativas"). Con iniciativas registradas, el primer bloque visible del contenido SHALL ser el resumen (las tres cards), seguido inmediatamente del listado.

#### Scenario: Primer pantallazo con iniciativas
- **WHEN** el usuario entra a `/app/lead/iniciativas` y hay iniciativas registradas
- **THEN** no se muestra ningún texto "Iniciativas" ni "Las solicitudes del negocio y la capacidad que requieren…" como encabezado de la vista
- **AND** las tres cards de resumen son el primer bloque visible del contenido, y el listado va inmediatamente después

#### Scenario: Sin iniciativas registradas
- **WHEN** no hay ninguna iniciativa registrada
- **THEN** tampoco se muestra título ni descripción de módulo, y el estado vacío del listado conserva su propio botón "Nueva iniciativa"

### Requirement: La página conserva un único encabezado de nivel 1 accesible
La página SHALL exponer exactamente un encabezado de nivel 1 con el texto "Gestionar Iniciativas", disponible para tecnologías de asistencia pero no visible en pantalla.

#### Scenario: Navegación por encabezados con lector de pantalla
- **WHEN** un lector de pantalla enumera los encabezados de `/app/lead/iniciativas`
- **THEN** encuentra un único encabezado de nivel 1, con el texto "Gestionar Iniciativas"
- **AND** ese encabezado no ocupa espacio visible en la vista

### Requirement: La acción de crear vive en la franja del breadcrumb
Mientras la vista de iniciativas está montada dentro del shell, SHALL publicar en la franja del breadcrumb la acción primaria "Nueva iniciativa". El botón SHALL mostrarse a la derecha de la franja, a la altura del breadcrumb y con el mismo tamaño que las acciones publicadas por las otras vistas de listado del chapter lead, y SHALL estar disponible en todos los estados de la vista (cargando, con error, con iniciativas y sin iniciativas).

#### Scenario: Crear desde la franja del breadcrumb
- **WHEN** el usuario está en `/app/lead/iniciativas`
- **THEN** el botón "Nueva iniciativa" aparece en la franja del breadcrumb, a la derecha, y no dentro del contenido de la vista
- **AND** al pulsarlo se abre el formulario de alta de iniciativa

#### Scenario: Acción disponible durante la carga o el error
- **WHEN** el listado está cargando o muestra un error de carga
- **THEN** el botón "Nueva iniciativa" sigue presente en la franja del breadcrumb

#### Scenario: Sin iniciativas
- **WHEN** no hay ninguna iniciativa registrada
- **THEN** se muestra el estado vacío del listado con su propio botón "Nueva iniciativa", además del de la franja
- **AND** cualquiera de los dos abre el mismo formulario de alta

#### Scenario: Salir de la vista
- **WHEN** el usuario navega a otro módulo
- **THEN** el botón "Nueva iniciativa" deja de mostrarse en la franja del breadcrumb

### Requirement: Los pies de las cards de resumen llevan datos, no explicaciones
Las cards "FTE DEMANDADO" y "SIN EVALUAR" NO SHALL mostrar al pie prosa que explique qué mide la cifra ni por qué ("FTE esperado que suman las iniciativas activas.", "Sin talla no entran a la demanda."). Cada una SHALL usar la misma anatomía que la card de activas: rótulo arriba, la cifra sola, y al pie una referencia con datos. La de FTE demandado SHALL llevar al pie la unidad con el conteo de iniciativas activas; la de sin evaluar SHALL llevar al pie la relación con el total de iniciativas.

#### Scenario: Pie de FTE demandado
- **WHEN** hay 4 iniciativas activas que suman 2,89 FTE esperado
- **THEN** la card muestra "2,89" como cifra sola y al pie "FTE de 4 activas"
- **AND** no muestra ninguna frase que empiece por "FTE esperado que suman"

#### Scenario: Pie de sin evaluar
- **WHEN** hay 7 iniciativas y 2 sin talla
- **THEN** la card muestra "2" como cifra y al pie "de 7 iniciativas"
- **AND** no muestra ninguna frase sobre la demanda

#### Scenario: Singular
- **WHEN** hay exactamente 1 iniciativa activa o exactamente 1 iniciativa en total
- **THEN** los pies concuerdan en número ("FTE de 1 activa", "de 1 iniciativa")

### Requirement: La vista usa una única medida de separación
Toda la separación entre piezas de la vista de listado de iniciativas SHALL ser de 12px (`gap-3`): tanto la vertical entre los bloques del contenido (resumen y listado) —que hoy es de 24px (`gap-6`)— como la que hay entre las cards del resumen —que hoy es de 16px (`gap-4`)—. La pantalla no SHALL mezclar dos medidas distintas de separación, y la medida SHALL ser la misma que usan las vistas de ausencias y de células.

#### Scenario: Separación entre resumen y listado
- **WHEN** la vista muestra las cards de resumen y el listado
- **THEN** la separación vertical entre ambos bloques es de 12px

#### Scenario: Separación entre las cards del resumen
- **WHEN** la vista muestra las tres cards de resumen
- **THEN** la separación entre ellas es de 12px, la misma que separa el resumen del listado

#### Scenario: Misma medida que ausencias y células
- **WHEN** el usuario pasa de `/app/lead/iniciativas` a `/app/lead/ausencias` o a `/app/lead/celulas`
- **THEN** la separación entre bloques y entre cards es la misma en las tres vistas
