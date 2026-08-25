## MODIFIED Requirements

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas registradas (no sobre la página o el filtro actual del listado): total de personas activas con sus avatares, **cobertura por stack**, y distribución por seniority. Los avatares del resumen SHALL usar el mismo color por persona que el listado.

La distribución por seniority SHALL pintar cada nivel con el mismo color con que el listado representa ese nivel — el vocabulario ordinal del sistema de diseño —, tanto en los segmentos de la barra como en los puntos de su leyenda, de modo que un solo código de color describa el nivel en toda la pantalla. El sistema NO SHALL definir localmente esos colores: los toma del sistema de diseño, y un cambio de matiz en la escala SHALL reflejarse en la card sin tocar el código de la aplicación.

La card de cobertura por stack SHALL contar los stacks distintos declarados por las personas del chapter y SHALL listar los que sólo una persona cubre, marcándolos como riesgo con el componente de estado del sistema de diseño.

Debajo de la distribución, la card SHALL mostrar dos lecturas calculadas de las mismas cifras: el porcentaje del total que está en el nivel Avanzado o superior, y cuántas personas están en el nivel que requiere acompañamiento (Principiante) — de modo que el estado general del equipo se lea de un vistazo sin sumar mentalmente la leyenda.

#### Scenario: Encabezado del módulo
- **WHEN** el Chapter Lead abre la pantalla de Personas
- **THEN** el sistema muestra el título "Personas", su descripción, y el botón para dar de alta una persona

#### Scenario: Resumen de personas activas
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra el total de personas registradas junto con los avatares de algunas de ellas

#### Scenario: Un mismo color en las dos vistas
- **WHEN** una persona aparece tanto en los avatares del resumen como en una fila del listado
- **THEN** su avatar se muestra con el mismo color en ambos lugares

#### Scenario: Resumen de FTE disponible
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra cuántos stacks distintos cubre el chapter (sobre todas las personas) y, con el rol de color de advertencia, cuántos y cuáles dependen de una sola persona; sin stacks en riesgo lo dice en rol neutro

#### Scenario: Distribución por seniority
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra cuántas personas hay en cada uno de los 4 niveles de seniority del catálogo

#### Scenario: Lectura de avanzado o superior
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra el porcentaje del total que está en Avanzado o Experto, calculado sobre las mismas cifras que muestra la distribución

#### Scenario: Lectura de acompañamiento
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra cuántas personas están en el nivel Principiante, presentadas como las que requieren acompañamiento

#### Scenario: El nivel viste el mismo color en la card y en el listado
- **WHEN** el Chapter Lead compara el segmento o el punto de leyenda de un nivel en la card de distribución con el medidor de ese mismo nivel en una fila del listado
- **THEN** ambos usan el mismo matiz del vocabulario ordinal del sistema de diseño, sin que la pantalla tenga dos códigos de color para el mismo dato

#### Scenario: Un cambio de matiz en la escala llega solo
- **WHEN** el sistema de diseño cambia el matiz de un nivel de la escala ordinal
- **THEN** la card de distribución refleja el matiz nuevo con la sola actualización del paquete, sin que se modifique el código de la aplicación

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos

### Requirement: Listar personas
El sistema SHALL mostrar un listado paginado de las personas registradas, con al menos avatar, nombre, correo corporativo, cargo, seniority, stacks y modalidad visibles por fila (el rol no se muestra en el listado: vive en el formulario y en el detalle), y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa persona. El avatar SHALL mostrar las iniciales de la persona (primera letra del primer nombre y primera letra del primer apellido, derivadas del nombre completo) sobre un color propio de esa persona, estable en el tiempo y entre pantallas. El correo corporativo SHALL mostrarse bajo el nombre, con menor jerarquía visual que éste. El seniority SHALL mostrarse con el nombre de su nivel en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin mostrar el número del nivel.

El nombre SHALL ser un enlace a la pantalla de detalle de esa persona. Ese enlace NO SHALL mostrarse en el color de marca: SHALL tomar el color de texto neutro del listado, de modo que la primera columna no quede teñida por repetir un enlace destacado en cada fila. En reposo el nombre NO SHALL distinguirse del texto plano de la fila; SHALL revelar su condición de enlace al pasar el puntero sobre él y al recibir el foco por teclado. El sistema NO SHALL definir localmente el tratamiento visual del enlace: lo toma del componente de enlace del sistema de diseño, eligiendo su tono neutro.

