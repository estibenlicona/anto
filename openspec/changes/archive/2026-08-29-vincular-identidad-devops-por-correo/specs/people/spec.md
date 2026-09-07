## ADDED Requirements

### Requirement: Vincular identidad DevOps por correo
El sistema SHALL permitir vincular a una persona con su usuario de Azure DevOps desde su detalle, en un drawer lateral con el mismo esqueleto que los demás paneles del detalle: el nombre de la persona como antetítulo, el título *Vincular con Azure DevOps*, la nota de que una identidad sólo puede vincularse a una persona, y el cierre. El drawer SHALL abrirse desde la acción *Vincular con Azure DevOps* del indicador *Trabajo en DevOps*, que SHALL estar disponible siempre que la persona no tenga identidad vinculada, sin depender de que exista ninguna coincidencia previa.

El drawer SHALL tener un único campo, **Correo corporativo**, obligatorio, prellenado con el correo corporativo de la persona y editable, y la acción **Buscar**, que también SHALL dispararse con `Enter` en el campo. Buscar SHALL consultar Azure DevOps por ese correo y, mientras responde, SHALL deshabilitar la acción e indicar que está buscando. Con un correo que no tiene forma de correo, el sistema SHALL marcar el campo y no consultar.

Con una coincidencia, el drawer SHALL mostrar el usuario encontrado: su avatar (o sus iniciales si no hay imagen), nombre para mostrar, correo e identificador, la marca "Coincide" en rol de éxito, y sus proyectos, equipos y tableros como listas de etiquetas. Sin coincidencia, SHALL mostrar un aviso en rol de advertencia que nombre el correo buscado y no ofrezca vincular. Si la consulta falla, SHALL mostrar el error en rol de peligro y permitir reintentar. Cambiar el correo después de una búsqueda SHALL descartar el resultado anterior: la acción **Vincular** SHALL estar habilitada únicamente mientras hay un usuario encontrado para el correo que se ve en el campo.

**Vincular** SHALL ser la única acción primaria del drawer, junto a **Cancelar**. Al confirmar, el sistema SHALL guardar la relación entre la persona y el identificador del usuario de Azure DevOps encontrado; con éxito, SHALL cerrar el drawer, confirmar con un toast "Identidad vinculada" y refrescar el detalle sin recargar la aplicación: el encabezado pasa a "DevOps vinculado", el indicador *Trabajo en DevOps* muestra sus items y la fila *Identidad DevOps* de la ficha muestra el usuario y la fecha de vinculación. Si el servidor rechaza la vinculación —en particular porque ese usuario ya está vinculado a otra persona—, el drawer SHALL mostrar el mensaje del servidor y permanecer abierto. Cancelar o cerrar SHALL descartar lo buscado sin vincular nada.

#### Scenario: Abrir el drawer de vinculación
- **WHEN** el Líder de Expertise elige *Vincular con Azure DevOps* en el indicador de una persona sin identidad
- **THEN** se abre el drawer con el nombre de la persona como antetítulo, el campo de correo prellenado con su correo corporativo, sin resultado todavía y con *Vincular* deshabilitado

#### Scenario: Buscar y encontrar al usuario
- **WHEN** el Líder de Expertise busca un correo que corresponde a un usuario de Azure DevOps
- **THEN** el drawer muestra ese usuario —avatar o iniciales, nombre, correo, identificador y "Coincide"— con sus proyectos, equipos y tableros, y *Vincular* queda habilitado

#### Scenario: Correo sin usuario en Azure DevOps
- **WHEN** el Líder de Expertise busca un correo válido que ningún usuario de Azure DevOps tiene
- **THEN** el drawer muestra un aviso en rol de advertencia que nombra ese correo, no muestra ningún usuario y *Vincular* sigue deshabilitado

#### Scenario: Corregir el correo y volver a buscar
- **WHEN** el Líder de Expertise edita el correo después de una búsqueda —con o sin coincidencia— y vuelve a buscar
- **THEN** el resultado anterior desaparece al editar, *Vincular* se deshabilita, y la nueva búsqueda muestra el resultado del correo corregido

