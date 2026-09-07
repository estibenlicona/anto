## MODIFIED Requirements

### Requirement: Detalle de persona
El sistema SHALL exponer una página de detalle por persona en `/app/lead/personas/:id`, accesible desde el nombre de la persona en el listado, con la entrada "Personas" activa en la navegación lateral y el breadcrumb `Plataforma / Gestionar Personas / <nombre de la persona>`. La página SHALL tener la misma anatomía que el detalle de célula: un enlace de vuelta al listado, un encabezado, dos indicadores y dos columnas de paneles.

Cada dato de la persona SHALL aparecer una sola vez en la página. El **encabezado** SHALL mostrar el avatar (mismas iniciales y color que en el listado), el nombre, el seniority con el medidor de nivel del sistema de diseño seguido de su nivel SFIA ("Avanzado · SFIA 3"), la vinculación ("Interna" o "Externa · <proveedor>"), la marca de estado "Sin célula" cuando la persona no tiene asignación, y debajo el cargo y el rol, la modalidad en español (Remoto, Híbrido, Presencial), el correo corporativo y el estado de su identidad DevOps ("DevOps vinculado" o "Sin identidad DevOps", este último con el rol de color de peligro). Ninguno de esos datos SHALL repetirse en la ficha.

Las **acciones** del encabezado SHALL ser: *Editar persona* (mismo formulario y validaciones que el listado), la acción primaria de capacidad —*Reasignar* cuando tiene célula, *Asignar a una célula* cuando no— que abre el mismo drawer de reasignación de la Torre de control con la misma semántica (asignar = crear, subir = editar, mover = quitar y crear), y un menú con *Eliminar* (mismo diálogo de confirmación que el listado; tras eliminar, el sistema vuelve al listado). Tras asignar, reasignar, quitar o editar, el detalle SHALL refrescarse sin recargar la aplicación.

Los **dos indicadores** SHALL ser: **Asignado** (el FTE declarado en su asignación sobre el FTE contractual, la barra de dedicación y lo libre en FTE; "1.0 FTE libre" para una persona sin célula; rotulado como lo que la célula declara) y **Dedicación real** (para el sprint en curso: la **señal de balance** como marca de estado con su frase, los **SP comprometidos frente a su mediana histórica** ("28 SP · habitual 22"), la **capacidad** del sprint ("0.80 / 1.0 FTE disponible") y el enlace *Ver dedicación* a `/app/lead/dedicacion/<id>`; "No evaluable" con su motivo —sin sprint en Azure DevOps, o histórico insuficiente indicando cuántos sprints sellados hay— cuando corresponde; o, sin identidad vinculada, "Sus items no cuentan" con la acción *Vincular con Azure DevOps*, siempre disponible, que abre el drawer de vinculación por correo). El indicador *Dedicación real* SHALL usar las mismas reglas, umbrales y vocabulario de la capability `real-dedication`, y SHALL NOT mostrar FTE comprometido, FTE asignado como referencia de lectura, ni las lecturas "En línea", "Por encima" o "Por debajo". La página SHALL NOT mostrar horas reportadas, reporte del sprint, ni un FTE real ni una diferencia derivados de horas: la plataforma no registra horas, y el trabajo real se lee en los items de DevOps.

El panel **Asignación** SHALL mostrar la célula (enlace a su detalle), su criticidad en español con el mismo componente y rol de color que el listado de Células, la tribu, los nombres de los compañeros, desde cuándo está asignada, el porcentaje de dedicación con la barra segmentada BAU / Transformación y lo libre en porcentaje y FTE, la señal del nivel SFIA frente al requerido por la célula para su capacidad (acorde en rol de éxito, insuficiente en rol de advertencia), y las acciones *Subir dedicación*, *Mover a otra célula* y *Quitar de la célula*, que abren el drawer de reasignación en el modo correspondiente (quitar, con el diálogo de confirmación de asignaciones). Sin célula, el panel SHALL mostrar el estado vacío con el tiempo que lleva disponible y la lista de células que piden la capacidad de esa persona (nombre, por qué la piden, SFIA requerido, FTE asignado sobre disponible) con la acción *Asignar acá*, que abre el drawer con esa célula preseleccionada.

