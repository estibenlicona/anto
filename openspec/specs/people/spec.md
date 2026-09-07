## Purpose

La capacidad `people` permite al Chapter Lead consultar, crear, editar y eliminar las personas registradas en el sistema, como el maestro del que se deriva la capacidad disponible del chapter.

## Requirements

### Requirement: Resumen del módulo de Personas
El sistema SHALL mostrar, arriba del listado de Personas, un encabezado con el título del módulo, su descripción, el botón para dar de alta una persona, y un resumen de 3 indicadores sobre el total de personas **a cargo del Chapter Lead** (no sobre la página ni el filtro actual del listado, y no sobre todas las personas del sistema): total de personas activas con sus avatares, FTE disponible frente a la capacidad objetivo, y distribución por seniority. Los avatares del resumen SHALL usar el mismo color por persona que el listado.

La distribución por seniority SHALL contar por la escala de **Seniority** —Junior, Intermedio, Senior—, no por la escala de niveles: el Nivel (Principiante → Experto) se lee en la columna Nivel del listado y en Competencias. La barra y su leyenda SHALL pintar los tres escalones con el vocabulario ordinal del sistema de diseño recorrido de menor a mayor. El sistema NO SHALL definir localmente esos colores: los toma del sistema de diseño, y un cambio de matiz en la escala SHALL reflejarse en la card sin tocar el código de la aplicación.

La card SHALL abrir con una lectura calculada de las mismas cifras — el porcentaje del total que es Senior, con su frase ("4 de 13 en Senior") — y la leyenda SHALL llevar el conteo de cada escalón, de modo que cuántas personas son Junior (las que requieren acompañamiento) se lea directamente de la leyenda.

#### Scenario: Los indicadores cuentan sólo lo que el lead tiene a cargo
- **WHEN** el sistema registra personas de más de un chapter y el Chapter Lead abre la pantalla
- **THEN** los tres indicadores se calculan únicamente sobre las personas a su cargo, y no sobre el total del sistema

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
- **THEN** el sistema muestra el FTE disponible frente a la capacidad objetivo, con el porcentaje de capacidad asignada

#### Scenario: Distribución por seniority
- **WHEN** el Chapter Lead ve el resumen de Personas
- **THEN** el sistema muestra cuántas personas hay en cada uno de los tres seniorities del catálogo —Junior, Intermedio, Senior— y en ningún caso distribuye por los 4 niveles de la escala Tuya

#### Scenario: Lectura de avanzado o superior
- **WHEN** el Chapter Lead ve el pie de la card de distribución
- **THEN** encuentra el porcentaje del total que es Senior, calculado sobre las mismas cifras que muestra la distribución

#### Scenario: Lectura de acompañamiento
- **WHEN** el Chapter Lead busca cuántas personas requieren acompañamiento
- **THEN** el conteo de Junior se lee en la leyenda de la distribución, junto a su punto de acento

#### Scenario: El nivel viste el mismo color en la card y en el listado
- **WHEN** el Chapter Lead compara la card de distribución con la columna Nivel del listado
- **THEN** cada escala usa el vocabulario ordinal del sistema de diseño de forma consistente consigo misma: la card recorre los tres seniorities de menor a mayor y el medidor de Nivel sus cuatro escalones, sin colores definidos localmente en ninguna de las dos

#### Scenario: Un cambio de matiz en la escala llega solo
- **WHEN** el sistema de diseño cambia el matiz de un nivel de la escala ordinal
- **THEN** la card de distribución refleja el matiz nuevo con la sola actualización del paquete, sin que se modifique el código de la aplicación

#### Scenario: El resumen no cambia con la búsqueda o los filtros del listado
- **WHEN** el Chapter Lead busca o filtra el listado de Personas
- **THEN** el resumen de los 3 indicadores sigue reflejando el total de personas registradas, sin cambiar según la búsqueda o los filtros activos