El seniority SHALL mostrarse con el componente de nivel del sistema de diseño —el que presenta el nombre del nivel junto a un medidor de cuatro segmentos teñido según la posición del nivel en la escala— y NO SHALL mostrarse con el componente de estado que el sistema usa para comunicar la situación de un elemento. La representación SHALL ocupar la misma dimensión en todas las filas, cualquiera sea el nivel y tenga o no la persona un nivel asignado, de modo que los niveles de personas distintas queden comparables entre sí de un vistazo. El sistema NO SHALL definir localmente los colores, medidas ni segmentos de esa representación: los toma del componente del sistema de diseño.

Los **stacks** SHALL mostrarse con el componente de etiqueta categórica del sistema de diseño (no con el de estado): el principal primero, hasta tres por fila y un indicador "+N" con el resto; una persona sin stacks SHALL mostrar un guion neutro.

El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas), filtrar por seniority (selección múltiple) y filtrar por stack (selección múltiple: personas que tienen cualquiera de los stacks elegidos), todo combinable con la paginación; al cambiar la búsqueda o un filtro, el listado vuelve a la primera página.

Cada fila SHALL mostrar además el FTE disponible de la persona como número, y su utilización — el porcentaje de esa capacidad que sus asignaciones ocupan, calculado por el sistema y entregado en el contrato de la persona — como una barra pequeña acompañada del porcentaje en texto. La barra SHALL colorear por estado con los roles semánticos del sistema: sin relleno en 0%, el rol de éxito entre 1% y 99%, el rol de advertencia exactamente en 100% y el rol de peligro por encima de 100%, de modo que quién está al tope o sobrecargado se distinga de un vistazo sin leer los números. El listado NO SHALL permitir editar el FTE ni la utilización: la edición del FTE sigue en el formulario de la persona y las asignaciones en su propia pantalla.

#### Scenario: Stacks en la fila
- **WHEN** una persona tiene cinco stacks con ".NET" como principal
- **THEN** la fila muestra ".NET" primero, dos más y "+2", como etiquetas categóricas y no como estados

#### Scenario: Filtrar por stack
- **WHEN** el Chapter Lead elige "Azure" y "MuleSoft" en el filtro de stack
- **THEN** el listado muestra sólo las personas que tienen alguno de los dos, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada persona de esa página, su avatar con iniciales, nombre, correo corporativo, cargo, seniority, stacks y modalidad, junto con el total de personas y la navegación entre páginas

#### Scenario: Presentación del seniority en la fila
- **WHEN** el sistema muestra la fila de una persona con seniority "Avanzado"
- **THEN** la celda de seniority presenta el nombre del nivel junto a su medidor de cuatro segmentos, con tres de ellos llenos, y no como una etiqueta de estado

#### Scenario: Los niveles se comparan entre filas
- **WHEN** el listado muestra personas de niveles distintos en filas sucesivas
- **THEN** todas las representaciones de seniority ocupan el mismo ancho y sus medidores quedan alineados, de modo que la diferencia de nivel se lee sin leer las etiquetas

#### Scenario: El seniority no comparte vocabulario con el estado
- **WHEN** una fila muestra a la vez el seniority de la persona y algún dato suyo que sí es un estado
- **THEN** cada uno usa un componente distinto, sin que dos elementos de naturaleza distinta compartan la misma forma en la misma fila

#### Scenario: Una persona sin nivel asignado no desalinea la columna
- **WHEN** el listado muestra una persona cuyo seniority no pertenece a la escala o no está asignado
- **THEN** su celda muestra el estado vacío que define el componente, con la misma dimensión que las demás

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Personas y no existe ninguna persona registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera persona, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las personas falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de personas
- **THEN** el sistema muestra las personas correspondientes a esa página, sin recargar toda la aplicación

#### Scenario: Menú de acciones por fila
- **WHEN** el Chapter Lead abre el menú de acciones de una fila del listado
- **THEN** el sistema muestra las opciones para editar o eliminar esa persona

