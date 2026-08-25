## ADDED Requirements

### Requirement: Gestión del equipo desde el detalle de la célula
El sistema SHALL ofrecer la gestión de las asignaciones de una célula (listar, asignar, editar, quitar) dentro de la página de detalle de esa célula, en su sección "Equipo", sin requerir que el usuario elija la célula en un selector: la célula es la de la página. La acción "Asignar persona" del encabezado del detalle SHALL abrir el mismo formulario de alta de asignación.

#### Scenario: Gestionar el equipo desde el detalle
- **WHEN** el Chapter Lead abre el detalle de una célula
- **THEN** la sección Equipo muestra las asignaciones vigentes de esa célula con sus acciones, sin selector de célula

#### Scenario: Asignar desde el encabezado
- **WHEN** el Chapter Lead pulsa "Asignar persona" en el encabezado del detalle y confirma una asignación válida
- **THEN** el sistema crea la asignación en esa célula, la agrega a la sección Equipo y actualiza el resumen del equipo

#### Scenario: Ruta antigua de Capacidades
- **WHEN** el usuario navega a la antigua ruta de Capacidades con el identificador de una célula en la URL
- **THEN** el sistema redirige al detalle de esa célula; sin identificador, redirige al listado de Células

## MODIFIED Requirements

### Requirement: Listar las asignaciones de una célula
El sistema SHALL mostrar, para la célula del detalle, un listado paginado de sus asignaciones vigentes, con por fila: la persona (avatar con las mismas iniciales y color que en Personas, nombre, y debajo cargo y modalidad con menor jerarquía), su seniority (con el componente de nivel del sistema de diseño, igual que el listado de Personas), su % de dedicación en esta célula (barra pequeña y porcentaje), su desglose BAU/Transformación (barra segmentada pequeña y porcentajes) y cuánto le queda disponible a la persona contando todas sus células (porcentaje libre; cuando es 0 y tiene dedicación en otras células, SHALL indicarlo), y SHALL exponer por fila un menú de acciones que permite editar o quitar esa asignación.

El sistema SHALL permitir buscar asignaciones por nombre o cargo de la persona (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinables con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** la célula del detalle tiene asignaciones vigentes
- **THEN** el sistema muestra una página de resultados con una fila por cada asignación de esa página, con persona, seniority, % de dedicación, desglose BAU/Transformación y disponibilidad de la persona, junto con el total de asignaciones y la navegación entre páginas

#### Scenario: Disponibilidad de la persona
- **WHEN** una persona tiene 80% en esta célula y ninguna otra asignación
- **THEN** la fila muestra "20% libre"

#### Scenario: Persona al tope por otras células
- **WHEN** una persona tiene 40% en esta célula y 60% en otras
- **THEN** la fila muestra 0% libre e indica que el resto está en otras células

#### Scenario: Buscar en el equipo
- **WHEN** el Chapter Lead escribe un texto en el buscador de la sección Equipo
- **THEN** el sistema muestra sólo las asignaciones cuya persona tiene ese texto en el nombre o el cargo, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Filtrar por seniority
- **WHEN** el Chapter Lead selecciona uno o más niveles de seniority
- **THEN** el sistema muestra sólo las asignaciones de personas con alguno de esos niveles, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Sin resultados para la búsqueda o el filtro
- **WHEN** la búsqueda o el filtro activos no coinciden con ninguna asignación
- **THEN** el sistema muestra un estado vacío de "sin resultados", distinto del estado vacío de "todavía no hay equipo", manteniendo visibles el buscador y el filtro

#### Scenario: Listado vacío
- **WHEN** la célula del detalle no tiene ninguna asignación vigente
- **THEN** el sistema muestra un estado vacío que invita a asignar la primera persona, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las asignaciones de la célula falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de asignaciones
- **THEN** el sistema muestra las asignaciones correspondientes a esa página, conservando búsqueda y filtro, sin recargar toda la aplicación

#### Scenario: Menú de acciones por fila
- **WHEN** el Chapter Lead abre el menú de acciones de una fila del listado
- **THEN** el sistema muestra las opciones para editar o quitar esa asignación

## REMOVED Requirements

### Requirement: Elegir una célula para administrar su equipo
**Reason**: La pantalla Capacidades con selector de célula desaparece; la gestión del equipo vive en el detalle de cada célula, a la que se llega desde el listado.
**Migration**: Entrar al detalle de la célula desde el listado de Células. La antigua ruta `/app/lead/capacidades?celula=<id>` redirige al detalle; sin id redirige al listado.

### Requirement: Acceso sin autenticación a la pantalla de Capacidades
**Reason**: La pantalla Capacidades ya no existe. El detalle de célula hereda la regla de acceso sin autenticación del shell de Chapter Lead.
**Migration**: Ninguna; la ruta redirige.
