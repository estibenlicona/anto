## ADDED Requirements

### Requirement: Detalle de célula
El sistema SHALL exponer una página de detalle por célula, accesible desde el nombre de la célula en el listado, que concentra la información y la gestión de esa célula: un encabezado con el nombre, la criticidad en español (con el mismo componente y rol de color que el listado), la tribu, la descripción, un enlace de vuelta al listado y las acciones de editar la célula, asignar una persona y eliminar la célula; un resumen de 3 indicadores del equipo de esa célula; y una sección "Equipo" con el listado de sus asignaciones y su gestión (ver capacidad `allocations`).

Los 3 indicadores SHALL ser: **Equipo** (total de personas asignadas, sus avatares con el mismo color e iniciales que en Personas, y cuántas son de nivel Experto y cuántas de nivel Principiante); **Capacidad asignada** (FTE asignado a la célula frente al FTE disponible de las personas de su equipo, el porcentaje que representa y el FTE libre de ese equipo); y **Mix BAU / Transformación** (FTE de BAU y de Transformación como barra segmentada con leyenda, y el porcentaje del FTE asignado que va a BAU). Las cifras SHALL calcularse sobre todas las asignaciones de la célula, no sobre la página, la búsqueda o el filtro del listado de equipo.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño y su etiqueta en español, con el mismo rol de color que en el listado. Editar y eliminar SHALL usar los mismos formularios, validaciones y diálogos de confirmación que el listado de Células; tras eliminar, el sistema SHALL volver al listado.

#### Scenario: Abrir el detalle desde el listado
- **WHEN** el Chapter Lead hace clic en el nombre de una célula en el listado
- **THEN** el sistema navega a la página de detalle de esa célula sin recargar la aplicación, y muestra su nombre, criticidad en español, tribu y descripción en el encabezado

#### Scenario: Volver al listado
- **WHEN** el Chapter Lead usa el enlace de vuelta del encabezado del detalle
- **THEN** el sistema navega al listado de Células sin recargar la aplicación

#### Scenario: Célula inexistente
- **WHEN** el Chapter Lead navega directamente al detalle con un identificador que no corresponde a ninguna célula
- **THEN** el sistema muestra un estado de "célula no encontrada" con un enlace al listado, sin pantalla en blanco ni error no controlado

#### Scenario: Error al cargar la célula
- **WHEN** la petición para obtener la célula falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga

#### Scenario: Resumen del equipo
- **WHEN** la célula tiene 4 personas asignadas, 2 de nivel Experto y 1 de nivel Principiante, con 2.7 FTE asignados (1.7 BAU y 1.0 Transformación) y un FTE disponible del equipo de 3.8
- **THEN** el detalle muestra 4 en Equipo con la lectura "2 expertos · 1 requiere acompañamiento", 2.7 / 3.8 FTE en Capacidad asignada con 71% y 1.1 libre, y en Mix 1.7 BAU y 1.0 Transformación con "63% del esfuerzo va a operación"

#### Scenario: Célula sin equipo
- **WHEN** la célula no tiene ninguna asignación
- **THEN** el resumen muestra 0 personas, 0.0 / 0.0 FTE con 0% (sin división por cero) y un mix vacío, y la sección Equipo muestra el estado vacío que invita a asignar la primera persona

#### Scenario: El resumen se actualiza tras gestionar el equipo
- **WHEN** el Chapter Lead asigna, edita o quita una persona desde el detalle
- **THEN** los 3 indicadores vuelven a calcularse y reflejan el nuevo estado

#### Scenario: Resumen no disponible
- **WHEN** la petición del resumen del equipo falla o está en carga
- **THEN** el encabezado y la sección Equipo siguen mostrándose y operando con normalidad

#### Scenario: Editar la célula desde el detalle
- **WHEN** el Chapter Lead elige "Editar célula" y confirma cambios válidos
- **THEN** el sistema actualiza la célula y el encabezado refleja los nuevos valores sin salir del detalle

#### Scenario: Eliminar la célula desde el detalle
- **WHEN** el Chapter Lead elige "Eliminar célula" y confirma en el diálogo
- **THEN** el sistema elimina la célula y navega al listado de Células

#### Scenario: La entrada de navegación sigue activa en el detalle
- **WHEN** el Chapter Lead está en el detalle de una célula
- **THEN** la entrada "Células" de la navegación lateral se muestra como activa y el breadcrumb muestra "Gestionar Células" seguido del nombre de la célula

## MODIFIED Requirements

### Requirement: Listar células
El sistema SHALL mostrar un listado paginado de las células registradas, con al menos nombre, descripción, tribu, criticidad, equipo asignado y capacidad asignada visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa célula.