#### Scenario: Iniciales del avatar
- **WHEN** el sistema muestra el avatar de una persona cuyo nombre completo es "María González"
- **THEN** el avatar muestra las iniciales "MG" (primera letra del primer nombre y primera letra del primer apellido, en mayúsculas)

#### Scenario: Color propio de cada persona
- **WHEN** el Chapter Lead ve el avatar de una persona
- **THEN** el avatar se muestra con un color tomado del vocabulario de color de identidad, y dos personas distintas del listado tienden a recibir colores distintos

#### Scenario: El color no cambia
- **WHEN** el Chapter Lead vuelve a abrir el listado en otra sesión, o ve a la misma persona en otra pantalla, o esa persona cambia de nombre, de cargo o de seniority
- **THEN** el avatar de esa persona conserva el mismo color que tenía antes

#### Scenario: Buscar por nombre o cargo
- **WHEN** el Chapter Lead escribe un texto en el buscador del listado de Personas
- **THEN** el sistema muestra solo las personas cuyo nombre o cargo contiene ese texto (sin distinguir mayúsculas), junto con el total y la paginación recalculados sobre ese subconjunto

#### Scenario: Filtrar por seniority
- **WHEN** el Chapter Lead selecciona uno o más valores en el filtro de Seniority
- **THEN** el sistema muestra solo las personas cuyo seniority está entre los valores seleccionados, junto con el total y la paginación recalculados sobre ese subconjunto

#### Scenario: Filtrar por nivel SFIA
- **WHEN** el Chapter Lead busca el filtro de "Nivel SFIA" que existía como campo separado antes de este cambio
- **THEN** encuentra el mismo filtro bajo el nombre "Seniority" — ambos campos se fusionaron en uno solo (ver el escenario "Filtrar por seniority" de este mismo requisito) y "Nivel SFIA" ya no existe como filtro propio

#### Scenario: Combinar búsqueda y filtros
- **WHEN** el Chapter Lead tiene texto en el buscador y el filtro de seniority activo al mismo tiempo
- **THEN** el sistema muestra solo las personas que cumplen la búsqueda y el filtro a la vez

#### Scenario: Búsqueda o filtro sin resultados
- **WHEN** la búsqueda o el filtro activo no encuentra ninguna persona, pero sí existen personas registradas en el sistema
- **THEN** el sistema muestra un mensaje de "sin resultados" que invita a ajustar la búsqueda o el filtro, distinto del estado vacío que invita a crear la primera persona

#### Scenario: Ir al detalle de una persona
- **WHEN** el Chapter Lead hace clic en el nombre de una persona del listado
- **THEN** el sistema navega a la dirección del detalle de esa persona, identificada por su id

#### Scenario: El nombre no lleva el color de marca
- **WHEN** el Chapter Lead ve el listado de Personas
- **THEN** los nombres se muestran en el color de texto neutro del listado, sin el rojo de marca, y la primera columna no se distingue del resto de la tabla por su color

#### Scenario: El nombre se revela como enlace al interactuar
- **WHEN** el Chapter Lead pasa el puntero sobre el nombre de una persona, o lo alcanza con el teclado
- **THEN** el nombre muestra un subrayado y, al llegar por teclado, un indicador de foco visible, de modo que se reconoce como navegable antes de hacer clic

#### Scenario: El nombre no se distingue en reposo
- **WHEN** el Chapter Lead ve una fila del listado sin puntero encima y sin foco
- **THEN** el nombre se ve igual que el texto plano de las demás columnas — es la contrapartida aceptada de quitarle el color de marca — y sigue siendo alcanzable con el teclado y anunciado como enlace por un lector de pantalla

#### Scenario: Abrir el detalle en otra pestaña
- **WHEN** el Chapter Lead hace clic con el botón central del mouse, o con la tecla modificadora de su sistema, sobre el nombre de una persona
- **THEN** el navegador abre el detalle de esa persona en otra pestaña, sin perder la página del listado en la que estaba

#### Scenario: El detalle todavía no existe
- **WHEN** el Chapter Lead abre el enlace de una persona antes de que la pantalla de detalle esté construida
- **THEN** el sistema muestra su pantalla de "no encontrado", sin errores de consola ni una pantalla en blanco

