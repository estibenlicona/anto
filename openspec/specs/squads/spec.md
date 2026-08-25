## Purpose

La capacidad `squads` permite al Chapter Lead consultar, crear, editar y eliminar las células (squads) registradas en el sistema, como base para asignar iniciativas y capacidades sobre ellas.
## Requirements
### Requirement: Resumen del módulo de Células
El sistema SHALL mostrar, arriba del listado de Células, un encabezado con el título del módulo, su descripción y el botón para dar de alta una célula, y un resumen de 3 indicadores calculados sobre el total de células registradas (no sobre la página, la búsqueda o el filtro actual del listado), en una sola fila y de la misma altura, cada uno abriendo con la cifra que manda: total de células con en cuántos equipos están, y en la leyenda cuántas están sin personas y cuántas al tope; FTE asignado frente al FTE disponible del chapter con el porcentaje, y una barra de tres tramos —BAU, Transformación y libre— con su leyenda en línea; y la distribución por criticidad abriendo con cuántas están en criticidad alta o crítica sobre el total, con la barra y la leyenda en línea.

La distribución por criticidad SHALL pintarse como una escala de intensidad sobre el color de marca, ordenada de mayor a menor criticidad: Crítica con el relleno de peligro intenso, Alta con el relleno de marca, Media con el relleno de marca atenuado, y Baja con el gris de borde neutro; tanto en los segmentos de la barra como en los puntos de su leyenda. Esta escala es propia de la card y NO SHALL reemplazar los roles semánticos de los badges de criticidad del listado y del detalle. La cifra titular de la card SHALL ser cuántas de las células están en criticidad Alta o Crítica sobre el total.

Los avatares que aparezcan en el resumen o en el listado SHALL usar el mismo color e iniciales por persona que el módulo de Personas.

#### Scenario: Encabezado del módulo
- **WHEN** el Chapter Lead abre la pantalla de Células
- **THEN** el sistema muestra el título "Células", su descripción y el botón "Nueva célula", y no muestra ningún otro botón de alta dentro del listado

#### Scenario: Resumen de células
- **WHEN** el Chapter Lead ve el resumen de Células
- **THEN** el sistema muestra el total de células registradas y en cuántos equipos están, y en la leyenda cuántas no tienen ninguna persona asignada y cuántas están al tope de su capacidad

#### Scenario: Resumen de capacidad asignada
- **WHEN** el Chapter Lead ve el resumen de Células
- **THEN** el sistema muestra el FTE total asignado a células frente al FTE disponible del chapter con el porcentaje que representa, y una barra de tres tramos con BAU, Transformación y libre, cada uno con su cifra en la leyenda en línea

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
- **THEN** la card abre con "3" y la lectura "de 5 en criticidad alta o crítica"

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

### Requirement: Detalle de célula
El sistema SHALL exponer una página de detalle por célula, accesible desde el nombre de la célula en el listado, que concentra la información y la gestión de esa célula: un encabezado con el nombre, la criticidad en español (con el mismo componente y rol de color que el listado), el equipo, la descripción, un enlace de vuelta al listado y las acciones de editar la célula, asignar una persona y eliminar la célula; un resumen de 2 indicadores de las personas de esa célula; y una sección "Personas" con el listado de sus asignaciones y su gestión (ver capacidad `allocations`).

Los 2 indicadores SHALL ser: **Personas** (total de personas asignadas, sus avatares con el mismo color e iniciales que en Personas, y cuántas son de nivel Experto y cuántas de nivel Principiante); y **Capacidad** (una sola card que fusiona la capacidad asignada con su mix, porque el total del mix es la capacidad asignada: el FTE asignado frente al FTE disponible de sus personas, el porcentaje de ocupación marcado por severidad — advertencia cerca del tope, peligro por encima —, la barra apilada cuyas partes son BAU y Transformación en los tonos del mix y cuyo track vacío es lo libre, la lectura del FTE libre, y el porcentaje del FTE asignado que va a BAU). El sistema NO SHALL repetir la cifra de capacidad asignada en un indicador aparte del mix. Las cifras SHALL calcularse sobre todas las asignaciones de la célula, no sobre la página, la búsqueda o el filtro del listado de personas.