#### Scenario: Correo sin forma de correo
- **WHEN** el Líder de Expertise intenta buscar con el campo vacío o con un texto sin forma de correo
- **THEN** el campo se marca con el error y no se consulta Azure DevOps

#### Scenario: Error al consultar Azure DevOps
- **WHEN** la consulta a Azure DevOps falla por un error de red o del servidor
- **THEN** el drawer muestra el error en rol de peligro y deja volver a buscar; *Vincular* sigue deshabilitado

#### Scenario: Vincular con éxito
- **WHEN** el Líder de Expertise confirma *Vincular* con un usuario encontrado
- **THEN** el sistema guarda la relación con el identificador de ese usuario, cierra el drawer, muestra el toast "Identidad vinculada", y el detalle se refresca con "DevOps vinculado" en el encabezado, los items en el indicador y el usuario con la fecha de hoy en la fila *Identidad DevOps* de la ficha

#### Scenario: Usuario ya vinculado a otra persona
- **WHEN** el Líder de Expertise confirma *Vincular* y el servidor responde que ese usuario ya está vinculado a otra persona
- **THEN** el drawer muestra ese mensaje, nombrando a la otra persona, y permanece abierto con el resultado a la vista

#### Scenario: Cancelar la vinculación
- **WHEN** el Líder de Expertise cancela o cierra el drawer después de buscar
- **THEN** no se vincula nada y el detalle sigue mostrando "Sin identidad DevOps"

## MODIFIED Requirements

### Requirement: Detalle de persona
El sistema SHALL exponer una página de detalle por persona en `/app/lead/personas/:id`, accesible desde el nombre de la persona en el listado, con la entrada "Personas" activa en la navegación lateral y el breadcrumb `Plataforma / Gestionar Personas / <nombre de la persona>`. La página SHALL tener la misma anatomía que el detalle de célula: un enlace de vuelta al listado, un encabezado, tres indicadores y dos columnas de paneles.

Cada dato de la persona SHALL aparecer una sola vez en la página. El **encabezado** SHALL mostrar el avatar (mismas iniciales y color que en el listado), el nombre, el seniority con el medidor de nivel del sistema de diseño seguido de su nivel SFIA ("Avanzado · SFIA 3"), la vinculación ("Interna" o "Externa · <proveedor>"), la marca de estado "Sin célula" cuando la persona no tiene asignación, y debajo el cargo y el rol, la modalidad en español (Remoto, Híbrido, Presencial), el correo corporativo y el estado de su identidad DevOps ("DevOps vinculado" o "Sin identidad DevOps", este último con el rol de color de peligro). Ninguno de esos datos SHALL repetirse en la ficha.

Las **acciones** del encabezado SHALL ser: *Editar persona* (mismo formulario y validaciones que el listado), la acción primaria de capacidad —*Reasignar* cuando tiene célula, *Asignar a una célula* cuando no— que abre el mismo drawer de reasignación de la Torre de control con la misma semántica (asignar = crear, subir = editar, mover = quitar y crear), y un menú con *Eliminar* (mismo diálogo de confirmación que el listado; tras eliminar, el sistema vuelve al listado). Tras asignar, reasignar, quitar o editar, el detalle SHALL refrescarse sin recargar la aplicación.

Los **tres indicadores** SHALL ser: **Asignado vs real** (FTE asignado sobre FTE disponible declarado, el FTE real del último sprint validado y la diferencia en puntos con el asignado, o "Sin sprints reportados" si no hay); **Reporte de horas del sprint actual** (horas reportadas sobre las horas del sprint, si cae dentro del rango de tolerancia, el reparto en horas BAU / Iniciativa / Libre como barra segmentada, el estado del reporte, y el botón **Validar** sólo cuando el estado es "Por validar"; "No aplica · sin célula no reporta" para una persona sin célula); y **Trabajo en DevOps** (items activos con su desglose iniciativa / BAU y los pendientes de curación, con enlace a la cola del Backlog filtrada por esa persona (`/app/lead/backlog?persona=<id>`); o, sin identidad vinculada, "Sus items no cuentan" con la acción *Vincular con Azure DevOps*, siempre disponible, que abre el drawer de vinculación por correo).