#### Scenario: Columna de FTE
- **WHEN** el Chapter Lead ve la fila de una persona con FTE disponible 0.8
- **THEN** la columna de FTE muestra 0.8 como número, sin control de edición

#### Scenario: Barra de utilización con su porcentaje
- **WHEN** el Chapter Lead ve la fila de una persona con utilización 40%
- **THEN** la celda de utilización muestra una barra rellena en proporción al porcentaje y el texto "40%" junto a ella

#### Scenario: Umbrales de estado de la utilización
- **WHEN** el listado muestra personas con utilización 0%, 60%, 100% y 120%
- **THEN** la barra de 0% queda sin relleno, la de 60% usa el rol de éxito, la de 100% el rol de advertencia y la de 120% el rol de peligro, saturada al ancho completo

#### Scenario: Una persona recién creada arranca sin utilización
- **WHEN** el Chapter Lead crea una persona y el listado se actualiza
- **THEN** su fila muestra la utilización en 0%, porque todavía no tiene asignaciones

### Requirement: Detalle de persona
El sistema SHALL exponer una página de detalle por persona en `/app/lead/personas/:id`, accesible desde el nombre de la persona en el listado, con la entrada "Personas" activa en la navegación lateral y el breadcrumb `Plataforma / Gestionar Personas / <nombre de la persona>`. La página SHALL tener la misma anatomía que el detalle de célula: un enlace de vuelta al listado, un encabezado, tres indicadores y dos columnas de paneles.

Cada dato de la persona SHALL aparecer una sola vez en la página. El **encabezado** SHALL mostrar el avatar (mismas iniciales y color que en el listado), el nombre, el seniority con el medidor de nivel del sistema de diseño seguido de su nivel SFIA ("Avanzado · SFIA 3"), la vinculación ("Interna" o "Externa · <proveedor>"), la marca de estado "Sin célula" cuando la persona no tiene asignación, y debajo el cargo y el rol, la modalidad en español (Remoto, Híbrido, Presencial), el correo corporativo y el estado de su identidad DevOps ("DevOps vinculado" o "Sin identidad DevOps", este último con el rol de color de peligro). Ninguno de esos datos SHALL repetirse en la ficha.

Las **acciones** del encabezado SHALL ser: *Editar persona* (mismo formulario y validaciones que el listado), la acción primaria de capacidad —*Reasignar* cuando tiene célula, *Asignar a una célula* cuando no— que abre el mismo drawer de reasignación de la Torre de control con la misma semántica (asignar = crear, subir = editar, mover = quitar y crear), y un menú con *Eliminar* (mismo diálogo de confirmación que el listado; tras eliminar, el sistema vuelve al listado). Tras asignar, reasignar, quitar o editar, el detalle SHALL refrescarse sin recargar la aplicación.

Los **tres indicadores** SHALL ser: **Asignado vs real** (FTE asignado sobre FTE disponible declarado, el FTE real del último sprint validado y la diferencia en puntos con el asignado, o "Sin sprints reportados" si no hay); **Reporte de horas del sprint actual** (horas reportadas sobre las horas del sprint, si cae dentro del rango de tolerancia, el reparto en horas BAU / Iniciativa / Libre como barra segmentada, el estado del reporte, y el botón **Validar** sólo cuando el estado es "Por validar"; "No aplica · sin célula no reporta" para una persona sin célula); y **Trabajo en DevOps** (items activos con su desglose iniciativa / BAU y los pendientes de curación, con enlace a la bandeja; o, sin identidad vinculada, "Sus items no cuentan" con la acción *Vincular identidad*).

El panel **Asignación** SHALL mostrar la célula (enlace a su detalle), su criticidad en español con el mismo componente y rol de color que el listado de Células, la tribu, los nombres de los compañeros, desde cuándo está asignada, el porcentaje de dedicación con la barra segmentada BAU / Transformación y lo libre en porcentaje y FTE, dos señales —el nivel SFIA frente al requerido por la célula para su capacidad (acorde en rol de éxito, insuficiente en rol de advertencia) y si reporta más horas que lo asignado en los últimos sprints— y las acciones *Subir dedicación*, *Mover a otra célula* y *Quitar de la célula*, que abren el drawer de reasignación en el modo correspondiente (quitar, con el diálogo de confirmación de asignaciones). Sin célula, el panel SHALL mostrar el estado vacío con el tiempo que lleva disponible y la lista de células que piden la capacidad de esa persona (nombre, por qué la piden, SFIA requerido, FTE asignado sobre disponible) con la acción *Asignar acá*, que abre el drawer con esa célula preseleccionada.

