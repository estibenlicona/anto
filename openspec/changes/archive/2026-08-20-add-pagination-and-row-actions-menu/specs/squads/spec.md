## MODIFIED Requirements

### Requirement: Listar células
El sistema SHALL mostrar un listado paginado de las células registradas, con al menos nombre, tribu y criticidad visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa célula.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Células y existen células registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada célula de esa página, su nombre, tribu, criticidad y descripción (si tiene), junto con el total de células y la navegación entre páginas

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Células y no existe ninguna célula registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera célula, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las células falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de células
- **THEN** el sistema muestra las células correspondientes a esa página, sin recargar toda la aplicación

#### Scenario: Menú de acciones por fila
- **WHEN** el Chapter Lead abre el menú de acciones de una fila del listado
- **THEN** el sistema muestra las opciones para editar o eliminar esa célula
