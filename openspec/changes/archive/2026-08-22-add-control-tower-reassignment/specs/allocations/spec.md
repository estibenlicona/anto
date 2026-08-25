## MODIFIED Requirements

### Requirement: Asignar una persona a la célula
El sistema SHALL permitir asignar una persona ya registrada a la célula elegida, capturando % de dedicación y su desglose en % BAU y % Transformación, validando los mismos límites que aplica el backend antes de enviar la petición. Una persona SHALL pertenecer a una sola célula: el selector de persona del alta SHALL ofrecer únicamente personas sin asignación, y el sistema SHALL rechazar (como lo hace el backend) una asignación para una persona que ya está en otra célula. El formulario SHALL presentarse en un panel lateral con el mismo patrón que el de Personas y el de Células: encabezado con título y un subtítulo que nombra la célula, secciones con rótulo e ícono ("Persona" y "Dedicación"), los tres porcentajes en grilla con la unidad "%" como adorno, persona y % de dedicación marcados como obligatorios, una ayuda que recuerda que BAU + Transformación debe igualar la dedicación, y un pie con el contador de obligatorios sin completar y las acciones de cancelar y confirmar.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead elige una persona ya registrada, ingresa un % de dedicación entre 1 y 100, y un desglose de % BAU y % Transformación (cada uno entre 0 y 100) cuya suma sea igual al % de dedicación, y confirma
- **THEN** el sistema crea la asignación, la agrega al listado de la célula y confirma el éxito de la operación

#### Scenario: Sólo personas sin célula
- **WHEN** el Chapter Lead abre el selector de persona del alta
- **THEN** ve sólo las personas que no tienen asignación en ninguna célula

#### Scenario: Persona ya asignada en otra célula
- **WHEN** se intenta crear una asignación para una persona que ya tiene una en otra célula
- **THEN** el sistema muestra el motivo del rechazo y no crea la asignación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar sin elegir una persona o sin ingresar un % de dedicación
- **THEN** el sistema impide el envío y señala qué falta, sin llamar al backend

#### Scenario: Validación del desglose BAU/Transformación
- **WHEN** la suma de % BAU y % Transformación no es igual al % de dedicación ingresado, o alguno de los tres valores está fuera de su rango válido (dedicación 1-100, BAU y Transformación 0-100 cada uno)
- **THEN** el sistema impide el envío y señala el desglose como inválido, sin llamar al backend

#### Scenario: Error del servidor al asignar
- **WHEN** el Chapter Lead confirma una asignación válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

#### Scenario: Resumen de campos obligatorios sin completar
- **WHEN** el Chapter Lead intenta confirmar la asignación sin completar todos los campos obligatorios
- **THEN** el sistema muestra, junto a los botones de confirmar/cancelar, la cantidad de campos obligatorios que todavía faltan por completar

#### Scenario: Presentación del formulario
- **WHEN** el Chapter Lead abre "Asignar persona" desde el detalle de una célula
- **THEN** el formulario se abre como panel lateral con el nombre de la célula en el subtítulo, la sección "Persona" con el selector y la sección "Dedicación" con los tres porcentajes

### Requirement: Listar las asignaciones de una célula
El sistema SHALL mostrar, para la célula del detalle, un listado paginado de sus asignaciones vigentes, con por fila: la persona (avatar con las mismas iniciales y color que en Personas, nombre, y debajo cargo y modalidad con menor jerarquía), su seniority (con el componente de nivel del sistema de diseño, igual que el listado de Personas), su % de dedicación en esta célula (barra pequeña y porcentaje), su desglose BAU/Transformación (barra segmentada pequeña y porcentajes) y cuánto margen le queda a la persona (100 menos su dedicación en esta célula, que es la única que tiene), y SHALL exponer por fila un menú de acciones que permite editar o quitar esa asignación.

El sistema SHALL permitir buscar asignaciones por nombre o cargo de la persona (coincidencia parcial, sin distinguir mayúsculas) y filtrar por seniority (selección múltiple), combinables con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** la célula del detalle tiene asignaciones vigentes
- **THEN** el sistema muestra una página de resultados con una fila por cada asignación de esa página, con persona, seniority, % de dedicación, desglose BAU/Transformación y margen de la persona, junto con el total de asignaciones y la navegación entre páginas

#### Scenario: Disponibilidad de la persona
- **WHEN** una persona tiene 80% en esta célula
- **THEN** la fila muestra "20% libre"

#### Scenario: Persona al tope por otras células
- **WHEN** una persona está al 100% en esta célula
- **THEN** la fila muestra "0% libre"; no existe dedicación en otras células porque una persona pertenece a una sola

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