El panel **Horas por sprint** SHALL mostrar, para los últimos seis sprints, una barra apilada por sprint con las horas BAU e Iniciativa (sin las libres), la etiqueta del sprint y sus horas, el sprint aún no validado atenuado, y una línea de referencia con las horas que corresponden a la dedicación asignada; sin sprints reportados SHALL mostrar el estado vacío.

El panel **Stacks** SHALL listar los stacks de la persona con su nivel en la escala Tuya (el medidor de nivel del sistema de diseño y el nombre del nivel), cuál es el principal (marca de estado neutra), quiénes más del chapter lo cubren (avatares agrupados y la cuenta) y la marca **Bus factor 1** con rol de peligro cuando nadie más lo cubre; su acción **Editar** SHALL abrir el drawer de edición de stacks. Sin stacks, el panel SHALL mostrar un estado vacío con la acción de agregar.

El panel **Ficha** SHALL mostrar: chapter y su Chapter Lead; fecha de ingreso con la antigüedad; FTE disponible declarado; costo mensual con la lectura de concordancia con el seniority ("en rango para <nivel>" en rol de éxito, "alto para <nivel>" o "bajo para <nivel>" en rol de advertencia); proveedor y vigencia del contrato sólo para externas; documento; identidad DevOps vinculada y cuándo, o "Sin vincular" en rol de peligro.

Con un id inexistente, el sistema SHALL mostrar un estado de error con un enlace de vuelta al listado. Mientras carga SHALL mostrar un estado de carga sin desplazar la estructura.

#### Scenario: Abrir el detalle desde el listado
- **WHEN** el Chapter Lead hace clic en el nombre de una persona en el listado
- **THEN** el sistema navega al detalle sin recargar la aplicación, la entrada "Personas" sigue activa en la navegación y el breadcrumb muestra "Gestionar Personas" seguido del nombre de la persona

#### Scenario: Encabezado de una persona con célula
- **WHEN** se abre el detalle de una persona interna, híbrida, de nivel Avanzado, con identidad DevOps vinculada y asignada a una célula
- **THEN** el encabezado muestra su avatar, nombre, "Avanzado · SFIA 3" con el medidor de tres segmentos llenos, "Interna", cargo y rol, "Híbrido", su correo y "DevOps vinculado"; no muestra "Sin célula"; la acción primaria es "Reasignar"

#### Scenario: Encabezado de una persona sin célula
- **WHEN** se abre el detalle de una persona externa sin asignación y sin identidad DevOps
- **THEN** el encabezado muestra "Externa · <proveedor>", la marca "Sin célula" y "Sin identidad DevOps" en rol de peligro; la acción primaria es "Asignar a una célula"

#### Scenario: Ningún dato se repite
- **WHEN** se muestra el detalle de cualquier persona
- **THEN** el correo, el cargo, el rol, el seniority, la modalidad y la vinculación aparecen sólo en el encabezado y no en la ficha, y la célula, la dedicación y el mix BAU / Transformación aparecen sólo en el panel Asignación

#### Scenario: Reporte del sprint por validar
- **WHEN** el reporte de horas del sprint actual de la persona está en estado "Por validar"
- **THEN** el indicador muestra las horas reportadas sobre las del sprint, si está dentro del rango de tolerancia, la barra BAU / Iniciativa / Libre y el botón "Validar"; al validar, el estado pasa a "Validado", el botón desaparece y el indicador "Asignado vs real" se recalcula con ese sprint

#### Scenario: Persona sin identidad DevOps
- **WHEN** la persona no tiene identidad DevOps vinculada
- **THEN** el indicador de DevOps dice que sus items no cuentan y ofrece "Vincular identidad"; al vincular, el encabezado pasa a "DevOps vinculado" y el indicador muestra sus items