El panel **Capacidades que cubre** SHALL listar las capacidades de la persona con su nivel SFIA (medidor de cuatro segmentos y el número), cuál es la principal, cuántas personas más del chapter cubren cada una y la marca **Bus factor 1** con rol de peligro cuando nadie más la cubre.

El panel **Ficha** SHALL mostrar: chapter y su Chapter Lead; fecha de ingreso con la antigüedad; FTE contractual; costo mensual con la lectura de concordancia con el seniority ("en rango para <nivel>" en rol de éxito, "alto para <nivel>" o "bajo para <nivel>" en rol de advertencia); proveedor y vigencia del contrato sólo para externas; documento; identidad DevOps vinculada y cuándo, o "Sin vincular" en rol de peligro.

Con un id inexistente, el sistema SHALL mostrar un estado de error con un enlace de vuelta al listado. Mientras carga SHALL mostrar un estado de carga sin desplazar la estructura.

El panel **Stacks** SHALL listar los stacks de la persona con su nivel en la escala Tuya (el medidor de nivel del sistema de diseño y el nombre del nivel), cuál es el principal (marca de estado neutra), quiénes más del chapter lo cubren (avatares agrupados y la cuenta) y la marca **Bus factor 1** con rol de peligro cuando nadie más lo cubre; su acción **Editar** SHALL abrir el drawer de edición de stacks. Sin stacks, el panel SHALL mostrar un estado vacío con la acción de agregar.

#### Scenario: Ir a la bandeja desde el detalle
- **WHEN** el Chapter Lead sigue el enlace "Ver dedicación" del indicador Dedicación real
- **THEN** el sistema abre el dashboard de balance de ese colaborador en `/app/lead/dedicacion/<id>` con el sprint en curso elegido

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

#### Scenario: Sin registro de horas
- **WHEN** se abre el detalle de cualquier persona, con o sin célula
- **THEN** la página muestra exactamente dos indicadores, Asignado y Dedicación real; no hay indicador de reporte de horas, ni botón "Validar", ni panel "Horas por sprint", ni FTE real ni diferencia en puntos derivados de horas; el indicador Asignado muestra el FTE declarado en la asignación sobre el contractual y lo libre ("0.8 / 1.0 FTE asignado" con "0.2 FTE libre", o "0.0 / 1.0" con "1.0 FTE libre" sin célula), rotulado como lo que la célula declara

#### Scenario: Reporte del sprint por validar
- **WHEN** una persona con célula tiene trabajo en el sprint en curso
- **THEN** el detalle no ofrece ningún reporte de horas que validar: no existe el indicador de reporte, ni un estado "Por validar", ni el botón "Validar"; lo trabajado se lee en el indicador Dedicación real

#### Scenario: Persona sin identidad DevOps
- **WHEN** la persona no tiene identidad DevOps vinculada
- **THEN** el indicador de DevOps dice que sus items no cuentan y ofrece "Vincular con Azure DevOps" habilitado, sin condición sobre coincidencias por nombre; al vincular desde el drawer, el encabezado pasa a "DevOps vinculado", el indicador muestra la señal de balance del sprint en curso —o "No evaluable · histórico insuficiente" mientras no acumule los sprints sellados del mínimo configurado— y la ficha muestra el usuario y la fecha de vinculación

#### Scenario: Lectura del sprint en la ficha
- **WHEN** se abre el detalle de una persona con identidad DevOps, FTE contractual 1.0 y 0.80 disponible, que comprometió 28 SP en el sprint en curso contra una mediana histórica de 22 SP
- **THEN** el indicador Dedicación real muestra la señal de balance con su frase, "28 SP · habitual 22", "0.80 / 1.0 FTE disponible" y el enlace "Ver dedicación", sin FTE comprometido ni diferencia en FTE

#### Scenario: Indicador no evaluable en la ficha
- **WHEN** la persona tiene identidad DevOps pero sólo 2 sprints sellados y el mínimo configurado es 3
- **THEN** el indicador Dedicación real muestra "No evaluable" con el motivo y cuántos sprints sellados hay, sin inventar una señal, y conserva el enlace "Ver dedicación"

#### Scenario: Señales de la asignación
- **WHEN** el SFIA de la persona es menor al requerido por su célula para su capacidad
- **THEN** el panel Asignación muestra la señal en rol de advertencia; cuando el SFIA es igual o mayor, la muestra en rol de éxito; es la única señal del panel — no hay ninguna sobre horas reportadas

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