### Requirement: Listar personas
El sistema SHALL mostrar un listado paginado de las personas **a cargo del Chapter Lead**, con al menos avatar, nombre, correo corporativo, cargo, rol, nivel, seniority y modalidad visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar esa persona. El avatar SHALL mostrar las iniciales de la persona (primera letra del primer nombre y primera letra del primer apellido, derivadas del nombre completo) sobre un color propio de esa persona, estable en el tiempo y entre pantallas. El correo corporativo SHALL mostrarse bajo el nombre, con menor jerarquía visual que éste. El **Nivel** y el **Seniority** SHALL ser columnas separadas: el Nivel con el nombre de su escalón en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin número; el Seniority con uno de sus tres valores —Junior, Intermedio, Senior—, sin mezclar los vocabularios de las dos escalas.

El nombre SHALL ser un enlace a la pantalla de detalle de esa persona. Ese enlace NO SHALL mostrarse en el color de marca: SHALL tomar el color de texto neutro del listado, de modo que la primera columna no quede teñida por repetir un enlace destacado en cada fila. En reposo el nombre NO SHALL distinguirse del texto plano de la fila; SHALL revelar su condición de enlace al pasar el puntero sobre él y al recibir el foco por teclado. El sistema NO SHALL definir localmente el tratamiento visual del enlace: lo toma del componente de enlace del sistema de diseño, eligiendo su tono neutro.

El **nivel** SHALL mostrarse con el componente de nivel del sistema de diseño —el que presenta el nombre del escalón junto a un medidor de cuatro segmentos teñido según su posición en la escala— y NO SHALL mostrarse con el componente de estado. La representación SHALL ocupar la misma dimensión en todas las filas, cualquiera sea el nivel y tenga o no la persona uno asignado, de modo que los niveles de personas distintas queden comparables de un vistazo. El **seniority** SHALL mostrarse como texto plano en su propia columna —Junior, Intermedio o Senior—, sin medidor y sin componente de estado. El sistema NO SHALL definir localmente los colores, medidas ni segmentos del medidor: los toma del componente del sistema de diseño.

El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por **nivel** (la escala de 4) y por **seniority** (Junior/Intermedio/Senior), cada uno de selección múltiple y combinables con la paginación; al cambiar la búsqueda o un filtro, el listado vuelve a la primera página.

La **utilización** de cada fila SHALL mostrarse como una cantidad: el medidor del sistema de diseño relleno con el tono azul de la escala de acento sobre la pista neutra, sin cambiar de color por umbral (ni al 85 % ni al 100 %); la cifra es la señal numérica. Es el mismo azul que el resto de la pantalla usa para la escala ordinal.

Los **stacks** SHALL mostrarse con el componente de etiqueta categórica del sistema de diseño (no con el de estado): el principal primero, hasta tres por fila y un indicador "+N" con el resto; una persona sin stacks SHALL mostrar un guion neutro.

Cada fila SHALL mostrar además el FTE disponible de la persona como número, y su utilización — el porcentaje de esa capacidad que sus asignaciones ocupan, calculado por el sistema y entregado en el contrato de la persona — como una barra pequeña acompañada del porcentaje en texto. El listado NO SHALL permitir editar el FTE ni la utilización: la edición del FTE sigue en el formulario de la persona y las asignaciones en su propia pantalla.

#### Scenario: El listado sólo contiene lo que el lead tiene a cargo
- **WHEN** el sistema registra personas de más de un chapter
- **THEN** el listado del Chapter Lead contiene únicamente las de su chapter, y las demás no llegan a la respuesta

#### Scenario: Utilización al tope sin señal de estado
- **WHEN** una persona tiene 100 % de utilización
- **THEN** su medidor se rellena completo en el azul de acento y la cifra muestra "100%", sin pasar a advertencia ni peligro

