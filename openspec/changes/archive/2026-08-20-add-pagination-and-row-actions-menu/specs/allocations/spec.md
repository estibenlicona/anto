## MODIFIED Requirements

### Requirement: Listar las asignaciones de una célula
El sistema SHALL mostrar, para la célula elegida, un listado paginado de sus asignaciones vigentes, con al menos el nombre de la persona, su % de dedicación y su desglose BAU/Transformación, y SHALL exponer por fila un menú de acciones que permite editar o quitar esa asignación.

#### Scenario: Listado con datos
- **WHEN** la célula elegida tiene asignaciones vigentes
- **THEN** el sistema muestra una página de resultados con una fila por cada asignación de esa página, con el nombre de la persona, % de dedicación y desglose BAU/Transformación, junto con el total de asignaciones y la navegación entre páginas

#### Scenario: Listado vacío
- **WHEN** la célula elegida no tiene ninguna asignación vigente
- **THEN** el sistema muestra un estado vacío que invita a asignar la primera persona, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las asignaciones de la célula falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de asignaciones
- **THEN** el sistema muestra las asignaciones correspondientes a esa página, sin recargar toda la aplicación

#### Scenario: Menú de acciones por fila
- **WHEN** el Chapter Lead abre el menú de acciones de una fila del listado
- **THEN** el sistema muestra las opciones para editar o quitar esa asignación
