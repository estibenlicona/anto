## MODIFIED Requirements

### Requirement: Listar las asignaciones de una célula
El sistema SHALL mostrar, para la célula del detalle, un listado paginado de sus asignaciones vigentes, con por fila: la persona (avatar con las mismas iniciales y color que en Personas, nombre, y debajo cargo y modalidad con menor jerarquía), su nivel (con el componente de nivel del sistema de diseño, igual que la columna Nivel del listado de Personas), su % de dedicación en esta célula (barra pequeña y porcentaje), su desglose BAU/Transformación (barra segmentada pequeña y porcentajes) y cuánto margen le queda a la persona (100 menos su dedicación en esta célula, que es la única que tiene), y SHALL exponer por fila un menú de acciones que permite editar o quitar esa asignación.

El sistema SHALL permitir buscar asignaciones por nombre o cargo de la persona (coincidencia parcial, sin distinguir mayúsculas) y filtrar por **nivel** (la escala de 4 — el filtro que antes se llamaba Seniority; no hay filtro por el nuevo Seniority en esta pantalla) con selección múltiple, combinable con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** la célula del detalle tiene asignaciones vigentes
- **THEN** el sistema muestra una página de resultados con una fila por cada asignación de esa página, con persona, nivel, % de dedicación, desglose BAU/Transformación y margen de la persona, junto con el total de asignaciones y la navegación entre páginas

#### Scenario: Disponibilidad de la persona
- **WHEN** una persona tiene 80% en esta célula
- **THEN** la fila muestra "20% libre"

#### Scenario: Persona al tope por otras células
- **WHEN** una persona está al 100% en esta célula
- **THEN** la fila muestra "0% libre"; no existe dedicación en otras células porque una persona pertenece a una sola

#### Scenario: Buscar en el equipo
- **WHEN** el Chapter Lead escribe un texto en el buscador de la sección Personas
- **THEN** el sistema muestra sólo las asignaciones cuya persona tiene ese texto en el nombre o el cargo, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Filtrar por seniority
- **WHEN** el Chapter Lead selecciona uno o más valores en el filtro **Nivel** (Principiante, Competente, Avanzado, Experto; el que antes se llamaba Seniority)
- **THEN** el sistema muestra sólo las asignaciones de personas con alguno de esos niveles, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Sin resultados para la búsqueda o el filtro
- **WHEN** la búsqueda o el filtro activos no coinciden con ninguna asignación
- **THEN** el sistema muestra un estado vacío de "sin resultados", distinto del estado vacío de "todavía no hay personas", manteniendo visibles el buscador y el filtro

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