El nombre SHALL ser un enlace a la pantalla de detalle de esa persona. Ese enlace NO SHALL mostrarse en el color de marca: SHALL tomar el color de texto neutro del listado, de modo que la primera columna no quede teñida por repetir un enlace destacado en cada fila. En reposo el nombre NO SHALL distinguirse del texto plano de la fila; SHALL revelar su condición de enlace al pasar el puntero sobre él y al recibir el foco por teclado. El sistema NO SHALL definir localmente el tratamiento visual del enlace: lo toma del componente de enlace del sistema de diseño, eligiendo su tono neutro.

El **nivel** SHALL mostrarse con el componente de nivel del sistema de diseño —el que presenta el nombre del escalón junto a un medidor de cuatro segmentos teñido según su posición en la escala— y NO SHALL mostrarse con el componente de estado. La representación SHALL ocupar la misma dimensión en todas las filas, cualquiera sea el nivel y tenga o no la persona uno asignado, de modo que los niveles de personas distintas queden comparables de un vistazo. El **seniority** SHALL mostrarse como texto plano en su propia columna —Junior, Intermedio o Senior—, sin medidor y sin componente de estado. El sistema NO SHALL definir localmente los colores, medidas ni segmentos del medidor: los toma del componente del sistema de diseño.

El sistema SHALL permitir buscar personas por nombre o cargo (coincidencia parcial, sin distinguir mayúsculas) y filtrar por **nivel** (la escala de 4) y por **seniority** (Junior/Intermedio/Senior), cada uno de selección múltiple y combinables con la paginación; al cambiar la búsqueda o un filtro, el listado vuelve a la primera página.

#### Scenario: Stacks en la fila
- **WHEN** una persona tiene cinco stacks con ".NET" como principal
- **THEN** la fila muestra ".NET" primero, dos más y "+2", como etiquetas categóricas y no como estados

#### Scenario: Filtrar por stack
- **WHEN** el Chapter Lead elige "Azure" y "MuleSoft" en el filtro de stack
- **THEN** el listado muestra sólo las personas que tienen alguno de los dos, vuelve a la primera página y actualiza el total sobre el subconjunto filtrado

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una página de resultados con una fila por cada persona de esa página, su avatar con iniciales, nombre, correo corporativo, cargo, rol, nivel, seniority y modalidad, junto con el total de personas y la navegación entre páginas

#### Scenario: Presentación del seniority en la fila
- **WHEN** el sistema muestra la fila de una persona de nivel "Avanzado" y seniority "Senior"
- **THEN** la celda de nivel presenta "Avanzado" junto a su medidor de cuatro segmentos con tres llenos, y la celda de seniority dice "Senior" como texto plano — dos columnas, dos vocabularios, ninguna como etiqueta de estado

#### Scenario: Los niveles se comparan entre filas
- **WHEN** el listado muestra personas de niveles distintos en filas sucesivas
- **THEN** todas las celdas de nivel ocupan el mismo ancho y sus medidores quedan alineados, de modo que la diferencia de nivel se lee sin leer las etiquetas

#### Scenario: El seniority no comparte vocabulario con el estado
- **WHEN** una fila muestra a la vez el seniority y el nivel de la persona y algún dato suyo que sí es un estado
- **THEN** cada uno usa una forma distinta —texto plano el seniority, medidor el nivel, componente de estado el estado— sin que dos elementos de naturaleza distinta compartan la misma forma en la misma fila

#### Scenario: Una persona sin nivel asignado no desalinea la columna
- **WHEN** el listado muestra una persona cuyo nivel no pertenece a la escala o no está asignado
- **THEN** su celda de nivel muestra el estado vacío que define el componente, con la misma dimensión que las demás; la de seniority muestra un guion neutro cuando falta

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
- **WHEN** el Chapter Lead selecciona uno o más valores en el filtro de Seniority (Junior, Intermedio, Senior)
- **THEN** el sistema muestra solo las personas cuyo seniority está entre los valores seleccionados, junto con el total y la paginación recalculados sobre ese subconjunto

