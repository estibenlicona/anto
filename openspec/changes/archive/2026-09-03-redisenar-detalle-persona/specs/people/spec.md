## MODIFIED Requirements

### Requirement: Detalle de persona
El sistema SHALL exponer una página de detalle por persona en `/app/lead/personas/:id`, accesible desde el nombre de la persona en el listado, con la entrada "Personas" activa en la navegación lateral y el breadcrumb `Plataforma / Gestionar Personas / <nombre de la persona>`. La página SHALL ser el **perfil profesional** de la persona y SHALL NOT mostrar nada de su asignación: ni célula, ni dedicación, ni mix BAU / Transformación, ni FTE declarado o libre, ni células que pidan su capacidad — la asignación se gestiona en la Torre de control y en Células.

El **encabezado** SHALL ser mínimo: el avatar (mismas iniciales y color que el listado), el nombre, y debajo una sola línea con el cargo y el **stack principal** como chip. SHALL NOT llevar enlace de vuelta (el breadcrumb navega), ni seniority, ni vinculación, ni modalidad, ni correo, ni estado DevOps, ni marca "Sin célula". Las **acciones** SHALL ser exactamente dos: **Editar** (la primaria; mismo formulario y validaciones que el listado) y **Competencias** (sutil; navega al plan de la persona en el módulo Competencias). SHALL NOT haber acción de reasignar, evaluar ni menú con eliminar (eliminar sigue disponible en el listado).

El cuerpo SHALL ser dos columnas: la **columna protagonista** (dos tercios) con los paneles Perfil y Stacks, y la **barra lateral** (un tercio) con dos punteros compactos seguidos de Perfil evaluado y Plan de desarrollo.

El panel **Perfil** ("lo administrativo") SHALL mostrar, una fila por dato: **Nivel** — el nombre del nivel en la escala de cuatro (Principiante, Competente, Avanzado, Experto), sin número SFIA —, **Modalidad**, **Vinculación** ("Interna", o "Externa · <proveedor>"), **Correo** (en monoespaciada), **Identidad DevOps** ("Vinculada" con punto de éxito, o "Sin vincular" en rol de peligro), **Líder de expertise** —el nombre de la persona que la tiene a cargo, no la unidad—, **Línea de expertise** —a qué línea pertenece, a secas—, **Ingreso**, y **Costo mensual** (la cifra formateada, sin lectura de concordancia). Su acción **Editar** SHALL abrir el mismo formulario de edición. Cada dato SHALL aparecer una sola vez en la página.

El panel **Stacks** SHALL listar los stacks de la persona, cada uno con su nombre y el medidor de nivel del sistema de diseño (sin el nombre del nivel en texto), mostrando **las primeras cinco filas** y, cuando hay más, la acción *Ver N más* que revela el resto (*Ver menos* lo repliega); su acción **Editar** SHALL abrir el drawer de edición de stacks. Sin stacks, el panel SHALL mostrar un estado vacío con la acción de agregar. La página SHALL NOT tener un panel de capacidades con niveles SFIA.

Los **punteros compactos** SHALL tener la misma anatomía —rótulo, enlace *Ver*, un badge y un dato— y SHALL traer el resumen ya resuelto por su módulo, sin recalcular nada:
- **Competencias**: el badge con las brechas abiertas ("N brechas abiertas" en rol de advertencia, o "Sin brechas" en rol de éxito) y la fecha de la última evaluación; *Ver* navega al plan de la persona.
- **Capacidad en el sprint**: el badge con la señal de balance del sprint en curso —una de las cuatro de la capability `real-dedication`, con su rol de color— y "N de 6 señales · <sprint> · <estado>"; *Ver* navega a `/app/lead/dedicacion/<id>`. Sin sprint en curso, "Sin sprint en curso". Sin identidad vinculada, el estado "Sus items no cuentan" con la acción *Vincular con Azure DevOps* (siempre disponible, abre el drawer de vinculación por correo). SHALL NOT mostrar SP, medianas, barras de demanda, capacidad en horas, tolerancias ni foco.