La criticidad SHALL mostrarse con el componente de estado del sistema de diseño y su etiqueta en español, con el mismo rol de color que en el listado. Editar y eliminar SHALL usar los mismos formularios, validaciones y diálogos de confirmación que el listado de Células; tras eliminar, el sistema SHALL volver al listado.

#### Scenario: Abrir el detalle desde el listado
- **WHEN** el Chapter Lead hace clic en el nombre de una célula en el listado
- **THEN** el sistema navega a la página de detalle de esa célula sin recargar la aplicación, y muestra su nombre, criticidad en español, equipo y descripción en el encabezado

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
- **WHEN** la célula tiene 4 personas asignadas, 2 de nivel Experto y 1 de nivel Principiante, con 2.7 FTE asignados (1.7 BAU y 1.0 Transformación) y un FTE disponible de sus personas de 3.8
- **THEN** el detalle muestra 4 en Personas con la lectura "2 expertos · 1 requiere acompañamiento", y una única card de Capacidad con 2.7 / 3.8 FTE, 71% de ocupación, la barra apilada con 1.7 de BAU y 1.0 de Transformación, 1.1 libre y "63% del esfuerzo va a operación" — sin una segunda card que repita el 2.7

#### Scenario: Célula sin equipo
- **WHEN** la célula no tiene ninguna asignación
- **THEN** el resumen muestra 0 personas y la card de Capacidad en su estado vacío (0.0 / 0.0 FTE, 0% sin división por cero, sin partes que apilar), y la sección Personas muestra el estado vacío que invita a asignar la primera persona

#### Scenario: El resumen se actualiza tras gestionar el equipo
- **WHEN** el Chapter Lead asigna, edita o quita una persona desde el detalle
- **THEN** los 2 indicadores vuelven a calcularse y reflejan el nuevo estado

#### Scenario: Resumen no disponible
- **WHEN** la petición del resumen de las personas falla o está en carga
- **THEN** el encabezado y la sección Personas siguen mostrándose y operando con normalidad

#### Scenario: Editar la célula desde el detalle
- **WHEN** el Chapter Lead elige "Editar célula" y confirma cambios válidos
- **THEN** el sistema actualiza la célula y el encabezado refleja los nuevos valores sin salir del detalle

#### Scenario: Eliminar la célula desde el detalle
- **WHEN** el Chapter Lead elige "Eliminar célula" y confirma en el diálogo
- **THEN** el sistema elimina la célula y navega al listado de Células

#### Scenario: La entrada de navegación sigue activa en el detalle
- **WHEN** el Chapter Lead está en el detalle de una célula
- **THEN** la entrada "Células" de la navegación lateral se muestra como activa y el breadcrumb muestra "Gestionar Células" seguido del nombre de la célula

### Requirement: Crear célula
El sistema SHALL permitir crear una nueva célula capturando nombre, equipo, criticidad y descripción opcional, validando los mismos límites que aplica el backend antes de enviar la petición. El formulario SHALL presentarse en un panel lateral (no en un diálogo centrado), con el mismo patrón que el formulario de Personas: encabezado con título y subtítulo según el modo, campos agrupados en secciones con rótulo e ícono, campos obligatorios marcados, textos de ayuda donde el campo lo necesita, y un pie con el contador de obligatorios sin completar y las acciones de cancelar y confirmar.

La descripción SHALL capturarse en un campo de **varias líneas**, con alto visible para más de un renglón. Es el campo que admite 500 caracteres, y ofrecerle un renglón contradice lo que su propio texto de ayuda anuncia.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 200 caracteres), equipo (no vacío, máx. 100 caracteres) y selecciona una criticidad válida (`Critical`, `High`, `Medium` o `Low`), con descripción opcional (máx. 500 caracteres), y confirma
- **THEN** el sistema crea la célula, la agrega al listado y confirma el éxito de la operación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar el alta sin nombre, sin equipo o sin criticidad seleccionada
- **THEN** el sistema impide el envío y señala qué campos faltan, sin llamar al backend

