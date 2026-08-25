## MODIFIED Requirements

### Requirement: Asignar una persona a la célula
El sistema SHALL permitir asignar una persona ya registrada a la célula elegida, capturando % de dedicación y su desglose en % BAU y % Transformación, validando los mismos límites que aplica el backend antes de enviar la petición. El formulario SHALL presentarse en un panel lateral con el mismo patrón que el de Personas y el de Células: encabezado con título y un subtítulo que nombra la célula, secciones con rótulo e ícono ("Persona" y "Dedicación"), los tres porcentajes en grilla con la unidad "%" como adorno, persona y % de dedicación marcados como obligatorios, una ayuda que recuerda que BAU + Transformación debe igualar la dedicación, y un pie con el contador de obligatorios sin completar y las acciones de cancelar y confirmar.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead elige una persona ya registrada, ingresa un % de dedicación entre 1 y 100, y un desglose de % BAU y % Transformación (cada uno entre 0 y 100) cuya suma sea igual al % de dedicación, y confirma
- **THEN** el sistema crea la asignación, la agrega al listado de la célula y confirma el éxito de la operación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar sin elegir una persona o sin ingresar un % de dedicación
- **THEN** el sistema impide el envío y señala qué falta, sin llamar al backend

#### Scenario: Validación del desglose BAU/Transformación
- **WHEN** la suma de % BAU y % Transformación no es igual al % de dedicación ingresado, o alguno de los tres valores está fuera de su rango válido (dedicación 1-100, BAU y Transformación 0-100 cada uno)
- **THEN** el sistema impide el envío y señala el desglose como inválido, sin llamar al backend

#### Scenario: Error del servidor al asignar
- **WHEN** el Chapter Lead confirma una asignación válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

#### Scenario: Resumen de campos obligatorios sin completar
- **WHEN** el Chapter Lead intenta confirmar la asignación sin completar todos los campos obligatorios
- **THEN** el sistema muestra, junto a los botones de confirmar/cancelar, la cantidad de campos obligatorios que todavía faltan por completar

#### Scenario: Presentación del formulario
- **WHEN** el Chapter Lead abre "Asignar persona" desde el detalle de una célula
- **THEN** el formulario se abre como panel lateral con el nombre de la célula en el subtítulo, la sección "Persona" con el selector y la sección "Dedicación" con los tres porcentajes

### Requirement: Editar una asignación existente
El sistema SHALL permitir editar el % de dedicación y su desglose BAU/Transformación de una asignación existente, aplicando las mismas reglas de validación que en el alta. El sistema SHALL NOT permitir cambiar la persona o la célula de una asignación existente.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica el % de dedicación o su desglose de una asignación existente con valores válidos y confirma
- **THEN** el sistema actualiza la asignación, refleja los nuevos valores en el listado y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de una asignación existente
- **THEN** el sistema precarga el formulario con los valores actuales de esa asignación, mostrando la célula en el subtítulo y la persona como dato fijo en la sección "Persona", no editable

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario
