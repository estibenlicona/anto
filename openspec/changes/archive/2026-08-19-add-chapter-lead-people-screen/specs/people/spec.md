## Purpose

La capacidad `people` permite al Chapter Lead consultar, crear, editar y eliminar las personas registradas en el sistema, como el maestro del que se deriva la capacidad disponible del chapter.

## ADDED Requirements

### Requirement: Listar personas
El sistema SHALL mostrar el listado de todas las personas registradas, con al menos nombre, cargo, rol, seniority, nivel SFIA y modalidad visibles por fila.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Personas y existen personas registradas
- **THEN** el sistema muestra una fila por cada persona con su nombre, cargo, rol, seniority, nivel SFIA y modalidad

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Personas y no existe ninguna persona registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera persona, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las personas falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

### Requirement: Crear persona
El sistema SHALL permitir crear una nueva persona capturando nombre, documento, usuario principal, cargo, rol, seniority, nivel SFIA, modalidad, FTE disponible, costo mensual y fecha de inicio, validando los mismos límites que aplica el backend antes de enviar la petición.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 200 caracteres), documento (no vacío, máx. 50 caracteres), usuario principal (no vacío, máx. 250 caracteres), cargo (no vacío, máx. 100 caracteres), rol (no vacío, máx. 100 caracteres), selecciona una seniority válida, un nivel SFIA (1 a 4) y una modalidad válida, ingresa un FTE disponible entre 0.0 y 1.0 y un costo mensual mayor o igual a 0, selecciona una fecha de inicio, y confirma
- **THEN** el sistema crea la persona, la agrega al listado y confirma el éxito de la operación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar el alta sin nombre, documento, usuario principal, cargo, rol, seniority, nivel SFIA, modalidad o fecha de inicio
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

### Requirement: Editar persona
El sistema SHALL permitir editar los mismos campos del alta en una persona existente, aplicando las mismas reglas de validación.

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

### Requirement: Selección de seniority, nivel SFIA y modalidad desde catálogo
El sistema SHALL ofrecer seniority, nivel SFIA y modalidad como selecciones restringidas a los valores vigentes de los catálogos expuestos por el backend (mockeados), no como texto libre. El nivel SFIA SHALL mostrarse con su etiqueta de la escala Tuya (1 Principiante, 2 Competente, 3 Avanzado, 4 Experto), no como un número aislado.

#### Scenario: Opciones de seniority
- **WHEN** el Chapter Lead abre el selector de seniority en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de seniority vigentes obtenidos del catálogo

#### Scenario: Opciones de nivel SFIA
- **WHEN** el Chapter Lead abre el selector de nivel SFIA en el formulario de alta o edición
- **THEN** el sistema muestra los cuatro niveles con su etiqueta de la escala Tuya

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

### Requirement: Acceso sin autenticación a la pantalla de Personas
El sistema SHALL permitir acceder a la pantalla de Personas sin requerir sesión autenticada, dado que la plataforma aún no tiene cuentas de usuario ni autenticación real.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a la pantalla de Personas
- **THEN** la pantalla se muestra normalmente, sin redirigir a una pantalla de login
