## MODIFIED Requirements

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

### Requirement: Selección de seniority y modalidad desde catálogo
El sistema SHALL ofrecer seniority, modalidad y **rol** como selecciones restringidas a los valores vigentes de los catálogos expuestos por el backend (mockeados), no como texto libre. El seniority SHALL mostrarse con el nombre de su nivel en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin mostrar el número del nivel.

El catálogo de roles SHALL contener los roles con los que se participa en la aplicación —Administrador, Líder Técnico, Líder de Expertise, Product Owner y Colaborador— y SHALL mostrarlos en español. **Colaborador** SHALL ser el de quien participa sin liderar, y SHALL existir porque el rol es obligatorio: sin él, la mayoría de las personas quedarían con un liderazgo que no tienen, y la pantalla lo mostraría como un hecho. En el código y en el contrato sus nombres SHALL escribirse en inglés: lo que se lee y lo que se programa son dos vocabularios, y confundirlos obliga a traducir en cada punto de contacto.

#### Scenario: Opciones de seniority
- **WHEN** el Chapter Lead abre el selector de seniority en el formulario de alta o edición
- **THEN** el sistema muestra los cuatro niveles con el nombre de su nivel en la escala Tuya, sin el número

#### Scenario: Opciones de nivel SFIA
- **WHEN** el Chapter Lead busca el selector de "Nivel SFIA" que existía como campo separado antes de este cambio
- **THEN** encuentra los mismos cuatro niveles dentro del selector de "Seniority" — ambos campos se fusionaron en uno solo y "Nivel SFIA" ya no existe como selector propio

#### Scenario: Opciones de modalidad
- **WHEN** el Chapter Lead abre el selector de modalidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de modalidad vigentes obtenidos del catálogo

