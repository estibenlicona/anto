## Purpose

La capacidad `expertise-lines` es el maestro de las líneas de expertise (chapters) de la plataforma: quién lidera cada línea, a qué personas agrupa transversalmente a las células, cuánta capacidad tiene y cuándo deja de estar vigente.

## ADDED Requirements

### Requirement: Pantalla de Líneas de expertise
El sistema SHALL exponer una pantalla de Administración en `/app/admin/lineas`, con la entrada "Líneas" activa en la navegación lateral y el nombre completo de la pantalla en el breadcrumb. La pantalla SHALL presentar a la izquierda el índice de líneas y a la derecha el detalle de la línea abierta, con la primera línea del índice abierta al cargar. El sistema SHALL NOT repetir en el contenido de la página el título ni la categoría de la pantalla, dado que la navegación lateral y el breadcrumb ya las identifican.

El **índice** SHALL listar las líneas activas y, separadas de ellas, las archivadas, mostrando por línea su nombre, su código corto, cuántas personas agrupa y la marca de incompleta cuando corresponda. El índice SHALL permitir buscar por nombre o código.

Mientras carga, la pantalla SHALL mostrar un estado de carga sin desplazar la estructura. Si la carga falla, SHALL mostrar un estado de error con la acción de reintentar.

#### Scenario: Abrir la pantalla de Líneas
- **WHEN** el Admin navega a `/app/admin/lineas`
- **THEN** ve el índice con las líneas activas y las archivadas por separado, con la primera línea activa abierta en el detalle, sin un título de página repetido

#### Scenario: Abrir otra línea
- **WHEN** el Admin selecciona otra línea del índice
- **THEN** el detalle de la derecha pasa a mostrar esa línea y el índice marca cuál está abierta

#### Scenario: Buscar en el índice
- **WHEN** el Admin escribe un texto en el buscador del índice
- **THEN** el índice muestra sólo las líneas cuyo nombre o código contiene ese texto, y avisa cuando ninguna coincide

#### Scenario: Todavía no hay líneas
- **WHEN** el Admin abre la pantalla y no existe ninguna línea registrada
- **THEN** el sistema muestra un estado vacío que explica qué es una línea de expertise y ofrece crear la primera

### Requirement: Crear una línea de expertise
El sistema SHALL permitir crear una línea capturando nombre, código corto, descripción y su lead. El nombre SHALL ser obligatorio y único entre las líneas no archivadas, de máximo 100 caracteres. El código corto SHALL ser obligatorio, único entre todas las líneas —incluidas las archivadas, para que una etiqueta no cambie de significado—, de máximo 10 caracteres, y SHALL normalizarse a mayúsculas. La descripción SHALL ser opcional, de máximo 200 caracteres. El lead SHALL ser opcional al crear, y elegirse entre las personas registradas. Una línea nace activa.

#### Scenario: Alta válida
- **WHEN** el Admin ingresa un nombre no vacío y no repetido, un código no vacío y no repetido, y confirma
- **THEN** el sistema crea la línea activa, la agrega al índice, la abre en el detalle y confirma el éxito de la operación

#### Scenario: Nombre o código repetido
- **WHEN** el Admin ingresa un nombre que ya tiene otra línea no archivada, o un código que ya tiene cualquier otra línea
- **THEN** el sistema impide el envío y señala qué campo está repetido y con qué línea choca, sin llamar al backend

#### Scenario: Validación de campos requeridos y longitud
- **WHEN** el Admin intenta confirmar sin nombre o sin código, o excede los 100 caracteres del nombre, los 10 del código o los 200 de la descripción
- **THEN** el sistema impide el envío y señala el campo que falta o que excede su límite, sin llamar al backend

#### Scenario: Error del servidor al crear
- **WHEN** el Admin confirma un alta válida en el cliente pero el backend responde con error
- **THEN** el sistema muestra el motivo del error y conserva los datos ingresados en el formulario

### Requirement: Editar una línea de expertise
El sistema SHALL permitir editar el nombre, el código, la descripción y el lead de una línea existente, con las mismas validaciones del alta. Cambiar el nombre o el código SHALL reflejarse de inmediato donde la línea se muestre, sin recargar la aplicación.

#### Scenario: Edición válida
- **WHEN** el Admin modifica uno o más campos de una línea con valores válidos y confirma
- **THEN** el sistema actualiza la línea, el índice y el detalle muestran los nuevos valores, y confirma el éxito de la operación

#### Scenario: Formulario precargado
- **WHEN** el Admin abre la edición de una línea existente
- **THEN** el formulario llega con los valores actuales de esa línea