#### Scenario: Filtrar por nivel SFIA
- **WHEN** el Chapter Lead busca el filtro de la escala de 4 niveles (el que antes se llamó "Nivel SFIA" y luego "Seniority")
- **THEN** lo encuentra bajo el nombre **Nivel**, con los valores Principiante, Competente, Avanzado y Experto; "Seniority" es ahora un filtro distinto con Junior, Intermedio y Senior, y "Nivel SFIA" no existe como filtro

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
- **THEN** ninguna cambia de color por cruzar un umbral: todas se rellenan en el azul de acento en proporción a su porcentaje —la de 0% sin relleno y la de 120% saturada al ancho completo—, y quién está al tope o sobrecargado se lee en la cifra, no en el color

#### Scenario: Una persona recién creada arranca sin utilización
- **WHEN** el Chapter Lead crea una persona y el listado se actualiza
- **THEN** su fila muestra la utilización en 0%, porque todavía no tiene asignaciones

### Requirement: Crear persona
El sistema SHALL permitir crear una nueva persona capturando nombre, documento, usuario principal, cargo, rol, líder técnico, seniority, modalidad, FTE disponible, costo mensual y fecha de inicio, validando los mismos límites que aplica el backend antes de enviar la petición.

**Cargo y rol SHALL ser cosas distintas.** El **cargo** describe a qué se dedica la persona —Desarrollador Backend, QA, Frontend— y se captura como texto. El **rol** describe cómo participa en la aplicación, y SHALL elegirse de un catálogo cerrado, nunca escribirse a mano. Mientras el rol sea texto libre vuelve a llenarse con el cargo, y el sistema pierde la única forma que tiene de saber quién es líder técnico.

El nivel de habilidad que se le exige a una persona SHALL derivarse de su **cargo** y NO de su rol: lo que se exige depende de a qué se dedica, no de cómo participa en la aplicación. Es la condición para que el rol pueda ser un catálogo cerrado — ver las capabilities `skills-catalog`, `skill-assessment` y `career-plan`.

El **líder técnico** de una persona SHALL elegirse con un selector que ofrece únicamente a las personas registradas cuyo rol es Líder Técnico, y SHALL ser opcional: una persona puede no tener uno asignado. Una persona NO SHALL poder ser su propio líder técnico. Este dato SHALL ser informativo y NO SHALL decidir qué personas ve nadie: el alcance por responsabilidad lo decide una sola relación en todo el sistema, y no es ésta.

La **línea de expertise** a la que pertenece la persona SHALL mostrarse en el formulario como dato de sólo lectura, tomada de la línea que tiene asignada, con la forma de llegar al módulo de Líneas de expertise para cambiarla. El formulario NO SHALL ofrecer elegirla: se asigna donde se ve el reparto completo, y dos lugares que la editen con distinta información a la vista terminan discrepando.

El **costo mensual** SHALL capturarse y mostrarse en pesos colombianos, con separador de miles, de modo que quien lo escribe pueda contar los dígitos sin salir del campo. La cifra que viaja al backend SHALL ser el número, sin el formato.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 200 caracteres), documento (no vacío, máx. 50 caracteres), usuario principal (no vacío, máx. 250 caracteres), cargo (no vacío, máx. 100 caracteres), selecciona un rol del catálogo, opcionalmente un líder técnico, un seniority (1 a 4) y una modalidad válida, ingresa un FTE disponible entre 0.0 y 1.0 y un costo mensual mayor o igual a 0, selecciona una fecha de inicio, y confirma
- **THEN** el sistema crea la persona, la agrega al listado y confirma el éxito de la operación

#### Scenario: Opciones de rol
- **WHEN** el Chapter Lead abre el selector de rol en el formulario de alta o edición
- **THEN** el sistema muestra los roles del catálogo con su nombre en español, y no admite escribir uno que no esté en la lista

#### Scenario: Cargo y rol dicen cosas distintas
- **WHEN** se compara el cargo de una persona con su rol
- **THEN** el cargo describe a qué se dedica y el rol cómo participa en la aplicación; que coincidan es posible pero no es lo esperado, y el rol nunca se completa copiando el cargo