El panel **Asignación** SHALL mostrar la célula (enlace a su detalle), su criticidad en español con el mismo componente y rol de color que el listado de Células, la tribu, los nombres de los compañeros, desde cuándo está asignada, el porcentaje de dedicación con la barra segmentada BAU / Transformación y lo libre en porcentaje y FTE, dos señales —el nivel SFIA frente al requerido por la célula para su capacidad (acorde en rol de éxito, insuficiente en rol de advertencia) y si reporta más horas que lo asignado en los últimos sprints— y las acciones *Subir dedicación*, *Mover a otra célula* y *Quitar de la célula*, que abren el drawer de reasignación en el modo correspondiente (quitar, con el diálogo de confirmación de asignaciones). Sin célula, el panel SHALL mostrar el estado vacío con el tiempo que lleva disponible y la lista de células que piden la capacidad de esa persona (nombre, por qué la piden, SFIA requerido, FTE asignado sobre disponible) con la acción *Asignar acá*, que abre el drawer con esa célula preseleccionada.

El panel **Horas por sprint** SHALL mostrar, para los últimos seis sprints, una barra apilada por sprint con las horas BAU e Iniciativa (sin las libres), la etiqueta del sprint y sus horas, el sprint aún no validado atenuado, y una línea de referencia con las horas que corresponden a la dedicación asignada; sin sprints reportados SHALL mostrar el estado vacío.

El panel **Capacidades que cubre** SHALL listar las capacidades de la persona con su nivel SFIA (medidor de cuatro segmentos y el número), cuál es la principal, cuántas personas más del chapter cubren cada una y la marca **Bus factor 1** con rol de peligro cuando nadie más la cubre.

El panel **Ficha** SHALL mostrar: chapter y su Chapter Lead; fecha de ingreso con la antigüedad; FTE disponible declarado; costo mensual con la lectura de concordancia con el seniority ("en rango para <nivel>" en rol de éxito, "alto para <nivel>" o "bajo para <nivel>" en rol de advertencia); proveedor y vigencia del contrato sólo para externas; documento; identidad DevOps vinculada y cuándo, o "Sin vincular" en rol de peligro.

Con un id inexistente, el sistema SHALL mostrar un estado de error con un enlace de vuelta al listado. Mientras carga SHALL mostrar un estado de carga sin desplazar la estructura.

El panel **Stacks** SHALL listar los stacks de la persona con su nivel en la escala Tuya (el medidor de nivel del sistema de diseño y el nombre del nivel), cuál es el principal (marca de estado neutra), quiénes más del chapter lo cubren (avatares agrupados y la cuenta) y la marca **Bus factor 1** con rol de peligro cuando nadie más lo cubre; su acción **Editar** SHALL abrir el drawer de edición de stacks. Sin stacks, el panel SHALL mostrar un estado vacío con la acción de agregar.

#### Scenario: Ir a la bandeja desde el detalle
- **WHEN** el Chapter Lead sigue el enlace "Ir a la bandeja" del indicador de DevOps
- **THEN** el sistema abre Backlog con la cola filtrada por esa persona

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
- **THEN** el indicador de DevOps dice que sus items no cuentan y ofrece "Vincular con Azure DevOps" habilitado, sin condición sobre coincidencias por nombre; al vincular desde el drawer, el encabezado pasa a "DevOps vinculado", el indicador muestra sus items y la ficha muestra el usuario y la fecha de vinculación

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
- **WHEN** la persona cubre una capacidad que nadie más del chapter cubre
- **THEN** esa capacidad muestra la marca "Bus factor 1" en rol de peligro y la leyenda "Nadie más en el chapter la cubre"

#### Scenario: Editar stacks desde el detalle
- **WHEN** el Chapter Lead sigue "Editar" en el panel Stacks
- **THEN** se abre el drawer de edición con los stacks actuales de la persona, sus niveles y el principal

#### Scenario: Persona inexistente
- **WHEN** se abre el detalle con un id que no existe
- **THEN** el sistema muestra un estado de error con un enlace de vuelta al listado de Personas

#### Scenario: Eliminar desde el detalle
- **WHEN** el Chapter Lead elimina la persona desde el menú del encabezado y confirma
- **THEN** el sistema elimina la persona y vuelve al listado de Personas