El nombre SHALL ser el texto principal de la primera columna y SHALL ser un enlace a la página de detalle de esa célula, con el tratamiento de enlace neutro del sistema de diseño (no el color de marca; en reposo no se distingue del texto plano y revela su condición de enlace al pasar el puntero y al recibir el foco), igual que el nombre en el listado de Personas. La descripción (si tiene) SHALL mostrarse debajo, con menor jerarquía visual y truncada a una sola línea, con el texto completo accesible al pasar el puntero; la descripción NO SHALL ocupar una columna propia.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño, con el rol de color que corresponde al nivel (Crítica en peligro, Alta en advertencia, Media en información, Baja en neutro) y con su etiqueta en español, nunca con el código que devuelve el backend.

El equipo SHALL mostrarse como los avatares de las personas asignadas a la célula —hasta tres, con el excedente indicado— junto con el total de personas asignadas; una célula sin asignaciones SHALL mostrar "Sin equipo" con menor jerarquía visual, sin avatares.

La capacidad SHALL mostrarse como el FTE asignado a la célula (suma de los % de dedicación de sus asignaciones, expresada en FTE con un decimal) y, debajo, el desglose en FTE de BAU y de Transformación con menor jerarquía visual.

El sistema SHALL permitir buscar células por nombre o tribu (coincidencia parcial, sin distinguir mayúsculas) y filtrar por criticidad (selección múltiple), combinables con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Células y existen células registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada célula de esa página, con su nombre y descripción, tribu, criticidad en español, equipo y capacidad asignada, junto con el total de células y la navegación entre páginas

#### Scenario: Nombre como enlace al detalle
- **WHEN** el Chapter Lead hace clic en el nombre de una célula
- **THEN** el sistema navega a la página de detalle de esa célula sin recargar la aplicación

#### Scenario: Descripción larga
- **WHEN** una célula tiene una descripción que no cabe en una línea de su columna
- **THEN** la fila muestra la descripción truncada a una línea sin alterar la altura de las demás filas, y el texto completo queda disponible al pasar el puntero

#### Scenario: Célula con equipo
- **WHEN** una célula tiene una o más personas asignadas
- **THEN** la fila muestra los avatares de hasta tres de ellas (con el excedente como "+N") y el total de personas, y cada avatar lleva las mismas iniciales y color que esa persona tiene en el módulo de Personas

#### Scenario: Célula sin equipo
- **WHEN** una célula no tiene ninguna persona asignada
- **THEN** la fila muestra "Sin equipo" en la columna de equipo y 0.0 FTE en la columna de capacidad

#### Scenario: Capacidad asignada de una célula
- **WHEN** una célula tiene asignaciones con 80% (50 BAU / 30 Transformación) y 100% (60 BAU / 40 Transformación) de dedicación
- **THEN** la fila muestra 1.8 FTE de capacidad asignada con el desglose BAU 1.1 y Transformación 0.7

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Células y no existe ninguna célula registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera célula, sin mostrar una tabla vacía ni un error

#### Scenario: Buscar células
- **WHEN** el Chapter Lead escribe un texto en el buscador del listado
- **THEN** el sistema muestra sólo las células cuyo nombre o tribu contienen ese texto (sin distinguir mayúsculas), vuelve a la primera página y actualiza el total y la paginación sobre el subconjunto filtrado

#### Scenario: Filtrar por criticidad
- **WHEN** el Chapter Lead selecciona una o más criticidades en el filtro
- **THEN** el sistema muestra sólo las células con alguna de esas criticidades, vuelve a la primera página, y actualiza el total y la paginación sobre el subconjunto filtrado

#### Scenario: Sin resultados para la búsqueda o el filtro
- **WHEN** la búsqueda o el filtro activos no coinciden con ninguna célula
- **THEN** el sistema muestra un estado vacío de "sin resultados" que invita a ajustar la búsqueda o los filtros, distinto del estado vacío de "todavía no hay células", y mantiene visibles el buscador y el filtro

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las células falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de células
- **THEN** el sistema muestra las células correspondientes a esa página, conservando la búsqueda y el filtro activos, sin recargar toda la aplicación

#### Scenario: Menú de acciones por fila
- **WHEN** el Chapter Lead abre el menú de acciones de una fila del listado
- **THEN** el sistema muestra las opciones para editar o eliminar esa célula, sin una opción "Ver equipo" (la gestión del equipo vive en el detalle)

#### Scenario: Ver el equipo de una célula
- **WHEN** el Chapter Lead quiere ver o gestionar el equipo de una célula desde el listado
- **THEN** lo hace haciendo clic en el nombre de la célula, que abre su página de detalle con la sección Equipo; el menú de fila ya no ofrece "Ver equipo" ni navega a una pantalla de Capacidades
