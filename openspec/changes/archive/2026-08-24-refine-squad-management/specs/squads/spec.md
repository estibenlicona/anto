## MODIFIED Requirements

### Requirement: Listar células
El sistema SHALL mostrar un listado paginado de las células registradas, con al menos nombre, descripción, tribu, criticidad, equipo asignado y capacidad asignada visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa célula.

El nombre SHALL ser el texto principal de la primera columna y SHALL ser un enlace a la página de detalle de esa célula, con el tratamiento de enlace neutro del sistema de diseño (no el color de marca; en reposo no se distingue del texto plano y revela su condición de enlace al pasar el puntero y al recibir el foco), igual que el nombre en el listado de Personas. La descripción (si tiene) SHALL mostrarse debajo, con menor jerarquía visual y truncada a una sola línea, con el texto completo accesible al pasar el puntero; la descripción NO SHALL ocupar una columna propia.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño, con el rol de color que corresponde al nivel (Crítica en peligro, Alta en advertencia, Media en información, Baja en neutro) y con su etiqueta en español, nunca con el código que devuelve el backend. SHALL mostrarse **sin el punto de estado**: la criticidad es una clasificación fija y no una condición que esté pasando, así que el punto no agrega información y compite con la etiqueta que ya la da.

El equipo SHALL mostrarse como los avatares de las personas asignadas a la célula —hasta tres, con el excedente indicado— junto con el total de personas asignadas; una célula sin asignaciones SHALL mostrar "Sin equipo" con menor jerarquía visual, sin avatares.

La capacidad SHALL mostrarse de forma gráfica: el FTE asignado a la célula (suma de los % de dedicación de sus asignaciones, con un decimal) frente al FTE disponible de su equipo (suma del FTE disponible de las personas asignadas), el porcentaje de ocupación que representa coloreado por estado (éxito por debajo del 85 %, advertencia entre 85 y 99 %, peligro al 100 % o más), una barra apilada cuyos tramos son el FTE de BAU y el de Transformación sobre el FTE disponible del equipo —con el vocabulario **categórico** del sistema de diseño, el mismo que usa el detalle de la célula—, una leyenda con ambas cifras y la lectura del FTE libre ("N libre", o "Al tope" cuando no queda). Una célula sin asignaciones SHALL mostrar 0.0 FTE, la barra vacía y "Sin capacidad asignada".

BAU y Transformación NO SHALL colorearse con el vocabulario de acento. El acento distingue los pasos de una escala ordinal, y estas dos no son pasos de nada: son dos categorías. Usarlo las hacía tomar prestados los mismos tonos que la escala de seniority, con la que se confundían.

El sistema SHALL permitir buscar células por nombre o tribu (coincidencia parcial, sin distinguir mayúsculas) y filtrar por criticidad (selección múltiple), combinables con la paginación; al cambiar la búsqueda o el filtro, el listado vuelve a la primera página.

Los controles de búsqueda y filtro SHALL permanecer en pantalla mientras el listado recarga: el estado de carga SHALL ocupar sólo la zona de resultados. Quitarlos de en medio mientras llegan los datos cancela lo que el usuario estaba haciendo — el filtro pierde su panel abierto y hay que reabrirlo por cada criterio, y la búsqueda pierde el foco a media palabra.

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

#### Scenario: Los controles siguen ahí mientras recarga
- **WHEN** el Chapter Lead cambia la búsqueda o el filtro y el listado vuelve a pedir datos
- **THEN** la búsqueda y el filtro siguen en pantalla y conservan su estado; lo único que muestra que está cargando es la zona de resultados

#### Scenario: Elegir varios criterios sin reabrir el filtro
- **WHEN** el Chapter Lead abre el filtro de criticidad y marca dos niveles seguidos
- **THEN** el panel del filtro sigue abierto entre una selección y la otra, y el listado refleja los dos criterios

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

### Requirement: Crear célula
El sistema SHALL permitir crear una nueva célula capturando nombre, tribu, criticidad y descripción opcional, validando los mismos límites que aplica el backend antes de enviar la petición. El formulario SHALL presentarse en un panel lateral (no en un diálogo centrado), con el mismo patrón que el formulario de Personas: encabezado con título y subtítulo según el modo, campos agrupados en secciones con rótulo e ícono, campos obligatorios marcados, textos de ayuda donde el campo lo necesita, y un pie con el contador de obligatorios sin completar y las acciones de cancelar y confirmar.

La descripción SHALL capturarse en un campo de **varias líneas**, con alto visible para más de un renglón. Es el campo que admite 500 caracteres, y ofrecerle un renglón contradice lo que su propio texto de ayuda anuncia.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 200 caracteres), tribu (no vacía, máx. 100 caracteres) y selecciona una criticidad válida (`Critical`, `High`, `Medium` o `Low`), con descripción opcional (máx. 500 caracteres), y confirma
- **THEN** el sistema crea la célula, la agrega al listado y confirma el éxito de la operación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar el alta sin nombre, sin tribu o sin criticidad seleccionada
- **THEN** el sistema impide el envío y señala qué campos faltan, sin llamar al backend

#### Scenario: Validación de longitud
- **WHEN** el Chapter Lead ingresa un nombre de más de 200 caracteres, una tribu de más de 100 caracteres, o una descripción de más de 500 caracteres
- **THEN** el sistema impide el envío y señala el campo que excede el límite, sin llamar al backend

#### Scenario: Error del servidor al crear
- **WHEN** el Chapter Lead confirma un alta válida en el cliente pero el backend responde con error (400 o 500)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

#### Scenario: Resumen de campos obligatorios sin completar
- **WHEN** el Chapter Lead intenta confirmar el alta o la edición sin completar todos los campos obligatorios
- **THEN** el sistema muestra, junto a los botones de confirmar/cancelar, la cantidad de campos obligatorios que todavía faltan por completar

#### Scenario: Presentación del formulario
- **WHEN** el Chapter Lead abre el alta o la edición de una célula
- **THEN** el formulario se abre como panel lateral con las secciones "Identificación" (nombre, tribu) y "Clasificación" (criticidad, descripción), nombre y tribu marcados como obligatorios, la descripción en un campo de varias líneas, y el pie con cancelar y confirmar
