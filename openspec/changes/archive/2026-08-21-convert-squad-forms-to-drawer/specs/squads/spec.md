## MODIFIED Requirements

### Requirement: Crear célula
El sistema SHALL permitir crear una nueva célula capturando nombre, tribu, criticidad y descripción opcional, validando los mismos límites que aplica el backend antes de enviar la petición. El formulario SHALL presentarse en un panel lateral (no en un diálogo centrado), con el mismo patrón que el formulario de Personas: encabezado con título y subtítulo según el modo, campos agrupados en secciones con rótulo e ícono, campos obligatorios marcados, textos de ayuda donde el campo lo necesita, y un pie con el contador de obligatorios sin completar y las acciones de cancelar y confirmar.

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
- **THEN** el formulario se abre como panel lateral con las secciones "Identificación" (nombre, tribu) y "Clasificación" (criticidad, descripción), nombre y tribu marcados como obligatorios, y el pie con cancelar y confirmar
