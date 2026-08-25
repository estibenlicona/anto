## Purpose

La capacidad `squads` permite al Chapter Lead consultar, crear, editar y eliminar las células (squads) registradas en el sistema, como base para asignar iniciativas y capacidades sobre ellas.

## ADDED Requirements

### Requirement: Listar células
El sistema SHALL mostrar el listado de todas las células registradas, con al menos nombre, tribu y criticidad visibles por fila.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Células y existen células registradas
- **THEN** el sistema muestra una fila por cada célula con su nombre, tribu, criticidad y descripción (si tiene)

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Células y no existe ninguna célula registrada
- **THEN** el sistema muestra un estado vacío que invita a crear la primera célula, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las células falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

### Requirement: Crear célula
El sistema SHALL permitir crear una nueva célula capturando nombre, tribu, criticidad y descripción opcional, validando los mismos límites que aplica el backend antes de enviar la petición.

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

### Requirement: Editar célula
El sistema SHALL permitir editar nombre, tribu, criticidad y descripción de una célula existente, aplicando las mismas reglas de validación que en el alta.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica uno o más campos de una célula existente con valores válidos y confirma
- **THEN** el sistema actualiza la célula, refleja los nuevos valores en el listado y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de una célula existente
- **THEN** el sistema precarga el formulario con los valores actuales de esa célula

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario

### Requirement: Eliminar célula
El sistema SHALL permitir eliminar una célula existente solo tras una confirmación explícita del usuario.

#### Scenario: Eliminación confirmada
- **WHEN** el Chapter Lead solicita eliminar una célula y confirma la acción en el diálogo de confirmación
- **THEN** el sistema elimina la célula y la retira del listado

#### Scenario: Eliminación cancelada
- **WHEN** el Chapter Lead solicita eliminar una célula pero cancela el diálogo de confirmación
- **THEN** el sistema no elimina la célula y no realiza ninguna petición al backend

#### Scenario: Error del servidor al eliminar
- **WHEN** el Chapter Lead confirma la eliminación pero el backend responde con error (404 o 500)
- **THEN** el sistema muestra el motivo del error y mantiene la célula visible en el listado

### Requirement: Selección de criticidad desde catálogo
El sistema SHALL ofrecer la criticidad como una selección restringida a los valores vigentes del catálogo expuesto por el backend (mockeado), no como texto libre.

#### Scenario: Opciones de criticidad
- **WHEN** el Chapter Lead abre el selector de criticidad en el formulario de alta o edición
- **THEN** el sistema muestra únicamente los valores de criticidad vigentes obtenidos del catálogo

### Requirement: Acceso sin autenticación a la pantalla de Células
El sistema SHALL permitir acceder a la pantalla de Células sin requerir sesión autenticada, dado que la plataforma aún no tiene cuentas de usuario ni autenticación real.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a la pantalla de Células
- **THEN** la pantalla se muestra normalmente, sin redirigir a una pantalla de login