#### Scenario: El selector de líder técnico ofrece sólo a quienes lo son
- **WHEN** el Chapter Lead abre el selector de líder técnico
- **THEN** el sistema ofrece únicamente a las personas registradas cuyo rol es Líder Técnico, y no ofrece a la persona que se está editando

#### Scenario: Una persona sin líder técnico
- **WHEN** el Chapter Lead guarda una persona sin elegir líder técnico
- **THEN** el sistema la guarda igual, porque el campo es opcional, y lo dice explícitamente en vez de mostrar un nombre en blanco

#### Scenario: No hay ningún líder técnico registrado
- **WHEN** el Chapter Lead abre el selector y ninguna persona tiene el rol de Líder Técnico
- **THEN** el selector dice que no hay líderes técnicos registrados y cómo registrarlos, en vez de mostrarse vacío como si fuera un error

#### Scenario: Quitarle el rol a quien es líder técnico de alguien
- **WHEN** el Chapter Lead cambia el rol de una persona que figura como líder técnico de otras
- **THEN** el sistema advierte a cuántas personas afecta antes de guardar, y no descarta la referencia sin decirlo

#### Scenario: La línea de expertise se muestra pero no se elige
- **WHEN** el Chapter Lead abre el alta o la edición de una persona
- **THEN** el formulario muestra a qué línea de expertise pertenece y ofrece ir al módulo de Líneas para cambiarla, sin un selector que la edite acá

#### Scenario: Persona sin línea de expertise
- **WHEN** se edita una persona que no pertenece a ninguna línea
- **THEN** el formulario lo dice explícitamente y ofrece ir a asignarla, en vez de dejar el dato en blanco o mostrar una línea que no es suya

#### Scenario: El costo mensual se lee en pesos
- **WHEN** el Chapter Lead escribe el costo mensual de una persona
- **THEN** el campo muestra la cifra en pesos colombianos con separador de miles mientras la escribe, y lo que se envía al backend es el número sin formato

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar el alta sin nombre, documento, usuario principal, cargo, rol, seniority, modalidad o fecha de inicio
- **THEN** el sistema impide el envío y señala qué campos faltan, sin llamar al backend

#### Scenario: Validación de longitud
- **WHEN** el Chapter Lead ingresa un nombre de más de 200 caracteres, un documento de más de 50 caracteres, un usuario principal de más de 250 caracteres, un cargo de más de 100 caracteres o un rol de más de 100 caracteres
- **THEN** el sistema impide el envío y señala el campo que excede el límite, sin llamar al backend

#### Scenario: Validación de FTE y costo
- **WHEN** el Chapter Lead ingresa un FTE disponible fuera del rango 0.0 a 1.0, o un costo mensual negativo
- **THEN** el sistema impide el envío y señala el campo inválido, sin llamar al backend

#### Scenario: Error del servidor al crear
- **WHEN** el Chapter Lead confirma un alta válida en el cliente pero el backend responde con error (400 o 500)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

#### Scenario: Resumen de campos obligatorios sin completar
- **WHEN** el Chapter Lead intenta confirmar el alta o la edición sin completar todos los campos obligatorios
- **THEN** el sistema muestra, junto a los botones de confirmar/cancelar, la cantidad de campos obligatorios que todavía faltan por completar

### Requirement: Editar persona
El sistema SHALL permitir editar los mismos campos del alta en una persona existente, aplicando las mismas reglas de validación. Cambiar el rol de una persona a uno distinto de Líder Técnico NO SHALL borrar en silencio las referencias de quienes la tenían como líder técnico: el sistema SHALL advertirlo antes de guardar, para que el dato no desaparezca sin que nadie lo note.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica uno o más campos de una persona existente con valores válidos y confirma
- **THEN** el sistema actualiza la persona, refleja los nuevos valores en el listado y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de una persona existente
- **THEN** el sistema precarga el formulario con los valores actuales de esa persona

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario

### Requirement: Eliminar persona
El sistema SHALL permitir eliminar una persona existente solo tras una confirmación explícita del usuario.

