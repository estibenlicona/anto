# backlog-triage-view Specification

## Purpose

Define cómo se compone la vista de clasificación del backlog del chapter lead: qué bloques la forman, en qué orden aparecen, dónde vive el resumen del día, cómo se mantiene el encabezado accesible sin ocupar espacio visible y qué medida única de separación usa.

## Requirements

### Requirement: La vista abre con la cola y la historia en curso, sin encabezado de módulo visible
La vista de backlog NO SHALL mostrar un título de módulo ni una descripción visibles: el nombre de la pantalla ya lo da el breadcrumb del shell ("Gestionar Backlog"). Con el backlog cargado, el primer bloque visible del contenido SHALL ser el par formado por la cola de historias y el panel de la historia en curso (o, en la vista de clasificadas, la cola sola).

#### Scenario: Primer pantallazo con historias pendientes
- **WHEN** el usuario entra a `/app/lead/backlog` y hay historias por clasificar
- **THEN** no se muestra ningún texto "Backlog" ni "Una historia a la vez…" como encabezado de la vista
- **AND** la cola de historias y el panel de la historia en curso son el primer bloque visible del contenido

#### Scenario: Error de carga
- **WHEN** la carga del backlog falla
- **THEN** la alerta de error con su acción de reintentar es el primer bloque visible del contenido, sin ningún encabezado de módulo encima

### Requirement: La página conserva un único encabezado de nivel 1 accesible
La página SHALL exponer exactamente un encabezado de nivel 1 con el texto "Gestionar Backlog", disponible para tecnologías de asistencia pero no visible en pantalla.

#### Scenario: Navegación por encabezados con lector de pantalla
- **WHEN** un lector de pantalla enumera los encabezados de `/app/lead/backlog`
- **THEN** encuentra un único encabezado de nivel 1, con el texto "Gestionar Backlog"
- **AND** ese encabezado no ocupa espacio visible en la vista

### Requirement: El resumen del día vive en la franja del breadcrumb
Mientras la vista de backlog está montada dentro del shell y tiene el resumen cargado, SHALL publicar en la franja del breadcrumb el texto "N clasificadas hoy · quedan M de T", donde N es lo clasificado hoy, M lo pendiente y T la suma de ambos, seguido a su derecha de una barra de progreso estrecha que representa el porcentaje del día clasificado. Texto y barra SHALL mostrarse en una sola línea, a la derecha de la franja y a la altura del breadcrumb, con las cifras destacadas respecto al resto del texto, y SHALL reflejar cada clasificación, salto, rechazo o deshacer sin recargar la página.

#### Scenario: Resumen visible en la franja
- **WHEN** el usuario está en `/app/lead/backlog` con 1 historia clasificada hoy y 9 pendientes
- **THEN** la franja del breadcrumb muestra a la derecha "1 clasificadas hoy · quedan 9 de 10" y, a continuación, la barra de progreso al 10%
- **AND** el breadcrumb sigue mostrándose a la izquierda con sus niveles habituales

#### Scenario: El resumen acompaña a cada decisión
- **WHEN** el usuario clasifica la historia en curso
- **THEN** el texto de la franja pasa a "2 clasificadas hoy · quedan 8 de 10" y la barra al 20%, sin recargar la página

#### Scenario: Primera carga sin resumen
- **WHEN** el backlog está cargando por primera vez y aún no hay resumen
- **THEN** la franja del breadcrumb muestra sólo el breadcrumb, sin texto de resumen
- **AND** el contenido muestra el mensaje de carga

#### Scenario: Salir de la vista
- **WHEN** el usuario navega a otro módulo
- **THEN** el texto de resumen deja de mostrarse en la franja del breadcrumb

### Requirement: La barra de progreso es estrecha y no altera la altura de la franja
La barra de progreso del día SHALL ser estrecha (del orden de 8rem de ancho) y SHALL ir en la misma línea que el texto, de modo que la franja del breadcrumb conserve la altura de una sola línea que tiene en las demás pantallas del shell. La barra SHALL seguir siendo accesible con el nombre "Progreso del día". No SHALL haber ninguna otra barra de progreso en el contenido de la vista.

#### Scenario: Altura de la franja con el resumen publicado
- **WHEN** el backlog está cargado y la franja muestra texto y barra
- **THEN** la franja tiene la misma altura que en células, personas y ausencias
- **AND** la barra queda a la derecha del texto, no debajo

#### Scenario: Barra accesible
- **WHEN** una tecnología de asistencia enumera los elementos de la franja
- **THEN** encuentra una barra de progreso con el nombre "Progreso del día" y el porcentaje del día clasificado

### Requirement: La vista usa una única medida de separación entre bloques
Toda la separación entre bloques de la vista SHALL ser de 12px: tanto la vertical entre los bloques apilados del contenido (alerta de error, mensaje de carga, par cola/panel) —hoy de 20px— como la horizontal entre la cola de historias y el panel de la historia en curso —hoy de 16px—. La pantalla NO SHALL mezclar dos medidas distintas de separación entre bloques. Las medidas internas de cada card (paddings y separaciones dentro de la cola, del panel y de las tarjetas de decisión) quedan fuera de esta regla.

#### Scenario: Separación entre la cola y el panel
- **WHEN** la vista muestra la cola y el panel de la historia en curso lado a lado
- **THEN** la separación horizontal entre ambos es de 12px

#### Scenario: Separación vertical entre bloques
- **WHEN** la vista muestra la alerta de error encima del par cola/panel
- **THEN** la separación vertical entre la alerta y el par es de 12px, la misma que separa la cola del panel
