## Purpose

La capacidad `teams` es el catálogo de equipos: la agrupación organizacional a la que pertenecen las células (un equipo agrupa cero o más células). Define su alta, edición, eliminación y el resumen de cuántos equipos existen y cuántas células tiene cada uno.

## ADDED Requirements

### Requirement: Resumen del módulo de Equipos
El sistema SHALL mostrar, arriba del listado de Equipos, un resumen de indicadores calculados sobre el total de equipos registrados (no sobre la página, la búsqueda o el filtro actual del listado): el total de equipos, y cuántas células están agrupadas en total a través de todos ellos.

#### Scenario: Resumen con datos
- **WHEN** el Chapter Lead ve el resumen de Equipos
- **THEN** el sistema muestra el total de equipos registrados y el total de células agrupadas en ellos, sobre el conjunto completo

#### Scenario: Resumen sin equipos
- **WHEN** todavía no existe ningún equipo
- **THEN** el resumen muestra cero en ambos indicadores, sin errores de cálculo

### Requirement: Listar equipos
El sistema SHALL mostrar un listado paginado de los equipos registrados, con al menos nombre, descripción y cuántas células tiene cada uno visibles por fila, y SHALL exponer por fila un menú de acciones que permite editar o eliminar ese equipo.

El nombre SHALL ser el texto principal de la primera columna; la descripción (si tiene) SHALL mostrarse debajo, con menor jerarquía visual y truncada a una sola línea, con el texto completo accesible al pasar el puntero — mismo tratamiento que la descripción de una célula en el listado de Células.

El sistema SHALL permitir buscar equipos por nombre (coincidencia parcial, sin distinguir mayúsculas), combinable con la paginación; al cambiar la búsqueda, el listado vuelve a la primera página.

#### Scenario: Listado con datos
- **WHEN** el Chapter Lead abre la pantalla de Equipos y existen equipos registrados
- **THEN** el sistema muestra una página de resultados con una fila por cada equipo de esa página, con su nombre, descripción y cuántas células tiene, junto con el total de equipos y la navegación entre páginas

#### Scenario: Cuántas células tiene un equipo
- **WHEN** un equipo agrupa tres células
- **THEN** su fila muestra "3 células"; un equipo sin ninguna muestra "Sin células" con menor jerarquía visual

#### Scenario: Descripción larga
- **WHEN** un equipo tiene una descripción que no cabe en una línea de su columna
- **THEN** la fila muestra la descripción truncada a una línea sin alterar la altura de las demás filas, y el texto completo queda disponible al pasar el puntero

#### Scenario: Listado vacío
- **WHEN** el Chapter Lead abre la pantalla de Equipos y no existe ningún equipo registrado
- **THEN** el sistema muestra un estado vacío que invita a crear el primer equipo, sin mostrar una tabla vacía ni un error

#### Scenario: Buscar equipos
- **WHEN** el Chapter Lead escribe un texto en el buscador del listado
- **THEN** el sistema muestra sólo los equipos cuyo nombre contiene ese texto (sin distinguir mayúsculas), vuelve a la primera página y actualiza el total y la paginación sobre el subconjunto filtrado

#### Scenario: Sin resultados para la búsqueda
- **WHEN** la búsqueda activa no coincide con ningún equipo
- **THEN** el sistema muestra un estado vacío de "sin resultados" que invita a ajustar la búsqueda, distinto del estado vacío de "todavía no hay equipos", y mantiene visible el buscador

#### Scenario: Los controles siguen ahí mientras recarga
- **WHEN** el Chapter Lead cambia la búsqueda y el listado vuelve a pedir datos
- **THEN** el buscador sigue en pantalla y conserva su valor; lo único que muestra que está cargando es la zona de resultados

#### Scenario: Error al cargar el listado
- **WHEN** la petición para obtener los equipos falla (error de red o del servidor)
- **THEN** el sistema muestra un mensaje de error y una forma de reintentar la carga, sin dejar la pantalla en blanco o en carga indefinida

#### Scenario: Cambiar de página
- **WHEN** el Chapter Lead navega a una página distinta del listado de equipos
- **THEN** el sistema muestra los equipos correspondientes a esa página, conservando la búsqueda activa, sin recargar toda la aplicación

### Requirement: Crear equipo
El sistema SHALL permitir crear un nuevo equipo capturando nombre (obligatorio, no vacío, máx. 100 caracteres) y descripción opcional (máx. 500 caracteres), validando esos límites antes de enviar la petición. El formulario SHALL presentarse en un panel lateral, con el mismo patrón que el formulario de Células: encabezado con título y subtítulo según el modo, campos agrupados en sección con rótulo e ícono, campos obligatorios marcados, y un pie con el contador de obligatorios sin completar y las acciones de cancelar y confirmar. La descripción SHALL capturarse en un campo de varias líneas.

