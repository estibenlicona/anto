# list-table-frame Specification

## Purpose

Define cómo se presentan los listados con búsqueda y filtros de Gestión de Capacidad: una sola card que reúne la barra de controles, las cabeceras, las filas o el estado de datos, y la paginación, de modo que los cinco listados se lean y se comporten igual.

## Requirements

### Requirement: La barra de controles, la tabla y la paginación forman una sola card
Los listados de Células, Personas, Iniciativas, Asignaciones de una célula y Facturación SHALL mostrar la búsqueda y los filtros en una barra dentro de la misma card que la tabla, encima de las cabeceras de columna, y la paginación en el pie de esa misma card, debajo de las filas. La card SHALL tener un único borde con esquinas redondeadas; ninguna de las tres zonas SHALL dibujar un borde propio.

#### Scenario: Listado con resultados
- **WHEN** un listado muestra filas
- **THEN** se ve una sola card con, de arriba abajo: la barra de búsqueda y filtros, las cabeceras, las filas y la barra de paginación
- **AND** no hay ninguna franja de controles suelta sobre el lienzo encima de la card

#### Scenario: Filtros con popover
- **WHEN** el usuario abre un filtro de la barra
- **THEN** su panel se despliega completo por encima de la tabla, sin quedar recortado por el borde de la card ni por el desplazamiento horizontal de las columnas

### Requirement: Los estados de datos se muestran dentro de la card, con la barra montada
Mientras un listado carga, muestra un error de carga o no encuentra resultados con un filtro activo, la barra de búsqueda y filtros SHALL permanecer montada con sus valores, y el mensaje de estado SHALL mostrarse dentro de la card, debajo de las cabeceras de columna, ocupando el ancho completo de la tabla.

#### Scenario: Cargando con un filtro escrito
- **WHEN** el usuario escribe en la búsqueda y el listado vuelve a cargar
- **THEN** el campo conserva el foco y el texto, los filtros siguen visibles, y bajo las cabeceras se lee el mensaje de carga en lugar de las filas

#### Scenario: Error de carga
- **WHEN** la carga del listado falla
- **THEN** la barra sigue visible y, bajo las cabeceras, se muestra la alerta de error con su acción de reintentar

#### Scenario: Sin resultados con filtro activo
- **WHEN** la búsqueda o los filtros no coinciden con ningún registro
- **THEN** la barra sigue visible con sus valores y, bajo las cabeceras, se muestra el estado "Sin resultados" que invita a ajustarlos
- **AND** no se muestra la barra de paginación

### Requirement: El estado vacío inicial no lleva card
Cuando un listado no tiene ningún registro y no hay búsqueda ni filtro activos, SHALL mostrar el estado vacío de primera vez a pantalla completa —sin barra de controles, sin cabeceras y sin card—, igual que antes de este cambio.

#### Scenario: Primera vez, sin datos
- **WHEN** el listado no tiene registros y ningún filtro está activo
- **THEN** se muestra únicamente el estado vacío con su acción de crear (donde exista), sin barra de búsqueda ni tabla
