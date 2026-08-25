## MODIFIED Requirements

### Requirement: Listar células
El sistema SHALL mostrar un listado paginado de las células registradas, con al menos nombre, descripción, equipo, criticidad, personas asignadas, su iniciativa activa con su talla y capacidad asignada visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa célula.

El nombre SHALL ser el texto principal de la primera columna y SHALL ser un enlace a la página de detalle de esa célula, con el tratamiento de enlace neutro del sistema de diseño (no el color de marca; en reposo no se distingue del texto plano y revela su condición de enlace al pasar el puntero y al recibir el foco), igual que el nombre en el listado de Personas. La descripción (si tiene) SHALL mostrarse debajo, con menor jerarquía visual y truncada a una sola línea, con el texto completo accesible al pasar el puntero; la descripción NO SHALL ocupar una columna propia.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño, con el rol de color que corresponde al nivel (Crítica en peligro, Alta en advertencia, Media en información, Baja en neutro) y con su etiqueta en español, nunca con el código que devuelve el backend.

Las personas asignadas SHALL mostrarse como sus avatares —hasta tres, con el excedente indicado— junto con el total de personas asignadas; una célula sin asignaciones SHALL mostrar "Sin personas" con menor jerarquía visual, sin avatares.

La capacidad SHALL mostrarse de forma gráfica: el FTE asignado a la célula (suma de los % de dedicación de sus asignaciones, con un decimal) frente al FTE disponible de sus personas (suma del FTE disponible de las personas asignadas), el porcentaje de ocupación que representa coloreado por estado (éxito por debajo del 85 %, advertencia entre 85 y 99 %, peligro al 100 % o más), una barra de tramos separados cuyos tramos son el FTE de BAU y el de Transformación sobre el FTE disponible de sus personas —con los tonos de acento del sistema de diseño, los mismos que usa el detalle de la célula y la card de capacidad del resumen—, una leyenda con ambas cifras y la lectura del FTE libre ("N libre", o "Al tope" cuando no queda). Una célula sin asignaciones SHALL mostrar 0.0 FTE, la barra vacía y "Sin capacidad asignada".

La iniciativa activa de la célula SHALL mostrarse en una columna propia, contigua a la de capacidad porque es la que la explica: la **talla** SHALL ir primero, con el mismo componente de etiqueta y el mismo color por talla que el módulo de Iniciativas —una misma talla NO SHALL verse de dos colores distintos según la pantalla—, y el nombre de la iniciativa SHALL ir **en la misma línea**, a continuación, truncado con el texto completo accesible al pasar el puntero, como enlace neutro a su evaluación. La etiqueta de talla es corta y de ancho parejo, así que hace de columna dentro de la celda y los nombres SHALL quedar alineados de una fila a la otra; la celda NO SHALL apilar talla y nombre en dos alturas.

Una célula sin iniciativa activa SHALL ocupar el lugar de la talla con un guion, para que su texto siga alineado con los nombres de las demás filas; ese guion es relleno visual y NO SHALL leerse como contenido: lo que se anuncia es "Sin iniciativa".

Una célula SHALL tener como mucho una iniciativa activa, y la columna SHALL mostrar exactamente esa: una talla y un nombre por fila, nunca varias. La fila NO SHALL mostrar las iniciativas en evaluación de la célula, ni cuántas son: la columna responde por el trabajo que la célula ejecuta, no por el que todavía se está dimensionando, y una célula puede tener varias en evaluación sin que ninguna la ocupe. Una célula sin iniciativa activa SHALL mostrar "Sin iniciativa" con menor jerarquía visual, tenga o no iniciativas en evaluación. La columna SHALL informar y NO SHALL ofrecer acciones: asignar o cambiar la iniciativa de una célula no vive en el listado.

Una iniciativa sólo se activa con evaluación guardada (ver capacidad `initiatives`), así que la iniciativa activa siempre tiene talla: la columna NO SHALL necesitar un caso "sin evaluar".

El sistema SHALL permitir buscar células por nombre o equipo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por criticidad (selección múltiple), combinables con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Células y existen células registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada célula de esa página, con su nombre y descripción, equipo, criticidad en español, personas, su iniciativa activa con su talla y capacidad asignada, junto con el total de células y la navegación entre páginas

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
- **THEN** la fila muestra "Sin personas" en la columna de personas y, en la de capacidad, 0.0 FTE con la barra vacía y "Sin capacidad asignada"

#### Scenario: Capacidad asignada de una célula
- **WHEN** una célula tiene asignaciones con 80% (50 BAU / 30 Transformación) y 100% (60 BAU / 40 Transformación) de dedicación, de dos personas con 1.0 FTE disponible cada una
- **THEN** la fila muestra 1.8 / 2.0 FTE, 90% en color de advertencia, una barra con un tramo de BAU proporcional a 1.1 y otro de Transformación proporcional a 0.7 sobre 2.0, la leyenda BAU 1.1 · Transf. 0.7 y "0.2 libre"