#### Scenario: Señales de la asignación
- **WHEN** el SFIA de la persona es menor al requerido por su célula para su capacidad, o sus horas validadas superan lo asignado en tres sprints seguidos
- **THEN** el panel Asignación muestra la señal correspondiente en rol de advertencia; cuando el SFIA es igual o mayor, la muestra en rol de éxito

#### Scenario: Reasignar desde el detalle
- **WHEN** el Chapter Lead usa "Mover a otra célula", "Subir dedicación" o "Reasignar" y confirma un plan válido
- **THEN** el sistema aplica el cambio con la misma semántica que la Torre de control, muestra la confirmación y el detalle se refresca con la nueva célula o dedicación sin recargar la aplicación

#### Scenario: Asignar a una persona sin célula desde una célula sugerida
- **WHEN** el Chapter Lead hace clic en "Asignar acá" sobre una de las células que piden su capacidad
- **THEN** el drawer de asignación se abre con esa célula ya elegida como destino

#### Scenario: Quitar de la célula
- **WHEN** el Chapter Lead elige "Quitar de la célula" y confirma
- **THEN** la asignación se elimina, el encabezado pasa a "Sin célula", la acción primaria a "Asignar a una célula" y el panel Asignación a su estado vacío

#### Scenario: Capacidad con bus factor 1
- **WHEN** la persona tiene un stack que nadie más del chapter cubre
- **THEN** ese stack muestra la marca "Bus factor 1" en rol de peligro y la leyenda "Nadie más en el chapter lo cubre"; los demás muestran los avatares de quienes lo cubren y la cuenta

#### Scenario: Editar stacks desde el detalle
- **WHEN** el Chapter Lead sigue "Editar" en el panel Stacks
- **THEN** se abre el drawer de edición con los stacks actuales de la persona, sus niveles y el principal

#### Scenario: Persona inexistente
- **WHEN** se abre el detalle con un id que no existe
- **THEN** el sistema muestra un estado de error con un enlace de vuelta al listado de Personas

#### Scenario: Eliminar desde el detalle
- **WHEN** el Chapter Lead elimina la persona desde el menú del encabezado y confirma
- **THEN** el sistema elimina la persona y vuelve al listado de Personas

## ADDED Requirements

### Requirement: Editar los stacks de una persona
El sistema SHALL permitir editar los stacks de una persona desde su detalle, en un drawer lateral con el mismo esqueleto que los demás formularios: una sección para **agregar** stacks del catálogo del chapter con un selector de búsqueda de selección múltiple; la lista de **sus stacks**, cada uno con su **nivel** elegible entre los cuatro de la escala Tuya como control segmentado y una acción para **quitarlo**; un selector de **stack principal** (uno solo, obligatorio si hay al menos un stack); y **Guardar** como única acción primaria. Al quitar un stack que ninguna otra persona del chapter cubre, el sistema SHALL avisarlo en rol de advertencia antes de guardar, sin impedirlo. Al guardar, el detalle y el listado SHALL reflejar los cambios sin recargar la aplicación, y el resumen de cobertura por stack SHALL recalcularse.

#### Scenario: Agregar un stack y fijar su nivel
- **WHEN** el Chapter Lead agrega "React Native" desde el catálogo, lo deja en Competente y guarda
- **THEN** la persona queda con ese stack y nivel, el panel Stacks del detalle lo muestra y aparece en su fila del listado

#### Scenario: Cambiar el principal
- **WHEN** el Chapter Lead elige "Azure" como stack principal y guarda
- **THEN** "Azure" queda marcado como principal y es el primero en la fila del listado

#### Scenario: Quitar el único stack que cubre
- **WHEN** el Chapter Lead quita un stack que nadie más del chapter tiene
- **THEN** el drawer avisa que el chapter quedará sin cobertura de ese stack; al guardar, la cobertura por stack del resumen lo refleja

#### Scenario: Principal obligatorio
- **WHEN** la persona tiene stacks y ninguno está marcado como principal al guardar
- **THEN** el drawer señala el selector de principal y no guarda

#### Scenario: Error del servidor al guardar
- **WHEN** el guardado falla
- **THEN** el drawer muestra el error y conserva lo editado
