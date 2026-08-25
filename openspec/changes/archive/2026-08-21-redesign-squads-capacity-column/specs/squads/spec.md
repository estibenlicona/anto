## MODIFIED Requirements

### Requirement: Resumen del módulo de Células
El sistema SHALL mostrar, arriba del listado de Células, un encabezado con el título del módulo, su descripción y el botón para dar de alta una célula, y un resumen de 3 indicadores calculados sobre el total de células registradas (no sobre la página, la búsqueda o el filtro actual del listado): total de células con cuántas están sin equipo y cuántas tribus distintas las agrupan; FTE asignado a células frente al FTE disponible del chapter, con el desglose BAU / Transformación; y distribución de células por criticidad.

La distribución por criticidad SHALL pintarse como una escala de intensidad sobre el color de marca, ordenada de mayor a menor criticidad: Crítica con el relleno de peligro intenso, Alta con el relleno de marca, Media con el relleno de marca atenuado, y Baja con el gris de borde neutro; tanto en los segmentos de la barra como en los puntos de su leyenda. Esta escala es propia de la card y NO SHALL reemplazar los roles semánticos de los badges de criticidad del listado y del detalle. Debajo de la leyenda la card SHALL mostrar cuántas de las células están en criticidad Alta o Crítica sobre el total.

Los avatares que aparezcan en el resumen o en el listado SHALL usar el mismo color e iniciales por persona que el módulo de Personas.

#### Scenario: Encabezado del módulo
- **WHEN** el Chapter Lead abre la pantalla de Células
- **THEN** el sistema muestra el título "Células", su descripción y el botón "Nueva célula", y no muestra ningún otro botón de alta dentro del listado

#### Scenario: Resumen de células
- **WHEN** el Chapter Lead ve el resumen de Células
- **THEN** el sistema muestra el total de células registradas, cuántas de ellas no tienen ninguna persona asignada y cuántas tribus distintas agrupan

#### Scenario: Resumen de capacidad asignada
- **WHEN** el Chapter Lead ve el resumen de Células
- **THEN** el sistema muestra el FTE total asignado a células frente al FTE disponible del chapter, el porcentaje que representa, y el desglose de ese FTE asignado en BAU y Transformación

#### Scenario: Capacidad del chapter en cero
- **WHEN** el FTE disponible del chapter es 0 (no hay personas registradas)
- **THEN** el resumen muestra 0% de capacidad asignada sin errores de cálculo ni valores indefinidos

#### Scenario: Distribución por criticidad
- **WHEN** el Chapter Lead ve el resumen de Células
- **THEN** el sistema muestra cuántas células hay en cada uno de los 4 niveles de criticidad del catálogo, con la etiqueta en español de cada nivel (Crítica, Alta, Media, Baja), incluyendo los niveles con cero células

#### Scenario: La criticidad viste el mismo color en la card y en el listado
- **WHEN** el Chapter Lead compara el segmento o punto de leyenda de un nivel de criticidad en la card de distribución con el badge de ese mismo nivel en una fila del listado
- **THEN** la card usa su escala de intensidad (peligro intenso, marca, marca atenuada, gris neutro) mientras el badge conserva su rol semántico; el segmento y el punto de leyenda de un mismo nivel sí comparten exactamente el mismo color entre ellos

#### Scenario: Lectura de criticidad alta o crítica
- **WHEN** hay 2 células Críticas, 1 Alta, 1 Media y 1 Baja
- **THEN** el pie de la card muestra "3 de 5 células en criticidad alta o crítica"

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Células, o cambia de página
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de células registradas

#### Scenario: El resumen se actualiza tras una mutación
- **WHEN** el Chapter Lead crea, edita o elimina una célula con éxito
- **THEN** el resumen vuelve a calcularse y refleja el nuevo estado

#### Scenario: Resumen no disponible
- **WHEN** la petición del resumen falla o todavía está en carga
- **THEN** el listado sigue mostrándose y operando con normalidad, sin que la falta del resumen bloquee la pantalla

### Requirement: Listar células
El sistema SHALL mostrar un listado paginado de las células registradas, con al menos nombre, descripción, tribu, criticidad, equipo asignado y capacidad asignada visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa célula.

El nombre SHALL ser el texto principal de la primera columna y SHALL ser un enlace a la página de detalle de esa célula, con el tratamiento de enlace neutro del sistema de diseño (no el color de marca; en reposo no se distingue del texto plano y revela su condición de enlace al pasar el puntero y al recibir el foco), igual que el nombre en el listado de Personas. La descripción (si tiene) SHALL mostrarse debajo, con menor jerarquía visual y truncada a una sola línea, con el texto completo accesible al pasar el puntero; la descripción NO SHALL ocupar una columna propia.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño, con el rol de color que corresponde al nivel (Crítica en peligro, Alta en advertencia, Media en información, Baja en neutro) y con su etiqueta en español, nunca con el código que devuelve el backend.

El equipo SHALL mostrarse como los avatares de las personas asignadas a la célula —hasta tres, con el excedente indicado— junto con el total de personas asignadas; una célula sin asignaciones SHALL mostrar "Sin equipo" con menor jerarquía visual, sin avatares.

La capacidad SHALL mostrarse de forma gráfica: el FTE asignado a la célula (suma de los % de dedicación de sus asignaciones, con un decimal) frente al FTE disponible de su equipo (suma del FTE disponible de las personas asignadas), el porcentaje de ocupación que representa coloreado por estado (éxito por debajo del 85 %, advertencia entre 85 y 99 %, peligro al 100 % o más), una barra apilada cuyos tramos son el FTE de BAU y el de Transformación sobre el FTE disponible del equipo —con los tonos de acento del sistema de diseño, los mismos que usa el detalle de la célula—, una leyenda con ambas cifras y la lectura del FTE libre ("N libre", o "Al tope" cuando no queda). Una célula sin asignaciones SHALL mostrar 0.0 FTE, la barra vacía y "Sin capacidad asignada".

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
- **THEN** la fila muestra "Sin equipo" en la columna de equipo y, en la de capacidad, 0.0 FTE con la barra vacía y "Sin capacidad asignada"

#### Scenario: Capacidad asignada de una célula
- **WHEN** una célula tiene asignaciones con 80% (50 BAU / 30 Transformación) y 100% (60 BAU / 40 Transformación) de dedicación, de dos personas con 1.0 FTE disponible cada una
- **THEN** la fila muestra 1.8 / 2.0 FTE, 90% en color de advertencia, una barra con un tramo de BAU proporcional a 1.1 y otro de Transformación proporcional a 0.7 sobre 2.0, la leyenda BAU 1.1 · Transf. 0.7 y "0.2 libre"

#### Scenario: Célula al tope
- **WHEN** el FTE asignado de una célula iguala o supera el FTE disponible de su equipo
- **THEN** la fila muestra el porcentaje en color de peligro y la lectura "Al tope" en lugar del FTE libre

#### Scenario: Célula con espacio
- **WHEN** el FTE asignado de una célula está por debajo del 85 % del FTE disponible de su equipo
- **THEN** la fila muestra el porcentaje en color de éxito y el FTE libre con un decimal

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