#### Scenario: Eliminación confirmada
- **WHEN** el Chapter Lead solicita eliminar una persona y confirma la acción en el diálogo de confirmación
- **THEN** el sistema elimina la persona y la retira del listado

#### Scenario: Eliminación cancelada
- **WHEN** el Chapter Lead solicita eliminar una persona pero cancela el diálogo de confirmación
- **THEN** el sistema no elimina la persona y no realiza ninguna petición al backend

#### Scenario: Error del servidor al eliminar
- **WHEN** el Chapter Lead confirma la eliminación pero el backend responde con error (404 o 500)
- **THEN** el sistema muestra el motivo del error y mantiene la persona visible en el listado

### Requirement: Selección de seniority y modalidad desde catálogo
El sistema SHALL ofrecer **nivel**, **seniority**, modalidad y **rol** como selecciones restringidas a los valores vigentes de los catálogos expuestos por el backend (mockeados), no como texto libre. El catálogo de **niveles** SHALL contener la escala Tuya de 4 —Principiante, Competente, Avanzado, Experto—, mostrada por nombre y sin número; el catálogo de **seniorities** SHALL contener Junior, Intermedio y Senior. El formulario de alta y edición SHALL ofrecer los dos selectores, uno por escala, sin mezclar sus vocabularios.

El catálogo de roles SHALL contener los roles con los que se participa en la aplicación —Administrador, Líder Técnico, Líder de Expertise, Product Owner y Colaborador— y SHALL mostrarlos en español. **Colaborador** SHALL ser el de quien participa sin liderar, y SHALL existir porque el rol es obligatorio: sin él, la mayoría de las personas quedarían con un liderazgo que no tienen, y la pantalla lo mostraría como un hecho. En el código y en el contrato sus nombres SHALL escribirse en inglés: lo que se lee y lo que se programa son dos vocabularios, y confundirlos obliga a traducir en cada punto de contacto.

#### Scenario: Opciones de seniority
- **WHEN** el Chapter Lead abre el selector de seniority en el formulario de alta o edición
- **THEN** el sistema muestra únicamente Junior, Intermedio y Senior, obtenidos del catálogo

#### Scenario: Opciones de nivel SFIA
- **WHEN** el Chapter Lead busca la escala de 4 (la que antes se llamó "Nivel SFIA" y luego se fusionó en "Seniority")
- **THEN** la encuentra en el selector **Nivel** —Principiante, Competente, Avanzado, Experto, por nombre y sin número— como campo propio, separado del selector de Seniority

#### Scenario: Opciones de modalidad
- **WHEN** el Chapter Lead abre el selector de modalidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de modalidad vigentes obtenidos del catálogo

### Requirement: Selección de proveedor para personas externas
El sistema SHALL permitir marcar una persona como externa, y SHALL mostrar en ese caso un selector de proveedor restringido a un catálogo de solo lectura expuesto por el backend (mockeado). El sistema SHALL NOT enviar un proveedor para una persona marcada como interna.

#### Scenario: Marcar como externa
- **WHEN** el Chapter Lead marca una persona como externa en el formulario de alta o edición
- **THEN** el sistema muestra el selector de proveedor con las opciones vigentes del catálogo

#### Scenario: Persona interna
- **WHEN** el Chapter Lead deja una persona como interna (no marcada como externa)
- **THEN** el sistema no muestra el selector de proveedor y no lo incluye en la petición al confirmar

### Requirement: Detalle de persona
El sistema SHALL exponer una página de detalle por persona en `/app/lead/personas/:id`, accesible desde el nombre de la persona en el listado, con la entrada "Personas" activa en la navegación lateral y el breadcrumb `Plataforma / Gestionar Personas / <nombre de la persona>`. La página SHALL ser el **perfil profesional** de la persona y SHALL NOT mostrar nada de su asignación: ni célula, ni dedicación, ni mix BAU / Transformación, ni FTE declarado o libre, ni células que pidan su capacidad — la asignación se gestiona en la Torre de control y en Células.