El panel **Perfil evaluado** SHALL listar las habilidades de la última evaluación: nombre, "<nivel> · su cargo pide <nivel requerido>", el medidor de nivel con la **marca** de lo que pide el cargo, y el badge **Brecha** (advertencia) o **Cumple** (éxito), truncando con la misma regla que Stacks: **las primeras cinco filas** y *Ver N más* para el resto. Su acción *Ver evaluación* SHALL navegar al módulo Competencias. El panel **Plan de desarrollo** SHALL listar las acciones acordadas: título, la habilidad de origen con el objetivo y el compromiso, y el badge de estado (*En curso* / *Cumplida*); su acción *Agregar acción* SHALL navegar al módulo Competencias. Ambos paneles SHALL ser de sólo lectura en el detalle: evaluar, agregar y marcar acciones se hace en Competencias. Sin evaluación, ambos SHALL mostrar un estado vacío que invite a evaluar desde Competencias.

Con un id inexistente, el sistema SHALL mostrar un estado de error con un enlace de vuelta al listado. Mientras carga SHALL mostrar un estado de carga sin desplazar la estructura. Tras editar la persona, editar stacks o vincular la identidad, el detalle SHALL refrescarse sin recargar la aplicación.

#### Scenario: Ir a la bandeja desde el detalle
- **WHEN** el Chapter Lead sigue el enlace "Ver" del puntero Capacidad en el sprint
- **THEN** el sistema abre el dashboard de balance de ese colaborador en `/app/lead/dedicacion/<id>` con el sprint en curso elegido

#### Scenario: Abrir el detalle desde el listado
- **WHEN** el Chapter Lead hace clic en el nombre de una persona en el listado
- **THEN** el sistema navega al detalle sin recargar la aplicación, la entrada "Personas" sigue activa en la navegación y el breadcrumb muestra "Gestionar Personas" seguido del nombre de la persona

#### Scenario: Encabezado de una persona con célula
- **WHEN** se abre el detalle de una persona asignada a una célula
- **THEN** el encabezado muestra avatar, nombre, cargo y el chip de su stack principal, con las acciones "Editar" y "Competencias"; no menciona la célula ni la dedicación — el encabezado es idéntico al de una persona sin célula

#### Scenario: Encabezado de una persona sin célula
- **WHEN** se abre el detalle de una persona sin asignación
- **THEN** el encabezado no muestra ninguna marca "Sin célula" ni acción de asignar: la página no habla de asignación; la vinculación de la persona se lee en la fila Vinculación del Perfil

#### Scenario: Ningún dato se repite
- **WHEN** se muestra el detalle de cualquier persona
- **THEN** el nombre, el cargo y el stack principal aparecen sólo en el encabezado, y el nivel, la modalidad, la vinculación, el correo y la identidad DevOps aparecen sólo en el panel Perfil

#### Scenario: Sin registro de horas
- **WHEN** se abre el detalle de cualquier persona
- **THEN** no hay indicador de reporte de horas, ni botón "Validar", ni FTE real ni diferencia derivados de horas; tampoco hay indicador Asignado ni panel Asignación: del sprint sólo existe el puntero compacto de Capacidad

#### Scenario: Reporte del sprint por validar
- **WHEN** una persona con célula tiene trabajo en el sprint en curso
- **THEN** el detalle no ofrece ningún reporte que validar; lo trabajado se lee siguiendo el puntero de Capacidad hacia su dashboard

#### Scenario: Persona sin identidad DevOps
- **WHEN** la persona no tiene identidad DevOps vinculada
- **THEN** el puntero Capacidad en el sprint muestra "Sin vincular" en rol de peligro, "Sus items no cuentan" y la acción "Vincular con Azure DevOps" habilitada; al vincular desde el drawer, la fila Identidad DevOps del Perfil pasa a "Vinculada" y el puntero muestra la señal del sprint en curso — o su estado no evaluable mientras no haya histórico suficiente

