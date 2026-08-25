## MODIFIED Requirements

### Requirement: Detalle de persona
El sistema SHALL exponer una página de detalle por persona en `/app/lead/personas/:id`, accesible desde el nombre de la persona en el listado, con la entrada "Personas" activa en la navegación lateral y el breadcrumb `Plataforma / Gestionar Personas / <nombre de la persona>`. La página SHALL tener la misma anatomía que el detalle de célula: un enlace de vuelta al listado, un encabezado, tres indicadores y dos columnas de paneles.

Cada dato de la persona SHALL aparecer una sola vez en la página. El **encabezado** SHALL mostrar el avatar (mismas iniciales y color que en el listado), el nombre, el seniority con el medidor de nivel del sistema de diseño seguido de su nivel SFIA ("Avanzado · SFIA 3"), la vinculación ("Interna" o "Externa · <proveedor>"), la marca de estado "Sin célula" cuando la persona no tiene asignación, y debajo el cargo y el rol, la modalidad en español (Remoto, Híbrido, Presencial), el correo corporativo y el estado de su identidad DevOps ("DevOps vinculado" o "Sin identidad DevOps", este último con el rol de color de peligro). Ninguno de esos datos SHALL repetirse en la ficha.

Las **acciones** del encabezado SHALL ser: *Editar persona* (mismo formulario y validaciones que el listado), la acción primaria de capacidad —*Reasignar* cuando tiene célula, *Asignar a una célula* cuando no— que abre el mismo drawer de reasignación de la Torre de control con la misma semántica (asignar = crear, subir = editar, mover = quitar y crear), y un menú con *Eliminar* (mismo diálogo de confirmación que el listado; tras eliminar, el sistema vuelve al listado). Tras asignar, reasignar, quitar o editar, el detalle SHALL refrescarse sin recargar la aplicación.

Los **tres indicadores** SHALL ser: **Asignado vs real** (FTE asignado sobre FTE disponible declarado, el FTE real del último sprint validado y la diferencia en puntos con el asignado, o "Sin sprints reportados" si no hay); **Reporte de horas del sprint actual** (horas reportadas sobre las horas del sprint, si cae dentro del rango de tolerancia, el reparto en horas BAU / Iniciativa / Libre como barra segmentada, el estado del reporte, y el botón **Validar** sólo cuando el estado es "Por validar"; "No aplica · sin célula no reporta" para una persona sin célula); y **Trabajo en DevOps** (items activos con su desglose iniciativa / BAU y los pendientes de curación, con enlace a la cola del Backlog filtrada por esa persona (`/app/lead/backlog?persona=<id>`); o, sin identidad vinculada, "Sus items no cuentan" con la acción *Vincular identidad*).

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