El **encabezado** SHALL ser mínimo: el avatar (mismas iniciales y color que el listado), el nombre, y debajo una sola línea con el cargo y el **stack principal** como chip. SHALL NOT llevar enlace de vuelta (el breadcrumb navega), ni seniority, ni vinculación, ni modalidad, ni correo, ni estado DevOps, ni marca "Sin célula". Las **acciones** SHALL ser exactamente dos: **Editar** (la primaria; mismo formulario y validaciones que el listado) y **Competencias** (sutil; navega al plan de la persona en el módulo Competencias). SHALL NOT haber acción de reasignar, evaluar ni menú con eliminar (eliminar sigue disponible en el listado).

El cuerpo SHALL ser dos columnas: la **columna protagonista** (dos tercios) con los paneles Perfil y Stacks, y la **barra lateral** (un tercio) con dos punteros compactos seguidos de Perfil evaluado y Plan de desarrollo.

El panel **Perfil** ("lo administrativo") SHALL mostrar, una fila por dato: **Nivel** — el nombre del nivel en la escala de cuatro (Principiante, Competente, Avanzado, Experto), sin número SFIA —, **Seniority** — Junior, Intermedio o Senior —, **Modalidad**, **Vinculación** ("Interna", o "Externa · <proveedor>"), **Correo** (en monoespaciada), **Identidad DevOps** ("Vinculada" con punto de éxito, o "Sin vincular" en rol de peligro), **Líder de expertise** —el nombre de la persona que la tiene a cargo, no la unidad—, **Línea de expertise** —a qué línea pertenece, a secas—, **Ingreso**, y **Costo mensual** (la cifra formateada, sin lectura de concordancia). Su acción **Editar** SHALL abrir el mismo formulario de edición. Cada dato SHALL aparecer una sola vez en la página.

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

#### Scenario: Seniority en la ficha
- **WHEN** se abre el detalle de una persona de nivel Experto y seniority Senior
- **THEN** la ficha muestra las dos filas por separado — Nivel "Experto" y Seniority "Senior" — sin usar los nombres de una escala en la otra

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

### Requirement: Acceso autenticado a la pantalla de Personas
El sistema SHALL exigir sesión autenticada para acceder a la pantalla de Personas, y SHALL exigir además el rol de Chapter Lead. Un usuario sin sesión SHALL ser llevado a iniciar sesión; uno con sesión pero sin el rol SHALL recibir un aviso de permisos insuficientes.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a la pantalla de Personas
- **THEN** el sistema lo lleva a la pantalla de inicio de sesión en vez de mostrar la pantalla

#### Scenario: Acceder con el rol de Chapter Lead
- **WHEN** un usuario con sesión y con rol de Chapter Lead navega a la pantalla de Personas
- **THEN** la pantalla se muestra normalmente

#### Scenario: Acceder con sesión pero sin el rol
- **WHEN** un usuario con sesión pero sin rol de Chapter Lead navega a la pantalla de Personas
- **THEN** el sistema le indica que no tiene permisos, sin mandarlo a iniciar sesión

### Requirement: Línea de expertise de una persona
Cada persona SHALL pertenecer a lo sumo a una línea de expertise, o a ninguna. El panel **Ficha** del detalle de persona SHALL mostrar la línea real a la que pertenece y el nombre de su lead, tomados del maestro de líneas y no de un valor fijo. Cuando la persona no pertenece a ninguna línea, la Ficha SHALL decirlo explícitamente en vez de mostrar una línea que no es suya, y SHALL enlazar a la pantalla de Líneas de expertise para asignarla. Cuando la línea de la persona no tiene lead designado, la Ficha SHALL mostrar la línea e indicar que está sin lead.

La línea de una persona SHALL cambiarse desde la pantalla de Líneas de expertise, que es donde se ve el reparto completo; el formulario de alta y edición de persona SHALL NOT capturarla, para que no existan dos lugares que la editen con distinta información a la vista.

