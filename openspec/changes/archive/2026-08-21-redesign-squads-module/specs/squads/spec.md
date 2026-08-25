## ADDED Requirements

### Requirement: Resumen del módulo de Células
El sistema SHALL mostrar, arriba del listado de Células, un encabezado con el título del módulo, su descripción y el botón para dar de alta una célula, y un resumen de 3 indicadores calculados sobre el total de células registradas (no sobre la página, la búsqueda o el filtro actual del listado): total de células con cuántas están sin equipo y cuántas tribus distintas las agrupan; FTE asignado a células frente al FTE disponible del chapter, con el desglose BAU / Transformación; y distribución de células por criticidad.

La distribución por criticidad SHALL pintar cada nivel con el mismo color semántico con que el listado representa ese nivel en el badge de criticidad, tanto en los segmentos de la barra como en los puntos de su leyenda, de modo que un solo código de color describa la criticidad en toda la pantalla. El sistema NO SHALL definir localmente esos colores: los toma de los roles de estado del sistema de diseño.

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
- **THEN** ambos usan el mismo rol de color del sistema de diseño

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Células, o cambia de página
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de células registradas

#### Scenario: El resumen se actualiza tras una mutación
- **WHEN** el Chapter Lead crea, edita o elimina una célula con éxito
- **THEN** el resumen vuelve a calcularse y refleja el nuevo estado

#### Scenario: Resumen no disponible
- **WHEN** la petición del resumen falla o todavía está en carga
- **THEN** el listado sigue mostrándose y operando con normalidad, sin que la falta del resumen bloquee la pantalla

## MODIFIED Requirements

### Requirement: Listar células
El sistema SHALL mostrar un listado paginado de las células registradas, con al menos nombre, descripción, tribu, criticidad, equipo asignado y capacidad asignada visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar, ver el equipo o eliminar esa célula.

El nombre SHALL ser el texto principal de la primera columna y la descripción (si tiene) SHALL mostrarse debajo, con menor jerarquía visual y truncada a una sola línea, con el texto completo accesible al pasar el puntero; la descripción NO SHALL ocupar una columna propia.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño, con el rol de color que corresponde al nivel (Crítica en peligro, Alta en advertencia, Media en información, Baja en neutro) y con su etiqueta en español, nunca con el código que devuelve el backend.

El equipo SHALL mostrarse como los avatares de las personas asignadas a la célula —hasta tres, con el excedente indicado— junto con el total de personas asignadas; una célula sin asignaciones SHALL mostrar "Sin equipo" con menor jerarquía visual, sin avatares.

La capacidad SHALL mostrarse como el FTE asignado a la célula (suma de los % de dedicación de sus asignaciones, expresada en FTE con un decimal) y, debajo, el desglose en FTE de BAU y de Transformación con menor jerarquía visual.

El sistema SHALL permitir buscar células por nombre o tribu (coincidencia parcial, sin distinguir mayúsculas) y filtrar por criticidad (selección múltiple), combinables con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Células y existen células registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada célula de esa página, con su nombre y descripción, tribu, criticidad en español, equipo y capacidad asignada, junto con el total de células y la navegación entre páginas

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
- **THEN** el sistema muestra las opciones para editar, ver el equipo o eliminar esa célula

#### Scenario: Ver el equipo de una célula
- **WHEN** el Chapter Lead elige "Ver equipo" en el menú de una fila
- **THEN** el sistema navega a la pantalla de Capacidades con esa célula ya seleccionada, sin recargar toda la aplicación

### Requirement: Selección de criticidad desde catálogo
El sistema SHALL ofrecer la criticidad como una selección restringida a los valores vigentes del catálogo expuesto por el backend (mockeado), no como texto libre, y SHALL presentar cada valor con su etiqueta en español (Crítica, Alta, Media, Baja) tanto en el formulario como en el filtro del listado, enviando al backend el código del catálogo.

#### Scenario: Opciones de criticidad
- **WHEN** el Chapter Lead abre el selector de criticidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de criticidad vigentes obtenidos del catálogo, cada uno con su etiqueta en español

#### Scenario: Código hacia el backend
- **WHEN** el Chapter Lead elige "Crítica" y confirma el alta o la edición
- **THEN** la petición al backend lleva el código del catálogo (`Critical`), no la etiqueta