#### Scenario: Error del servidor al editar
- **WHEN** el Admin confirma una edición válida en el cliente pero el backend responde con error
- **THEN** el sistema muestra el motivo del error y no descarta los cambios pendientes en el formulario

### Requirement: Lead de la línea
Cada línea SHALL señalar a lo sumo una persona registrada como su lead, que es quien responde por ella. El lead SHALL pertenecer a la línea que lidera: al designarlo, el sistema SHALL incorporarlo a la línea si todavía no estaba en ella, moviéndolo desde la que tuviera. Una persona SHALL NOT liderar más de una línea a la vez. Una línea activa sin lead SHALL mostrarse marcada como incompleta en el índice y en el detalle, con la acción de designarlo.

#### Scenario: Designar un lead
- **WHEN** el Admin elige una persona como lead de una línea
- **THEN** el sistema la registra como lead, la incorpora a esa línea si estaba en otra o sin línea, y la marca de incompleta desaparece

#### Scenario: Elegir a alguien que ya lidera otra línea
- **WHEN** el Admin abre el selector de lead
- **THEN** las personas que ya lideran otra línea aparecen señaladas con la línea que lideran y no se pueden elegir, para que una designación no le quite el lead a otra línea sin querer

#### Scenario: Quitar el lead
- **WHEN** el Admin quita el lead de una línea activa
- **THEN** la persona sigue perteneciendo a la línea, la línea queda sin lead y vuelve a mostrarse como incompleta

#### Scenario: Línea archivada sin lead
- **WHEN** una línea archivada no tiene lead
- **THEN** el sistema NO la marca como incompleta, porque una línea archivada ya no tiene de qué responder

### Requirement: Personas de una línea
El detalle de la línea SHALL listar las personas que agrupa, con su nombre, cargo, seniority, FTE disponible y la célula a la que está asignada o "Sin célula", y SHALL señalar cuál de ellas es el lead. Una persona SHALL pertenecer a lo sumo a una línea, y puede no pertenecer a ninguna. Asignar a la línea SHALL permitir elegir una o varias personas a la vez, distinguiendo en el selector las que hoy no tienen línea de las que están en otra —para estas últimas el sistema SHALL avisar de qué línea saldrán antes de confirmar. Cambiar a alguien de línea SHALL NOT modificar su asignación a células ni su dedicación: la línea y la célula son ejes distintos.

#### Scenario: Ver las personas de la línea
- **WHEN** el Admin abre una línea con personas
- **THEN** ve el listado de sus personas con cargo, seniority, FTE disponible y célula o "Sin célula", con el lead señalado

#### Scenario: Asignar personas sin línea
- **WHEN** el Admin elige una o varias personas sin línea y confirma
- **THEN** las personas pasan a pertenecer a esa línea, aparecen en su listado y el resumen de capacidad se recalcula

#### Scenario: Traer a alguien de otra línea
- **WHEN** el Admin elige a una persona que hoy pertenece a otra línea
- **THEN** el sistema avisa de qué línea saldrá antes de confirmar, y al confirmar la persona queda sólo en la línea destino y desaparece del listado de la de origen

#### Scenario: Mover no toca la célula
- **WHEN** una persona asignada a una célula cambia de línea
- **THEN** su célula, su dedicación y su desglose BAU / Transformación quedan exactamente como estaban

#### Scenario: Quitar a alguien de la línea
- **WHEN** el Admin quita a una persona de la línea y confirma
- **THEN** la persona queda sin línea, deja de contar en el resumen de capacidad de esa línea y pasa a estar disponible para asignarse a otra

#### Scenario: Quitar al lead de su propia línea
- **WHEN** el Admin intenta quitar de la línea a la persona que la lidera
- **THEN** el sistema no lo permite y explica que primero hay que designar otro lead o quitarle el rol de lead

#### Scenario: Línea sin personas
- **WHEN** el Admin abre una línea a la que no pertenece nadie
- **THEN** el listado muestra un estado vacío con la acción de asignar la primera persona

### Requirement: Personas sin línea
El sistema SHALL mostrar en la pantalla de Líneas cuántas personas registradas no pertenecen a ninguna línea, y SHALL permitir verlas y repartirlas desde ahí, dado que una persona sin línea no tiene quién responda por su desarrollo. Cuando no quede ninguna, el sistema SHALL indicarlo en vez de mostrar una lista vacía.

#### Scenario: Ver quién está sin línea
- **WHEN** existen personas registradas que no pertenecen a ninguna línea
- **THEN** la pantalla indica cuántas son y permite abrir su lista con nombre, cargo, seniority y FTE disponible

