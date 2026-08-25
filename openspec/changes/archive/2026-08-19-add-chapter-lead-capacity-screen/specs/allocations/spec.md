## Purpose

La capacidad `allocations` permite al Chapter Lead asignar personas ya registradas a una célula, con su porcentaje de dedicación, como base para conocer la capacidad de cada célula.

## ADDED Requirements

### Requirement: Elegir una célula para administrar su equipo
El sistema SHALL permitir al Chapter Lead elegir, entre las células ya registradas, una célula para ver y administrar sus asignaciones.

#### Scenario: Elegir una célula
- **WHEN** el Chapter Lead abre la pantalla de Capacidades y selecciona una célula
- **THEN** el sistema muestra las asignaciones vigentes de esa célula

#### Scenario: Sin células registradas
- **WHEN** el Chapter Lead abre la pantalla de Capacidades y no existe ninguna célula registrada
- **THEN** el sistema muestra un estado vacío que invita a crear una célula primero, sin mostrar un selector vacío

### Requirement: Listar las asignaciones de una célula
El sistema SHALL mostrar, para la célula elegida, el listado de sus asignaciones vigentes, con al menos el nombre de la persona, su % de dedicación y su desglose BAU/Transformación.

#### Scenario: Listado con datos
- **WHEN** la célula elegida tiene asignaciones vigentes
- **THEN** el sistema muestra una fila por cada asignación con el nombre de la persona, % de dedicación y desglose BAU/Transformación

#### Scenario: Listado vacío
- **WHEN** la célula elegida no tiene ninguna asignación vigente
- **THEN** el sistema muestra un estado vacío que invita a asignar la primera persona, sin mostrar una tabla vacía ni un error

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener las asignaciones de la célula falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

### Requirement: Asignar una persona a la célula
El sistema SHALL permitir asignar una persona ya registrada a la célula elegida, capturando % de dedicación y su desglose en % BAU y % Transformación, validando los mismos límites que aplica el backend antes de enviar la petición.

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

### Requirement: Editar una asignación existente
El sistema SHALL permitir editar el % de dedicación y su desglose BAU/Transformación de una asignación existente, aplicando las mismas reglas de validación que en el alta. El sistema SHALL NOT permitir cambiar la persona o la célula de una asignación existente.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica el % de dedicación o su desglose de una asignación existente con valores válidos y confirma
- **THEN** el sistema actualiza la asignación, refleja los nuevos valores en el listado y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de una asignación existente
- **THEN** el sistema precarga el formulario con los valores actuales de esa asignación, mostrando la persona y la célula como datos fijos, no editables

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario

### Requirement: Quitar una asignación
El sistema SHALL permitir quitar una asignación existente solo tras una confirmación explícita del usuario.

#### Scenario: Eliminación confirmada
- **WHEN** el Chapter Lead solicita quitar una asignación y confirma la acción en el diálogo de confirmación
- **THEN** el sistema quita la asignación y la retira del listado de la célula

#### Scenario: Eliminación cancelada
- **WHEN** el Chapter Lead solicita quitar una asignación pero cancela el diálogo de confirmación
- **THEN** el sistema no quita la asignación y no realiza ninguna petición al backend

#### Scenario: Error del servidor al quitar
- **WHEN** el Chapter Lead confirma quitar la asignación pero el backend responde con error (404 o 500)
- **THEN** el sistema muestra el motivo del error y mantiene la asignación visible en el listado

### Requirement: Acceso sin autenticación a la pantalla de Capacidades
El sistema SHALL permitir acceder a la pantalla de Capacidades sin requerir sesión autenticada, dado que la plataforma aún no tiene cuentas de usuario ni autenticación real.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega directamente a la pantalla de Capacidades
- **THEN** la pantalla se muestra normalmente, sin redirigir a una pantalla de login
