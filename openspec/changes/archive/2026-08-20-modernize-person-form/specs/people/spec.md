## MODIFIED Requirements

### Requirement: Crear persona
El sistema SHALL permitir crear una nueva persona capturando nombre, documento, usuario principal, cargo, rol, seniority, modalidad, FTE disponible, costo mensual y fecha de inicio, validando los mismos límites que aplica el backend antes de enviar la petición.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 200 caracteres), documento (no vacío, máx. 50 caracteres), usuario principal (no vacío, máx. 250 caracteres), cargo (no vacío, máx. 100 caracteres), rol (no vacío, máx. 100 caracteres), selecciona un seniority (1 a 4) y una modalidad válida, ingresa un FTE disponible entre 0.0 y 1.0 y un costo mensual mayor o igual a 0, selecciona una fecha de inicio, y confirma
- **THEN** el sistema crea la persona, la agrega al listado y confirma el éxito de la operación

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

### Requirement: Selección de seniority y modalidad desde catálogo
El sistema SHALL ofrecer seniority y modalidad como selecciones restringidas a los valores vigentes de los catálogos expuestos por el backend (mockeados), no como texto libre. El seniority SHALL mostrarse con el nombre de su nivel en la escala Tuya (Principiante, Competente, Avanzado, Experto), sin mostrar el número del nivel.

#### Scenario: Opciones de seniority
- **WHEN** el Chapter Lead abre el selector de seniority en el formulario de alta o edición
- **THEN** el sistema muestra los cuatro niveles con el nombre de su nivel en la escala Tuya, sin el número

#### Scenario: Opciones de nivel SFIA
- **WHEN** el Chapter Lead busca el selector de "Nivel SFIA" que existía como campo separado antes de este cambio
- **THEN** encuentra los mismos cuatro niveles dentro del selector de "Seniority" — ambos campos se fusionaron en uno solo y "Nivel SFIA" ya no existe como selector propio

#### Scenario: Opciones de modalidad
- **WHEN** el Chapter Lead abre el selector de modalidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de modalidad vigentes obtenidos del catálogo