#### Scenario: Persona con línea y lead
- **WHEN** se abre el detalle de una persona que pertenece a una línea con lead designado
- **THEN** la Ficha muestra el nombre de esa línea y el nombre de su lead

#### Scenario: Persona sin línea
- **WHEN** se abre el detalle de una persona que no pertenece a ninguna línea
- **THEN** la Ficha indica que no tiene línea de expertise asignada y ofrece ir a la pantalla de Líneas para asignarla, sin mostrar un nombre de línea ni de lead

#### Scenario: Línea sin lead
- **WHEN** se abre el detalle de una persona cuya línea todavía no tiene lead
- **THEN** la Ficha muestra el nombre de la línea e indica que está sin lead, en vez de dejar el dato en blanco

#### Scenario: La persona es el lead de su línea
- **WHEN** se abre el detalle de la persona que lidera su propia línea
- **THEN** la Ficha muestra la línea y señala que ella misma es su lead, sin repetir su nombre como si fuera otra persona

#### Scenario: La ficha sigue al maestro
- **WHEN** una persona se mueve a otra línea, o su línea cambia de nombre o de lead
- **THEN** la Ficha de esa persona muestra el valor nuevo la próxima vez que se abre, sin que haya que tocar la persona

#### Scenario: El formulario de persona no captura la línea
- **WHEN** el Chapter Lead abre el alta o la edición de una persona
- **THEN** el formulario no ofrece elegir la línea de expertise, y guardar la persona no cambia la línea a la que pertenece

### Requirement: Vincular identidad DevOps por correo
El sistema SHALL permitir vincular a una persona con su usuario de Azure DevOps desde su detalle, en un drawer lateral con el mismo esqueleto que los demás paneles del detalle: el nombre de la persona como antetítulo, el título *Vincular con Azure DevOps*, la nota de que una identidad sólo puede vincularse a una persona, y el cierre. El drawer SHALL abrirse desde la acción *Vincular con Azure DevOps* del indicador *Backlog en DevOps*, que SHALL estar disponible siempre que la persona no tenga identidad vinculada, sin depender de que exista ninguna coincidencia previa.

El drawer SHALL tener un único campo, **Correo corporativo**, obligatorio, prellenado con el correo corporativo de la persona y editable, y la acción **Buscar**, que también SHALL dispararse con `Enter` en el campo. Buscar SHALL consultar Azure DevOps por ese correo y, mientras responde, SHALL deshabilitar la acción e indicar que está buscando. Con un correo que no tiene forma de correo, el sistema SHALL marcar el campo y no consultar.

Con una coincidencia, el drawer SHALL mostrar el usuario encontrado: su avatar (o sus iniciales si no hay imagen), nombre para mostrar, correo e identificador, la marca "Coincide" en rol de éxito, y sus proyectos, equipos y tableros como listas de etiquetas. Sin coincidencia, SHALL mostrar un aviso en rol de advertencia que nombre el correo buscado y no ofrezca vincular. Si la consulta falla, SHALL mostrar el error en rol de peligro y permitir reintentar. Cambiar el correo después de una búsqueda SHALL descartar el resultado anterior: la acción **Vincular** SHALL estar habilitada únicamente mientras hay un usuario encontrado para el correo que se ve en el campo.

**Vincular** SHALL ser la única acción primaria del drawer, junto a **Cancelar**. Al confirmar, el sistema SHALL guardar la relación entre la persona y el identificador del usuario de Azure DevOps encontrado; con éxito, SHALL cerrar el drawer, confirmar con un toast "Identidad vinculada" y refrescar el detalle sin recargar la aplicación: el encabezado pasa a "DevOps vinculado", el indicador *Backlog en DevOps* muestra sus items y la fila *Identidad DevOps* de la ficha muestra el usuario y la fecha de vinculación. Si el servidor rechaza la vinculación —en particular porque ese usuario ya está vinculado a otra persona—, el drawer SHALL mostrar el mensaje del servidor y permanecer abierto. Cancelar o cerrar SHALL descartar lo buscado sin vincular nada.

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