#### Scenario: Célula al tope
- **WHEN** el FTE asignado de una célula iguala o supera el FTE disponible de sus personas
- **THEN** la fila muestra el porcentaje en color de peligro y la lectura "Al tope" en lugar del FTE libre

#### Scenario: Célula con espacio
- **WHEN** el FTE asignado de una célula está por debajo del 85 % del FTE disponible de sus personas
- **THEN** la fila muestra el porcentaje en color de éxito y el FTE libre con un decimal

#### Scenario: Célula con una iniciativa vigente
- **WHEN** una célula tiene su iniciativa activa, evaluada con talla M
- **THEN** la fila muestra, en una sola línea, la etiqueta M —con la misma etiqueta y color que esa talla tiene en el módulo de Iniciativas— y a continuación el nombre de la iniciativa como enlace neutro a su evaluación

#### Scenario: Célula con varias iniciativas vigentes
- **WHEN** una célula tiene una iniciativa activa y además dos en evaluación
- **THEN** la fila muestra sólo la talla y el nombre de la activa; las que están en evaluación no aparecen, no se cuentan y no agregan una segunda talla, un "+N" ni un texto del tipo "3 iniciativas"

#### Scenario: Iniciativa vigente sin evaluar
- **WHEN** la única iniciativa vigente de una célula está en evaluación y todavía no tiene talla
- **THEN** la fila muestra "Sin iniciativa" y no una etiqueta "Sin evaluar": una iniciativa activa siempre tiene evaluación guardada, así que ese caso no existe en esta columna

#### Scenario: Célula sin iniciativas vigentes
- **WHEN** una célula no tiene ninguna iniciativa activa, sea porque no tiene ninguna, porque las que tiene están en evaluación o porque la que tenía se cerró
- **THEN** la fila muestra un guion en el lugar de la talla y "Sin iniciativa" con menor jerarquía visual, alineado con los nombres de las demás filas; el guion no se anuncia como contenido

#### Scenario: La talla dice lo mismo en las dos pantallas
- **WHEN** el Chapter Lead compara la talla de una iniciativa en el listado de Células con la de esa misma iniciativa en el listado de Iniciativas
- **THEN** son la misma etiqueta y el mismo color, porque ambas resuelven la talla contra el mismo mapa y no contra uno propio de cada pantalla

#### Scenario: Equipo y Personas son dos columnas distintas
- **WHEN** el Chapter Lead mira una fila del listado
- **THEN** la columna "Equipo" muestra la agrupación a la que pertenece la célula y la columna "Personas" muestra quiénes la integran, con rótulos distintos: ninguna columna del listado repite el rótulo de otra

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Células y no existe ninguna célula registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera célula, sin mostrar una tabla vacía ni un error

#### Scenario: Buscar células
- **WHEN** el Chapter Lead escribe un texto en el buscador del listado
- **THEN** el sistema muestra sólo las células cuyo nombre o equipo contienen ese texto (sin distinguir mayúsculas), vuelve a la primera página y actualiza el total y la paginación sobre el subconjunto filtrado

#### Scenario: Filtrar por criticidad
- **WHEN** el Chapter Lead selecciona una o más criticidades en el filtro
- **THEN** el sistema muestra sólo las células con alguna de esas criticidades, vuelve a la primera página, y actualiza el total y la paginación sobre el subconjunto filtrado

#### Scenario: Sin resultados para la búsqueda o el filtro
- **WHEN** la búsqueda o el filtro activos no coinciden con ninguna célula
- **THEN** el sistema muestra un estado vacío de "sin resultados" que invita a ajustar la búsqueda o los filtros, distinto del estado vacío de "todavía no hay células", y mantiene visibles el buscador y el filtro

#### Scenario: Los controles siguen ahí mientras recarga
- **WHEN** el Chapter Lead cambia la búsqueda o el filtro y el listado vuelve a pedir datos
- **THEN** la búsqueda y el filtro siguen en pantalla y conservan su estado; lo único que muestra que está cargando es la zona de resultados

#### Scenario: Elegir varios criterios sin reabrir el filtro
- **WHEN** el Chapter Lead abre el filtro de criticidad y marca dos niveles seguidos
- **THEN** el panel del filtro sigue abierto entre una selección y la otra, y el listado refleja los dos criterios

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
- **WHEN** el Chapter Lead quiere ver o gestionar las personas de una célula desde el listado
- **THEN** lo hace haciendo clic en el nombre de la célula, que abre su página de detalle con la sección Personas; el menú de fila ya no ofrece "Ver equipo" ni navega a una pantalla de Capacidades