#### Scenario: Repartir a alguien sin línea
- **WHEN** el Admin elige a una persona de esa lista y le asigna una línea
- **THEN** la persona pasa a esa línea, sale de la lista de sin línea y el contador baja

#### Scenario: Nadie quedó sin línea
- **WHEN** todas las personas registradas pertenecen a alguna línea
- **THEN** la pantalla lo indica explícitamente en vez de mostrar una lista vacía

### Requirement: Resumen de capacidad de una línea
El detalle de la línea SHALL mostrar su capacidad calculada sobre las personas que agrupa: cuántas personas son, el FTE disponible total de la línea, cuánto de ese FTE está asignado a células y cuánto queda libre, con el porcentaje sin asignar. El FTE disponible de la línea SHALL ser la suma del FTE disponible de sus personas, y el FTE asignado la suma de sus porcentajes de dedicación dividida entre cien — el mismo criterio con el que la Torre de control y el listado de Células calculan el FTE asignado, para que una línea y la Torre no digan números distintos sobre las mismas personas. El índice SHALL mostrar por línea las personas y el FTE disponible, de modo que dos líneas se puedan comparar sin abrirlas.

#### Scenario: Ver la capacidad de una línea
- **WHEN** el Admin abre una línea con personas, algunas asignadas a células
- **THEN** ve el número de personas, el FTE disponible total, el FTE asignado, el libre y el porcentaje sin asignar

#### Scenario: Comparar líneas desde el índice
- **WHEN** el Admin recorre el índice
- **THEN** cada línea muestra sus personas y su FTE disponible, sin necesidad de abrirla

#### Scenario: Línea sin personas
- **WHEN** el Admin abre una línea a la que no pertenece nadie
- **THEN** el resumen muestra cero personas y cero FTE, sin errores de división ni porcentajes vacíos

#### Scenario: El FTE asignado puede superar al disponible
- **WHEN** la línea agrupa personas con FTE disponible menor a 1.0 asignadas al 100 % de dedicación
- **THEN** el FTE asignado que muestra la línea es el mismo que la Torre de control calcula sobre esas personas, aunque supere al FTE disponible, y el FTE libre se muestra en cero en vez de en negativo

#### Scenario: La capacidad sigue a las personas
- **WHEN** una persona entra a la línea, sale de ella, o cambia su dedicación a una célula
- **THEN** el resumen de la línea se recalcula sin recargar la aplicación

### Requirement: Archivar y reactivar una línea
El sistema SHALL permitir archivar una línea en vez de eliminarla, para no perder de qué línea vino una persona. Archivar SHALL requerir que la línea no tenga personas y SHALL pedir confirmación explícita. Una línea archivada SHALL NOT ofrecerse al asignar personas ni al designar leads, y SHALL seguir visible en el índice, separada de las activas. El sistema SHALL permitir reactivar una línea archivada, que vuelve a estar disponible con su nombre y su código.

#### Scenario: Archivar una línea vacía
- **WHEN** el Admin archiva una línea sin personas y confirma en el diálogo
- **THEN** la línea pasa a archivada, sale del grupo de activas del índice y deja de ofrecerse al asignar personas

#### Scenario: Intentar archivar una línea con gente
- **WHEN** el Admin intenta archivar una línea que todavía agrupa personas
- **THEN** el sistema no lo permite, dice cuántas personas hay que mover primero y ofrece ir a su listado

#### Scenario: Cancelar el archivado
- **WHEN** el Admin solicita archivar una línea pero cancela el diálogo de confirmación
- **THEN** la línea queda activa y nada cambia

#### Scenario: Reactivar una línea
- **WHEN** el Admin reactiva una línea archivada
- **THEN** la línea vuelve al grupo de activas con su nombre y su código, sin personas y sin lead, y vuelve a ofrecerse al asignar

#### Scenario: Error del servidor al archivar
- **WHEN** el Admin confirma archivar pero el backend responde con error
- **THEN** el sistema muestra el motivo del error y la línea queda como estaba

### Requirement: Acceso sin autenticación a la pantalla de Líneas
El sistema SHALL permitir acceder a `/app/admin/lineas` sin requerir sesión autenticada, con el mismo criterio que el resto de las rutas de Admin, dado que la plataforma aún no tiene cuentas de usuario ni autenticación real.

#### Scenario: Acceder sin sesión iniciada
- **WHEN** un usuario sin sesión iniciada navega a `/app/admin/lineas`
- **THEN** la pantalla se muestra normalmente, sin redirigir a una pantalla de login