#### Scenario: Lectura del sprint en la ficha
- **WHEN** se abre el detalle de una persona con identidad DevOps y un sprint en curso con señal calculada
- **THEN** el puntero Capacidad muestra el badge de la señal con su rol de color y "N de 6 señales · <sprint> · en curso", sin SP, sin barras y sin capacidad en horas; el detalle completo vive en el dashboard enlazado

#### Scenario: La ficha no ofrece un estado intermedio
- **WHEN** se abre el detalle de cualquier persona con identidad y sprint
- **THEN** el puntero muestra una de las cuatro señales de `real-dedication` —Posible sobreasignación, Posible subasignación, Carga habitual o No evaluable— y nunca "Revisar"

#### Scenario: Indicador no evaluable en la ficha
- **WHEN** la persona tiene identidad DevOps pero histórico insuficiente para evaluar el sprint
- **THEN** el puntero Capacidad muestra "No evaluable" como badge neutro con su motivo como dato, y conserva el enlace "Ver"

#### Scenario: Señales de la asignación
- **WHEN** se abre el detalle de una persona cuyo SFIA difiere del requerido por su célula
- **THEN** el detalle no muestra ninguna señal de asignación: esa lectura pertenece a Células y a la Torre de control

#### Scenario: Reasignar desde el detalle
- **WHEN** el Chapter Lead necesita asignar, subir dedicación o mover a la persona
- **THEN** el detalle no ofrece esas acciones: la reasignación se hace desde la Torre de control o el listado, con la misma semántica ya especificada

#### Scenario: Perfil evaluado en la ficha
- **WHEN** la persona tiene una evaluación con dos habilidades por debajo de lo requerido
- **THEN** el puntero Competencias dice "2 brechas abiertas" con la fecha de la evaluación, el panel Perfil evaluado muestra cada habilidad con su medidor, la marca de lo requerido y el badge Brecha o Cumple, y el panel Plan de desarrollo lista las acciones con su estado; "Ver", "Ver evaluación" y "Agregar acción" llevan al módulo Competencias

#### Scenario: Asignar a una persona sin célula desde una célula sugerida
- **WHEN** el Chapter Lead abre el detalle de una persona sin célula
- **THEN** el detalle no lista células que pidan su capacidad ni ofrece "Asignar acá": esas sugerencias y la asignación viven en la Torre de control y en Células

#### Scenario: Quitar de la célula
- **WHEN** el Chapter Lead necesita quitar a la persona de su célula
- **THEN** el detalle no ofrece esa acción: se hace desde la Torre de control o Células, con la semántica ya especificada

#### Scenario: Capacidad con bus factor 1
- **WHEN** la persona es la única del chapter que cubre un stack o una capacidad
- **THEN** el detalle no muestra ninguna marca de bus factor: esa lectura vive en el mapa del span del módulo Competencias

#### Scenario: Editar stacks desde el detalle
- **WHEN** el Chapter Lead usa "Editar" en el panel Stacks, agrega un stack y guarda
- **THEN** se abre el drawer de edición de stacks con las mismas validaciones de siempre y, al guardar, el panel refleja la lista nueva sin recargar la aplicación

#### Scenario: Persona inexistente
- **WHEN** se navega a `/app/lead/personas/<id inexistente>`
- **THEN** el sistema muestra un estado de error con un enlace de vuelta al listado, sin romper la aplicación

#### Scenario: Eliminar desde el detalle
- **WHEN** el Chapter Lead necesita eliminar a la persona
- **THEN** el detalle no ofrece esa acción: se elimina desde el listado, con el mismo diálogo de confirmación ya especificado

#### Scenario: Nivel en la escala de cuatro
- **WHEN** se abre el detalle de una persona de nivel Experto
- **THEN** la fila Nivel del Perfil dice "Experto" — un nombre de la escala Principiante, Competente, Avanzado, Experto — y ningún lugar de la página muestra un número SFIA