#### Scenario: Validación de longitud
- **WHEN** el Chapter Lead ingresa un nombre de más de 200 caracteres, un equipo de más de 100 caracteres, o una descripción de más de 500 caracteres
- **THEN** el sistema impide el envío y señala el campo que excede el límite, sin llamar al backend

#### Scenario: Error del servidor al crear
- **WHEN** el Chapter Lead confirma un alta válida en el cliente pero el backend responde con error (400 o 500)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

#### Scenario: Resumen de campos obligatorios sin completar
- **WHEN** el Chapter Lead intenta confirmar el alta o la edición sin completar todos los campos obligatorios
- **THEN** el sistema muestra, junto a los botones de confirmar/cancelar, la cantidad de campos obligatorios que todavía faltan por completar

#### Scenario: Presentación del formulario
- **WHEN** el Chapter Lead abre el alta o la edición de una célula
- **THEN** el formulario se abre como panel lateral con las secciones "Identificación" (nombre, equipo) y "Clasificación" (criticidad, descripción), nombre y equipo marcados como obligatorios, la descripción en un campo de varias líneas, y el pie con cancelar y confirmar

### Requirement: Editar célula
El sistema SHALL permitir editar nombre, equipo, criticidad y descripción de una célula existente, aplicando las mismas reglas de validación que en el alta.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica uno o más campos de una célula existente con valores válidos y confirma
- **THEN** el sistema actualiza la célula, refleja los nuevos valores en el listado y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de una célula existente
- **THEN** el sistema precarga el formulario con los valores actuales de esa célula

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario

### Requirement: Eliminar célula
El sistema SHALL permitir eliminar una célula existente solo tras una confirmación explícita del usuario.

#### Scenario: Eliminación confirmada
- **WHEN** el Chapter Lead solicita eliminar una célula y confirma la acción en el diálogo de confirmación
- **THEN** el sistema elimina la célula y la retira del listado

#### Scenario: Eliminación cancelada
- **WHEN** el Chapter Lead solicita eliminar una célula pero cancela el diálogo de confirmación
- **THEN** el sistema no elimina la célula y no realiza ninguna petición al backend

#### Scenario: Error del servidor al eliminar
- **WHEN** el Chapter Lead confirma la eliminación pero el backend responde con error (404 o 500)
- **THEN** el sistema muestra el motivo del error y mantiene la célula visible en el listado

### Requirement: Selección de criticidad desde catálogo
El sistema SHALL ofrecer la criticidad como una selección restringida a los valores vigentes del catálogo expuesto por el backend (mockeado), no como texto libre, y SHALL presentar cada valor con su etiqueta en español (Crítica, Alta, Media, Baja) tanto en el formulario como en el filtro del listado, enviando al backend el código del catálogo.

#### Scenario: Opciones de criticidad
- **WHEN** el Chapter Lead abre el selector de criticidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de criticidad vigentes obtenidos del catálogo, cada uno con su etiqueta en español

#### Scenario: Código hacia el backend
- **WHEN** el Chapter Lead elige "Crítica" y confirma el alta o la edición
- **THEN** la petición al backend lleva el código del catálogo (`Critical`), no la etiqueta

### Requirement: Acceso autenticado a la pantalla de Células
El sistema SHALL exigir sesión autenticada para acceder a la pantalla de Células, y SHALL exigir además el rol de Chapter Lead. Un usuario sin sesión SHALL ser llevado a iniciar sesión; uno con sesión pero sin el rol SHALL recibir un aviso de permisos insuficientes.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a la pantalla de Células
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceder con el rol de Chapter Lead
- **WHEN** un usuario con sesión y con rol de Chapter Lead navega a la pantalla de Células
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceder con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin rol de Chapter Lead navega a la pantalla de Células
- **THEN** el sistema le indica que no tiene permisos, sin mandarlo a iniciar sesión