#### Scenario: Alta válida
- **WHEN** el Chapter Lead completa nombre (no vacío, máx. 100 caracteres) y descripción opcional (máx. 500 caracteres), y confirma
- **THEN** el sistema crea el equipo, lo agrega al listado y confirma el éxito de la operación

#### Scenario: Validación de campos requeridos
- **WHEN** el Chapter Lead intenta confirmar el alta sin nombre
- **THEN** el sistema impide el envío y señala el campo que falta, sin llamar al backend

#### Scenario: Validación de longitud
- **WHEN** el Chapter Lead ingresa un nombre de más de 100 caracteres o una descripción de más de 500 caracteres
- **THEN** el sistema impide el envío y señala el campo que excede el límite, sin llamar al backend

#### Scenario: Nombre duplicado
- **WHEN** el Chapter Lead intenta crear un equipo con el mismo nombre que uno ya existente (sin distinguir mayúsculas)
- **THEN** el sistema impide el envío y explica que ya existe un equipo con ese nombre

#### Scenario: Error del servidor al crear
- **WHEN** el Chapter Lead confirma un alta válida en el cliente pero el backend responde con error (400 o 500)
- **THEN** el sistema muestra el motivo del error devuelto por el backend y conserva los datos ingresados en el formulario para que el usuario pueda corregir o reintentar

### Requirement: Editar equipo
El sistema SHALL permitir editar nombre y descripción de un equipo existente, aplicando las mismas reglas de validación que en el alta.

#### Scenario: Edición válida
- **WHEN** el Chapter Lead modifica uno o más campos de un equipo existente con valores válidos y confirma
- **THEN** el sistema actualiza el equipo, refleja los nuevos valores en el listado (y en cualquier célula que lo muestre) y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Chapter Lead abre la edición de un equipo existente
- **THEN** el sistema precarga el formulario con los valores actuales de ese equipo

#### Scenario: Error del servidor al editar
- **WHEN** el Chapter Lead confirma una edición válida en el cliente pero el backend responde con error (400 o 404)
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes del usuario en el formulario

### Requirement: Eliminar equipo
El sistema SHALL permitir eliminar un equipo existente sólo tras una confirmación explícita del usuario, y SHALL impedir eliminar un equipo que todavía tiene células asociadas: en ese caso SHALL explicar cuántas células lo usan y que hay que reasignarlas a otro equipo (o eliminarlas) antes de poder eliminarlo — mismo tratamiento que el catálogo de habilidades da a un valor en uso.

#### Scenario: Eliminación confirmada, sin células
- **WHEN** el Chapter Lead solicita eliminar un equipo sin células asociadas y confirma la acción en el diálogo de confirmación
- **THEN** el sistema elimina el equipo y lo retira del listado

#### Scenario: Eliminación bloqueada por células asociadas
- **WHEN** el Chapter Lead solicita eliminar un equipo que tiene una o más células asociadas
- **THEN** el sistema impide la eliminación y explica cuántas células lo usan y que deben reasignarse o eliminarse primero, sin abrir el diálogo de confirmación como si fuera a proceder

#### Scenario: Eliminación cancelada
- **WHEN** el Chapter Lead solicita eliminar un equipo pero cancela el diálogo de confirmación
- **THEN** el sistema no elimina el equipo y no realiza ninguna petición al backend

#### Scenario: Error del servidor al eliminar
- **WHEN** el Chapter Lead confirma la eliminación de un equipo sin células pero el backend responde con error (404 o 500)
- **THEN** el sistema muestra el motivo del error y mantiene el equipo visible en el listado

### Requirement: Acceso a la pantalla de Equipos por permiso de sección
El sistema SHALL exigir el permiso de sección `Equipos` para acceder a la pantalla de Equipos, con el mismo tratamiento que el resto de las secciones del módulo: sin ese permiso, la ruta muestra el aviso de acceso no disponible en vez de la pantalla.

#### Scenario: Acceder sin el permiso
- **WHEN** una persona sin el permiso de sección `Equipos` navega a la pantalla de Equipos
- **THEN** el sistema muestra el aviso de permisos insuficientes, distinguible de la ausencia de sesión

#### Scenario: Acceder con el permiso
- **WHEN** una persona con el permiso de sección `Equipos` navega a la pantalla de Equipos
- **THEN** la pantalla se muestra normalmente
